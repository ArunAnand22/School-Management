import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Organisation {
  id: number;
  organisationName: string;
  address: string;
  phoneNumber: string;
  email: string;
  website: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  logo: string | null;
  header: string | null;
  footer: string | null;
  seal: string | null;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-organisation-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organisation-table.component.html',
  styleUrl: './organisation-table.component.scss'
})
export class OrganisationTableComponent implements OnInit {
  allOrganisations: Organisation[] = [];
  filteredOrganisations: Organisation[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFakeData();
    this.filteredOrganisations = [...this.allOrganisations];
  }

  private loadFakeData(): void {
    // Generate fake organisations
    const names = ['ABC School', 'XYZ Academy', 'Global Education Center', 'Elite Learning Institute', 
                   'Bright Future School', 'Knowledge Hub', 'Excellence Academy', 'Star Education Center'];
    
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
    
    this.allOrganisations = Array.from({ length: 8 }, (_, i) => {
      const name = names[i % names.length];
      const city = cities[i % cities.length];
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      
      return {
        id: i + 1,
        organisationName: name,
        address: `${Math.floor(Math.random() * 1000) + 1} Main Street, ${city}`,
        phoneNumber: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.edu`,
        website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.edu`,
        location: `${city}, State, Country`,
        latitude: 40 + Math.random() * 10,
        longitude: -70 - Math.random() * 10,
        logo: null,
        header: null,
        footer: null,
        seal: null,
        remarks: i % 3 === 0 ? 'Premium institution' : '',
        createdAt: date,
        updatedAt: date
      };
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
    if (confirm(`Are you sure you want to delete ${org.organisationName}?`)) {
      this.allOrganisations = this.allOrganisations.filter(o => o.id !== org.id);
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

