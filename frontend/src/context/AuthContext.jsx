import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchUserStats } from '../apis/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    isAdmin: false,
    isLoading: true, // Start in a loading state
  });

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // This single API call now returns all necessary user info, including their role.
        const response = await fetchUserStats();
        const userData = response.data;
        setAuth({
          isLoggedIn: true,
          isAdmin: userData.role === 'admin', // Check the role directly from the response
          isLoading: false,
        });
      } catch (error) {
        // If any request fails, user is not logged in or not an admin
        setAuth({ isLoggedIn: false, isAdmin: false, isLoading: false });
      }
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {!auth.isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);