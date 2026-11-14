export class CityRenderer{
  constructor(canvas,state){
    this.canvas=canvas;
    this.ctx=canvas.getContext("2d",{alpha:false});
    this.state=state;
    this.cols=20;this.rows=14;
    this.tileW=64;this.tileH=32;
    this.originX=550;this.originY=48;
    this.cars=[];this.preview=null;
    this.resize();
    window.addEventListener("resize",()=>this.resize());
  }

  resize(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    this.dpr=dpr;
    this.canvas.width=1100*dpr;this.canvas.height=760*dpr;
    this.canvas.style.width="1100px";this.canvas.style.height="760px";
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.render();
  }

  iso(x,y,z=0){
    return{x:this.originX+(x-y)*this.tileW/2,y:this.originY+(x+y)*this.tileH/2-z};
  }

  poly(points,fill,stroke=null,line=1){
    const c=this.ctx;c.beginPath();
    points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
    c.closePath();c.fillStyle=fill;c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
  }

  diamond(x,y,fill,stroke=null){
    const p=this.iso(x,y);
    this.poly([{x:p.x,y:p.y-this.tileH/2},{x:p.x+this.tileW/2,y:p.y},{x:p.x,y:p.y+this.tileH/2},{x:p.x-this.tileW/2,y:p.y}],fill,stroke);
  }

  shadow(x,y,w,h){
    const c=this.ctx;c.save();c.fillStyle="rgba(28,38,30,.20)";
    c.beginPath();c.ellipse(x,y,w,h,0,0,Math.PI*2);c.fill();c.restore();
  }

  drawTerrain(){
    const c=this.ctx;
    c.fillStyle="#6f896c";c.fillRect(0,0,1100,760);
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const shade=(x+y)%2?"#76906f":"#728b6b";
      this.diamond(x,y,shade,"rgba(255,255,255,.055)");
    }
    for(let i=0;i<70;i++){
      const x=(i*173)%1050+25,y=(i*97)%690+35;
      c.fillStyle="rgba(255,255,255,.035)";c.beginPath();c.arc(x,y,1.2,0,Math.PI*2);c.fill();
    }
  }

  drawRoads(roads){
    const set=new Set(roads.map(r=>r.x+","+r.y));
    const has=(x,y)=>set.has(x+","+y);
    const c=this.ctx;

    for(const r of roads){
      this.diamond(r.x,r.y,"#3e4448","rgba(255,255,255,.10)");
      const p=this.iso(r.x+.5,r.y+.5,1);
      c.save();
      c.strokeStyle="rgba(232,235,220,.34)";
      c.lineWidth=2;
      const edge=16;
      if(!has(r.x,r.y-1)){c.beginPath();c.moveTo(p.x-edge,p.y-this.tileH/2+3);c.lineTo(p.x,p.y-edge/2);c.stroke();}
      if(!has(r.x-1,r.y)){c.beginPath();c.moveTo(p.x-edge,p.y+this.tileH/2-3);c.lineTo(p.x,p.y+edge/2);c.stroke();}
      c.restore();

      c.save();
      c.strokeStyle="rgba(245,209,126,.82)";
      c.lineWidth=2.5;
      c.setLineDash([9,7]);
      c.beginPath();
      c.moveTo(p.x,p.y);
      c.lineTo(p.x+(has(r.x+1,r.y)?this.tileW/2:0),p.y+(has(r.x+1,r.y)?0:0));
      c.stroke();
      if(has(r.x,r.y+1)){c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y+this.tileH/2);c.stroke();}
      c.restore();
    }
  }

  drawPlaza(){
    const c=this.ctx;
    const a=this.iso(8,5,2),b=this.iso(12,5,2),d=this.iso(8,9,2),e=this.iso(12,9,2);
    this.shadow((a.x+e.x)/2,(a.y+e.y)/2+8,120,35);
    this.poly([a,b,e,d],"#cfc5b3","#9e9483",2);
    const inset=0.35;
    const ia=this.iso(8+inset,5+inset,3),ib=this.iso(12-inset,5+inset,3),id=this.iso(8+inset,9-inset,3),ie=this.iso(12-inset,9-inset,3);
    this.poly([ia,ib,ie,id],"#e1dacb");
    const f=this.iso(10,7,14);
    c.save();
    c.fillStyle="#f2eee4";c.beginPath();c.ellipse(f.x,f.y+4,43,17,0,0,Math.PI*2);c.fill();
    c.fillStyle="#86c9d8";c.beginPath();c.ellipse(f.x,f.y+5,27,10,0,0,Math.PI*2);c.fill();
    c.fillStyle="#d5f0f3";c.beginPath();c.ellipse(f.x,f.y-7,5,18,0,0,Math.PI*2);c.fill();
    c.strokeStyle="#9bbdc4";c.lineWidth=2;c.stroke();
    c.restore();
  }

  buildingHeight(type){return type==="office"?92:type==="villa"?66:type==="shop"?58:54;}

  drawBuilding(b){
    const c=this.ctx,h=this.buildingHeight(b.type);
    const tl=this.iso(b.x,b.y),tr=this.iso(b.x+b.w,b.y),br=this.iso(b.x+b.w,b.y+b.h),bl=this.iso(b.x,b.y+b.h);
    const T={tl:{x:tl.x,y:tl.y-h},tr:{x:tr.x,y:tr.y-h},br:{x:br.x,y:br.y-h},bl:{x:bl.x,y:bl.y-h}};
    const centerX=(T.tl.x+T.br.x)/2;
    const centerY=(T.tl.y+T.br.y)/2;
    this.shadow(centerX,Math.max(tl.y,br.y)+4,b.w*28,b.h*9);

    const palette={
      house:["#d6a77d","#b88460","#e9cfac","#99694b"],
      shop:["#c5ced9","#929eac","#e0e5ea","#687581"],
      office:["#8ea8bf","#607b94","#b8cbd9","#4f687b"],
      villa:["#d1c2a6","#ae9879","#eadfc9","#876f56"]
    }[b.type]||["#d0b18e","#ad8d6d","#e4cfb1","#86694f"];

    this.poly([T.tl,T.bl,bl,tl],palette[1],"rgba(30,35,35,.25)");
    this.poly([T.br,T.bl,bl,br],palette[0],"rgba(30,35,35,.25)");
    this.poly([T.tr,T.br,br,tr],palette[1],"rgba(30,35,35,.25)");
    this.poly([T.tl,T.tr,T.br,T.bl],palette[2],"rgba(255,255,255,.40)");

    c.save();
    c.fillStyle=palette[3];
    c.beginPath();
    c.moveTo(T.tl.x-6,T.tl.y-4);c.lineTo(T.tr.x+6,T.tr.y-4);
    c.lineTo(centerX,Math.min(T.tl.y,T.tr.y,T.bl.y,T.br.y)-18);
    c.lineTo(T.bl.x-6,T.bl.y-4);c.closePath();c.fill();
    c.restore();

    this.drawWindows(b,T);
    this.drawDoor(b,T);
    this.drawSign(b,T);
  }

  drawWindows(b,T){
    const c=this.ctx;
    const count=b.type==="office"?5:b.w>=3?3:2;
    const windowW=b.type==="office"?12:14;
    const windowH=b.type==="office"?18:14;
    for(let i=0;i<count;i++){
      const t=(i+.5)/count;
      const x=T.tl.x+(T.tr.x-T.tl.x)*t;
      const y=T.tl.y+(T.tr.y-T.tl.y)*t+9;
      c.fillStyle=b.type==="office"?"#466d86":"#557783";
      c.fillRect(x-windowW/2,y,windowW,windowH);
      c.strokeStyle="rgba(255,255,255,.38)";c.lineWidth=1;c.strokeRect(x-windowW/2,y,windowW,windowH);
      c.strokeStyle="rgba(255,255,255,.25)";c.beginPath();c.moveTo(x,y);c.lineTo(x,y+windowH);c.stroke();
    }
  }

  drawDoor(b,T){
    const c=this.ctx,x=(T.tl.x+T.tr.x)/2,y=Math.max(T.bl.y,T.br.y)-28;
    c.fillStyle=b.type==="shop"?"#4c6670":"#6b5547";
    c.fillRect(x-7,y,14,24);
    c.fillStyle="#d7c28c";c.beginPath();c.arc(x+4,y+12,1.7,0,Math.PI*2);c.fill();
  }

  drawSign(b,T){
    const c=this.ctx;
    const labels={house:"ЖИЛОЙ ДОМ",shop:"МАГАЗИН",office:"ОФИС",villa:"ВИЛЛА"};
    c.save();c.font="700 10px -apple-system,BlinkMacSystemFont,sans-serif";c.textAlign="center";
    c.fillStyle="rgba(44,39,32,.78)";c.fillText(labels[b.type]||"", (T.tl.x+T.br.x)/2, Math.min(T.tl.y,T.tr.y)+7);c.restore();
  }

  drawTree(x,y,variant=0){
    const p=this.iso(x,y);this.shadow(p.x,p.y+8,17,6);
    const c=this.ctx;c.save();
    c.fillStyle="#74513b";c.fillRect(p.x-3,p.y-23,6,23);
    c.fillStyle=variant?"#315f43":"#3e7048";c.beginPath();c.arc(p.x,p.y-38,19,0,Math.PI*2);c.fill();
    c.fillStyle=variant?"#477b50":"#568957";
    c.beginPath();c.arc(p.x-12,p.y-31,14,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.x+12,p.y-31,14,0,Math.PI*2);c.fill();
    c.restore();
  }

  drawLamp(x,y){
    const p=this.iso(x,y),c=this.ctx;c.save();
    c.strokeStyle="#665846";c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-27);c.stroke();
    c.fillStyle="#f4d993";c.beginPath();c.arc(p.x,p.y-30,5,0,Math.PI*2);c.fill();
    c.fillStyle="rgba(244,217,147,.18)";c.beginPath();c.arc(p.x,p.y-30,13,0,Math.PI*2);c.fill();
    c.restore();
  }

  drawCar(car){
    const p=this.iso(car.x,car.y,8),c=this.ctx;c.save();
    c.translate(p.x,p.y);c.rotate(car.angle);
    c.fillStyle="rgba(0,0,0,.25)";c.beginPath();c.ellipse(0,8,16,5,0,0,Math.PI*2);c.fill();
    const body=car.type===1?"#d8ad55":car.type===2?"#718ba3":"#d36f68";
    c.fillStyle=body;c.beginPath();c.roundRect(-15,-9,30,16,5);c.fill();
    c.fillStyle="#b9d5dc";c.beginPath();c.roundRect(-8,-7,13,7,2);c.fill();
    c.fillStyle="#20252a";c.beginPath();c.arc(-10,7,3,0,Math.PI*2);c.arc(10,7,3,0,Math.PI*2);c.fill();
    c.restore();
  }

  drawPreview(){
    const p=this.preview;if(!p?.cell)return;
    const c=this.ctx,item=p.item,x=p.cell.x,y=p.cell.y,w=item.w,h=item.h;
    const a=this.iso(x,y,3),b=this.iso(x+w,y,3),d=this.iso(x,y+h,3),e=this.iso(x+w,y+h,3);
    c.save();c.globalAlpha=.5;
    this.poly([a,b,e,d],p.valid?"#e1c38b":"#df8585");
    c.strokeStyle=p.valid?"#f4dda9":"#f09d9d";c.lineWidth=3;c.setLineDash([8,6]);
    c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.lineTo(e.x,e.y);c.lineTo(d.x,d.y);c.closePath();c.stroke();
    c.restore();
  }

  render(){
    const state=this.state.get(),c=this.ctx;
    c.clearRect(0,0,1100,760);
    this.drawTerrain();
    this.drawRoads(state.world?.roads||[]);
    this.drawPlaza();

    const buildings=[...(state.world?.buildings||[])].sort((a,b)=>(a.x+a.y+a.h)-(b.x+b.y+b.h));
    for(const b of buildings)this.drawBuilding(b);

    const trees=[[1.3,1.2,0],[5,1.2,1],[9.5,1.2,0],[15,1.2,1],[18.5,4,0],[1.5,6.5,1],[18.5,7,1],[2,11.8,0],[7,12.2,1],[13,12,0],[18,12,1]];
    for(const [x,y,v] of trees)this.drawTree(x,y,v);

    const lamps=[[3.2,4.4],[6.2,4.4],[9.2,4.4],[12.2,4.4],[15.2,4.4],[3.2,10.4],[6.2,10.4],[9.2,10.4],[12.2,10.4],[15.2,10.4],[3.5,7],[16.5,7]];
    for(const [x,y] of lamps)this.drawLamp(x,y);

    for(const car of this.cars)this.drawCar(car);
    this.drawPreview();
  }

  setCars(cars){this.cars=cars;this.render();}
}