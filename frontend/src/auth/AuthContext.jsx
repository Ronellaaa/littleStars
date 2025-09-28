import { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  // TODO: plug real login; for now read from localStorage
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });
  const loginAs = (u) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };
  const logout = () => { setUser(null); localStorage.removeItem("user"); };
  const value = useMemo(()=>({ user, loginAs, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export function useAuth(){ return useContext(AuthCtx); }
