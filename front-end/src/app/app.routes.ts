import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      // Administration Module
      {
        path: 'administration',
        children: [
          {
            path: 'organisation',
            loadComponent: () => import('./features/modules/administration/organisation/organisation-table/organisation-table.component').then(m => m.OrganisationTableComponent)
          },
          {
            path: 'organisation/create',
            loadComponent: () => import('./features/modules/administration/organisation/organisation.component').then(m => m.OrganisationComponent)
          },
          {
            path: 'organisation/edit/:id',
            loadComponent: () => import('./features/modules/administration/organisation/organisation.component').then(m => m.OrganisationComponent)
          },
          {
            path: 'user-management',
            loadComponent: () => import('./features/modules/administration/user-management/user-table/user-table.component').then(m => m.UserTableComponent)
          },
          {
            path: 'user-management/create',
            loadComponent: () => import('./features/modules/administration/user-management/user-management.component').then(m => m.UserManagementComponent)
          }
        ]
      },
      // Staff Module
      {
        path: 'staff',
        children: [
          {
            path: 'batch',
            loadComponent: () => import('./features/modules/staff/batch/batch-table/batch-table.component').then(m => m.BatchTableComponent)
          },
          {
            path: 'batch/create',
            loadComponent: () => import('./features/modules/staff/batch/batch.component').then(m => m.BatchComponent)
          },
          {
            path: 'batch/edit/:id',
            loadComponent: () => import('./features/modules/staff/batch/batch.component').then(m => m.BatchComponent)
          },
          {
            path: 'course',
            loadComponent: () => import('./features/modules/staff/course/course-table/course-table.component').then(m => m.CourseTableComponent)
          },
          {
            path: 'course/create',
            loadComponent: () => import('./features/modules/staff/course/course.component').then(m => m.CourseComponent)
          },
          {
            path: 'course/edit/:id',
            loadComponent: () => import('./features/modules/staff/course/course.component').then(m => m.CourseComponent)
          },
          {
            path: 'staff',
            loadComponent: () => import('./features/modules/staff/staff/staff.component').then(m => m.StaffComponent)
          },
          {
            path: 'add-staff',
            loadComponent: () => import('./features/forms/add-person/add-person.component').then(m => m.AddPersonComponent)
          }
        ]
      },
      // Student Module
      {
        path: 'student',
        children: [
          {
            path: 'student',
            loadComponent: () => import('./features/tables/person-table/person-table.component').then(m => m.PersonTableComponent)
          },
          {
            path: 'add-student',
            loadComponent: () => import('./features/forms/add-person/add-person.component').then(m => m.AddPersonComponent)
          }
        ]
      },
      // Accounts Module
      {
        path: 'accounts',
        children: [
          {
            path: 'payment',
            loadComponent: () => import('./features/modules/accounts/payment/payment.component').then(m => m.PaymentComponent)
          },
          {
            path: 'payment/create',
            loadComponent: () => import('./features/modules/accounts/payment/payment.component').then(m => m.PaymentComponent)
          },
          {
            path: 'payment/edit/:id',
            loadComponent: () => import('./features/modules/accounts/payment/payment.component').then(m => m.PaymentComponent)
          },
              {
                path: 'receipt',
                loadComponent: () => import('./features/modules/accounts/receipt/receipt.component').then(m => m.ReceiptComponent)
              },
              {
                path: 'receipt/create',
                loadComponent: () => import('./features/modules/accounts/receipt/receipt.component').then(m => m.ReceiptComponent)
              },
              {
                path: 'receipt/edit/:id',
                loadComponent: () => import('./features/modules/accounts/receipt/receipt.component').then(m => m.ReceiptComponent)
              },
          {
            path: 'profit-loss',
            loadComponent: () => import('./features/modules/accounts/profit-loss/profit-loss.component').then(m => m.ProfitLossComponent)
          }
        ]
      },
      // Settings
      {
        path: 'settings',
        loadComponent: () => import('./features/modules/settings/settings.component').then(m => m.SettingsComponent)
      },
      // Profile
      {
        path: 'profile',
        loadComponent: () => import('./features/modules/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
