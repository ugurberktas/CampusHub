import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', {
      username: email,
      password: password
    });

    const fetchedToken = response.data.access_token || response.data.token;
    const fetchedUser = response.data.user || response.data;

    localStorage.setItem('token', fetchedToken);
    localStorage.setItem('user', JSON.stringify(fetchedUser));

    setToken(fetchedToken);
    setUser(fetchedUser);

    return fetchedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
