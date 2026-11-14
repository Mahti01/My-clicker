export class WorldController{
  constructor(element,state,renderer){
    this.el=element;this.state=state;this.renderer=renderer;
    this.cellSize=1;this.cols=20;this.rows=14;this.buildMode=false;this.previewItem=null;
    this.layers={message:element.querySelector("#world-message")};
    state.subscribe(()=>this.renderer?.render());
  }

  setSystems(roads,buildings){this.roads=roads;this.buildings=buildings;this.renderer.render();}
  setRenderer(renderer){this.renderer=renderer;}

  setBuildMode(enabled){this.buildMode=enabled;this.el.classList.toggle("build-mode",enabled);}
  isInside(x,y){return x>=0&&y>=0&&x<this.cols&&y<this.rows;}

  isOccupied(x,y,state){
    if((state.world?.roads||[]).some(r=>r.x===x&&r.y===y))return true;
    return (state.world?.buildings||[]).some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  }

  areaAvailable(cell,item,state){
    for(let y=0;y<item.h;y++)for(let x=0;x<item.w;x++){
      const cx=cell.x+x,cy=cell.y+y;
      if(!this.isInside(cx,cy)||this.isOccupied(cx,cy,state))return false;
    }
    return true;
  }

  pointerToCell(clientX,clientY){
    const rect=this.el.getBoundingClientRect(),canvas=this.el.querySelector("#world-canvas");
    const transform=canvas.style.transform.match(/translate3d\(([-\d.]+)px,\s*([-\d.]+)px,0\)\s*scale\(([-\d.]+)\)/);
    const tx=transform?Number(transform[1]):0,ty=transform?Number(transform[2]):0,scale=transform?Number(transform[3]):1;
    const localX=(clientX-rect.left-tx)/scale;
    const localY=(clientY-rect.top-ty)/scale;
    const tw=64,th=32,ox=550,oy=58;
    const dx=(localX-ox)/(tw/2),dy=(localY-oy)/(th/2);
    const x=Math.floor((dx+dy)/2),y=Math.floor((dy-dx)/2);
    return this.isInside(x,y)?{x,y}:null;
  }

  showPreview(item){
    this.clearPreview();this.previewItem=item;this.previewCell=null;
    const move=e=>{
      if(!this.buildMode)return;
      const cell=this.pointerToCell(e.clientX,e.clientY);
      if(!cell){this.previewCell=null;this.renderer.render();return;}
      this.previewCell=cell;this.renderer.preview={item,cell,valid:this.areaAvailable(cell,item,this.state.get())};
      this.renderer.render();
    };
    this._previewMove=move;this.el.addEventListener("pointermove",move);
    this.renderer.preview={item,cell:null,valid:false};this.renderer.render();
  }

  clearPreview(){
    if(this._previewMove)this.el.removeEventListener("pointermove",this._previewMove);
    this._previewMove=null;this.previewItem=null;this.previewCell=null;
    if(this.renderer)this.renderer.preview=null;
    this.renderer?.render();
  }

  flashMessage(text){
    this.layers.message.textContent=text;this.layers.message.classList.add("is-visible");
    clearTimeout(this._messageTimer);
    this._messageTimer=setTimeout(()=>this.layers.message.classList.remove("is-visible"),1400);
  }
}