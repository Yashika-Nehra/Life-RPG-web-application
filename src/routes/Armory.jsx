import {useEffect,useState} from "react";
import {api} from "../lib/api.js";
import {useAuth} from "../context/AuthContext.jsx";
import {useToast} from "../context/ToastContext.jsx";
import {Panel,Skeleton,useTitle} from "../components/ui.jsx";
const colours={emberhold:"#d4a934",ironhold:"#9fb4c7",verdant:"#7fb069"};
export default function Armory(){
 useTitle("Armoury — EMBERHOLD");const {user,patch}=useAuth();const toast=useToast();const [items,setItems]=useState(null);const [err,setErr]=useState("");
 const load=()=>{setErr("");setItems(null);api.armory().then(d=>setItems(d.items)).catch(e=>setErr(e.message))};useEffect(load,[]);
 function theme(id){document.documentElement.dataset.theme=id;localStorage.setItem("emberhold-theme",id)}
 async function buy(item){const old=user.credits;patch({credits:old-item.cost});try{const d=await api.buy(item.id);patch(d.user);setItems(x=>x.map(i=>i.id===item.id?{...i,owned:true}:i));if(item.kind==="THEME")theme(item.id);toast({title:`${item.name} acquired`,body:"Your reward has been added to the account."})}catch(e){patch({credits:old});toast({tone:"bad",title:"Purchase failed",body:e.message})}}
 return <div className="page"><div className="page-head"><div><p className="kicker">Spend what you earned</p><h1>Armoury</h1></div><strong className="coins">{user?.credits} CR</strong></div>{err&&<Panel className="error-strip"><span>{err}</span><button className="btn" onClick={load}>Retry</button></Panel>}<div className="shop">{items===null&&!err?[1,2,3,4,5,6].map(x=><Panel key={x}><Skeleton height={180}/></Panel>):items?.map(i=><Panel key={i.id}><div className="item-art" style={i.kind==="THEME"?{background:colours[i.id]||"var(--line)"}:{}}>{i.kind==="BADGE"?"◆":" "}</div><p className="kicker">{i.kind==="THEME"?"Hold colours":"Honour mark"}</p><h2>{i.name}</h2><p className="muted">{i.description}</p><div className="shop-bottom"><b>{i.cost} CR</b>{i.owned?<span className="owned">OWNED</span>:<button className="btn primary" disabled={user.credits<i.cost} onClick={()=>buy(i)}>Buy</button>}</div></Panel>)}</div></div>
}