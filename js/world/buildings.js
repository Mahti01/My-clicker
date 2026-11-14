const BUILDINGS=[
  {id:"house",name:"Жилой дом",icon:"🏠",cost:1200,w:2,h:2,description:"Увеличивает жилой фонд города."},
  {id:"shop",name:"Магазин",icon:"🏪",cost:2200,w:2,h:2,description:"Коммерческое здание для будущей торговли."},
  {id:"office",name:"Офис",icon:"🏢",cost:3500,w:2,h:3,description:"Деловое здание для развития экономики."},
  {id:"villa",name:"Вилла",icon:"🏡",cost:4800,w:3,h:2,description:"Премиальное жилое здание."}
];

export class BuildingSystem{
  constructor(state,economy,world){
    this.state=state;this.economy=economy;this.world=world;this.catalog=BUILDINGS;
    this.selected=null;this.placement=false;this.preview=null;this.bind();
    this.render();
  }
  bind(){
    this.world.addEventListener("pointerdown",e=>{
      if(!this.placement)return;
      e.preventDefault();e.stopPropagation();
      const cell=this.world.pointerToCell(e.clientX,e.clientY);
      if(!cell)return;
      if(this.canPlace(cell,this.selected)){this.place(cell,this.selected);}else this.world.flashMessage("Здесь нельзя строить");
    },true);
  }
  select(id){
    this.selected=this.catalog.find(x=>x.id===id)||null;
    this.placement=Boolean(this.selected);
    this.world.setBuildMode(this.placement);
    this.world.showPreview(this.selected);
  }
  cancel(){this.selected=null;this.placement=false;this.world.setBuildMode(false);this.world.clearPreview();}
  canPlace(cell,item){
    if(!item)return false;
    const state=this.state.get();
    for(let y=0;y<item.h;y++)for(let x=0;x<item.w;x++){
      const cx=cell.x+x,cy=cell.y+y;
      if(!this.world.isInside(cx,cy)||this.world.isOccupied(cx,cy,state))return false;
    }
    return true;
  }
  place(cell,item){
    if(!this.economy.spend(item.cost)){this.world.flashMessage("Недостаточно денег");return;}
    const state=this.state.get();
    const building={id:crypto.randomUUID?.()||("b-"+Date.now()+"-"+Math.random().toString(16).slice(2)),type:item.id,x:cell.x,y:cell.y,w:item.w,h:item.h};
    this.state.set({buildings:[...(state.world?.buildings||[]),building]});
    this.economy.addExperience(25);
    this.world.flashMessage(item.name+" построен");
    this.cancel();
  }
  render(){
    const layer=this.world.layers.buildings;
    layer.innerHTML="";
    const state=this.state.get();
    for(const b of state.world?.buildings||[]){
      const item=this.catalog.find(x=>x.id===b.type);if(!item)continue;
      const el=document.createElement("div");
      el.className="world-building";
      el.style.left=((b.x+b.w/2)*this.world.cellSize)+"px";
      el.style.top=((b.y+b.h/2)*this.world.cellSize)+"px";
      el.style.width=(b.w*this.world.cellSize-8)+"px";
      el.style.height=(b.h*this.world.cellSize-8)+"px";
      el.innerHTML=`<span class="world-building__roof"></span><span class="world-building__icon">${item.icon}</span><span class="world-building__label">${item.name}</span>`;
      layer.appendChild(el);
    }
  }
  getCatalog(){return this.catalog.map(x=>({...x}));}
}
