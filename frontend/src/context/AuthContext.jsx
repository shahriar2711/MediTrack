import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const token = data.token;
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token); // { id, role }

    // Fetch full user from /api/protected
    const profileRes = await api.get("/protected");
    const fullUser = profileRes.data.user;

    const userObj = { ...fullUser, role: decoded.role };
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj; // ← role is "admin", "doctor", or "patient"
  };

  const register = async ({ name, email, password, role }) => {
    const endpoint =
      role === "doctor" ? "/auth/register-doctor" : "/auth/register-patient";
    await api.post(endpoint, { name, email, password });
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);