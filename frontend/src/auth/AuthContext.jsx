// import { createContext, useContext, useMemo, useState } from "react";

// const AuthCtx = createContext(null);
// export function AuthProvider({ children }) {

//   const [user, setUser] = useState(() => {
//     try { return JSON.parse(localStorage.getItem("user") || "null"); }
//     catch { return null; }
//   });
//   const loginAs = (u) => {
//     setUser(u);
//     localStorage.setItem("user", JSON.stringify(u));
//   };
//   const logout = () => { setUser(null); localStorage.removeItem("user"); };
//   const value = useMemo(()=>({ user, loginAs, logout }), [user]);
//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }
// export function useAuth(){ return useContext(AuthCtx); }


import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  // keep tabs in sync (optional but nice)
  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); }
      catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const loginAs = (u) => { setUser(u); localStorage.setItem("user", JSON.stringify(u)); };
  const logout = () => { setUser(null); localStorage.removeItem("user"); };

  const value = useMemo(() => ({ user, loginAs, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(){ return useContext(AuthCtx); }
