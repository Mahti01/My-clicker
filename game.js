const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let W=innerWidth,H=innerHeight,DPR=Math.min(devicePixelRatio||1,2);
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',resize);resize();

const state={
 money:20000,rep:50,day:1,hour:9,minute:20,speed:1,running:true,zoom:.92,camX:0,camY:0,
 sold:0,buildMode:null,selected:null,staff:1,ad:0,stock:{milk:24,bread:31,beauty:18,shoes:8},
 prices:{milk:129,bread:89,beauty:599,shoes:2499},buildings:[],customers:[],particles:[],lastSale:0
};
const prices={shelf:1200,cash:3500,warehouse:7000,department:5000,decor:500,storage:3000,expansion:9000};
const names={shelf:'Стеллаж',cash:'Касса',warehouse:'Склад',department:'Отдел',decor:'Декор',storage:'Доп. склад',expansion:'Расширение'};
state.buildings=[
 {type:'shop',x:0,y:0,w:15,h:10,locked:true},
 {type:'shelf',x:-4,y:-1,w:2.2,h:1.2},{type:'shelf',x:0,y:-1,w:2.2,h:1.2},{type:'shelf',x:4,y:-1,w:2.2,h:1.2},
 {type:'shelf',x:-4,y:2,w:2.2,h:1.2},{type:'shelf',x:0,y:2,w:2.2,h:1.2},{type:'shelf',x:4,y:2,w:2.2,h:1.2},
 {type:'cash',x:-5,y:5,w:2.2,h:1.4},{type:'cash',x:-2,y:5,w:2.2,h:1.4},
 {type:'warehouse',x:9,y:0,w:4.5,h:4},{type:'department',x:-10,y:1,w:4.5,h:4},
 {type:'decor',x:8,y:5,w:1.2,h:1.2},{type:'decor',x:-8,y:5,w:1.2,h:1.2}
];
for(let i=0;i<10;i++)state.customers.push({x:(Math.random()-.5)*12,y:7+Math.random()*2,phase:Math.random()*6.28});
const productNames={milk:'Молоко',bread:'Хлеб',beauty:'Косметика',shoes:'Обувь'};

function iso(x,y){const s=42*state.zoom;return{x:W/2+(x-y)*s*.72+state.camX,y:H*.53+(x+y)*s*.36+state.camY}}
function screenToWorld(sx,sy){const s=42*state.zoom,X=(sx-W/2-state.camX)/(.72*s),Y=(sy-H*.53-state.camY)/(.36*s);return{x:(X+Y)/2,y:(Y-X)/2}}
function poly(a,fill,stroke){ctx.beginPath();a.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function diamond(x,y,w,h,fill){poly([{x,y:y-h/2},{x:x+w/2,y},{x,y:y+h/2},{x:x-w/2,y}],fill)}
function label(text,x,y,size=11,fill='#34413b'){ctx.fillStyle=fill;ctx.font='800 '+size+'px Arial';ctx.textAlign='center';ctx.fillText(text,x,y)}

function drawGround(){
 ctx.fillStyle='#b9d4e7';ctx.fillRect(0,0,W,H);
 for(let i=-25;i<=25;i++)for(let j=-25;j<=25;j++){const p=iso(i,j);if(p.x<-100||p.x>W+100||p.y<-100||p.y>H+100)continue;diamond(p.x,p.y,84*state.zoom,42*state.zoom,(i+j)%2?'#86a774':'#8eae7d')}
 const r=iso(0,10);ctx.fillStyle='#58656b';ctx.beginPath();ctx.moveTo(0,r.y-30);ctx.lineTo(W,r.y-220);ctx.lineTo(W,r.y-90);ctx.lineTo(0,r.y+70);ctx.closePath();ctx.fill();
 for(let i=-20;i<20;i++){const p=iso(i,10);ctx.fillStyle='#f4f1df';ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.35);ctx.fillRect(-7,-2,14,4);ctx.restore()}
 // parking / entrance
 const a=iso(0,7);ctx.fillStyle='#d5d8d2';ctx.fillRect(a.x-80*state.zoom,a.y-16*state.zoom,160*state.zoom,8*state.zoom);
}

function drawShopShell(b){
 const p=iso(b.x,b.y),s=42*state.zoom,w=b.w*s*.72,h=b.h*s*.36,z=45*state.zoom;
 diamond(p.x,p.y,w,h,'#dfe6e2','#c3cbc6');
 if(b.type==='shop'){
   ctx.fillStyle='#edf0ea';ctx.fillRect(p.x-w*.34,p.y-z*.15,w*.68,z*.7);
   ctx.fillStyle='#45a95a';ctx.fillRect(p.x-w*.38,p.y-z*.15,w*.76,7*state.zoom);
   ctx.fillStyle='#b9d9e5';ctx.fillRect(p.x-w*.26,p.y,w*.18,z*.33);ctx.fillRect(p.x-w*.03,p.y,w*.18,z*.33);ctx.fillRect(p.x+w*.20,p.y,w*.12,z*.33);
   label('МОЙ МАГАЗИН',p.x,p.y+z*.27,11*state.zoom);
 }else if(b.type==='shelf'){
   ctx.fillStyle='#9b6c43';ctx.fillRect(p.x-16*state.zoom,p.y-14*state.zoom,32*state.zoom,23*state.zoom);
   ctx.fillStyle='#f0d69c';for(let k=0;k<3;k++)ctx.fillRect(p.x-12*state.zoom+k*9*state.zoom,p.y-10*state.zoom,6*state.zoom,5*state.zoom);
 }else if(b.type==='cash'){
   ctx.fillStyle='#d7e0da';ctx.fillRect(p.x-19*state.zoom,p.y-13*state.zoom,38*state.zoom,23*state.zoom);ctx.fillStyle='#42a953';ctx.fillRect(p.x-15*state.zoom,p.y-8*state.zoom,30*state.zoom,5*state.zoom);
 }else if(b.type==='warehouse'||b.type==='storage'){
   ctx.fillStyle='#aab4b2';ctx.fillRect(p.x-34*state.zoom,p.y-20*state.zoom,68*state.zoom,40*state.zoom);ctx.fillStyle='#45a95a';ctx.fillRect(p.x-35*state.zoom,p.y-20*state.zoom,70*state.zoom,7*state.zoom);label(b.type==='storage'?'СКЛАД+':'СКЛАД',p.x,p.y+5*state.zoom,10*state.zoom);
 }else if(b.type==='department'){
   ctx.fillStyle='#f0eee6';ctx.fillRect(p.x-33*state.zoom,p.y-18*state.zoom,66*state.zoom,36*state.zoom);ctx.fillStyle='#c68b9d';ctx.fillRect(p.x-33*state.zoom,p.y-18*state.zoom,66*state.zoom,6*state.zoom);label('ОТДЕЛ',p.x,p.y+5*state.zoom,9*state.zoom);
 }else if(b.type==='expansion'){
   ctx.fillStyle='#d7e0d3';ctx.fillRect(p.x-38*state.zoom,p.y-22*state.zoom,76*state.zoom,44*state.zoom);ctx.fillStyle='#8cb27d';ctx.fillRect(p.x-38*state.zoom,p.y-22*state.zoom,76*state.zoom,6*state.zoom);label('НОВАЯ ПЛОЩАДЬ',p.x,p.y+5*state.zoom,8*state.zoom);
 }else{
   ctx.fillStyle='#4e8d48';ctx.beginPath();ctx.arc(p.x,p.y-17*state.zoom,15*state.zoom,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6e5136';ctx.fillRect(p.x-3*state.zoom,p.y-8*state.zoom,6*state.zoom,15*state.zoom);
 }
 if(state.selected===b){ctx.strokeStyle='#f3bd43';ctx.lineWidth=3;ctx.strokeRect(p.x-w/2-3,p.y-h/2-z/2-3,w+6,h+z+6);ctx.lineWidth=1}
}

function drawCustomers(){
 state.customers.forEach((c,i)=>{const p=iso(c.x,c.y),bob=Math.sin(c.phase)*2*state.zoom;ctx.fillStyle=i%2?'#d67c5e':'#4f7fa5';ctx.beginPath();ctx.arc(p.x,p.y-9*state.zoom+bob,5*state.zoom,0,Math.PI*2);ctx.fill();ctx.fillStyle='#343c39';ctx.fillRect(p.x-3*state.zoom,p.y-5*state.zoom+bob,6*state.zoom,12*state.zoom)})
}
function drawParticles(){state.particles.forEach(pt=>{const p=iso(pt.x,pt.y);ctx.globalAlpha=Math.max(0,pt.life);label(pt.text,p.x,p.y-pt.life*24,14*state.zoom,pt.color);ctx.globalAlpha=1})}

function render(){
 ctx.clearRect(0,0,W,H);drawGround();
 [...state.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawShopShell);
 drawCustomers();drawParticles();
 if(state.buildMode){const m=screenToWorld(mouse.x,mouse.y);const size=state.buildMode==='warehouse'||state.buildMode==='storage'||state.buildMode==='department'||state.buildMode==='expansion'?4.5:2.2;const ghost={type:state.buildMode,x:m.x,y:m.y,w:size,h:state.buildMode==='shelf'||state.buildMode==='cash'?1.4:4};ctx.globalAlpha=.45;drawShopShell(ghost);ctx.globalAlpha=1}
 requestAnimationFrame(render)
}

const mouse={x:W/2,y:H/2,down:false,lastX:0,lastY:0,moved:false};
canvas.addEventListener('pointerdown',e=>{mouse.down=true;mouse.moved=false;mouse.lastX=e.clientX;mouse.lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;if(mouse.down&&!state.buildMode){if(Math.abs(e.clientX-mouse.lastX)+Math.abs(e.clientY-mouse.lastY)>2)mouse.moved=true;state.camX+=e.clientX-mouse.lastX;state.camY+=e.clientY-mouse.lastY;mouse.lastX=e.clientX;mouse.lastY=e.clientY}});
canvas.addEventListener('pointerup',e=>{
 mouse.down=false;
 if(state.buildMode&&!mouse.moved){const m=screenToWorld(e.clientX,e.clientY);placeBuilding(m.x,m.y,state.buildMode)}
 else if(!mouse.moved&&!state.buildMode){selectAt(e.clientX,e.clientY)}
});
canvas.addEventListener('wheel',e=>{e.preventDefault();state.zoom=Math.max(.55,Math.min(1.65,state.zoom*(e.deltaY<0?1.08:.92)))},{passive:false});

function rectFor(b){return{x:b.x-b.w/2,y:b.y-b.h/2,w:b.w,h:b.h}}
function overlap(a,b,pad=.7){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad}
function canPlace(x,y,type){
 const size=(type==='warehouse'||type==='storage'||type==='department'||type==='expansion')?4.5:2.2;
 const h=(type==='shelf'||type==='cash')?1.4:4;
 const test={x:x-size/2,y:y-h/2,w:size,h};
 if(x< -18||x>18||y< -10||y>12)return false;
 return !state.buildings.some(b=>!b.locked&&overlap(test,rectFor(b),.55)) && !(Math.abs(x)<7.5&&Math.abs(y)<5.2);
}
function placeBuilding(x,y,type){
 const cost=prices[type];
 if(state.money<cost){toast('Недостаточно денег');return}
 if(!canPlace(x,y,type)){toast('Здесь нельзя строить');return}
 state.money-=cost;
 const big=['warehouse','storage','department','expansion'].includes(type);
 state.buildings.push({type,x,y,w:big?4.5:2.2,h:big?4:1.4});
 state.buildMode=null;document.getElementById('buildBar').classList.add('hidden');updateHud();toast(names[type]+' построен');
}
function selectAt(sx,sy){
 const m=screenToWorld(sx,sy);let hit=null;
 [...state.buildings].reverse().some(b=>{const r=rectFor(b);if(m.x>r.x-.6&&m.x<r.x+r.w+.6&&m.y>r.y-.6&&m.y<r.y+r.h+.6){hit=b;return true}return false});
 state.selected=hit;
 if(hit&&!hit.locked)openBuildingInfo(hit); else if(hit)toast('Ваш магазин · уровень 1');
}
function openBuildingInfo(b){
 const p=document.getElementById('panel'),c=document.getElementById('panelContent');
 const title=names[b.type]||'Объект';c.innerHTML='<h2>'+title+'</h2><p>Объект работает и приносит пользу магазину.</p><div class="row"><span>Стоимость</span><b>'+prices[b.type].toLocaleString('ru-RU')+' ₽</b></div><div class="row"><span>Состояние</span><b class="green">РАБОТАЕТ</b></div><button class="action" id="upgradeBtn">Улучшить · '+Math.round(prices[b.type]*1.5).toLocaleString('ru-RU')+' ₽</button>';
 p.classList.remove('hidden');
 document.getElementById('upgradeBtn').onclick=()=>{const cost=Math.round(prices[b.type]*1.5);if(state.money<cost)return toast('Недостаточно денег');state.money-=cost;state.rep=Math.min(100,state.rep+2);updateHud();toast(title+' улучшен')};
}

function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1700)}
function updateHud(){
 document.getElementById('money').textContent=Math.round(state.money).toLocaleString('ru-RU')+' ₽';
 document.getElementById('reputation').textContent=Math.round(state.rep);
 document.getElementById('repBar').style.width=state.rep+'%';
 document.getElementById('taskStatus').textContent=state.sold>=3?'ВЫПОЛНЕНО':state.sold+' / 3';
 document.getElementById('stockMilk').textContent=state.stock.milk;
 document.getElementById('stockBread').textContent=state.stock.bread;
 document.getElementById('stockBeauty').textContent=state.stock.beauty;
 document.getElementById('stockShoes').textContent=state.stock.shoes;
 document.getElementById('time').textContent=String(Math.floor(state.hour)).padStart(2,'0')+':'+String(state.minute).padStart(2,'0');
 document.getElementById('day').textContent=state.day;
}
function sell(){
 if(!state.running)return;
 const keys=Object.keys(state.stock).filter(k=>state.stock[k]>0);if(!keys.length){toast('Нет товара на складе');return}
 const k=keys[Math.floor(Math.random()*keys.length)];state.stock[k]--;const earn=state.prices[k];
 state.money+=earn;state.sold++;state.rep=Math.min(100,state.rep+.08);
 const c=state.customers[Math.floor(Math.random()*state.customers.length)];c.x=(Math.random()-.5)*8;c.y=2+Math.random()*4;
 state.particles.push({x:c.x,y:c.y,text:'+'+earn.toLocaleString('ru-RU')+' ₽',color:'#238b3b',life:1});
 if(state.sold===3){state.money+=500;toast('Задание выполнено · +500 ₽')}
 updateHud();
}
function buyStock(k,qty=10){
 const costs={milk:70,bread:45,beauty:320,shoes:1300},cost=costs[k]*qty;
 if(state.money<cost)return toast('Недостаточно денег');
 state.money-=cost;state.stock[k]+=qty;updateHud();toast(productNames[k]+' закуплен · '+qty+' шт.');
}
function advanceTime(){
 state.minute+=state.speed*2;if(state.minute>=60){state.minute-=60;state.hour++;if(state.hour>=24){state.hour=0;state.day++;state.sold=0}}
 updateHud();
}
setInterval(()=>{if(state.running){state.customers.forEach(c=>{c.phase+=.06*state.speed;c.x+=(0-c.x)*.006*state.speed;c.y+=(2-c.y)*.006*state.speed});state.particles.forEach(p=>p.life-=.035*state.speed);state.particles=state.particles.filter(p=>p.life>0);if(Math.random()<.09*state.speed)sell();advanceTime()}},1000);

function openPanel(type){
 const p=document.getElementById('panel'),c=document.getElementById('panelContent');
 const d={
 build:['🏗️ Стройка','Выбирай объект и ставь его прямо на карту.','<div class="build-list">'+Object.keys(prices).map(k=>'<button class="build-choice" data-build2="'+k+'">'+names[k]+'<span>'+prices[k].toLocaleString('ru-RU')+' ₽</span></button>').join('')+'</div>'],
 report:['📊 Отчёт','Показатели магазина за текущий день.','<div class="row"><span>Продажи</span><b class="green">'+Math.round(state.sold*state.prices.milk).toLocaleString('ru-RU')+' ₽</b></div><div class="row"><span>Товаров продано</span><b>'+state.sold+' шт.</b></div><div class="row"><span>Репутация</span><b class="green">'+Math.round(state.rep)+'%</b></div>'],
 prices:['🏷️ Цены','Меняй цены на товары и управляй маржой.',Object.keys(state.prices).map(k=>'<div class="price-row"><span>'+productNames[k]+'</span><div><button data-price="'+k+'" data-delta="-10">−</button><b>'+state.prices[k]+' ₽</b><button data-price="'+k+'" data-delta="10">+</button></div></div>').join('')],
 products:['📦 Товары','Закупай товар и следи за остатками.',Object.keys(state.stock).map(k=>'<div class="row"><span>'+productNames[k]+' · '+state.stock[k]+' шт.</span><button class="mini-action" data-buy="'+k+'">+10</button></div>').join('')],
 development:['🛠️ Развитие','Улучшай магазин, открывай новые площади и увеличивай поток покупателей.','<div class="row"><span>Уровень магазина</span><b>1</b></div><button class="action" id="expandBtn">Расширить магазин · 9 000 ₽</button>'],
 staff:['👨‍💼 Персонал','Сотрудники увеличивают скорость обслуживания.','<div class="row"><span>Сотрудников</span><b>'+state.staff+'</b></div><div class="row"><span>Зарплата/день</span><b>'+state.staff*500+' ₽</b></div><button class="action" id="staffBtn">Нанять сотрудника · 1 500 ₽</button>'],
 ads:['📣 Реклама','Реклама увеличивает поток покупателей.','<div class="row"><span>Эффект</span><b class="green">+'+state.ad+'%</b></div><button class="action" id="adBtn">Запустить рекламу · 800 ₽</button>'],
 bank:['🏦 Банк','Финансы бизнеса.','<div class="row"><span>Баланс</span><b class="green">'+Math.round(state.money).toLocaleString('ru-RU')+' ₽</b></div><button class="action" onclick="toast(\'Кредитная линия будет добавлена позже\')">Получить кредит</button>'],
 rating:['🏆 Рейтинг','Рейтинг зависит от репутации и развития магазина.','<div class="row"><span>Место</span><b>1 248</b></div><div class="row"><span>Репутация</span><b class="green">'+Math.round(state.rep)+'%</b></div>'],
 settings:['⚙️ Настройки','Управление камерой и игрой.','<button class="action" id="resetCam">Сбросить камеру</button>']
 }[type];
 c.innerHTML='<h2>'+d[0]+'</h2><p>'+d[1]+'</p>'+d[2];p.classList.remove('hidden');
 if(type==='build')document.querySelectorAll('[data-build2]').forEach(b=>b.onclick=()=>{state.buildMode=b.dataset.build2;p.classList.add('hidden');document.getElementById('buildBar').classList.remove('hidden');toast('Выбрано: '+names[state.buildMode])});
 if(type==='prices')document.querySelectorAll('[data-price]').forEach(b=>b.onclick=()=>{const k=b.dataset.price;state.prices[k]=Math.max(10,state.prices[k]+Number(b.dataset.delta));openPanel('prices')});
 if(type==='products')document.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{buyStock(b.dataset.buy);openPanel('products')});
 if(type==='development')document.getElementById('expandBtn').onclick=()=>{if(state.money<9000)return toast('Недостаточно денег');state.money-=9000;state.buildings.push({type:'expansion',x:14,y:7,w:4.5,h:4});updateHud();toast('Новая площадь открыта');openPanel('development')};
 if(type==='staff')document.getElementById('staffBtn').onclick=()=>{if(state.money<1500)return toast('Недостаточно денег');state.money-=1500;state.staff++;state.rep=Math.min(100,state.rep+1);updateHud();openPanel('staff')};
 if(type==='ads')document.getElementById('adBtn').onclick=()=>{if(state.money<800)return toast('Недостаточно денег');state.money-=800;state.ad+=10;state.rep=Math.min(100,state.rep+1);updateHud();openPanel('ads')};
 if(type==='settings')document.getElementById('resetCam').onclick=()=>{state.camX=0;state.camY=0;state.zoom=.92;toast('Камера сброшена')};
}

document.querySelectorAll('.menu-btn').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));
document.getElementById('closePanel').onclick=()=>document.getElementById('panel').classList.add('hidden');
document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>{state.buildMode=b.dataset.build;document.getElementById('panel').classList.add('hidden');document.getElementById('buildBar').classList.remove('hidden');toast('Выбрано: '+names[state.buildMode])});
document.getElementById('pauseBtn').onclick=()=>{state.running=false;document.getElementById('pauseBtn').classList.add('active');document.getElementById('playBtn').classList.remove('active')};
document.getElementById('playBtn').onclick=()=>{state.running=true;document.getElementById('playBtn').classList.add('active');document.getElementById('pauseBtn').classList.remove('active')};
document.querySelectorAll('.speed-card button[data-speed]').forEach(b=>b.onclick=()=>{state.speed=Number(b.dataset.speed);document.querySelectorAll('.speed-card button[data-speed]').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
document.getElementById('soundBtn').onclick=()=>document.getElementById('soundBtn').textContent=document.getElementById('soundBtn').textContent==='🔊'?'🔇':'🔊';
updateHud();render();