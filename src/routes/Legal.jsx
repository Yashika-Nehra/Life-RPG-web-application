import {Link} from "react-router-dom";
import {useTitle} from "../components/ui.jsx";
export default function Legal({type}){
 const privacy=type==="privacy";useTitle(privacy?"Privacy — EMBERHOLD":"Terms — EMBERHOLD");
 const sections=privacy?[
 ["What we store","Account email, display name, deeds, completion history, progression attributes, inventory and session records are stored server-side to operate the service."],
 ["Why we store it","To authenticate you, synchronize your record across devices, calculate progression and provide the RPG features."],
 ["Cookies","EMBERHOLD uses an HTTP-only session cookie for authentication. The app does not use advertising cookies."],
 ["Sharing","The application does not sell your personal data. A production deployment may use infrastructure providers required to operate the service."],
 ["Deletion","Remove the application database record for an account through the service operator before public launch. Production deployments should expose a verified deletion/contact process."]
 ]:[
 ["The service","EMBERHOLD is a productivity game that converts real-world deeds into RPG progression."],
 ["Your account","Keep your credentials private. One person should use one account. You are responsible for activity under your account."],
 ["Acceptable use","Do not manipulate progression with forged requests, exploits, automation or attempts to access another user's data."],
 ["Your data","Your deeds and progression are associated with your account and are stored on the server."],
 ["Availability","The service may be unavailable during maintenance or infrastructure failures."],
 ["Changes","The service rules may change. A production deployment should publish material changes and an effective date."]
 ];
 return <main className="shell legal"><Link to="/" className="brand">◆ EMBERHOLD</Link><p className="kicker">{privacy?"The private ledger":"The hold's rules"}</p><h1>{privacy?"Privacy policy":"Terms of service"}</h1><p className="muted">Effective September 2026</p>{sections.map(([h,p])=><section key={h}><h2>{h}</h2><p>{p}</p></section>)}<Link to="/">← Back to the hold</Link></main>
}