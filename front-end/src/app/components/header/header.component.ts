import { Component, EventEmitter, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NetworkService, NetworkStatus } from '../../core/services/network.service';
import { ToasterService } from '../../core/services/toaster.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  networkStatus: NetworkStatus = {
    speed: 0,
    status: 'online',
    quality: 'excellent'
  };
  
  showProfileMenu = false;
  private destroy$ = new Subject<void>();
  private lowSpeedNotified = false;

  constructor(
    private networkService: NetworkService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.networkService.getNetworkStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.networkStatus = status;
        this.checkLowSpeed(status);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-section')) {
      this.showProfileMenu = false;
    }
  }

  private checkLowSpeed(status: NetworkStatus): void {
    // Only show warning for genuinely slow connections (poor quality or slow status)
    // Don't warn for fair/good connections as they're sufficient for web apps
    if ((status.status === 'slow' || status.quality === 'poor') && !this.lowSpeedNotified) {
      const speedText = status.speed > 0 ? `${status.speed} Mbps` : 'unknown speed';
      this.toasterService.warning(
        `Slow network connection detected (${speedText}). Some features may be slower.`,
        'Network Warning'
      );
      this.lowSpeedNotified = true;
    } else if (status.status !== 'slow' && status.quality !== 'poor') {
      this.lowSpeedNotified = false;
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  getNetworkIcon(): string {
    if (this.networkStatus.status === 'offline') {
      return 'wifi_off';
    }
    
    switch (this.networkStatus.quality) {
      case 'excellent':
        return 'wifi';
      case 'good':
        return 'wifi';
      case 'fair':
        return 'signal_wifi_4_bar';
      case 'poor':
        return 'signal_wifi_1_bar';
      default:
        return 'wifi';
    }
  }

  getNetworkColor(): string {
    switch (this.networkStatus.quality) {
      case 'excellent':
        return '#4caf50';
      case 'good':
        return '#8bc34a';
      case 'fair':
        return '#ff9800';
      case 'poor':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  logout(): void {
    // Close profile menu
    this.showProfileMenu = false;
    // Implement logout logic here
    console.log('Logout clicked');
  }
}

