const state = {
  route: 'home',
  anatomyTest: { current: null, hits: 0, total: 0 },
  keySession: null,
  sim: null,
  dashboard: loadDashboard()
};

const app = document.getElementById('app');
const nav = document.getElementById('navbar');
const { orders, families, morphology } = window.ENTOMO_DATA;

const MORPH_GROUPS = {
  Cabeça: ['clypeus', 'labrum', 'mandibles', 'maxillae', 'labium', 'antennae', 'compoundEyes', 'ocelli'],
  Tórax: ['pronotum', 'mesonotum', 'metanotum', 'coxa', 'trochanter', 'femur', 'tibia', 'tarsus'],
  Asas: ['elytra', 'hemelytra', 'membranousWing', 'halteres']
};

nav.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-route]');
  if (!btn) return;
  go(btn.dataset.route);
});

function go(route) {
  state.route = route;
  [...nav.querySelectorAll('button')].forEach((b) => b.classList.toggle('active', b.dataset.route === route));
  render();
}

function card(html) { return `<section class="card">${html}</section>`; }
function randomKey(obj) { const keys = Object.keys(obj); return keys[Math.floor(Math.random() * keys.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function v(id) { return document.getElementById(id).value; }

function loadDashboard() {
  const base = { total: 0, byTheme: {}, byOrder: {}, history: [], weak: {} };
  try { return { ...base, ...(JSON.parse(localStorage.getItem('entomon-dashboard')) || {}) }; } catch { return base; }
}
function saveDashboard() { localStorage.setItem('entomon-dashboard', JSON.stringify(state.dashboard)); }
function track(theme, correct, order = 'Geral') {
  const d = state.dashboard;
  d.total += 1;
  d.byTheme[theme] ||= { hits: 0, total: 0 };
  d.byOrder[order] ||= { hits: 0, total: 0 };
  d.byTheme[theme].total += 1;
  d.byOrder[order].total += 1;
  if (correct) {
    d.byTheme[theme].hits += 1;
    d.byOrder[order].hits += 1;
  } else {
    d.weak[theme] = (d.weak[theme] || 0) + 1;
  }
  saveDashboard();
}

function renderHome() {
  app.innerHTML = card(`
    <h2>ENTOMON PRO</h2>
    <p>Ambiente universitário para estudo prático de Entomologia Agrícola com foco em diagnóstico morfológico e taxonômico.</p>
    <div class="grid-2">
      <div>
        <h3>O que você encontra</h3>
        <ul>
          <li>Atlas morfológico ampliável com seleção guiada por estrutura.</li>
          <li>Banco taxonômico por ordens e famílias agrícolas.</li>
          <li>Chave dicotômica dinâmica com decisão passo a passo.</li>
          <li>Laboratório com correção imediata e explicação.</li>
          <li>Simulado de 30 questões com cronômetro e feedback instantâneo.</li>
        </ul>
      </div>
      <div>
        <h3>Status PWA</h3>
        <p class="small">${navigator.onLine ? 'Online (cache ativo).' : 'Offline (executando via cache local).'}</p>
      </div>
    </div>
  `);
}

function renderAtlas() {
  const partsList = Object.entries(MORPH_GROUPS).map(([region, keys]) => `
    <details open>
      <summary>${region}</summary>
      <div class="parts-list">
        ${keys.map((k) => `<button class="btn part-btn" data-partbtn="${k}">${morphology[k].name}</button>`).join('')}
      </div>
    </details>
  `).join('');

  app.innerHTML = card(`
    <h2>Atlas Morfológico Interativo</h2>
    <p class="small">Imagem ampliada: clique no desenho <strong>ou</strong> na lista lateral para identificar estruturas com precisão.</p>
    <div class="grid-2 atlas-grid">
      <div>
        <label>Zoom da imagem (${`<span id="zoom-v">1.3x</span>`})</label>
        <input id="zoom" type="range" min="1" max="2.4" step="0.1" value="1.3" />
        <div class="svg-wrap">
          <svg id="insect-svg" viewBox="0 0 560 300" width="100%">
            <ellipse data-part="pronotum" cx="210" cy="150" rx="60" ry="40" fill="#2a3f74"/>
            <ellipse data-part="mesonotum" cx="280" cy="150" rx="55" ry="40" fill="#35508d"/>
            <ellipse data-part="metanotum" cx="350" cy="150" rx="50" ry="35" fill="#4262a3"/>
            <circle data-part="compoundEyes" cx="120" cy="130" r="20" fill="#4f79c3"/>
            <circle data-part="compoundEyes" cx="120" cy="170" r="20" fill="#4f79c3"/>
            <circle data-part="ocelli" cx="97" cy="150" r="7" fill="#86a6df"/>
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
            <line data-part="coxa" x1="220" y1="185" x2="210" y2="215" stroke="#77a1e8" stroke-width="8"/>
            <line data-part="trochanter" x1="210" y1="215" x2="222" y2="225" stroke="#77a1e8" stroke-width="7"/>
            <line data-part="femur" x1="222" y1="225" x2="275" y2="245" stroke="#5e8ad5" stroke-width="9"/>
            <line data-part="tibia" x1="275" y1="245" x2="325" y2="260" stroke="#4f79c3" stroke-width="7"/>
            <line data-part="tarsus" x1="325" y1="260" x2="355" y2="272" stroke="#3d65aa" stroke-width="5"/>
          </svg>
        </div>
      </div>
      <div>
        <div id="atlas-info" class="alert">Selecione uma estrutura para ver a explicação detalhada.</div>
        <h3>Mapa de estruturas</h3>
        ${partsList}
        <hr/>
        <h3>Teste Anatômico</h3>
        <p id="anat-prompt">Clique em iniciar.</p>
        <button class="btn btn-primary" id="anat-start">Iniciar</button>
        <p id="anat-live" class="small"></p>
        <p class="small" id="anat-score">Acertos: 0/0</p>
      </div>
    </div>
  `);

  const showPart = (part) => {
    const m = morphology[part];
    if (!m) return;
    document.getElementById('atlas-info').innerHTML = `<h3>${m.name}</h3><p><strong>Região:</strong> ${m.region}</p><p><strong>Ordens diagnósticas:</strong> ${m.orders.join(', ')}</p><p><strong>Importância diagnóstica:</strong> ${m.diagnosis}</p>`;
  };

  app.querySelector('#insect-svg').addEventListener('click', (e) => {
    const part = e.target.dataset.part;
    if (!part) return;
    handleAnatomyAnswer(part);
  });

  app.querySelectorAll('[data-partbtn]').forEach((btn) => {
    btn.addEventListener('click', () => handleAnatomyAnswer(btn.dataset.partbtn));
  });

  function handleAnatomyAnswer(part) {
    showPart(part);
    if (!state.anatomyTest.current) return;
    state.anatomyTest.total += 1;
    const ok = state.anatomyTest.current === part;
    if (ok) state.anatomyTest.hits += 1;
    track('Morfologia', ok);
    document.getElementById('anat-live').innerHTML = ok
      ? `<span class="alert ok">✅ Correto! Era ${morphology[state.anatomyTest.current].name}.</span>`
      : `<span class="alert error">❌ Errou. Você clicou ${morphology[part].name}. Correto: ${morphology[state.anatomyTest.current].name}.</span>`;
    state.anatomyTest.current = randomKey(morphology);
    document.getElementById('anat-prompt').textContent = `Clique em: ${morphology[state.anatomyTest.current].name}`;
    document.getElementById('anat-score').textContent = `Acertos: ${state.anatomyTest.hits}/${state.anatomyTest.total}`;
  }

  document.getElementById('anat-start').onclick = () => {
    state.anatomyTest.current = randomKey(morphology);
    document.getElementById('anat-live').textContent = '';
    document.getElementById('anat-prompt').textContent = `Clique em: ${morphology[state.anatomyTest.current].name}`;
  };

  document.getElementById('zoom').addEventListener('input', (e) => {
    const z = Number(e.target.value);
    document.querySelector('.svg-wrap').style.setProperty('--zoom', z);
    document.getElementById('zoom-v').textContent = `${z.toFixed(1)}x`;
  });
}

function renderTaxonomia() {
  app.innerHTML = card(`
    <h2>Banco Taxonômico</h2>
    <div class="grid-2">
      <div><input id="search" placeholder="Buscar ordem, família, morfologia ou diagnóstico..." /></div>
      <div><select id="filter-order"><option value="">Filtrar famílias por ordem</option>${Object.keys(orders).map((o) => `<option>${o}</option>`).join('')}</select></div>
    </div>
    <div id="tax-results" class="list"></div>
  `);

  const draw = () => {
    const q = document.getElementById('search').value.toLowerCase();
    const fOrder = document.getElementById('filter-order').value;
    let html = '<h3>Ordens</h3>';
    Object.entries(orders)
      .filter(([k, val]) => (k + JSON.stringify(val)).toLowerCase().includes(q))
      .forEach(([name, o]) => {
        html += `<article class="card"><h3>${name}</h3><p>${o.diagnostic}</p><p><span class="badge">Metamorfose: ${o.metamorphosis}</span><span class="badge">Bucal: ${o.mouthpart}</span><span class="badge">Asas: ${o.wings}</span><span class="badge">Antena: ${o.antenna}</span></p><p><strong>Importância agrícola:</strong> ${o.importance}</p></article>`;
      });
    html += '<h3>Famílias</h3>';
    Object.entries(families)
      .filter(([k, val]) => (!fOrder || val.order === fOrder) && (k + JSON.stringify(val)).toLowerCase().includes(q))
      .forEach(([name, f]) => {
        html += `<article class="card"><h3>${name} <span class="small">(${f.order})</span></h3><p><strong>Morfologia:</strong> ${f.morphology}</p><p><strong>Tipo de dano:</strong> ${f.damage}</p><p><strong>Importância agrícola:</strong> ${f.importance}</p><p><strong>Diagnóstico diferencial:</strong> ${f.differential}</p></article>`;
      });
    document.getElementById('tax-results').innerHTML = html;
  };

  ['search', 'filter-order'].forEach((id) => document.getElementById(id).addEventListener('input', draw));
  draw();
}

function renderChave() {
  app.innerHTML = card(`
    <h2>Chave Dicotômica Dinâmica</h2>
    <p class="small">A cada decisão, a lista de candidatos é reduzida até chegar a uma família provável.</p>
    <div class="grid-2">
      <div id="key-q" class="card">Inicie uma sessão.</div>
      <div id="key-result" class="card small">Sem resultado ainda.</div>
    </div>
    <button class="btn btn-primary" id="start-key">Iniciar Chave</button>
  `);

  document.getElementById('start-key').onclick = () => {
    state.keySession = {
      start: Date.now(),
      candidates: Object.keys(families).map((name) => ({ name, ...families[name] })),
      asked: new Set(),
      steps: 0
    };
    nextKeyStep();
  };
}

function nextKeyStep(answer) {
  const s = state.keySession;
  if (!s) return;
  if (answer) s.candidates = s.candidates.filter((c) => String(c[answer.field] || '').includes(answer.value));
  s.steps += 1;

  if (s.candidates.length <= 1 || s.steps > 10) {
    const result = s.candidates[0];
    const sec = Math.round((Date.now() - s.start) / 1000);
    document.getElementById('key-result').innerHTML = result
      ? `<div class="alert ok">Resultado: <strong>${result.name}</strong> (${result.order})<br>Tempo: ${sec}s</div>`
      : `<div class="alert error">Nenhum táxon encontrado com as escolhas atuais.</div>`;
    track('Diagnóstico', !!result, result?.order || 'Geral');
    return;
  }

  const fields = ['order', 'morphology', 'damage'];
  const field = fields.find((f) => {
    if (s.asked.has(f)) return false;
    const opts = new Set(s.candidates.map((c) => (c[f] || '').split(/[.,;]/)[0].trim()));
    return opts.size > 1;
  });

  if (!field) return nextKeyStep({ field: 'order', value: s.candidates[0].order });
  s.asked.add(field);
  const options = [...new Set(s.candidates.map((c) => (c[field] || '').split(/[.,;]/)[0].trim()))].slice(0, 4);

  document.getElementById('key-q').innerHTML = `
    <p><strong>${labelField(field)}</strong></p>
    <div class="list">${options.map((opt) => `<button class="btn key-opt" data-field="${field}" data-value="${opt}">${opt}</button>`).join('')}</div>
    <p class="small">Candidatos restantes: ${s.candidates.length}</p>
  `;
  document.querySelectorAll('.key-opt').forEach((btn) => {
    btn.onclick = () => nextKeyStep({ field: btn.dataset.field, value: btn.dataset.value });
  });
}

function labelField(field) {
  return ({ order: '1) Ordem mais provável', morphology: '2) Traço morfológico dominante', damage: '3) Tipo de dano observado' }[field] || field);
}

function renderLab() {
  const famName = randomKey(families);
  const fam = families[famName];
  const ord = orders[fam.order];
  app.innerHTML = card(`
    <h2>Modo Laboratório</h2>
    <p><strong>Amostra prática:</strong> ${fam.morphology} ${fam.damage}</p>
    <div class="grid-2">
      <div>
        <label>Ordem</label><select id="lab-order">${Object.keys(orders).map((o) => `<option>${o}</option>`).join('')}</select>
        <label>Família</label><select id="lab-family">${Object.keys(families).map((f) => `<option>${f}</option>`).join('')}</select>
      </div>
      <div>
        <label>Metamorfose</label><select id="lab-meta">${[...new Set(Object.values(orders).map((o) => o.metamorphosis))].map((m) => `<option>${m}</option>`).join('')}</select>
        <label>Aparelho bucal</label><select id="lab-mouth">${[...new Set(Object.values(orders).map((o) => o.mouthpart))].map((m) => `<option>${m}</option>`).join('')}</select>
      </div>
    </div>
    <button class="btn btn-primary" id="lab-check">Corrigir agora</button>
    <div id="lab-feedback"></div>
  `);

  document.getElementById('lab-check').onclick = () => {
    const ans = { order: v('lab-order'), family: v('lab-family'), meta: v('lab-meta'), mouth: v('lab-mouth') };
    const checks = {
      Ordem: ans.order === fam.order,
      Família: ans.family === famName,
      Metamorfose: ans.meta === ord.metamorphosis,
      'Aparelho bucal': ans.mouth === ord.mouthpart
    };
    const hits = Object.values(checks).filter(Boolean).length;
    const ok = hits >= 3;
    track('Laboratório', ok, fam.order);
    document.getElementById('lab-feedback').innerHTML = `
      <div class="alert ${ok ? 'ok' : 'error'}">
        <strong>${ok ? '✅ Bom desempenho' : '❌ Revise os critérios'}</strong><br>
        Pontuação: ${hits}/4<br>
        Detalhe: ${Object.entries(checks).map(([k, c]) => `${c ? '✅' : '❌'} ${k}`).join(' | ')}<br>
        Gabarito: ${fam.order} / ${famName} / ${ord.metamorphosis} / ${ord.mouthpart}.<br>
        <strong>Diagnóstico diferencial:</strong> ${fam.differential}
      </div>
    `;
  };
}

function buildQuestion(i) {
  const famName = randomKey(families);
  const fam = families[famName];
  const ord = orders[fam.order];
  const themes = ['Morfologia', 'Ordens', 'Famílias', 'Diagnóstico'];
  const theme = themes[i % themes.length];

  if (theme === 'Ordens') {
    const opts = shuffle([...new Set([fam.order, ...Object.keys(orders)])]).slice(0, 4);
    if (!opts.includes(fam.order)) opts[0] = fam.order;
    return { theme, text: `Qual ordem tem ${ord.wings} e aparelho bucal ${ord.mouthpart}?`, answer: fam.order, options: shuffle(opts) };
  }
  if (theme === 'Famílias') {
    const opts = shuffle([...new Set([famName, ...Object.keys(families)])]).slice(0, 4);
    if (!opts.includes(famName)) opts[0] = famName;
    return { theme, text: `Qual família corresponde a: ${fam.morphology}`, answer: famName, options: shuffle(opts) };
  }
  if (theme === 'Diagnóstico') {
    const answer = orders[fam.order].diagnostic;
    const opts = shuffle([...new Set([answer, ...Object.values(orders).map((o) => o.diagnostic)])]).slice(0, 4);
    if (!opts.includes(answer)) opts[0] = answer;
    return { theme, text: `Marque a descrição diagnóstica correta para ${fam.order}:`, answer, options: shuffle(opts) };
  }

  const part = randomKey(morphology);
  const answer = morphology[part].name;
  const opts = shuffle([...new Set([answer, ...Object.values(morphology).map((m) => m.name)])]).slice(0, 4);
  if (!opts.includes(answer)) opts[0] = answer;
  return { theme, text: `No estudo morfológico, qual estrutura corresponde a: ${morphology[part].diagnosis}`, answer, options: shuffle(opts) };
}

function renderSim() {
  app.innerHTML = card(`
    <h2>Simulado Cronometrado</h2>
    <p>30 questões, 60 segundos por questão, com feedback imediato em cada resposta.</p>
    <button class="btn btn-primary" id="sim-start">Iniciar Simulado</button>
    <div id="sim-box" class="card small">Aguardando início.</div>
  `);
  document.getElementById('sim-start').onclick = startSim;
}

function startSim() {
  state.sim = {
    index: 0,
    score: 0,
    timer: 60,
    questions: Array.from({ length: 30 }, (_, i) => buildQuestion(i)),
    byTheme: {},
    interval: null
  };
  renderSimQuestion();
}

function renderSimQuestion() {
  const s = state.sim;
  const q = s.questions[s.index];
  if (!q) return endSim();
  s.timer = 60;
  document.getElementById('sim-box').innerHTML = `
    <h3>Questão ${s.index + 1}/30</h3>
    <p>${q.text}</p>
    <p class="small">Tema: ${q.theme}</p>
    <div class="progress"><span style="width:100%"></span></div>
    <p>Tempo: <span id="sim-time">60</span>s</p>
    <div class="list">${q.options.map((o) => `<button class="btn sim-opt" data-value="${escapeAttr(o)}">${o}</button>`).join('')}</div>
    <div id="sim-feedback"></div>
  `;

  document.querySelectorAll('.sim-opt').forEach((btn) => {
    btn.onclick = () => answerSim(btn.dataset.value);
  });

  clearInterval(s.interval);
  s.interval = setInterval(() => {
    s.timer -= 1;
    const timeEl = document.getElementById('sim-time');
    if (timeEl) timeEl.textContent = String(s.timer);
    const bar = document.querySelector('.progress > span');
    if (bar) bar.style.width = `${(s.timer / 60) * 100}%`;
    if (s.timer <= 0) answerSim(null);
  }, 1000);
}

function answerSim(value) {
  const s = state.sim;
  const q = s.questions[s.index];
  clearInterval(s.interval);
  const ok = value === q.answer;
  if (ok) s.score += 1;
  s.byTheme[q.theme] ||= { hits: 0, total: 0 };
  s.byTheme[q.theme].total += 1;
  if (ok) s.byTheme[q.theme].hits += 1;
  track(q.theme, ok);

  const fb = document.getElementById('sim-feedback');
  if (fb) {
    fb.innerHTML = `<div class="alert ${ok ? 'ok' : 'error'}">${ok ? '✅ Correto!' : `❌ Incorreto. Resposta certa: ${q.answer}`}</div><button class="btn" id="sim-next">Próxima questão</button>`;
    document.querySelectorAll('.sim-opt').forEach((b) => { b.disabled = true; });
    document.getElementById('sim-next').onclick = () => {
      s.index += 1;
      renderSimQuestion();
    };
  }
}

function endSim() {
  const s = state.sim;
  const pct = Math.round((s.score / 30) * 100);
  const cls = pct < 60 ? 'Reprovado' : pct <= 80 ? 'Regular' : pct <= 95 ? 'Bom' : 'Excelente';
  state.dashboard.history.push({ date: new Date().toLocaleString('pt-BR'), score: s.score, pct, cls });
  saveDashboard();
  document.getElementById('sim-box').innerHTML = `
    <h3>Resultado final</h3>
    <p><strong>${s.score}/30 (${pct}%)</strong> — ${cls}</p>
    <h4>Desempenho por tema</h4>
    <ul>${Object.entries(s.byTheme).map(([t, val]) => `<li>${t}: ${Math.round((val.hits / val.total) * 100)}%</li>`).join('')}</ul>
  `;
}

function renderDash() {
  const d = state.dashboard;
  const rows = (obj) => Object.entries(obj).map(([k, val]) => `<tr><td>${k}</td><td>${val.hits}/${val.total}</td><td>${Math.round((val.hits / val.total) * 100) || 0}%</td></tr>`).join('');
  app.innerHTML = card(`
    <h2>Dashboard de Desempenho</h2>
    <p>Total de respostas registradas: <strong>${d.total}</strong></p>
    <div class="grid-2">
      <div class="card"><h3>Por tema</h3><table class="table"><tr><th>Tema</th><th>Acertos</th><th>%</th></tr>${rows(d.byTheme)}</table></div>
      <div class="card"><h3>Por ordem</h3><table class="table"><tr><th>Ordem</th><th>Acertos</th><th>%</th></tr>${rows(d.byOrder)}</table></div>
    </div>
    <div class="card"><h3>Histórico de simulados</h3><ul>${d.history.slice(-10).reverse().map((h) => `<li>${h.date}: ${h.score}/30 (${h.pct}%) — ${h.cls}</li>`).join('') || '<li>Sem simulados ainda.</li>'}</ul></div>
    <div class="card"><h3>Pontos fracos</h3><ul>${Object.entries(d.weak).sort((a, b) => b[1] - a[1]).map(([k, val]) => `<li>${k}: ${val} erros</li>`).join('') || '<li>Sem dados ainda.</li>'}</ul></div>
  `);
}

function escapeAttr(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function render() {
  ({
    home: renderHome,
    atlas: renderAtlas,
    taxonomia: renderTaxonomia,
    chave: renderChave,
    laboratorio: renderLab,
    simulado: renderSim,
    dashboard: renderDash
  }[state.route] || renderHome)();
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
render();
