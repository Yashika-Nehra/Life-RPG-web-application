import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {api} from "../lib/api.js";
import {useAuth} from "../context/AuthContext.jsx";
import {ATTRS,ATTR_LABELS,progress} from "../lib/rpg.js";
import {Meter,Panel,Skeleton,useTitle} from "../components/ui.jsx";
export default function Dashboard(){
 useTitle("Ledger — EMBERHOLD"); const {user,patch}=useAuth(); const [history,setHistory]=useState(null); const [error,setError]=useState("");
 const load=()=>{setError("");Promise.all([api.me(),api.history()]).then(([m,h])=>{patch(m.user);setHistory(h.entries)}).catch(e=>setError(e.message))}; useEffect(load,[]);
 if(!user)return null; const p=progress(user.xpIntoLevel,user.level);
 return <div className="page"><div className="page-head"><div><p className="kicker">Your character record</p><h1>The Ledger</h1></div><Link className="btn primary" to="/app/quests">+ Post deed</Link></div>
 {error&&<Panel className="error-strip"><span>{error}</span><button className="btn" onClick={load}>Retry</button></Panel>}
 <div className="stats">{[["Level",user.level],["Rank",user.rank],["Crowns",`${user.credits} CR`],["Hearth",`${user.streak} day${user.streak===1?"":"s"}`]].map(([a,b])=><Panel key={a}><p className="kicker">{a}</p><strong className="stat-value">{b}</strong></Panel>)}</div>
 <div className="two-col"><Panel><p className="kicker">Next ascent</p><h2>Level {user.level+1}</h2><p className="muted">{p.into} / {p.need} XP</p><Meter value={p.into} max={p.need} label="Experience to next level"/><div className="meter-label"><span>Progress</span><b>{p.pct}%</b></div></Panel>
 <Panel><p className="kicker">Attributes</p>{ATTRS.map(a=><div className="attr" key={a}><span>{ATTR_LABELS[a]}</span><Meter value={user.attributes?.[a]||0} max={100} label={`${ATTR_LABELS[a]} attribute`} segments={10}/><b>{user.attributes?.[a]||0}</b></div>)}</Panel></div>
 <Panel className="history"><div className="panel-title"><h2>Recent deeds</h2><Link to="/app/quests">Deed board →</Link></div>{history===null?<><Skeleton/><Skeleton/><Skeleton/></>:history.length?history.slice(0,8).map(h=><div className="history-row" key={h.id}><span>{h.questName}</span><small>{ATTR_LABELS[h.category]}</small><b>+{h.xp} XP</b><time>{new Date(h.completedAt).toLocaleDateString()}</time></div>):<p className="empty">No deeds yet. Your first entry awaits.</p>}</Panel>
 </div>
}