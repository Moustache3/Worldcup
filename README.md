# 🏆 World Cup 2026 Predictor

A single-page website to predict **all 104 matches** of the 2026 FIFA World Cup —
from the group stage to the final. Win / Draw / Lose only, no scores.

## Features

- **Group stage (72 matches):** for every fixture, tap a team to predict a win or
  **X** for a draw. Standings update live (3 pts for a win, 1 for a draw).
- **Live qualification:** the top 2 of each group plus the 8 best third-placed
  teams are highlighted and automatically advance.
- **Knockout bracket (32 matches):** the Round of 32 → Final bracket fills itself
  from your group results. Knockouts have no draws — tap the team you think advances,
  and winners flow through each round up to your predicted champion.
- **Auto-save:** every pick is stored in your browser (`localStorage`). Close the
  tab and come back — your bracket is still there. A **Reset all** button clears it.
- **No build step, no server, no account.** Just static HTML/CSS/JS.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and the two tabs (Group Stage / Knockout) |
| `styles.css` | Styling |
| `data.js` | Teams, groups, the 72 group fixtures and the 73–104 knockout bracket |
| `app.js` | Standings, qualification, bracket resolution, rendering, persistence |

## Notes on the data

- Groups A–L reflect the **Final Draw of 5 December 2025** as reported by FIFA/ESPN.
  If anything differs, just edit the `GROUPS` object in `data.js` — fixtures,
  standings and the bracket all regenerate from it.
- Because predictions are Win/Draw/Lose only (no scores), group ties are broken by
  head-to-head result, then number of wins, then draw seeding. The 8 best
  third-placed teams are ranked by points, then wins.
- The bracket flow (R32 → R16 → QF → SF → 3rd place → Final, matches 73–104)
  follows the official FIFA pairings. Third-placed teams are seeded into their
  slots in ranked order; FIFA's exact same-group-avoidance combination table is
  not modelled, so an occasional same-group Round-of-32 pairing is possible.
