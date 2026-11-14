import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const state={money:20000,rep:50,day:1,hour:9,minute:20,speed:1,running:true,sold:0,staff:1,ad:0,stock:{milk:24,bread:31,beauty:18,shoes:8},prices:{milk:129,bread:89,beauty:599,shoes:2499}};
const costs={shelf:1200,cash:3500,warehouse:7000,department:5000,decor:500};const names={shelf:'Стеллаж',cash:'Касса',warehouse:'Склад',department:'Отдел',decor:'Декор'};
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb9d5e7);
const camera=new THREE.OrthographicCamera(-15,15,9,-9,.1,300);camera.position.set(18,22,24);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.getElementById('scene').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.08;controls.enablePan=true;controls.minZoom=.55;controls.maxZoom=2.4;controls.target.set(0,0,0);controls.maxPolarAngle=Math.PI/2.15;controls.minPolarAngle=.65;
scene.add(new THREE.HemisphereLight(0xffffff,0x708b68,2.2));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-15,28,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);

const groundMat=new THREE.MeshStandardMaterial({color:0x8cab7e,roughness:.9});const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,60),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const roadMat=new THREE.MeshStandardMaterial({color:0x58656b,roughness:.95});const road=new THREE.Mesh(new THREE.PlaneGeometry(80,9),roadMat);road.rotation.x=-Math.PI/2;road.position.set(0,.02,14);scene.add(road);
const lineMat=new THREE.MeshBasicMaterial({color:0xf4f1df});for(let x=-35;x<35;x+=6){const m=new THREE.Mesh(new THREE.BoxGeometry(2.8,.025,.18),lineMat);m.position.set(x,.04,14);scene.add(m)}

const shopGroup=new THREE.Group();scene.add(shopGroup);
function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.7})}
function box(w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;shopGroup.add(m);return m}
function labelSprite(text,color='#34413b'){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const c=cv.getContext('2d');c.fillStyle='rgba(250,249,241,.94)';c.roundRect(8,8,496,80,18);c.fill();c.fillStyle=color;c.font='bold 42px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,48);const tex=new THREE.CanvasTexture(cv);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(4.2,.8,1);return s}
function createShop(){box(13,4.8,9,0xe9eee9,0,2.4,0);box(13.3,.35,9.3,0x3ea957,0,5.0,0);for(let x=-4.4;x<=4.4;x+=4.4){box(2.5,2.4,.18,0xb9d9e5,x,2.5,-4.56)}const l=labelSprite('МОЙ МАГАЗИН');l.position.set(0,4.25,-4.7);shopGroup.add(l);box(2.2,2.5,.5,0x6b8d98,0,2.4,4.55)}
createShop();

const buildings=[];
function makeBuilding(type,x,z){const g=new THREE.Group();let w=2.2,d=1.4,h=.9,c=0x9b6c43;if(type==='cash'){w=2.2;d=1.4;h=1;c=0xd7e0da}else if(type==='warehouse'){w=5;d=4;h=2.5;c=0xaab4b2}else if(type==='department'){w=4.5;d=4;h=2.3;c=0xf0eee6}else if(type==='decor'){w=1.3;d=1.3;h=2.8;c=0x4e8d48}
const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.y=h/2;m.castShadow=true;m.receiveShadow=true;g.add(m);
if(type==='shelf'){for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.32,.32,.45),mat(0xf0d69c));p.position.set(-.65+i*.65,.72,0);g.add(p)}}
if(type==='cash')g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,.35),mat(0x42a953)),{position:new THREE.Vector3(0,.65,0)}));
if(type==='warehouse'||type==='department'){const l=labelSprite(names[type]);l.scale.set(2.8,.55,1);l.position.y=h+.25;g.add(l)}
if(type==='decor'){const crown=new THREE.Mesh(new THREE.SphereGeometry(.7,12,10),mat(0x4e8d48));crown.position.y=3.15;g.add(crown);const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.14,.18,.8,8),mat(0x6e5136));trunk.position.y=1.6;g.add(trunk)}
g.position.set(x,0,z);g.userData={type,price:costs[type],size:{w,d}};scene.add(g);buildings.push(g);return g}
function initial(){[[-4,-1], [0,-1],[4,-1],[-4,2],[0,2],[4,2]].forEach(p=>makeBuilding('shelf',...p));[[-5,5],[-2,5]].forEach(p=>makeBuilding('cash',...p));makeBuilding('warehouse',9,0);makeBuilding('department',-9,1);makeBuilding('decor',8,5);makeBuilding('decor',-8,5)}initial();

const customers=[];for(let i=0;i<9;i++){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.23,.28,.75,10),mat(i%2?0xd67c5e:0x4f7fa5));body.position.y=.55;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.22,12,12),mat(0xf0c9a0));head.position.y=1.05;head.castShadow=true;g.add(head);g.position.set((Math.random()-.5)*11,0,8+Math.random()*3);scene.add(g);customers.push({g,phase:Math.random()*6.28})}

const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),buildPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);let buildMode=null,preview=null;
function worldFromEvent(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mouse,camera);const p=new THREE.Vector3();ray.ray.intersectPlane(buildPlane,p);return p}
function showPreview(p){if(!preview){preview=new THREE.Mesh(new THREE.BoxGeometry(2.2,.15,1.4),new THREE.MeshBasicMaterial({color:0x40b552,transparent:true,opacity:.42}));scene.add(preview)}preview.visible=true;preview.position.set(Math.round(p.x),.08,Math.round(p.z))}
function clearPreview(){if(preview)preview.visible=false}
renderer.domElement.addEventListener('pointermove',e=>{if(buildMode)showPreview(worldFromEvent(e))});
renderer.domElement.addEventListener('pointerdown',e=>{if(buildMode){const p=worldFromEvent(e);place(buildMode,Math.round(p.x),Math.round(p.z));return}});
function place(type,x,z){if(state.money<costs[type])return toast('Недостаточно денег');if(Math.abs(x)<7&&Math.abs(z)<5)return toast('Здесь занят магазин');if(buildings.some(b=>Math.abs(b.position.x-x)<1.6&&Math.abs(b.position.z-z)<1.5))return toast('Здесь уже есть объект');state.money-=costs[type];makeBuilding(type,x,z);state.rep=Math.min(100,state.rep+.4);buildMode=null;clearPreview();document.getElementById('buildBar').classList.add('hidden');updateHud();toast(names[type]+' построен')}

function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(window.__t);window.__t=setTimeout(()=>e.classList.remove('show'),1700)}
function updateHud(){money.textContent=Math.round(state.money).toLocaleString('ru-RU')+' ₽';reputation.textContent=Math.round(state.rep);repBar.style.width=state.rep+'%';taskStatus.textContent=state.sold>=3?'ВЫПОЛНЕНО':state.sold+' / 3';time.textContent=String(state.hour).padStart(2,'0')+':'+String(state.minute).padStart(2,'0');day.textContent=state.day;stockMilk.textContent=state.stock.milk;stockBread.textContent=state.stock.bread;stockBeauty.textContent=state.stock.beauty;stockShoes.textContent=state.stock.shoes}
function sell(){const keys=Object.keys(state.stock).filter(k=>state.stock[k]>0);if(!keys.length)return;const k=keys[Math.floor(Math.random()*keys.length)];state.stock[k]--;state.money+=state.prices[k];state.sold++;state.rep=Math.min(100,state.rep+.08);if(state.sold===3){state.money+=500;toast('Задание выполнено · +500 ₽')}updateHud()}
function openPanel(type){const p=document.getElementById('panel'),c=document.getElementById('panelContent');let title='',body='';
if(type==='build'){title='🏗️ Стройка';body='Выберите объект и установите его на свободное место карты.<div class="build-list">'+Object.keys(costs).map(k=>'<button class="build-choice" data-build2="'+k+'">'+names[k]+'<span>'+costs[k].toLocaleString('ru-RU')+' ₽</span></button>').join('')+'</div>'}
if(type==='report'){title='📊 Отчёт';body='<div class="row"><span>Продажи</span><b class="green">'+state.sold+' шт.</b></div><div class="row"><span>Репутация</span><b class="green">'+Math.round(state.rep)+'%</b></div>'}
if(type==='prices'){title='🏷️ Цены';body=Object.keys(state.prices).map(k=>'<div class="price-row"><span>'+({milk:'Молоко',bread:'Хлеб',beauty:'Косметика',shoes:'Обувь'}[k])+'</span><div><button data-price="'+k+'" data-delta="-10">−</button><b>'+state.prices[k]+' ₽</b><button data-price="'+k+'" data-delta="10">+</button></div></div>').join('')}
if(type==='products'){title='📦 Товары';body=Object.keys(state.stock).map(k=>'<div class="row"><span>'+({milk:'Молоко',bread:'Хлеб',beauty:'Косметика',shoes:'Обувь'}[k])+' · '+state.stock[k]+' шт.</span><button class="mini-action" data-buy="'+k+'">+10</button></div>').join('')}
if(type==='development'){title='🛠️ Развитие';body='<div class="row"><span>Уровень</span><b>1</b></div><button class="action" id="expand">Расширить магазин · 9 000 ₽</button>'}
if(type==='staff'){title='👨‍💼 Персонал';body='<div class="row"><span>Сотрудников</span><b>'+state.staff+'</b></div><button class="action" id="hire">Нанять · 1 500 ₽</button>'}
if(type==='ads'){title='📣 Реклама';body='<div class="row"><span>Эффект</span><b class="green">+'+state.ad+'%</b></div><button class="action" id="ad">Запустить · 800 ₽</button>'}
if(type==='bank'){title='🏦 Банк';body='<div class="row"><span>Баланс</span><b class="green">'+Math.round(state.money).toLocaleString('ru-RU')+' ₽</b></div><button class="action">Кредит скоро</button>'}
if(type==='rating'){title='🏆 Рейтинг';body='<div class="row"><span>Место</span><b>1 248</b></div><div class="row"><span>Репутация</span><b class="green">'+Math.round(state.rep)+'%</b></div>'}
if(type==='settings'){title='⚙️ Настройки';body='<button class="action" id="reset">Сбросить камеру</button>'}
c.innerHTML='<h2>'+title+'</h2><p>Управляйте своим магазином.</p>'+body;p.classList.remove('hidden');
document.querySelectorAll('[data-build2]').forEach(b=>b.onclick=()=>{buildMode=b.dataset.build2;p.classList.add('hidden');document.getElementById('buildBar').classList.remove('hidden');toast('Поставьте '+names[buildMode]+' на карту')});
document.querySelectorAll('[data-price]').forEach(b=>b.onclick=()=>{state.prices[b.dataset.price]=Math.max(10,state.prices[b.dataset.price]+Number(b.dataset.delta));openPanel('prices')});
document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const k=b.dataset.buy,c={milk:70,bread:45,beauty:320,shoes:1300}[k]*10;if(state.money<c)return toast('Недостаточно денег');state.money-=c;state.stock[k]+=10;updateHud();openPanel('products')});
if(document.getElementById('hire'))document.getElementById('hire').onclick=()=>{if(state.money<1500)return toast('Недостаточно денег');state.money-=1500;state.staff++;updateHud();openPanel('staff')};
if(document.getElementById('ad'))document.getElementById('ad').onclick=()=>{if(state.money<800)return toast('Недостаточно денег');state.money-=800;state.ad+=10;state.rep=Math.min(100,state.rep+1);updateHud();openPanel('ads')};
if(document.getElementById('expand'))document.getElementById('expand').onclick=()=>{if(state.money<9000)return toast('Недостаточно денег');state.money-=9000;makeBuilding('department',14,7);updateHud();toast('Новая площадь открыта')};
if(document.getElementById('reset'))document.getElementById('reset').onclick=()=>{camera.position.set(18,22,24);controls.target.set(0,0,0);camera.zoom=1;camera.updateProjectionMatrix();toast('Камера сброшена')}}
document.querySelectorAll('.menu-btn').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));closePanel.onclick=()=>panel.classList.add('hidden');
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>{buildMode=b.dataset.build;panel.classList.add('hidden');buildBar.classList.remove('hidden');toast('Поставьте '+names[buildMode]+' на карту')});
pauseBtn.onclick=()=>{state.running=false;pauseBtn.classList.add('active');playBtn.classList.remove('active')};playBtn.onclick=()=>{state.running=true;playBtn.classList.add('active');pauseBtn.classList.remove('active')};
document.querySelectorAll('.speed-card button[data-speed]').forEach(b=>b.onclick=()=>{state.speed=+b.dataset.speed;document.querySelectorAll('.speed-card button[data-speed]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
soundBtn.onclick=()=>soundBtn.textContent=soundBtn.textContent==='🔊'?'🔇':'🔊';
setInterval(()=>{if(!state.running)return;state.minute+=2*state.speed;if(state.minute>=60){state.minute-=60;state.hour++;if(state.hour>=24){state.hour=0;state.day++;state.sold=0}}customers.forEach((c,i)=>{c.phase+=.04*state.speed;c.g.position.x+=(0-c.g.position.x)*.006*state.speed;c.g.position.z+=(2-c.g.position.z)*.006*state.speed});if(Math.random()<.09*state.speed)sell();updateHud()},1000);
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();updateHud();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.left=-15*innerWidth/innerHeight;camera.right=15*innerWidth/innerHeight;camera.top=15;camera.bottom=-15;camera.updateProjectionMatrix()});