// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Le Gia Huy
// ID: s3975371

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
  distributionHub?: {
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
    console.log('AuthProvider getUser: Checking localStorage contents...');
    console.log('  - token:', !!localStorage.getItem('token'));
    console.log('  - CUSTOMER:', !!localStorage.getItem('CUSTOMER'));
    console.log('  - VENDOR:', !!localStorage.getItem('VENDOR'));
    console.log('  - SHIPPER:', !!localStorage.getItem('SHIPPER'));

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('AuthProvider getUser: No token found');
      return null;
    }

    // Check for user data in localStorage based on role - use uppercase keys
    const customerData = localStorage.getItem('CUSTOMER');
    const vendorData = localStorage.getItem('VENDOR');
    const shipperData = localStorage.getItem('SHIPPER');

    console.log('AuthProvider getUser: Checking stored user data...', {
      customerData: !!customerData,
      vendorData: !!vendorData,
      shipperData: !!shipperData,
    });

    const userData = customerData || vendorData || shipperData;
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('AuthProvider getUser: Parsed user data:', parsedUser);

      // More lenient validation - just check for essential fields
      if (
        parsedUser &&
        (parsedUser.id || parsedUser._id) &&
        parsedUser.role &&
        (parsedUser.email || parsedUser.username)
      ) {
        // Normalize the user object to ensure consistent id field
        const normalizedUser = {
          ...parsedUser,
          id: parsedUser.id || parsedUser._id,
        };

        console.log(
          'AuthProvider getUser: User validation passed:',
          normalizedUser,
        );
        return normalizedUser;
      } else {
        console.warn(
          'AuthProvider getUser: User validation failed. Missing required fields:',
          {
            hasId: !!(parsedUser.id || parsedUser._id),
            hasRole: !!parsedUser.role,
            hasEmailOrUsername: !!(parsedUser.email || parsedUser.username),
          },
        );
      }
    }

    // If we have a token but no valid user data, clear everything
    console.warn(
      'AuthProvider getUser: Token exists but user data is invalid or missing. Clearing storage.',
    );
    await removeUser();
    return null;
  } catch (error) {
    console.error('AuthProvider getUser: Error parsing user data:', error);
    // If there's an error parsing user data, clear everything
    await removeUser();
    return null;
  }
};

const setUser = async (
  userData: AppUser,
  cookiesMaxAge?: number,
  isRememberMe?: boolean,
): Promise<void> => {
  try {
    console.log('AuthProvider setUser: Storing user data:', userData);

    // Store user data based on role - use consistent capitalization
    const userKey = userData.role; // Use the role as-is: 'CUSTOMER', 'VENDOR', 'SHIPPER'

    console.log('AuthProvider setUser: Storing with key:', userKey);
    localStorage.setItem(userKey, JSON.stringify(userData));

    if (isRememberMe) {
      localStorage.setItem('isRememberMeSession', 'true');
      console.log('AuthProvider setUser: Set remember me session');
    }

    console.log('AuthProvider setUser: User data stored successfully');
  } catch (error) {
    console.error('AuthProvider setUser: Failed to store user data:', error);
    throw new Error('Failed to store user data');
  }
};

const removeUser = async (): Promise<void> => {
  console.log('AuthProvider removeUser: Clearing all user data and token');
  console.trace('AuthProvider removeUser: Called from');
  localStorage.removeItem('token');
  localStorage.removeItem('CUSTOMER');
  localStorage.removeItem('VENDOR');
  localStorage.removeItem('SHIPPER');
  localStorage.removeItem('isRememberMeSession');
  console.log('AuthProvider removeUser: All data cleared');
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

  // Add storage monitoring and debugging
  useEffect(() => {
    console.log('AuthProvider: Setting up storage monitoring...');

    // Store original localStorage methods
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    // Override localStorage methods to add logging
    localStorage.setItem = function (key: string, value: string) {
      if (key === 'token') {
        console.log(
          'localStorage.setItem called for token:',
          value.substring(0, 50) + '...',
        );
        console.trace('Token setItem called from:');
      }
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = function (key: string) {
      if (key === 'token') {
        console.warn('localStorage.removeItem called for token!');
        console.trace('Token removeItem called from:');
      }
      return originalRemoveItem.call(localStorage, key);
    };

    localStorage.clear = function () {
      console.warn('localStorage.clear called!');
      console.trace('localStorage.clear called from:');
      return originalClear.call(localStorage);
    };

    // Cleanup function to restore original methods
    return () => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      localStorage.clear = originalClear;
    };
  }, []);

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
      console.log('AuthProvider: Loading user on mount/reload...');
      setIsLoading(true); // Ensure loading state is true at the start
      try {
        const userData = await getUser();
        console.log('AuthProvider: Retrieved user data:', userData);

        if (userData) {
          console.log(
            'AuthProvider: Setting user session for:',
            userData.role,
            userData.email,
          );
          setUserState(userData);
          setIsAuth(true);
          const rememberMeSession = await getIsRememberMeSession();
          setIsRememberMeSession(rememberMeSession);
          console.log(
            'AuthProvider: Authentication successful, isRememberMe:',
            rememberMeSession,
          );
        } else {
          console.log(
            'AuthProvider: No valid user data found, setting unauthenticated state',
          );
          setUserState(null);
          setIsAuth(false);
          setIsRememberMeSession(false);
          // No need to call removeUser here if getUser implies user is not there
        }
      } catch (error) {
        console.error('AuthProvider: Error loading user:', error);
        setUserState(null);
        setIsAuth(false);
        setIsRememberMeSession(false);
        await removeUser(); // Attempt to clear any lingering cookie on error
      } finally {
        console.log('AuthProvider: User loading completed');
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
    console.log(
      'AuthProvider setUserSession: Starting with userData:',
      userData,
    );
    console.log('AuthProvider setUserSession: cookiesMaxAge:', cookiesMaxAge);

    try {
      const isRememberMe = !!cookiesMaxAge;
      console.log('AuthProvider setUserSession: About to call setUser');

      await setUser(userData, cookiesMaxAge, isRememberMe);
      console.log(
        'AuthProvider setUserSession: setUser completed successfully',
      );

      setUserState(userData);
      setIsAuth(true);
      setIsRememberMeSession(isRememberMe);
      console.log(
        'AuthProvider setUserSession: User session established successfully',
      );
      // resetInactivityTimer will be called by the useEffect due to isAuth change
    } catch (error) {
      console.error('AuthProvider setUserSession: Error occurred:', error);
      console.log(
        'AuthProvider setUserSession: Clearing user state due to error',
      );

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
