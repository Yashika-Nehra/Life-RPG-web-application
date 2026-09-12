import {createContext,useCallback,useContext,useRef,useState} from "react";
const C=createContext(null);
export function ToastProvider({children}){
  const [items,setItems]=useState([]), next=useRef(0);
  const push=useCallback(t=>{
    const id=++next.current;
    setItems(x=>[...x,{id,tone:"good",...t}]);
    setTimeout(()=>setItems(x=>x.filter(y=>y.id!==id)),4200);
  },[]);
  return <C.Provider value={push}>{children}<div className="toasts" aria-live="polite">{items.map(t=>
    <div className={`toast ${t.tone==="bad"?"bad":""}`} key={t.id}>
      <button className="toast-close" onClick={()=>setItems(x=>x.filter(y=>y.id!==t.id))} aria-label="Dismiss">×</button>
      <strong>{t.title}</strong>{t.body&&<span>{t.body}</span>}
    </div>)}</div></C.Provider>;
}
export const useToast=()=>useContext(C);