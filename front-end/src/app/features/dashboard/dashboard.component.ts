import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  change: number;
  changeType: 'increase' | 'decrease';
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'student' | 'tutor' | 'course' | 'payment';
  message: string;
  time: string;
  icon: string;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [];
  recentActivities: RecentActivity[] = [];
  enrollmentData: ChartData[] = [];
  purchaseData: ChartData[] = [];
  selectedPeriod = 'month';
  selectedPurchasePeriod = 'month';

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivities();
    this.loadEnrollmentData();
    this.loadPurchaseData();
  }

  private loadStats(): void {
    this.stats = [
      {
        title: 'Total Students',
        value: 1248,
        icon: 'school',
        change: 12.5,
        changeType: 'increase',
        color: '#667eea'
      },
      {
        title: 'Active Tutors',
        value: 45,
        icon: 'person',
        change: 8.2,
        changeType: 'increase',
        color: '#f093fb'
      },
      {
        title: 'Courses',
        value: 32,
        icon: 'book',
        change: -2.1,
        changeType: 'decrease',
        color: '#4facfe'
      },
      {
        title: 'Departments',
        value: 8,
        icon: 'business',
        change: 0,
        changeType: 'increase',
        color: '#43e97b'
      }
    ];
  }

  private loadRecentActivities(): void {
    this.recentActivities = [
      {
        id: 1,
        type: 'student',
        message: 'New student registered: John Doe',
        time: '2 minutes ago',
        icon: 'school'
      },
      {
        id: 2,
        type: 'payment',
        message: 'Payment received: $500 from Sarah Smith',
        time: '15 minutes ago',
        icon: 'payment'
      },
      {
        id: 3,
        type: 'course',
        message: 'New course added: Advanced Mathematics',
        time: '1 hour ago',
        icon: 'book'
      },
      {
        id: 4,
        type: 'tutor',
        message: 'Tutor assigned: Dr. Emily Johnson to Math 101',
        time: '2 hours ago',
        icon: 'person'
      },
      {
        id: 5,
        type: 'student',
        message: 'Student enrollment: 15 new enrollments today',
        time: '3 hours ago',
        icon: 'school'
      }
    ];
  }

  private loadEnrollmentData(): void {
    this.enrollmentData = [
      { label: 'Jan', value: 120, color: '#667eea' },
      { label: 'Feb', value: 145, color: '#667eea' },
      { label: 'Mar', value: 132, color: '#667eea' },
      { label: 'Apr', value: 168, color: '#667eea' },
      { label: 'May', value: 189, color: '#667eea' },
      { label: 'Jun', value: 205, color: '#667eea' }
    ];
  }

  private loadPurchaseData(): void {
    this.purchaseData = [
      { label: 'Jan', value: 12500, color: '#f093fb' },
      { label: 'Feb', value: 15200, color: '#f093fb' },
      { label: 'Mar', value: 13800, color: '#f093fb' },
      { label: 'Apr', value: 18900, color: '#f093fb' },
      { label: 'May', value: 22100, color: '#f093fb' },
      { label: 'Jun', value: 24500, color: '#f093fb' }
    ];
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    // Simulate data change
    this.loadEnrollmentData();
  }

  changePurchasePeriod(period: string): void {
    this.selectedPurchasePeriod = period;
    // Simulate data change
    this.loadPurchaseData();
  }

  getMaxValue(): number {
    return Math.max(...this.enrollmentData.map(d => d.value));
  }

  getPurchaseMaxValue(): number {
    return Math.max(...this.purchaseData.map(d => d.value));
  }

  getBarHeight(value: number): number {
    const max = this.getMaxValue();
    return (value / max) * 100;
  }

  getPurchaseBarHeight(value: number): number {
    const max = this.getPurchaseMaxValue();
    return (value / max) * 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  refreshData(): void {
    // Simulate refresh
    this.loadStats();
    this.loadRecentActivities();
    this.loadEnrollmentData();
    this.loadPurchaseData();
  }
}
