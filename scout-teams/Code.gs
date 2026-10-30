/**
 * Scout Teams: backend for the quiz page. One file. Paste over everything in Code.gs.
 *
 * FIRST TIME: pick setupSheet in the function dropdown, click Run, approve the permissions.
 * It builds the tabs (Settings, Cards, Roster, Log) with sample data you can overwrite.
 * Then Deploy > New deployment > Web app: Execute as Me, Who has access: Anyone. Copy the Web app URL.
 *
 * Tabs
 *   Settings  app name, team name, positions, coach code, mastery rule
 *   Cards     your playbook. One row per card. ID is filled in for you; never type it.
 *   Roster    player names and positions (players can also add themselves)
 *   Log       every answer, written by the app (do not edit)
 *   Mastery, Most Missed   built by "Scout Teams > Refresh dashboard"
 */
var SAMPLE = {"settings": {"App name": "Scout Teams", "Team name": "Sample Team", "Positions": "QB, RB, WR, TE, OL", "Coach code": "CHANGE-ME", "Mastery streak": 3, "Mastery days": 2, "Page URL": ""}, "roster": [["Sample Quarterback", "QB"], ["Sample Back", "RB"], ["Sample Receiver", "WR"], ["Sample Tight End", "TE"], ["Sample Lineman", "OL"]], "cards": [["Formations", "ALL", "How many receivers are lined up on the trips side of a Trips formation?", "3", "2", "4", "1", "Trips means three receivers to one side of the ball.", ""], ["Formations", "ALL", "Which formation has two receivers on each side of the ball?", "Doubles", "Trips", "Empty", "Bunch", "Doubles is a 2x2 set.", ""], ["Formations", "ALL", "What does the word Bunch describe?", "Three receivers lined up tightly together", "Two receivers split far apart", "A back lined up behind the guard", "All five linemen on one side", "Bunch sets are often used to create natural picks and crossing routes.", ""], ["Formations", "ALL", "What is an Empty formation?", "No running back in the backfield", "Two tight ends and no receivers", "The quarterback under center with no one behind him", "A formation with only four linemen", "Empty puts all five eligible players out wide or on the line, so the QB is alone in the backfield.", ""], ["Formations", "QB, RB", "Where does the running back line up in a Pistol set?", "Directly behind the quarterback", "Beside the quarterback in the shotgun", "On the line next to the tackle", "Split wide as a receiver", "In the Pistol the QB is a few yards back and the running back lines up directly behind him.", ""], ["Pass Concepts", "ALL", "Which two routes make up the Smash concept?", "A corner route over a hitch route", "A post over a dig", "A go over an out", "A curl over a flat", "The hitch holds the cornerback while the corner route attacks over the top.", ""], ["Pass Concepts", "QB", "On Smash, who is the QB's key defender?", "The cornerback over the hitch route", "The middle linebacker", "The free safety", "The defensive end", "If the corner sits on the hitch, throw the corner route. If the corner drops, throw the hitch.", ""], ["Pass Concepts", "ALL", "What does the Mesh concept do?", "Two shallow routes cross each other in opposite directions", "Four receivers run straight up the field", "Two receivers run curl routes", "The tight end blocks and the back runs a go", "The crossing routes are designed to rub off or confuse man coverage.", ""], ["Pass Concepts", "WR, TE", "On Mesh, what is the key to the two crossing routes?", "Cross at different depths and stay low to the ground", "Run into the same spot at the same time", "Stop in the middle and wait for the ball", "Run a vertical route first", "Crossing at different depths keeps the defenders from covering both routes.", ""], ["Pass Concepts", "ALL", "How many receivers run vertical routes on Four Verticals?", "4", "2", "3", "5", "Four Verticals stretches the deep part of the field with four receivers running streaks or seams.", ""], ["Pass Concepts", "QB", "On Four Verticals, what do you read first?", "The deep safeties", "The nearest linebacker", "The defensive tackles", "The sideline", "The safeties tell you which vertical will be open. Throw away from a safety who is covering the route.", ""], ["Pass Concepts", "ALL", "On a Curl-Flat concept, what does the flat route do?", "Runs to the sideline at shallow depth to stretch the underneath defender", "Runs a deep post", "Stays in to block", "Runs a seam up the middle", "The flat route pulls the flat defender out so the curl has room behind him.", ""], ["Pass Concepts", "ALL", "The Stick concept features which type of route from the inside receiver?", "A short stick route, a quick stop about 5 yards deep", "A deep post", "A fade", "A wheel", "Stick is a quick-game concept designed to get the ball out fast against zone coverage.", ""], ["Pass Concepts", "QB", "On Stick, how fast should the ball come out?", "On rhythm, after a quick 3-step drop", "After holding it for five seconds", "Only after the QB scrambles", "After a full 7-step drop", "Quick-game concepts are built to be thrown in about 2 seconds.", ""], ["Pass Concepts", "WR", "A cornerback is playing off, 7 yards from you. What kind of route is usually open?", "A quick hitch or stick", "A deep go route every time", "A block on the safety", "A late curl", "Off coverage gives up the short routes, so the quick hitch or stick is usually open.", ""], ["Protection", "OL", "A defender shows blitz over your gap. What do you do?", "Block him and pass off anyone who crosses your face", "Run to the flat", "Wait to see who comes", "Chip him and release to a route", "Stay square, keep your inside shoulder free, and communicate the blitz.", ""], ["Protection", "RB", "Nobody rushes to your side. What is your job?", "Check release to the flat", "Stay in and block the nearest lineman", "Run a deep post", "Take the handoff", "If the back is not needed in protection, he releases as a check-down option.", ""], ["Protection", "QB", "How many pass rushers can your five linemen block without help from the back?", "Five (the number of linemen)", "Three", "Seven", "None", "Count the rushers. If there are more than the linemen can block, the back or the QB has to account for the extra rusher.", ""], ["Signals", "ALL", "In this sample playbook, what does the call 'Rip' tell the offensive line to do?", "", "", "", "", "Rip means the line slides protection to the right. Liz means slide to the left.", ""], ["Signals", "ALL", "In this sample playbook, what does the call 'Liz' tell the offensive line to do?", "", "", "", "", "Liz means slide protection to the left. Rip means slide to the right.", ""], ["Signals", "QB", "In this sample playbook, what does a QB tap on the helmet mean?", "", "", "", "", "The QB tap on the helmet is the sample signal for a quick snap count. Change it to your own signal in the Cards tab.", ""], ["Signals", "ALL", "What word do you say when you change the play at the line of scrimmage?", "", "", "", "", "This card is a template. Replace it with your own audible word and what it means.", ""]]};
var LOG_HEAD = ['Time', 'Name', 'Pos', 'Card', 'Correct', 'Day', 'EventId', 't'];
var CARD_HEAD = ['ID', 'Deck', 'Positions', 'Question', 'Answer', 'Wrong 1', 'Wrong 2', 'Wrong 3', 'Explanation', 'Image', 'Active'];

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function tab_(n) { var s = ss_(); return s.getSheetByName(n) || s.insertSheet(n); }

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Scout Teams')
    .addItem('Refresh dashboard', 'refreshDashboard')
    .addItem('Refresh automatically every hour', 'autoRefreshOn')
    .addItem('Stop automatic refresh', 'autoRefreshOff')
    .addItem('Show my player link', 'showLink')
    .addToUi();
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
  var c = tab_('Cards');
  if (c.getLastRow() < 2) {
    c.clear();
    c.getRange(1, 1, 1, CARD_HEAD.length).setValues([CARD_HEAD]).setFontWeight('bold');
    var rows2 = SAMPLE.cards.map(function (r) { return [''].concat(r).concat(['yes']); });
    c.getRange(2, 1, rows2.length, CARD_HEAD.length).setValues(rows2);
    c.setFrozenRows(1);
    [60, 110, 90, 380, 200, 160, 160, 160, 320, 200, 60].forEach(function (w, i) { c.setColumnWidth(i + 1, w); });
    c.getRange(1, 1).setNote('Leave ID blank on new rows. The app fills it in. To reset progress on a card, clear its ID.');
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
  var set = settings_(), page = String(set['Page URL'] || '').trim();
  var url = ScriptApp.getService().getUrl();
  var id = (/\/s\/([^\/]+)\//.exec(url) || [])[1] || '';
  var msg = !page ? 'Put your page link in Settings > Page URL first.'
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

/* Gives every card with a blank or repeated ID a new one. Safe to run any time. */
function assignIds_() {
  var c = ss_().getSheetByName('Cards');
  if (!c || c.getLastRow() < 2) return;
  var n = c.getLastRow() - 1, v = c.getRange(2, 1, n, 4).getValues(), seen = {}, ids = [], changed = false;
  v.forEach(function (r) {
    var id = String(r[0]).trim(), has = String(r[3]).trim() !== '';
    if (!has) { ids.push([id]); if (id) seen[id] = 1; return; }
    if (!id || seen[id]) { id = newId_(); changed = true; }
    seen[id] = 1; ids.push([id]);
  });
  if (changed) c.getRange(2, 1, n, 1).setValues(ids);
}
function onEdit(e) { try { if (e.range.getSheet().getName() === 'Cards') assignIds_(); } catch (x) {} }

function split_(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function yes_(v) { v = String(v == null ? '' : v).trim().toLowerCase(); return v === '' || ['yes', 'y', 'true', '1', 'x'].indexOf(v) > -1; }

function config_() {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try { assignIds_(); } finally { lock.releaseLock(); }
  var set = settings_(), c = ss_().getSheetByName('Cards');
  if (!c || c.getLastRow() < 2) return { error: 'Cards tab is empty. Run setupSheet.' };
  var cards = c.getRange(2, 1, c.getLastRow() - 1, CARD_HEAD.length).getValues().filter(function (r) {
    return String(r[3]).trim() && String(r[4]).trim() && yes_(r[10]);
  }).map(function (r) {
    return { id: String(r[0]), deck: String(r[1] || 'General').trim(), pos: split_(r[2]).length ? split_(r[2]) : ['ALL'],
      q: String(r[3]), a: String(r[4]), wrong: [r[5], r[6], r[7]].map(String).filter(function (x) { return x.trim(); }),
      back: String(r[8] || ''), img: String(r[9] || '') };
  });
  return {
    name: String(set['App name'] || 'Scout Teams'), team: String(set['Team name'] || ''),
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

function route_(p) {
  var a = p.action;
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
  return { ok: true, app: 'Scout Teams' };
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
  log.forEach(function (e) { var k = e.name.toLowerCase(); (by[k] || (by[k] = { name: e.name, pos: e.pos, ev: [] })).ev.push(e); });
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
  logRows_().forEach(function (e) { var x = cnt[e.card] || (cnt[e.card] = { a: 0, m: 0 }); x.a++; if (!e.ok) x.m++; });
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
