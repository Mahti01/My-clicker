export class RoadSystem{
  constructor(state,economy,world){
    this.state=state;this.economy=economy;this.world=world;this.placement=false;this.bind();this.render();
  }
  bind(){
    this.world.addEventListener("pointerdown",e=>{
      if(!this.placement)return;
      e.preventDefault();e.stopPropagation();
      const cell=this.world.pointerToCell(e.clientX,e.clientY);
      if(cell)this.place(cell);
    },true);
  }
  select(){this.placement=true;this.world.setBuildMode(true);this.world.showPreview({id:"road",name:"Дорога",icon:"🛣️",cost:120,w:1,h:1});}
  cancel(){this.placement=false;this.world.setBuildMode(false);this.world.clearPreview();}
  place(cell){
    const state=this.state.get();
    if(!this.world.isInside(cell.x,cell.y)||this.world.isOccupied(cell.x,cell.y,state)){this.world.flashMessage("Здесь нельзя проложить дорогу");return;}
    if(!this.economy.spend(120)){this.world.flashMessage("Недостаточно денег");return;}
    const roads=[...(state.world?.roads||[])];
    if(roads.some(r=>r.x===cell.x&&r.y===cell.y)){this.world.flashMessage("Дорога уже есть");return;}
    roads.push({x:cell.x,y:cell.y});
    this.state.set({world:{...state.world,roads}});
    this.economy.addExperience(2);
    this.render();
  }
  render(){
    const layer=this.world.layers.roads;layer.innerHTML="";
    const roads=this.state.get().world?.roads||[];
    const has=(x,y)=>roads.some(r=>r.x===x&&r.y===y);
    for(const r of roads){
      const el=document.createElement("div");
      const n=has(r.x,r.y-1),e=has(r.x+1,r.y),s=has(r.x,r.y+1),w=has(r.x-1,r.y);
      el.className="world-road-cell";
      el.dataset.connections=[n?"n":"",e?"e":"",s?"s":"",w?"w":""].filter(Boolean).join(" ");
      el.style.left=(r.x*this.world.cellSize)+"px";
      el.style.top=(r.y*this.world.cellSize)+"px";
      el.innerHTML='<span class="road-surface"></span><span class="road-mark road-mark--n"></span><span class="road-mark road-mark--e"></span><span class="road-mark road-mark--s"></span><span class="road-mark road-mark--w"></span>';
      layer.appendChild(el);
    }
  }
}