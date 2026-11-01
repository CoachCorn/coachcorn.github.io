/**
 * Mental Reps: backend for the quiz page. One file. Paste over everything in Code.gs.
 *
 * FIRST TIME: pick setupSheet in the function dropdown, click Run, approve the permissions.
 * It builds Settings, Roster, Log and three sample deck tabs you can overwrite.
 * Then Deploy > New deployment > Web app: Execute as Me, Who has access: Anyone. Copy the Web app URL.
 *
 * Tabs
 *   Settings  app name, team name, positions, coach code, mastery rule
 *   Every other tab is a DECK. The tab name is the deck name, and tab order is deck order.
 *             One row per card. ID is filled in for you; never type it.
 *             Hide a tab (or start its name with _) to take that deck off the players' screens.
 *             Mental Reps > New deck tab makes a ready-to-fill one.
 *   Roster    player names and positions (players can also add themselves)
 *   Log       every answer, written by the app (do not edit)
 *   Mastery, Most Missed   built by "Mental Reps > Refresh dashboard"
 */
var SAMPLE = {"settings": {"App name": "Mental Reps", "Team name": "Sample Team", "Positions": "QB, RB, WR, TE, OL", "Rename positions": "", "Coach code": "CHANGE-ME", "Mastery streak": 3, "Mastery days": 2, "Page URL": ""}, "roster": [["Sample Quarterback", "QB"], ["Sample Back", "RB"], ["Sample Receiver", "WR"], ["Sample Tight End", "TE"], ["Sample Lineman", "OL"]], "cards": [["Base Offense", "ALL", "How many receivers are lined up on the trips side of a Trips formation?", "3", "2", "4", "1", "Trips means three receivers to one side of the ball.", ""], ["Base Offense", "ALL", "Which formation has two receivers on each side of the ball?", "Doubles", "Trips", "Empty", "Bunch", "Doubles is a 2x2 set.", ""], ["Base Offense", "ALL", "What does the word Bunch describe?", "Three receivers lined up tightly together", "Two receivers split far apart", "A back lined up behind the guard", "All five linemen on one side", "Bunch sets are often used to create natural picks and crossing routes.", ""], ["Base Offense", "ALL", "What is an Empty formation?", "No running back in the backfield", "Two tight ends and no receivers", "The quarterback under center with no one behind him", "A formation with only four linemen", "Empty puts all five eligible players out wide or on the line, so the QB is alone in the backfield.", ""], ["Base Offense", "QB, RB", "Where does the running back line up in a Pistol set?", "Directly behind the quarterback", "Beside the quarterback in the shotgun", "On the line next to the tackle", "Split wide as a receiver", "In the Pistol the QB is a few yards back and the running back lines up directly behind him.", ""], ["Base Offense", "ALL", "In this sample playbook, what does the call 'Rip' tell the offensive line to do?", "Slide protection to the right", "", "", "", "Rip means the line slides protection to the right. Liz means slide to the left.", ""], ["Base Offense", "ALL", "In this sample playbook, what does the call 'Liz' tell the offensive line to do?", "Slide protection to the left", "", "", "", "Liz means slide protection to the left. Rip means slide to the right.", ""], ["Base Offense", "QB", "In this sample playbook, what does a QB tap on the helmet mean?", "Quick snap count", "", "", "", "The QB tap on the helmet is the sample signal for a quick snap count. Change it to your own signal in the Cards tab.", ""], ["Base Offense", "ALL", "What word do you say when you change the play at the line of scrimmage?", "Your own audible word (replace this)", "", "", "", "This card is a template. Replace it with your own audible word and what it means.", ""], ["Pass Game Install", "ALL", "Which two routes make up the Smash concept?", "A corner route over a hitch route", "A post over a dig", "A go over an out", "A curl over a flat", "The hitch holds the cornerback while the corner route attacks over the top.", ""], ["Pass Game Install", "QB", "On Smash, who is the QB's key defender?", "The cornerback over the hitch route", "The middle linebacker", "The free safety", "The defensive end", "If the corner sits on the hitch, throw the corner route. If the corner drops, throw the hitch.", ""], ["Pass Game Install", "ALL", "What does the Mesh concept do?", "Two shallow routes cross each other in opposite directions", "Four receivers run straight up the field", "Two receivers run curl routes", "The tight end blocks and the back runs a go", "The crossing routes are designed to rub off or confuse man coverage.", ""], ["Pass Game Install", "WR, TE", "On Mesh, what is the key to the two crossing routes?", "Cross at different depths and stay low to the ground", "Run into the same spot at the same time", "Stop in the middle and wait for the ball", "Run a vertical route first", "Crossing at different depths keeps the defenders from covering both routes.", ""], ["Pass Game Install", "ALL", "How many receivers run vertical routes on Four Verticals?", "4", "2", "3", "5", "Four Verticals stretches the deep part of the field with four receivers running streaks or seams.", ""], ["Pass Game Install", "QB", "On Four Verticals, what do you read first?", "The deep safeties", "The nearest linebacker", "The defensive tackles", "The sideline", "The safeties tell you which vertical will be open. Throw away from a safety who is covering the route.", ""], ["Pass Game Install", "ALL", "On a Curl-Flat concept, what does the flat route do?", "Runs to the sideline at shallow depth to stretch the underneath defender", "Runs a deep post", "Stays in to block", "Runs a seam up the middle", "The flat route pulls the flat defender out so the curl has room behind him.", ""], ["Pass Game Install", "ALL", "The Stick concept features which type of route from the inside receiver?", "A short stick route, a quick stop about 5 yards deep", "A deep post", "A fade", "A wheel", "Stick is a quick-game concept designed to get the ball out fast against zone coverage.", ""], ["Pass Game Install", "QB", "On Stick, how fast should the ball come out?", "On rhythm, after a quick 3-step drop", "After holding it for five seconds", "Only after the QB scrambles", "After a full 7-step drop", "Quick-game concepts are built to be thrown in about 2 seconds.", ""], ["Pass Game Install", "WR", "A cornerback is playing off, 7 yards from you. What kind of route is usually open?", "A quick hitch or stick", "A deep go route every time", "A block on the safety", "A late curl", "Off coverage gives up the short routes, so the quick hitch or stick is usually open.", ""], ["OL Install", "OL", "A defender shows blitz over your gap. What do you do?", "Block him and pass off anyone who crosses your face", "Run to the flat", "Wait to see who comes", "Chip him and release to a route", "Stay square, keep your inside shoulder free, and communicate the blitz.", ""], ["OL Install", "RB", "Nobody rushes to your side. What is your job?", "Check release to the flat", "Stay in and block the nearest lineman", "Run a deep post", "Take the handoff", "If the back is not needed in protection, he releases as a check-down option.", ""], ["OL Install", "QB", "How many pass rushers can your five linemen block without help from the back?", "Five (the number of linemen)", "Three", "Seven", "None", "Count the rushers. If there are more than the linemen can block, the back or the QB has to account for the extra rusher.", ""]]};
var LOG_HEAD = ['Time', 'Name', 'Pos', 'Card', 'Correct', 'Day', 'EventId', 't'];
var DRILL_HEAD = ['Time', 'Name', 'Pos', 'Score', 'TDs', 'Answered', 'Right', 'Longest streak', 'Day', 'DrillId', 't', 'Set'];
var DECK_HEAD = ['ID', 'Positions', 'Question', 'Answer', 'Wrong 1', 'Wrong 2', 'Wrong 3', 'Explanation', 'Image', 'Active'];
var RESERVED = ['settings', 'roster', 'log', 'drills', 'mastery', 'most missed', 'help'];

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function tab_(n) { var s = ss_(); return s.getSheetByName(n) || s.insertSheet(n); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Mental Reps')
    .addItem('Refresh dashboard', 'refreshDashboard')
    .addItem('Refresh automatically every hour', 'autoRefreshOn')
    .addItem('Stop automatic refresh', 'autoRefreshOff')
    .addItem('New deck tab', 'newDeckTab')
    .addItem('Show my player link', 'showLink')
    .addItem('Turn on position checking', 'positionChecks')
    .addToUi();
  try { allDeckSheets_(true).forEach(posGuard_); } catch (x) {}
}
function autoRefreshOn() { autoRefreshOff(); ScriptApp.newTrigger('refreshDashboard').timeBased().everyHours(1).create(); }
function autoRefreshOff() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'refreshDashboard') ScriptApp.deleteTrigger(t); });
}

/* ---------- Setup ---------- */
function setupSheet() {
  var s = tab_('Settings');
  if (s.getLastRow() < 2) {
    var rows = Object.keys(SAMPLE.settings).map(function (k) { return [k, SAMPLE.settings[k]]; });
    s.clear();
    s.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]).setFontWeight('bold');
    s.getRange(2, 1, rows.length, 2).setValues(rows);
    s.setColumnWidth(1, 160); s.setColumnWidth(2, 420); s.setFrozenRows(1);
  }
  if (!allDeckSheets_(true).length) {
    var byDeck = {}, names = [];
    SAMPLE.cards.forEach(function (x) { if (!byDeck[x[0]]) { byDeck[x[0]] = []; names.push(x[0]); } byDeck[x[0]].push(x); });
    names.forEach(function (n) {
      var t = makeDeckTab_(n);
      var rows = byDeck[n].map(function (x) { return [''].concat(x.slice(1)).concat(['yes']); });
      t.getRange(2, 1, rows.length, DECK_HEAD.length).setValues(rows);
    });
  }
  var r = tab_('Roster');
  if (r.getLastRow() < 2) {
    r.clear();
    r.getRange(1, 1, 1, 2).setValues([['Name', 'Position']]).setFontWeight('bold');
    r.getRange(2, 1, SAMPLE.roster.length, 2).setValues(SAMPLE.roster);
    r.setFrozenRows(1); r.setColumnWidth(1, 220);
  }
  var l = tab_('Log');
  if (l.getLastRow() < 1) { l.getRange(1, 1, 1, LOG_HEAD.length).setValues([LOG_HEAD]).setFontWeight('bold'); l.setFrozenRows(1); }
  assignIds_();
  ss_().toast('Sheet is ready. Now Deploy > New deployment > Web app.');
}

function showLink() {
  var set = settings_(), page = String(set['Page URL'] || set['Player URL'] || '').trim();
  var url = ScriptApp.getService().getUrl();
  var id = (/\/s\/([^\/]+)\//.exec(url) || [])[1] || '';
  var msg = !page ? 'Put your page link in Settings > Page URL (or Player URL) first.'
    : !id ? 'Deploy this script as a Web app first (Deploy > New deployment).'
    : 'Send players this link:\n\n' + page + (page.indexOf('?') > -1 ? '&' : '?') + 's=' + id;
  SpreadsheetApp.getUi().alert(msg);
}

/* ---------- Settings and cards ---------- */
function settings_() {
  var out = {}, s = ss_().getSheetByName('Settings');
  if (!s || s.getLastRow() < 2) return out;
  s.getRange(2, 1, s.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') out[String(r[0]).trim()] = r[1]; });
  return out;
}
function newId_() { return 'c' + Utilities.getUuid().replace(/-/g, '').slice(0, 8); }

function isDeckName_(n) { return RESERVED.indexOf(String(n).toLowerCase()) < 0 && String(n).charAt(0) !== '_'; }

/* Reads row 1 of a tab into {question: 3, ...} (0-based). Header names are not case sensitive, so coaches can reorder columns. */
function cols_(sh) {
  if (sh.getLastColumn() < 1) return {};
  var out = {};
  sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].forEach(function (h, i) {
    var k = String(h).trim().toLowerCase(); if (k === 'position') k = 'positions'; if (k && !(k in out)) out[k] = i;
  });
  return out;
}

/* Every tab that looks like a deck (has a Question column). Tab order = deck order. */
function allDeckSheets_(includeHidden) {
  return ss_().getSheets().filter(function (sh) {
    if (!isDeckName_(sh.getName())) return false;
    if (!includeHidden && sh.isSheetHidden()) return false;
    return 'question' in cols_(sh);
  });
}

function makeDeckTab_(name) {
  var t = ss_().insertSheet(name);
  t.getRange(1, 1, 1, DECK_HEAD.length).setValues([DECK_HEAD]).setFontWeight('bold');
  t.setFrozenRows(1);
  [70, 90, 380, 200, 160, 160, 160, 320, 200, 60].forEach(function (w, i) { t.setColumnWidth(i + 1, w); });
  t.getRange(1, 1).setNote('Leave ID blank on new rows. The app fills it in. To reset progress on a card, clear its ID.');
  t.getRange(1, 2).setNote('ALL, or a comma list like WR, TE. Blank means ALL.');
  posGuard_(t);
  return t;
}

/* Rejects a Positions entry that is not ALL or a comma list of positions from Settings (catches typos).
   Reads the list live from the Settings tab, so changing the list needs no re-run. */
function posGuard_(sh) {
  var c = cols_(sh); if (!('positions' in c)) return;
  var st = ss_().getSheetByName('Settings'), row = 0;
  if (!st) return;
  st.getRange(1, 1, Math.max(st.getLastRow(), 1), 1).getValues().forEach(function (r, i) { if (!row && String(r[0]).trim().toLowerCase() === 'positions') row = i + 1; });
  if (!row) return;
  var a1 = sh.getRange(2, c.positions + 1).getA1Notation();
  var f = '=OR(TRIM(' + a1 + ')="",SUMPRODUCT(--NOT(ISNUMBER(SEARCH(","&SPLIT(UPPER(SUBSTITUTE(' + a1 + '," ","")),",")&",",",ALL,"&UPPER(SUBSTITUTE(INDIRECT("Settings!B' + row + '")," ",""))&","))))=0)';
  var rule = SpreadsheetApp.newDataValidation().requireFormulaSatisfied(f).setAllowInvalid(false)
    .setHelpText('Use ALL, or positions from the Settings list separated by commas, for example WR, TE.').build();
  sh.getRange(2, c.positions + 1, Math.max(sh.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}
function positionChecks() {
  var n = 0; allDeckSheets_(true).forEach(function (sh) { posGuard_(sh); n++; });
  ss_().toast('Position checking is on for ' + n + ' deck tabs.', 'Mental Reps', 6);
}

function newDeckTab() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt('New deck tab', 'Deck name (this is what players see), for example "Week 10 vs Guthrie":', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var n = res.getResponseText().trim();
  if (!n || !isDeckName_(n)) { ui.alert('Pick a different name. That one is reserved or empty.'); return; }
  if (ss_().getSheetByName(n)) { ui.alert('A tab with that name already exists.'); return; }
  ss_().setActiveSheet(makeDeckTab_(n));
}

/* Gives every card with a blank or repeated ID a new one, across all deck tabs. Safe to run any time. */
function assignIds_() {
  var seen = {};
  allDeckSheets_(true).forEach(function (sh) {
    var c = cols_(sh);
    if (!('id' in c)) { sh.insertColumnBefore(1); sh.getRange(1, 1).setValue('ID'); c = cols_(sh); }
    var n = sh.getLastRow() - 1; if (n < 1) return;
    var width = sh.getLastColumn(), v = sh.getRange(2, 1, n, width).getValues(), ids = [], changed = false;
    v.forEach(function (r) {
      var id = String(r[c.id]).trim(), has = String(r[c.question]).trim() !== '';
      if (!has) { ids.push([id]); if (id) seen[id] = 1; return; }
      if (!id || seen[id]) { id = newId_(); changed = true; }
      seen[id] = 1; ids.push([id]);
    });
    if (changed) sh.getRange(2, c.id + 1, n, 1).setValues(ids);
  });
}
function onEdit(e) {
  try {
    var name = e.range.getSheet().getName();
    if (name.toLowerCase() === 'settings') settingsEdit_(e);
    else if (isDeckName_(name)) assignIds_();
  } catch (x) {}
}

/* Positions are a plain list (up to 15, any order). Editing the list never changes cards or the roster.
   To rename a position everywhere, type pairs in the "Rename positions" row of Settings, like:  M > Y, T > TE
   Cards, the roster and the Positions list are updated, then the cell clears itself. */
var MAX_POS = 15;
function settingsEdit_(e) {
  var r = e.range;
  if (r.getNumRows() !== 1 || r.getNumColumns() !== 1 || r.getColumn() !== 2) return;
  var sh = r.getSheet(), key = String(sh.getRange(r.getRow(), 1).getValue()).trim().toLowerCase();
  if (key === 'positions') {
    var list = split_(r.getValue()), seen = {}, dup = false;
    list.forEach(function (x) { var u = x.toUpperCase(); if (seen[u]) dup = true; seen[u] = 1; });
    if (list.length > MAX_POS) ss_().toast('You have ' + list.length + ' positions. The limit is ' + MAX_POS + '.', 'Positions', 10);
    else if (dup) ss_().toast('A position is listed twice. Remove the repeat.', 'Positions', 10);
    return;
  }
  if (key !== 'rename positions') return;
  var txt = String(r.getValue() || '').trim(); if (!txt) return;
  var map = {}, bad = [];
  txt.split(',').forEach(function (p) {
    p = p.trim(); if (!p) return;
    var m = p.split(/\s*(?:>|=|->|\u2192)\s*/);
    if (m.length === 2 && m[0].trim() && m[1].trim()) map[m[0].trim().toUpperCase()] = m[1].trim(); else bad.push(p);
  });
  if (bad.length || !Object.keys(map).length) { ss_().toast('Use the form  OLD > NEW, OLD > NEW   for example  M > Y, T > TE', 'Rename positions', 12); return; }
  var n = 0;
  var swap = function (v) {
    var s = String(v == null ? '' : v); if (!s.trim()) return v;
    var seen = {}, out = [];
    split_(s).forEach(function (t) { var u = t.toUpperCase(), x = (u in map) ? map[u] : t, k = x.toUpperCase(); if (!seen[k]) { seen[k] = 1; out.push(x); } });
    return out.join(', ');
  };
  allDeckSheets_(true).forEach(function (d) {
    var c = cols_(d); if (!('positions' in c) || d.getLastRow() < 2) return;
    var rng = d.getRange(2, c.positions + 1, d.getLastRow() - 1, 1), vals = rng.getValues();
    rng.setValues(vals.map(function (row) { var nv = swap(row[0]); if (nv !== row[0]) n++; return [nv]; }));
  });
  var ro = ss_().getSheetByName('Roster');
  if (ro && ro.getLastRow() > 1) {
    var rr = ro.getRange(2, 2, ro.getLastRow() - 1, 1), rv = rr.getValues();
    rr.setValues(rv.map(function (row) { var nv = swap(row[0]); if (nv !== row[0]) n++; return [nv]; }));
  }
  var rows = sh.getLastRow();
  for (var i = 2; i <= rows; i++) {
    if (String(sh.getRange(i, 1).getValue()).trim().toLowerCase() === 'positions') { var pc = sh.getRange(i, 2); pc.setValue(swap(pc.getValue())); break; }
  }
  r.clearContent();
  ss_().toast('Renamed on ' + n + ' cards and roster rows.', 'Rename positions', 8);
}

function split_(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function yes_(v) { v = String(v == null ? '' : v).trim().toLowerCase(); return v === '' || ['yes', 'y', 'true', '1', 'x'].indexOf(v) > -1; }

function config_() {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { assignIds_(); } finally { lock.releaseLock(); }
  var set = settings_(), cards = [];
  allDeckSheets_(false).forEach(function (sh) {
    if (sh.getLastRow() < 2) return;
    var c = cols_(sh), g = function (r, k) { return k in c ? r[c[k]] : ''; };
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues().forEach(function (r) {
      var q = String(g(r, 'question')).trim(), a = String(g(r, 'answer')).trim(), back = String(g(r, 'explanation') || '');
      if (!a && back.trim()) { a = back.trim(); back = ''; }   /* blank Answer: show the Explanation as the answer */
      if (!q || !a || !yes_(g(r, 'active'))) return;
      var pos = split_(g(r, 'positions'));
      cards.push({
        id: String(g(r, 'id')), deck: String(g(r, 'deck') || '').trim() || sh.getName(), pos: pos.length ? pos : ['ALL'],
        q: q, a: a, wrong: [g(r, 'wrong 1'), g(r, 'wrong 2'), g(r, 'wrong 3')].map(String).filter(function (x) { return x.trim(); }),
        back: back, img: String(g(r, 'image') || '')
      });
    });
  });
  if (!cards.length) return { error: 'No cards found. Add a deck tab with a Question column, or run setupSheet.' };
  return {
    name: String(set['App name'] || 'Mental Reps'), team: String(set['Team name'] || ''),
    positions: split_(set['Positions']), streak: +set['Mastery streak'] || 3, days: +set['Mastery days'] || 2, cards: cards
  };
}

/* ---------- Roster and log ---------- */
function rosterRows_() {
  var s = ss_().getSheetByName('Roster'); if (!s || s.getLastRow() < 2) return [];
  return s.getRange(2, 1, s.getLastRow() - 1, 2).getValues().filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) { return { name: String(r[0]).trim(), pos: String(r[1]).trim().toUpperCase() }; });
}
function logRows_() {
  var s = ss_().getSheetByName('Log'); if (!s || s.getLastRow() < 2) return [];
  return s.getRange(2, 1, s.getLastRow() - 1, LOG_HEAD.length).getValues().map(function (r) {
    var day = r[5] instanceof Date ? Utilities.formatDate(r[5], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[5]);
    return { ts: r[0] instanceof Date ? r[0].getTime() : r[0], name: String(r[1]), pos: String(r[2]).toUpperCase(), card: String(r[3]),
      ok: +r[4] ? 1 : 0, day: day, eid: String(r[6]), t: +r[7] || (r[0] instanceof Date ? r[0].getTime() : 0) };
  });
}

function drillRows_() {
  var s = ss_().getSheetByName('Drills');
  if (!s || s.getLastRow() < 2) return [];
  return s.getRange(2, 1, s.getLastRow() - 1, DRILL_HEAD.length).getValues().map(function (r) {
    var day = r[8] instanceof Date ? Utilities.formatDate(r[8], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(r[8]);
    return { name: String(r[1]), pos: String(r[2]).toUpperCase(), score: +r[3] || 0, td: +r[4] || 0, ans: +r[5] || 0,
      right: +r[6] || 0, longest: +r[7] || 0, day: day, did: String(r[9]), t: +r[10] || 0, set: String(r[11] || 'mix') };
  });
}

function route_(p) {
  var a = p.action;
  if (a === 'leaderboard') return drillRows_();
  if (a === 'config') return config_();
  if (a === 'roster') return rosterRows_();
  if (a === 'progress') {
    var n = String(p.name || '').toLowerCase();
    return logRows_().filter(function (r) { return r.name.toLowerCase() === n; });
  }
  if (a === 'all') {
    var code = String(settings_()['Coach code'] || '');
    if (!code || code === 'CHANGE-ME' || String(p.code) !== code) return { error: 'bad code' };
    return { roster: rosterRows_(), log: logRows_() };
  }
  return { ok: true, app: 'Mental Reps' };
}

function handlePost_(o) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (o.type === 'player') {
      var name = String(o.name || '').trim(); if (name.length < 2) return 'skip';
      var have = rosterRows_().some(function (r) { return r.name.toLowerCase() === name.toLowerCase(); });
      if (!have) tab_('Roster').appendRow([name, String(o.pos || '').toUpperCase()]);
      return 'ok';
    }
    if (o.type === 'drill') {
      var d = tab_('Drills');
      if (d.getLastRow() < 1) d.getRange(1, 1, 1, DRILL_HEAD.length).setValues([DRILL_HEAD]).setFontWeight('bold');
      var did = String(o.did || '');
      var dup = did && d.getLastRow() > 1 && d.getRange(2, 10, d.getLastRow() - 1, 1).createTextFinder(did).matchEntireCell(true).findNext();
      if (dup || !(+o.ans > 0)) return 'dup';
      d.appendRow([new Date(), String(o.name), String(o.pos).toUpperCase(), +o.score || 0, +o.td || 0, +o.ans || 0, +o.right || 0, +o.longest || 0, String(o.day), did, +o.t || Date.now(), String(o.set || 'mix')]);
      return 'ok';
    }
    if (o.type === 'answer') {
      var l = tab_('Log');
      if (l.getLastRow() < 1) l.getRange(1, 1, 1, LOG_HEAD.length).setValues([LOG_HEAD]);
      var eid = String(o.eid || '');
      if (eid && l.getLastRow() > 1) {
        var hit = l.getRange(2, 7, l.getLastRow() - 1, 1).createTextFinder(eid).matchEntireCell(true).findNext();
        if (hit) return 'dup';
      }
      l.appendRow([new Date(), String(o.name), String(o.pos).toUpperCase(), String(o.card), o.ok ? 1 : 0, String(o.day), eid, +o.t || Date.now()]);
      return 'ok';
    }
    return 'skip';
  } finally { lock.releaseLock(); }
}

function json_(x) { return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) { return json_(route_((e && e.parameter) || {})); }
function doPost(e) {
  var r = 'bad';
  try { r = handlePost_(JSON.parse(e.postData.contents)); } catch (x) { r = 'error: ' + x; }
  return ContentService.createTextOutput(r);
}
function apiGet(p) { return route_(p || {}); }
function apiPost(s) { return handlePost_(JSON.parse(s)); }

/* ---------- Dashboard ---------- */
function mastery_(cards, roster, log, streak, days) {
  var by = {};
  roster.forEach(function (r) { by[r.name.toLowerCase()] = { name: r.name, pos: r.pos, ev: [] }; });
  log.forEach(function (e) { if (String(e.eid).indexOf('dr-') === 0) return; var k = e.name.toLowerCase(); (by[k] || (by[k] = { name: e.name, pos: e.pos, ev: [] })).ev.push(e); });
  return Object.keys(by).map(function (k) {
    var p = by[k], st = {};
    p.ev.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (e) {
      var x = st[e.card] || (st[e.card] = { s: 0, d: [], m: false });
      if (e.ok) { x.s++; if (x.d.indexOf(e.day) < 0) x.d.push(e.day); if (x.s >= streak && x.d.length >= days) x.m = true; }
      else { x.s = 0; x.d = []; }
    });
    var per = {}, total = 0, done = 0;
    cards.forEach(function (c) {
      if (c.pos.indexOf('ALL') < 0 && c.pos.map(function (q) { return q.toUpperCase(); }).indexOf(p.pos) < 0) return;
      var d = per[c.deck] || (per[c.deck] = { n: 0, k: 0 }); d.n++; total++;
      if (st[c.id] && st[c.id].m) { d.k++; done++; }
    });
    var right = 0, last = '';
    p.ev.forEach(function (e) { if (e.ok) right++; if (e.day > last) last = e.day; });
    return { name: p.name, pos: p.pos, total: total, done: done, pct: total ? done / total : 0, per: per, answers: p.ev.length, acc: p.ev.length ? right / p.ev.length : '', last: last };
  }).sort(function (a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1; });
}

function refreshDashboard() {
  var cfg = config_(); if (cfg.error) throw new Error(cfg.error);
  var cards = cfg.cards, decks = [];
  cards.forEach(function (c) { if (decks.indexOf(c.deck) < 0) decks.push(c.deck); });
  var sum = mastery_(cards, rosterRows_(), logRows_(), cfg.streak, cfg.days);

  var ms = tab_('Mastery'); ms.clear();
  var head = ['Player', 'Pos', 'Cards mastered', 'Cards', '% mastered'].concat(decks).concat(['Answers', 'Accuracy', 'Last active']);
  var rows = sum.map(function (s) {
    var r = [s.name, s.pos, s.done, s.total, s.pct];
    decks.forEach(function (d) { var x = s.per[d]; r.push(x && x.n ? x.k / x.n : ''); });
    return r.concat([s.answers, s.acc, s.last]);
  });
  ms.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setWrap(true);
  if (rows.length) {
    ms.getRange(2, 1, rows.length, head.length).setValues(rows);
    ms.getRange(2, 5, rows.length, 1 + decks.length).setNumberFormat('0%');
    ms.getRange(2, 6 + decks.length + 1, rows.length, 1).setNumberFormat('0%');
  }
  ms.setFrozenRows(1); ms.setFrozenColumns(1); ms.autoResizeColumns(1, head.length);
  ms.getRange(1, 1).setNote('Last refreshed ' + new Date());

  var mm = tab_('Most Missed');
  mm.getCharts().forEach(function (c) { mm.removeChart(c); });
  mm.clear();
  var cnt = {};
  logRows_().forEach(function (e) { if (String(e.eid).indexOf('dr-') === 0) return; var x = cnt[e.card] || (cnt[e.card] = { a: 0, m: 0 }); x.a++; if (!e.ok) x.m++; });
  var list = cards.map(function (c) { var x = cnt[c.id] || { a: 0, m: 0 }; return [c.q + '  →  ' + c.a, x.m, x.a, x.a ? x.m / x.a : 0]; })
    .filter(function (r) { return r[1] > 0; }).sort(function (a, b) { return b[1] - a[1] || b[3] - a[3]; });
  mm.getRange('A1').setValue('Most missed cards').setFontWeight('bold').setFontSize(12);
  mm.getRange('A2:D2').setValues([['Question and answer', 'Misses', 'Attempts', 'Miss %']]).setFontWeight('bold');
  if (list.length) {
    mm.getRange(3, 1, list.length, 4).setValues(list);
    mm.getRange(3, 4, list.length, 1).setNumberFormat('0%');
    var top = Math.min(5, list.length);
    mm.insertChart(mm.newChart().asBarChart().addRange(mm.getRange(2, 1, top + 1, 2)).setNumHeaders(1)
      .setOption('title', 'Top missed cards').setOption('legend', { position: 'none' })
      .setOption('vAxis', { direction: -1 }).setPosition(3, 6, 0, 0).setOption('width', 620).setOption('height', 300).build());
  } else mm.getRange('A3').setValue('No misses yet');
  mm.setColumnWidth(1, 520);
  SpreadsheetApp.flush();
}
