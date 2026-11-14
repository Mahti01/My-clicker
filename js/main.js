import {GameManager} from "./core/game-manager.js";
import {initMenu} from "./ui/menu.js";
import {initGameUI} from "./ui/game-ui.js";
import {CameraController} from "./world/camera.js";

const manager=new GameManager();window.gameManager=manager;
initMenu(manager);initGameUI(manager);
let camera=null;
window.addEventListener("game:shown",()=>{if(!camera)camera=new CameraController(document.getElementById("world"));});
manager.start();