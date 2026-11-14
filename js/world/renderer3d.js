import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

export class CityRenderer3D{
  constructor(canvas,state){
    this.canvas=canvas;this.state=state;this.cols=20;this.rows=14;this.cell=2;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x71896a);
    this.scene.fog=new THREE.Fog(0x71896a,55,105);

    this.camera=new THREE.PerspectiveCamera(48,1,.1,300);
    this.camera.position.set(27,31,29);

    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;

    this.controls=new OrbitControls(this.camera,this.canvas);
    this.controls.enableDamping=true;
    this.controls.enablePan=true;
    this.controls.screenSpacePanning=true;
    this.controls.rotateSpeed=.65;
    this.controls.zoomSpeed=.9;
    this.controls.panSpeed=.8;
    this.controls.dampingFactor=.08;
    this.controls.minDistance=22;
    this.controls.maxDistance=70;
    this.controls.maxPolarAngle=Math.PI/2.08;
    this.controls.minPolarAngle=.38;
    this.controls.target.set(0,0,0);
    this.controls.addEventListener("change",()=>this.invalidate=true);

    this.raycaster=new THREE.Raycaster();
    this.pointer=new THREE.Vector2();
    this.ground=new THREE.Mesh(new THREE.PlaneGeometry(this.cols*this.cell,this.rows*this.cell),new THREE.MeshBasicMaterial({visible:false}));
    this.ground.rotation.x=-Math.PI/2;
    this.ground.position.y=0;
    this.scene.add(this.ground);

    this.worldGroup=new THREE.Group();this.scene.add(this.worldGroup);
    this.roadGroup=new THREE.Group();this.buildingGroup=new THREE.Group();this.decorGroup=new THREE.Group();this.vehicleGroup=new THREE.Group();
    this.worldGroup.add(this.roadGroup,this.buildingGroup,this.decorGroup,this.vehicleGroup);

    this.previewMesh=null;this.cars=[];
    this.materials={};
    this.createLights();
    this.createCityBackdrop();
    this.createGround();
    this.resize();
    window.addEventListener("resize",()=>this.resize());
    state.subscribe(()=>this.render());
    this.render();
    this.animate();
  }

  createLights(){
    const hemi=new THREE.HemisphereLight(0xeaf1ff,0x40523c,2.1);this.scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xfff4dc,3.0);
    sun.position.set(-22,42,18);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=38;sun.shadow.camera.bottom=-38;
    this.scene.add(sun);
  }

  createCityBackdrop(){
    const ring=new THREE.Mesh(
      new THREE.RingGeometry(54,58,64),
      new THREE.MeshStandardMaterial({color:0x5d7358,roughness:1,side:THREE.DoubleSide})
    );
    ring.rotation.x=-Math.PI/2;ring.position.y=-.06;this.scene.add(ring);
  }

  createGround(){
    const g=new THREE.PlaneGeometry(this.cols*this.cell+12,this.rows*this.cell+12);
    const m=new THREE.MeshStandardMaterial({color:0x78916f,roughness:1});
    const ground=new THREE.Mesh(g,m);ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;
    this.scene.add(ground);

    const grid=new THREE.GridHelper(this.cols*this.cell,this.cols,0x92a98a,0x819b7b);
    grid.position.y=.005;this.scene.add(grid);
  }

  resize(){
    const rect=this.canvas.parentElement.getBoundingClientRect();
    const w=Math.max(1,rect.width),h=Math.max(1,rect.height);
    this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  }

  cellToWorld(x,y){
    return {x:(x+.5-this.cols/2)*this.cell,z:(y+.5-this.rows/2)*this.cell};
  }

  clear(group){while(group.children.length)group.remove(group.children[0]);}

  makeBox(w,h,d,color){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.03}));
    mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }

  roof(width,depth,height,color){
    const mesh=new THREE.Mesh(new THREE.ConeGeometry(Math.max(width,depth)*.72,Math.max(width,depth)*.42,4),new THREE.MeshStandardMaterial({color,roughness:.85}));
    mesh.rotation.y=Math.PI/4;mesh.position.y=height;mesh.castShadow=true;return mesh;
  }

  building(b){
    const g=new THREE.Group(),s=this.cell;
    const w=b.w*s*.92,d=b.h*s*.92;
    const data={
      house:{h:3.5,body:0xd7aa7d,roof:0x986b4c},
      shop:{h:3.0,body:0xc9d2dd,roof:0x667481},
      office:{h:6.0,body:0x8da7bd,roof:0x4f687b},
      villa:{h:4.2,body:0xd2c1a5,roof:0x876e55}
    }[b.type];
    const body=this.makeBox(w,data.h,d,data.body);body.position.y=data.h/2;g.add(body);
    const roof=this.roof(w,d,data.h+.25,data.roof);roof.scale.set(1,.7,1);g.add(roof);

    const windowMat=new THREE.MeshStandardMaterial({color:0x4f7588,roughness:.35,metalness:.05});
    const rows=b.type==="office"?3:1,cols=b.w>=3?3:2;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const win=new THREE.Mesh(new THREE.BoxGeometry(.42,.55,.04),windowMat);
      win.position.set((col-(cols-1)/2)*.7,data.h*(.45+.16*row),-d/2-.025);g.add(win);
    }
    const door=new THREE.Mesh(new THREE.BoxGeometry(.5,1.0,.05),new THREE.MeshStandardMaterial({color:0x5d493e}));
    door.position.set(0,.5,-d/2-.03);g.add(door);

    const {x,z}=this.cellToWorld(b.x,b.y);g.position.set(x,0,z);return g;
  }

  road(r,roads){
    const s=this.cell,mat=new THREE.MeshStandardMaterial({color:0x343a3f,roughness:.92});
    const g=new THREE.Group();
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(s*1.02,.12,s*1.02),mat);mesh.position.y=.05;mesh.receiveShadow=true;g.add(mesh);
    const lineMat=new THREE.MeshStandardMaterial({color:0xe7c76f,roughness:.7});
    const key=new Set(roads.map(a=>a.x+","+a.y));
    const has=(x,y)=>key.has(x+","+y);
    if(has(r.x+1,r.y)||has(r.x-1,r.y)){
      const line=new THREE.Mesh(new THREE.BoxGeometry(s*.72,.025,.055),lineMat);line.position.y=.13;g.add(line);
    }
    if(has(r.x,r.y+1)||has(r.x,r.y-1)){
      const line=new THREE.Mesh(new THREE.BoxGeometry(.055,.025,s*.72),lineMat);line.position.y=.13;g.add(line);
    }
    const {x,z}=this.cellToWorld(r.x,r.y);g.position.set(x,0,z);return g;
  }

  tree(x,y,variant=0){
    const g=new THREE.Group(),{x:wx,z}=this.cellToWorld(x,y);
    const trunk=this.makeBox(.28,1.4,.28,0x75523b);trunk.position.y=.7;g.add(trunk);
    const crown=new THREE.Mesh(new THREE.SphereGeometry(1.25,16,12),new THREE.MeshStandardMaterial({color:variant?0x315f43:0x3f7549,roughness:1}));
    crown.position.y=2.15;crown.scale.set(1,.95,1);crown.castShadow=true;g.add(crown);
    g.position.set(wx,0,z);return g;
  }

  lamp(x,y){
    const g=new THREE.Group(),{x:wx,z}=this.cellToWorld(x,y);
    const pole=this.makeBox(.1,2.1,.1,0x5f5143);pole.position.y=1.05;g.add(pole);
    const bulb=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8),new THREE.MeshStandardMaterial({color:0xffdf91,emissive:0x6d4d16,emissiveIntensity:1.4}));
    bulb.position.y=2.2;g.add(bulb);g.position.set(wx,0,z);return g;
  }

  fountain(){
    const g=new THREE.Group(),base=this.makeBox(7.5,.25,5.5,0xd5ccbd);base.position.y=.13;g.add(base);
    const water=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.12,48),new THREE.MeshStandardMaterial({color:0x8fd2df,roughness:.15,metalness:.1}));
    water.position.y=.32;g.add(water);
    const column=this.makeBox(.25,1.7,.25,0xc9e8ec);column.position.y=1.15;g.add(column);
    g.position.set(0,.02,0);return g;
  }

  render(){
    const state=this.state.get();
    this.invalidate=false;
    this.clear(this.roadGroup);this.clear(this.buildingGroup);this.clear(this.decorGroup);
    const roads=state.world?.roads||[];
    for(const r of roads)this.roadGroup.add(this.road(r,roads));

    const buildings=[...(state.world?.buildings||[])];
    for(const b of buildings)this.buildingGroup.add(this.building(b));

    this.decorGroup.add(this.fountain());
    const trees=[[1,1,0],[5,1,1],[9,1,0],[15,1,1],[18,4,0],[1,7,1],[18,7,1],[2,12,0],[7,12,1],[13,12,0],[18,12,1]];
    trees.forEach(t=>this.decorGroup.add(this.tree(...t)));
    [[3,4],[6,4],[9,4],[12,4],[15,4],[3,10],[6,10],[9,10],[12,10],[15,10],[3,7],[16,7]].forEach(p=>this.decorGroup.add(this.lamp(...p)));

    this.updatePreview();
  }

  updatePreview(){
    if(this.previewMesh){this.scene.remove(this.previewMesh);this.previewMesh=null;}
    const p=this.preview;if(!p?.cell)return;
    const s=this.cell,item=p.item;
    const mat=new THREE.MeshStandardMaterial({color:p.valid?0xe0bd78:0xdd7777,transparent:true,opacity:.55});
    this.previewMesh=new THREE.Mesh(new THREE.BoxGeometry(item.w*this.cell*.92,.15,item.h*this.cell*.92),mat);
    const {x,z}=this.cellToWorld(p.cell.x,p.cell.y);
    this.previewMesh.position.set(x,.18,z);this.scene.add(this.previewMesh);
  }

  setCars(cars){
    this.cars=cars||[];
    while(this.vehicleGroup.children.length)this.vehicleGroup.remove(this.vehicleGroup.children[0]);
    for(const car of this.cars){
      const g=new THREE.Group();
      const body=this.makeBox(1.05,.45,.62,car.type===1?0xd8ad55:car.type===2?0x718ba3:0xd36f68);body.position.y=.45;g.add(body);
      const top=this.makeBox(.55,.25,.5,0xb9d5dc);top.position.y=.72;g.add(top);
      const {x,z}=this.cellToWorld(car.x-.5,car.y-.5);g.position.set(x,.05,z);g.rotation.y=-car.angle;this.vehicleGroup.add(g);
    }
  }

  screenToCell(clientX,clientY){
    const rect=this.canvas.getBoundingClientRect();
    this.pointer.x=((clientX-rect.left)/rect.width)*2-1;
    this.pointer.y=-((clientY-rect.top)/rect.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hit=this.raycaster.intersectObject(this.ground,false)[0];
    if(!hit)return null;
    const x=Math.floor((hit.point.x+this.cols*this.cell/2)/this.cell);
    const y=Math.floor((hit.point.z+this.rows*this.cell/2)/this.cell);
    return x>=0&&y>=0&&x<this.cols&&y<this.rows?{x,y}:null;
  }

  animate(){
    requestAnimationFrame(()=>this.animate());
    this.controls.update();
    this.renderer.render(this.scene,this.camera);
  }
}