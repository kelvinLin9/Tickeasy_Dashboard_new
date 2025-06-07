import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "tickeasy_token";
const USER_KEY = "tickeasy_user";

// 擴充 user 型別，支援 avatar 欄位
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name?: string; avatar?: string } | null>(null);

  // 初始化時從 localStorage 讀取
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    setToken(t);
    setUser(u ? JSON.parse(u) : null);
  }, []);

  // 登入
  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("https://tickeasy-team-backend.onrender.com/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, message: data.message || "登入失敗" };
    }
  }, []);

  // 註冊
  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch("https://tickeasy-team-backend.onrender.com/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (data.status === "success") {
      // 註冊成功自動登入
      return await login(email, password);
    } else {
      return { success: false, message: data.message || "註冊失敗" };
    }
  }, [login]);

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { token, user, login, register, logout };
} 