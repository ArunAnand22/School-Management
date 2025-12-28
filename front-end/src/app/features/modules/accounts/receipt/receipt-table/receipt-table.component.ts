import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceiptService, Receipt } from '../../../../../core/services/receipt.service';
import { ToasterService } from '../../../../../core/services/toaster.service';

@Component({
  selector: 'app-receipt-table',
  templateUrl: './receipt-table.component.html',
  styleUrls: ['./receipt-table.component.scss']
})
export class ReceiptTableComponent implements OnInit {
  allReceipts: Receipt[] = [];
  filteredReceipts: Receipt[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Expose Math to template
  Math = Math;

  isLoading = false;

  constructor(
    private router: Router,
    private receiptService: ReceiptService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.receiptService.getAll().subscribe({
      next: (data: Receipt[]) => {
        this.allReceipts = data;
        this.filteredReceipts = [...this.allReceipts];
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
      this.filteredReceipts = [...this.allReceipts];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredReceipts = this.allReceipts.filter(receipt =>
      receipt.referenceNumber.toLowerCase().includes(query) ||
      receipt.date.includes(query) ||
      receipt.studentName?.toLowerCase().includes(query) ||
      receipt.tutorName?.toLowerCase().includes(query) ||
      receipt.amount.toString().includes(query) ||
      receipt.studentRegNo?.toLowerCase().includes(query) ||
      receipt.tutorRegNo?.toLowerCase().includes(query)
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

    this.filteredReceipts.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedReceipts(): Receipt[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredReceipts.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReceipts.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/accounts/receipt/create']);
  }

  editReceipt(receipt: Receipt): void {
    this.router.navigate(['/dashboard/accounts/receipt/edit', receipt.id]);
  }

  deleteReceipt(receipt: Receipt): void {
    if (!receipt.id) return;
    
    if (confirm(`Are you sure you want to delete receipt ${receipt.referenceNumber}?`)) {
      this.receiptService.delete(receipt.id).subscribe({
        next: () => {
          this.toasterService.success('Receipt deleted successfully', 'Success');
          this.loadData(); // Reload data from API
        },
        error: (error: any) => {
          // Error is handled by interceptor
        }
      });
    }
  }

  downloadCSV(): void {
    const headers = ['Date', 'Reference Number', 'Transaction Type', 'Amount', 'Student', 'Tutor', 'Remarks'];
    const rows = this.filteredReceipts.map(r => [
      r.date,
      r.referenceNumber,
      r.transactionType.toUpperCase(),
      r.amount.toString(),
      r.studentName ? `${r.studentRegNo} - ${r.studentName}` : '-',
      r.tutorName ? `${r.tutorRegNo} - ${r.tutorName}` : '-',
      r.remarks || '-'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

