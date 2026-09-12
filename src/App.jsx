import {Navigate,Route,Routes} from "react-router-dom";
import {useAuth} from "./context/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Landing from "./routes/Landing.jsx";
import Enter from "./routes/Enter.jsx";
import AppLayout from "./routes/AppLayout.jsx";
import Dashboard from "./routes/Dashboard.jsx";
import Quests from "./routes/Quests.jsx";
import Armory from "./routes/Armory.jsx";
import Legal from "./routes/Legal.jsx";
function Guard({children}){const {user,loading}=useAuth();if(loading)return <div className="center-page"><span className="skeleton" style={{width:"80%",height:180}}/></div>;return user?children:<Navigate to="/enter" replace/>}
export default function App(){return <ErrorBoundary><Routes>
  <Route path="/" element={<Landing/>}/><Route path="/enter" element={<Enter/>}/>
  <Route path="/terms" element={<Legal type="terms"/>}/><Route path="/privacy" element={<Legal type="privacy"/>}/>
  <Route path="/app" element={<Guard><AppLayout/></Guard>}><Route index element={<Dashboard/>}/><Route path="quests" element={<Quests/>}/><Route path="armory" element={<Armory/>}/></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></ErrorBoundary>}