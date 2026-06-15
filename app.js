/* 2026 World Cup predictor — all state lives in localStorage. */

const STORAGE_KEY = "wc2026-predictions-v1";

// state = { groups: { "GA-1": "home"|"draw"|"away", ... },
//           ko: { 73: "home"|"away", ... } }
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { groups: parsed.groups || {}, ko: parsed.ko || {} };
    }
  } catch (e) { /* ignore corrupt storage */ }
  return { groups: {}, ko: {} };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const flag = name => FLAGS[name] || "🏳️";

/* ---------- Group standings ---------- */

// Returns standings array per group sorted best-first.
function computeGroup(letter) {
  const teams = GROUPS[letter];
  const table = {};
  teams.forEach((t, i) => {
    table[t] = { team: t, seed: i, P: 0, W: 0, D: 0, L: 0, Pts: 0, hh: {} };
  });

  const fixtures = GROUP_FIXTURES.filter(f => f.group === letter);
  fixtures.forEach(f => {
    const pick = state.groups[f.id];
    if (!pick) return;
    const H = table[f.home], A = table[f.away];
    H.P++; A.P++;
    if (pick === "home") {
      H.W++; H.Pts += 3; A.L++;
      H.hh[f.away] = 3;
    } else if (pick === "away") {
      A.W++; A.Pts += 3; H.L++;
      A.hh[f.home] = 3;
    } else {
      H.D++; A.D++; H.Pts += 1; A.Pts += 1;
      H.hh[f.away] = 1; A.hh[f.home] = 1;
    }
  });

  const rows = Object.values(table);
  rows.sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    // head-to-head points among the tied pair (only meaningful for 2-way ties)
    const aH = a.hh[b.team] || 0, bH = b.hh[a.team] || 0;
    if (bH !== aH) return bH - aH;
    if (b.W !== a.W) return b.W - a.W;       // more wins
    return a.seed - b.seed;                  // fall back to draw seeding
  });
  return rows;
}

// Are all 6 matches of a group predicted?
function groupComplete(letter) {
  return GROUP_FIXTURES.filter(f => f.group === letter)
    .every(f => state.groups[f.id]);
}

function allGroupsComplete() {
  return GROUP_LETTERS.every(groupComplete);
}

/* ---------- Qualifiers & third-place ranking ---------- */

// Returns { win:{A:team,...}, run:{...}, thirds:[team,...8 ordered] } or null
// if the group stage is not fully predicted.
function computeQualifiers() {
  if (!allGroupsComplete()) return null;

  const win = {}, run = {}, thirdRows = [];
  GROUP_LETTERS.forEach(letter => {
    const rows = computeGroup(letter);
    win[letter] = rows[0].team;
    run[letter] = rows[1].team;
    thirdRows.push({ ...rows[2], group: letter });
  });

  // Rank the 12 third-placed teams; best 8 advance.
  thirdRows.sort((a, b) => {
    if (b.Pts !== a.Pts) return b.Pts - a.Pts;
    if (b.W !== a.W) return b.W - a.W;
    return a.group.localeCompare(b.group);
  });
  const thirds = thirdRows.slice(0, 8).map(r => r.team);
  return { win, run, thirds };
}

/* ---------- Resolve the knockout bracket ---------- */

// Build a map matchId -> { home, away } resolved team names (or null) and
// the winner/loser based on the user's picks.
function resolveBracket() {
  const q = computeQualifiers();
  const res = {}; // id -> { home, away, winner, loser }

  function teamFromSlot(slot) {
    if (!q) return null;
    switch (slot.type) {
      case "win": return q.win[slot.group];
      case "run": return q.run[slot.group];
      case "third":
        // Thirds are seeded into the 8 third-slots in ranked order.
        return q.thirds[slot.slot] || null;
      case "winner": {
        const m = res[slot.match];
        return m ? m.winner : null;
      }
      case "loser": {
        const m = res[slot.match];
        return m ? m.loser : null;
      }
    }
    return null;
  }

  KO_MATCHES.forEach(m => {
    const home = teamFromSlot(m.home);
    const away = teamFromSlot(m.away);
    let winner = null, loser = null;
    const pick = state.ko[m.id];
    if (pick === "home" && home) { winner = home; loser = away; }
    else if (pick === "away" && away) { winner = away; loser = home; }
    res[m.id] = { home, away, winner, loser };
  });

  return res;
}

/* ---------- Progress ---------- */

function countPredictions() {
  const g = Object.keys(state.groups).filter(k => state.groups[k]).length;
  const k = Object.keys(state.ko).filter(k => state.ko[k]).length;
  return { g, k, total: g + k };
}

function updateProgress() {
  const { total } = countPredictions();
  const pct = Math.round((total / TOTAL_MATCHES) * 100);
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent =
    `${total} / ${TOTAL_MATCHES} matches predicted`;
}

/* ---------- Rendering: Group stage ---------- */

function slotLabel(slot) {
  switch (slot.type) {
    case "win": return "Winner " + slot.group;
    case "run": return "Runner-up " + slot.group;
    case "third": return "3rd place #" + (slot.slot + 1);
    case "winner": return "Winner M" + slot.match;
    case "loser": return "Loser M" + slot.match;
  }
  return "?";
}

function teamChip(name) {
  if (!name) return `<span class="team placeholder">TBD</span>`;
  return `<span class="team"><span class="fl">${flag(name)}</span>${name}</span>`;
}

function renderGroups() {
  const container = document.getElementById("groups");
  container.innerHTML = "";

  GROUP_LETTERS.forEach(letter => {
    const rows = computeGroup(letter);
    const fixtures = GROUP_FIXTURES.filter(f => f.group === letter);
    const done = groupComplete(letter);

    const card = document.createElement("div");
    card.className = "group-card";

    // header + standings
    let html = `<div class="group-head">
      <h3>Group ${letter}</h3>
      ${done ? '<span class="badge done">✓ complete</span>' : ''}
    </div>
    <table class="standings">
      <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
      <tbody>`;
    rows.forEach((r, i) => {
      const cls = i < 2 ? "adv" : (i === 2 ? "third" : "");
      html += `<tr class="${cls}">
        <td>${i + 1}</td>
        <td class="tcell">${flag(r.team)} ${r.team}</td>
        <td>${r.P}</td><td>${r.W}</td><td>${r.D}</td><td>${r.L}</td><td><b>${r.Pts}</b></td>
      </tr>`;
    });
    html += `</tbody></table><div class="fixtures">`;

    let lastMd = 0;
    fixtures.forEach(f => {
      if (f.matchday !== lastMd) {
        html += `<div class="md-label">Matchday ${f.matchday}</div>`;
        lastMd = f.matchday;
      }
      const pick = state.groups[f.id];
      html += `<div class="fixture">
        <button class="pick side ${pick === 'home' ? 'sel' : ''}" data-g="${f.id}" data-v="home">
          <span class="fl">${flag(f.home)}</span><span class="nm">${f.home}</span>
        </button>
        <button class="pick draw ${pick === 'draw' ? 'sel' : ''}" data-g="${f.id}" data-v="draw">X</button>
        <button class="pick side away ${pick === 'away' ? 'sel' : ''}" data-g="${f.id}" data-v="away">
          <span class="nm">${f.away}</span><span class="fl">${flag(f.away)}</span>
        </button>
      </div>`;
    });

    html += `</div>`;
    card.innerHTML = html;
    container.appendChild(card);
  });

  // wire up clicks
  container.querySelectorAll("button.pick").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.g, v = btn.dataset.v;
      state.groups[id] = (state.groups[id] === v) ? undefined : v;
      if (!state.groups[id]) delete state.groups[id];
      saveState();
      renderGroups();
      renderKnockout();
      updateProgress();
    });
  });
}

/* ---------- Rendering: Knockout ---------- */

function renderKnockout() {
  const container = document.getElementById("bracket");
  const res = resolveBracket();
  const ready = computeQualifiers() !== null;

  const notice = document.getElementById("ko-notice");
  notice.style.display = ready ? "none" : "block";

  const rounds = ["R32", "R16", "QF", "SF", "FINAL", "3RD"];
  container.innerHTML = "";

  rounds.forEach(round => {
    const col = document.createElement("div");
    col.className = "round-col round-" + round;
    col.innerHTML = `<h3 class="round-title">${ROUND_NAMES[round]}</h3>`;

    KO_MATCHES.filter(m => m.round === round).forEach(m => {
      const r = res[m.id];
      const homeName = r.home, awayName = r.away;
      const pick = state.ko[m.id];

      const tie = document.createElement("div");
      tie.className = "tie";
      tie.innerHTML = `
        <div class="mno">M${m.id}</div>
        <button class="ko-team ${pick === 'home' ? 'win' : (pick === 'away' ? 'lose' : '')} ${homeName ? '' : 'disabled'}"
          data-m="${m.id}" data-v="home">
          ${homeName ? `<span class="fl">${flag(homeName)}</span><span class="nm">${homeName}</span>`
                     : `<span class="nm tbd">${slotLabel(m.home)}</span>`}
        </button>
        <button class="ko-team ${pick === 'away' ? 'win' : (pick === 'home' ? 'lose' : '')} ${awayName ? '' : 'disabled'}"
          data-m="${m.id}" data-v="away">
          ${awayName ? `<span class="fl">${flag(awayName)}</span><span class="nm">${awayName}</span>`
                     : `<span class="nm tbd">${slotLabel(m.away)}</span>`}
        </button>`;
      col.appendChild(tie);
    });
    container.appendChild(col);
  });

  // champion banner
  const champ = res[104] ? res[104].winner : null;
  const banner = document.getElementById("champion");
  if (champ) {
    banner.style.display = "block";
    banner.innerHTML = `🏆 Your champion: <span class="fl">${flag(champ)}</span> <b>${champ}</b>`;
  } else {
    banner.style.display = "none";
  }

  container.querySelectorAll("button.ko-team").forEach(btn => {
    if (btn.classList.contains("disabled")) return;
    btn.addEventListener("click", () => {
      const id = btn.dataset.m, v = btn.dataset.v;
      state.ko[id] = (state.ko[id] === v) ? undefined : v;
      if (!state.ko[id]) delete state.ko[id];
      saveState();
      renderKnockout();
      updateProgress();
    });
  });
}

/* ---------- Tabs ---------- */

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.view).classList.add("active");
    });
  });
}

/* ---------- Reset ---------- */

function setupReset() {
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Clear all 104 predictions? This cannot be undone.")) {
      state = { groups: {}, ko: {} };
      saveState();
      renderGroups();
      renderKnockout();
      updateProgress();
    }
  });
}

/* ---------- Init ---------- */

setupTabs();
setupReset();
renderGroups();
renderKnockout();
updateProgress();
