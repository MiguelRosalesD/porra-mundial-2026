// Scoring logic for porra-mundial-2026

function getOutcome(home, away) {
  if (home > away) return 'H';
  if (away > home) return 'A';
  return 'D';
}

// round: 'group' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'FN'
function scoreMatch(prediction, result, round) {
  if (!result || result.homeScore === null || result.awayScore === null) return 0;
  if (!prediction) return 0;

  const [pts1x2, ptsExact] = SCORING[round] || SCORING.group;
  const realHome = result.homeScore;
  const realAway = result.awayScore;

  // Knockout winner-only prediction (from infobae simulator)
  if (prediction.winner != null) {
    const actualWinner = realHome > realAway ? result.homeTeam
                       : realAway > realHome ? result.awayTeam
                       : null; // draw shouldn't happen in knockout
    return prediction.winner === actualWinner ? pts1x2 : 0;
  }

  if (prediction.home == null || prediction.away == null) return 0;
  const predHome = parseInt(prediction.home, 10);
  const predAway = parseInt(prediction.away, 10);

  // Exact score
  if (predHome === realHome && predAway === realAway) return ptsExact;

  // 1X2 / correct winner
  if (getOutcome(predHome, predAway) === getOutcome(realHome, realAway)) return pts1x2;

  return 0;
}

function scoreParticipant(participant, allResults) {
  let total = 0;
  const breakdown = {};
  const scoreFrom = participant.scoreFrom || null;

  for (const match of ALL_MATCHES) {
    if (scoreFrom && match.date && match.date < scoreFrom) continue;
    const round = match.group ? 'group' : match.round;
    const prediction = participant.predictions?.[match.id];
    const result = allResults[match.id];
    const pts = scoreMatch(prediction, result, round);
    if (pts > 0) breakdown[match.id] = pts;
    total += pts;
  }

  const { bonus: groupBonus, groups: groupBonusGroups } = computeGroupBonus(participant.predictions, allResults);
  total += groupBonus;

  return { total, breakdown, groupBonus, groupBonusGroups };
}

function buildLeaderboard(participants, allResults) {
  return participants
    .map(p => {
      const { total, breakdown, groupBonus, groupBonusGroups } = scoreParticipant(p, allResults);
      return { ...p, score: total, breakdown, groupBonus, groupBonusGroups };
    })
    .sort((a, b) => b.score - a.score);
}

// ── Group order bonus: +1 point per group whose final standings order was predicted exactly ──

function computeGroupStandings(groupLetter, allResults) {
  const teams = GROUPS[groupLetter].teams;
  const stats = {};
  for (const t of teams) stats[t] = { team: t, pts: 0, gf: 0, ga: 0, gd: 0, played: 0 };

  for (const match of GROUP_MATCHES.filter(m => m.group === groupLetter)) {
    const r = allResults[match.id];
    if (!r || r.homeScore === null) continue;
    const h = match.home, a = match.away;
    stats[h].gf += r.homeScore; stats[h].ga += r.awayScore; stats[h].played++;
    stats[a].gf += r.awayScore; stats[a].ga += r.homeScore; stats[a].played++;
    if (r.homeScore > r.awayScore)       stats[h].pts += 3;
    else if (r.homeScore < r.awayScore)  stats[a].pts += 3;
    else                                 { stats[h].pts += 1; stats[a].pts += 1; }
  }

  for (const t of teams) stats[t].gd = stats[t].gf - stats[t].ga;
  return Object.values(stats).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
}

function simulateGroupStandings(groupLetter, predictions) {
  const teams = GROUPS[groupLetter].teams;
  const stats = {};
  for (const t of teams) stats[t] = { team: t, pts: 0, gf: 0, ga: 0 };
  for (const match of GROUP_MATCHES.filter(m => m.group === groupLetter)) {
    const pred = predictions?.[match.id];
    if (!pred || pred.home == null) continue;
    const h = match.home, a = match.away;
    stats[h].gf += pred.home; stats[h].ga += pred.away;
    stats[a].gf += pred.away; stats[a].ga += pred.home;
    if (pred.home > pred.away)      stats[h].pts += 3;
    else if (pred.away > pred.home) stats[a].pts += 3;
    else                            { stats[h].pts += 1; stats[a].pts += 1; }
  }
  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf)
    .map(s => s.team);
}

function isGroupComplete(groupLetter, allResults) {
  return GROUP_MATCHES.filter(m => m.group === groupLetter).every(m => allResults[m.id]?.finished);
}

function computeGroupBonus(predictions, allResults) {
  const groups = [];
  for (const letter of Object.keys(GROUPS)) {
    if (!isGroupComplete(letter, allResults)) continue;
    const actualOrder = computeGroupStandings(letter, allResults).map(s => s.team);
    const predOrder = simulateGroupStandings(letter, predictions);
    if (JSON.stringify(actualOrder) === JSON.stringify(predOrder)) groups.push(letter);
  }
  return { bonus: groups.length, groups };
}

// allResults keyed by match ID: { M01: { homeScore: 2, awayScore: 0 }, ... }
// Built by reconciling ESPN data with fixture
function buildResultsMap(fixtureList, espnResults) {
  const map = {};

  // Pass 1: matches whose teams are already known (group stage + Round of 32)
  for (const match of fixtureList) {
    if (!match.home || !match.away) continue;
    const r = matchResult(match, espnResults);
    if (r) map[match.id] = r;
  }

  // Pass 2+: resolve bracket slots round by round as their feeder matches finish
  let changed = true;
  while (changed) {
    changed = false;
    for (const match of fixtureList) {
      if (map[match.id] || !match.from) continue;
      const teams = resolveBracketTeams(match.id, map);
      if (!teams.home || !teams.away) continue;
      const r = matchResult(teams, espnResults);
      if (r) { map[match.id] = r; changed = true; }
    }
  }

  return map;
}

// Resolves the two teams that should occupy a bracket slot, using results known so far.
// For matches with static fixture teams (group stage, R32) returns them as-is.
function resolveBracketTeams(matchId, resultsMap) {
  const match = ALL_MATCHES.find(m => m.id === matchId);
  if (!match) return { home: null, away: null };
  if (match.home && match.away) return { home: match.home, away: match.away };
  if (!match.from) return { home: null, away: null };
  return {
    home: getBracketOutcome(match.from.home, resultsMap, match.loser),
    away: getBracketOutcome(match.from.away, resultsMap, match.loser),
  };
}

// Returns the winner (or loser, for the 3rd place slot) of a finished bracket match, else null.
function getBracketOutcome(matchId, resultsMap, wantLoser) {
  const teams = resolveBracketTeams(matchId, resultsMap);
  if (!teams.home || !teams.away) return null;
  const r = resultsMap[matchId];
  if (!r || r.homeScore == null || !r.finished || r.homeScore === r.awayScore) return null;
  const winner = r.homeScore > r.awayScore ? teams.home : teams.away;
  const loser  = winner === teams.home ? teams.away : teams.home;
  return wantLoser ? loser : winner;
}
