import {GameState} from "./game-state.js";

export class GameManager{
  constructor(){
    this.state=new GameState();
    this.currentScreen="menu";
    this.state.subscribe(()=>this.autoSave());
    this.saveTimer=null;
  }
  start(){this.state.load();this.showMenu();}
  newGame(){this.state.clearSave();this.state.reset();this.showGame();}
  continueGame(){this.state.load();this.showGame();}
  showMenu(){this.currentScreen="menu";document.getElementById("main-menu").classList.remove("hidden");document.getElementById("game-screen").classList.add("hidden");}
  showGame(){this.currentScreen="game";document.getElementById("main-menu").classList.add("hidden");document.getElementById("game-screen").classList.remove("hidden");window.dispatchEvent(new CustomEvent("game:shown"));}
  autoSave(){clearTimeout(this.saveTimer);this.saveTimer=setTimeout(()=>this.state.save(),250);}
  saveNow(){this.state.save();}
}