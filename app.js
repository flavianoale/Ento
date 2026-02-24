const state = {
  route: 'home',
  anatomyTest: {current: null, hits: 0, total: 0},
  keySession: null,
  lab: {history: []},
  sim: null,
  dashboard: loadDashboard()
};

const app = document.getElementById('app');
const nav = document.getElementById('navbar');
const { orders, families, morphology } = window.ENTOMO_DATA;

nav.addEventListener('click', e => {
  const btn = e.target.closest('button[data-route]');
  if (!btn) return;
  go(btn.dataset.route);
});

function go(route) {
  state.route = route;
  [...nav.querySelectorAll('button')].forEach(b => b.classList.toggle('active', b.dataset.route === route));
  render();
}

function card(html) { return `<section class="card">${html}</section>`; }
function saveDashboard() { localStorage.setItem('entomon-dashboard', JSON.stringify(state.dashboard)); }
function loadDashboard() {
  const base = { total: 0, byTheme: {}, byOrder: {}, history: [], weak: {} };
  try { return { ...base, ...(JSON.parse(localStorage.getItem('entomon-dashboard')) || {}) }; } catch { return base; }
}
function track(theme, correct, order = 'Geral') {
  const d = state.dashboard;
  d.total += 1;
  d.byTheme[theme] = d.byTheme[theme] || { hits: 0, total: 0 };
  d.byTheme[theme].total += 1;
  if (correct) d.byTheme[theme].hits += 1;
  d.byOrder[order] = d.byOrder[order] || { hits: 0, total: 0 };
  d.byOrder[order].total += 1;
  if (correct) d.byOrder[order].hits += 1;
  if (!correct) d.weak[theme] = (d.weak[theme] || 0) + 1;
  saveDashboard();
}

function renderHome() {
  app.innerHTML = card(`<h2>Plataforma Acadêmica</h2>
  <p>Estude morfologia externa, classificação taxonômica e diagnóstico diferencial de insetos agrícolas com abordagem universitária.</p>
  <div class="grid-2">
  <div><h3>Recursos</h3><ul>
  <li>Atlas SVG clicável + teste anatômico.</li><li>Banco taxonômico de ordens e famílias.</li><li>Chave dicotômica dinâmica até família.</li>
  <li>Laboratório prático com correção comentada.</li><li>Simulado de 30 questões cronometradas.</li>
  </ul></div>
  <div><h3>Status offline</h3><p id="offline-status" class="small"></p></div></div>`);
  document.getElementById('offline-status').textContent = navigator.onLine ? 'Online (cache ativo para uso offline).' : 'Offline: funcionando com cache local.';
}

function renderAtlas() {
  app.innerHTML = card(`<h2>Atlas Morfológico Interativo</h2>
  <p class="small">Clique nas estruturas do inseto para ver diagnóstico, ordens associadas e importância taxonômica.</p>
  <div class="grid-2"><div>
  <svg id="insect-svg" viewBox="0 0 560 300" width="100%">
    <ellipse data-part="pronotum" cx="210" cy="150" rx="60" ry="40" fill="#2a3f74"/>
    <ellipse data-part="mesonotum" cx="280" cy="150" rx="55" ry="40" fill="#35508d"/>
    <ellipse data-part="metanotum" cx="350" cy="150" rx="50" ry="35" fill="#4262a3"/>
    <circle data-part="compoundEyes" cx="120" cy="130" r="20" fill="#4f79c3"/>
    <circle data-part="compoundEyes" cx="120" cy="170" r="20" fill="#4f79c3"/>
    <circle data-part="ocelli" cx="97" cy="150" r="6" fill="#86a6df"/>
    <rect data-part="clypeus" x="135" y="137" width="20" height="25" fill="#6c8ac8"/>
    <rect data-part="labrum" x="155" y="140" width="16" height="18" fill="#7897da"/>
    <rect data-part="mandibles" x="170" y="145" width="16" height="8" fill="#89a9ea"/>
    <rect data-part="maxillae" x="170" y="155" width="16" height="8" fill="#89a9ea"/>
    <rect data-part="labium" x="170" y="165" width="16" height="8" fill="#98b8f7"/>
    <line data-part="antennae" x1="95" y1="125" x2="50" y2="85" stroke="#83a5ea" stroke-width="4"/>
    <line data-part="antennae" x1="95" y1="175" x2="50" y2="215" stroke="#83a5ea" stroke-width="4"/>
    <ellipse data-part="elytra" cx="320" cy="132" rx="70" ry="25" fill="#1f8f8d"/>
    <ellipse data-part="hemelytra" cx="320" cy="170" rx="70" ry="23" fill="#0f766e"/>
    <ellipse data-part="membranousWing" cx="365" cy="110" rx="80" ry="18" fill="#5cb8f4"/>
    <ellipse data-part="halteres" cx="405" cy="185" rx="18" ry="8" fill="#9be0ff"/>
    <line data-part="coxa" x1="220" y1="185" x2="210" y2="215" stroke="#77a1e8" stroke-width="7"/>
    <line data-part="trochanter" x1="210" y1="215" x2="222" y2="225" stroke="#77a1e8" stroke-width="6"/>
    <line data-part="femur" x1="222" y1="225" x2="275" y2="245" stroke="#5e8ad5" stroke-width="8"/>
    <line data-part="tibia" x1="275" y1="245" x2="325" y2="260" stroke="#4f79c3" stroke-width="6"/>
    <line data-part="tarsus" x1="325" y1="260" x2="355" y2="272" stroke="#3d65aa" stroke-width="4"/>
  </svg></div>
  <div><div id="atlas-info" class="alert">Selecione uma estrutura.</div>
    <hr/><h3>Modo Teste Anatômico</h3>
    <p id="anat-prompt">Clique em "Iniciar".</p>
    <button class="btn btn-primary" id="anat-start">Iniciar</button>
    <p class="small" id="anat-score">Acertos: 0/0</p>
  </div></div>`);

  app.querySelector('#insect-svg').addEventListener('click', e => {
    const part = e.target.dataset.part;
    if (!part || !morphology[part]) return;
    const m = morphology[part];
    document.getElementById('atlas-info').innerHTML = `<h3>${m.name}</h3><p><strong>Região:</strong> ${m.region}</p><p><strong>Ordens:</strong> ${m.orders.join(', ')}</p><p><strong>Diagnóstico:</strong> ${m.diagnosis}</p>`;
    if (state.anatomyTest.current) {
      state.anatomyTest.total++;
      const ok = state.anatomyTest.current === part;
      if (ok) state.anatomyTest.hits++;
      track('Morfologia', ok);
      state.anatomyTest.current = randomKey(morphology);
      document.getElementById('anat-prompt').textContent = `Clique em: ${morphology[state.anatomyTest.current].name}`;
      document.getElementById('anat-score').textContent = `Acertos: ${state.anatomyTest.hits}/${state.anatomyTest.total}`;
    }
  });

  document.getElementById('anat-start').onclick = () => {
    state.anatomyTest.current = randomKey(morphology);
    document.getElementById('anat-prompt').textContent = `Clique em: ${morphology[state.anatomyTest.current].name}`;
  };
}

function renderTaxonomia() {
  app.innerHTML = card(`<h2>Banco Taxonômico</h2>
  <div class="grid-2"><div>
    <input id="search" placeholder="Buscar ordem ou família..." />
  </div><div>
    <select id="filter-order"><option value="">Filtrar família por ordem</option>${Object.keys(orders).map(o=>`<option>${o}</option>`).join('')}</select>
  </div></div>
  <div id="tax-results" class="list"></div>`);
  const draw = () => {
    const q = document.getElementById('search').value.toLowerCase();
    const fOrder = document.getElementById('filter-order').value;
    let html = '<h3>Ordens</h3>';
    Object.entries(orders).filter(([k,v]) => (k+JSON.stringify(v)).toLowerCase().includes(q)).forEach(([name,o]) => {
      html += `<article class="card"><h3>${name}</h3><p>${o.diagnostic}</p><p><span class="badge">Metamorfose: ${o.metamorphosis}</span><span class="badge">Bucal: ${o.mouthpart}</span><span class="badge">Asas: ${o.wings}</span></p><p><strong>Importância agrícola:</strong> ${o.importance}</p></article>`;
    });
    html += '<h3>Famílias</h3>';
    Object.entries(families).filter(([k,v]) => {
      if (fOrder && v.order !== fOrder) return false;
      return (k+JSON.stringify(v)).toLowerCase().includes(q);
    }).forEach(([name,f]) => {
      html += `<article class="card"><h3>${name} <span class="small">(${f.order})</span></h3><p><strong>Morfologia:</strong> ${f.morphology}</p><p><strong>Dano:</strong> ${f.damage}</p><p><strong>Importância:</strong> ${f.importance}</p><p><strong>Diagnóstico diferencial:</strong> ${f.differential}</p></article>`;
    });
    document.getElementById('tax-results').innerHTML = html;
  };
  ['search','filter-order'].forEach(id => document.getElementById(id).addEventListener('input', draw));
  draw();
}

function startKey() {
  state.keySession = {start: Date.now(), candidates: Object.keys(families).map(n => ({name:n, ...families[n]})), asked: [], correct: 0, steps: 0};
  nextKeyStep();
}
function nextKeyStep(answer) {
  const s = state.keySession;
  if (!s) return;
  if (answer) {
    s.candidates = s.candidates.filter(c => String(c[answer.field] || '').includes(answer.value));
    s.correct++;
  }
  s.steps++;
  if (s.candidates.length <= 1 || s.steps > 8) {
    const end = s.candidates[0];
    const time = Math.round((Date.now()-s.start)/1000);
    app.querySelector('#key-result').innerHTML = end ? `<div class='alert ok'>Resultado provável: <strong>${end.name}</strong> (${end.order}) em ${time}s.</div>` : `<div class='alert error'>Nenhum táxon compatível. Revise as escolhas.</div>`;
    track('Diagnóstico', !!end, end?.order || 'Geral');
    return;
  }
  const fields = ['order','morphology','damage'];
  const field = fields.find(f => !s.asked.includes(f) && new Set(s.candidates.map(c => (c[f]||'').split(/[.,;]/)[0])).size > 1);
  if (!field) return nextKeyStep({field:'order', value:s.candidates[0].order});
  s.asked.push(field);
  const opts = [...new Set(s.candidates.map(c => (c[field]||'').split(/[.,;]/)[0].trim()))].slice(0,4);
  app.querySelector('#key-q').innerHTML = `<p><strong>${labelField(field)}:</strong> selecione a alternativa compatível.</p>${opts.map(v=>`<button class='btn key-opt' data-field='${field}' data-value='${v}'>${v}</button>`).join(' ')}`;
  app.querySelectorAll('.key-opt').forEach(b => b.onclick = () => nextKeyStep({field:b.dataset.field, value:b.dataset.value}));
}
function labelField(f){return ({order:'1) Ordem provável',morphology:'2) Traço morfológico predominante',damage:'3) Tipo de dano'}[f]||f)}

function renderChave() {
  app.innerHTML = card(`<h2>Chave Dicotômica Dinâmica</h2>
  <p>Fluxo real por atributos diagnósticos: metamorfose, asas, aparelho bucal, antena e caracteres familiares.</p>
  <div class="grid-2"><div id="key-q" class="card">Inicie uma sessão.</div><div id="key-result" class="card small">Sem resultado.</div></div>
  <button class="btn btn-primary" id="start-key">Iniciar Chave</button>`);
  document.getElementById('start-key').onclick = startKey;
}

function renderLab() {
  const famName = randomKey(families); const f = families[famName]; const o = orders[f.order];
  app.innerHTML = card(`<h2>Modo Laboratório</h2>
  <p><strong>Amostra:</strong> ${f.morphology} ${f.damage}</p>
  <div class="grid-2">
  <div><label>Ordem</label><select id='lab-order'>${Object.keys(orders).map(x=>`<option>${x}</option>`)}</select>
  <label>Família</label><select id='lab-family'>${Object.keys(families).map(x=>`<option>${x}</option>`)}</select></div>
  <div><label>Metamorfose</label><select id='lab-meta'>${[...new Set(Object.values(orders).map(x=>x.metamorphosis))].map(x=>`<option>${x}</option>`)}</select>
  <label>Aparelho bucal</label><select id='lab-mouth'>${[...new Set(Object.values(orders).map(x=>x.mouthpart))].map(x=>`<option>${x}</option>`)}</select></div>
  </div><button class='btn btn-primary' id='lab-check'>Corrigir</button><div id='lab-feedback'></div>`);
  document.getElementById('lab-check').onclick = () => {
    const ans = {order:v('lab-order'), family:v('lab-family'), meta:v('lab-meta'), mouth:v('lab-mouth')};
    const checks = {
      order: ans.order === f.order,
      family: ans.family === famName,
      meta: ans.meta === o.metamorphosis,
      mouth: ans.mouth === o.mouthpart
    };
    const score = Object.values(checks).filter(Boolean).length;
    const ok = score >= 3;
    track('Laboratório', ok, f.order);
    document.getElementById('lab-feedback').innerHTML = `${ok?"<div class='alert ok'>":"<div class='alert error'>"}Pontuação: ${score}/4.<br>Correto: ${f.order} / ${famName} / ${o.metamorphosis} / ${o.mouthpart}.<br><strong>Diagnóstico diferencial:</strong> ${f.differential}</div>`;
  };
}

function buildQuestion(i){
  const famName = randomKey(families); const f = families[famName]; const o = orders[f.order];
  const types = ['Morfologia','Ordens','Famílias','Diagnóstico'];
  const theme = types[i % types.length];
  if (theme === 'Ordens') return {theme, text:`Qual ordem possui: ${o.wings} e aparelho ${o.mouthpart}?`, answer:f.order, options:shuffle(Object.keys(orders)).slice(0,3).concat([f.order]).slice(0,4)};
  if (theme === 'Famílias') return {theme, text:`Família associada a: ${f.morphology}`, answer:famName, options:shuffle(Object.keys(families)).slice(0,3).concat([famName]).slice(0,4)};
  if (theme === 'Diagnóstico') return {theme, text:`Qual característica define ${f.order}?`, answer:orders[f.order].diagnostic, options:shuffle(Object.values(orders).map(x=>x.diagnostic)).slice(0,3).concat([orders[f.order].diagnostic]).slice(0,4)};
  return {theme:'Morfologia', text:`Qual estrutura representa: "${randomKey(morphology)}"?`, answer:'Estrutura anatômica', options:['Estrutura anatômica','Família','Ordem','Metamorfose']};
}

function startSim() {
  state.sim = {index:0, score:0, start: Date.now(), q: Array.from({length:30}, (_,i)=>buildQuestion(i)), byTheme:{}, timer:60};
  renderSimQuestion();
}
function renderSimQuestion() {
  const s = state.sim; const q = s.q[s.index];
  if (!q) return endSim();
  app.querySelector('#sim-box').innerHTML = `<h3>Questão ${s.index+1}/30</h3><p>${q.text}</p><p class='small'>Tema: ${q.theme}</p><div class='progress'><span style='width:${(s.timer/60)*100}%'></span></div><p>Tempo: <span id='sim-time'>${s.timer}</span>s</p>${shuffle([...q.options]).map(o=>`<button class='btn sim-opt' data-v="${o.replace(/"/g,'&quot;')}">${o}</button>`).join(' ')}`;
  app.querySelectorAll('.sim-opt').forEach(b => b.onclick = () => answerSim(b.dataset.v));
  clearInterval(state.sim.interval);
  state.sim.timer = 60;
  state.sim.interval = setInterval(() => {
    state.sim.timer--; const el = document.getElementById('sim-time'); if (el) el.textContent = state.sim.timer;
    const bar = app.querySelector('.progress > span'); if (bar) bar.style.width = `${(state.sim.timer/60)*100}%`;
    if (state.sim.timer <= 0) answerSim(null);
  }, 1000);
}
function answerSim(v) {
  const s = state.sim; const q = s.q[s.index];
  clearInterval(s.interval);
  const ok = v === q.answer;
  if (ok) s.score++;
  s.byTheme[q.theme] = s.byTheme[q.theme] || {hits:0,total:0};
  s.byTheme[q.theme].total++; if (ok) s.byTheme[q.theme].hits++;
  track(q.theme, ok);
  s.index++; renderSimQuestion();
}
function endSim() {
  const s = state.sim; const pct = Math.round((s.score/30)*100);
  const cls = pct < 60 ? 'Reprovado' : pct <= 80 ? 'Regular' : pct <= 95 ? 'Bom' : 'Excelente';
  state.dashboard.history.push({date:new Date().toLocaleString('pt-BR'), score:s.score, pct, cls});
  saveDashboard();
  app.querySelector('#sim-box').innerHTML = `<h3>Resultado Final</h3><p>${s.score}/30 (${pct}%) - <strong>${cls}</strong></p><h4>Relatório por tema</h4><ul>${Object.entries(s.byTheme).map(([t,v])=>`<li>${t}: ${Math.round((v.hits/v.total)*100)}%</li>`).join('')}</ul>`;
}
function renderSim() {
  app.innerHTML = card(`<h2>Simulado Cronometrado</h2><p>30 questões, 60 segundos por questão.</p><button class='btn btn-primary' id='sim-start'>Iniciar Simulado</button><div id='sim-box' class='card small'>Aguardando início.</div>`);
  document.getElementById('sim-start').onclick = startSim;
}

function renderDash() {
  const d = state.dashboard;
  const pct = obj => Object.entries(obj).map(([k,v])=>`<tr><td>${k}</td><td>${v.hits}/${v.total}</td><td>${Math.round((v.hits/v.total)*100)||0}%</td></tr>`).join('');
  app.innerHTML = card(`<h2>Dashboard de Desempenho</h2>
  <p>Total de questões registradas: <strong>${d.total}</strong></p>
  <div class='grid-2'>
    <div class='card'><h3>Por tema</h3><table class='table'><tr><th>Tema</th><th>Acerto</th><th>%</th></tr>${pct(d.byTheme)}</table></div>
    <div class='card'><h3>Por ordem</h3><table class='table'><tr><th>Ordem</th><th>Acerto</th><th>%</th></tr>${pct(d.byOrder)}</table></div>
  </div>
  <div class='card'><h3>Histórico de simulados</h3><ul>${d.history.slice(-10).reverse().map(h=>`<li>${h.date}: ${h.score}/30 (${h.pct}%) - ${h.cls}</li>`).join('') || '<li>Sem simulados ainda.</li>'}</ul></div>
  <div class='card'><h3>Pontos fracos</h3><ul>${Object.entries(d.weak).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<li>${k}: ${v} erros</li>`).join('') || '<li>Sem dados.</li>'}</ul></div>`);
}

function randomKey(o){ const keys = Object.keys(o); return keys[Math.floor(Math.random()*keys.length)]; }
function shuffle(arr){ return arr.sort(()=>Math.random()-0.5); }
function v(id){ return document.getElementById(id).value; }

function render() {
  ({home:renderHome, atlas:renderAtlas, taxonomia:renderTaxonomia, chave:renderChave, laboratorio:renderLab, simulado:renderSim, dashboard:renderDash}[state.route] || renderHome)();
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
render();
