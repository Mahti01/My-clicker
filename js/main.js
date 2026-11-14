import {GameManager} from "./core/game-manager.js";
import {initMenu} from "./ui/menu.js";
import {initGameUI} from "./ui/game-ui.js";
import {CameraController} from "./world/camera.js";
import {WorldController} from "./world/world.js";
import {BuildingSystem} from "./world/buildings.js";
import {RoadSystem} from "./world/roads.js";
import {Economy} from "./core/economy.js";

const manager=new GameManager();window.gameManager=manager;
initMenu(manager);initGameUI(manager);

let camera=null,world=null,buildings=null,roads=null;
function initWorld(){
  if(world)return;
  const worldEl=document.getElementById("world");
  camera=new CameraController(worldEl);
  world=new WorldController(worldEl,manager.state);
  const economy=new Economy(manager.state);
  buildings=new BuildingSystem(manager.state,economy,world);
  roads=new RoadSystem(manager.state,economy,world);
  world.setSystems(roads,buildings);
  window.cityWorld={world,camera,buildings,roads};
}
window.addEventListener("game:shown",initWorld);

window.addEventListener("ui:tab",e=>{
  if(e.detail.tab!=="build"||!buildings||!roads)return;
  const panel=e.detail.panel;
  const cards=buildings.getCatalog().map(b=>`<button class="build-card" data-build="${b.id}"><span class="build-card__icon">${b.icon}</span><span><strong>${b.name}</strong><small>${b.description}</small></span><b>${b.cost.toLocaleString("ru-RU")} ₽</b></button>`).join("");
  panel.innerHTML=`<div class="panel__head"><div><h2>Строительство</h2><p>Выбери объект и нажми на свободную клетку карты.</p></div><button class="button button--small" data-cancel-build>Отмена</button></div>
  <div class="build-card-list">${cards}</div>
  <button class="build-card build-card--road" data-build-road><span class="build-card__icon">🛣️</span><span><strong>Дорога</strong><small>1 клетка • 120 ₽</small></span><b>120 ₽</b></button>`;
  panel.querySelectorAll("[data-build]").forEach(btn=>btn.addEventListener("click",()=>buildings.select(btn.dataset.build)));
  panel.querySelector("[data-build-road]").addEventListener("click",()=>roads.select());
  panel.querySelector("[data-cancel-build]").addEventListener("click",()=>{buildings.cancel();roads.cancel();});
});

manager.start();
