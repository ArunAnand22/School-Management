import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Batch {
  id: number;
  batchName: string;
  batchCode: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-batch-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-table.component.html',
  styleUrl: './batch-table.component.scss'
})
export class BatchTableComponent implements OnInit {
  allBatches: Batch[] = [];
  filteredBatches: Batch[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFakeData();
    this.filteredBatches = [...this.allBatches];
  }

  private loadFakeData(): void {
    // Generate fake batches
    const batchNames = ['Batch 2024', 'Batch 2023', 'Batch 2025', 'Evening Batch', 'Morning Batch', 
                        'Weekend Batch', 'Summer Batch', 'Winter Batch', 'Fast Track Batch', 'Regular Batch'];
    
    this.allBatches = Array.from({ length: 25 }, (_, i) => {
      const name = batchNames[i % batchNames.length];
      const code = `B${String(2020 + (i % 10)).slice(-2)}${String(i % 10 + 1).padStart(2, '0')}`;
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      
      return {
        id: i + 1,
        batchName: `${name} ${i > 9 ? i : ''}`,
        batchCode: code,
        remarks: i % 3 === 0 ? 'Special batch for advanced students' : i % 4 === 0 ? 'Weekend classes available' : '',
        createdAt: date,
        updatedAt: date
      };
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredBatches = [...this.allBatches];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredBatches = this.allBatches.filter(batch =>
      batch.batchName.toLowerCase().includes(query) ||
      batch.batchCode.toLowerCase().includes(query) ||
      batch.remarks.toLowerCase().includes(query)
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

    this.filteredBatches.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedBatches(): Batch[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredBatches.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBatches.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadCSV(): void {
    const headers = [
      'Batch Name', 'Batch Code', 'Remarks', 'Created At'
    ];

    const rows = this.filteredBatches.map(batch => [
      batch.batchName,
      batch.batchCode,
      batch.remarks || 'N/A',
      batch.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `batches_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/staff/batch/create']);
  }

  editBatch(batch: Batch): void {
    this.router.navigate(['/dashboard/staff/batch/edit', batch.id]);
  }

  deleteBatch(batch: Batch): void {
    if (confirm(`Are you sure you want to delete ${batch.batchName}?`)) {
      this.allBatches = this.allBatches.filter(b => b.id !== batch.id);
      this.onSearch(); // Refresh filtered list
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}

