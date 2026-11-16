const modal=document.getElementById('modal');
const content=document.getElementById('modalContent');
function openModal(html){content.innerHTML=html;modal.classList.remove('hidden')}
function closeModal(){modal.classList.add('hidden')}
document.getElementById('closeModal').onclick=closeModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

document.getElementById('startBtn').onclick=()=>{
  localStorage.removeItem('myStoreSave');
  localStorage.setItem('myStoreSession','new');
  openModal('<h2>Новый магазин</h2><p>Создание новой игры готово. Следующим этапом подключим первый магазин с одной кассой и одной полкой.</p><button class="menu-button" onclick="closeModal()">Продолжить</button>');
};

document.getElementById('ratingBtn').onclick=()=>{
  openModal('<h2>🏆 Рейтинг</h2><p>Таблица лучших магазинов появится на следующем этапе.</p>');
};

document.getElementById('settingsBtn').onclick=()=>{
  openModal('<h2>⚙ Настройки</h2><div class="option"><span>Звук</span><span>Вкл.</span></div><div class="option"><span>Музыка</span><span>Вкл.</span></div><div class="option"><span>Качество</span><span>Высокое</span></div>');
};

if(localStorage.getItem('myStoreSave')){
  const b=document.getElementById('continueBtn');
  b.disabled=false;b.classList.remove('disabled');
  b.onclick=()=>openModal('<h2>▶ Продолжить игру</h2><p>Сохранение найдено. Игровой экран подключим следующим этапом.</p>');
}
