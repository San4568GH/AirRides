import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile on app startup
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:4000/profile', {
          credentials: 'include',
        });
        if (response.ok) {
          const profileData = await response.json();
          setUserInfo(profileData);
        } else {
          // If profile fetch fails, clear stored user info
          setUserInfo(null);
          localStorage.removeItem('userInfo');
        }
      } catch (error) {
        console.error('Error fetching profile on startup:', error);
        // Clear stored user info on error
        setUserInfo(null);
        localStorage.removeItem('userInfo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Update localStorage when userInfo changes
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
