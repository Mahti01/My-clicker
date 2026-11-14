const PANELS={
  city:{title:"Город",body:"Город развивается через строительство на сетке. Выбирай свободные клетки и размещай здания."},
  shop:{title:"Магазин",body:"Магазин будет отдельной системой с категориями товаров, ценами и покупками через единый Economy/Game State."},
  economy:{title:"Экономика",body:"Все денежные операции проходят через единую экономическую систему. Доходы зданий добавим следующим этапом."},
  build:{title:"Строительство",body:"Выбери здание или дорогу. Стоимость списывается сразу после успешного размещения."},
  storage:{title:"Склад",body:"Ресурсы города будут храниться централизованно и изменяться только через игровые системы."},
  settings:{title:"Настройки",body:"Настройки и сохранение будут расширены на следующем этапе."}
};

export function initGameUI(manager){
  const panel=document.getElementById("panel"),money=document.getElementById("money-value"),level=document.getElementById("level-value"),status=document.getElementById("save-status");
  const renderState=state=>{money.textContent=state.money.toLocaleString("ru-RU")+" ₽";level.textContent="Ур. "+state.level;};
  manager.state.subscribe(renderState);renderState(manager.state.get());

  document.querySelectorAll(".tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("is-active"));tab.classList.add("is-active");
      const data=PANELS[tab.dataset.tab];panel.innerHTML="<h2>"+data.title+"</h2><p>"+data.body+"</p>";panel.classList.remove("hidden");
      window.dispatchEvent(new CustomEvent("ui:tab",{detail:{tab:tab.dataset.tab,panel}}));
    });
  });
  window.addEventListener("game:shown",()=>{panel.classList.add("hidden");status.textContent="Сохранено";});
}
