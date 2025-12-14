import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../auth';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      // Temporarily skip authentication - will be implemented when backend is ready
      // Simulate login delay
      setTimeout(() => {
        this.isLoading = false;
        this.toasterService.success('Login successful!', 'Welcome');
        this.router.navigate(['/dashboard']);
      }, 1000);

      // TODO: Uncomment when backend is ready
      // this.authService.login(username, password).subscribe({
      //   next: (response) => {
      //     this.isLoading = false;
      //     this.toasterService.success('Login successful!', 'Welcome');
      //     this.router.navigate(['/dashboard']);
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     // Error handling is done by the interceptor
      //   }
      // });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}

