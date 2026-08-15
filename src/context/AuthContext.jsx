import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/supabase';
import { getSavedAddresses, saveAddress } from '../services/savedAddressesService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);

  useEffect(() => {
    authService.getCurrentUser().then((usr) => {
      setUser(usr);
      setLoading(false);
    });
    setSavedAddresses(getSavedAddresses());
  }, []);

  const login = async (email, password) => {
    const usr = await authService.login({ email, password });
    setUser(usr);
    return usr;
  };

  const signUpCustomer = async (details) => {
    const res = await authService.signUpCustomer(details);
    setUser(res.user);
    return res.user;
  };

  const signUpSeller = async (details) => {
    const res = await authService.signUpSeller(details);
    setUser(res.user);
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
