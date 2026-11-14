export class CameraController{
  constructor(element){
    this.el=element;this.canvas=element.querySelector("#world-canvas");
    this.scale=1;this.x=0;this.y=0;this.minScale=.55;this.maxScale=1.65;
    this.dragging=false;this.lastX=0;this.lastY=0;this.pointers=new Map();this.startDistance=0;this.startScale=1;
    this.bind();requestAnimationFrame(()=>this.center());
  }
  bind(){
    this.el.addEventListener("pointerdown",e=>this.down(e));
    window.addEventListener("pointermove",e=>this.move(e));
    window.addEventListener("pointerup",e=>this.up(e));
    window.addEventListener("pointercancel",e=>this.up(e));
    this.el.addEventListener("wheel",e=>{e.preventDefault();this.zoomAt(e.deltaY<0?1.08:.92,e.clientX,e.clientY)},{passive:false});
  }
  down(e){this.el.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===1){this.dragging=true;this.el.classList.add("is-dragging");this.lastX=e.clientX;this.lastY=e.clientY;}else if(this.pointers.size===2){this.dragging=false;this.startDistance=this.distance();this.startScale=this.scale;}}
  move(e){if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(this.pointers.size===2){const d=this.distance();if(this.startDistance>0){const factor=d/this.startDistance;this.setScale(this.startScale*factor);this.apply();}return;}
    if(this.pointers.size===1&&this.dragging){const dx=e.clientX-this.lastX,dy=e.clientY-this.lastY;this.x+=dx;this.y+=dy;this.lastX=e.clientX;this.lastY=e.clientY;this.clamp();this.apply();}
  }
  up(e){this.pointers.delete(e.pointerId);if(this.pointers.size===0){this.dragging=false;this.el.classList.remove("is-dragging");}}
  distance(){const p=[...this.pointers.values()];return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}
  setScale(value){this.scale=Math.max(this.minScale,Math.min(this.maxScale,value));}
  zoomAt(factor,cx,cy){const old=this.scale;const next=Math.max(this.minScale,Math.min(this.maxScale,old*factor));if(next===old)return;const rect=this.el.getBoundingClientRect();const px=cx-rect.left,py=cy-rect.top;this.x=px-(px-this.x)*(next/old);this.y=py-(py-this.y)*(next/old);this.scale=next;this.clamp();this.apply();}
  center(){const rect=this.el.getBoundingClientRect();this.x=rect.width/2;this.y=rect.height/2;this.apply();}
  clamp(){const rect=this.el.getBoundingClientRect();const mapW=1100,mapH=760;const sw=mapW*this.scale,sh=mapH*this.scale;const margin=80;
    const minX=rect.width-sw-margin,maxX=margin,minY=rect.height-sh-margin,maxY=margin;
    if(sw+margin*2<=rect.width)this.x=(rect.width-sw)/2;else this.x=Math.min(maxX,Math.max(minX,this.x));
    if(sh+margin*2<=rect.height)this.y=(rect.height-sh)/2;else this.y=Math.min(maxY,Math.max(minY,this.y));
  }
  apply(){this.canvas.style.transform=`translate3d(${this.x}px,${this.y}px,0) scale(${this.scale})`;}
}