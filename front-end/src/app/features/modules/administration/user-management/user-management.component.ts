import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { Person } from '../../../tables/person-table/person-table.component';
import { UserTableComponent } from './user-table/user-table.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserTableComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
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
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    // Check if we're in create mode
    const routePath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isCreateMode = routePath.includes('create');
    
    this.loadTutors();
    this.initializeForm();
  }

  private loadTutors(): void {
    // Load tutors from the staff data
    // For now, we'll generate fake tutors
    this.tutors = this.generateFakeTutors();
  }

  private generateFakeTutors(): Person[] {
    const names = ['Dr. Robert Smith', 'Prof. Mary Johnson', 'Dr. James Wilson', 'Prof. Patricia Brown', 
                   'Dr. Michael Davis', 'Prof. Jennifer Martinez', 'Dr. William Anderson', 'Prof. Linda Taylor',
                   'Dr. Richard Thomas', 'Prof. Barbara Jackson', 'Dr. Joseph White', 'Prof. Susan Harris',
                   'Dr. Charles Martin', 'Prof. Jessica Thompson', 'Dr. Thomas Garcia', 'Prof. Sarah Martinez',
                   'Dr. Christopher Robinson', 'Prof. Nancy Clark', 'Dr. Daniel Rodriguez', 'Prof. Lisa Lewis'];
    
    const courses = ['Advanced Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 
                     'English Literature', 'History', 'Economics'];
    const relationships = ['Self', 'Spouse', 'Guardian'];
    const occupations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
    const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh'];
    const categories = ['OBC', 'Other', 'Minority'];
    const qualifications = ['PhD', 'Masters', 'Post Graduate', 'Graduate'];
    const sexes = ['Male', 'Female'];
    const maritalStatuses = ['Married', 'Single'];

    return Array.from({ length: 20 }, (_, i) => {
      const name = names[i % names.length];
      const course = courses[i % courses.length];
      const regNo = `TUT${String(i + 1).padStart(4, '0')}`;
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      const dob = new Date(1970 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      
      return {
        id: i + 1,
        regNo,
        date,
        nameOfApplicant: name,
        nameOfCourse: course,
        nameOfGuardian: i % 3 === 0 ? name : `${name.split(' ')[0]}'s Spouse`,
        relationshipWithGuardian: relationships[i % relationships.length],
        occupationOfGuardian: occupations[i % occupations.length],
        permanentAddress: `${Math.floor(Math.random() * 1000) + 1} Faculty Street, City ${i + 1}`,
        mobileNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        homeContact: `8${Math.floor(Math.random() * 900000000) + 100000000}`,
        dateOfBirth: dob,
        sex: sexes[i % sexes.length],
        maritalStatus: maritalStatuses[i % maritalStatuses.length],
        religion: religions[i % religions.length],
        religionCategory: categories[i % categories.length],
        educationalQualification: qualifications[i % qualifications.length],
        email: `${name.toLowerCase().replace(/[.\s]/g, '.')}@university.edu`,
        applicationNumber: `APP${String(i + 1).padStart(5, '0')}`,
        classTime: `${String(8 + (i % 6)).padStart(2, '0')}:00`,
        totalCourseFee: 0,
        feeDetails: 'N/A',
        admittedBy: `HR Manager ${String((i % 3) + 1)}`,
        remarks: i % 4 === 0 ? 'Senior faculty member' : ''
      };
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
        // Generate user ID based on tutor's reg number
        const userId = `USR${tutor.regNo.replace('TUT', '')}`;
        this.userForm.patchValue({ userId });
        
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
      this.userForm.patchValue({ userId: '', username: '' });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.toasterService.success('User created successfully!', 'Success');
        // Navigate back to user management table
        this.router.navigate(['/dashboard/administration/user-management']);
      }, 1000);
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
