import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Payment {
  id: number;
  date: string;
  referenceNumber: string;
  transactionType: string;
  amount: number;
  studentId?: number;
  studentName?: string;
  studentRegNo?: string;
  tutorId?: number;
  tutorName?: string;
  tutorRegNo?: string;
  remarks?: string;
  createdAt: string;
}

@Component({
  selector: 'app-payment-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-table.component.html',
  styleUrl: './payment-table.component.scss'
})
export class PaymentTableComponent implements OnInit {
  allPayments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Expose Math to template
  Math = Math;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFakeData();
    this.filteredPayments = [...this.allPayments];
  }

  private loadFakeData(): void {
    const students = [
      { id: 1, name: 'John Doe', regNo: 'STU0001' },
      { id: 2, name: 'Jane Smith', regNo: 'STU0002' },
      { id: 3, name: 'Michael Johnson', regNo: 'STU0003' },
      { id: 4, name: 'Emily Davis', regNo: 'STU0004' },
      { id: 5, name: 'David Wilson', regNo: 'STU0005' }
    ];

    const tutors = [
      { id: 1, name: 'Dr. Robert Smith', regNo: 'TUT0001' },
      { id: 2, name: 'Prof. Mary Johnson', regNo: 'TUT0002' },
      { id: 3, name: 'Dr. James Wilson', regNo: 'TUT0003' },
      { id: 4, name: 'Prof. Patricia Brown', regNo: 'TUT0004' },
      { id: 5, name: 'Dr. Michael Davis', regNo: 'TUT0005' }
    ];

    this.allPayments = Array.from({ length: 50 }, (_, i) => {
      const isStudent = i % 2 === 0;
      const person = isStudent 
        ? students[i % students.length]
        : tutors[i % tutors.length];
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const timestamp = Date.now() + i;
      const random = Math.floor(Math.random() * 1000);
      const refNumber = `REF${timestamp}${random}`.slice(0, 15);

      return {
        id: i + 1,
        date: date.toISOString().split('T')[0],
        referenceNumber: refNumber,
        transactionType: 'in',
        amount: Math.floor(Math.random() * 50000) + 1000,
        ...(isStudent 
          ? { studentId: person.id, studentName: person.name, studentRegNo: person.regNo }
          : { tutorId: person.id, tutorName: person.name, tutorRegNo: person.regNo }
        ),
        remarks: i % 3 === 0 ? 'Payment received' : '',
        createdAt: date.toISOString()
      };
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPayments = [...this.allPayments];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredPayments = this.allPayments.filter(payment =>
      payment.referenceNumber.toLowerCase().includes(query) ||
      payment.date.includes(query) ||
      (payment.studentName && payment.studentName.toLowerCase().includes(query)) ||
      (payment.tutorName && payment.tutorName.toLowerCase().includes(query)) ||
      (payment.studentRegNo && payment.studentRegNo.toLowerCase().includes(query)) ||
      (payment.tutorRegNo && payment.tutorRegNo.toLowerCase().includes(query)) ||
      payment.amount.toString().includes(query)
    );
    this.currentPage = 1;
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredPayments.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPayments.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPayments.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  }

  downloadCSV(): void {
    const headers = [
      'Date', 'Reference Number', 'Transaction Type', 'Amount', 
      'Student', 'Tutor', 'Remarks'
    ];

    const rows = this.filteredPayments.map(payment => [
      payment.date,
      payment.referenceNumber,
      payment.transactionType,
      payment.amount,
      payment.studentName ? `${payment.studentRegNo} - ${payment.studentName}` : '',
      payment.tutorName ? `${payment.tutorRegNo} - ${payment.tutorName}` : '',
      payment.remarks || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/accounts/payment/create']);
  }

  editPayment(payment: Payment): void {
    this.router.navigate(['/dashboard/accounts/payment/edit', payment.id]);
  }

  deletePayment(payment: Payment): void {
    if (confirm(`Are you sure you want to delete payment ${payment.referenceNumber}?`)) {
      this.allPayments = this.allPayments.filter(p => p.id !== payment.id);
      this.onSearch(); // Refresh filtered list
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 2 
    }).format(value);
  }
}

