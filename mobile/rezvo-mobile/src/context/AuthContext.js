import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'business' or 'client'
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('rezvo_token');
      const savedUser = await AsyncStorage.getItem('rezvo_user');
      const savedUserType = await AsyncStorage.getItem('rezvo_user_type');
      
      if (!token) {
        setUser(null);
        setUserType(null);
        setLoading(false);
        return;
      }

      // Try to validate token with server
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        setUserType(savedUserType || 'business');
        await AsyncStorage.setItem('rezvo_user', JSON.stringify(userData));
      } catch (error) {
        // Token invalid - try to use cached user
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setUserType(savedUserType || 'business');
        } else {
          await AsyncStorage.removeItem('rezvo_token');
          await AsyncStorage.removeItem('rezvo_user');
          await AsyncStorage.removeItem('rezvo_user_type');
          setUser(null);
          setUserType(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password, type = 'business') => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    
    await AsyncStorage.setItem('rezvo_token', access_token);
    await AsyncStorage.setItem('rezvo_user', JSON.stringify(userData));
    await AsyncStorage.setItem('rezvo_user_type', type);
    
    setUser(userData);
    setUserType(type);
    return userData;
  };

  const signup = async (email, password, businessName, type = 'business') => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      business_name: businessName,
    });
    const { access_token, user: userData } = response.data;
    
    await AsyncStorage.setItem('rezvo_token', access_token);
    await AsyncStorage.setItem('rezvo_user', JSON.stringify(userData));
    await AsyncStorage.setItem('rezvo_user_type', type);
    
    setUser(userData);
    setUserType(type);
    return userData;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('rezvo_token');
    await AsyncStorage.removeItem('rezvo_user');
    await AsyncStorage.removeItem('rezvo_user_type');
    setUser(null);
    setUserType(null);
  };

  const switchUserType = async (type) => {
    await AsyncStorage.setItem('rezvo_user_type', type);
    setUserType(type);
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await AsyncStorage.setItem('rezvo_user', JSON.stringify(userData));
  };

  const value = {
    user,
    userType,
    loading,
    login,
    signup,
    logout,
    checkAuth,
    updateUser,
    switchUserType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
