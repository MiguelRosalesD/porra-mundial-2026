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

  for (const match of ALL_MATCHES) {
    const round = match.group ? 'group' : match.round;
    const prediction = participant.predictions?.[match.id];
    const result = allResults[match.id];
    const pts = scoreMatch(prediction, result, round);
    if (pts > 0) breakdown[match.id] = pts;
    total += pts;
  }

  return { total, breakdown };
}

function buildLeaderboard(participants, allResults) {
  return participants
    .map(p => {
      const { total, breakdown } = scoreParticipant(p, allResults);
      return { ...p, score: total, breakdown };
    })
    .sort((a, b) => b.score - a.score);
}

// allResults keyed by match ID: { M01: { homeScore: 2, awayScore: 0 }, ... }
// Built by reconciling ESPN data with fixture
function buildResultsMap(fixtureList, espnResults) {
  const map = {};
  for (const match of fixtureList) {
    if (!match.home || !match.away) continue;
    const r = matchResult(match, espnResults);
    if (r) map[match.id] = r;
  }
  return map;
}
