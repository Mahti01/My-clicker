const canvas=document.createElement("canvas");canvas.id="renderCanvas";document.getElementById("game").appendChild(canvas);
const loading=document.getElementById("loading");
const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,antialias:true},true);
engine.setHardwareScalingLevel(Math.min(1.5,window.devicePixelRatio||1));

const scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(0.055,0.075,0.105,1);
scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;scene.fogDensity=.004;scene.fogColor=new BABYLON.Color3(.055,.075,.105);

const camera=new BABYLON.ArcRotateCamera("Camera",-Math.PI/2.4,1.02,55,BABYLON.Vector3.Zero(),scene);
camera.lowerRadiusLimit=18;camera.upperRadiusLimit=90;camera.lowerBetaLimit=.35;camera.upperBetaLimit=1.45;
camera.wheelPrecision=45;camera.panningSensibility=70;camera.attachControl(canvas,true);
camera.panningAxis=new BABYLON.Vector3(1,0,1);

const hemi=new BABYLON.HemisphericLight("Ambient",new BABYLON.Vector3(0,1,0),scene);hemi.intensity=.8;
const sun=new BABYLON.DirectionalLight("Sun",new BABYLON.Vector3(-.5,-1,.35),scene);sun.position=new BABYLON.Vector3(30,55,-30);sun.intensity=1.1;

const groundMat=new BABYLON.StandardMaterial("GroundMat",scene);groundMat.diffuseColor=new BABYLON.Color3(.18,.29,.20);
const roadMat=new BABYLON.StandardMaterial("RoadMat",scene);roadMat.diffuseColor=new BABYLON.Color3(.12,.14,.16);
const lineMat=new BABYLON.StandardMaterial("LineMat",scene);lineMat.diffuseColor=new BABYLON.Color3(.82,.78,.55);
const buildingMats=[
  new BABYLON.StandardMaterial("B1",scene),new BABYLON.StandardMaterial("B2",scene),new BABYLON.StandardMaterial("B3",scene)
];
buildingMats[0].diffuseColor=new BABYLON.Color3(.68,.72,.78);
buildingMats[1].diffuseColor=new BABYLON.Color3(.55,.62,.72);
buildingMats[2].diffuseColor=new BABYLON.Color3(.72,.62,.50);

const ground=BABYLON.MeshBuilder.CreateGround("CityGround",{width:100,height:100,subdivisions:2},scene);ground.material=groundMat;ground.receiveShadows=true;

function box(name,x,z,w,d,h,mat){
  const m=BABYLON.MeshBuilder.CreateBox(name,{width:w,depth:d,height:h},scene);
  m.position.set(x,h/2,z);m.material=mat;m.receiveShadows=true;m.isPickable=true;return m;
}
function road(x,z,w,d){box("Road",x,z,w,d,.08,roadMat)}
road(0,0,100,8);road(0,0,8,100);
for(let i=-45;i<=45;i+=8){box("RoadMark",i,0,.35,3,.015,lineMat);box("RoadMark",0,i,3,.35,.015,lineMat)}

const buildings=[];
const starter=[[-18,-18,7,7,7,0],[-8,-18,7,7,11,1],[10,-18,8,7,9,2],[-18,-7,7,8,12,1],[-8,-7,7,8,8,0],[10,-7,8,8,14,2],[-18,13,8,8,10,2],[-7,13,7,8,7,0],[10,13,9,8,12,1]];
for(const b of starter)buildings.push(box("Building",b[0],b[1],b[2],b[3],b[4],buildingMats[b[5]]));

const treeMat=new BABYLON.StandardMaterial("Tree",scene);treeMat.diffuseColor=new BABYLON.Color3(.12,.32,.16);
const trunkMat=new BABYLON.StandardMaterial("Trunk",scene);trunkMat.diffuseColor=new BABYLON.Color3(.30,.19,.11);
function tree(x,z,s=1){
  const t=BABYLON.MeshBuilder.CreateCylinder("Trunk",{height:2*s,diameter:.45*s},scene);t.position.set(x,s,z);t.material=trunkMat;
  const c=BABYLON.MeshBuilder.CreateSphere("Crown",{diameter:3*s,segments:8},scene);c.position.set(x,2.6*s,z);c.material=treeMat;
}
[[-30,-28],[-27,-20],[-30,20],[-27,29],[28,-28],[31,-20],[28,20],[31,29],[-40,5],[40,5],[-40,-8],[40,-8]].forEach(p=>tree(...p,.9));

const shadowGenerator=new BABYLON.ShadowGenerator(1024,sun);shadowGenerator.useBlurExponentialShadowMap=true;shadowGenerator.blurKernel=16;
for(const m of [...buildings,...scene.meshes.filter(m=>m.name==="Trunk"||m.name==="Crown")])shadowGenerator.addShadowCaster(m);

const state={version:"0.1.0",camera:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius,target:{x:0,y:0,z:0}}};
function save(){state.camera={alpha:camera.alpha,beta:camera.beta,radius:camera.radius,target:{x:camera.target.x,y:camera.target.y,z:camera.target.z}};localStorage.setItem("city-tycoon-save",JSON.stringify(state))}
function load(){try{const s=JSON.parse(localStorage.getItem("city-tycoon-save")||"null");if(s?.camera){camera.alpha=s.camera.alpha;camera.beta=s.camera.beta;camera.radius=s.camera.radius;camera.setTarget(new BABYLON.Vector3(s.camera.target.x,s.camera.target.target?.y??s.camera.target.y,s.camera.target.z))}}catch(e){console.warn("Save load failed",e)}}
load();window.addEventListener("beforeunload",save);window.addEventListener("resize",()=>engine.resize());

loading.classList.add("hidden");
engine.runRenderLoop(()=>{scene.render()});
