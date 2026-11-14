export class WorldController{
  constructor(element,state){
    this.el=element;this.state=state;this.cellSize=55;this.cols=20;this.rows=14;
    this.map=element.querySelector(".world__map");
    this.layers={roads:element.querySelector("#roads-layer"),buildings:element.querySelector("#buildings-layer"),preview:element.querySelector("#build-preview"),message:element.querySelector("#world-message")};
    this.buildMode=false;this.previewItem=null;
    state.subscribe(()=>{this.renderRoads?.();this.renderBuildings?.();});
  }
  setSystems(roads,buildings){this.renderRoads=()=>roads.render();this.renderBuildings=()=>buildings.render();roads.render();buildings.render();}
  setBuildMode(enabled){this.buildMode=enabled;this.el.classList.toggle("build-mode",enabled);}
  isInside(x,y){return x>=0&&y>=0&&x<this.cols&&y<this.rows;}
  isOccupied(x,y,state){
    if((state.world?.roads||[]).some(r=>r.x===x&&r.y===y))return true;
    return (state.world?.buildings||[]).some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
  }
  pointerToCell(clientX,clientY){
    const rect=this.el.getBoundingClientRect();
    const canvas=this.el.querySelector("#world-canvas");
    const transform=canvas.style.transform.match(/translate3d\\(([-\\d.]+)px,\\s*([-\\d.]+)px,0\\) scale\\(([-\\d.]+)\\)/);
    const tx=transform?Number(transform[1]):0,ty=transform?Number(transform[2]):0,scale=transform?Number(transform[3]):1;
    const localX=(clientX-rect.left-tx)/scale;
    const localY=(clientY-rect.top-ty)/scale;
    const mapLeft=canvas.clientWidth/2-550,mapTop=canvas.clientHeight/2-380;
    const x=Math.floor((localX-mapLeft)/this.cellSize),y=Math.floor((localY-mapTop)/this.cellSize);
    return this.isInside(x,y)?{x,y}:null;
  }
  showPreview(item){
    this.previewItem=item;this.layers.preview.innerHTML="";
    const el=document.createElement("div");el.className="build-preview";el.textContent=item.icon;
    el.style.width=(item.w*this.cellSize-8)+"px";el.style.height=(item.h*this.cellSize-8)+"px";
    this.layers.preview.appendChild(el);
    const move=e=>{if(!this.buildMode)return;const c=this.pointerToCell(e.clientX,e.clientY);if(!c)return;
      el.style.left=(c.x*this.cellSize+4)+"px";el.style.top=(c.y*this.cellSize+4)+"px";
      const ok=!this.isOccupied(c.x,c.y,this.state.get())&&this.isInside(c.x+item.w-1,c.y+item.h-1);
      el.classList.toggle("is-invalid",!ok);
    };
    this._previewMove=move;this.el.addEventListener("pointermove",move);
  }
  clearPreview(){if(this._previewMove)this.el.removeEventListener("pointermove",this._previewMove);this.layers.preview.innerHTML="";this.previewItem=null;}
  flashMessage(text){this.layers.message.textContent=text;this.layers.message.classList.add("is-visible");clearTimeout(this._messageTimer);this._messageTimer=setTimeout(()=>this.layers.message.classList.remove("is-visible"),1400);}
}
