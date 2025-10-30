// Update detection system for cross-device synchronization
// Detects when content has changed and forces reload

export class UpdateDetector {
  private static instance: UpdateDetector;
  private lastCheckTime: number = 0;
  private checkInterval: number = 60000; // Check every 1 minute

  private constructor() {
    this.startPeriodicCheck();
    this.setupVisibilityListener();
  }

  static getInstance(): UpdateDetector {
    if (!UpdateDetector.instance) {
      UpdateDetector.instance = new UpdateDetector();
    }
    return UpdateDetector.instance;
  }

  private startPeriodicCheck() {
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  private setupVisibilityListener() {
    // Check for updates when user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👀 Tab focused - checking for updates...');
        this.checkForUpdates();
      }
    });

    // Check when window gets focus
    window.addEventListener('focus', () => {
      console.log('🔍 Window focused - checking for updates...');
      this.checkForUpdates();
    });
  }

  private async checkForUpdates() {
    const now = Date.now();
    
    // Don't check too frequently
    if (now - this.lastCheckTime < 30000) {
      return;
    }

    this.lastCheckTime = now;

    try {
      // Get the deployed version by fetching a timestamp file
      // Since we're on GitHub Pages, we check the HTML file's last modified
      const response = await fetch(window.location.origin + window.location.pathname, {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const lastModified = response.headers.get('Last-Modified');
      const storedVersion = localStorage.getItem('app_version');
      const currentVersion = lastModified || new Date().toISOString();

      if (storedVersion && storedVersion !== currentVersion) {
        console.log('🚀 New version detected!');
        console.log('Old:', storedVersion);
        console.log('New:', currentVersion);
        
        // Show update notification
        this.notifyUpdate();
        
        // Update stored version
        localStorage.setItem('app_version', currentVersion);
        
        // Force reload data
        window.dispatchEvent(new CustomEvent('forceDataReload'));
        window.dispatchEvent(new CustomEvent('portfolioDataUpdated'));
      } else if (!storedVersion) {
        // First time visit, store version
        localStorage.setItem('app_version', currentVersion);
      }
    } catch (error) {
      console.warn('Could not check for updates:', error);
    }
  }

  private notifyUpdate() {
    // Show a subtle notification
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
      ">
        ✨ Content updated! Refreshing...
      </div>
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Force immediate check
  forceCheck() {
    this.lastCheckTime = 0;
    this.checkForUpdates();
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  const detector = UpdateDetector.getInstance();
  
  // Export for manual checks
  (window as any).checkForUpdates = () => detector.forceCheck();
}

export const updateDetector = UpdateDetector.getInstance();

