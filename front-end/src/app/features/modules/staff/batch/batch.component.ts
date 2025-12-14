import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { BatchTableComponent } from './batch-table/batch-table.component';

@Component({
  selector: 'app-batch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BatchTableComponent],
  templateUrl: './batch.component.html',
  styleUrl: './batch.component.scss'
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
    private toasterService: ToasterService
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
    // Load existing batch data if editing
    // For now, we'll leave it empty
    // In real app, this would come from API
    if (this.isEditMode && this.batchId) {
      // Simulate loading data
      // this.batchForm.patchValue({ ... });
    }
  }

  onSubmit(): void {
    if (this.batchForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        const message = this.isEditMode ? 'Batch updated successfully!' : 'Batch created successfully!';
        this.toasterService.success(message, 'Success');
        // Navigate back to batch table
        this.router.navigate(['/dashboard/staff/batch']);
      }, 1000);
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
