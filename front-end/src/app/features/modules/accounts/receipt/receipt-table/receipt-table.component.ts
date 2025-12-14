import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Receipt {
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
  selector: 'app-receipt-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receipt-table.component.html',
  styleUrl: './receipt-table.component.scss'
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFakeData();
    this.filteredReceipts = [...this.allReceipts];
  }

  private loadFakeData(): void {
    const students = [
      { id: 1, name: 'John Doe', regNo: 'STU0001' },
      { id: 2, name: 'Jane Smith', regNo: 'STU0002' },
      { id: 3, name: 'Michael Johnson', regNo: 'STU0003' }
    ];

    const tutors = [
      { id: 1, name: 'Dr. Robert Smith', regNo: 'TUT0001' },
      { id: 2, name: 'Prof. Mary Johnson', regNo: 'TUT0002' }
    ];

    this.allReceipts = Array.from({ length: 25 }, (_, i) => {
      const isStudent = Math.random() > 0.5;
      const person = isStudent 
        ? students[Math.floor(Math.random() * students.length)]
        : tutors[Math.floor(Math.random() * tutors.length)];

      return {
        id: i + 1,
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        referenceNumber: `REC${String(i + 1).padStart(6, '0')}`,
        transactionType: 'out',
        amount: Math.floor(Math.random() * 10000) + 1000,
        ...(isStudent ? {
          studentId: person.id,
          studentName: person.name,
          studentRegNo: person.regNo
        } : {
          tutorId: person.id,
          tutorName: person.name,
          tutorRegNo: person.regNo
        }),
        remarks: `Receipt ${i + 1} remarks`,
        createdAt: new Date().toISOString()
      };
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
    if (confirm(`Are you sure you want to delete receipt ${receipt.referenceNumber}?`)) {
      this.allReceipts = this.allReceipts.filter(r => r.id !== receipt.id);
      this.onSearch();
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

