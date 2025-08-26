import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

// Constants for inactivity timeout
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_DIALOG_TIMEOUT_MS = 28 * 60 * 1000; // 28 minutes (2 minutes before logout)
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
];

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR' | 'SHIPPER';
  name?: string;
  businessName?: string;
  businessAddress?: string;
  address?: string;
  assignedHub?: {
    _id: string;
    hubName: string;
    hubLocation: string;
  };
  profilePicture?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuth: boolean;
  isLoading: boolean;
  isRememberMeSession: boolean;
  setUserSession: (userData: AppUser, cookiesMaxAge?: number) => Promise<void>;
  logout: (showSuccessToast?: boolean) => Promise<void>;
  showInactivityWarning: boolean;
  setShowInactivityWarning: (show: boolean) => void;
  resetInactivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions for user management
const getUser = async (): Promise<AppUser | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Check for user data in localStorage based on role
    const customerData = localStorage.getItem('Customer');
    const vendorData = localStorage.getItem('Vendor');
    const shipperData = localStorage.getItem('Shipper');

    const userData = customerData || vendorData || shipperData;
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch {
    return null;
  }
};

const setUser = async (
  userData: AppUser,
  cookiesMaxAge?: number,
  isRememberMe?: boolean,
): Promise<void> => {
  try {
    // Store user data based on role
    const userKey =
      userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    localStorage.setItem(userKey, JSON.stringify(userData));

    if (isRememberMe) {
      localStorage.setItem('isRememberMeSession', 'true');
    }
  } catch (error) {
    throw new Error('Failed to store user data');
  }
};

const removeUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('Customer');
  localStorage.removeItem('Vendor');
  localStorage.removeItem('Shipper');
  localStorage.removeItem('isRememberMeSession');
};

const getIsRememberMeSession = async (): Promise<boolean> => {
  return localStorage.getItem('isRememberMeSession') === 'true';
};

const logoutApi = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [isRememberMeSession, setIsRememberMeSession] = useState(false);
  const navigate = useNavigate();

  console.log(
    'AuthProvider rendering, user:',
    user,
    'isAuth:',
    isAuth,
    'isLoading:',
    isLoading,
  );

  const inactivityTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const isAuthRef = useRef<boolean>(false);
  const isRememberMeRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    isAuthRef.current = isAuth;
  }, [isAuth]);

  useEffect(() => {
    isRememberMeRef.current = isRememberMeSession;
  }, [isRememberMeSession]);

  const logout = useCallback(
    async (showSuccessToast: boolean = false) => {
      if (!isAuth) return;

      try {
        setIsLoading(true);
        await Promise.all([logoutApi(), removeUser()]);
      } finally {
        if (inactivityTimerRef.current)
          window.clearTimeout(inactivityTimerRef.current);
        if (warningTimerRef.current)
          window.clearTimeout(warningTimerRef.current);
        setIsLoading(false);
        setUserState(null);
        setIsAuth(false);
        setShowInactivityWarning(false);
        setIsRememberMeSession(false);
        navigate(
          showSuccessToast ? '/auth/login?logout=success' : '/auth/login',
        );
      }
    },
    [
      isAuth,
      navigate,
      setShowInactivityWarning,
      setUserState,
      setIsAuth,
      setIsRememberMeSession,
    ],
  );

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthRef.current || isLoading) return;

    setShowInactivityWarning(false);
    if (inactivityTimerRef.current)
      window.clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);

    // Only show warning for non-remember-me sessions since they're the only ones that will be logged out
    if (!isRememberMeRef.current) {
      warningTimerRef.current = window.setTimeout(() => {
        if (isAuthRef.current && !isRememberMeRef.current) {
          setShowInactivityWarning(true);
        }
      }, WARNING_DIALOG_TIMEOUT_MS);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      if (isAuthRef.current) {
        if (!isRememberMeRef.current) {
          logout(false);
        } else {
          setShowInactivityWarning(false);
        }
      }
    }, INACTIVITY_TIMEOUT_MS);
  }, [isLoading, setShowInactivityWarning, logout]);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true); // Ensure loading state is true at the start
      try {
        const userData = await getUser();
        if (userData) {
          setUserState(userData);
          setIsAuth(true);
          const rememberMeSession = await getIsRememberMeSession();
          setIsRememberMeSession(rememberMeSession);
        } else {
          setUserState(null);
          setIsAuth(false);
          setIsRememberMeSession(false);
          // No need to call removeUser here if getUser implies user is not there
        }
      } catch {
        setUserState(null);
        setIsAuth(false);
        setIsRememberMeSession(false);
        await removeUser(); // Attempt to clear any lingering cookie on error
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();

    return () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isAuth && !isLoading && !showInactivityWarning) {
      // Add event listeners only when authenticated and warning is not shown
      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });
      // Set timers immediately
      resetInactivityTimer();
      return () => {
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        // Only clear timers if user is not authenticated or is loading
        if (!isAuth || isLoading) {
          if (inactivityTimerRef.current)
            window.clearTimeout(inactivityTimerRef.current);
          if (warningTimerRef.current)
            window.clearTimeout(warningTimerRef.current);
        }
      };
    } else if (isAuth && !isLoading && showInactivityWarning) {
      // Remove event listeners but do NOT clear inactivity timer when warning is shown
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    } else {
      // Cleanup if not authenticated
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
      setShowInactivityWarning(false);
    }
    // Only depend on isAuth, isLoading, showInactivityWarning, and resetInactivityTimer
  }, [isAuth, isLoading, showInactivityWarning, resetInactivityTimer]);

  const setUserSession = async (userData: AppUser, cookiesMaxAge?: number) => {
    try {
      const isRememberMe = !!cookiesMaxAge;
      await setUser(userData, cookiesMaxAge, isRememberMe);
      setUserState(userData);
      setIsAuth(true);
      setIsRememberMeSession(isRememberMe);
      // resetInactivityTimer will be called by the useEffect due to isAuth change
    } catch (error) {
      setUserState(null); // Ensure user state is cleared on error
      setIsAuth(false);
      setIsRememberMeSession(false);
      await removeUser();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        isLoading,
        isRememberMeSession,
        setUserSession,
        logout,
        showInactivityWarning,
        setShowInactivityWarning,
        resetInactivityTimer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
