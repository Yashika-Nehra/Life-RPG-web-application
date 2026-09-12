import {Component} from "react";
export default class ErrorBoundary extends Component{
  state={error:false};
  static getDerivedStateFromError(){return {error:true}};
  render(){return this.state.error?<div className="center-page"><div className="panel narrow"><p className="kicker">The hold is shaken</p><h1>Something went wrong.</h1><p>Reload the page. Your server-side record was not deleted.</p><button className="btn primary" onClick={()=>location.reload()}>Reload</button></div></div>:this.props.children}
}