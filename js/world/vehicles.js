export class VehicleSystem{
  constructor(state,world){
    this.state=state;this.world=world;this.layer=world.layers.vehicles;
    this.cars=[];this.last=performance.now();this.roadKey="";
    this.rebuild();this.loop=this.loop.bind(this);requestAnimationFrame(this.loop);
    this.unsubscribe=this.state.subscribe(()=>this.rebuild());
  }

  rebuild(){
    const roads=this.state.get().world?.roads||[];
    const key=roads.map(r=>r.x+","+r.y).sort().join("|");
    if(key===this.roadKey)return;
    this.roadKey=key;
    this.layer.innerHTML="";this.cars=[];
    if(roads.length<4)return;
    const route=this.makeRoute(roads);
    if(route.length<4)return;
    const count=Math.min(5,Math.max(1,Math.floor(route.length/5)));
    for(let i=0;i<count;i++)this.spawn(route,i);
  }

  makeRoute(roads){
    const set=new Set(roads.map(r=>r.x+","+r.y));
    const neighbors=c=>[[c.x,c.y-1],[c.x+1,c.y],[c.x,c.y+1],[c.x-1,c.y]]
      .filter(([x,y])=>set.has(x+","+y)).map(([x,y])=>({x,y}));

    // Start from an endpoint when possible; this gives cars a natural path
    // through a road chain. At intersections the vehicle chooses the
    // straightest continuation, then falls back to another available branch.
    const endpoints=roads.filter(c=>neighbors(c).length===1);
    const start=endpoints[0]||roads[0];
    const route=[{x:start.x,y:start.y}];
    let current={x:start.x,y:start.y},previous=null;

    for(let guard=0;guard<roads.length*4;guard++){
      const options=neighbors(current).filter(n=>!previous||n.x!==previous.x||n.y!==previous.y);
      if(!options.length){
        if(previous)route.push({x:previous.x,y:previous.y});
        break;
      }

      let next=options[0];
      if(previous){
        const dx=current.x-previous.x,dy=current.y-previous.y;
        next=options.find(n=>n.x-current.x===dx&&n.y-current.y===dy)||options[0];
      }
      route.push({x:next.x,y:next.y});
      previous=current;current=next;

      // Close a loop once we return to the start after enough cells.
      if(route.length>4&&current.x===start.x&&current.y===start.y)break;
    }

    // Remove immediate duplicate at loop closure.
    if(route.length>1){
      const last=route[route.length-1],first=route[0];
      if(last.x===first.x&&last.y===first.y)route.pop();
    }
    return route;
  }

  spawn(route,index){
    const el=document.createElement("div");
    el.className="world-vehicle";
    el.textContent=index%3===1?"🚕":index%3===2?"🚙":"🚗";
    this.layer.appendChild(el);

    this.cars.push({
      el,route,
      segment:index%Math.max(1,route.length-1),
      progress:(index*.17)%1,
      speed:.72+index*.08,
      direction:1
    });
  }

  chooseNext(car){
    const current=car.route[car.segment];
    const previousIndex=car.segment-car.direction;
    const previous=car.route[Math.max(0,Math.min(car.route.length-1,previousIndex))];
    const candidates=[];

    // Prefer continuing in the same direction.
    const dx=current.x-previous.x,dy=current.y-previous.y;
    for(let i=0;i<car.route.length;i++){
      const p=car.route[i],n=car.route[(i+1)%car.route.length];
      if(p.x===current.x&&p.y===current.y&&n.x-p.x===dx&&n.y-p.y===dy)candidates.push({i,dir:1});
      if(n.x===current.x&&n.y===current.y&&p.x-n.x===dx&&p.y-n.y===dy)candidates.push({i,dir:-1});
    }

    if(candidates.length){
      const chosen=candidates[0];
      car.direction=chosen.dir;
      car.segment=chosen.i;
      return;
    }

    car.direction*=-1;
    car.segment=Math.max(0,Math.min(car.route.length-1,car.segment+car.direction));
  }

  loop(now){
    const dt=Math.min(.05,(now-this.last)/1000);this.last=now;

    for(const car of this.cars){
      if(car.route.length<2)continue;
      car.progress+=dt*car.speed;

      while(car.progress>=1){
        car.progress-=1;
        car.segment+=car.direction;

        if(car.segment>=car.route.length-1){
          if(car.route[0].x===car.route[car.route.length-1].x&&car.route[0].y===car.route[car.route.length-1].y){
            car.segment=0;
          }else{
            car.direction=-1;
            car.segment=car.route.length-1;
          }
        }else if(car.segment<0){
          car.direction=1;
          car.segment=0;
        }
      }

      const a=car.route[car.segment];
      const b=car.route[car.segment+car.direction]||car.route[car.segment];
      const t=car.direction===1?car.progress:1-car.progress;
      const x=(a.x+(b.x-a.x)*t)*this.world.cellSize+this.world.cellSize/2;
      const y=(a.y+(b.y-a.y)*t)*this.world.cellSize+this.world.cellSize/2;

      const angle=Math.atan2((b.y-a.y),(b.x-a.x))*180/Math.PI;
      car.el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) rotate(${angle}deg)`;
      car.el.style.zIndex=String(200+Math.round(y));
    }

    requestAnimationFrame(this.loop);
  }
}