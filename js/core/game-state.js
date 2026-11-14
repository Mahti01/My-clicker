const STORAGE_KEY="city-economy-save-v2";

const STARTER_BUILDINGS=[
  {id:"starter-house-1",type:"house",x:1,y:1,w:2,h:2},
  {id:"starter-shop-1",type:"shop",x:17,y:1,w:2,h:2},
  {id:"starter-office-1",type:"office",x:1,y:7,w:2,h:3},
  {id:"starter-villa-1",type:"villa",x:16,y:7,w:3,h:2},
  {id:"starter-house-2",type:"house",x:7,y:1,w:2,h:2},
  {id:"starter-shop-2",type:"shop",x:11,y:1,w:2,h:2}
];

const STARTER_ROADS=[
  {x:4,y:4},{x:5,y:4},{x:6,y:4},{x:7,y:4},{x:8,y:4},{x:9,y:4},{x:10,y:4},{x:11,y:4},{x:12,y:4},{x:13,y:4},{x:14,y:4},{x:15,y:4},
  {x:4,y:9},{x:5,y:9},{x:6,y:9},{x:7,y:9},{x:8,y:9},{x:9,y:9},{x:10,y:9},{x:11,y:9},{x:12,y:9},{x:13,y:9},{x:14,y:9},{x:15,y:9},
  {x:4,y:5},{x:4,y:6},{x:4,y:7},{x:4,y:8},
  {x:15,y:5},{x:15,y:6},{x:15,y:7},{x:15,y:8}
];

const DEFAULT_STATE=Object.freeze({
  version:1,money:10000,level:1,experience:0,buildings:STARTER_BUILDINGS.length,
  world:{buildings:STARTER_BUILDINGS,roads:STARTER_ROADS,vehicles:[]},
  settings:{sound:true,music:true,graphics:"high"},
  resources:{wood:0,stone:0,food:0}
});

function clone(value){return JSON.parse(JSON.stringify(value));}

function ensureStarterWorld(data){
  const world=data.world||{};
  const hasBuildings=Array.isArray(world.buildings)&&world.buildings.length>0;
  const hasRoads=Array.isArray(world.roads)&&world.roads.length>0;
  if(hasBuildings&&hasRoads)return data;
  return {...data,world:{...world,buildings:clone(STARTER_BUILDINGS),roads:clone(STARTER_ROADS),vehicles:world.vehicles||[]}};
}

export class GameState{
  constructor(){this.data=clone(DEFAULT_STATE);this.listeners=new Set();}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  emit(){for(const listener of this.listeners)listener(this.get());}
  get(){return clone(this.data);}
  set(partial){
    this.data={...this.data,...partial};
    this.data.buildings=this.data.world?.buildings?.length||0;
    this.emit();
  }
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