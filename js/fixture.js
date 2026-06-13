// World Cup 2026 - Complete fixture (104 matches)
// Group stage: M01-M72 | Round of 32: R01-R16 | R16: S01-S08 | QF: Q01-Q04 | SF: SF1-SF2 | 3rd: TP | F: FN

// ISO 3166-1 alpha-2 codes → flagcdn.com images (England/Scotland use subdivision codes)
const TEAM_FLAGS = {
  'Mexico':                  'mx',
  'South Africa':            'za',
  'South Korea':             'kr',
  'Czechia':                 'cz',
  'Canada':                  'ca',
  'Bosnia and Herzegovina':  'ba',
  'Qatar':                   'qa',
  'Switzerland':             'ch',
  'Brazil':                  'br',
  'Morocco':                 'ma',
  'Haiti':                   'ht',
  'Scotland':                'gb-sct',
  'United States':           'us',
  'Paraguay':                'py',
  'Australia':               'au',
  'Turkey':                  'tr',
  'Germany':                 'de',
  'Curacao':                 'cw',
  'Ivory Coast':             'ci',
  'Ecuador':                 'ec',
  'Netherlands':             'nl',
  'Japan':                   'jp',
  'Sweden':                  'se',
  'Tunisia':                 'tn',
  'Belgium':                 'be',
  'Egypt':                   'eg',
  'Iran':                    'ir',
  'New Zealand':             'nz',
  'Spain':                   'es',
  'Cape Verde':              'cv',
  'Saudi Arabia':            'sa',
  'Uruguay':                 'uy',
  'France':                  'fr',
  'Senegal':                 'sn',
  'Iraq':                    'iq',
  'Norway':                  'no',
  'Argentina':               'ar',
  'Algeria':                 'dz',
  'Austria':                 'at',
  'Jordan':                  'jo',
  'Portugal':                'pt',
  'DR Congo':                'cd',
  'Uzbekistan':              'uz',
  'Colombia':                'co',
  'England':                 'gb-eng',
  'Croatia':                 'hr',
  'Ghana':                   'gh',
  'Panama':                  'pa',
};

function flag(name) {
  const code = TEAM_FLAGS[name];
  if (!code) return '';
  return `<img class="flag-img" src="https://flagcdn.com/w20/${code}.png" alt="${name}" loading="lazy">`;
}

const GROUPS = {
  A: { teams: ['Mexico', 'South Africa', 'South Korea', 'Czechia'] },
  B: { teams: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'] },
  C: { teams: ['Brazil', 'Morocco', 'Haiti', 'Scotland'] },
  D: { teams: ['United States', 'Paraguay', 'Australia', 'Turkey'] },
  E: { teams: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'] },
  F: { teams: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'] },
  G: { teams: ['Belgium', 'Egypt', 'Iran', 'New Zealand'] },
  H: { teams: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'] },
  I: { teams: ['France', 'Senegal', 'Iraq', 'Norway'] },
  J: { teams: ['Argentina', 'Algeria', 'Austria', 'Jordan'] },
  K: { teams: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'] },
  L: { teams: ['England', 'Croatia', 'Ghana', 'Panama'] },
};

const GROUP_MATCHES = [
  // Group A
  { id: 'M01', group: 'A', home: 'Mexico',       away: 'South Africa', date: '2026-06-11' },
  { id: 'M02', group: 'A', home: 'South Korea',  away: 'Czechia',      date: '2026-06-11' },
  { id: 'M03', group: 'A', home: 'Czechia',      away: 'South Africa', date: '2026-06-18' },
  { id: 'M04', group: 'A', home: 'Mexico',       away: 'South Korea',  date: '2026-06-18' },
  { id: 'M05', group: 'A', home: 'Czechia',      away: 'Mexico',       date: '2026-06-24' },
  { id: 'M06', group: 'A', home: 'South Africa', away: 'South Korea',  date: '2026-06-24' },

  // Group B
  { id: 'M07', group: 'B', home: 'Canada',               away: 'Bosnia and Herzegovina', date: '2026-06-12' },
  { id: 'M08', group: 'B', home: 'Qatar',                away: 'Switzerland',            date: '2026-06-13' },
  { id: 'M09', group: 'B', home: 'Switzerland',          away: 'Bosnia and Herzegovina', date: '2026-06-18' },
  { id: 'M10', group: 'B', home: 'Canada',               away: 'Qatar',                  date: '2026-06-18' },
  { id: 'M11', group: 'B', home: 'Switzerland',          away: 'Canada',                 date: '2026-06-24' },
  { id: 'M12', group: 'B', home: 'Bosnia and Herzegovina', away: 'Qatar',                date: '2026-06-24' },

  // Group C
  { id: 'M13', group: 'C', home: 'Brazil',   away: 'Morocco',  date: '2026-06-13' },
  { id: 'M14', group: 'C', home: 'Haiti',    away: 'Scotland', date: '2026-06-13' },
  { id: 'M15', group: 'C', home: 'Scotland', away: 'Morocco',  date: '2026-06-19' },
  { id: 'M16', group: 'C', home: 'Brazil',   away: 'Haiti',    date: '2026-06-19' },
  { id: 'M17', group: 'C', home: 'Scotland', away: 'Brazil',   date: '2026-06-24' },
  { id: 'M18', group: 'C', home: 'Morocco',  away: 'Haiti',    date: '2026-06-24' },

  // Group D
  { id: 'M19', group: 'D', home: 'United States', away: 'Paraguay',   date: '2026-06-12' },
  { id: 'M20', group: 'D', home: 'Australia',     away: 'Turkey',     date: '2026-06-13' },
  { id: 'M21', group: 'D', home: 'United States', away: 'Australia',  date: '2026-06-19' },
  { id: 'M22', group: 'D', home: 'Turkey',        away: 'Paraguay',   date: '2026-06-19' },
  { id: 'M23', group: 'D', home: 'Turkey',        away: 'United States', date: '2026-06-25' },
  { id: 'M24', group: 'D', home: 'Paraguay',      away: 'Australia',  date: '2026-06-25' },

  // Group E
  { id: 'M25', group: 'E', home: 'Germany',      away: 'Curacao',      date: '2026-06-14' },
  { id: 'M26', group: 'E', home: 'Ivory Coast',  away: 'Ecuador',      date: '2026-06-14' },
  { id: 'M27', group: 'E', home: 'Germany',      away: 'Ivory Coast',  date: '2026-06-20' },
  { id: 'M28', group: 'E', home: 'Ecuador',      away: 'Curacao',      date: '2026-06-20' },
  { id: 'M29', group: 'E', home: 'Ecuador',      away: 'Germany',      date: '2026-06-25' },
  { id: 'M30', group: 'E', home: 'Curacao',      away: 'Ivory Coast',  date: '2026-06-25' },

  // Group F
  { id: 'M31', group: 'F', home: 'Netherlands', away: 'Japan',        date: '2026-06-14' },
  { id: 'M32', group: 'F', home: 'Sweden',      away: 'Tunisia',      date: '2026-06-14' },
  { id: 'M33', group: 'F', home: 'Netherlands', away: 'Sweden',       date: '2026-06-20' },
  { id: 'M34', group: 'F', home: 'Tunisia',     away: 'Japan',        date: '2026-06-20' },
  { id: 'M35', group: 'F', home: 'Japan',       away: 'Sweden',       date: '2026-06-25' },
  { id: 'M36', group: 'F', home: 'Tunisia',     away: 'Netherlands',  date: '2026-06-25' },

  // Group G
  { id: 'M37', group: 'G', home: 'Belgium',     away: 'Egypt',        date: '2026-06-15' },
  { id: 'M38', group: 'G', home: 'Iran',        away: 'New Zealand',  date: '2026-06-15' },
  { id: 'M39', group: 'G', home: 'Belgium',     away: 'Iran',         date: '2026-06-21' },
  { id: 'M40', group: 'G', home: 'New Zealand', away: 'Egypt',        date: '2026-06-21' },
  { id: 'M41', group: 'G', home: 'Egypt',       away: 'Iran',         date: '2026-06-26' },
  { id: 'M42', group: 'G', home: 'New Zealand', away: 'Belgium',      date: '2026-06-26' },

  // Group H
  { id: 'M43', group: 'H', home: 'Spain',        away: 'Cape Verde',   date: '2026-06-15' },
  { id: 'M44', group: 'H', home: 'Saudi Arabia', away: 'Uruguay',      date: '2026-06-15' },
  { id: 'M45', group: 'H', home: 'Spain',        away: 'Saudi Arabia', date: '2026-06-21' },
  { id: 'M46', group: 'H', home: 'Uruguay',      away: 'Cape Verde',   date: '2026-06-21' },
  { id: 'M47', group: 'H', home: 'Cape Verde',   away: 'Saudi Arabia', date: '2026-06-26' },
  { id: 'M48', group: 'H', home: 'Uruguay',      away: 'Spain',        date: '2026-06-26' },

  // Group I
  { id: 'M49', group: 'I', home: 'France',   away: 'Senegal', date: '2026-06-16' },
  { id: 'M50', group: 'I', home: 'Iraq',     away: 'Norway',  date: '2026-06-16' },
  { id: 'M51', group: 'I', home: 'France',   away: 'Iraq',    date: '2026-06-22' },
  { id: 'M52', group: 'I', home: 'Norway',   away: 'Senegal', date: '2026-06-22' },
  { id: 'M53', group: 'I', home: 'Norway',   away: 'France',  date: '2026-06-26' },
  { id: 'M54', group: 'I', home: 'Senegal',  away: 'Iraq',    date: '2026-06-26' },

  // Group J
  { id: 'M55', group: 'J', home: 'Argentina', away: 'Algeria',  date: '2026-06-16' },
  { id: 'M56', group: 'J', home: 'Austria',   away: 'Jordan',   date: '2026-06-16' },
  { id: 'M57', group: 'J', home: 'Argentina', away: 'Austria',  date: '2026-06-22' },
  { id: 'M58', group: 'J', home: 'Jordan',    away: 'Algeria',  date: '2026-06-22' },
  { id: 'M59', group: 'J', home: 'Algeria',   away: 'Austria',  date: '2026-06-27' },
  { id: 'M60', group: 'J', home: 'Jordan',    away: 'Argentina', date: '2026-06-27' },

  // Group K
  { id: 'M61', group: 'K', home: 'Portugal',   away: 'DR Congo',    date: '2026-06-17' },
  { id: 'M62', group: 'K', home: 'Uzbekistan', away: 'Colombia',    date: '2026-06-17' },
  { id: 'M63', group: 'K', home: 'Portugal',   away: 'Uzbekistan',  date: '2026-06-23' },
  { id: 'M64', group: 'K', home: 'Colombia',   away: 'DR Congo',    date: '2026-06-23' },
  { id: 'M65', group: 'K', home: 'Colombia',   away: 'Portugal',    date: '2026-06-27' },
  { id: 'M66', group: 'K', home: 'DR Congo',   away: 'Uzbekistan',  date: '2026-06-27' },

  // Group L
  { id: 'M67', group: 'L', home: 'England',  away: 'Croatia', date: '2026-06-17' },
  { id: 'M68', group: 'L', home: 'Ghana',    away: 'Panama',  date: '2026-06-17' },
  { id: 'M69', group: 'L', home: 'England',  away: 'Ghana',   date: '2026-06-23' },
  { id: 'M70', group: 'L', home: 'Panama',   away: 'Croatia', date: '2026-06-23' },
  { id: 'M71', group: 'L', home: 'Panama',   away: 'England', date: '2026-06-27' },
  { id: 'M72', group: 'L', home: 'Croatia',  away: 'Ghana',   date: '2026-06-27' },
];

// Knockout stage: TBD teams filled in once group stage ends
// IDs: R01-R16 (Round of 32), S01-S08 (R16), Q01-Q04 (QF), SF1-SF2, TP (3rd place), FN (Final)
const KNOCKOUT_MATCHES = [
  { id: 'R01', round: 'R32', home: null, away: null, date: '2026-06-29' },
  { id: 'R02', round: 'R32', home: null, away: null, date: '2026-06-29' },
  { id: 'R03', round: 'R32', home: null, away: null, date: '2026-06-30' },
  { id: 'R04', round: 'R32', home: null, away: null, date: '2026-06-30' },
  { id: 'R05', round: 'R32', home: null, away: null, date: '2026-07-01' },
  { id: 'R06', round: 'R32', home: null, away: null, date: '2026-07-01' },
  { id: 'R07', round: 'R32', home: null, away: null, date: '2026-07-02' },
  { id: 'R08', round: 'R32', home: null, away: null, date: '2026-07-02' },
  { id: 'R09', round: 'R32', home: null, away: null, date: '2026-07-03' },
  { id: 'R10', round: 'R32', home: null, away: null, date: '2026-07-03' },
  { id: 'R11', round: 'R32', home: null, away: null, date: '2026-07-04' },
  { id: 'R12', round: 'R32', home: null, away: null, date: '2026-07-04' },
  { id: 'R13', round: 'R32', home: null, away: null, date: '2026-07-05' },
  { id: 'R14', round: 'R32', home: null, away: null, date: '2026-07-05' },
  { id: 'R15', round: 'R32', home: null, away: null, date: '2026-07-06' },
  { id: 'R16', round: 'R32', home: null, away: null, date: '2026-07-06' },

  { id: 'S01', round: 'R16', home: null, away: null, date: '2026-07-09' },
  { id: 'S02', round: 'R16', home: null, away: null, date: '2026-07-09' },
  { id: 'S03', round: 'R16', home: null, away: null, date: '2026-07-10' },
  { id: 'S04', round: 'R16', home: null, away: null, date: '2026-07-10' },
  { id: 'S05', round: 'R16', home: null, away: null, date: '2026-07-11' },
  { id: 'S06', round: 'R16', home: null, away: null, date: '2026-07-11' },
  { id: 'S07', round: 'R16', home: null, away: null, date: '2026-07-12' },
  { id: 'S08', round: 'R16', home: null, away: null, date: '2026-07-12' },

  { id: 'Q01', round: 'QF', home: null, away: null, date: '2026-07-15' },
  { id: 'Q02', round: 'QF', home: null, away: null, date: '2026-07-15' },
  { id: 'Q03', round: 'QF', home: null, away: null, date: '2026-07-16' },
  { id: 'Q04', round: 'QF', home: null, away: null, date: '2026-07-16' },

  { id: 'SF1', round: 'SF', home: null, away: null, date: '2026-07-19' },
  { id: 'SF2', round: 'SF', home: null, away: null, date: '2026-07-20' },

  { id: 'TP',  round: '3RD', home: null, away: null, date: '2026-07-25' },
  { id: 'FN',  round: 'FN',  home: null, away: null, date: '2026-07-26' },
];

const ALL_MATCHES = [...GROUP_MATCHES, ...KNOCKOUT_MATCHES];

const ROUND_LABELS = {
  group: 'Fase de Grupos',
  R32:   'Dieciseisavos de Final',
  R16:   'Octavos de Final',
  QF:    'Cuartos de Final',
  SF:    'Semifinal',
  '3RD': 'Tercer y Cuarto Puesto',
  FN:    'Final',
};

// Points: [correct 1X2 / correct winner, exact score]
const SCORING = {
  group: [1, 3],
  R32:   [2, 5],
  R16:   [3, 7],
  QF:    [4, 9],
  SF:    [5, 11],
  '3RD': [2, 5],
  FN:    [6, 14],
};
