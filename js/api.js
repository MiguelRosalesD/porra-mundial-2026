// Fetches live World Cup 2026 results from ESPN's public API
// No API key required. Results are cached in sessionStorage for 5 minutes.

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';
const CACHE_TTL = 2 * 60 * 1000; // 2 min

// ── Name normalisation ────────────────────────────────────────────────────────
// ESPN uses its own display names; map them to our canonical English names.

const NAME_ALIASES = {
  'United States':            ['USA', 'United States of America'],
  'Ivory Coast':              ["Côte d'Ivoire", "Cote d'Ivoire", "Cote dIvoire"],
  'Turkey':                   ['Türkiye', 'Turkiye'],
  'DR Congo':                 ['Congo DR', 'Congo, DR', 'Democratic Republic of Congo', 'DRC'],
  'Curacao':                  ['Curaçao', 'Curacao'],
  'Bosnia and Herzegovina':   ['Bosnia & Herzegovina', 'Bosnia-Herzegovina', 'Bosnia Herzegovina'],
  'South Korea':              ['Korea Republic', 'Republic of Korea'],
  'Iran':                     ['IR Iran'],
  'Cape Verde':               ['Cabo Verde'],
};

function normalizeTeam(name) {
  if (!name) return name;
  for (const [canonical, aliases] of Object.entries(NAME_ALIASES)) {
    if (aliases.some(a => a.toLowerCase() === name.toLowerCase())) return canonical;
  }
  return name;
}

// ── ESPN fetch ────────────────────────────────────────────────────────────────

async function fetchMatchesForDate(dateStr) {
  const url = `${ESPN_BASE}/scoreboard?dates=${dateStr}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return json.events || [];
}

// Predictions only ever cover the 90-minute result. Once a knockout match goes to extra
// time (period > 2), ESPN's competitor "score" includes ET goals (but not the penalty
// shootout, which is tracked separately). To score predictions fairly we need the score
// as it stood at the end of regulation time, derived from the goal-by-goal "details" feed.
function computeRegulationScore(comp, homeId, awayId, finalHome, finalAway, period) {
  if (period == null || period <= 2) return { regHomeScore: finalHome, regAwayScore: finalAway };

  const details = comp?.details;
  if (!Array.isArray(details)) return { regHomeScore: finalHome, regAwayScore: finalAway };

  let regHome = 0, regAway = 0;
  for (const d of details) {
    if (!d.scoringPlay || d.shootout) continue;
    const minute = parseInt(d.clock?.displayValue, 10);
    if (Number.isNaN(minute) || minute > 90) continue;
    const val = d.scoreValue || 1;
    if (d.team?.id === homeId) regHome += val;
    else if (d.team?.id === awayId) regAway += val;
  }
  return { regHomeScore: regHome, regAwayScore: regAway };
}

function espnEventToResult(event) {
  const comp = event.competitions?.[0];
  if (!comp) return null;
  const [c1, c2] = comp.competitors || [];
  if (!c1 || !c2) return null;

  const home = c1.homeAway === 'home' ? c1 : c2;
  const away = c1.homeAway === 'away' ? c1 : c2;
  const status   = event.status?.type?.name;
  const finished = ['STATUS_FINAL', 'STATUS_FULL_TIME', 'STATUS_FT', 'STATUS_FULL_PEN'].includes(status)
                   || event.status?.type?.completed === true;
  const live     = ['STATUS_IN_PROGRESS', 'STATUS_FIRST_HALF', 'STATUS_SECOND_HALF', 'STATUS_HALFTIME', 'STATUS_END_PERIOD', 'STATUS_EXTRA_TIME', 'STATUS_PENALTIES'].includes(status);
  const clock    = event.status?.displayClock || '';
  const period   = event.status?.period || 0;

  const homeScore = (finished || live) ? parseInt(home.score, 10) : null;
  const awayScore = (finished || live) ? parseInt(away.score, 10) : null;

  let regHomeScore = homeScore, regAwayScore = awayScore;
  if (homeScore != null && awayScore != null) {
    try {
      ({ regHomeScore, regAwayScore } = computeRegulationScore(comp, home.team.id, away.team.id, homeScore, awayScore, period));
    } catch (e) {
      regHomeScore = homeScore; regAwayScore = awayScore;
    }
  }

  return {
    espnId:    event.id,
    homeTeam:  normalizeTeam(home.team.displayName),
    awayTeam:  normalizeTeam(away.team.displayName),
    homeScore, awayScore,
    regHomeScore, regAwayScore,
    status, finished, live, clock, period,
    date: event.date?.slice(0, 10),
  };
}

// Returns map: { "Mexico vs South Africa": { homeScore, awayScore, homeTeam, awayTeam, live, finished } }
async function fetchAllResults() {
  const cacheKey = 'wc2026_results';
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { ts, data } = JSON.parse(cached);
    const hasLive = Object.values(data).some(r => r.live);
    const ttl = hasLive ? 60_000 : CACHE_TTL;
    if (Date.now() - ts < ttl) return data;
  }

  // Date range: June 11 – July 26 2026
  const dates = [];
  const start = new Date('2026-06-11');
  const end   = new Date('2026-07-27'); // +1 day buffer for UTC/local offset
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
  }

  // Only fetch up to tomorrow (handles late UTC matches that belong to today locally)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const cutoff = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
  const fetchDates = dates.filter(d => d <= cutoff);

  const results = {};
  for (let i = 0; i < fetchDates.length; i += 5) {
    const batch = fetchDates.slice(i, i + 5);
    const fetched = await Promise.all(batch.map(fetchMatchesForDate));
    fetched.flat().forEach(event => {
      const r = espnEventToResult(event);
      if (!r) return;
      // Key by canonical names; also store reverse so matchResult finds it either way
      results[`${r.homeTeam} vs ${r.awayTeam}`] = r;
    });
  }

  sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: results }));
  return results;
}

// ── Fixture → result lookup ───────────────────────────────────────────────────

function matchResult(fixture, espnResults) {
  if (!fixture.home || !fixture.away) return null;
  const home = normalizeTeam(fixture.home);
  const away = normalizeTeam(fixture.away);
  return espnResults[`${home} vs ${away}`]
      || espnResults[`${away} vs ${home}`]
      || null;
}
