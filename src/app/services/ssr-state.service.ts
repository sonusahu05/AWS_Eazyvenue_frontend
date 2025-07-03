import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { TransferState, makeStateKey } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SsrStateService {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  /**
   * Store data during SSR and retrieve it on the client
   */
  setState<T>(key: string, data: T): void {
    const stateKey = makeStateKey<T>(key);
    this.transferState.set(stateKey, data);
  }

  /**
   * Get state data (works both on server and client)
   */
  getState<T>(key: string): T | undefined {
    const stateKey = makeStateKey<T>(key);
    return this.transferState.get(stateKey, undefined);
  }

  /**
   * Check if state exists
   */
  hasState(key: string): boolean {
    const stateKey = makeStateKey(key);
    return this.transferState.hasKey(stateKey);
  }

  /**
   * Remove state after it's been used
   */
  removeState(key: string): void {
    const stateKey = makeStateKey(key);
    this.transferState.remove(stateKey);
  }

  /**
   * Execute code only in browser
   */
  onBrowser(callback: () => void): void {
    if (this.isBrowser()) {
      callback();
    }
  }

  /**
   * Execute code only on server
   */
  onServer(callback: () => void): void {
    if (this.isServer()) {
      callback();
    }
  }

  /**
   * Get safe window object (returns null during SSR)
   */
  getWindow(): Window | null {
    return this.isBrowser() ? window : null;
  }

  /**
   * Get safe document object (returns null during SSR)
   */
  getDocument(): Document | null {
    return this.isBrowser() ? document : null;
  }

  /**
   * Get safe localStorage (returns null during SSR)
   */
  getLocalStorage(): Storage | null {
    return this.isBrowser() ? localStorage : null;
  }

  /**
   * Get safe sessionStorage (returns null during SSR)
   */
  getSessionStorage(): Storage | null {
    return this.isBrowser() ? sessionStorage : null;
  }
}
