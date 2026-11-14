export class VehicleSystem{
  constructor(state,world){
    this.state=state;this.world=world;this.layer=world.layers.vehicles;this.cars=[];this.last=performance.now();
    this.rebuild();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
    this.unsubscribe=this.state.subscribe(()=>this.rebuild());
  }
  rebuild(){
    const roads=this.state.get().world?.roads||[];
    const key=roads.map(r=>r.x+","+r.y).sort().join("|");
    if(key===this.roadKey)return;
    this.roadKey=key;
    this.layer.innerHTML="";this.cars=[];
    this.makeRoutes(roads).slice(0,3).forEach((route,i)=>this.spawn(route,i));
  }
  makeRoutes(roads){
    const set=new Set(roads.map(r=>r.x+","+r.y));
    const neighbors=c=>[[c.x,c.y-1],[c.x+1,c.y],[c.x,c.y+1],[c.x-1,c.y]].filter(([x,y])=>set.has(x+","+y)).map(([x,y])=>({x,y}));
    const unused=new Set(roads.map(r=>r.x+","+r.y));const routes=[];
    while(unused.size){
      const start=roads.find(r=>unused.has(r.x+","+r.y));if(!start)break;
      const route=[{x:start.x,y:start.y}];unused.delete(start.x+","+start.y);
      let current=start,previous=null;
      for(let guard=0;guard<roads.length*2;guard++){
        const nexts=neighbors(current).filter(n=>!previous||n.x!==previous.x||n.y!==previous.y).filter(n=>unused.has(n.x+","+n.y));
        if(!nexts.length)break;
        const next=nexts[0];route.push(next);unused.delete(next.x+","+next.y);previous=current;current=next;
      }
      if(route.length>=4)routes.push(route);
    }
    return routes;
  }
  spawn(route,index){
    const el=document.createElement("div");el.className="world-vehicle";el.textContent=index%2?"🚕":"🚗";this.layer.appendChild(el);
    this.cars.push({el,route,t:index*.32,speed:.9+index*.12});
  }
  loop(now){
    const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
    for(const car of this.cars){
      car.t+=dt*car.speed;
      const total=car.route.length-1,cycle=Math.max(1,total*2);let p=car.t%cycle;
      if(p>total)p=cycle-p;
      const a=car.route[Math.floor(p)]||car.route[0],b=car.route[Math.min(total,Math.floor(p)+1)]||a,f=p-Math.floor(p);
      const x=(a.x+(b.x-a.x)*f)*this.world.cellSize+this.world.cellSize/2;
      const y=(a.y+(b.y-a.y)*f)*this.world.cellSize+this.world.cellSize/2;
      car.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      car.el.style.zIndex=String(200+Math.round(y));
    }
    requestAnimationFrame(this.loop);
  }
}