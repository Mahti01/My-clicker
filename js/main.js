import {GameManager} from "./core/game-manager.js";
import {initMenu} from "./ui/menu.js";
import {initGameUI} from "./ui/game-ui.js";

const manager=new GameManager();
window.gameManager=manager;
initMenu(manager);
initGameUI(manager);
manager.start();
