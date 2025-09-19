// main.js
function initDictionary(){
  // TODO: todo o código que você colocou em dictionary.js
  // dictionary.js

// ============================================
// Configurações e array de frases por página
// ============================================

// Cada página pode ter seu próprio id ou nome
// Você pode criar um atributo data-page no <body> para diferenciar
const pageId = document.body.dataset.page || 'default';

// frases armazenadas no localStorage por página
let phrases = JSON.parse(localStorage.getItem('phrasesDictionary_' + pageId)) || [];

// ============================================
// Funções de renderização
// ============================================
function render(containerSelector = '#phrases') {
    const container = document.querySelector(containerSelector);
    if(!container) return;

    container.innerHTML = '';
    phrases.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'phrase-card';
        card.innerHTML = `
            <span>${item.w}</span>
            <small>${item.t}</small>
            <div class="pron">${item.p}</div>
            <div class="card-actions">
                <button class="chip speakBtn">🎙️ Falar</button>
                <button class="chip" onclick="speak('${escape(item.w)}')">Ouvir</button>
                <button class="chip" onclick="deletePhrase(${index})" style="background:#f87171;color:#0f172a;">Excluir</button>
            </div>
            <div class="status">—</div>
            <div class="wordCompare"></div>
        `;
        container.appendChild(card);

        const speakBtn = card.querySelector('.speakBtn');
        const statusEl = card.querySelector('.status');
        const wordCompareEl = card.querySelector('.wordCompare');

        speakBtn.onclick = () => startRecognition(item, statusEl, wordCompareEl);
    });
}

// ============================================
// Funções auxiliares
// ============================================
function deletePhrase(index){
    if(confirm('Deseja realmente excluir esta frase?')){
        phrases.splice(index,1);
        localStorage.setItem('phrasesDictionary_' + pageId, JSON.stringify(phrases));
        render();
    }
}

function escape(s){ return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

function speak(text){
    if('speechSynthesis' in window){
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    } else alert('TTS não disponível no seu navegador.');
}

function normalizeText(s){
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.,!?;:]/g,'').trim();
}

function levenshtein(a,b){
    if(a===b) return 0;
    const al=a.length, bl=b.length;
    if(al===0) return bl;
    if(bl===0) return al;
    let v0=new Array(bl+1),v1=new Array(bl+1);
    for(let j=0;j<=bl;j++) v0[j]=j;
    for(let i=0;i<al;i++){
        v1[0]=i+1;
        for(let j=0;j<bl;j++){
            const cost=a[i]===b[j]?0:1;
            v1[j+1]=Math.min(v1[j]+1, v0[j+1]+1, v0[j]+cost);
        }
        [v0,v1]=[v1,v0];
    }
    return v0[bl];
}

// ============================================
// Função de reconhecimento de voz
// ============================================
function startRecognition(item, statusEl, wordCompareEl){
    if(!('webkitSpeechRecognition' in window)){
        statusEl.textContent = 'Seu navegador não suporta reconhecimento de voz';
        statusEl.style.color = '#ef4444';
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = ()=>{ statusEl.textContent='Ouvindo... fale agora'; statusEl.style.color='#38bdf8'; }
    recognition.onerror = (e)=>{ statusEl.textContent='Erro: '+e.error; statusEl.style.color='#ef4444'; }
    recognition.onresult = (ev)=>{
        const spoken = ev.results[0][0].transcript;
        statusEl.textContent = `"${spoken}" → "${item.w}"`;
        const correct = normalizeText(spoken) === normalizeText(item.w);
        statusEl.style.color = correct ? '#16a34a' : '#ef4444';
        renderWordComparison(normalizeText(item.w), normalizeText(spoken), wordCompareEl);
    }
    recognition.start();
}

function renderWordComparison(expected, spoken, container){
    container.innerHTML = '';
    const expWords = expected.split(' ').filter(Boolean);
    const spWords = spoken.split(' ').filter(Boolean);
    for(let i=0;i<expWords.length;i++){
        const exp = expWords[i];
        const sp = spWords[i] || '';
        const correct = levenshtein(exp, sp)/Math.max(exp.length, sp.length) <= 0.4;
        const div = document.createElement('div');
        div.textContent = sp+' → '+exp;
        div.className = correct ? 'ok' : 'err';
        container.appendChild(div);
    }
}

// ============================================
// Adicionar frase via formulário
// ============================================
function initForm(formSelector='#addPhraseForm'){
    const form = document.querySelector(formSelector);
    if(!form) return;
    form.onsubmit = function(e){
        e.preventDefault();
        const w = form.querySelector('#engPhrase').value.trim();
        const t = form.querySelector('#ptPhrase').value.trim();
        const p = form.querySelector('#pronPhrase')?.value.trim() || '';
        if(w && t){
            phrases.push({w,t,p});
            localStorage.setItem('phrasesDictionary_' + pageId, JSON.stringify(phrases));
            render();
            form.reset();
        }
    }
}

// ============================================
// Inicialização automática
// ============================================
document.addEventListener('DOMContentLoaded', ()=>{
    render();
    initForm();
});

}

// Cada página define um "tipo" no <body> via data-page
const pageType = document.body.dataset.page || 'default';

// Objetos de inicialização por tipo de página
const PageModules = {

  alfabet: function() {
    // Código específico da página de alfabeto
      const data = [
    {l:'A', w:'A', p:'ei'},
    {l:'B', w:'B', p:'bi'},
    {l:'C', w:'C', p:'ci'},
    {l:'D', w:'D', p:'di'},
    {l:'E', w:'E', p:'i'},
    {l:'F', w:'F', p:'éf'},
    {l:'G', w:'G', p:'dji'},
    {l:'H', w:'H', p:'êitch'},
    {l:'I', w:'I', p:'ai'},
    {l:'J', w:'J', p:'djei'},
    {l:'K', w:'K', p:'kei'},
    {l:'L', w:'L', p:'él'},
    {l:'M', w:'M', p:'ém'},
    {l:'N', w:'N', p:'én'},
    {l:'O', w:'O', p:'ou'},
    {l:'P', w:'P', p:'pi'},
    {l:'Q', w:'Q', p:'kiu'},
    {l:'R', w:'R', p:'ár'},
    {l:'S', w:'S', p:'és'},
    {l:'T', w:'T', p:'ti'},
    {l:'U', w:'U', p:'iu'},
    {l:'V', w:'V', p:'vi'},
    {l:'W', w:'W', p:'dábl iú'},
    {l:'X', w:'X', p:'éks'},
    {l:'Y', w:'Y', p:'uai'},
    {l:'Z', w:'Z', p:'zi'}
  ];

  const container = document.getElementById('letters');
  const togglePron = document.getElementById('togglePron');
  const shuffleBtn = document.getElementById('shuffle');
  const resetBtn = document.getElementById('reset');

  let showPron = true;
  let current = [...data];

  function render(){
    container.innerHTML = '';
    current.forEach(item => {
      const card = document.createElement('div');
      card.className='letter-card';
      card.innerHTML = `
        <span>${item.l}</span>
        <small>${item.w}</small>
        <div class="pron" style="display:${showPron?'block':'none'}">${item.p}</div>
        <div class="card-actions">
          <button class="chip" onclick="speak('${item.l}')">Ouvir</button>
        </div>`;
      container.appendChild(card);
    });
  }

function speakText(text){
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } else alert('TTS não disponível');
}

  togglePron.onclick = ()=>{ showPron = !showPron; render(); };
  shuffleBtn.onclick = ()=>{ current = current.sort(()=>Math.random()-0.5); render(); };
  resetBtn.onclick = ()=>{ current = [...data]; render(); window.scrollTo({top:0,behavior:'smooth'}); };

  // QUIZ --------------------------------------------------
  const qEl = document.getElementById('quizQ');
  const aEl = document.getElementById('quizA');
  const hintEl = document.getElementById('hint');
  const checkBtn = document.getElementById('check');
  const skipBtn = document.getElementById('skip');
  const speakQBtn = document.getElementById('speakQ');

  let quizItem = null;

  function newQuestion(){
    quizItem = data[Math.floor(Math.random()*data.length)];
    const mode = Math.random() < 0.5 ? 'l2w' : 'w2l';
    quizItem.mode = mode;
    aEl.value = '';
    hintEl.textContent = '';
    if(mode==='l2w'){ 
      qEl.textContent = `Como se pronuncia a letra ${quizItem.l} em inglês?`;
    } else { 
      qEl.textContent = `Qual é a letra que se pronuncia "${quizItem.w}"?`;
    }
    aEl.focus();
  }

  function checkAnswer(){
    const ans = aEl.value.trim().toUpperCase();
    if(quizItem.mode==='l2w'){
      if(ans === quizItem.w.toUpperCase()){
        hintEl.innerHTML = `<span class='ok'>✔ Correto!</span> ${quizItem.l} = ${quizItem.w}`;
        newQuestion();
      } else {
        hintEl.innerHTML = `<span class='bad'>✖ Ainda não.</span> Dica: começa com <b>${quizItem.w[0]}</b>.`;
      }
    } else {
      if(ans === quizItem.l){
        hintEl.innerHTML = `<span class='ok'>✔ Correto!</span> ${quizItem.w} = ${quizItem.l}`;
        newQuestion();
      } else {
        hintEl.innerHTML = `<span class='bad'>✖ Ainda não.</span> Tente novamente.`;
      }
    }
  }

  checkBtn.onclick = checkAnswer;
  aEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkAnswer(); });
  skipBtn.onclick = newQuestion;
  speakQBtn.onclick = ()=>{ if(quizItem) speak(quizItem.l); };

  render();
  newQuestion();
    console.log("Página Alfabeto carregada");
    // Exemplo: renderizar letras, sons, quiz
  },

  numeros: function() {
    console.log("Página Números carregada");
    // Exemplo: renderizar números, pronúncia, quiz
  },

  paises: function() {
    console.log("Página Países carregada");
    // Exemplo: renderizar lista de países, bandeiras
  },

  frases: function() {
    console.log("Página Frases carregada");
    // Aqui entra todo o código do seu dicionário de frases
    if(typeof initDictionary === 'function') initDictionary();
  },

  default: function() {
    console.log("Nenhum módulo específico, carregando padrão");
  }

};

// Inicializa o módulo correspondente
document.addEventListener('DOMContentLoaded', ()=>{
    (PageModules[pageType] || PageModules['default'])();
});
