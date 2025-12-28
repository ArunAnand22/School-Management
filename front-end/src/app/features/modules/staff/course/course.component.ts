import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { CourseService } from '../../../../core/services/course.service';
import { BatchService, Batch } from '../../../../core/services/batch.service';
import { CourseTableComponent } from './course-table/course-table.component';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
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
    private toasterService: ToasterService,
    private courseService: CourseService,
    private batchService: BatchService
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
    this.batchService.getAll().subscribe({
      next: (data) => {
        this.batches = data.map(b => ({
          id: b.id!,
          batchName: b.batchName,
          batchCode: b.batchCode,
          remarks: b.remarks || ''
        }));
      },
      error: (error) => {
        // Error is handled by interceptor
      }
    });
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
    if (this.isEditMode && this.courseId) {
      this.courseService.getById(this.courseId).subscribe({
        next: (course) => {
          this.courseForm.patchValue(course);
        },
        error: (error) => {
          // Error is handled by interceptor
        }
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.isSubmitting = true;
      const formValue = this.courseForm.value;
      
      // Get batch name from selected batch
      const selectedBatch = this.batches.find(b => b.id === formValue.batchId);
      const payload = {
        ...formValue,
        batchName: selectedBatch?.batchName || ''
      };
      
      if (this.isEditMode && this.courseId) {
        this.courseService.update(this.courseId, payload).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toasterService.success('Course updated successfully!', 'Success');
            this.router.navigate(['/dashboard/staff/course']);
          },
          error: (error) => {
            this.isSubmitting = false;
            // Error is handled by interceptor
          }
        });
      } else {
        this.courseService.create(payload).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.toasterService.success('Course created successfully!', 'Success');
            this.router.navigate(['/dashboard/staff/course']);
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
