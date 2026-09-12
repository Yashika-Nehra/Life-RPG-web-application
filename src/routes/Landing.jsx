import {Link} from "react-router-dom";
import {Panel,useTitle} from "../components/ui.jsx";
export default function Landing(){
 useTitle("EMBERHOLD — A Life RPG");
 return <><a className="skip" href="#main">Skip to content</a><header className="topbar"><div className="shell nav"><Link to="/" className="brand"><b>◆</b> EMBERHOLD</Link><nav><Link to="/enter">Sign in</Link><Link className="btn primary" to="/enter">Begin your record</Link></nav></div></header>
 <main id="main" className="shell">
  <section className="hero"><div><p className="kicker">A ledger for the offline realm</p><h1>Turn real life into an <em>adventure.</em></h1><p className="lede">Study. Train. Code. Read. Build. Each real-world deed becomes immediate XP, crowns, attribute growth and visible progression.</p><div className="actions"><Link className="btn primary" to="/enter">Swear your oath</Link><a className="btn ghost" href="#systems">See the systems</a></div></div>
   <Panel><p className="kicker">The hold's rules</p><div className="rule"><b>XP</b><span>20 / 50 / 100 by difficulty</span></div><div className="rule"><b>Ranks</b><span>Sellsword → Lord Commander</span></div><div className="rule"><b>Stats</b><span>Might · Lore · Craft · Guile</span></div><div className="rule"><b>Persistence</b><span>Server-side account data</span></div></Panel>
  </section>
  <section id="systems" className="section"><p className="kicker">Built to feel alive</p><h2>Not another chore list.</h2><div className="feature-grid">{[
   ["Instant feedback","Earn XP and crowns the moment a deed is fulfilled."],
   ["Long progression","The next level always costs more XP than the last."],
   ["Hearth flame","Consecutive active days become a visible streak."],
   ["Living character","Every deed trains one of four attributes."],
   ["Armoury","Spend earned crowns on themes and badges."],
   ["Tactile interface","Celebratory motion, meters, banners and responsive states."]
  ].map(([a,b])=><Panel key={a}><h3>{a}</h3><p>{b}</p></Panel>)}</div></section>
 </main><footer className="shell footer"><span>EMBERHOLD · The hold keeps count.</span><span>Server-persisted Life RPG</span></footer></>
}