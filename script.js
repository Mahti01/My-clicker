const menuScreen=document.getElementById('menuScreen'),gameScreen=document.getElementById('gameScreen'),canvas=document.getElementById('gameCanvas'),ctx=canvas.getContext('2d');
const modal=document.getElementById('modal'),content=document.getElementById('modalContent');let W=0,H=0,dpr=1,cam={x:0,y:40,zoom:1},drag=null,lastTouch=null;
function resize(){dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
addEventListener('resize',resize);
function openModal(html){content.innerHTML=html;modal.classList.remove('hidden')}function closeModal(){modal.classList.add('hidden')}document.getElementById('closeModal').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.remove('show'),1500)}
function startGame(load=false){menuScreen.classList.add('hidden');gameScreen.classList.remove('hidden');if(!load)localStorage.setItem('myStoreSave','1');localStorage.setItem('myStoreSession','active');resize()}
function iso(x,y){return {x:W/2+(x-y)*.72*cam.zoom+cam.x,y:H/2+(x+y)*.36*cam.zoom+cam.y}}
function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function rectIso(x,y,w,h,fill){const a=iso(x,y),b=iso(x+w,y),c=iso(x+w,y+h),d=iso(x,y+h);poly([a,b,c,d],fill,'rgba(60,65,60,.22)')}
function lineIso(x1,y1,x2,y2,stroke,width=1){const a=iso(x1,y1),b=iso(x2,y2);ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function drawTree(x,y,s=1){const p=iso(x,y);ctx.fillStyle='#6f5330';ctx.fillRect(p.x-3*s,p.y-22*s,6*s,22*s);ctx.fillStyle='#8ecb39';ctx.beginPath();ctx.arc(p.x,p.y-27*s,13*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#73ad31';ctx.beginPath();ctx.arc(p.x-8*s,p.y-20*s,9*s,0,Math.PI*2);ctx.fill()}
function drawCar(x,y,scale=1,color='#596269'){const p=iso(x,y);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.28);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-20*scale,1,40*scale,9*scale);ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-20*scale,-8*scale,40*scale,13*scale,4*scale);ctx.fill();ctx.fillStyle='#b9d0d5';ctx.fillRect(-10*scale,-7*scale,19*scale,6*scale);ctx.restore()}
function drawShelf(x,y,w=16){rectIso(x,y,w,6,'#e9e8e1');lineIso(x+2,y+1,x+w-2,y+1,'#a8a7a0',1);for(let i=0;i<4;i++){const p=iso(x+4+i*3,y+2);ctx.fillStyle=i%2?'#f07d4f':'#efc34e';ctx.fillRect(p.x-2,p.y-2,4,3)}}
function drawCheckout(x,y){rectIso(x,y,12,6,'#d9d8d0');const p=iso(x+6,y+3);ctx.fillStyle='#20272a';ctx.fillRect(p.x-4,p.y-5,8,6);ctx.fillStyle='#f1c44e';ctx.fillRect(p.x-1,p.y-3,3,2)}
function drawStore(){// floor and walls
rectIso(-72,-45,144,90,'#f2f1eb');
lineIso(-72,-45,72,-45,'#777b79',3);lineIso(72,-45,72,45,'#777b79',3);lineIso(72,45,-72,45,'#777b79',3);lineIso(-72,45,-72,-45,'#777b79',3);
rectIso(-68,-41,136,82,'#d9dad6');
for(let x=-60;x<61;x+=12)for(let y=-34;y<35;y+=12)rectIso(x,y,10,10,(x+y)%24===0?'#e5e5df':'#deded9');
drawShelf(-48,-28,28);drawShelf(-10,-28,28);drawShelf(28,-28,24);drawShelf(-48,-5,28);drawShelf(-10,-5,28);drawShelf(28,-5,24);drawShelf(-30,18,28);drawShelf(8,18,28);
drawCheckout(-53,29);drawCheckout(-37,29);drawCheckout(27,29);
rectIso(-8,-39,16,7,'#4d5350');const ent=iso(0,-36);ctx.fillStyle='#8fd0e4';ctx.fillRect(ent.x-12,ent.y-3,24,5);
const sp=iso(-58,-36);ctx.fillStyle='#fff';ctx.fillRect(sp.x-15,sp.y-7,30,8);ctx.fillStyle='#b9473f';ctx.fillRect(sp.x-12,sp.y-4,24,3);
}
function draw(){if(gameScreen.classList.contains('hidden'))return;ctx.clearRect(0,0,W,H);ctx.fillStyle='#e6e7e5';ctx.fillRect(0,0,W,H);
cam.zoom=Math.max(.72,Math.min(1.45,cam.zoom));
rectIso(-330,-230,660,460,'#d8d9d5');
// roads
rectIso(-330,-205,660,38,'#b7b9b8');rectIso(-330,167,660,38,'#b7b9b8');rectIso(-205,-230,38,460,'#b7b9b8');rectIso(167,-230,38,460,'#b7b9b8');
for(let x=-310;x<310;x+=28){lineIso(x,-187,x+14,-187,'#eee',2);lineIso(x,187,x+14,187,'#eee',2)}for(let y=-210;y<210;y+=28){lineIso(-187,y,-187,y+14,'#eee',2);lineIso(187,y,187,y+14,'#eee',2)}
// parking
for(let x=-120;x<=120;x+=30){lineIso(x,-145,x,-125,'#fff',1);lineIso(x,125,x,145,'#fff',1)}for(let y=-100;y<=100;y+=28){lineIso(-145,y,-125,y,'#fff',1);lineIso(125,y,145,y,'#fff',1)}
drawCar(-105,-137,.8);drawCar(72,-137,.8,'#798c65');drawCar(108,137,.8,'#5c6671');drawCar(-76,137,.8,'#a5a7a0');
// decoration
[[-175,-175],[175,-175],[-175,175],[175,175],[-205,100],[205,-100]].forEach(a=>drawTree(a[0],a[1],1));
drawStore();
// delivery area
rectIso(82,-82,45,18,'#c8c9c6');const tr=iso(104,-72);ctx.fillStyle='#fff';ctx.fillRect(tr.x-18,tr.y-9,36,12);ctx.fillStyle='#d94c3f';ctx.fillRect(tr.x-12,tr.y-4,24,3);
// label
const lp=iso(0,0);ctx.fillStyle='rgba(35,39,38,.82)';ctx.beginPath();ctx.roundRect(lp.x-58,lp.y-102,116,24,8);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 12px Arial';ctx.textAlign='center';ctx.fillText('МОЙ МАГАЗИН',lp.x,lp.y-86);
}
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.zoom*=e.deltaY<0?1.08:.92;draw()},{passive:false});
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;cam.x=drag.cx+(e.clientX-drag.x);cam.y=drag.cy+(e.clientY-drag.y);draw()});
canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('touchstart',e=>{if(e.touches.length===2)lastTouch={dist:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),zoom:cam.zoom}},{passive:true});
canvas.addEventListener('touchmove',e=>{if(e.touches.length===2&&lastTouch){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);cam.zoom=lastTouch.zoom*d/lastTouch.dist;draw()}},{passive:true});canvas.addEventListener('touchend',()=>lastTouch=null);
document.getElementById('startBtn').onclick=()=>startGame(false);document.getElementById('continueBtn').onclick=()=>startGame(true);
document.getElementById('backBtn').onclick=()=>{gameScreen.classList.add('hidden');menuScreen.classList.remove('hidden')};
document.querySelectorAll('.game-btn').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='settings')openModal('<h2>⚙️ Настройки</h2><p>Настройки камеры, звука и качества подключим дальше.</p>');else if(a==='build')openModal('<h2>🏗️ Строительство</h2><p>Следующий этап — покупка и установка стеллажей, касс и новых помещений.</p>');else if(a==='shop')openModal('<h2>🛒 Товары</h2><p>Здесь появится закупка товара и управление ассортиментом.</p>');else if(a==='staff')openModal('<h2>👥 Персонал</h2><p>Найм кассиров, грузчиков и управляющих будет доступен позже.</p>');else if(a==='finance')openModal('<h2>💰 Финансы</h2><p>Выручка и расходы магазина появятся после подключения продаж.</p>');else openModal('<h2>🏆 Рейтинг</h2><p>Рейтинг магазинов появится позже.</p>')});
if(localStorage.getItem('myStoreSave')){const b=document.getElementById('continueBtn');b.disabled=false;b.classList.remove('disabled')}
