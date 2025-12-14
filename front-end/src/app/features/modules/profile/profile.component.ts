import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  profileImagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfileData();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      // Personal Information
      regNo: ['', [Validators.required]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      profileImage: [null],
      nameOfApplicant: ['', [Validators.required, Validators.minLength(3)]],
      nameOfCourse: ['', [Validators.required]],
      nameOfGuardian: ['', [Validators.required]],
      relationshipWithGuardian: ['', [Validators.required]],
      occupationOfGuardian: ['', [Validators.required]],
      permanentAddress: ['', [Validators.required]],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      homeContact: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      dateOfBirth: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      maritalStatus: ['', [Validators.required]],
      religion: ['', [Validators.required]],
      religionCategory: ['', [Validators.required]],
      educationalQualification: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],

      // Admission Details
      applicationNumber: ['', [Validators.required]],
      classTime: ['', [Validators.required]],
      totalCourseFee: ['', [Validators.required, Validators.min(0)]],
      feeDetails: ['', [Validators.required]],
      admittedBy: ['', [Validators.required]],
      remarks: ['']
    });
  }

  private loadProfileData(): void {
    // Load fake user data
    const userData = {
      regNo: 'EMP001',
      date: new Date().toISOString().split('T')[0],
      nameOfApplicant: 'John Doe',
      nameOfCourse: 'Administration',
      nameOfGuardian: 'Jane Doe',
      relationshipWithGuardian: 'Spouse',
      occupationOfGuardian: 'Teacher',
      permanentAddress: '123 Main Street, City, State, 12345',
      mobileNumber: '1234567890',
      homeContact: '0987654321',
      dateOfBirth: '1985-05-15',
      sex: 'Male',
      maritalStatus: 'Married',
      religion: 'Christian',
      religionCategory: 'Other',
      educationalQualification: 'Masters in Education',
      email: 'john.doe@school.com',
      applicationNumber: 'APP001',
      classTime: '09:00',
      totalCourseFee: '0',
      feeDetails: 'N/A - Staff Member',
      admittedBy: 'HR Manager',
      remarks: 'Experienced administrator with a passion for education and student success.',
      profileImage: null
    };
    this.profileForm.patchValue(userData);
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

      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result;
        this.profileForm.patchValue({ profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfileImage(): void {
    this.profileImagePreview = null;
    this.profileForm.patchValue({ profileImage: null });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfileData(); // Reset form if canceling
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile Updated:', this.profileForm.value);
      this.toasterService.success('Profile updated successfully!', 'Success');
      this.isEditing = false;
    } else {
      this.markFormGroupTouched(this.profileForm);
      this.toasterService.error('Please fill all required fields correctly.', 'Validation Error');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for form controls
  get regNo() { return this.profileForm.get('regNo'); }
  get date() { return this.profileForm.get('date'); }
  get nameOfApplicant() { return this.profileForm.get('nameOfApplicant'); }
  get nameOfCourse() { return this.profileForm.get('nameOfCourse'); }
  get nameOfGuardian() { return this.profileForm.get('nameOfGuardian'); }
  get relationshipWithGuardian() { return this.profileForm.get('relationshipWithGuardian'); }
  get occupationOfGuardian() { return this.profileForm.get('occupationOfGuardian'); }
  get permanentAddress() { return this.profileForm.get('permanentAddress'); }
  get mobileNumber() { return this.profileForm.get('mobileNumber'); }
  get homeContact() { return this.profileForm.get('homeContact'); }
  get dateOfBirth() { return this.profileForm.get('dateOfBirth'); }
  get sex() { return this.profileForm.get('sex'); }
  get maritalStatus() { return this.profileForm.get('maritalStatus'); }
  get religion() { return this.profileForm.get('religion'); }
  get religionCategory() { return this.profileForm.get('religionCategory'); }
  get educationalQualification() { return this.profileForm.get('educationalQualification'); }
  get email() { return this.profileForm.get('email'); }
  get applicationNumber() { return this.profileForm.get('applicationNumber'); }
  get classTime() { return this.profileForm.get('classTime'); }
  get totalCourseFee() { return this.profileForm.get('totalCourseFee'); }
  get feeDetails() { return this.profileForm.get('feeDetails'); }
  get admittedBy() { return this.profileForm.get('admittedBy'); }
  get remarks() { return this.profileForm.get('remarks'); }
}

