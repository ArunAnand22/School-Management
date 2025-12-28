import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { PaymentService, Payment } from '../../../../core/services/payment.service';
import { PersonService, Person } from '../../../../core/services/person.service';
import { PaymentTableComponent } from './payment-table/payment-table.component';

interface Student {
  id: number;
  regNo: string;
  nameOfApplicant: string;
}

interface Tutor {
  id: number;
  regNo: string;
  nameOfApplicant: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm!: FormGroup;
  isSubmitting = false;
  isCreateMode = false;
  isEditMode = false;
  paymentId: number | null = null;
  students: Student[] = [];
  tutors: Tutor[] = [];
  filteredStudents: Student[] = [];
  filteredTutors: Tutor[] = [];
  studentSearchQuery = '';
  tutorSearchQuery = '';
  selectedStudentName = '';
  selectedTutorName = '';
  showStudentDropdown = false;
  showTutorDropdown = false;

  constructor(
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments[urlSegments.length - 1]?.path;
      if (path === 'create') {
        this.isCreateMode = true;
        this.isEditMode = false;
        this.loadStudents();
        this.loadTutors();
        this.initializeForm();
        this.generateReferenceNumber();
      } else if (path === 'edit' && urlSegments.length > 2) {
        this.isCreateMode = false;
        this.isEditMode = true;
        this.paymentId = +urlSegments[urlSegments.length - 1].path;
        this.loadStudents();
        this.loadTutors();
        this.initializeForm();
        this.loadPaymentData(this.paymentId);
      } else {
        this.isCreateMode = false;
        this.isEditMode = false;
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-dropdown')) {
      this.showStudentDropdown = false;
      this.showTutorDropdown = false;
    }
  }

  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      referenceNumber: [{ value: '', disabled: true }, []],
      remarks: [''],
      transactionType: [{ value: 'in', disabled: true }, []],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      studentId: [''],
      tutorId: ['']
    });
  }

  private loadStudents(): void {
    this.personService.getStudents().subscribe({
      next: (data: Person[]) => {
        this.students = data.map((p: Person) => ({
          id: p.id!,
          regNo: p.regNo,
          nameOfApplicant: p.nameOfApplicant
        }));
        this.filteredStudents = [...this.students];
      },
      error: (error: any) => {
        // Error is handled by interceptor
      }
    });
  }

  private loadTutors(): void {
    this.personService.getTutors().subscribe({
      next: (data: Person[]) => {
        this.tutors = data.map((p: Person) => ({
          id: p.id!,
          regNo: p.regNo,
          nameOfApplicant: p.nameOfApplicant
        }));
        this.filteredTutors = [...this.tutors];
      },
      error: (error: any) => {
        // Error is handled by interceptor
      }
    });
  }

  onStudentSearch(): void {
    if (!this.studentSearchQuery.trim()) {
      this.filteredStudents = [...this.students];
      return;
    }

    const query = this.studentSearchQuery.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.regNo.toLowerCase().includes(query) ||
      student.nameOfApplicant.toLowerCase().includes(query)
    );
  }

  onTutorSearch(): void {
    if (!this.tutorSearchQuery.trim()) {
      this.filteredTutors = [...this.tutors];
      return;
    }

    const query = this.tutorSearchQuery.toLowerCase();
    this.filteredTutors = this.tutors.filter(tutor =>
      tutor.regNo.toLowerCase().includes(query) ||
      tutor.nameOfApplicant.toLowerCase().includes(query)
    );
  }

  selectStudent(student: Student): void {
    this.paymentForm.patchValue({ studentId: student.id });
    // Update the display value but keep search query for dropdown
    const displayValue = `${student.regNo} - ${student.nameOfApplicant}`;
    // Store the selected student name separately
    this.selectedStudentName = displayValue;
    this.showStudentDropdown = false;
    this.filteredStudents = [...this.students];
    // Reset search query but keep the display
    this.studentSearchQuery = '';
  }

  selectTutor(tutor: Tutor): void {
    this.paymentForm.patchValue({ tutorId: tutor.id });
    // Update the display value but keep search query for dropdown
    const displayValue = `${tutor.regNo} - ${tutor.nameOfApplicant}`;
    // Store the selected tutor name separately
    this.selectedTutorName = displayValue;
    this.showTutorDropdown = false;
    this.filteredTutors = [...this.tutors];
    // Reset search query but keep the display
    this.tutorSearchQuery = '';
  }

  clearStudentSelection(): void {
    this.paymentForm.patchValue({ studentId: '' });
    this.studentSearchQuery = '';
    this.selectedStudentName = '';
    this.filteredStudents = [...this.students];
    this.showStudentDropdown = false;
  }

  clearTutorSelection(): void {
    this.paymentForm.patchValue({ tutorId: '' });
    this.tutorSearchQuery = '';
    this.selectedTutorName = '';
    this.filteredTutors = [...this.tutors];
    this.showTutorDropdown = false;
  }

  getSelectedStudentName(): string {
    if (this.selectedStudentName) {
      return this.selectedStudentName;
    }
    const studentId = this.paymentForm.get('studentId')?.value;
    if (!studentId) return '';
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      this.selectedStudentName = `${student.regNo} - ${student.nameOfApplicant}`;
      return this.selectedStudentName;
    }
    return '';
  }

  getSelectedTutorName(): string {
    if (this.selectedTutorName) {
      return this.selectedTutorName;
    }
    const tutorId = this.paymentForm.get('tutorId')?.value;
    if (!tutorId) return '';
    const tutor = this.tutors.find(t => t.id === tutorId);
    if (tutor) {
      this.selectedTutorName = `${tutor.regNo} - ${tutor.nameOfApplicant}`;
      return this.selectedTutorName;
    }
    return '';
  }

  private generateReferenceNumber(): void {
    // Generate a unique reference number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const refNumber = `REF${timestamp}${random}`.slice(0, 15);
    this.paymentForm.patchValue({ referenceNumber: refNumber });
  }

  private loadPaymentData(id: number): void {
    // Load students and tutors first
    this.loadStudents();
    this.loadTutors();
    
    // Load payment data from API
    this.paymentService.getById(id).subscribe({
      next: (payment: Payment) => {
        this.paymentForm.patchValue(payment);
        
        // Update selected names to show selected values
        if (payment.studentId) {
          const student = this.students.find(s => s.id === payment.studentId);
          if (student) {
            this.selectedStudentName = `${student.regNo} - ${student.nameOfApplicant}`;
          }
        }
        if (payment.tutorId) {
          const tutor = this.tutors.find(t => t.id === payment.tutorId);
          if (tutor) {
            this.selectedTutorName = `${tutor.regNo} - ${tutor.nameOfApplicant}`;
          }
        }
      },
      error: (error: any) => {
        // Error is handled by interceptor
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      // Check if at least one of student or tutor is selected
      const studentId = this.paymentForm.get('studentId')?.value;
      const tutorId = this.paymentForm.get('tutorId')?.value;

      if (!studentId && !tutorId) {
        this.toasterService.error('Please select either a student or a tutor', 'Validation Error');
        return;
      }

      this.isSubmitting = true;
      const formValue = this.paymentForm.getRawValue(); // Use getRawValue to get disabled field values
      
      const paymentData = {
        ...formValue,
        date: formValue.date || new Date().toISOString().split('T')[0],
        referenceNumber: formValue.referenceNumber || `REF${Date.now()}`
      };

      if (this.isEditMode && this.paymentId) {
        this.paymentService.update(this.paymentId, paymentData).subscribe({
          next: (): void => {
            this.isSubmitting = false;
            this.toasterService.success('Payment updated successfully!', 'Success');
            this.router.navigate(['/dashboard/accounts/payment']);
          },
          error: (error: any): void => {
            this.isSubmitting = false;
            // Error is handled by interceptor
          }
        });
      } else {
        this.paymentService.create(paymentData).subscribe({
          next: (): void => {
            this.isSubmitting = false;
            this.toasterService.success('Payment recorded successfully!', 'Success');
            this.router.navigate(['/dashboard/accounts/payment']);
          },
          error: (error: any): void => {
            this.isSubmitting = false;
            // Error is handled by interceptor
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.paymentForm);
      this.toasterService.error('Please fill all required fields correctly.', 'Validation Error');
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/accounts/payment']);
  }

  resetForm(): void {
    this.paymentForm.reset();
    this.paymentForm.patchValue({
      date: new Date().toISOString().split('T')[0],
      transactionType: 'in'
    });
    this.studentSearchQuery = '';
    this.tutorSearchQuery = '';
    this.selectedStudentName = '';
    this.selectedTutorName = '';
    this.filteredStudents = [...this.students];
    this.filteredTutors = [...this.tutors];
    this.showStudentDropdown = false;
    this.showTutorDropdown = false;
    this.generateReferenceNumber();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onStudentChange(): void {
    // No longer clearing tutor - both can be selected
    // This method is kept for potential future validation logic
  }

  onTutorChange(): void {
    // No longer clearing student - both can be selected
    // This method is kept for potential future validation logic
  }

  get date() { return this.paymentForm.get('date'); }
  get referenceNumber() { return this.paymentForm.get('referenceNumber'); }
  get amount() { return this.paymentForm.get('amount'); }
  get studentId() { return this.paymentForm.get('studentId'); }
  get tutorId() { return this.paymentForm.get('tutorId'); }
}
