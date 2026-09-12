import {createContext,useCallback,useContext,useEffect,useState} from "react";
import {api} from "../lib/api.js";
const C=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.me().then(d=>setUser(d.user)).catch(()=>setUser(null)).finally(()=>setLoading(false));},[]);
  const login=async b=>{const d=await api.login(b);setUser(d.user);return d};
  const signup=async b=>{const d=await api.signup(b);setUser(d.user);return d};
  const logout=async()=>{await api.logout().catch(()=>{});setUser(null)};
  const patch=useCallback(u=>setUser(prev=>prev?{...prev,...u}:u),[]);
  return <C.Provider value={{user,loading,login,signup,logout,patch}}>{children}</C.Provider>;
}
export const useAuth=()=>useContext(C);