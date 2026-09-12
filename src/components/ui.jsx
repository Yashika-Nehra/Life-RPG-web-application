import {useEffect,useRef} from "react";

export function useTitle(title){
  useEffect(()=>{
    document.title=title;
  },[title]);
}

export function Panel({children,className="",...props}){
  return (
    <section className={`panel ${className}`} {...props}>
      <i className="corner a"/>
      <i className="corner b"/>
      <i className="corner c"/>
      <i className="corner d"/>
      {children}
    </section>
  );
}

export function Meter({value,max,label,segments=20}){
  const pct=max?Math.min(100,Math.round(value/max*100)):0;
  const filled=Math.round(pct/100*segments);

  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className="meter-track">
        {Array.from(
          {length:segments},
          (_,i)=><i key={i} className={i<filled?"on":""}/>
        )}
      </div>
    </div>
  );
}

export function Modal({title,onClose,children}){
  const ref=useRef(null);

  useEffect(()=>{
    // Focus the first input only when the modal opens
    ref.current?.querySelector("input,select,button")?.focus();

    const fn=e=>{
      if(e.key==="Escape"){
        onClose();
      }
    };

    document.addEventListener("keydown",fn);

    return()=>{
      document.removeEventListener("keydown",fn);
    };
  },[]);

  return (
    <div
      className="overlay"
      onMouseDown={e=>{
        if(e.target===e.currentTarget){
          onClose();
        }
      }}
    >
      <div
        ref={ref}
        className="panel modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>

          <button
            className="btn ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function Field({id,label,error,children}){
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {children}
      {error&&<small className="error">{error}</small>}
    </label>
  );
}

export function Skeleton({height=20}){
  return (
    <span
      className="skeleton"
      style={{height}}
    />
  );
}