import {Link,NavLink,Outlet,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {useState} from "react";
export default function AppLayout(){
 const {user,logout}=useAuth(); const nav=useNavigate(); const [open,setOpen]=useState(false);
 return <div className="app-shell"><a className="skip" href="#main">Skip to content</a><aside className={open?"sidebar open":"sidebar"}><Link to="/" className="brand">◆ EMBERHOLD</Link><button className="mobile-close" onClick={()=>setOpen(false)}>Close</button><NavLink end to="/app" onClick={()=>setOpen(false)}>Ledger</NavLink><NavLink to="/app/quests" onClick={()=>setOpen(false)}>Deeds</NavLink><NavLink to="/app/armory" onClick={()=>setOpen(false)}>Armoury</NavLink><div className="side-bottom"><span className="user-mini">{user?.displayName}<small>{user?.rank}</small></span><button className="btn ghost" onClick={async()=>{await logout();nav("/")}}>Ride out</button></div></aside><div className="mobile-bar"><button className="btn ghost" onClick={()=>setOpen(true)}>Menu</button><span className="brand">◆ EMBERHOLD</span></div><main id="main" className="main"><Outlet/></main></div>
}