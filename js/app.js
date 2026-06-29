// Main app: loads participants, fetches results, renders views

let participants   = [];
let resultsMap     = {};
let leaderboard    = [];
let currentView    = 'leaderboard';
let detailTarget   = null;
let selectedPlayer = localStorage.getItem('porra_identity') || null;

// ── Boot ─────────────────────────────────────────────────────────────────────

async function init() {
  showSpinner('leaderboard-list');
  try {
    await loadParticipants();
    setupIdentityPill();
    await refreshResults();
    renderLeaderboard();
    renderBracketView();
    maybeShowNewsModal();
    scheduleRefresh();
  } catch (e) {
    console.error(e);
    document.getElementById('leaderboard-list').innerHTML =
      '<p class="empty">Error cargando datos. Revisa la consola.</p>';
  }
}

async function loadParticipants() {
  const loaded = await Promise.all(
    PARTICIPANT_FILES.map(f =>
      fetch(f).then(r => r.json()).catch(() => null)
    )
  );
  participants = loaded.filter(Boolean);
}

async function refreshResults() {
  try {
    const espn = await fetchAllResults();
    resultsMap  = buildResultsMap(ALL_MATCHES, espn);
    document.getElementById('last-updated').textContent =
      'Actualizado: ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.warn('No se pudo obtener resultados ESPN:', e);
  }
}

function scheduleRefresh() {
  const hasLive = ALL_MATCHES.some(m => resultsMap[m.id]?.live);
  const delay   = hasLive ? 60_000 : 3 * 60_000;
  setTimeout(async () => {
    await refreshResults();
    renderLeaderboard();
    renderBracketView();
    if (currentView === 'matches')   renderMatchesView();
    if (currentView === 'evolution') renderEvolutionChart();
    if (detailTarget) renderDetail();
    scheduleRefresh();
  }, delay);
}

// ── Identity (PIN-protected) ──────────────────────────────────────────────────

function setupIdentityPill() {
  const el = document.getElementById('identity-pill');
  if (!el) return;
  if (selectedPlayer) {
    el.innerHTML = `
      <span class="identity-active">● ${selectedPlayer}</span>
      <button class="identity-logout" onclick="logout()" title="Cerrar sesión">✕</button>`;
  } else {
    el.innerHTML = `<button class="identity-btn" onclick="showIdentityModal()">Identifícate</button>`;
  }
}

function showIdentityModal() {
  const sel = document.getElementById('modal-name-select');
  sel.innerHTML = participants.map(p =>
    `<option value="${p.name}">${p.name}</option>`
  ).join('');
  document.getElementById('modal-pin').value = '';
  document.getElementById('modal-error').textContent = '';
  document.getElementById('identity-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-pin').focus(), 50);
}

function hideIdentityModal() {
  document.getElementById('identity-modal').style.display = 'none';
}

function handleModalClick(e) {
  if (e.target === document.getElementById('identity-modal')) hideIdentityModal();
}

function submitIdentity() {
  const name = document.getElementById('modal-name-select').value;
  const pin  = document.getElementById('modal-pin').value.trim();
  const p    = participants.find(p => p.name === name);
  if (!p?.pin || p.pin !== pin) {
    document.getElementById('modal-error').textContent = 'PIN incorrecto';
    document.getElementById('modal-pin').value = '';
    document.getElementById('modal-pin').focus();
    return;
  }
  selectedPlayer = name;
  localStorage.setItem('porra_identity', name);
  hideIdentityModal();
  setupIdentityPill();
  renderLeaderboard();
  if (detailTarget) renderDetail();
  if (currentView === 'achievements') renderAchievementsView();
  maybeShowPenaltyModal();
  maybeShowNewsModal();
}

function logout() {
  selectedPlayer = null;
  localStorage.removeItem('porra_identity');
  setupIdentityPill();
  renderLeaderboard();
  if (detailTarget) renderDetail();
  if (currentView === 'achievements') renderAchievementsView();
}

// ── Live stakes ───────────────────────────────────────────────────────────────

function computeStakes(matchId, liveResult, round) {
  const h = liveResult.homeScore ?? 0;
  const a = liveResult.awayScore ?? 0;
  const safe = { ...liveResult, homeScore: h, awayScore: a };
  return participants.map(p => {
    const pred   = p.predictions?.[matchId];
    const now    = scoreMatch(pred, safe, round);
    const ifHome = scoreMatch(pred, { ...safe, homeScore: h + 1 }, round);
    const ifAway = scoreMatch(pred, { ...safe, awayScore: a + 1 }, round);
    return { name: p.name, pred, now, ifHome, ifAway };
  });
}

function predLabel(pred) {
  if (!pred) return '–';
  if (pred.winner != null) return pred.winner;
  if (pred.home != null)   return `${pred.home}‑${pred.away}`;
  return '–';
}

function diffCell(val, base) {
  if (val > base) return `<span class="stakes-up">▲${val}</span>`;
  if (val < base) return `<span class="stakes-dn">▼${val}</span>`;
  return `<span>${val}</span>`;
}

const TEAM_FLAVOR = {
  'Mexico':                 ['mexicano',      'el tequila'],
  'South Africa':           ['sudafricano',   'Nelson Mandela'],
  'South Korea':            ['coreano',       'el kimchi'],
  'Czechia':                ['checo',         'la cerveza Pilsner'],
  'Canada':                 ['canadiense',    'el sirope de arce'],
  'Bosnia and Herzegovina': ['bosnio',        'el ćevapi'],
  'Qatar':                  ['catarí',        'el aire acondicionado en el desierto'],
  'Switzerland':            ['suizo',         'un reloj de cuco'],
  'Brazil':                 ['brasileño',     'el carnaval de Río'],
  'Morocco':                ['marroquí',      'el cuscús'],
  'Haiti':                  ['haitiano',      'el vudú'],
  'Scotland':               ['escocés',       'el whisky de malta'],
  'United States':          ['americano',     'las hamburguesas'],
  'Paraguay':               ['paraguayo',     'el mate'],
  'Australia':              ['australiano',   'el canguro'],
  'Turkey':                 ['turco',         'el kebab'],
  'Germany':                ['alemán',        'las salchichas'],
  'Ivory Coast':            ['marfileño',     'el chocolate negro'],
  'Ecuador':                ['ecuatoriano',   'las Islas Galápagos'],
  'Netherlands':            ['holandés',      'los tulipanes'],
  'Japan':                  ['japonés',       'el sushi'],
  'Sweden':                 ['sueco',         'el IKEA'],
  'Tunisia':                ['tunecino',      'el harissa'],
  'Belgium':                ['belga',         'el chocolate'],
  'Egypt':                  ['egipcio',       'las pirámides'],
  'Iran':                   ['iraní',         'la alfombra persa'],
  'New Zealand':            ['neozelandés',   'El Señor de los Anillos'],
  'Spain':                  ['español',       'el jamón'],
  'Cape Verde':             ['caboverdiano',  'estar en medio del Atlántico'],
  'Saudi Arabia':           ['saudí',         'el petróleo'],
  'Uruguay':                ['uruguayo',      'el mate'],
  'France':                 ['francés',       'el croissant'],
  'Senegal':                ['senegalés',     'el baobab'],
  'Iraq':                   ['iraquí',        'Las Mil y Una Noches'],
  'Norway':                 ['noruego',       'los fiordos'],
  'Argentina':              ['argentino',     'el asado'],
  'Algeria':                ['argelino',      'el Sahara'],
  'Austria':                ['austriaco',     'Mozart'],
  'Jordan':                 ['jordano',       'Petra'],
  'Portugal':               ['portugués',     'un pastel de nata'],
  'DR Congo':               ['congoleño',     'el río Congo'],
  'Uzbekistan':             ['uzbeko',        'la Ruta de la Seda'],
  'Colombia':               ['colombiano',    'el café de Juan Valdez'],
  'England':                ['inglés',        'el fish and chips'],
  'Croatia':                ['croata',        'haber inventado la corbata'],
  'Ghana':                  ['ghanés',        'el cacao'],
  'Panama':                 ['panameño',      'el Canal de Panamá'],
};

function pickMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function goalMsg(name, team) {
  if (team === 'Curacao') return '¿Dónde coño está Curazao?';
  const f = TEAM_FLAVOR[team];
  if (!f) return `${name} necesita que marque ${team}`;
  return `${name} es más ${f[0]} que ${f[1]}`;
}

function generateMessages(stakes, homeTeam, awayTeam, h, a) {
  const msgs = [];

  if (homeTeam === 'Curacao' || awayTeam === 'Curacao') {
    msgs.push('¿Dónde coño está Curazao?');
  }

  for (const s of stakes) {
    const isExact = s.pred?.home != null
      && Number(s.pred.home) === h && Number(s.pred.away) === a;
    const impossible = s.now === 0 && s.ifHome === 0 && s.ifAway === 0;

    let msg;
    if (isExact) {
      msg = pickMsg([
        `${s.name}: ¡ARBI PITA YA!`,
        `${s.name} está pidiendo la hora`,
        `${s.name}: El pescado está vendido`,
      ]);
    } else if (impossible) {
      msg = pickMsg([
        `${s.name}: Fuck...`,
        `${s.name} se ha fumado un porrito`,
        `${s.name} ya ha apagado la televisión`,
        `${s.name} es el Maldini de hacendado`,
      ]);
    } else if (s.now > 0) {
      msg = pickMsg([
        `${s.name}: Messirve`,
        `${s.name}: No es lo que esperaba, pero estoy contento`,
      ]);
    } else {
      const team = s.ifHome >= s.ifAway ? homeTeam : awayTeam;
      msg = goalMsg(s.name, team);
    }
    if (msg) msgs.push(msg);
  }

  return msgs;
}

function renderLivePanel() {
  const panel = document.getElementById('live-panel');
  if (!panel) return;

  const liveMatches = ALL_MATCHES.filter(m => resultsMap[m.id]?.live);
  if (!liveMatches.length) { panel.innerHTML = ''; return; }

  panel.innerHTML = liveMatches.map(match => {
    const result = resultsMap[match.id];
    const round  = match.group ? 'group' : match.round;
    const home   = result.homeTeam || match.home || '?';
    const away   = result.awayTeam || match.away || '?';
    const h      = result.homeScore ?? 0;
    const a      = result.awayScore ?? 0;
    const stakes = computeStakes(match.id, result, round);
    const msgs   = generateMessages(stakes, home, away, h, a);

    const clockStr = result.status === 'STATUS_HALFTIME' ? 'Descanso'
                   : result.clock ? result.clock : 'En juego';

    const stakeSection = selectedPlayer
      ? (() => {
          const rows = stakes.map(s => `
            <tr>
              <td class="sname">${s.name}</td>
              <td class="spred">${s.name === selectedPlayer ? predLabel(s.pred) : '<span class="pred-hidden" title="Se revela al acabar">🔒</span>'}</td>
              <td class="snow">${s.now}<span class="pts-label"> pts</span></td>
              <td class="sgoal">${diffCell(s.ifHome, s.now)}</td>
              <td class="sgoal">${diffCell(s.ifAway, s.now)}</td>
            </tr>`).join('');
          return `
          <div class="stakes-wrap">
            <table class="stakes-table">
              <thead><tr>
                <th></th><th>Pronóstico</th><th>Ahora</th>
                <th>+gol ${flag(home)}</th><th>+gol ${flag(away)}</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`;
        })()
      : `<div class="live-locked"><button class="identity-btn" onclick="showIdentityModal()">Identifícate para ver las apuestas</button></div>`;

    const msgsHtml = msgs.length
      ? `<div class="live-msgs">${msgs.map(m => `<div class="live-msg">${m}</div>`).join('')}</div>`
      : '';

    return `
    <div class="live-card">
      <div class="live-card-header">
        <span class="live-dot-wrap"><span class="live-dot"></span>EN VIVO</span>
        <div class="live-main-score">
          <span class="live-team home-team">${flag(home)}<span>${home}</span></span>
          <span class="live-scorebox">${h} &ndash; ${a}</span>
          <span class="live-team away-team"><span>${away}</span>${flag(away)}</span>
        </div>
        <span class="live-clock">${clockStr}</span>
      </div>
      ${stakeSection}
      ${msgsHtml}
    </div>`;
  }).join('');
}

// ── Engagement features ───────────────────────────────────────────────────────

const CHART_COLORS = ['#c9a84c', '#4a8fe8', '#27c87a', '#e05252', '#9b59b6', '#f39c12'];
let evolutionChart = null;
let positionDeltas = {};

// ── Position deltas ───────────────────────────────────────────────────────────

function updatePositionDeltas() {
  const finishedCount = finishedMatchesSorted().length;
  const currentPositions = {};
  leaderboard.forEach((p, i) => { currentPositions[p.name] = i + 1; });

  const stored = JSON.parse(localStorage.getItem('porra_pos_data') || 'null');

  if (!stored) {
    localStorage.setItem('porra_pos_data', JSON.stringify({ positions: currentPositions, finishedCount, deltas: {} }));
    positionDeltas = {};
    return;
  }

  if (finishedCount > stored.finishedCount) {
    const newDeltas = {};
    for (const name of Object.keys(currentPositions)) {
      const prev = stored.positions[name];
      if (prev != null) newDeltas[name] = prev - currentPositions[name]; // positive = moved up
    }
    localStorage.setItem('porra_pos_data', JSON.stringify({ positions: currentPositions, finishedCount, deltas: newDeltas }));
    positionDeltas = newDeltas;
  } else {
    positionDeltas = stored.deltas || {};
  }
}

function deltaHtml(name) {
  const d = positionDeltas[name];
  if (!d) return '';
  if (d > 0) return `<span class="pos-delta up">▲${d}</span>`;
  return `<span class="pos-delta dn">▼${Math.abs(d)}</span>`;
}

// ── Consensus predictions ─────────────────────────────────────────────────────

function computeConsensus(matchId) {
  let home = 0, draw = 0, away = 0, total = 0;
  for (const p of participants) {
    const pred = p.predictions?.[matchId];
    if (!pred || pred.home == null) continue;
    total++;
    const h = parseInt(pred.home), a = parseInt(pred.away);
    if (h > a) home++;
    else if (a > h) away++;
    else draw++;
  }
  return total ? { home, draw, away, total } : null;
}

function consensusHtml(matchId, homeTeam, awayTeam) {
  const c = computeConsensus(matchId);
  if (!c) return '';
  const pHome = Math.round(c.home / c.total * 100);
  const pDraw = Math.round(c.draw / c.total * 100);
  const pAway = 100 - pHome - pDraw;
  const segs = [
    pHome ? `<span class="cons-seg cons-home" style="width:${pHome}%">${pHome}%</span>` : '',
    pDraw ? `<span class="cons-seg cons-draw" style="width:${pDraw}%">${pDraw}%</span>` : '',
    pAway ? `<span class="cons-seg cons-away" style="width:${pAway}%">${pAway}%</span>` : '',
  ].join('');
  return `<div class="consensus-wrap">
    <div class="consensus-bar" title="${homeTeam} ${pHome}% · Empate ${pDraw}% · ${awayTeam} ${pAway}%">${segs}</div>
    <div class="consensus-labels">
      <span>${pHome}%</span>
      ${pDraw ? `<span>${pDraw}%</span>` : ''}
      <span>${pAway}%</span>
    </div>
  </div>`;
}

function finishedMatchesSorted() {
  return ALL_MATCHES
    .filter(m => m.home && m.away && resultsMap[m.id]?.finished)
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));
}

// ── Badges ────────────────────────────────────────────────────────────────────

function computeBadges(participant, rank, total) {
  const finished = finishedMatchesSorted();
  const badges = [];

  // ── Position ────────────────────────────────────────────────────────────────
  if (finished.length && rank === 1)
    badges.push({ icon: '👑', label: 'Líder', cls: 'badge-leader' });
  if (finished.length && rank === total && total > 1)
    badges.push({ icon: '🪣', label: 'Farolillo rojo', cls: 'badge-last' });

  if (!finished.length) return badges;

  // ── Exact scores & chaos ────────────────────────────────────────────────────
  let exactCount = 0, chaosExact = false;
  for (const m of finished) {
    const round    = m.group ? 'group' : m.round;
    const exactPts = (SCORING[round] || SCORING.group)[1];
    if ((participant.breakdown[m.id] || 0) === exactPts) {
      exactCount++;
      const pred = participant.predictions?.[m.id];
      if (pred?.home != null && (pred.home + pred.away) >= 5) chaosExact = true;
    }
  }
  if (exactCount >= 8)       badges.push({ icon: '🔮', label: `Oráculo · ${exactCount} exactos`,  cls: 'badge-oracle' });
  else if (exactCount >= 3)  badges.push({ icon: '🎯', label: `Francotirador · ${exactCount}`,     cls: 'badge-achievement' });
  if (chaosExact)            badges.push({ icon: '🎪', label: 'Adivino del caos',                  cls: 'badge-special' });

  // ── Hit rate ─────────────────────────────────────────────────────────────────
  const hits = Object.values(participant.breakdown).filter(p => p > 0).length;
  if (finished.length >= 10 && hits / finished.length >= 0.65)
    badges.push({ icon: '💪', label: 'Fiable', cls: 'badge-achievement' });

  // ── Current streak ───────────────────────────────────────────────────────────
  let winStreak = 0, lossStreak = 0;
  for (let i = finished.length - 1; i >= 0; i--) {
    const pts = participant.breakdown[finished[i].id] || 0;
    if (winStreak === 0 && lossStreak === 0) {
      pts > 0 ? winStreak++ : lossStreak++;
    } else if (winStreak > 0 && pts > 0) winStreak++;
    else if (lossStreak > 0 && pts === 0) lossStreak++;
    else break;
  }
  if (winStreak  >= 5)  badges.push({ icon: '🔥', label: `En llamas · ${winStreak}`,     cls: 'badge-fire' });
  else if (winStreak  >= 3) badges.push({ icon: '🔥', label: `Racha · ${winStreak}`,      cls: 'badge-fire' });
  if (lossStreak >= 5)  badges.push({ icon: '🥶', label: `Heladera · ${lossStreak}`,      cls: 'badge-ice' });
  else if (lossStreak >= 3) badges.push({ icon: '🧊', label: `Frío · ${lossStreak}`,      cls: 'badge-ice' });

  return badges.slice(0, 4);
}

// ── Highlight card ────────────────────────────────────────────────────────────

function renderHighlightCard() {
  const el = document.getElementById('highlight-card');
  if (!el) return;

  const finished = finishedMatchesSorted();
  if (!finished.length) { el.innerHTML = ''; return; }

  // Group by date, pick the most recent
  const byDate = {};
  finished.forEach(m => {
    const d = m.date || '';
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(m);
  });
  const latestDate = Object.keys(byDate).sort().pop();
  const dayMatches = byDate[latestDate];

  // Collect all exact predictions from that day
  const exactHits = [];
  for (const match of dayMatches) {
    const round    = match.group ? 'group' : match.round;
    const exactPts = (SCORING[round] || SCORING.group)[1];
    const result   = resultsMap[match.id];
    for (const p of leaderboard) {
      if ((p.breakdown[match.id] || 0) === exactPts) {
        exactHits.push({ name: p.name, match, pred: p.predictions?.[match.id], result });
      }
    }
  }

  // Fall back to best 1x2 hits if no exacts
  const hits = exactHits.length ? exactHits : (() => {
    const h = [];
    for (const match of dayMatches) {
      const result = resultsMap[match.id];
      for (const p of leaderboard) {
        if ((p.breakdown[match.id] || 0) > 0) h.push({ name: p.name, match, pred: p.predictions?.[match.id], result });
      }
    }
    return h;
  })();

  if (!hits.length) { el.innerHTML = ''; return; }

  const isExact = exactHits.length > 0;
  const fmtDate = new Date(latestDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  const rows = hits.map(h => {
    const predLabel = h.pred?.home != null ? `${h.pred.home}-${h.pred.away}` : (h.pred?.winner || '?');
    const resultLabel = `${h.result.homeScore}-${h.result.awayScore}`;
    return `
    <div class="highlight-row">
      <span class="hl-avatar">${h.name[0].toUpperCase()}</span>
      <span class="hl-name">${h.name}</span>
      <span class="hl-pred">${predLabel}</span>
      <span class="hl-sep">·</span>
      <span class="hl-teams">${flag(h.match.home)}${flag(h.match.away)}</span>
      <span class="hl-match">${h.match.home} ${resultLabel} ${h.match.away}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
  <div class="highlight-card">
    <div class="highlight-header">
      <span>${isExact ? '⭐ Exactos' : '✅ Aciertos'} del ${fmtDate}</span>
    </div>
    <div class="highlight-rows">${rows}</div>
  </div>`;
}

// ── Evolution chart ───────────────────────────────────────────────────────────

function renderEvolutionChart() {
  const canvas = document.getElementById('evolution-canvas');
  if (!canvas || !leaderboard.length) return;

  const finished = finishedMatchesSorted();

  if (!finished.length) {
    canvas.closest('.chart-container').innerHTML =
      '<p class="empty">Los resultados aparecerán aquí cuando empiece el torneo</p>';
    return;
  }

  const labels = finished.map(m => {
    const r = resultsMap[m.id];
    const h = (m.home || '?').slice(0, 3).toUpperCase();
    const a = (m.away || '?').slice(0, 3).toUpperCase();
    return `${h} ${r.homeScore}-${r.awayScore} ${a}`;
  });

  const datasets = leaderboard.map((p, i) => {
    let running = 0;
    return {
      label: p.name,
      data: finished.map(m => { running += (p.breakdown[m.id] || 0); return running; }),
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '18',
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      borderWidth: 2.5,
      fill: false,
    };
  });

  const chartData = { labels, datasets };

  if (evolutionChart) {
    evolutionChart.data = chartData;
    evolutionChart.update();
    return;
  }

  evolutionChart = new Chart(canvas, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#e8eaf0', font: { size: 13 }, padding: 20 } },
        tooltip: {
          backgroundColor: '#1a2236',
          borderColor: '#2a3a5c',
          borderWidth: 1,
          titleColor: '#e8eaf0',
          bodyColor: '#8898b8',
          padding: 12,
        },
      },
      scales: {
        x: {
          ticks: { color: '#8898b8', maxRotation: 55, font: { size: 9 } },
          grid: { color: '#1c2640' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#8898b8', stepSize: 1 },
          grid: { color: '#1c2640' },
        },
      },
    },
  });
}

// ── Leaderboard ──────────────────────────────────────────────────────────────

function renderLeaderboard() {
  leaderboard = buildLeaderboard(participants, resultsMap);
  updatePositionDeltas();
  renderLivePanel();
  renderHighlightCard();
  const maxScore = leaderboard[0]?.score || 1;
  const el = document.getElementById('leaderboard-list');
  if (!leaderboard.length) {
    el.innerHTML = '<p class="empty">Añade participantes en la carpeta participants/</p>';
    return;
  }

  el.innerHTML = leaderboard.map((p, i) => {
    const exactCount = Object.entries(p.breakdown).filter(([matchId, pts]) => {
      const match = ALL_MATCHES.find(m => m.id === matchId);
      const round = match?.group ? 'group' : match?.round;
      return pts === (SCORING[round] || SCORING.group)[1];
    }).length;
    const hitCount = Object.keys(p.breakdown).length;
    const pct      = maxScore > 0 ? (p.score / maxScore * 100).toFixed(0) : 0;
    const badges   = computeBadges(p, i + 1, leaderboard.length);
    const badgeHtml = badges.length
      ? `<div class="badge-row">${badges.map(b => `<span class="badge ${b.cls || ''}">${b.icon} ${b.label}</span>`).join('')}</div>`
      : '';
    const bonusStr = p.groupBonus ? ` · +${p.groupBonus} grupos` : '';

    return `
    <div class="lb-card" onclick="showDetail('${p.name}')">
      <div class="lb-rank rank-${i + 1}">${rankEmoji(i + 1)}${deltaHtml(p.name)}</div>
      <div class="lb-avatar">${p.name[0].toUpperCase()}</div>
      <div class="lb-info">
        <div class="lb-name">${p.name}</div>
        <div class="lb-stats">${hitCount} aciertos · ${exactCount} exactos${bonusStr}</div>
        ${badgeHtml}
        <div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="lb-score">${p.score}<span>pts</span></div>
    </div>`;
  }).join('');
}

function rankEmoji(n) {
  if (n === 1) return '🥇';
  if (n === 2) return '🥈';
  if (n === 3) return '🥉';
  return n;
}

// ── Participant detail ────────────────────────────────────────────────────────

function showDetail(name) {
  detailTarget = leaderboard.find(p => p.name === name);
  if (!detailTarget) return;
  switchView('detail');
  renderDetail();
}

function renderDetail() {
  const p = detailTarget;
  const el = document.getElementById('detail-content');

  let html = `
    <button class="back-btn" onclick="switchView('leaderboard')">← Volver</button>
    <div class="detail-header">
      <div class="detail-avatar">${p.name[0].toUpperCase()}</div>
      <div>
        <div style="font-size:1.2rem;font-weight:700">${p.name}</div>
        <div style="font-size:.8rem;color:var(--text-dim)">${Object.keys(p.breakdown).length} aciertos${p.groupBonus ? ` · +${p.groupBonus} grupos` : ''}</div>
      </div>
      <div class="detail-score-big">${p.score} <span style="font-size:.9rem;color:var(--text-dim)">pts</span></div>
    </div>`;

  // Group stage: sorted by date with day headers
  const groupSorted = [...GROUP_MATCHES]
    .filter(m => resultsMap[m.id] || p.predictions?.[m.id])
    .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));

  let lastDate = null;
  for (const match of groupSorted) {
    if (match.date !== lastDate) {
      const label = match.date
        ? new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Fecha por confirmar';
      html += `<div class="section-title" style="text-transform:capitalize">${label}</div>`;
      lastDate = match.date;
    }
    html += renderDetailMatchRow(match, p, 'group');
  }

  // Knockout rounds: grouped by round
  const knockoutRounds = [
    { key: 'R32', matches: KNOCKOUT_MATCHES.filter(m => m.round === 'R32') },
    { key: 'R16', matches: KNOCKOUT_MATCHES.filter(m => m.round === 'R16') },
    { key: 'QF',  matches: KNOCKOUT_MATCHES.filter(m => m.round === 'QF') },
    { key: 'SF',  matches: KNOCKOUT_MATCHES.filter(m => m.round === 'SF') },
    { key: '3RD', matches: KNOCKOUT_MATCHES.filter(m => m.round === '3RD') },
    { key: 'FN',  matches: KNOCKOUT_MATCHES.filter(m => m.round === 'FN') },
  ];
  for (const { key, matches } of knockoutRounds) {
    const relevant = matches.filter(m => resultsMap[m.id] || p.predictions?.[m.id]);
    if (!relevant.length) continue;
    html += `<div class="section-title">${ROUND_LABELS[key] || key}</div>`;
    for (const match of relevant) html += renderDetailMatchRow(match, p, key);
  }

  el.innerHTML = html;
}

// Returns true if we should show this participant's prediction for this match
function canSeePrediction(participantName, match) {
  if (!selectedPlayer) return false;
  if (selectedPlayer === participantName) return true;

  const result = resultsMap[match.id];
  return !!(result?.finished);
}

function renderDetailMatchRow(match, participant, round) {
  const result  = resultsMap[match.id];
  const pred    = participant.predictions?.[match.id];
  const pts     = participant.breakdown[match.id] || 0;
  const home    = match.home || '?';
  const away    = match.away || '?';
  const visible = canSeePrediction(participant.name, match);

  let resultStr;
  if (result?.finished) {
    resultStr = `<span class="score-box">${result.homeScore} <span class="score-sep">-</span> ${result.awayScore}</span>`;
  } else if (result?.live) {
    resultStr = `<span class="score-box score-live"><span class="live-dot-sm"></span>${result.homeScore} <span class="score-sep">-</span> ${result.awayScore}</span>`;
  } else {
    resultStr = '<span style="color:var(--text-dim);font-size:.8rem">Pendiente</span>';
  }

  let predStr;
  if (!visible) {
    predStr = '<span class="pred-hidden" title="Se revela cuando empiece el partido">🔒</span>';
  } else if (pred) {
    const label = pred.winner != null
      ? pred.winner
      : (pred.home != null ? `${pred.home}-${pred.away}` : '–');
    predStr = `<span class="score-box" style="background:var(--dark2);font-size:.85rem">${label}</span>`;
  } else {
    predStr = '<span style="color:var(--text-dim);font-size:.75rem">–</span>';
  }

  let badge = '';
  if (pts > 0 && visible) {
    const [, exactPts] = SCORING[round] || SCORING.group;
    badge = pts === exactPts
      ? `<span class="pts-badge exact">+${pts} EXACTO</span>`
      : `<span class="pts-badge half">+${pts}</span>`;
  }

  return `
  <div class="match-row">
    <div class="match-team home">${home}<span class="team-flag">${flag(home)}</span></div>
    <div class="match-score">
      ${resultStr}
      <div class="match-date">Pronóstico: ${predStr}${badge}</div>
    </div>
    <div class="match-team away"><span class="team-flag">${flag(away)}</span>${away}</div>
  </div>`;
}

// ── Group standings ────────────────────────────────────────────────────────────
// computeGroupStandings / simulateGroupStandings live in scoring.js (shared with the group bonus calc)

function groupPredictionsHtml(letter, actualStandings) {
  const allFinished = GROUP_MATCHES
    .filter(m => m.group === letter)
    .every(m => resultsMap[m.id]?.finished);
  if (!allFinished || !leaderboard.length) return '';

  const actualOrder = actualStandings.map(s => s.team);
  const rows = leaderboard.map(p => {
    const predOrder = simulateGroupStandings(letter, p.predictions);
    const cells = predOrder.map((team, i) => {
      const actualPos = actualOrder.indexOf(team);
      const ok = actualPos === i;
      const shortName = team.replace('Bosnia and Herzegovina', 'Bosnia').replace('South Korea', 'Corea').replace('United States', 'EEUU').replace('Cape Verde', 'C.Verde').replace('New Zealand', 'N.Zelanda').replace('Saudi Arabia', 'Arabia S.').replace('Ivory Coast', 'M.Marfil').replace('DR Congo', 'R.D.Congo');
      return `<span class="gp-team ${ok ? 'gp-ok' : 'gp-miss'}">${flag(team)}${shortName}</span>`;
    });
    return `<div class="gp-row"><span class="gp-name">${p.name}</span>${cells.join('')}</div>`;
  }).join('');

  return `<div class="gp-section">
    <div class="gp-header">Pronósticos del grupo</div>
    <div class="gp-actual-label">Real: ${actualOrder.map(t => flag(t)).join(' ')}</div>
    ${rows}
  </div>`;
}

// ── Bracket view ──────────────────────────────────────────────────────────────

function renderBracketMatch(match) {
  const result = resultsMap[match.id];
  const teams = (match.home && match.away) ? { home: match.home, away: match.away } : resolveBracketTeams(match.id, resultsMap);
  const homeKnown = !!teams.home, awayKnown = !!teams.away;
  const homeName = teams.home || bracketSlotLabel(match.from.home, match.loser);
  const awayName = teams.away || bracketSlotLabel(match.from.away, match.loser);

  const liveIndicator = result?.live ? `<span class="live-dot-sm"></span>` : '';
  const scoreH = result?.homeScore != null ? result.homeScore : '–';
  const scoreA = result?.awayScore != null ? result.awayScore : '–';
  const boxClass = result?.live ? 'score-box score-live' : 'score-box';
  const dateLabel = match.date
    ? new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    : '';

  return `
  <div class="match-row bracket-match${homeKnown && awayKnown ? '' : ' bracket-pending'}">
    <div class="match-team home${homeKnown ? '' : ' bracket-tbd'}">${homeName}${homeKnown ? `<span class="team-flag">${flag(homeName)}</span>` : ''}</div>
    <div class="match-score">
      <span class="${boxClass}">${liveIndicator}${scoreH} <span class="score-sep">:</span> ${scoreA}</span>
      <div class="match-date">${dateLabel}</div>
    </div>
    <div class="match-team away${awayKnown ? '' : ' bracket-tbd'}">${awayKnown ? `<span class="team-flag">${flag(awayName)}</span>` : ''}${awayName}</div>
  </div>`;
}

function groupsSummaryHtml() {
  const groupsHtml = Object.entries(GROUPS).map(([letter]) => {
    const standings = computeGroupStandings(letter, resultsMap);
    const rows = standings.map((s, i) => {
      const posClass = i < 2 ? 'qualify' : i === 2 ? 'third' : '';
      const gdStr = s.gd > 0 ? `+${s.gd}` : `${s.gd}`;
      return `
      <div class="group-team-row">
        <span class="standing-pos ${posClass}">${i + 1}</span>
        <span class="team-flag">${flag(s.team)}</span>
        <span class="standing-name">${s.team.replace('Bosnia and Herzegovina', 'Bosnia-Herz.')}</span>
        <span class="standing-val standing-pts">${s.pts}</span>
        <span class="standing-val standing-gd">${s.played ? gdStr : '–'}</span>
      </div>`;
    }).join('');
    return `
    <div class="group-card">
      <div class="group-card-header">
        Grupo ${letter}
        <span class="group-header-cols">
          <span class="group-col">Pts</span>
          <span class="group-col">DG</span>
        </span>
      </div>
      ${rows}
      ${groupPredictionsHtml(letter, standings)}
    </div>`;
  }).join('');

  return `
  <details class="groups-summary">
    <summary>📊 Resumen final de grupos</summary>
    <div class="groups-grid">${groupsHtml}</div>
  </details>`;
}

function renderBracketView() {
  const el = document.getElementById('bracket-container');
  if (!el) return;

  const roundsOrder = [
    { key: 'R32', title: 'Dieciseisavos de Final' },
    { key: 'R16', title: 'Octavos de Final' },
    { key: 'QF',  title: 'Cuartos de Final' },
    { key: 'SF',  title: 'Semifinal' },
  ];

  const roundsHtml = roundsOrder.map(({ key, title }) => `
    <div class="bracket-round">
      <div class="bracket-round-title">${title}</div>
      <div class="bracket-matches">
        ${KNOCKOUT_MATCHES.filter(m => m.round === key).map(renderBracketMatch).join('')}
      </div>
    </div>`).join('');

  const finalsHtml = `
    <div class="bracket-round bracket-finals">
      <div class="bracket-round-title">3er y 4to puesto</div>
      <div class="bracket-matches">${renderBracketMatch(KNOCKOUT_MATCHES.find(m => m.id === 'TP'))}</div>
      <div class="bracket-round-title">Final</div>
      <div class="bracket-matches">${renderBracketMatch(KNOCKOUT_MATCHES.find(m => m.id === 'FN'))}</div>
    </div>`;

  el.innerHTML = groupsSummaryHtml() + `<div class="bracket-rounds">${roundsHtml}${finalsHtml}</div>`;
}

// ── Matches view ─────────────────────────────────────────────────────────────

function renderMatchesView() {
  const el = document.getElementById('matches-list');
  let html = '';
  let lastDate = null;

  const sorted = [...GROUP_MATCHES].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id)
  );

  for (const match of sorted) {
    if (match.date !== lastDate) {
      const label = match.date
        ? new Date(match.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Fecha por confirmar';
      html += `<div class="section-title" style="text-transform:capitalize">${label}</div>`;
      lastDate = match.date;
    }
    const result = resultsMap[match.id];
    const liveIndicator = result?.live ? `<span class="live-dot-sm"></span>` : '';
    const scoreH = result?.homeScore != null ? result.homeScore : '–';
    const scoreA = result?.awayScore != null ? result.awayScore : '–';
    const boxClass = result?.live ? 'score-box score-live' : 'score-box';
    const pending = !result?.finished && !result?.live;
    html += `
    <div class="match-row">
      <div class="match-team home">${match.home}<span class="team-flag">${flag(match.home)}</span></div>
      <div class="match-score">
        <span class="${boxClass}">${liveIndicator}${scoreH} <span class="score-sep">:</span> ${scoreA}</span>
        <div class="match-date">Grupo ${match.group}</div>
        ${pending ? consensusHtml(match.id, match.home, match.away) : ''}
      </div>
      <div class="match-team away"><span class="team-flag">${flag(match.away)}</span>${match.away}</div>
    </div>`;
  }

  el.innerHTML = html || '<p class="empty">Sin partidos disponibles</p>';
}

// ── Navigation ────────────────────────────────────────────────────────────────

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');

  const btn = document.querySelector(`nav button[data-view="${view}"]`);
  if (btn) btn.classList.add('active');

  if (view === 'matches')      renderMatchesView();
  if (view === 'groups')       renderBracketView();
  if (view === 'evolution')    renderEvolutionChart();
  if (view === 'achievements') renderAchievementsView();
  if (view === 'predict')      renderPredictForm();
}

function showSpinner(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="spinner"></div>';
}

// ── News / announcements modal ─────────────────────────────────────────────────
// Multi-slide carousel shown on entry while the active player hasn't sent their
// Round of 32 picks yet (flip `r32Submitted: true` in their participants/*.json once they do).

function groupBonusVisualHtml() {
  if (!leaderboard.length) return '';
  const sorted = [...leaderboard].sort((a, b) => (b.groupBonus || 0) - (a.groupBonus || 0));
  const rows = sorted.map(p => `
    <div class="bonus-row${p.name === selectedPlayer ? ' bonus-row-me' : ''}">
      <span class="bonus-avatar">${p.name[0].toUpperCase()}</span>
      <span class="bonus-name">${p.name}</span>
      <span class="bonus-pill${p.groupBonus ? '' : ' bonus-pill-zero'}">+${p.groupBonus || 0}</span>
    </div>`).join('');
  return `<div class="bonus-board">${rows}</div>`;
}

function chaseVisualHtml() {
  if (!leaderboard.length) return '';
  const leader = leaderboard[0];
  const slug = leader.name.toLowerCase();
  return `
  <div class="wanted-poster">
    <div class="wanted-stamp">SE BUSCA</div>
    <div class="wanted-avatar">
      <img src="assets/${slug}.jpg" alt="${leader.name}" class="wanted-avatar-img"
           onerror="this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex';};this.src='assets/${slug}.png';">
      <span class="wanted-avatar-letter" style="display:none">${leader.name[0].toUpperCase()}</span>
    </div>
    <div class="wanted-name">${leader.name}</div>
    <div class="wanted-score">${leader.score} pts</div>
    <div class="wanted-caption">Líder tras el cierre de grupos</div>
  </div>`;
}

function chaseTitle() {
  return leaderboard.length ? `¡A la caza de ${leaderboard[0].name}!` : '¡A la caza del líder!';
}

function chaseBody() {
  if (leaderboard.length < 2) return '';
  const [leader, second] = leaderboard;
  const gap = leader.score - second.score;
  return `${leader.name} se sitúa líder tras el cierre de los grupos a ${gap} puntos del 2º (${second.name}). Pero todo puede dar la vuelta en las eliminatorias, donde cada acierto suma muchos más puntos.`;
}

function bottomVisualHtml() {
  if (leaderboard.length < 2) return '';
  const last = leaderboard[leaderboard.length - 1];
  const secondLast = leaderboard[leaderboard.length - 2];
  return `
  <div class="loser-poster">
    <div class="loser-stamp">ZONA PERDEDORES</div>
    <div class="loser-photo">
      <img src="assets/perdedores.jpg" alt="Zona de perdedores" class="loser-photo-img">
    </div>
    <div class="loser-name">${last.name} y ${secondLast.name}</div>
    <div class="loser-score">${last.score} y ${secondLast.score} pts</div>
    <div class="loser-caption">TABLA BAJA AL CIERRE DE GRUPOS</div>
  </div>`;
}

function bottomBody() {
  if (leaderboard.length < 2) return '';
  const leader = leaderboard[0];
  const last = leaderboard[leaderboard.length - 1];
  const secondLast = leaderboard[leaderboard.length - 2];
  const gap = leader.score - last.score;
  return `En el fondo de la tabla están ${last.name} y ${secondLast.name}, estando el primero a ${gap} puntos del líder. Suerte con las eliminatorias, os va a hacer falta.`;
}

const NEWS_SLIDES = [
  {
    icon: '🔒',
    title: '¡GRUPOS CERRADOS!',
    body: 'STOP THE COUNT. Se ha acabado la fase de grupos, y con ello, se han otorgado bonus de 1 punto por cada grupo acertado a la perfección.',
    visual: groupBonusVisualHtml,
  },
  {
    icon: '🕵️',
    title: chaseTitle,
    body: chaseBody,
    visual: chaseVisualHtml,
  },
  {
    icon: '🗑️',
    title: 'A ver si espabilamos',
    body: bottomBody,
    visual: bottomVisualHtml,
  },
  {
    icon: '🗳️',
    title: '¡Hora de pronosticar!',
    body: 'Para las rondas eliminatorias, tendremos que cubrir el formulario con nuestros resultados, y al terminar, darle a "LISTO, COPIAR", y pasárselo a Miguel para cargar las predicciones a la web.',
    visual: () => `<button class="cta-btn" onclick="goToPredictForm()">¡VAMOS ALLÁ! 🚀</button>`,
  },
];

let newsSlideIndex = 0;

function renderNewsSlide() {
  const slide = NEWS_SLIDES[newsSlideIndex];
  const icon  = typeof slide.icon  === 'function' ? slide.icon()  : slide.icon;
  const title = typeof slide.title === 'function' ? slide.title() : slide.title;
  const body  = typeof slide.body  === 'function' ? slide.body()  : slide.body;
  document.getElementById('news-icon').textContent  = icon || '📢';
  document.getElementById('news-title').textContent = title || '';
  document.getElementById('news-body').textContent  = body || '';
  document.getElementById('news-visual').innerHTML  = slide.visual ? slide.visual() : '';

  document.getElementById('news-dots').innerHTML = NEWS_SLIDES.map((_, i) =>
    `<span class="news-dot${i === newsSlideIndex ? ' active' : ''}"></span>`).join('');

  const prevBtn = document.getElementById('news-prev-btn');
  const nextBtn = document.getElementById('news-next-btn');
  prevBtn.style.visibility = newsSlideIndex === 0 ? 'hidden' : 'visible';
  nextBtn.textContent = newsSlideIndex === NEWS_SLIDES.length - 1 ? 'Entendido' : 'Siguiente →';
}

function newsPrev() {
  if (newsSlideIndex === 0) return;
  newsSlideIndex--;
  renderNewsSlide();
}

function newsNext() {
  if (newsSlideIndex === NEWS_SLIDES.length - 1) { closeNewsModal(); return; }
  newsSlideIndex++;
  renderNewsSlide();
}

function closeNewsModal() {
  document.getElementById('news-modal').style.display = 'none';
}

function handleNewsModalClick(e) {
  if (e.target === document.getElementById('news-modal')) closeNewsModal();
}

function maybeShowNewsModal() {
  if (!selectedPlayer) return;
  const participant = participants.find(p => p.name === selectedPlayer);
  if (!participant || participant.r32Submitted) return;
  newsSlideIndex = 0;
  renderNewsSlide();
  document.getElementById('news-modal').style.display = 'flex';
}

// ── Prediction form (Round of 32) ──────────────────────────────────────────────
// Local-only draft (per player, per browser) — no backend. When done, the player
// copies the generated JSON and sends it to Miguel, who pastes it into their
// participants/*.json and flips r32Submitted to true.

function goToPredictForm() {
  closeNewsModal();
  if (!selectedPlayer) { showIdentityModal(); return; }
  switchView('predict');
}

// R01 (South Africa-Canada) and R02 (Brazil-Japan) already kicked off before the
// form existed — their results/picks were collected by hand, so skip them here.
const PREDICT_FORM_EXCLUDED = ['R01', 'R02'];
function getPredictableR32Matches() {
  return KNOCKOUT_MATCHES.filter(m => m.round === 'R32' && !PREDICT_FORM_EXCLUDED.includes(m.id));
}

function predictDraftKey() {
  return `porra_r32_draft_${selectedPlayer}`;
}

function loadPredictDraft() {
  const stored = JSON.parse(localStorage.getItem(predictDraftKey()) || 'null') || {};
  const r32 = getPredictableR32Matches();
  const draft = {};
  for (const m of r32) draft[m.id] = stored[m.id] || { home: 0, away: 0, touched: false };
  return draft;
}

let predictDraft = {};

function savePredictDraft() {
  localStorage.setItem(predictDraftKey(), JSON.stringify(predictDraft));
}

// 0-0 is a perfectly valid prediction (solo cuentan los 90 minutos, sin prórroga ni
// penaltis) — so "completed" is tracked via an explicit touched flag, not the score.
function adjustPredictScore(matchId, side, delta) {
  const val = Math.max(0, (predictDraft[matchId][side] || 0) + delta);
  predictDraft[matchId][side] = val;
  predictDraft[matchId].touched = true;
  savePredictDraft();
  document.getElementById(`predict-${matchId}-${side}`).textContent = val;
  updatePredictProgress();
}

function updatePredictProgress() {
  const r32 = getPredictableR32Matches();
  const touched = r32.filter(m => predictDraft[m.id].touched).length;
  const el = document.getElementById('predict-progress');
  if (el) el.textContent = `${touched} / ${r32.length} partidos completados`;
}

function renderPredictMatch(match) {
  const d = predictDraft[match.id];
  return `
  <div class="predict-row">
    <div class="predict-team home">${match.home}<span class="team-flag">${flag(match.home)}</span></div>
    <div class="predict-steppers">
      <div class="stepper">
        <button class="stepper-btn" onclick="adjustPredictScore('${match.id}','home',-1)">−</button>
        <span class="stepper-val" id="predict-${match.id}-home">${d.home}</span>
        <button class="stepper-btn" onclick="adjustPredictScore('${match.id}','home',1)">+</button>
      </div>
      <span class="stepper-sep">:</span>
      <div class="stepper">
        <button class="stepper-btn" onclick="adjustPredictScore('${match.id}','away',-1)">−</button>
        <span class="stepper-val" id="predict-${match.id}-away">${d.away}</span>
        <button class="stepper-btn" onclick="adjustPredictScore('${match.id}','away',1)">+</button>
      </div>
    </div>
    <div class="predict-team away"><span class="team-flag">${flag(match.away)}</span>${match.away}</div>
  </div>`;
}

function renderPredictForm() {
  const el = document.getElementById('predict-container');
  if (!el) return;

  if (!selectedPlayer) {
    el.innerHTML = `<p class="empty">Identifícate para rellenar tu pronóstico.<br><button class="identity-btn" style="margin-top:10px" onclick="showIdentityModal()">Identifícate</button></p>`;
    return;
  }

  predictDraft = loadPredictDraft();
  const r32 = getPredictableR32Matches();

  el.innerHTML = `
    <button class="back-btn" onclick="switchView('leaderboard')">← Volver</button>
    <div class="section-title">Dieciseisavos de Final · ${selectedPlayer}</div>
    <p id="predict-progress" class="predict-hint"></p>
    <div class="predict-list">${r32.map(renderPredictMatch).join('')}</div>
    <button class="copy-btn" id="predict-copy-btn" onclick="copyPredictions()">LISTO, COPIAR 📋</button>
    <textarea id="predict-output" class="predict-output" readonly rows="4"
      placeholder="Aquí aparecerá el texto a copiar..."></textarea>
  `;
  updatePredictProgress();
}

function buildPredictionsCopyText() {
  const r32 = getPredictableR32Matches();
  const lines = r32.map(m => `  "${m.id}": { "home": ${predictDraft[m.id].home}, "away": ${predictDraft[m.id].away} }`);
  return `Predicciones de ${selectedPlayer} (Dieciseisavos de Final):\n{\n${lines.join(',\n')}\n}`;
}

async function copyPredictions() {
  const text = buildPredictionsCopyText();
  const output = document.getElementById('predict-output');
  output.value = text;

  const btn = document.getElementById('predict-copy-btn');
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = '¡COPIADO! ✅ Pégaselo a Miguel';
  } catch {
    output.select();
    btn.textContent = 'No se pudo copiar solo — selecciona el texto de abajo';
  }
  setTimeout(() => { btn.textContent = 'LISTO, COPIAR 📋'; }, 4000);
}

// ── Penalty modal ─────────────────────────────────────────────────────────────

function closePenaltyModal(e) {
  if (e && e.target !== document.getElementById('penalty-modal')) return;
  document.getElementById('penalty-modal').style.display = 'none';
  if (selectedPlayer) localStorage.setItem('penalty_seen_' + selectedPlayer, '1');
}

function maybeShowPenaltyModal() {
  if (!selectedPlayer) return;
  if (!localStorage.getItem('penalty_seen_' + selectedPlayer))
    document.getElementById('penalty-modal').style.display = 'flex';
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  switchView('leaderboard');
  init();
  maybeShowPenaltyModal();
});
