import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { CourseTableComponent } from './course-table/course-table.component';

export interface Batch {
  id: number;
  batchName: string;
  batchCode: string;
}

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CourseTableComponent],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent implements OnInit {
  courseForm!: FormGroup;
  isSubmitting = false;
  isCreateMode = false;
  isEditMode = false;
  courseId: number | null = null;
  batches: Batch[] = [];

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
      this.courseId = id ? parseInt(id, 10) : null;
    }
    
    if (this.isCreateMode || this.isEditMode) {
      this.loadBatches();
      this.initializeForm();
      this.loadExistingData();
    }
  }

  private loadBatches(): void {
    // Load batches from batch collection
    // For now, we'll generate fake batches
    const batchNames = ['Batch 2024', 'Batch 2023', 'Batch 2025', 'Evening Batch', 'Morning Batch', 
                        'Weekend Batch', 'Summer Batch', 'Winter Batch', 'Fast Track Batch', 'Regular Batch'];
    
    this.batches = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      batchName: batchNames[i % batchNames.length],
      batchCode: `B${String(2020 + (i % 10)).slice(-2)}${String(i % 10 + 1).padStart(2, '0')}`
    }));
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group({
      courseCode: ['', [Validators.required, Validators.minLength(2)]],
      courseName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      duration: [0, [Validators.required, Validators.min(1)]],
      totalFee: [0, [Validators.required, Validators.min(0)]],
      batchId: ['', [Validators.required]],
      isActive: [true]
    });
  }

  private loadExistingData(): void {
    // Load existing course data if editing
    // For now, we'll leave it empty
    // In real app, this would come from API
    if (this.isEditMode && this.courseId) {
      // Simulate loading data
      // this.courseForm.patchValue({ ... });
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.isSubmitting = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        const message = this.isEditMode ? 'Course updated successfully!' : 'Course created successfully!';
        this.toasterService.success(message, 'Success');
        // Navigate back to course table
        this.router.navigate(['/dashboard/staff/course']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
      this.toasterService.error('Please fill all required fields correctly', 'Validation Error');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      const control = this.courseForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/staff/course']);
  }

  // Getters for form controls
  get courseCode() { return this.courseForm.get('courseCode'); }
  get courseName() { return this.courseForm.get('courseName'); }
  get description() { return this.courseForm.get('description'); }
  get duration() { return this.courseForm.get('duration'); }
  get totalFee() { return this.courseForm.get('totalFee'); }
  get batchId() { return this.courseForm.get('batchId'); }
  get isActive() { return this.courseForm.get('isActive'); }
}
