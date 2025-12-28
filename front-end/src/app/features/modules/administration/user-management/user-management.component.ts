import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { UserService } from '../../../../core/services/user.service';
import { PersonService, Person } from '../../../../core/services/person.service';
import { UserTableComponent } from './user-table/user-table.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  userForm!: FormGroup;
  tutors: Person[] = [];
  isSubmitting = false;
  isCreateMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private userService: UserService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    // Check if we're in create mode
    const routePath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isCreateMode = routePath.includes('create');
    
    this.loadTutors();
    this.initializeForm();
    
    // Auto-generate user ID if in create mode
    if (this.isCreateMode) {
      this.generateUserId();
    }
  }

  private loadTutors(): void {
    this.personService.getTutors().subscribe({
      next: (data) => {
        this.tutors = data;
      },
      error: (error) => {
        // Error is handled by interceptor
      }
    });
  }

  private generateUserId(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        // Find the highest user ID number
        let maxNumber = 0;
        users.forEach(user => {
          if (user.userId && user.userId.startsWith('USR')) {
            const numberPart = user.userId.replace('USR', '');
            const number = parseInt(numberPart, 10);
            if (!isNaN(number) && number > maxNumber) {
              maxNumber = number;
            }
          }
        });
        
        // Generate next user ID
        const nextNumber = maxNumber + 1;
        const newUserId = `USR${String(nextNumber).padStart(4, '0')}`;
        this.userForm.patchValue({ userId: newUserId });
      },
      error: (error) => {
        // If error, start with USR0001
        this.userForm.patchValue({ userId: 'USR0001' });
      }
    });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      tutor: ['', [Validators.required]],
      userId: [{ value: '', disabled: true }],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      canLogin: [true as boolean]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onTutorChange(): void {
    const selectedTutorId = this.userForm.get('tutor')?.value;
    if (selectedTutorId) {
      const tutor = this.tutors.find(t => t.id === selectedTutorId);
      if (tutor) {
        // Auto-fill username if empty
        if (!this.userForm.get('username')?.value) {
          const username = tutor.nameOfApplicant.toLowerCase()
            .replace(/[.\s]/g, '.')
            .replace(/dr\.|prof\./g, '')
            .trim();
          this.userForm.patchValue({ username });
        }
      }
    } else {
      // Clear username if tutor is deselected, but keep the auto-generated user ID
      this.userForm.patchValue({ username: '' });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.userForm.getRawValue();
      const userData = {
        username: formValue.username,
        password: formValue.password,
        userId: formValue.userId,
        tutorId: formValue.tutor ? parseInt(formValue.tutor, 10) : null,
        canLogin: formValue.canLogin,
        role: 'user'
      };

      this.userService.create(userData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.toasterService.success('User created successfully!', 'Success');
          this.router.navigate(['/dashboard/administration/user-management']);
        },
        error: (error) => {
          this.isSubmitting = false;
          // Error is handled by interceptor
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toasterService.error('Please fill all required fields correctly', 'Validation Error');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/administration/user-management']);
  }

  // Getters for form controls
  get tutor() { return this.userForm.get('tutor'); }
  get userId() { return this.userForm.get('userId'); }
  get username() { return this.userForm.get('username'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
  get canLogin() { return this.userForm.get('canLogin'); }
}
