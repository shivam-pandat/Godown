// AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    if (token) {
      try {
        return jwtDecode(token);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      try {
        setUser(jwtDecode(token));
      } catch {
        setUser(null);
      }
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, setToken, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

