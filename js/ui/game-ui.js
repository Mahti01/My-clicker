const PANELS={
  city:{title:"Город",body:"Центральная площадь и базовая городская сцена готовы. Следующим этапом добавим полноценную карту и объекты."},
  shop:{title:"Магазин",body:"Магазин будет отдельной системой с категориями товаров, ценами и покупками через единый Economy/Game State."},
  economy:{title:"Экономика",body:"Деньги и опыт уже проходят через Game State. Экономические здания и доходы добавим следующим этапом."},
  build:{title:"Строительство",body:"Система строительства подготовлена архитектурно. Здесь появятся категории зданий, стоимость и размещение на карте."},
  storage:{title:"Склад",body:"Ресурсы города будут храниться централизованно и изменяться только через игровые системы."},
  settings:{title:"Настройки",body:"На следующем этапе добавим звук, музыку, качество графики, управление и сброс сохранения."}
};

export function initGameUI(manager){
  const panel=document.getElementById("panel");
  const money=document.getElementById("money-value");
  const level=document.getElementById("level-value");
  const status=document.getElementById("save-status");
  const renderState=state=>{
    money.textContent=state.money.toLocaleString("ru-RU")+" ₽";
    level.textContent="Ур. "+state.level;
  };
  manager.state.subscribe(renderState);renderState(manager.state.get());

  document.querySelectorAll(".tab").forEach(tab=>{
    tab.addEventListener("click",()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("is-active"));
      tab.classList.add("is-active");
      const data=PANELS[tab.dataset.tab];
      panel.innerHTML="<h2>"+data.title+"</h2><p>"+data.body+"</p>";
      panel.classList.remove("hidden");
    });
  });
  window.addEventListener("game:shown",()=>{panel.classList.add("hidden");status.textContent="Сохранено";});
}