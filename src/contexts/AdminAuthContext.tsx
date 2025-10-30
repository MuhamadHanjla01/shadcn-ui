import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
  AuthError
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { AuthState, LoginCredentials, AdminUser } from '@/types/admin';

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'Hanjla.Muhamad@admin.com',
  password: 'Hanjla.admin',
  user: {
    id: 'default-admin-001',
    email: 'Hanjla.Muhamad@admin.com',
    name: 'Hanjla Muhamad',
    role: 'admin' as const
  }
};

interface AdminAuthContextType {
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  authMode: 'firebase' | 'local';
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

// Convert Firebase User to AdminUser
const convertFirebaseUser = (firebaseUser: User): AdminUser => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
    role: 'admin',
    avatar: firebaseUser.photoURL || undefined
  };
};

// Local authentication functions
const localLogin = (email: string, password: string): AdminUser | null => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return DEFAULT_ADMIN.user;
  }
  return null;
};

const saveLocalSession = (user: AdminUser, rememberMe: boolean) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('admin_user', JSON.stringify(user));
  storage.setItem('admin_token', 'local-auth-token');
  if (rememberMe) {
    localStorage.setItem('admin_remember_me', 'true');
  }
};

const loadLocalSession = (): { user: AdminUser; token: string } | null => {
  const rememberMe = localStorage.getItem('admin_remember_me') === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  
  const userStr = storage.getItem('admin_user');
  const token = storage.getItem('admin_token');
  
  if (userStr && token) {
    try {
      const user = JSON.parse(userStr) as AdminUser;
      return { user, token };
    } catch {
      return null;
    }
  }
  return null;
};

const clearLocalSession = () => {
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_remember_me');
  sessionStorage.removeItem('admin_user');
  sessionStorage.removeItem('admin_token');
};

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authMode] = useState<'firebase' | 'local'>(
    isFirebaseConfigured() && auth ? 'firebase' : 'local'
  );

  useEffect(() => {
    if (authMode === 'firebase' && auth) {
      // Firebase authentication mode
      const rememberMe = localStorage.getItem('admin_remember_me') === 'true';

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          const adminUser = convertFirebaseUser(firebaseUser);
          
          setAuthState({
            user: adminUser,
            token,
            isAuthenticated: true,
            rememberMe
          });
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            rememberMe: false
          });
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local authentication mode
      const session = loadLocalSession();
      if (session) {
        const rememberMe = localStorage.getItem('admin_remember_me') === 'true';
        setAuthState({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          rememberMe
        });
      }
      setIsLoading(false);
    }
  }, [authMode]);

  const login = async (credentials: LoginCredentials) => {
    if (authMode === 'firebase' && auth) {
      // Firebase authentication
      try {
        const persistence = credentials.rememberMe 
          ? browserLocalPersistence 
          : browserSessionPersistence;
        
        await setPersistence(auth, persistence);

        const userCredential = await signInWithEmailAndPassword(
          auth,
          credentials.email,
          credentials.password
        );

        const token = await userCredential.user.getIdToken();
        const adminUser = convertFirebaseUser(userCredential.user);

        if (credentials.rememberMe) {
          localStorage.setItem('admin_remember_me', 'true');
        } else {
          localStorage.removeItem('admin_remember_me');
        }

        setAuthState({
          user: adminUser,
          token,
          isAuthenticated: true,
          rememberMe: credentials.rememberMe || false
        });
      } catch (error) {
        const authError = error as AuthError;
        let errorMessage = 'Authentication failed. Please try again.';
        
        switch (authError.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
        }
        
        throw new Error(errorMessage);
      }
    } else {
      // Local authentication
      const user = localLogin(credentials.email, credentials.password);
      
      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const token = 'local-auth-token';
      saveLocalSession(user, credentials.rememberMe || false);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        rememberMe: credentials.rememberMe || false
      });
    }
  };

  const logout = async () => {
    try {
      if (authMode === 'firebase' && auth) {
        await signOut(auth);
        localStorage.removeItem('admin_remember_me');
      } else {
        clearLocalSession();
      }
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        rememberMe: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ auth: authState, login, logout, isLoading, authMode }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};