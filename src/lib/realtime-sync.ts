// Real-time synchronization system for instant updates
// Broadcasts changes from admin to frontend immediately

export class RealtimeSync {
  private static instance: RealtimeSync;
  private updateCallbacks: Map<string, Set<() => void>> = new Map();

  private constructor() {
    this.setupListeners();
  }

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  private setupListeners() {
    // Listen for storage changes (cross-tab updates)
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('portfolio_')) {
        this.triggerUpdate('storage');
      }
    });

    // Listen for custom events
    window.addEventListener('portfolioDataUpdated', () => {
      this.triggerUpdate('custom');
    });

    // Listen for focus (when user returns to tab)
    window.addEventListener('focus', () => {
      this.triggerUpdate('focus');
    });
  }

  subscribe(key: string, callback: () => void) {
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, new Set());
    }
    this.updateCallbacks.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.updateCallbacks.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  triggerUpdate(source: string = 'manual') {
    console.log(`🔄 Real-time update triggered from: ${source}`);
    
    // Trigger all subscribed callbacks
    this.updateCallbacks.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('Error in update callback:', error);
        }
      });
    });

    // Also dispatch the legacy event for compatibility
    window.dispatchEvent(new CustomEvent('portfolioDataUpdated', {
      detail: { source, timestamp: Date.now() }
    }));
  }

  // Force immediate sync
  forceSyncNow() {
    this.triggerUpdate('force');
  }
}

// Export singleton instance
export const realtimeSync = RealtimeSync.getInstance();

// Helper hook for React components
export const useRealtimeSync = (key: string, callback: () => void) => {
  const sync = RealtimeSync.getInstance();
  
  // Subscribe on mount, unsubscribe on unmount
  if (typeof window !== 'undefined') {
    const unsubscribe = sync.subscribe(key, callback);
    return unsubscribe;
  }
  
  return () => {};
};

