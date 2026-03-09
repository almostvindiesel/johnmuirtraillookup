const DEFAULT_DATE  = "2026-06-28";
const DEFAULT_GROUP = 1;
const SHOW_IDS_NOBO = ["JM35"];

function log(msg) { console.log("[JMT-NOBO]", msg); }

function setReactVal(el, value) {
  const proto = el.tagName === "SELECT" ? HTMLSelectElement : HTMLInputElement;
  const desc = Object.getOwnPropertyDescriptor(proto.prototype, "value");
  if (desc && desc.set) desc.set.call(el, value);
  ["input","change","blur"].forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
}

function waitFor(condition, cb, failMsg, maxTries) {
  let tries = 0;
  maxTries = maxTries || 40;
  function tick() {
    tries++;
    const result = condition();
    if (result) return cb(result);
    if (tries >= maxTries) { log("waitFor timeout: " + failMsg); return; }
    setTimeout(tick, 50);
  }
  tick();
}

function fillDate(dateISO, statusEl, onDone) {
  const [targetYear, targetMonth, targetDay] = dateISO.split("-").map(Number);
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const monthName = MONTHS[targetMonth - 1];

  const toggle = document.querySelector('button[aria-label="Calendar"].toggle-calendar-button') ||
                 [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Calendar');
  if (!toggle) { statusEl.textContent = "⚠️ Calendar button not found."; return; }
  toggle.click();

  waitFor(
    () => document.querySelector('button[aria-label="Next"].next-prev-button'),
    () => navigateMonths(targetYear, targetMonth, targetDay, monthName, MONTHS, statusEl, onDone),
    "calendar open"
  );
}

function getCalendarMonthYear(MONTHS) {
  const h2 = document.querySelector('.calendar-header-group h2');
  if (!h2) return null;
  const text = h2.textContent || "";
  const mIdx = MONTHS.findIndex(m => text.includes(m));
  const yMatch = text.match(/\d{4}/);
  if (mIdx !== -1 && yMatch) return { month: mIdx + 1, year: parseInt(yMatch[0]) };
  return null;
}

function navigateMonths(targetYear, targetMonth, targetDay, monthName, MONTHS, statusEl, onDone) {
  const cur = getCalendarMonthYear(MONTHS);
  if (!cur) return setTimeout(() => navigateMonths(targetYear, targetMonth, targetDay, monthName, MONTHS, statusEl, onDone), 50);
  const diff = (targetYear - cur.year) * 12 + (targetMonth - cur.month);
  log("navigateMonths: diff=" + diff);
  if (diff === 0) { clickDay(targetDay, monthName, targetYear, statusEl, onDone); return; }
  const btnLabel = diff > 0 ? "Next" : "Previous";
  const btn = document.querySelector('button[aria-label="' + btnLabel + '"].next-prev-button');
  if (!btn || btn.disabled) { statusEl.textContent = "⚠️ Nav button unavailable."; return; }
  btn.click();
  const prevMonth = cur.month;
  waitFor(
    () => { const c = getCalendarMonthYear(MONTHS); return c && c.month !== prevMonth ? c : null; },
    () => navigateMonths(targetYear, targetMonth, targetDay, monthName, MONTHS, statusEl, onDone),
    "month change"
  );
}

function clickDay(targetDay, monthName, targetYear, statusEl, onDone) {
  waitFor(
    () => {
      const all = [...document.querySelectorAll('[role="button"]')];
      return all.find(el => {
        const label = el.getAttribute('aria-label') || '';
        return label.includes(monthName) &&
               label.includes(String(targetDay) + ',') &&
               label.includes(String(targetYear)) &&
               !el.getAttribute('aria-disabled');
      });
    },
    (cell) => {
      log("clickDay: clicking " + cell.getAttribute('aria-label'));
      cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      cell.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
      cell.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
      if (cell.click) cell.click();
      onDone();
    },
    "find day cell"
  );
}

function fillGroup(groupSize, statusEl, onDone) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  const trigger = document.getElementById("guest-counter") ||
    [...document.querySelectorAll("button")].find(b => (b.innerText||"").includes("Group Members"));
  if (!trigger) { statusEl.textContent = "⚠️ Guest counter not found."; return; }
  trigger.click();
  waitFor(
    () => document.getElementById("guest-counter-number-field-People"),
    (input) => {
      const popup = document.getElementById("guest-counter-popup");
      const allBtns = popup ? [...popup.querySelectorAll("button")] : [];
      const addBtn    = allBtns.find(b => /add/i.test(b.getAttribute("aria-label")||""));
      const removeBtn = allBtns.find(b => /remove/i.test(b.getAttribute("aria-label")||""));
      const closeBtn  = allBtns.find(b => /close/i.test((b.innerText||b.getAttribute("aria-label")||"")));
      function step() {
        const cur = parseInt(input.value) || 0;
        if (cur === groupSize) { if (closeBtn) closeBtn.click(); onDone(); return; }
        if (cur < groupSize && addBtn)         { addBtn.click();    setTimeout(step, 150); }
        else if (cur > groupSize && removeBtn) { removeBtn.click(); setTimeout(step, 150); }
        else { setReactVal(input, String(groupSize)); setTimeout(step, 150); }
      }
      step();
    },
    "guest counter input"
  );
}

function doFill(dateISO, groupSize, statusEl) {
  statusEl.style.color = "#b8b09c";
  statusEl.textContent = "⏳ Filling…";
  log("doFill: date=" + dateISO + " group=" + groupSize);
  fillDate(dateISO, statusEl, () => {
    statusEl.textContent = "📅 Date set!";
    fillGroup(groupSize, statusEl, () => {
      statusEl.textContent = "✅ " + dateISO + " · " + groupSize + " person(s)";
      statusEl.style.color = "#7fc47a";
      log("doFill: complete");
      setTimeout(filterTableNobo, 500);
      setTimeout(filterTableNobo, 1500);
      setTimeout(filterTableNobo, 3000);
    });
  });
}

// ── Table filter ──────────────────────────────────────────────────────────
function filterTableNobo() {
  const rows = [...document.querySelectorAll('[role="row"]')];
  let hidden = 0, shown = 0;
  rows.forEach(row => {
    const cells = row.querySelectorAll('[role="gridcell"]');
    if (!cells.length) return; // header — skip
    const idText = (cells[0].textContent || "").trim();
    if (SHOW_IDS_NOBO.includes(idText)) {
      row.style.removeProperty("display");
      shown++;
    } else {
      row.style.display = "none";
      hidden++;
    }
  });
  if (hidden + shown > 0) log("filterTable: shown=" + shown + " hidden=" + hidden);
}

function initFilterNobo() {
  waitFor(
    () => {
      const rows = [...document.querySelectorAll('[role="row"]')];
      return rows.filter(r => r.querySelectorAll('[role="gridcell"]').length > 0).length > 0;
    },
    () => {
      filterTableNobo();
      new MutationObserver(() => filterTableNobo()).observe(document.body, { childList: true, subtree: true });
    },
    "grid rows",
    300
  );
}

// ── UI ────────────────────────────────────────────────────────────────────
function injectUINobo() {
  if (document.getElementById("jmt-autofill-panel")) return;
  log("injectUI: injecting");

  const style = document.createElement("style");
  style.textContent = `
    #jmt-autofill-panel {
      position:fixed; top:80px; right:20px; width:224px;
      background:#1a2e1a; border:1px solid #4a6741; border-radius:6px;
      font-family:monospace; font-size:12px; color:#ede8dc;
      z-index:999999; box-shadow:0 4px 24px rgba(0,0,0,.6); overflow:hidden;
    }
    #jmt-hdr { background:#3d5c35; padding:8px 12px; font-weight:700; font-size:13px; cursor:move; user-select:none; }
    #jmt-body { padding:12px; display:flex; flex-direction:column; gap:4px; }
    .jmt-lbl { font-size:10px; text-transform:uppercase; color:#6a9460; letter-spacing:.1em; }
    #jmt-date, #jmt-group {
      background:#0f1a0f; border:1px solid #3d5c35; color:#ede8dc;
      font-family:inherit; font-size:12px; padding:5px 8px; border-radius:3px; width:100%;
    }
    #jmt-btn {
      margin-top:8px; padding:8px; background:#3d5c35; border:none; border-radius:3px;
      color:#ede8dc; font-family:inherit; font-size:12px; font-weight:700; cursor:pointer;
    }
    #jmt-btn:hover { background:#6a9460; }
    #jmt-status { margin-top:6px; font-size:10px; color:#b8b09c; line-height:1.5; min-height:28px; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "jmt-autofill-panel";
  panel.innerHTML = `
    <div id="jmt-hdr">⛰️ JMT Autofill (NOBO)</div>
    <div id="jmt-body">
      <label class="jmt-lbl">Entry Date</label>
      <input id="jmt-date" type="date" value="2026-06-28">
      <label class="jmt-lbl" style="margin-top:6px">Group Members</label>
      <input id="jmt-group" type="number" min="1" max="8" value="1">
      <button id="jmt-btn">▶ Autofill Now</button>
      <div id="jmt-status">Ready</div>
    </div>
  `;
  document.body.appendChild(panel);

  const dateInput  = document.getElementById("jmt-date");
  const groupInput = document.getElementById("jmt-group");
  dateInput.value  = localStorage.getItem("jmt-date")  || "2026-06-28";
  groupInput.value = localStorage.getItem("jmt-group") || "1";
  dateInput.addEventListener("change",  () => localStorage.setItem("jmt-date",  dateInput.value));
  groupInput.addEventListener("change", () => localStorage.setItem("jmt-group", groupInput.value));

  document.getElementById("jmt-btn").addEventListener("click", () => {
    const d = document.getElementById("jmt-date").value;
    const g = parseInt(document.getElementById("jmt-group").value) || 1;
    log("clicked: date=" + d + " group=" + g);
    doFill(d, g, document.getElementById("jmt-status"));
  });

  const hdr = document.getElementById("jmt-hdr");
  let ox, oy, mx, my;
  hdr.addEventListener("mousedown", e => {
    e.preventDefault(); mx = e.clientX; my = e.clientY;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopdrag);
  });
  function drag(e) {
    ox = mx-e.clientX; oy = my-e.clientY; mx = e.clientX; my = e.clientY;
    panel.style.top  = (panel.offsetTop -oy)+"px";
    panel.style.left = (panel.offsetLeft-ox)+"px";
    panel.style.right = "auto";
  }
  function stopdrag() {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopdrag);
  }

  initFilterNobo();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectUINobo);
} else {
  injectUINobo();
}
new MutationObserver(() => {
  if (!document.getElementById("jmt-autofill-panel")) injectUINobo();
}).observe(document.body, { childList: true, subtree: false });
