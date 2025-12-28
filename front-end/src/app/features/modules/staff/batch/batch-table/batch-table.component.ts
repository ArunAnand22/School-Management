import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BatchService, Batch } from '../../../../../core/services/batch.service';
import { ToasterService } from '../../../../../core/services/toaster.service';

@Component({
  selector: 'app-batch-table',
  templateUrl: './batch-table.component.html',
  styleUrls: ['./batch-table.component.scss']
})
export class BatchTableComponent implements OnInit {
  allBatches: Batch[] = [];
  filteredBatches: Batch[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;

  constructor(
    private router: Router,
    private batchService: BatchService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.batchService.getAll().subscribe({
      next: (data: Batch[]) => {
        this.allBatches = data;
        this.filteredBatches = [...this.allBatches];
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
    if (!batch.id) return;
    
    if (confirm(`Are you sure you want to delete ${batch.batchName}?`)) {
      this.batchService.delete(batch.id).subscribe({
        next: () => {
          this.toasterService.success('Batch deleted successfully', 'Success');
          this.loadData(); // Reload data from API
        },
        error: (error: any) => {
          // Error is handled by interceptor
        }
      });
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

