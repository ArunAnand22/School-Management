import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService, Payment } from '../../../../../core/services/payment.service';
import { ToasterService } from '../../../../../core/services/toaster.service';

@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  styleUrls: ['./payment-table.component.scss']
})
export class PaymentTableComponent implements OnInit {
  allPayments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;
  
  // Expose Math to template
  Math = Math;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.paymentService.getAll().subscribe({
      next: (data: Payment[]) => {
        this.allPayments = data;
        this.filteredPayments = [...this.allPayments];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        // Error is handled by interceptor
      }
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
    if (!payment.id) return;
    
    if (confirm(`Are you sure you want to delete payment ${payment.referenceNumber}?`)) {
      this.paymentService.delete(payment.id).subscribe({
        next: (): void => {
          this.toasterService.success('Payment deleted successfully', 'Success');
          this.loadData(); // Reload data from API
        },
        error: (error: any): void => {
          // Error is handled by interceptor
        }
      });
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

