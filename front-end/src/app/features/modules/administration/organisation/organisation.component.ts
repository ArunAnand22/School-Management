import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { OrganisationService, Organisation } from '../../../../core/services/organisation.service';
import { OrganisationTableComponent } from './organisation-table/organisation-table.component';

@Component({
  selector: 'app-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.scss']
})
export class OrganisationComponent implements OnInit {
  organisationForm!: FormGroup;
  isSubmitting = false;
  isCreateMode = false;
  isEditMode = false;
  organisationId: number | null = null;
  
  // Image previews
  logoPreview: string | ArrayBuffer | null = null;
  headerPreview: string | ArrayBuffer | null = null;
  footerPreview: string | ArrayBuffer | null = null;
  sealPreview: string | ArrayBuffer | null = null;
  
  // Geolocation
  latitude: number | null = null;
  longitude: number | null = null;
  locationError: string | null = null;
  isGettingLocation = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private organisationService: OrganisationService
  ) {}

  ngOnInit(): void {
    // Check if we're in create or edit mode using the route URL
    const url = this.router.url;
    this.isCreateMode = url.includes('/create');
    this.isEditMode = url.includes('/edit');
    
    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      this.organisationId = id ? parseInt(id, 10) : null;
    }
    
    this.initializeForm();
    if (this.isCreateMode || this.isEditMode) {
      this.loadExistingData();
    }
  }

  private initializeForm(): void {
    this.organisationForm = this.fb.group({
      organisationName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
      location: ['', [Validators.required]],
      remarks: [''],
      latitude: [null],
      longitude: [null],
      logo: [null],
      header: [null],
      footer: [null],
      seal: [null]
    });
  }

  private loadExistingData(): void {
    if (this.isEditMode && this.organisationId) {
      this.organisationService.getById(this.organisationId).subscribe({
        next: (org) => {
          this.organisationForm.patchValue(org);
          if (org.logo) this.logoPreview = org.logo;
          if (org.header) this.headerPreview = org.header;
          if (org.footer) this.footerPreview = org.footer;
          if (org.seal) this.sealPreview = org.seal;
          if (org.latitude) this.latitude = org.latitude;
          if (org.longitude) this.longitude = org.longitude;
        },
        error: (error) => {
          // Error is handled by interceptor
        }
      });
    }
  }

  onFileSelected(event: Event, type: 'logo' | 'header' | 'footer' | 'seal'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        this.toasterService.error('Please select a valid image file (JPG, PNG, GIF, or WEBP)', 'Invalid File');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toasterService.error('File size must be less than 5MB', 'File Too Large');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        switch (type) {
          case 'logo':
            this.logoPreview = result;
            this.organisationForm.patchValue({ logo: result });
            break;
          case 'header':
            this.headerPreview = result;
            this.organisationForm.patchValue({ header: result });
            break;
          case 'footer':
            this.footerPreview = result;
            this.organisationForm.patchValue({ footer: result });
            break;
          case 'seal':
            this.sealPreview = result;
            this.organisationForm.patchValue({ seal: result });
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(type: 'logo' | 'header' | 'footer' | 'seal'): void {
    switch (type) {
      case 'logo':
        this.logoPreview = null;
        this.organisationForm.patchValue({ logo: null });
        break;
      case 'header':
        this.headerPreview = null;
        this.organisationForm.patchValue({ header: null });
        break;
      case 'footer':
        this.footerPreview = null;
        this.organisationForm.patchValue({ footer: null });
        break;
      case 'seal':
        this.sealPreview = null;
        this.organisationForm.patchValue({ seal: null });
        break;
    }
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.toasterService.error('Geolocation is not supported by your browser', 'Not Supported');
      return;
    }

    this.isGettingLocation = true;
    this.locationError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.organisationForm.patchValue({
          latitude: this.latitude,
          longitude: this.longitude
        });
        this.isGettingLocation = false;
        this.toasterService.success('Location captured successfully!', 'Success');
      },
      (error) => {
        this.isGettingLocation = false;
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        this.locationError = errorMessage;
        this.toasterService.error(errorMessage, 'Location Error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  openInMaps(): void {
    if (this.latitude && this.longitude) {
      const url = `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
      window.open(url, '_blank');
    }
  }

  onSubmit(): void {
    if (this.organisationForm.valid) {
      this.isSubmitting = true;
      // Use getRawValue() to get all values including disabled fields and null values
      const formValue = this.organisationForm.getRawValue();
      
      // Ensure all required fields are present
      const organisationData: Organisation = {
        organisationName: formValue.organisationName || '',
        address: formValue.address || '',
        phoneNumber: formValue.phoneNumber || '',
        email: formValue.email || '',
        website: formValue.website || '',
        location: formValue.location || '',
        latitude: formValue.latitude || null,
        longitude: formValue.longitude || null,
        logo: formValue.logo || null,
        header: formValue.header || null,
        footer: formValue.footer || null,
        seal: formValue.seal || null,
        remarks: formValue.remarks || ''
      };
      
      if (this.isEditMode && this.organisationId) {
        this.organisationService.update(this.organisationId, organisationData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toasterService.success('Organisation updated successfully!', 'Success');
            this.router.navigate(['/dashboard/administration/organisation']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating organisation:', error);
            // Error is handled by interceptor
          }
        });
      } else {
        this.organisationService.create(organisationData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toasterService.success('Organisation created successfully!', 'Success');
            this.router.navigate(['/dashboard/administration/organisation']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error creating organisation:', error);
            // Error is handled by interceptor
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.toasterService.error('Please fill all required fields correctly', 'Validation Error');
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/administration/organisation']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.organisationForm.controls).forEach(key => {
      const control = this.organisationForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters for form controls
  get organisationName() { return this.organisationForm.get('organisationName'); }
  get address() { return this.organisationForm.get('address'); }
  get phoneNumber() { return this.organisationForm.get('phoneNumber'); }
  get email() { return this.organisationForm.get('email'); }
  get website() { return this.organisationForm.get('website'); }
  get location() { return this.organisationForm.get('location'); }
  get remarks() { return this.organisationForm.get('remarks'); }
}
