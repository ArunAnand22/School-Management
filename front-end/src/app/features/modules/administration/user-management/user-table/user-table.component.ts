import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface User {
  id: number;
  userId: string;
  tutorId: number;
  tutorName: string;
  tutorRegNo: string;
  username: string;
  canLogin: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss'
})
export class UserTableComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 10;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadFakeData();
    this.filteredUsers = [...this.allUsers];
  }

  private loadFakeData(): void {
    // Generate fake users
    const tutorNames = ['Dr. Robert Smith', 'Prof. Mary Johnson', 'Dr. James Wilson', 'Prof. Patricia Brown', 
                        'Dr. Michael Davis', 'Prof. Jennifer Martinez', 'Dr. William Anderson', 'Prof. Linda Taylor',
                        'Dr. Richard Thomas', 'Prof. Barbara Jackson'];
    
    this.allUsers = Array.from({ length: 25 }, (_, i) => {
      const tutorIndex = i % tutorNames.length;
      const tutorName = tutorNames[tutorIndex];
      const regNo = `TUT${String(tutorIndex + 1).padStart(4, '0')}`;
      const userId = `USR${String(tutorIndex + 1).padStart(4, '0')}`;
      const username = tutorName.toLowerCase()
        .replace(/[.\s]/g, '.')
        .replace(/dr\.|prof\./g, '')
        .trim();
      
      return {
        id: i + 1,
        userId,
        tutorId: tutorIndex + 1,
        tutorName,
        tutorRegNo: regNo,
        username: `${username}${i > tutorNames.length ? i : ''}`,
        canLogin: i % 3 !== 0, // Some users can't login
        createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      };
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

  get paginatedUsers(): User[] {
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
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.allUsers = this.allUsers.filter(u => u.id !== user.id);
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

