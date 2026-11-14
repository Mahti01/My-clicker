const STORAGE_KEY="city-economy-save-v3";

const STARTER_BUILDINGS=[
  {id:"starter-house-1",type:"house",x:2,y:2,w:2,h:2},
  {id:"starter-house-2",type:"house",x:6,y:2,w:2,h:2},
  {id:"starter-shop-1",type:"shop",x:12,y:2,w:2,h:2},
  {id:"starter-shop-2",type:"shop",x:16,y:2,w:2,h:2},
  {id:"starter-office-1",type:"office",x:2,y:8,w:2,h:3},
  {id:"starter-house-3",type:"house",x:6,y:8,w:2,h:2},
  {id:"starter-shop-3",type:"shop",x:12,y:8,w:2,h:2},
  {id:"starter-villa-1",type:"villa",x:16,y:8,w:3,h:2},
  {id:"starter-house-4",type:"house",x:4,y:11,w:2,h:2},
  {id:"starter-office-2",type:"office",x:9,y:11,w:2,h:3}
];

const STARTER_ROADS=[
  ...Array.from({length:14},(_,i)=>({x:i+3,y:5})),
  ...Array.from({length:14},(_,i)=>({x:i+3,y:10})),
  ...Array.from({length:6},(_,i)=>({x:3,y:i+5})),
  ...Array.from({length:6},(_,i)=>({x:16,y:i+5})),
  ...Array.from({length:8},(_,i)=>({x:7+i,y:5})),
  ...Array.from({length:8},(_,i)=>({x:7+i,y:10}))
];

const DEFAULT_STATE=Object.freeze({
  version:3,money:10000,level:1,experience:0,buildings:STARTER_BUILDINGS.length,
  world:{buildings:STARTER_BUILDINGS,roads:STARTER_ROADS,vehicles:[]},
  settings:{sound:true,music:true,graphics:"high"},
  resources:{wood:0,stone:0,food:0}
});

function clone(value){return JSON.parse(JSON.stringify(value));}

function ensureStarterWorld(data){
  const world=data.world||{};
  const buildings=Array.isArray(world.buildings)?world.buildings:[];
  const roads=Array.isArray(world.roads)?world.roads:[];
  if(buildings.length>=STARTER_BUILDINGS.length&&roads.length>=STARTER_ROADS.length)return data;

  const buildingKeys=new Set(buildings.map(b=>b.x+","+b.y));
  const mergedBuildings=[...buildings];
  for(const b of STARTER_BUILDINGS){
    if(!buildingKeys.has(b.x+","+b.y))mergedBuildings.push(clone(b));
  }

  const roadKeys=new Set(roads.map(r=>r.x+","+r.y));
  const mergedRoads=[...roads];
  for(const road of STARTER_ROADS){
    if(!roadKeys.has(road.x+","+road.y))mergedRoads.push(clone(road));
  }

  return {...data,world:{...world,buildings:mergedBuildings,roads:mergedRoads,vehicles:world.vehicles||[]}};
}

export class GameState{
  constructor(){this.data=clone(DEFAULT_STATE);this.listeners=new Set();}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  emit(){for(const listener of this.listeners)listener(this.get());}
  get(){return clone(this.data);}
  set(partial){this.data={...this.data,...partial};this.data.buildings=this.data.world?.buildings?.length||0;this.emit();}
  addMoney(amount){if(!Number.isFinite(amount))return false;this.data.money=Math.max(0,this.data.money+amount);this.emit();return true;}
  spendMoney(amount){if(!Number.isFinite(amount)||amount<0||this.data.money<amount)return false;this.data.money-=amount;this.emit();return true;}
  addExperience(amount){this.data.experience=Math.max(0,this.data.experience+amount);const threshold=this.data.level*100;if(this.data.experience>=threshold){this.data.experience-=threshold;this.data.level+=1;}this.emit();}
  reset(){this.data=clone(DEFAULT_STATE);this.emit();}
  save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(this.data));}
  load(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;
      const parsed=JSON.parse(raw);
      this.data=ensureStarterWorld({...clone(DEFAULT_STATE),...parsed,
        world:{...DEFAULT_STATE.world,...parsed.world},
        settings:{...DEFAULT_STATE.settings,...parsed.settings},
        resources:{...DEFAULT_STATE.resources,...parsed.resources}});
      this.data.buildings=this.data.world.buildings.length;
      this.emit();return true;
    }catch(error){console.error("Save load error",error);return false;}
  }
  hasSave(){return Boolean(localStorage.getItem(STORAGE_KEY));}
  clearSave(){localStorage.removeItem(STORAGE_KEY);}
}