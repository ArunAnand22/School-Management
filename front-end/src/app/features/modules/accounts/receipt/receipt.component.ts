import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../../../../core/services/toaster.service';
import { ReceiptTableComponent } from './receipt-table/receipt-table.component';

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
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ReceiptTableComponent],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss'
})
export class ReceiptComponent implements OnInit, OnDestroy {
  receiptForm!: FormGroup;
  isSubmitting = false;
  isCreateMode = false;
  isEditMode = false;
  receiptId: number | null = null;
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
    private route: ActivatedRoute
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
        this.receiptId = +urlSegments[urlSegments.length - 1].path;
        this.loadStudents();
        this.loadTutors();
        this.initializeForm();
        this.loadReceiptData(this.receiptId);
      } else {
        this.isCreateMode = false;
        this.isEditMode = false;
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.searchable-dropdown')) {
      this.showStudentDropdown = false;
      this.showTutorDropdown = false;
    }
  }

  private initializeForm(): void {
    this.receiptForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      referenceNumber: [{ value: '', disabled: true }, []],
      remarks: [''],
      transactionType: [{ value: 'out', disabled: true }, []],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      studentId: [''],
      tutorId: ['']
    });
  }

  private loadStudents(): void {
    // Generate fake students data
    const names = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'David Wilson',
                   'Sarah Brown', 'Robert Taylor', 'Jessica Martinez', 'William Anderson', 'Ashley Thomas',
                   'James Jackson', 'Amanda White', 'Christopher Harris', 'Melissa Martin', 'Daniel Thompson'];

    this.students = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      regNo: `STU${String(i + 1).padStart(4, '0')}`,
      nameOfApplicant: names[i % names.length]
    }));
    this.filteredStudents = [...this.students];
  }

  private loadTutors(): void {
    // Generate fake tutors data
    const names = ['Dr. Robert Smith', 'Prof. Mary Johnson', 'Dr. James Wilson', 'Prof. Patricia Brown',
                   'Dr. Michael Davis', 'Prof. Jennifer Martinez', 'Dr. William Anderson', 'Prof. Linda Taylor',
                   'Dr. Richard Thomas', 'Prof. Barbara Jackson'];

    this.tutors = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      regNo: `TUT${String(i + 1).padStart(4, '0')}`,
      nameOfApplicant: names[i % names.length]
    }));
    this.filteredTutors = [...this.tutors];
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
    this.receiptForm.patchValue({ studentId: student.id });
    const displayValue = `${student.regNo} - ${student.nameOfApplicant}`;
    this.selectedStudentName = displayValue;
    this.showStudentDropdown = false;
    this.filteredStudents = [...this.students];
    this.studentSearchQuery = '';
  }

  selectTutor(tutor: Tutor): void {
    this.receiptForm.patchValue({ tutorId: tutor.id });
    const displayValue = `${tutor.regNo} - ${tutor.nameOfApplicant}`;
    this.selectedTutorName = displayValue;
    this.showTutorDropdown = false;
    this.filteredTutors = [...this.tutors];
    this.tutorSearchQuery = '';
  }

  clearStudentSelection(): void {
    this.receiptForm.patchValue({ studentId: '' });
    this.studentSearchQuery = '';
    this.selectedStudentName = '';
    this.filteredStudents = [...this.students];
    this.showStudentDropdown = false;
  }

  clearTutorSelection(): void {
    this.receiptForm.patchValue({ tutorId: '' });
    this.tutorSearchQuery = '';
    this.selectedTutorName = '';
    this.filteredTutors = [...this.tutors];
    this.showTutorDropdown = false;
  }

  getSelectedStudentName(): string {
    if (this.selectedStudentName) {
      return this.selectedStudentName;
    }
    const studentId = this.receiptForm.get('studentId')?.value;
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
    const tutorId = this.receiptForm.get('tutorId')?.value;
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
    const refNumber = `REC${timestamp}${random}`.slice(0, 15);
    this.receiptForm.patchValue({ referenceNumber: refNumber });
  }

  private loadReceiptData(id: number): void {
    // Simulate fetching receipt data
    // In real app, this would come from an API
    const receiptData = {
      date: new Date().toISOString().split('T')[0],
      referenceNumber: `REC${Date.now()}`,
      transactionType: 'out',
      amount: 5000,
      studentId: 1,
      tutorId: null,
      remarks: 'Receipt for expenses'
    };
    
    // Load students and tutors first, then set form values
    this.loadStudents();
    this.loadTutors();
    
    // Wait a bit for data to load, then set form values
    setTimeout(() => {
      this.receiptForm.patchValue(receiptData);
      
      // Update selected names to show selected values
      if (receiptData.studentId) {
        const student = this.students.find(s => s.id === receiptData.studentId);
        if (student) {
          this.selectedStudentName = `${student.regNo} - ${student.nameOfApplicant}`;
        }
      }
      if (receiptData.tutorId) {
        const tutor = this.tutors.find(t => t.id === receiptData.tutorId);
        if (tutor) {
          this.selectedTutorName = `${tutor.regNo} - ${tutor.nameOfApplicant}`;
        }
      }
    }, 100);
  }

  onSubmit(): void {
    if (this.receiptForm.valid) {
      // Check if at least one of student or tutor is selected
      const studentId = this.receiptForm.get('studentId')?.value;
      const tutorId = this.receiptForm.get('tutorId')?.value;

      if (!studentId && !tutorId) {
        this.toasterService.error('Please select either a student or a tutor', 'Validation Error');
        return;
      }

      this.isSubmitting = true;
      const formValue = this.receiptForm.getRawValue(); // Use getRawValue to get disabled field values
      
      console.log('Receipt Form Submitted:', formValue);

      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        this.toasterService.success(`Receipt ${this.isEditMode ? 'updated' : 'recorded'} successfully!`, 'Success');
        this.router.navigate(['/dashboard/accounts/receipt']);
      }, 1500);
    } else {
      this.markFormGroupTouched(this.receiptForm);
      this.toasterService.error('Please fill all required fields correctly.', 'Validation Error');
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/accounts/receipt']);
  }

  resetForm(): void {
    this.receiptForm.reset();
    this.receiptForm.patchValue({
      date: new Date().toISOString().split('T')[0],
      transactionType: 'out'
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

  get date() { return this.receiptForm.get('date'); }
  get referenceNumber() { return this.receiptForm.get('referenceNumber'); }
  get amount() { return this.receiptForm.get('amount'); }
  get studentId() { return this.receiptForm.get('studentId'); }
  get tutorId() { return this.receiptForm.get('tutorId'); }
}
