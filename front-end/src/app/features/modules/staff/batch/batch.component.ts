import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { BatchService } from '../../../../core/services/batch.service';
import { BatchTableComponent } from './batch-table/batch-table.component';

@Component({
  selector: 'app-batch',
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.scss']
})
export class BatchComponent implements OnInit {
  batchForm!: FormGroup;
  isSubmitting = false;
  isCreateMode = false;
  isEditMode = false;
  batchId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private batchService: BatchService
  ) {}

  ngOnInit(): void {
    // Check if we're in create or edit mode
    const routePath = this.route.snapshot.url.map(segment => segment.path).join('/');
    this.isCreateMode = routePath.includes('create');
    this.isEditMode = routePath.includes('edit');
    
    if (this.isEditMode) {
      const id = this.route.snapshot.paramMap.get('id');
      this.batchId = id ? parseInt(id, 10) : null;
    }
    
    if (this.isCreateMode || this.isEditMode) {
      this.initializeForm();
      this.loadExistingData();
    }
  }

  private initializeForm(): void {
    this.batchForm = this.fb.group({
      batchName: ['', [Validators.required, Validators.minLength(2)]],
      batchCode: ['', [Validators.required, Validators.minLength(2)]],
      remarks: ['']
    });
  }

  private loadExistingData(): void {
    if (this.isEditMode && this.batchId) {
      this.batchService.getById(this.batchId).subscribe({
        next: (batch) => {
          this.batchForm.patchValue(batch);
        },
        error: (error) => {
          // Error is handled by interceptor
        }
      });
    }
  }

  onSubmit(): void {
    if (this.batchForm.valid) {
      this.isSubmitting = true;
      const formValue = this.batchForm.value;
      
      if (this.isEditMode && this.batchId) {
        this.batchService.update(this.batchId, formValue).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toasterService.success('Batch updated successfully!', 'Success');
            this.router.navigate(['/dashboard/staff/batch']);
          },
          error: (error) => {
            this.isSubmitting = false;
            // Error is handled by interceptor
          }
        });
      } else {
        this.batchService.create(formValue).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toasterService.success('Batch created successfully!', 'Success');
            this.router.navigate(['/dashboard/staff/batch']);
          },
          error: (error) => {
            this.isSubmitting = false;
            // Error is handled by interceptor
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.toasterService.error('Please fill all required fields correctly', 'Validation Error');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.batchForm.controls).forEach(key => {
      const control = this.batchForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/staff/batch']);
  }

  // Getters for form controls
  get batchName() { return this.batchForm.get('batchName'); }
  get batchCode() { return this.batchForm.get('batchCode'); }
  get remarks() { return this.batchForm.get('remarks'); }
}
