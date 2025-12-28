import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NetworkStatus {
  speed: number; // in Mbps
  status: 'online' | 'offline' | 'slow';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService implements OnDestroy {
  private networkStatus$ = new BehaviorSubject<NetworkStatus>({
    speed: 0,
    status: 'online',
    quality: 'excellent'
  });

  private intervalSubscription?: Subscription;
  private onlineHandler?: () => void;
  private offlineHandler?: () => void;
  private connectionChangeHandler?: () => void;

  constructor() {
    this.startMonitoring();
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }

  getNetworkStatus(): Observable<NetworkStatus> {
    return this.networkStatus$.asObservable();
  }

  private startMonitoring(): void {
    // Initial check
    this.checkNetworkSpeed();

    // Check network status every 5 seconds
    this.intervalSubscription = interval(5000).subscribe(() => {
      this.checkNetworkSpeed();
    });

    // Listen to online/offline events
    this.onlineHandler = () => {
      this.checkNetworkSpeed();
    };

    this.offlineHandler = () => {
      this.networkStatus$.next({
        speed: 0,
        status: 'offline',
        quality: 'poor'
      });
    };

    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);

    // Listen to connection changes (if available)
    const connection = this.getNetworkConnection();
    if (connection) {
      this.connectionChangeHandler = () => {
        this.checkNetworkSpeed();
      };
      // NetworkInformation extends EventTarget in runtime, but TypeScript doesn't know this
      (connection as any as EventTarget).addEventListener('change', this.connectionChangeHandler);
    }
  }

  private stopMonitoring(): void {
    // Unsubscribe from interval
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = undefined;
    }

    // Remove event listeners
    if (this.onlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      this.onlineHandler = undefined;
    }

    if (this.offlineHandler) {
      window.removeEventListener('offline', this.offlineHandler);
      this.offlineHandler = undefined;
    }

    const connection = this.getNetworkConnection();
    if (connection && this.connectionChangeHandler) {
      // NetworkInformation extends EventTarget in runtime, but TypeScript doesn't know this
      (connection as any as EventTarget).removeEventListener('change', this.connectionChangeHandler);
      this.connectionChangeHandler = undefined;
    }
  }

  private getNetworkConnection(): NetworkInformation | null {
    // Network Information API - available in modern browsers
    const nav = navigator as any;
    return nav.connection || nav.mozConnection || nav.webkitConnection || null;
  }

  private checkNetworkSpeed(): void {
    if (!navigator.onLine) {
      this.networkStatus$.next({
        speed: 0,
        status: 'offline',
        quality: 'poor'
      });
      return;
    }

    const connection = this.getNetworkConnection();

    if (connection && connection.downlink !== undefined && connection.downlink > 0) {
      // Use Network Information API if available
      const downlink = connection.downlink; // Mbps
      const effectiveType = connection.effectiveType;
      
      let speed = Math.round(downlink * 10) / 10; // Round to 1 decimal
      let quality: NetworkStatus['quality'] = 'excellent';
      let status: NetworkStatus['status'] = 'online';

      // Determine quality based on speed and effective type
      // More realistic thresholds for typical internet connections
      if (effectiveType) {
        // Use effectiveType as primary indicator, but with more lenient thresholds
        switch (effectiveType) {
          case '4g':
            // 4G connections are generally good, only mark as poor if very slow
            if (speed >= 10) {
              quality = 'excellent';
            } else if (speed >= 5) {
              quality = 'good';
            } else if (speed >= 1) {
              quality = 'fair';
            } else {
              quality = 'poor';
              status = 'slow';
            }
            break;
          case '3g':
            // 3G can be acceptable for web apps
            if (speed >= 3) {
              quality = 'good';
            } else if (speed >= 1) {
              quality = 'fair';
            } else {
              quality = 'poor';
              status = speed < 0.5 ? 'slow' : 'online';
            }
            break;
          case '2g':
          case 'slow-2g':
            quality = 'poor';
            status = 'slow';
            break;
          default:
            // Fallback to speed-based calculation with more lenient thresholds
            quality = this.calculateQualityFromSpeed(speed);
            status = speed < 1 ? 'slow' : 'online';
        }
      } else {
        // Fallback to speed-based calculation with more lenient thresholds
        quality = this.calculateQualityFromSpeed(speed);
        status = speed < 1 ? 'slow' : 'online';
      }

      this.networkStatus$.next({ speed, status, quality });
    } else {
      // Fallback: Browser doesn't support Network Information API or downlink is 0/undefined
      // If we're online, assume good connection (most desktop/laptop connections are good)
      // Only show warning if we can actually detect a problem
      this.networkStatus$.next({
        speed: 0, // Unknown speed - can't measure
        status: 'online',
        quality: 'good' // Default to good if online but can't measure (common on desktop)
      });
    }
  }

  private calculateQualityFromSpeed(speed: number): NetworkStatus['quality'] {
    // More realistic thresholds for web applications
    // Most modern connections are at least 5-10 Mbps, which is plenty for web apps
    if (speed >= 10) {
      return 'excellent';
    } else if (speed >= 5) {
      return 'good';
    } else if (speed >= 1) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  getSpeedInMbps(): Observable<number> {
    return this.networkStatus$.pipe(map(status => status.speed));
  }

  getQuality(): Observable<NetworkStatus['quality']> {
    return this.networkStatus$.pipe(map(status => status.quality));
  }
}

