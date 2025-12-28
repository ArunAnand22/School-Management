import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OrganisationTableComponent } from './features/modules/administration/organisation/organisation-table/organisation-table.component';
import { OrganisationComponent } from './features/modules/administration/organisation/organisation.component';
import { UserTableComponent } from './features/modules/administration/user-management/user-table/user-table.component';
import { UserManagementComponent } from './features/modules/administration/user-management/user-management.component';
import { BatchTableComponent } from './features/modules/staff/batch/batch-table/batch-table.component';
import { BatchComponent } from './features/modules/staff/batch/batch.component';
import { CourseTableComponent } from './features/modules/staff/course/course-table/course-table.component';
import { CourseComponent } from './features/modules/staff/course/course.component';
import { StaffComponent } from './features/modules/staff/staff/staff.component';
import { AddPersonComponent } from './features/forms/add-person/add-person.component';
import { PersonTableComponent } from './features/tables/person-table/person-table.component';
import { PaymentComponent } from './features/modules/accounts/payment/payment.component';
import { ReceiptComponent } from './features/modules/accounts/receipt/receipt.component';
import { ProfitLossComponent } from './features/modules/accounts/profit-loss/profit-loss.component';
import { SettingsComponent } from './features/modules/settings/settings.component';
import { ProfileComponent } from './features/modules/profile/profile.component';

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
            component: OrganisationTableComponent
          },
          {
            path: 'organisation/create',
            component: OrganisationComponent
          },
          {
            path: 'organisation/edit/:id',
            component: OrganisationComponent
          },
          {
            path: 'user-management',
            component: UserTableComponent
          },
          {
            path: 'user-management/create',
            component: UserManagementComponent
          }
        ]
      },
      // Staff Module
      {
        path: 'staff',
        children: [
          {
            path: 'batch',
            component: BatchTableComponent
          },
          {
            path: 'batch/create',
            component: BatchComponent
          },
          {
            path: 'batch/edit/:id',
            component: BatchComponent
          },
          {
            path: 'course',
            component: CourseTableComponent
          },
          {
            path: 'course/create',
            component: CourseComponent
          },
          {
            path: 'course/edit/:id',
            component: CourseComponent
          },
          {
            path: 'staff',
            component: StaffComponent
          },
          {
            path: 'add-staff',
            component: AddPersonComponent
          }
        ]
      },
      // Student Module
      {
        path: 'student',
        children: [
          {
            path: 'student',
            component: PersonTableComponent
          },
          {
            path: 'add-student',
            component: AddPersonComponent
          }
        ]
      },
      // Accounts Module
      {
        path: 'accounts',
        children: [
          {
            path: 'payment',
            component: PaymentComponent
          },
          {
            path: 'payment/create',
            component: PaymentComponent
          },
          {
            path: 'payment/edit/:id',
            component: PaymentComponent
          },
          {
            path: 'receipt',
            component: ReceiptComponent
          },
          {
            path: 'receipt/create',
            component: ReceiptComponent
          },
          {
            path: 'receipt/edit/:id',
            component: ReceiptComponent
          },
          {
            path: 'profit-loss',
            component: ProfitLossComponent
          }
        ]
      },
      // Settings
      {
        path: 'settings',
        component: SettingsComponent
      },
      // Profile
      {
        path: 'profile',
        component: ProfileComponent
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
