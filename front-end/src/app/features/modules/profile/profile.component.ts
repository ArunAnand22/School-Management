import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToasterService } from '../../../core/services/toaster.service';
import { PersonService } from '../../../core/services/person.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isEditing = false;
  profileImagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private personService: PersonService
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
    // TODO: Load from logged-in user's ID (get from auth service)
    // For now, try to load from PersonService - get first tutor or student
    // In production, this should use the logged-in user's person ID
    const loggedInUserId = localStorage.getItem('userId') || localStorage.getItem('personId');
    
    if (loggedInUserId) {
      // Try to load person by ID
      this.personService.getById(+loggedInUserId).subscribe({
        next: (person) => {
          this.profileForm.patchValue(person);
        },
        error: (error) => {
          // If not found, try to get first tutor
          this.loadDefaultProfile();
        }
      });
    } else {
      // Load default profile (first tutor or empty form)
      this.loadDefaultProfile();
    }
  }

  private loadDefaultProfile(): void {
    // Try to get first tutor as default
    this.personService.getTutors().subscribe({
      next: (tutors) => {
        if (tutors && tutors.length > 0) {
          this.profileForm.patchValue(tutors[0]);
        }
      },
      error: (error) => {
        // Error is handled by interceptor
      }
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
      const formValue = this.profileForm.getRawValue();
      const personId = formValue.id;
      
      if (personId) {
        // Update existing person
        this.personService.update(personId, formValue).subscribe({
          next: () => {
            this.toasterService.success('Profile updated successfully!', 'Success');
            this.isEditing = false;
          },
          error: (error) => {
            // Error is handled by interceptor
          }
        });
      } else {
        // Create new person (shouldn't happen in profile, but handle it)
        this.toasterService.error('Person ID not found. Cannot update profile.', 'Error');
      }
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

