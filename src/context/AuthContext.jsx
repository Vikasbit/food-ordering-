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
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
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
        if (session?.user) {
          const profile = await authService.getCurrentUser();
          if (isMounted) setUser(profile);
        } else {
          if (isMounted) setUser(null);
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
      const profile = await authService.getCurrentUser();
      setUser(profile || (res.user ? {
        id: res.user.id,
        email: res.user.email,
        role: 'customer',
        full_name: details.fullName
      } : null));
    } else {
      setUser(res.user);
    }
    return res;
  };

  const signUpSeller = async (details) => {
    const res = await authService.signUpSeller(details);
    if (isSupabaseConfigured) {
      const profile = await authService.getCurrentUser();
      setUser(profile || (res.user ? {
        id: res.user.id,
        email: res.user.email,
        role: 'seller',
        full_name: details.fullName || details.ownerName
      } : null));
    } else {
      setUser(res.user);
    }
    return res;
  };

  const resendConfirmationEmail = async (email) => {
    return await authService.resendConfirmationEmail(email);
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
        resendConfirmationEmail,
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
