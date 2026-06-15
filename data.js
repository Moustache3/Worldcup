/*
 * 2026 FIFA World Cup data: teams, groups, group-stage fixtures and the
 * knockout bracket structure (matches 73-104).
 *
 * Groups reflect the Final Draw (5 Dec 2025) as reported by FIFA / ESPN.
 * If the official line-up differs, just edit the GROUPS object below — the
 * rest of the site (fixtures, standings, bracket) is generated from it.
 */

// Flag emoji for every participating nation.
const FLAGS = {
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czechia": "🇨🇿",
  "Canada": "🇨🇦", "Bosnia & Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "United States": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
  "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Tunisia": "🇹🇳", "Sweden": "🇸🇪",
  "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Iran": "🇮🇷", "New Zealand": "🇳🇿",
  "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
  "France": "🇫🇷", "Senegal": "🇸🇳", "Norway": "🇳🇴", "Iraq": "🇮🇶",
  "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹", "Jordan": "🇯🇴",
  "Portugal": "🇵🇹", "Colombia": "🇨🇴", "Uzbekistan": "🇺🇿", "DR Congo": "🇨🇩",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦"
};

// 12 groups of 4. Order in each array is the draw seeding (used as final tiebreak).
const GROUPS = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Tunisia", "Sweden"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Norway", "Iraq"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "Colombia", "Uzbekistan", "DR Congo"],
  L: ["England", "Croatia", "Ghana", "Panama"]
};

const GROUP_LETTERS = Object.keys(GROUPS);

// Round-robin matchday order for a 4-team group (indices into the group array).
const RR_ORDER = [
  [0, 1], [2, 3],   // Matchday 1
  [0, 2], [3, 1],   // Matchday 2
  [3, 0], [1, 2]    // Matchday 3
];

// Build the 72 group-stage fixtures. Each gets a stable id like "GA-3".
const GROUP_FIXTURES = [];
GROUP_LETTERS.forEach(letter => {
  const teams = GROUPS[letter];
  RR_ORDER.forEach((pair, i) => {
    GROUP_FIXTURES.push({
      id: `G${letter}-${i + 1}`,
      group: letter,
      matchday: Math.floor(i / 2) + 1,
      home: teams[pair[0]],
      away: teams[pair[1]]
    });
  });
});

/*
 * Knockout bracket (matches 73-104).
 *
 * Each slot is one of:
 *   { type: "win",    group: "A" }   -> winner of Group A      (1A)
 *   { type: "run",    group: "A" }   -> runner-up of Group A   (2A)
 *   { type: "third",  slot: 0 }      -> Nth best 3rd-placed team
 *   { type: "winner", match: 73 }    -> winner of match 73
 *   { type: "loser",  match: 101 }   -> loser of match 101 (3rd-place game)
 *
 * Winner/runner-up slots follow the official FIFA pairings; the 8 best
 * third-placed teams fill the "third" slots in ranked order. Match flow
 * for rounds 16/QF/SF/Final is reconstructed from the FIFA schedule.
 */
const KO_MATCHES = [
  // Round of 32 (73-88)
  { id: 73, round: "R32", home: { type: "run", group: "A" }, away: { type: "run", group: "B" } },
  { id: 74, round: "R32", home: { type: "win", group: "E" }, away: { type: "third", slot: 0 } },
  { id: 75, round: "R32", home: { type: "win", group: "F" }, away: { type: "run", group: "C" } },
  { id: 76, round: "R32", home: { type: "win", group: "C" }, away: { type: "run", group: "F" } },
  { id: 77, round: "R32", home: { type: "win", group: "I" }, away: { type: "third", slot: 1 } },
  { id: 78, round: "R32", home: { type: "run", group: "E" }, away: { type: "run", group: "I" } },
  { id: 79, round: "R32", home: { type: "win", group: "A" }, away: { type: "third", slot: 2 } },
  { id: 80, round: "R32", home: { type: "win", group: "L" }, away: { type: "third", slot: 3 } },
  { id: 81, round: "R32", home: { type: "win", group: "G" }, away: { type: "third", slot: 4 } },
  { id: 82, round: "R32", home: { type: "run", group: "K" }, away: { type: "run", group: "L" } },
  { id: 83, round: "R32", home: { type: "win", group: "J" }, away: { type: "third", slot: 5 } },
  { id: 84, round: "R32", home: { type: "win", group: "B" }, away: { type: "third", slot: 6 } },
  { id: 85, round: "R32", home: { type: "win", group: "K" }, away: { type: "third", slot: 7 } },
  { id: 86, round: "R32", home: { type: "win", group: "D" }, away: { type: "run", group: "G" } },
  { id: 87, round: "R32", home: { type: "win", group: "H" }, away: { type: "run", group: "J" } },
  { id: 88, round: "R32", home: { type: "run", group: "D" }, away: { type: "run", group: "H" } },

  // Round of 16 (89-96)
  { id: 89, round: "R16", home: { type: "winner", match: 74 }, away: { type: "winner", match: 77 } },
  { id: 90, round: "R16", home: { type: "winner", match: 85 }, away: { type: "winner", match: 87 } },
  { id: 91, round: "R16", home: { type: "winner", match: 81 }, away: { type: "winner", match: 82 } },
  { id: 92, round: "R16", home: { type: "winner", match: 76 }, away: { type: "winner", match: 78 } },
  { id: 93, round: "R16", home: { type: "winner", match: 73 }, away: { type: "winner", match: 75 } },
  { id: 94, round: "R16", home: { type: "winner", match: 83 }, away: { type: "winner", match: 84 } },
  { id: 95, round: "R16", home: { type: "winner", match: 79 }, away: { type: "winner", match: 80 } },
  { id: 96, round: "R16", home: { type: "winner", match: 86 }, away: { type: "winner", match: 88 } },

  // Quarter-finals (97-100)
  { id: 97, round: "QF", home: { type: "winner", match: 89 }, away: { type: "winner", match: 90 } },
  { id: 98, round: "QF", home: { type: "winner", match: 91 }, away: { type: "winner", match: 92 } },
  { id: 99, round: "QF", home: { type: "winner", match: 93 }, away: { type: "winner", match: 94 } },
  { id: 100, round: "QF", home: { type: "winner", match: 95 }, away: { type: "winner", match: 96 } },

  // Semi-finals (101-102)
  { id: 101, round: "SF", home: { type: "winner", match: 97 }, away: { type: "winner", match: 98 } },
  { id: 102, round: "SF", home: { type: "winner", match: 99 }, away: { type: "winner", match: 100 } },

  // Third-place play-off (103) and Final (104)
  { id: 103, round: "3RD", home: { type: "loser", match: 101 }, away: { type: "loser", match: 102 } },
  { id: 104, round: "FINAL", home: { type: "winner", match: 101 }, away: { type: "winner", match: 102 } }
];

const ROUND_NAMES = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  "3RD": "Third-place play-off",
  FINAL: "Final"
};

// Order in which third-place teams are slotted into the bracket.
const THIRD_SLOT_MATCHES = [74, 77, 79, 80, 81, 83, 84, 85];

const TOTAL_MATCHES = GROUP_FIXTURES.length + KO_MATCHES.length; // 72 + 32 = 104
