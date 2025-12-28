import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { App } from './app';
import { HttpInterceptorService } from './core/interceptors/http.interceptor';
import { routes } from './app.routes';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoaderComponent } from './components/loader/loader.component';

// Features
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/modules/profile/profile.component';
import { SettingsComponent } from './features/modules/settings/settings.component';
import { StaffComponent } from './features/modules/staff/staff/staff.component';
import { ProfitLossComponent } from './features/modules/accounts/profit-loss/profit-loss.component';

// Administration
import { OrganisationComponent } from './features/modules/administration/organisation/organisation.component';
import { OrganisationTableComponent } from './features/modules/administration/organisation/organisation-table/organisation-table.component';
import { UserManagementComponent } from './features/modules/administration/user-management/user-management.component';
import { UserTableComponent } from './features/modules/administration/user-management/user-table/user-table.component';

// Staff
import { BatchComponent } from './features/modules/staff/batch/batch.component';
import { BatchTableComponent } from './features/modules/staff/batch/batch-table/batch-table.component';
import { CourseComponent } from './features/modules/staff/course/course.component';
import { CourseTableComponent } from './features/modules/staff/course/course-table/course-table.component';

// Student
import { PersonTableComponent } from './features/tables/person-table/person-table.component';
import { AddPersonComponent } from './features/forms/add-person/add-person.component';

// Accounts
import { PaymentComponent } from './features/modules/accounts/payment/payment.component';
import { PaymentTableComponent } from './features/modules/accounts/payment/payment-table/payment-table.component';
import { ReceiptComponent } from './features/modules/accounts/receipt/receipt.component';
import { ReceiptTableComponent } from './features/modules/accounts/receipt/receipt-table/receipt-table.component';

@NgModule({
  declarations: [
    App,
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    LoaderComponent,
    LoginComponent,
    DashboardComponent,
    ProfileComponent,
    SettingsComponent,
    StaffComponent,
    ProfitLossComponent,
    OrganisationComponent,
    OrganisationTableComponent,
    UserManagementComponent,
    UserTableComponent,
    BatchComponent,
    BatchTableComponent,
    CourseComponent,
    CourseTableComponent,
    PersonTableComponent,
    AddPersonComponent,
    PaymentComponent,
    PaymentTableComponent,
    ReceiptComponent,
    ReceiptTableComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true
    })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }

