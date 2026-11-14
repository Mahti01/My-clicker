const BUILDINGS=[
  {id:"house",name:"Жилой дом",icon:"🏠",cost:1200,w:2,h:2,description:"Увеличивает жилой фонд города."},
  {id:"shop",name:"Магазин",icon:"🏪",cost:2200,w:2,h:2,description:"Коммерческое здание для торговли."},
  {id:"office",name:"Офис",icon:"🏢",cost:3500,w:2,h:3,description:"Деловое здание для развития экономики."},
  {id:"villa",name:"Вилла",icon:"🏡",cost:4800,w:3,h:2,description:"Премиальное жилое здание."}
];

export class BuildingSystem{
  constructor(state,economy,world){
    this.state=state;this.economy=economy;this.world=world;this.catalog=BUILDINGS;
    this.selected=null;this.placement=false;this.bind();
  }

  bind(){
    this.world.el.addEventListener("pointerdown",e=>{
      if(!this.placement)return;
      if(e.target!==this.world.renderer?.canvas)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const cell=this.world.pointerToCell(e.clientX,e.clientY);
      if(cell&&this.canPlace(cell,this.selected))this.place(cell,this.selected);
      else if(cell)this.world.flashMessage("Здесь нельзя строить");
    },true);
  }

  select(id){
    this.selected=this.catalog.find(x=>x.id===id)||null;
    this.placement=Boolean(this.selected);
    this.world.setBuildMode(this.placement);
    if(this.selected)this.world.showPreview(this.selected);
  }

  cancel(){this.selected=null;this.placement=false;this.world.setBuildMode(false);this.world.clearPreview();}

  canPlace(cell,item){
    if(!item)return false;
    return this.world.areaAvailable(cell,item,this.state.get());
  }

  place(cell,item){
    if(!this.economy.spend(item.cost)){this.world.flashMessage("Недостаточно денег");return;}
    const state=this.state.get();
    const building={id:crypto.randomUUID?.()||("b-"+Date.now()+"-"+Math.random().toString(16).slice(2)),type:item.id,x:cell.x,y:cell.y,w:item.w,h:item.h};
    const buildings=[...(state.world?.buildings||[]),building];
    this.state.set({world:{...state.world,buildings}});
    this.economy.addExperience(25);
    this.world.flashMessage(item.name+" построен");
    this.cancel();
  }

  render(){this.world.renderer?.render();}
  getCatalog(){return this.catalog.map(x=>({...x}));}
}