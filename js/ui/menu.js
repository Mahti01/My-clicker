export function initMenu(manager){
  const continueButton=document.getElementById("continue-button");
  const refresh=()=>continueButton.disabled=!manager.state.hasSave();
  refresh();
  document.querySelectorAll("[data-action]").forEach(button=>{
    button.addEventListener("click",()=>{
      const action=button.dataset.action;
      if(action==="new-game")manager.newGame();
      if(action==="continue-game")manager.continueGame();
      if(action==="settings")alert("Настройки подключим на следующем этапе.");
      if(action==="menu")manager.showMenu();
    });
  });
  manager.state.subscribe(refresh);
}