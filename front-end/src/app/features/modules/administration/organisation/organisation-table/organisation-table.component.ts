import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganisationService, Organisation } from '../../../../../core/services/organisation.service';
import { ToasterService } from '../../../../../core/services/toaster.service';
import { LoaderService } from '../../../../../core/services/loader.service';

@Component({
  selector: 'app-organisation-table',
  templateUrl: './organisation-table.component.html',
  styleUrls: ['./organisation-table.component.scss']
})
export class OrganisationTableComponent implements OnInit {
  allOrganisations: Organisation[] = [];
  filteredOrganisations: Organisation[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading = false;

  constructor(
    private router: Router,
    private organisationService: OrganisationService,
    private toasterService: ToasterService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.loaderService.show();
    this.organisationService.getAll().subscribe({
      next: (data: Organisation[]) => {
        this.allOrganisations = data;
        this.filteredOrganisations = [...this.allOrganisations];
        this.isLoading = false;
        this.loaderService.hide();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.loaderService.hide();
        // Error is handled by interceptor
      }
    });
  }


  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredOrganisations = [...this.allOrganisations];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredOrganisations = this.allOrganisations.filter(org =>
      org.organisationName.toLowerCase().includes(query) ||
      org.email.toLowerCase().includes(query) ||
      org.location.toLowerCase().includes(query) ||
      org.phoneNumber.includes(query) ||
      org.address.toLowerCase().includes(query)
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

    this.filteredOrganisations.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedOrganisations(): Organisation[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrganisations.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrganisations.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadCSV(): void {
    const headers = [
      'Organisation Name', 'Address', 'Phone Number', 'Email', 'Website', 'Location', 'Created At'
    ];

    const rows = this.filteredOrganisations.map(org => [
      org.organisationName,
      org.address,
      org.phoneNumber,
      org.email,
      org.website || 'N/A',
      org.location,
      org.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `organisations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/administration/organisation/create']);
  }

  editOrganisation(org: Organisation): void {
    this.router.navigate(['/dashboard/administration/organisation/edit', org.id]);
  }

  deleteOrganisation(org: Organisation): void {
    if (!org.id) return;
    
    if (confirm(`Are you sure you want to delete ${org.organisationName}?`)) {
      this.organisationService.delete(org.id).subscribe({
        next: () => {
          this.toasterService.success('Organisation deleted successfully', 'Success');
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

