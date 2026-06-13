// Achievement definitions for Porra Escuadrón Boquerón
// check(p, finished, lb) → { unlocked: bool, progress?: N, total?: N }
// p = leaderboard entry (has .breakdown, .predictions, .name)
// finished = finishedMatchesSorted()
// lb = full leaderboard array

// ── Helpers ───────────────────────────────────────────────────────────────────

function countExacts(p, fin) {
  return fin.filter(m => {
    const round = m.group ? 'group' : m.round;
    return (p.breakdown[m.id] || 0) === (SCORING[round] || SCORING.group)[1];
  }).length;
}

function bestStreak(p, fin, scoring) {
  let best = 0, cur = 0;
  for (const m of fin) {
    const hit = scoring ? (p.breakdown[m.id] || 0) > 0 : (p.breakdown[m.id] || 0) === 0;
    if (hit) { cur++; best = Math.max(best, cur); } else cur = 0;
  }
  return best;
}

function groupFinishedByDate(fin) {
  const map = {};
  fin.forEach(m => { const d = m.date || '?'; (map[d] = map[d] || []).push(m); });
  return map;
}

// ── Achievement catalogue ─────────────────────────────────────────────────────

const ACHIEVEMENTS = [

  // ── Primeros pasos ─────────────────────────────────────────────────────────
  {
    id: 'first_hit', icon: '🐣', name: 'Estreno', cat: 'Primeros pasos',
    desc: 'Acertar el resultado de tu primer partido (1×2 o exacto)',
    check(p, fin) {
      const n = Object.keys(p.breakdown).length;
      return { unlocked: n >= 1, progress: Math.min(n, 1), total: 1 };
    }
  },
  {
    id: 'first_exact', icon: '🎯', name: 'Punto a punto', cat: 'Primeros pasos',
    desc: 'Acertar el marcador exacto por primera vez',
    check(p, fin) {
      const n = countExacts(p, fin);
      return { unlocked: n >= 1, progress: Math.min(n, 1), total: 1 };
    }
  },

  // ── Precisión ──────────────────────────────────────────────────────────────
  {
    id: 'exact5', icon: '🏹', name: 'Francotirador', cat: 'Precisión',
    desc: 'Acertar 5 marcadores exactos a lo largo del torneo',
    check(p, fin) {
      const n = countExacts(p, fin);
      return { unlocked: n >= 5, progress: n, total: 5 };
    }
  },
  {
    id: 'exact10', icon: '🔮', name: 'Oráculo', cat: 'Precisión',
    desc: 'Acertar 10 marcadores exactos',
    check(p, fin) {
      const n = countExacts(p, fin);
      return { unlocked: n >= 10, progress: n, total: 10 };
    }
  },
  {
    id: 'exact20', icon: '💎', name: 'Inhumano', cat: 'Precisión',
    desc: 'Acertar 20 marcadores exactos. Casi imposible.',
    check(p, fin) {
      const n = countExacts(p, fin);
      return { unlocked: n >= 20, progress: n, total: 20 };
    }
  },

  // ── Osadía ─────────────────────────────────────────────────────────────────
  {
    id: 'chaos_exact', icon: '🎪', name: 'Adivino del caos', cat: 'Osadía',
    desc: 'Acertar el marcador exacto en un partido con 5 o más goles en total',
    check(p, fin) {
      const hit = fin.some(m => {
        const r = resultsMap[m.id];
        if (!r?.finished) return false;
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        const round = m.group ? 'group' : m.round;
        const exactPts = (SCORING[round] || SCORING.group)[1];
        return (p.breakdown[m.id] || 0) === exactPts && (r.homeScore + r.awayScore) >= 5;
      });
      return { unlocked: hit };
    }
  },
  {
    id: 'big_gun', icon: '🚀', name: 'Artillería', cat: 'Osadía',
    desc: 'Acertar el marcador exacto en un partido donde predijiste 4+ goles para un equipo',
    check(p, fin) {
      const hit = fin.some(m => {
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        if (Math.max(pred.home, pred.away) < 4) return false;
        const round = m.group ? 'group' : m.round;
        return (p.breakdown[m.id] || 0) === (SCORING[round] || SCORING.group)[1];
      });
      return { unlocked: hit };
    }
  },
  {
    id: 'impossible', icon: '🎰', name: 'Marcador imposible', cat: 'Osadía',
    desc: 'Acertar un resultado con 4+ goles de diferencia (tipo 4-0, 5-1, 0-4…)',
    check(p, fin) {
      const hit = fin.some(m => {
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        if (Math.abs(pred.home - pred.away) < 4) return false;
        const round = m.group ? 'group' : m.round;
        return (p.breakdown[m.id] || 0) === (SCORING[round] || SCORING.group)[1];
      });
      return { unlocked: hit };
    }
  },
  {
    id: 'pacifist', icon: '🤝', name: 'Pacifista', cat: 'Osadía',
    desc: 'Acertar el marcador exacto en 3 partidos que acabaron en empate',
    check(p, fin) {
      const n = fin.filter(m => {
        const r = resultsMap[m.id];
        if (!r?.finished || r.homeScore !== r.awayScore) return false;
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        const round = m.group ? 'group' : m.round;
        return (p.breakdown[m.id] || 0) === (SCORING[round] || SCORING.group)[1];
      }).length;
      return { unlocked: n >= 3, progress: n, total: 3 };
    }
  },

  // ── Rachas ─────────────────────────────────────────────────────────────────
  {
    id: 'streak5', icon: '🔥', name: 'Imparable', cat: 'Rachas',
    desc: '5 partidos seguidos sumando puntos (no tienen que ser consecutivos en el calendario, pueden ser de días distintos)',
    check(p, fin) {
      const n = bestStreak(p, fin, true);
      return { unlocked: n >= 5, progress: n, total: 5 };
    }
  },
  {
    id: 'streak10', icon: '🌋', name: 'Legendario', cat: 'Rachas',
    desc: '10 partidos seguidos puntuando',
    check(p, fin) {
      const n = bestStreak(p, fin, true);
      return { unlocked: n >= 10, progress: n, total: 10 };
    }
  },
  {
    id: 'losestreak5', icon: '🧊', name: 'Racha negra', cat: 'Rachas',
    desc: '5 partidos seguidos sin puntuar ni uno',
    check(p, fin) {
      const n = bestStreak(p, fin, false);
      return { unlocked: n >= 5, progress: n, total: 5 };
    }
  },

  // ── Especiales ─────────────────────────────────────────────────────────────
  {
    id: 'champion', icon: '🏆', name: 'El que ríe último', cat: 'Especiales',
    desc: 'Acertar el campeón del Mundial',
    check(p, fin) {
      const r = resultsMap['FN'];
      if (!r?.finished) return { unlocked: false };
      return { unlocked: (p.breakdown['FN'] || 0) > 0 };
    }
  },
  {
    id: 'perfect_day', icon: '🌟', name: 'Jornada perfecta', cat: 'Especiales',
    desc: 'Acertar todos los 1×2 en un día con 3 o más partidos',
    check(p, fin) {
      const byDate = groupFinishedByDate(fin);
      const hit = Object.values(byDate).some(matches =>
        matches.length >= 3 && matches.every(m => (p.breakdown[m.id] || 0) > 0)
      );
      return { unlocked: hit };
    }
  },
  {
    id: 'hattrick_day', icon: '⚽', name: 'Hat-trick', cat: 'Especiales',
    desc: '3 marcadores exactos el mismo día',
    check(p, fin) {
      const byDate = groupFinishedByDate(fin);
      const hit = Object.values(byDate).some(matches =>
        matches.filter(m => {
          const round = m.group ? 'group' : m.round;
          return (p.breakdown[m.id] || 0) === (SCORING[round] || SCORING.group)[1];
        }).length >= 3
      );
      return { unlocked: hit };
    }
  },
  {
    id: 'maverick', icon: '🎭', name: 'Contracorriente', cat: 'Especiales',
    desc: 'Ser el único del grupo en acertar el resultado de un partido',
    check(p, fin, lb) {
      const hit = fin.some(m => {
        if ((p.breakdown[m.id] || 0) === 0) return false;
        return lb.filter(lp => lp.name !== p.name).every(lp => (lp.breakdown[m.id] || 0) === 0);
      });
      return { unlocked: hit };
    }
  },

  // ── Vergüenza ajena ────────────────────────────────────────────────────────
  {
    id: 'disaster', icon: '💥', name: '¡Vaya ojo!', cat: 'Vergüenza ajena',
    desc: 'Predecir un marcador que se aleja 5 o más goles de la realidad (sumando error home + error away)',
    check(p, fin) {
      const hit = fin.some(m => {
        const r = resultsMap[m.id];
        if (!r?.finished) return false;
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        return Math.abs(pred.home - r.homeScore) + Math.abs(pred.away - r.awayScore) >= 5;
      });
      return { unlocked: hit };
    }
  },
  {
    id: 'palomita', icon: '🤡', name: 'Palomita', cat: 'Vergüenza ajena',
    desc: 'Apostar por el perdedor en un partido donde el ganador ganó por 3+ goles',
    check(p, fin) {
      const hit = fin.some(m => {
        const r = resultsMap[m.id];
        if (!r?.finished || Math.abs(r.homeScore - r.awayScore) < 3) return false;
        const pred = p.predictions?.[m.id];
        if (!pred || pred.home == null) return false;
        const realSign  = Math.sign(r.homeScore - r.awayScore);
        const predSign  = Math.sign(pred.home - pred.away);
        return realSign !== predSign;
      });
      return { unlocked: hit };
    }
  },
];

// ── Render ────────────────────────────────────────────────────────────────────

function renderAchievementsView() {
  const el = document.getElementById('achievements-list');
  if (!el) return;

  if (!selectedPlayer) {
    el.innerHTML = '<p class="empty">Identifícate para ver tus logros</p>';
    return;
  }

  const p = leaderboard.find(lp => lp.name === selectedPlayer);
  if (!p) { el.innerHTML = '<p class="empty">Jugador no encontrado</p>'; return; }

  const fin = finishedMatchesSorted();
  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))];
  const unlocked = ACHIEVEMENTS.filter(a => a.check(p, fin, leaderboard).unlocked).length;

  let html = `<div class="ach-summary">${unlocked} / ${ACHIEVEMENTS.length} logros desbloqueados</div>`;

  for (const cat of cats) {
    const group = ACHIEVEMENTS.filter(a => a.cat === cat);
    html += `<div class="ach-cat-title">${cat}</div><div class="ach-grid">`;
    for (const ach of group) {
      const result = ach.check(p, fin, leaderboard);
      const locked = !result.unlocked;
      const hasBar = result.total != null;
      const pct = hasBar ? Math.min(100, Math.round((result.progress || 0) / result.total * 100)) : 0;
      html += `
      <div class="ach-card ${locked ? 'locked' : 'unlocked'}">
        <div class="ach-icon">${locked ? '🔒' : ach.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${locked ? '???' : ach.name}</div>
          <div class="ach-desc">${locked ? 'Logro bloqueado' : ach.desc}</div>
          ${hasBar ? `
          <div class="ach-bar-wrap">
            <div class="ach-bar"><div class="ach-bar-fill ${locked ? '' : 'done'}" style="width:${pct}%"></div></div>
            <span class="ach-bar-label">${result.progress || 0} / ${result.total}</span>
          </div>` : ''}
        </div>
      </div>`;
    }
    html += '</div>';
  }

  el.innerHTML = html;
}
