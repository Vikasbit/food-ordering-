import { createContext, useContext, useState, useEffect } from 'react';
import { authService, isSupabaseConfigured, supabase } from '../lib/supabase';
import { getSavedAddresses, saveAddress } from '../services/savedAddressesService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (session?.user && !sessionError && isMounted) {
            const profile = await authService.getCurrentUser();
            if (isMounted) setUser(profile);
          } else if (isMounted) {
            setUser(null);
          }
        } else {
          const mockUser = await authService.getCurrentUser();
          if (isMounted) setUser(mockUser);
        }
      } catch (err) {
        console.error('Error initializing auth state:', err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();
    setSavedAddresses(getSavedAddresses());

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          if (isMounted) setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || session?.user) {
          try {
            const profile = await authService.getCurrentUser();
            if (isMounted) setUser(profile);
          } catch (e) {
            console.error('Failed to load profile on auth state change:', e);
            if (isMounted) setUser(null);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const usr = await authService.login({ email, password });
    setUser(usr);
    return usr;
  };

  const signUpCustomer = async (details) => {
    const res = await authService.signUpCustomer(details);
    if (isSupabaseConfigured) {
      if (res?.session) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
    } else {
      setUser(res.user);
    }
    return res;
  };

  const signUpSeller = async (details) => {
    const res = await authService.signUpSeller(details);
    if (isSupabaseConfigured) {
      if (res?.session) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
    } else {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const addSavedAddress = (addr) => {
    const updated = saveAddress(addr);
    setSavedAddresses(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        loading,
        savedAddresses,
        login,
        signUpCustomer,
        signUpSeller,
        logout,
        addSavedAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
