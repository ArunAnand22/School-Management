import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NetworkStatus {
  speed: number; // in Mbps
  status: 'online' | 'offline' | 'slow';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatus$ = new BehaviorSubject<NetworkStatus>({
    speed: 0,
    status: 'online',
    quality: 'excellent'
  });

  constructor() {
    this.startMonitoring();
  }

  getNetworkStatus(): Observable<NetworkStatus> {
    return this.networkStatus$.asObservable();
  }

  private startMonitoring(): void {
    // Check network status every 5 seconds
    interval(5000).subscribe(() => {
      this.checkNetworkSpeed();
    });

    // Initial check
    this.checkNetworkSpeed();

    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.checkNetworkSpeed();
    });

    window.addEventListener('offline', () => {
      this.networkStatus$.next({
        speed: 0,
        status: 'offline',
        quality: 'poor'
      });
    });
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

    // Simulate network speed check (in real app, you'd use actual network API)
    // For now, we'll use a simulated approach based on connection type
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink || 10; // Mbps
      
      let speed = downlink;
      let quality: NetworkStatus['quality'] = 'excellent';
      let status: NetworkStatus['status'] = 'online';

      // Determine quality based on speed
      if (speed >= 25) {
        quality = 'excellent';
      } else if (speed >= 10) {
        quality = 'good';
      } else if (speed >= 5) {
        quality = 'fair';
      } else {
        quality = 'poor';
        status = 'slow';
      }

      this.networkStatus$.next({ speed, status, quality });
    } else {
      // Fallback: simulate speed check
      this.simulateSpeedCheck();
    }
  }

  private simulateSpeedCheck(): void {
    // Simulate network speed (random between 1-100 Mbps for demo)
    const speed = Math.random() * 100;
    let quality: NetworkStatus['quality'] = 'excellent';
    let status: NetworkStatus['status'] = 'online';

    if (speed >= 25) {
      quality = 'excellent';
    } else if (speed >= 10) {
      quality = 'good';
    } else if (speed >= 5) {
      quality = 'fair';
    } else {
      quality = 'poor';
      status = 'slow';
    }

    this.networkStatus$.next({ speed: Math.round(speed * 10) / 10, status, quality });
  }

  getSpeedInMbps(): Observable<number> {
    return this.networkStatus$.pipe(map(status => status.speed));
  }

  getQuality(): Observable<NetworkStatus['quality']> {
    return this.networkStatus$.pipe(map(status => status.quality));
  }
}

