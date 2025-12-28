import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  constructor(
    private themeService: ThemeService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    // Initialize theme on app start
    this.themeService.getCurrentTheme();

    // Show loader on route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Small delay to ensure smooth transition
        setTimeout(() => {
          this.loaderService.hide();
        }, 100);
      }
    });
  }
}
