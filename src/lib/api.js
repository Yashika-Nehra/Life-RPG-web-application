export class ApiError extends Error {
  constructor(message,status=0,network=false){ super(message); this.status=status; this.network=network; }
}
async function request(path, options={}){
  let response;
  try {
    response=await fetch("/api"+path,{
      credentials:"include",
      headers:options.body ? {"Content-Type":"application/json"} : undefined,
      ...options,
      body:options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new ApiError("The ravens cannot fly. Check your connection and try again.",0,true);
  }
  if(response.status===204) return null;
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new ApiError(data.error||"Something went wrong.",response.status);
  return data;
}
export const api={
  signup:b=>request("/auth/signup",{method:"POST",body:b}),
  login:b=>request("/auth/login",{method:"POST",body:b}),
  logout:()=>request("/auth/logout",{method:"POST"}),
  me:()=>request("/me"),
  quests:()=>request("/quests"),
  createQuest:b=>request("/quests",{method:"POST",body:b}),
  updateQuest:(id,b)=>request(`/quests/${id}`,{method:"PATCH",body:b}),
  deleteQuest:id=>request(`/quests/${id}`,{method:"DELETE"}),
  completeQuest:id=>request(`/quests/${id}/complete`,{method:"POST"}),
  history:()=>request("/history"),
  armory:()=>request("/armory"),
  buy:id=>request(`/armory/${id}/buy`,{method:"POST"})
};