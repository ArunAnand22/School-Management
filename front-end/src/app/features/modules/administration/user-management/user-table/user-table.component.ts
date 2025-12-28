import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../../../../core/services/user.service';
import { ToasterService } from '../../../../../core/services/toaster.service';

interface UserWithTutorInfo extends User {
  tutorName: string;
  tutorRegNo: string;
}

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {
  allUsers: UserWithTutorInfo[] = [];
  filteredUsers: UserWithTutorInfo[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  isLoading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (data: User[]) => {
        // Transform API data to match component interface
        this.allUsers = data.map((u: User) => ({
          id: u.id!,
          userId: u.userId,
          tutorId: u.tutorId || 0,
          tutorName: '', // Will be populated from person data if needed
          tutorRegNo: '', // Will be populated from person data if needed
          username: u.username,
          canLogin: u.canLogin,
          createdAt: u.createdAt || ''
        }));
        this.filteredUsers = [...this.allUsers];
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
      this.filteredUsers = [...this.allUsers];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      user.userId.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.tutorName.toLowerCase().includes(query) ||
      user.tutorRegNo.toLowerCase().includes(query)
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

    this.filteredUsers.sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedUsers(): UserWithTutorInfo[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  downloadCSV(): void {
    const headers = [
      'User ID', 'Username', 'Tutor Name', 'Tutor Reg No', 'Can Login', 'Created At'
    ];

    const rows = this.filteredUsers.map(user => [
      user.userId,
      user.username,
      user.tutorName,
      user.tutorRegNo,
      user.canLogin ? 'Yes' : 'No',
      user.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  addNew(): void {
    this.router.navigate(['/dashboard/administration/user-management/create']);
  }

  editUser(user: User): void {
    // Navigate to edit form (can be implemented later)
    console.log('Edit user:', user);
  }

  deleteUser(user: User): void {
    if (!user.id) return;
    
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.toasterService.success('User deleted successfully', 'Success');
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

