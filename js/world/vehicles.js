export class VehicleSystem{
  constructor(state,world,renderer){
    this.state=state;this.world=world;this.renderer=renderer;this.cars=[];this.last=performance.now();this.roadKey="";
    this.rebuild();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
    this.unsubscribe=this.state.subscribe(()=>this.rebuild());
  }

  rebuild(){
    const roads=this.state.get().world?.roads||[];
    const key=roads.map(r=>r.x+","+r.y).sort().join("|");
    if(key===this.roadKey)return;
    this.roadKey=key;this.cars=[];
    if(roads.length<4){this.renderer.setCars(this.cars);return;}
    const route=this.makeRoute(roads);
    if(route.length<4){this.renderer.setCars(this.cars);return;}
    const count=Math.min(6,Math.max(1,Math.floor(route.length/5)));
    for(let i=0;i<count;i++)this.spawn(route,i);
    this.renderer.setCars(this.cars);
  }

  makeRoute(roads){
    const set=new Set(roads.map(r=>r.x+","+r.y));
    const neighbors=c=>[[c.x,c.y-1],[c.x+1,c.y],[c.x,c.y+1],[c.x-1,c.y]]
      .filter(([x,y])=>set.has(x+","+y)).map(([x,y])=>({x,y}));
    const start=roads.find(c=>neighbors(c).length===1)||roads[0];
    const route=[{x:start.x+.5,y:start.y+.5}];
    let current={x:start.x,y:start.y},previous=null;
    for(let guard=0;guard<roads.length*4;guard++){
      const options=neighbors(current).filter(n=>!previous||n.x!==previous.x||n.y!==previous.y);
      if(!options.length)break;
      let next=options[0];
      if(previous){
        const dx=current.x-previous.x,dy=current.y-previous.y;
        next=options.find(n=>n.x-current.x===dx&&n.y-current.y===dy)||options[0];
      }
      route.push({x:next.x+.5,y:next.y+.5});previous=current;current=next;
      if(route.length>4&&current.x===start.x&&current.y===start.y)break;
    }
    if(route.length>1){
      const last=route[route.length-1],first=route[0];
      if(last.x===first.x&&last.y===first.y)route.pop();
    }
    return route;
  }

  spawn(route,index){
    this.cars.push({route,segment:index%Math.max(1,route.length-1),progress:(index*.17)%1,speed:.55+index*.07,type:index%3, x:route[0].x,y:route[0].y,angle:0});
  }

  loop(now){
    const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
    for(const car of this.cars){
      if(car.route.length<2)continue;
      car.progress+=dt*car.speed;
      while(car.progress>=1){car.progress-=1;car.segment=(car.segment+1)%car.route.length;}
      const a=car.route[car.segment],b=car.route[(car.segment+1)%car.route.length];
      const t=car.progress;
      car.x=a.x+(b.x-a.x)*t;car.y=a.y+(b.y-a.y)*t;
      car.angle=Math.atan2((b.y-a.y),(b.x-a.x));
    }
    this.renderer.setCars(this.cars);
    requestAnimationFrame(this.loop);
  }
}