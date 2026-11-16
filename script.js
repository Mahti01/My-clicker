const menuScreen=document.getElementById('menuScreen'),gameScreen=document.getElementById('gameScreen'),sceneEl=document.getElementById('scene'),modal=document.getElementById('modal'),content=document.getElementById('modalContent');
let renderer=null,scene=null,camera=null,clock=null,root=null,orbit={yaw:Math.PI/4,pitch:.58,distance:62,target:{x:0,y:2,z:0}},drag=null,pinch=null,started=false;
function openModal(html){content.innerHTML=html;modal.classList.remove('hidden')}function closeModal(){modal.classList.add('hidden')}document.getElementById('closeModal').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
function mat(c,rough=.8){return new THREE.MeshStandardMaterial({color:c,roughness:rough})}
function box(w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);root.add(m);return m}
function cyl(r,h,c,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),mat(c));m.position.set(x,y,z);root.add(m);return m}
function textLabel(t,x,z){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(30,34,33,.88)';g.roundRect(8,8,496,112,22);g.fill();g.fillStyle='#fff';g.font='bold 54px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(t,256,64);const tx=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));s.scale.set(7,1.75,1);s.position.set(x,4,z);root.add(s)}
function buildScene(){if(typeof THREE==='undefined'){openModal('<h2>⚠️ Ошибка загрузки 3D</h2><p>Не удалось загрузить 3D-модуль. Главное меню продолжает работать, а 3D-сцену подключим после восстановления загрузки.</p>');return} orbit.target=new THREE.Vector3(0,0,0);scene=new THREE.Scene();scene.background=new THREE.Color(0xcfd6d3);scene.fog=new THREE.Fog(0xcfd6d3,90,170);camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,300);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(1.8,devicePixelRatio||1));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;sceneEl.appendChild(renderer.domElement);
clock=new THREE.Clock();root=new THREE.Group();scene.add(root);
scene.add(new THREE.HemisphereLight(0xffffff,0x66706a,0.9));const sun=new THREE.DirectionalLight(0xffffff,1.45);sun.position.set(-30,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun);
box(110,.25,110,0xb7b9b5,0,-.15,0);box(110,.16,14,0x9b9e9d,0,.05,30);box(110,.16,14,0x9b9e9d,0,.05,-30);box(14,.16,46,0x9b9e9d,30,.05,0);box(14,.16,46,0x9b9e9d,-30,.05,0);
for(let x=-48;x<=48;x+=12){box(5,.05,.35,0xf0f0e9,x,.16,30);box(5,.05,.35,0xf0f0e9,x,.16,-30)}for(let z=-18;z<=18;z+=12){box(.35,.05,5,0xf0f0e9,30,.16,z);box(.35,.05,5,0xf0f0e9,-30,.16,z)}
// parking
for(let x=-20;x<=20;x+=10){box(.12,.04,8,0xffffff,x,.18,23);box(.12,.04,8,0xffffff,x,.18,-23)}
// store shell
box(54,.5,40,0x8f938f,0,.3,0);box(54,8,.5,0x343b39,0,4,-20);box(54,8,.5,0x343b39,0,4,20);box(.5,8,40,0x343b39,-27,4,0);box(.5,8,40,0x343b39,27,4,0);
// glass frontage
for(let x=-22;x<=22;x+=8){box(6,6,.18,0x5f9ba8,x,4,20.25)}
// roof trims
box(56,.7,2,0x202624,0,8.4,-20.5);box(56,.7,2,0x202624,0,8.4,20.5);
// entrance
box(8,6,.3,0x202624,0,3,20.45);box(7,5,.15,0x6faebb,0,2.8,20.65);
// interior floor
box(52,.12,38,0xc8c7c0,0,.62,0);
for(let x=-20;x<=20;x+=8)for(let z=-14;z<=14;z+=8)box(7.5,.03,7.5,((x+z)/8)%2?0xb9b9b2:0xcfcfc8,x,.7,z);
// aisles
for(let x=-19;x<=19;x+=9){box(2,2.2,22,0x8c8d88,x,2,-1);box(1.8,.25,21,0x686b67,x,3.2,-1);for(let z=-10;z<=10;z+=5){box(1.2,.7,1.5,0xd94c45,x,3.7,z);box(1.2,.7,1.5,0xe9b33f,x,4.5,z)}}
// checkout zone
for(let x=-18;x<=18;x+=9){box(5,1.1,2.4,0x777a75,x,1.25,15);box(1.2,1.1,1.5,0x3b4142,x,2.35,15)}
// stock room
box(12,5,10,0x747873,-20,3,-14);box(8,1,6,0x8c6d45,-20,5,-14);for(let i=0;i<3;i++)box(2.4,2,2.4,0xd5b17a,-24+i*3,2,-14);
// produce
for(let x=-3;x<=15;x+=4){cyl(.9,.35,0xd83f36,x,1.2,10);cyl(.75,.35,0xf0b93e,x,1.65,10);}
// lights
for(let x=-20;x<=20;x+=10)for(let z=-12;z<=12;z+=12){cyl(.35,.12,0xffe8a6,x,7.7,z)}
// exterior signs/decor
textLabel('МОЙ МАГАЗИН',0,-22.1);textLabel('ВХОД',0,22.5);
function tree(x,z){cyl(.45,3,0x765337,x,1.5,z);cyl(2.2,3.2,0x77b52f,x,4,z);cyl(1.5,2.2,0x91c93d,x+1,4.8,z+.2)}
[[-40,-38],[40,-38],[-40,38],[40,38],[-44,10],[44,-10]].forEach(p=>tree(p[0],p[1]));
function car(x,z,c){box(3.2,1.1,5.2,c,x,.75,z);box(2.5,.7,2.1,0xb9d0d5,x,1.25,z-.1)}
car(-12,25,0x596269);car(8,25,0x6e8b61);car(16,-25,0x596b79);
const van=box(5,3,9,0xf3f3ef,22,-14,2);box(5.2,.8,3,0xd84a3e,22,-14,2.1);
textLabel('SHOP',0,0);updateCamera();animate()}
function updateCamera(){const t=orbit.target;camera.position.set(t.x+Math.sin(orbit.yaw)*Math.cos(orbit.pitch)*orbit.distance,t.y+Math.sin(orbit.pitch)*orbit.distance,t.z+Math.cos(orbit.yaw)*Math.cos(orbit.pitch)*orbit.distance);camera.lookAt(t)}
function animate(){requestAnimationFrame(animate);if(renderer){renderer.render(scene,camera)}}
function resize(){if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);
function startGame(load){menuScreen.classList.add('hidden');gameScreen.classList.remove('hidden');if(!started){started=true;buildScene()}if(!load)localStorage.setItem('myStoreSave','1');localStorage.setItem('myStoreSession','active')}
document.getElementById('startBtn').onclick=(e)=>{e.preventDefault();e.stopPropagation();startGame(false)};document.getElementById('continueBtn').onclick=(e)=>{e.preventDefault();e.stopPropagation();startGame(true)};document.getElementById('backBtn').onclick=(e)=>{e.preventDefault();e.stopPropagation();gameScreen.classList.add('hidden');menuScreen.classList.remove('hidden')};
renderer=null;
function pointerDown(e){drag={x:e.clientX,y:e.clientY,yaw:orbit.yaw,pitch:orbit.pitch,panX:orbit.target.x,panZ:orbit.target.z,button:e.button};}
function pointerMove(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.button===2){orbit.yaw=drag.yaw-dx*.008;orbit.pitch=Math.max(.38,Math.min(1.25,drag.pitch+dy*.006))}else{orbit.target.x=drag.panX-dx*.035*orbit.distance/35;orbit.target.z=drag.panZ+dy*.035*orbit.distance/35}updateCamera()}
function pointerUp(){drag=null}
document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('pointerdown',e=>{if(gameScreen.classList.contains('hidden')||!renderer)return;if(e.target!==renderer.domElement)return;pointerDown(e)});document.addEventListener('pointermove',e=>{if(drag)pointerMove(e)});document.addEventListener('pointerup',pointerUp);
document.addEventListener('wheel',e=>{if(gameScreen.classList.contains('hidden')||!renderer)return;orbit.distance=Math.max(28,Math.min(72,orbit.distance*(e.deltaY>0?1.08:.92)));updateCamera()},{passive:true});
let touchStart=null;
document.addEventListener('touchstart',e=>{if(e.target!==renderer?.domElement)return;if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};else if(e.touches.length===2)pinch={d:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),distance:orbit.distance}},{passive:true});
document.addEventListener('touchmove',e=>{if(e.target!==renderer?.domElement)return;if(e.touches.length===2&&pinch){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);orbit.distance=Math.max(28,Math.min(72,pinch.distance*pinch.d/d));updateCamera()}},{passive:true});
document.querySelectorAll('.game-btn').forEach(b=>{
  const action=()=>{const a=b.dataset.action;const titles={shop:'🛒 Товары',build:'🏗️ Строительство',staff:'👥 Персонал',finance:'💰 Финансы',rating:'🏆 Рейтинг',settings:'⚙️ Настройки'};openModal('<h2>'+titles[a]+'</h2><p>Этот раздел уже находится в интерфейсе. Следующим этапом подключим его к реальной игровой механике.</p>')};
  b.addEventListener('pointerdown',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('pointerup',e=>e.stopPropagation(),{passive:true});
  b.addEventListener('click',e=>{e.stopPropagation();action()});
});
document.getElementById('ratingBtn').onclick=(e)=>{e.preventDefault();e.stopPropagation();openModal('<h2>🏆 Рейтинг</h2><p>Рейтинг магазинов появится после подключения сохранений и экономики.</p>')};
document.getElementById('settingsBtn').onclick=(e)=>{e.preventDefault();e.stopPropagation();openModal('<h2>⚙️ Настройки</h2><p>Здесь будут качество графики, звук, управление камерой и другие параметры.</p>')};
if(localStorage.getItem('myStoreSave')){const b=document.getElementById('continueBtn');b.disabled=false;b.classList.remove('disabled')}
