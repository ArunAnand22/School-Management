import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { PersonService } from '../../../core/services/person.service';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.component.html',
  styleUrls: ['./add-person.component.scss']
})
export class AddPersonComponent implements OnInit {
  personForm!: FormGroup;
  isStudent = true;
  isSubmitting = false;
  profileImagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    // Check if it's student or staff from route
    const fullPath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isStudent = fullPath.includes('student');
    this.initializeForm();
  }

  isFieldRequired(fieldName: string): boolean {
    // Always required fields
    if (fieldName === 'nameOfApplicant' || fieldName === 'email') {
      return true;
    }
    // For staff, most fields are optional
    return this.isStudent;
  }

  private initializeForm(): void {
    // For staff, most fields are optional; for students, most are required
    const isRequired = this.isStudent;
    
    // Custom validator for pattern that only validates if value exists
    const patternIfValue = (pattern: RegExp) => {
      return (control: any) => {
        if (!control.value || control.value === '') {
          return null; // No validation error if empty
        }
        return Validators.pattern(pattern)(control);
      };
    };

    // Custom validator for min that only validates if value exists
    const minIfValue = (min: number) => {
      return (control: any) => {
        if (!control.value || control.value === '' || control.value === null) {
          return null; // No validation error if empty
        }
        const numValue = Number(control.value);
        if (isNaN(numValue) || numValue < min) {
          return { min: { min, actual: numValue } };
        }
        return null;
      };
    };
    
    this.personForm = this.fb.group({
      // Section 1: Personal Information
      regNo: ['', isRequired ? [Validators.required] : []],
      date: [isRequired ? new Date().toISOString().split('T')[0] : '', isRequired ? [Validators.required] : []],
      profileImage: [null],
      nameOfApplicant: ['', [Validators.required, Validators.minLength(3)]], // Always required
      nameOfCourse: ['', isRequired ? [Validators.required] : []],
      nameOfGuardian: ['', isRequired ? [Validators.required] : []],
      relationshipWithGuardian: ['', isRequired ? [Validators.required] : []],
      occupationOfGuardian: ['', isRequired ? [Validators.required] : []],
      permanentAddress: ['', isRequired ? [Validators.required] : []],
      mobileNumber: ['', isRequired ? [Validators.required, Validators.pattern(/^[0-9]{10}$/)] : [patternIfValue(/^[0-9]{10}$/)]],
      homeContact: ['', [patternIfValue(/^[0-9]{10}$/)]],
      dateOfBirth: ['', isRequired ? [Validators.required] : []],
      sex: ['', isRequired ? [Validators.required] : []],
      maritalStatus: ['', isRequired ? [Validators.required] : []],
      religion: ['', isRequired ? [Validators.required] : []],
      religionCategory: ['', isRequired ? [Validators.required] : []],
      educationalQualification: ['', isRequired ? [Validators.required] : []],
      email: ['', [Validators.required, Validators.email]], // Always required

      // Section 2: Admission Details
      applicationNumber: ['', isRequired ? [Validators.required] : []],
      classTime: ['', isRequired ? [Validators.required] : []],
      totalCourseFee: [null, isRequired ? [Validators.required, Validators.min(0)] : [minIfValue(0)]],
      feeDetails: ['', isRequired ? [Validators.required] : []],
      admittedBy: ['', isRequired ? [Validators.required] : []],
      remarks: ['']
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        this.toasterService.error('Please select a valid image file (JPG, PNG, or GIF)', 'Invalid File');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toasterService.error('Image size should be less than 5MB', 'File Too Large');
        return;
      }

      this.selectedFile = file;
      this.personForm.patchValue({ profileImage: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage(): void {
    this.profileImagePreview = null;
    this.selectedFile = null;
    this.personForm.patchValue({ profileImage: null });
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      this.isSubmitting = true;
      const formValue = this.personForm.getRawValue();
      
      // Ensure regNo starts with correct prefix
      if (!formValue.regNo) {
        const prefix = this.isStudent ? 'STU' : 'TUT';
        const timestamp = Date.now();
        formValue.regNo = `${prefix}${String(timestamp).slice(-6)}`;
      } else if (!formValue.regNo.startsWith(this.isStudent ? 'STU' : 'TUT')) {
        const prefix = this.isStudent ? 'STU' : 'TUT';
        formValue.regNo = `${prefix}${formValue.regNo}`;
      }
      
      this.personService.create(formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          const personType = this.isStudent ? 'Student' : 'Tutor';
          this.toasterService.success(
            `${personType} added successfully!`,
            'Success'
          );
          
          // Navigate back to appropriate list
          const route = this.isStudent 
            ? ['/dashboard/student/student']
            : ['/dashboard/staff/staff'];
          this.router.navigate(route);
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
    Object.keys(this.personForm.controls).forEach(key => {
      const control = this.personForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  // Getters for form controls
  get regNo() { return this.personForm.get('regNo'); }
  get date() { return this.personForm.get('date'); }
  get nameOfApplicant() { return this.personForm.get('nameOfApplicant'); }
  get nameOfCourse() { return this.personForm.get('nameOfCourse'); }
  get nameOfGuardian() { return this.personForm.get('nameOfGuardian'); }
  get relationshipWithGuardian() { return this.personForm.get('relationshipWithGuardian'); }
  get occupationOfGuardian() { return this.personForm.get('occupationOfGuardian'); }
  get permanentAddress() { return this.personForm.get('permanentAddress'); }
  get mobileNumber() { return this.personForm.get('mobileNumber'); }
  get homeContact() { return this.personForm.get('homeContact'); }
  get dateOfBirth() { return this.personForm.get('dateOfBirth'); }
  get sex() { return this.personForm.get('sex'); }
  get maritalStatus() { return this.personForm.get('maritalStatus'); }
  get religion() { return this.personForm.get('religion'); }
  get religionCategory() { return this.personForm.get('religionCategory'); }
  get educationalQualification() { return this.personForm.get('educationalQualification'); }
  get email() { return this.personForm.get('email'); }
  get applicationNumber() { return this.personForm.get('applicationNumber'); }
  get classTime() { return this.personForm.get('classTime'); }
  get totalCourseFee() { return this.personForm.get('totalCourseFee'); }
  get feeDetails() { return this.personForm.get('feeDetails'); }
  get admittedBy() { return this.personForm.get('admittedBy'); }
  get remarks() { return this.personForm.get('remarks'); }
}

