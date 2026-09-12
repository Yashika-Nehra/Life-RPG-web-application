export const DIFFICULTIES={
  EASY:{xp:20,credits:5,label:"Errand"},
  STANDARD:{xp:50,credits:15,label:"Quest"},
  HARD:{xp:100,credits:35,label:"Crusade"}
};
export const ATTRS=["BODY","MIND","TECH","COOL"];
export const ATTR_LABELS={BODY:"Might",MIND:"Lore",TECH:"Craft",COOL:"Guile"};
export const RANKS=[
  {min:1,name:"SELLSWORD"},
  {min:3,name:"SWORN SHIELD"},
  {min:6,name:"KNIGHT ERRANT"},
  {min:10,name:"LORD COMMANDER"}
];
export const xpForLevel=level=>Math.round(80*Math.pow(level,1.6));
export const rankFor=level=>RANKS.reduce((r,x)=>level>=x.min?x.name:r,"SELLSWORD");
export const progress=(xp,level)=>{
  const need=xpForLevel(level);
  return {into:Math.min(xp,need),need,pct:need?Math.round((Math.min(xp,need)/need)*100):0};
};