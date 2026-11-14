export class RoadSystem{
  constructor(state,economy,world){
    this.state=state;this.economy=economy;this.world=world;this.placement=false;this.bind();
  }

  bind(){
    this.world.addEventListener("pointerdown",e=>{
      if(!this.placement)return;
      e.preventDefault();e.stopPropagation();
      const cell=this.world.pointerToCell(e.clientX,e.clientY);
      if(cell)this.place(cell);
    },true);
  }

  select(){this.placement=true;this.world.setBuildMode(true);this.world.showPreview({id:"road",name:"Дорога",icon:"",cost:120,w:1,h:1});}
  cancel(){this.placement=false;this.world.setBuildMode(false);this.world.clearPreview();}

  place(cell){
    const state=this.state.get();
    if(!this.world.isInside(cell.x,cell.y)||this.world.isOccupied(cell.x,cell.y,state)){this.world.flashMessage("Здесь нельзя проложить дорогу");return;}
    if(!this.economy.spend(120)){this.world.flashMessage("Недостаточно денег");return;}
    const roads=[...(state.world?.roads||[]),{x:cell.x,y:cell.y}];
    this.state.set({world:{...state.world,roads}});
    this.economy.addExperience(2);
    this.world.flashMessage("Дорога построена");
  }

  render(){this.world.renderer?.render();}
}