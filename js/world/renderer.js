export class CityRenderer{
  constructor(canvas,state){
    this.canvas=canvas;this.ctx=canvas.getContext("2d",{alpha:false});
    this.state=state;this.cols=20;this.rows=14;
    this.tileW=64;this.tileH=32;this.originX=550;this.originY=58;
    this.cars=[];
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
    return {x:this.originX+(x-y)*this.tileW/2,y:this.originY+(x+y)*this.tileH/2-z};
  }

  poly(points,fill,stroke=null,line=1){
    const c=this.ctx;c.beginPath();
    points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));
    c.closePath();c.fillStyle=fill;c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
  }

  diamond(x,y,fill,stroke=null){
    const p=this.iso(x,y);
    this.poly([
      {x:p.x,y:p.y-this.tileH/2},{x:p.x+this.tileW/2,y:p.y},
      {x:p.x,y:p.y+this.tileH/2},{x:p.x-this.tileW/2,y:p.y}
    ],fill,stroke);
  }

  shadow(cx,cy,w,h){
    const c=this.ctx;c.save();c.fillStyle="rgba(0,0,0,.18)";c.beginPath();
    c.ellipse(cx,cy,w,h,0,0,Math.PI*2);c.fill();c.restore();
  }

  drawTerrain(){
    const c=this.ctx;
    c.fillStyle="#71896a";c.fillRect(0,0,1100,760);
    for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
      const shade=((x+y)%2===0)?"#78916f":"#738b69";
      this.diamond(x,y,shade,"rgba(255,255,255,.06)");
    }
    const corners=[this.iso(0,0),this.iso(this.cols,0),this.iso(this.cols,this.rows),this.iso(0,this.rows)];
    this.poly(corners,"rgba(0,0,0,.03)");
  }

  drawPlaza(){
    const c=this.ctx;
    const a=this.iso(8,5),b=this.iso(12,5),d=this.iso(8,9),e=this.iso(12,9);
    this.poly([{x:a.x,y:a.y-4},{x:b.x,y:b.y-4},{x:e.x,y:e.y-4},{x:d.x,y:d.y-4}],"#b9ad98","#9b907f",3);
    this.poly([{x:a.x,y:a.y-2},{x:b.x,y:b.y-2},{x:e.x,y:e.y-2},{x:d.x,y:d.y-2}],"#d8d0bf");
    const f=this.iso(10,7,12);
    c.save();c.fillStyle="#e8e2d6";c.beginPath();c.ellipse(f.x,f.y,42,17,0,0,Math.PI*2);c.fill();
    c.fillStyle="#8fc8d6";c.beginPath();c.ellipse(f.x,f.y+2,25,10,0,0,Math.PI*2);c.fill();
    c.fillStyle="#c7e7ed";c.beginPath();c.ellipse(f.x,f.y-8,5,18,0,0,Math.PI*2);c.fill();
    c.restore();
  }

  drawRoads(roads){
    const has=(x,y)=>roads.some(r=>r.x===x&&r.y===y);
    for(const r of roads){
      this.diamond(r.x,r.y,"#3f4548","rgba(255,255,255,.10)");
      const p=this.iso(r.x+.5,r.y+.5,1);
      const c=this.ctx;c.save();c.strokeStyle="rgba(238,205,132,.72)";c.lineWidth=2;c.setLineDash([7,6]);
      const dirs=[];if(has(r.x,r.y-1))dirs.push([0,-this.tileH/2]);if(has(r.x+1,r.y))dirs.push([this.tileW/2,0]);
      if(has(r.x,r.y+1))dirs.push([0,this.tileH/2]);if(has(r.x-1,r.y))dirs.push([-this.tileW/2,0]);
      if(dirs.length===0)dirs.push([0,0]);
      for(const [dx,dy] of dirs){c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+dx,p.y+dy);c.stroke();}
      c.restore();
    }
  }

  buildingHeight(type){return type==="office"?86:type==="villa"?58:type==="shop"?52:48;}

  drawBuilding(b){
    const c=this.ctx,h=this.buildingHeight(b.type);
    const tl=this.iso(b.x,b.y),tr=this.iso(b.x+b.w,b.y),br=this.iso(b.x+b.w,b.y+b.h),bl=this.iso(b.x,b.y+b.h);
    const top={tl:{x:tl.x,y:tl.y-h},tr:{x:tr.x,y:tr.y-h},br:{x:br.x,y:br.y-h},bl:{x:bl.x,y:bl.y-h}};
    this.shadow((tl.x+br.x)/2,(tl.y+br.y)/2+4,b.w*25,b.h*10);
    const wallA=b.type==="office"?"#7d94aa":b.type==="shop"?"#9ea9b7":b.type==="villa"?"#bca98b":"#cda47d";
    const wallB=b.type==="office"?"#657d94":b.type==="shop"?"#8793a2":b.type==="villa"?"#a28e72":"#b68e6b";
    this.poly([top.tl,top.bl,bl,tl],wallB,"rgba(0,0,0,.18)");
    this.poly([top.br,top.bl,bl,br],wallA,"rgba(0,0,0,.18)");
    this.poly([top.tr,top.br,br,tr],wallB,"rgba(0,0,0,.18)");
    this.poly([top.tl,top.tr,top.br,top.bl],b.type==="office"?"#b8c9d8":b.type==="shop"?"#d8dce3":b.type==="villa"?"#e4ddcf":"#e8cfaa","rgba(255,255,255,.35)");
    const roof={x:(top.tl.x+top.br.x)/2,y:Math.min(top.tl.y,top.tr.y,top.bl.y,top.br.y)-12};
    c.save();c.fillStyle=b.type==="office"?"#526b7f":b.type==="shop"?"#66717f":b.type==="villa"?"#8e725b":"#986b4c";
    c.beginPath();c.moveTo(top.tl.x-5,top.tl.y-4);c.lineTo(top.tr.x+5,top.tr.y-4);c.lineTo(roof.x,roof.y);c.lineTo(top.bl.x-5,top.bl.y-4);c.closePath();c.fill();
    c.restore();
    this.drawWindows(b,top);
    const label=b.type==="house"?"Жилой дом":b.type==="shop"?"Магазин":b.type==="office"?"Офис":"Вилла";
    c.save();c.font="700 11px -apple-system,BlinkMacSystemFont,sans-serif";c.textAlign="center";c.fillStyle="rgba(32,28,23,.88)";
    c.fillText(label,(top.tl.x+top.br.x)/2,(top.tl.y+top.br.y)/2-3);c.restore();
  }

  drawWindows(b,top){
    const c=this.ctx;const count=b.type==="office"?4:2;const h=b.type==="office"?20:13;
    for(let i=0;i<count;i++){
      const t=(i+.5)/count;
      const x=top.tl.x+(top.tr.x-top.tl.x)*t;
      const y=top.tl.y+(top.tr.y-top.tl.y)*t+8;
      c.fillStyle=b.type==="office"?"#4c738c":"#577582";
      c.fillRect(x-7,y,14,h);
      c.strokeStyle="rgba(255,255,255,.25)";c.strokeRect(x-7,y,14,h);
    }
  }

  drawTree(x,y,variant=0){
    const p=this.iso(x,y);this.shadow(p.x,p.y+8,18,7);
    const c=this.ctx;c.save();c.fillStyle="#72543c";c.fillRect(p.x-3,p.y-20,6,20);
    c.fillStyle=variant?"#315f43":"#3e7047";c.beginPath();c.arc(p.x,p.y-34,18,0,Math.PI*2);c.fill();
    c.fillStyle=variant?"#477b50":"#578957";c.beginPath();c.arc(p.x-10,p.y-27,14,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(p.x+10,p.y-27,14,0,Math.PI*2);c.fill();c.restore();
  }

  drawDecor(x,y){
    const p=this.iso(x,y);const c=this.ctx;c.save();c.strokeStyle="#665a47";c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x,p.y-20);c.stroke();
    c.fillStyle="#f5df9b";c.beginPath();c.arc(p.x,p.y-23,5,0,Math.PI*2);c.fill();c.restore();
  }

  drawCar(car){
    const p=this.iso(car.x,car.y,8);const c=this.ctx;c.save();c.translate(p.x,p.y);c.rotate(car.angle);
    c.fillStyle="rgba(0,0,0,.2)";c.beginPath();c.ellipse(0,7,16,5,0,0,Math.PI*2);c.fill();
    c.fillStyle=car.type===1?"#d9b35f":car.type===2?"#718aa0":"#d36f68";c.beginPath();c.roundRect(-14,-8,28,14,5);c.fill();
    c.fillStyle="#b9d3dc";c.beginPath();c.roundRect(-7,-6,10,6,2);c.fill();
    c.fillStyle="#202428";c.beginPath();c.arc(-9,6,3,0,Math.PI*2);c.arc(9,6,3,0,Math.PI*2);c.fill();
    c.restore();
  }

  render(){
    const state=this.state.get();const c=this.ctx;c.clearRect(0,0,1100,760);
    this.drawTerrain();this.drawPlaza();this.drawRoads(state.world?.roads||[]);
    const buildings=[...(state.world?.buildings||[])].sort((a,b)=>(a.x+a.y+a.h)-(b.x+b.y+b.h));
    for(const b of buildings)this.drawBuilding(b);
    this.drawTree(1.5,1.5);this.drawTree(18.5,1.5,1);this.drawTree(1.5,12.5);this.drawTree(18.5,12.5,1);
    this.drawDecor(6,2);this.drawDecor(14,2);this.drawDecor(6,11);this.drawDecor(14,11);
    for(const car of this.cars)this.drawCar(car);
  }

  setCars(cars){this.cars=cars;this.render();}
}