import { db, isFirebaseConfigured } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  saveToStorage as saveToLocalStorage, 
  loadFromStorage as loadFromLocalStorage 
} from './storage';

// Real-time storage that uses Firebase when configured, localStorage as fallback
export class RealtimeStorage {
  private static listeners: Map<string, Set<(data: any) => void>> = new Map();
  private static unsubscribers: Map<string, Unsubscribe> = new Map();

  // Save data (Firebase + localStorage fallback)
  static async save<T>(key: string, data: T): Promise<void> {
    // Always save to localStorage as backup
    saveToLocalStorage(key, data);

    // If Firebase is configured, save there too
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'portfolio', key), {
          data,
          updatedAt: new Date().toISOString()
        });
        console.log(`🔥 Saved ${key} to Firebase`);
        
        // Notify all listeners
        this.notifyListeners(key, data);
      } catch (error) {
        console.error(`Failed to save ${key} to Firebase:`, error);
        // Fallback to localStorage (already done above)
      }
    } else {
      // Just localStorage - still notify listeners for same-page updates
      this.notifyListeners(key, data);
    }
  }

  // Load data (Firebase with localStorage fallback)
  static async load<T>(key: string, defaultValue: T): Promise<T> {
    // If Firebase is configured, load from there
    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'portfolio', key);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const firebaseData = docSnap.data().data as T;
          console.log(`🔥 Loaded ${key} from Firebase`);
          
          // Update localStorage cache
          saveToLocalStorage(key, firebaseData);
          
          return firebaseData;
        }
      } catch (error) {
        console.error(`Failed to load ${key} from Firebase:`, error);
      }
    }
    
    // Fallback to localStorage
    console.log(`📦 Loaded ${key} from localStorage`);
    return loadFromLocalStorage(key, defaultValue);
  }

  // Subscribe to real-time updates
  static subscribe<T>(
    key: string, 
    defaultValue: T, 
    callback: (data: T) => void
  ): () => void {
    // Add callback to listeners
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // If Firebase is configured, set up real-time listener
    if (isFirebaseConfigured() && db && !this.unsubscribers.has(key)) {
      const docRef = doc(db, 'portfolio', key);
      
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data().data as T;
          console.log(`🔥 Real-time update for ${key}`);
          
          // Update localStorage cache
          saveToLocalStorage(key, data);
          
          // Notify all listeners
          this.notifyListeners(key, data);
        }
      }, (error) => {
        console.error(`Firebase listener error for ${key}:`, error);
      });
      
      this.unsubscribers.set(key, unsubscribe);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        
        // If no more listeners, unsubscribe from Firebase
        if (listeners.size === 0) {
          const unsubscribe = this.unsubscribers.get(key);
          if (unsubscribe) {
            unsubscribe();
            this.unsubscribers.delete(key);
          }
          this.listeners.delete(key);
        }
      }
    };
  }

  // Notify all listeners of data change
  private static notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

