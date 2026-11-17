// User interface for the Texas Statutes Reference web app. Plain JavaScript, hash-based routes:
//   #/                      Criminal Offenses tab: list of codes and quick reference
//   #/code                  Criminal Code tab: Code of Criminal Procedure chapters
//   #/c/PE                  titles / subtitles in a code
//   #/c/PE/g/3              chapters in a title
//   #/c/PE/g/3/ch/1         entries in a chapter
//   #/o/PC-49.04            entry detail
//   #/cases                 case law topics      #/cases/t/2   cases in a topic
//   #/case/terry            case detail
//   #/bills                 HB/SB topics         #/bills/t/2   bills in a topic
//   #/bill/89r-hb1871       bill detail
//   #/saved  #/study  #/levels  #/about  #/terms
(function () {
  const L = window.StatuteLogic;
  const T = window.AppTerms;
  const store = L.create(window.APP_DATA);
  const D = store.data;

  const $ = sel => document.querySelector(sel);
  const view = $('#view');
  const searchInput = $('#search');

  // ---- Small helpers -------------------------------------------------------------------------

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Saved settings live only on this phone (bookmarks, filter, disclaimer acceptance).
  function load(key, fallback) {
    try { const v = localStorage.getItem('txs.' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem('txs.' + key, JSON.stringify(value)); } catch (e) { /* private mode: keep in memory only */ }
  }

  const state = {
    levels: load('levels', []),
    saved: load('saved', []),
    savedCases: load('savedCases', []),
    savedBills: load('savedBills', []),
    savedView: load('savedView', 'offenses'), // which list the Saved tab shows: 'offenses', 'code', 'cases', or 'bills'
  };

  const LEVEL_CLASS = {
    'Capital Felony': 'lv-capital', 'First Degree Felony': 'lv-f1', 'Second Degree Felony': 'lv-f2',
    'Third Degree Felony': 'lv-f3', 'State Jail Felony': 'lv-sjf', 'Class A Misdemeanor': 'lv-ma',
    'Class B Misdemeanor': 'lv-mb', 'Class C Misdemeanor': 'lv-mc', 'Fine Only': 'lv-fine',
  };
  function pill(group, text) {
    return '<span class="pill ' + (LEVEL_CLASS[group] || 'lv-other') + '">' + esc(text || L.LEVEL_SHORT[group] || group) + '</span>';
  }
  function levelPills(o) {
    const groups = L.LEVEL_ORDER.filter(g => o.levels.includes(g));
    return groups.length ? '<div class="pill-row">' + groups.map(g => pill(g)).join('') + '</div>' : '';
  }
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  function entryRow(o) {
    return '<a class="row" href="#/o/' + encodeURIComponent(o.id) + '"><div class="main">' +
      '<div class="title">' + esc(o.name) + '</div>' +
      '<div class="cite">' + esc(store.citation(o)) + (o.type === 'related' ? ' · Related provision' : '') + '</div>' +
      levelPills(o) + '</div>' + CHEV + '</a>';
  }

  function setTitle(text, showBack) {
    $('#title').textContent = text;
    $('#back').hidden = !showBack;
  }

  function filterNote() {
    if (!state.levels.length) return '';
    return '<div class="active-filter">Showing: ' + state.levels.map(g => pill(g)).join(' ') +
      ' <button class="text-btn" data-action="clear-filter">Clear</button></div>';
  }

  // ---- Screens -------------------------------------------------------------------------------

  // Criminal Offenses tab: every code except the Code of Criminal Procedure (its own tab).
  function renderCodes() {
    setTitle('Criminal Offenses', false);
    const rows = D.tree.filter(c => c.code !== 'CR').map(c => {
      const n = store.countIn(c, state.levels);
      return '<a class="row" href="#/c/' + c.code + '"><div class="main"><div class="title">' + esc(c.name) + '</div></div>' +
        '<span class="count">' + n + '</span>' + CHEV + '</a>';
    }).join('');
    view.innerHTML = filterNote() +
      '<div class="section-label">Browse by code</div><div class="list">' + rows + '</div>' +
      '<div class="section-label">Reference</div><div class="list">' +
      '<a class="row" href="#/levels"><div class="main"><div class="title">Punishment ranges</div><div class="sub">Jail, prison, and fines for each level</div></div>' + CHEV + '</a>' +
      '<a class="row" href="#/o/PC-1.07"><div class="main"><div class="title">Key definitions</div><div class="sub">Bodily injury, deadly weapon, public place...</div></div>' + CHEV + '</a>' +
      '<a class="row" href="#/about"><div class="main"><div class="title">About &amp; Disclaimer</div><div class="sub">Not legal advice, data sources, privacy, Terms of Use</div></div>' + CHEV + '</a>' +
      '</div>';
  }

  // Criminal Code tab: the Code of Criminal Procedure chapters (arrest, warrants, searches,
  // statements, officer duties).
  function renderCriminalCode() {
    renderGroup('CR', 0, true);
    setTitle('Criminal Code', false);
  }

  function renderCode(code) {
    const c = D.tree.find(x => x.code === code);
    if (!c) return renderNotFound();
    setTitle(c.name, true);
    if (c.groups.length === 1) return renderGroup(code, 0, true);
    view.innerHTML = filterNote() + '<div class="list">' + c.groups.map((g, i) =>
      '<a class="row" href="#/c/' + code + '/g/' + i + '"><div class="main"><div class="title">' + esc(g.name) + '</div></div>' +
      '<span class="count">' + store.countIn(g, state.levels) + '</span>' + CHEV + '</a>').join('') + '</div>';
  }

  function renderGroup(code, gi, single) {
    const c = D.tree.find(x => x.code === code);
    const g = c && c.groups[gi];
    if (!g) return renderNotFound();
    setTitle(single ? c.name : g.name.replace(/^(Title|Subtitle) \w+\.\s*/, ''), true);
    const crumbs = single ? '' : '<div class="crumbs"><a href="#/c/' + code + '">' + esc(c.name) + '</a> › ' + esc(g.name) + '</div>';
    view.innerHTML = filterNote() + crumbs + '<div class="list">' + g.chapters.map((ch, i) =>
      '<a class="row" href="#/c/' + code + '/g/' + gi + '/ch/' + i + '"><div class="main"><div class="title">' + esc(ch.name) + '</div></div>' +
      '<span class="count">' + store.countIn(ch, state.levels) + '</span>' + CHEV + '</a>').join('') + '</div>';
  }

  function renderChapter(code, gi, ci) {
    const c = D.tree.find(x => x.code === code);
    const g = c && c.groups[gi];
    const ch = g && g.chapters[ci];
    if (!ch) return renderNotFound();
    setTitle(ch.name.replace(/^Ch\. [\dA-Z]+ /, ''), true);
    const entries = store.chapterEntries(ch, state.levels);
    const offenses = entries.filter(o => o.type === 'offense');
    const related = entries.filter(o => o.type === 'related');
    view.innerHTML = filterNote() +
      '<div class="crumbs"><a href="#/c/' + code + '">' + esc(c.name) + '</a> › ' +
      (c.groups.length > 1 ? '<a href="#/c/' + code + '/g/' + gi + '">' + esc(g.name.replace(/\..*$/, '')) + '</a> › ' : '') + esc(ch.name.split(' ').slice(0, 2).join(' ')) + '</div>' +
      (offenses.length ? '<div class="list">' + offenses.map(entryRow).join('') + '</div>' : '') +
      (related.length ? '<div class="section-label">Related provisions</div><div class="list">' + related.map(entryRow).join('') + '</div>' : '') +
      (!entries.length ? '<div class="empty">Nothing in this chapter matches the punishment filter.</div>' : '');
  }

  function renderSearch(q) {
    setTitle('Search', false);
    const results = store.search(q, { levels: state.levels });
    const cases = store.searchCases(q);
    const bills = store.searchBills(q);
    view.innerHTML = filterNote() +
      (results.length ? '<div class="section-label">' + results.length + ' statute result' + (results.length === 1 ? '' : 's') + '</div><div class="list">' + results.slice(0, 80).map(entryRow).join('') + '</div>' : '') +
      (cases.length ? '<div class="section-label">Case law (' + cases.length + ')</div><div class="list">' + cases.slice(0, 30).map(caseRow).join('') + '</div>' : '') +
      (bills.length ? '<div class="section-label">HB/SB (' + bills.length + ')</div><div class="list">' + bills.slice(0, 30).map(billRow).join('') + '</div>' : '') +
      (!results.length && !cases.length && !bills.length ? '<div class="empty">No matches for “' + esc(q) + '”. Try a section number, a word from the offense name, a case name, a bill number such as HB 1871, or a common term such as DWI or POCS.</div>' : '');
  }

  // ---- Case law ----------------------------------------------------------------------------------

  const COURT_NAME = { US: 'U.S. Supreme Court', TX: 'Tex. Crim. App.' };
  function caseRow(c) {
    return '<a class="row" href="#/case/' + encodeURIComponent(c.id) + '"><div class="main">' +
      '<div class="title">' + esc(c.name) + '</div>' +
      '<div class="cite">' + esc(c.cite) + ' (' + c.year + ') · ' + COURT_NAME[c.court] + '</div></div>' + CHEV + '</a>';
  }

  function renderCaseTopics() {
    setTitle('Case Law', false);
    const topics = D.caseTopics || [];
    view.innerHTML =
      '<p class="muted" style="margin:4px 4px 12px">Short summaries of key decisions for patrol, each linked to the official opinion. Summaries are simplified study notes, not legal advice; read the opinion and follow your agency and prosecutor.</p>' +
      '<div class="list">' +
      '<a class="row" href="#/cases/t/all"><div class="main"><div class="title">All cases</div></div><span class="count">' + store.casesIn('').length + '</span>' + CHEV + '</a>' +
      topics.map((t, i) => '<a class="row" href="#/cases/t/' + i + '"><div class="main"><div class="title">' + esc(t) + '</div></div>' +
        '<span class="count">' + store.casesIn(t).length + '</span>' + CHEV + '</a>').join('') + '</div>';
  }

  function renderCaseList(ti) {
    const topic = ti === 'all' ? '' : (D.caseTopics || [])[+ti];
    if (topic === undefined) return renderNotFound();
    setTitle(topic || 'All cases', true);
    const list = store.casesIn(topic);
    const us = list.filter(c => c.court === 'US');
    const tx = list.filter(c => c.court === 'TX');
    view.innerHTML =
      (us.length ? '<div class="section-label">U.S. Supreme Court</div><div class="list">' + us.map(caseRow).join('') + '</div>' : '') +
      (tx.length ? '<div class="section-label">Texas Court of Criminal Appeals</div><div class="list">' + tx.map(caseRow).join('') + '</div>' : '');
  }

  function renderCase(id) {
    const c = store.caseById.get(id);
    if (!c) return renderNotFound();
    setTitle('Case Law', true);
    const related = (c.rel || []).map(r => store.byId.get(r)).filter(Boolean);
    view.innerHTML =
      (c.note ? '<div class="warning"><strong>Note</strong>' + esc(c.note) + '</div>' : '') +
      '<div class="card detail-head"><h2>' + esc(c.name) + '</h2>' +
        '<div class="meta">' + esc(c.cite) + ' (' + c.year + ') · ' + (c.court === 'US' ? 'U.S. Supreme Court' : 'Texas Court of Criminal Appeals') + '</div>' +
        '<div class="pill-row">' + c.topics.map(t => '<span class="pill lv-other">' + esc(t) + '</span>').join('') + '</div></div>' +
      '<div class="card"><h3>Facts</h3><p>' + esc(c.facts) + '</p></div>' +
      '<div class="card"><h3>Holding</h3><p>' + esc(c.held) + '</p></div>' +
      '<div class="card notes"><h3>For patrol</h3><p>' + esc(c.patrol) + '</p></div>' +
      (related.length ? '<div class="section-label">Related statutes</div><div class="list">' + related.map(entryRow).join('') + '</div>' : '') +
      '<div class="actions">' +
        '<button class="secondary-btn" data-action="save-case" data-id="' + esc(c.id) + '">' + (state.savedCases.includes(c.id) ? '★ Saved' : '☆ Save') + '</button>' +
        '<a class="secondary-btn" href="' + esc(c.url) + '" target="_blank" rel="noopener">Official opinion ↗</a></div>' +
      '<p class="muted">Link goes to ' + (c.court === 'TX' ? 'the court\'s case record (search.txcourts.gov); the opinion is listed under the case events.' : (c.url.includes('loc.gov') ? 'the Library of Congress copy of the U.S. Reports.' : 'the Supreme Court\'s website (supremecourt.gov).')) +
      ' Study summary only; not legal advice.</p>';
  }

  // ---- House and Senate bills (HB/SB) ------------------------------------------------------------

  function billRow(b) {
    return '<a class="row" href="#/bill/' + encodeURIComponent(b.id) + '"><div class="main">' +
      '<div class="title">' + esc(b.bill) + ' <span class="cite">· effective ' + esc(b.effective) + '</span></div>' +
      '<div class="sub clamp">' + esc(b.caption.replace(/^Relating to (the )?/, '').replace(/^./, c => c.toUpperCase())) + '</div></div>' + CHEV + '</a>';
  }

  function renderBillTopics() {
    setTitle('HB/SB', false);
    const topics = D.billTopics || [];
    view.innerHTML =
      '<p class="muted" style="margin:4px 4px 12px">House (HB) and Senate (SB) bills from the 89th Texas Legislature (2025) that changed the laws officers enforce, each linked to the official bill on Texas Legislature Online. Summaries are simplified study notes, not legal advice; read the bill and follow your agency and prosecutor.</p>' +
      '<div class="list">' +
      '<a class="row" href="#/bills/t/all"><div class="main"><div class="title">All bills</div></div><span class="count">' + store.billsIn('').length + '</span>' + CHEV + '</a>' +
      topics.map((t, i) => '<a class="row" href="#/bills/t/' + i + '"><div class="main"><div class="title">' + esc(t) + '</div></div>' +
        '<span class="count">' + store.billsIn(t).length + '</span>' + CHEV + '</a>').join('') + '</div>';
  }

  function renderBillList(ti) {
    const topic = ti === 'all' ? '' : (D.billTopics || [])[+ti];
    if (topic === undefined) return renderNotFound();
    setTitle(topic || 'All bills', true);
    const list = store.billsIn(topic);
    // Grouped by session: the Regular Session first, then the called sessions.
    const sessions = [...new Set(list.map(b => b.sessionName))].sort((x, y) => /Regular/.test(y) - /Regular/.test(x) || x.localeCompare(y));
    view.innerHTML = sessions.map(name => '<div class="section-label">' + esc(name) + '</div><div class="list">' +
      list.filter(b => b.sessionName === name).map(billRow).join('') + '</div>').join('');
  }

  function renderBill(id) {
    const b = store.billById.get(id);
    if (!b) return renderNotFound();
    setTitle(b.bill, true);
    const related = (b.rel || []).map(r => store.byId.get(r)).filter(Boolean);
    view.innerHTML =
      (b.note ? '<div class="warning"><strong>Note</strong>' + esc(b.note) + '</div>' : '') +
      '<div class="card detail-head"><h2>' + esc(b.bill) + '</h2>' +
        '<div class="meta">' + esc(b.sessionName) + ' · Author: ' + esc(b.author) + '</div>' +
        '<div class="meta">Effective ' + esc(b.effective) + '</div>' +
        '<div class="pill-row">' + b.topics.map(t => '<span class="pill lv-other">' + esc(t) + '</span>').join('') + '</div></div>' +
      '<div class="card"><h3>What it changed</h3><p>' + esc(b.summary) + '</p></div>' +
      (b.patrol ? '<div class="card notes"><h3>For patrol</h3><p>' + esc(b.patrol) + '</p></div>' : '') +
      '<div class="card"><h3>Statutes changed</h3><p>' + esc(b.changes.join(' · ')) + '</p></div>' +
      '<div class="card"><h3>Official caption</h3><p class="muted">' + esc(b.caption) + '</p></div>' +
      (related.length ? '<div class="section-label">Related statutes</div><div class="list">' + related.map(entryRow).join('') + '</div>' : '') +
      '<div class="actions">' +
        '<button class="secondary-btn" data-action="save-bill" data-id="' + esc(b.id) + '">' + (state.savedBills.includes(b.id) ? '★ Saved' : '☆ Save') + '</button>' +
        '<a class="secondary-btn" href="' + esc(b.url) + '" target="_blank" rel="noopener">Bill history ↗</a>' +
        '<a class="secondary-btn" href="' + esc(b.textUrl) + '" target="_blank" rel="noopener">Final bill text ↗</a></div>' +
      '<p class="muted">Links go to Texas Legislature Online (capitol.texas.gov). The final bill text shows added language underlined and deleted language struck through. Study summary only; not legal advice.</p>';
  }

  function renderDetail(id) {
    const o = store.byId.get(id);
    if (!o) return renderNotFound();
    setTitle(store.citation(o), true);
    const isSaved = state.saved.includes(id);
    const tiers = o.tiers.map((t, i) =>
      '<div class="tier">' +
      '<button class="level-btn" data-level="' + esc(t.group) + '" aria-label="What does ' + esc(t.level) + ' mean?">' + pill(t.group, t.level) + '</button>' +
      '<div class="when">' + esc(t.when) + '</div>' +
      (t.extra ? '<div class="extra">' + esc(t.extra) + '</div>' : '') +
      '<button class="text-btn tcite" data-cite="' + esc(t.cite) + '">' + esc(t.cite) + '</button>' +
      '</div>').join('');
    const terms = o.aliases.concat(o.terms || []);
    const cases = store.casesFor(id);
    const bills = store.billsFor(id);
    view.innerHTML =
      (o.warning ? '<div class="warning"><strong>Warning</strong>' + esc(o.warning) + '</div>' : '') +
      '<div class="card detail-head">' +
        '<h2>' + esc(o.name) + '</h2>' +
        '<div class="meta">' + esc(o.codeName) + ' § ' + esc(o.section) + ' · ' + esc(o.chapter) + '</div>' +
        '<span class="status' + (o.status === 'Verified' ? ' verified' : '') + '">' + (o.status === 'Verified' ? 'Verified ' + esc(o.verifiedOn) : 'Not yet proofread') + '</span>' +
      '</div>' +
      '<div class="card"><h3>' + (o.type === 'related' ? 'What it says' : 'What it is') + '</h3><p class="summary">' + esc(o.summary) + '</p></div>' +
      (o.tiers.length ? '<div class="card"><h3>Punishment</h3>' + tiers + '</div>' : '') +
      (o.notes ? '<div class="card notes"><h3>Notes</h3><p>' + esc(o.notes) + '</p></div>' : '') +
      (cases.length ? '<div class="section-label">Related case law</div><div class="list">' + cases.map(caseRow).join('') + '</div>' : '') +
      (bills.length ? '<div class="section-label">Changed by (2025 bills)</div><div class="list">' + bills.map(billRow).join('') + '</div>' : '') +
      (terms.length ? '<div class="card"><h3>Also searched as</h3><div class="terms">' + esc(terms.join(' · ')) + '</div></div>' : '') +
      '<div class="card"><details class="statute" id="statute"><summary>Full statute text</summary><div id="statute-body" class="muted">Loading…</div></details></div>' +
      '<div class="actions">' +
        '<button class="secondary-btn" data-action="save" data-id="' + esc(id) + '">' + (isSaved ? '★ Saved' : '☆ Save') + '</button>' +
        '<a class="secondary-btn" href="' + esc(o.url) + '" target="_blank" rel="noopener">Official text ↗</a>' +
      '</div>' +
      '<p class="muted">Last amended ' + esc(o.lastAmended || 'n/a') + '. ' + esc(o.currentThrough) + '.</p>';
    $('#statute').addEventListener('toggle', e => { if (e.target.open) showStatute(id, pendingCite); pendingCite = null; });
  }

  // A citation tapped before the statute text was opened, highlighted once the text loads.
  let pendingCite = null;

  // Loads the full statute text on demand (it is large) and shows it.
  let statutePromise = null;
  function loadStatutes() {
    if (window.STATUTE_TEXT) return Promise.resolve(window.STATUTE_TEXT);
    if (!statutePromise) {
      statutePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'data/statutes.js';
        s.onload = () => resolve(window.STATUTE_TEXT);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return statutePromise;
  }
  function showStatute(id, cite) {
    return loadStatutes().then(all => {
      const body = $('#statute-body');
      if (!body) return;
      const s = all[id];
      if (!s) { body.textContent = 'Statute text not available.'; return; }
      body.className = '';
      body.innerHTML = '<div class="statute-text">' + s.text.split('\n').map(line => {
        const m = line.match(/^\(([a-z](?:-\d+)?)\)/);
        return '<div' + (m ? ' data-sub="' + m[1] + '"' : '') + '>' + esc(line) + '</div>';
      }).join('') + '</div><div class="history">' + esc(s.history) + '</div>';
      if (cite) highlight(cite);
    });
  }
  // Opens the statute text and scrolls to the subsection a tier cites, e.g. "PC 49.04(d)".
  function highlight(cite) {
    const sub = (cite.match(/\(([a-z](?:-\d+)?)\)/) || [])[1];
    document.querySelectorAll('.statute-text mark').forEach(m => m.replaceWith(...m.childNodes));
    const line = sub && document.querySelector('.statute-text [data-sub="' + sub + '"]');
    if (line) {
      line.innerHTML = '<mark>' + line.innerHTML + '</mark>';
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderSaved() {
    setTitle('Saved', false);
    const entries = state.saved.map(id => store.byId.get(id)).filter(Boolean);
    // Four buttons at the top switch between saved criminal offenses, Criminal Code
    // (Code of Criminal Procedure) entries, case law, and House and Senate bills.
    const lists = {
      offenses: { label: 'Criminal Offenses', items: entries.filter(o => o.code !== 'CR'), row: entryRow, what: 'offense' },
      code: { label: 'Criminal Code', items: entries.filter(o => o.code === 'CR'), row: entryRow, what: 'Criminal Code entry' },
      cases: { label: 'Case Law', items: state.savedCases.map(id => store.caseById.get(id)).filter(Boolean), row: caseRow, what: 'case' },
      bills: { label: 'HB/SB', items: state.savedBills.map(id => store.billById.get(id)).filter(Boolean), row: billRow, what: 'bill' },
    };
    const current = lists[state.savedView] ? state.savedView : 'offenses';
    const toggle = '<div class="seg-grid saved-switch">' + Object.entries(lists).map(([k, l]) =>
      '<button class="chip" data-saved-view="' + k + '" aria-pressed="' + (k === current) + '">' + l.label + '<span class="n">' + l.items.length + ' saved</span></button>').join('') + '</div>';
    const l = lists[current];
    view.innerHTML = toggle + (l.items.length ? '<div class="list">' + l.items.map(l.row).join('') + '</div>'
      : '<div class="empty">Tap ☆ Save on any ' + l.what + ' to keep it here. Saved items stay on this phone only.</div>');
  }

  function renderLevels() {
    setTitle('Punishment ranges', true);
    view.innerHTML = '<div class="list">' + D.levels.map(l =>
      '<div class="row"><div class="main"><div class="title">' + pill(l.level, l.level) + '</div>' +
      '<div class="sub">' + esc(l.confinement) + ' · Fine: ' + esc(l.fine) + ' · ' + esc(l.authority) + '</div></div></div>').join('') + '</div>' +
      '<p class="muted">Repeat-offender, hate crime, disaster area, and other enhancements are under Penal Code › Title 3. Punishments.</p>';
  }

  // Study mode: flash cards in four sections that match the main modules: Criminal Offenses,
  // Criminal Code, Case Law, and HB/SB. Every section has an "All" deck (random cards) and a
  // Saved deck (the items saved in that section of the Saved tab, newest first). Criminal
  // Offenses also has the two "start here" decks (most common arrests and citations) and a
  // random deck for each code. Ordered decks remember where you left off on this device.
  const COMMON = D.common || { arrests: [], citations: [] };
  const arrestCount = new Map(COMMON.arrests.map(a => [a.id, a.count]));
  const pick = list => list[Math.floor(Math.random() * list.length)] || null;
  const savedEntries = test => () => state.saved.filter(id => { const o = store.byId.get(id); return o && test(o); });
  const savedHint = what => 'Nothing saved here yet. Tap ☆ Save on any ' + what + ' and it will show up in this deck.';
  const STUDY = {
    offenses: {
      label: 'Criminal Offenses',
      decks: {
        '': { label: 'All' },
        arrests: { label: 'Top Arrests', ids: () => COMMON.arrests.map(a => a.id), list: '#/study/list/arrests',
          intro: 'Start here: the 40 offenses with the most arrests in Texas' },
        citations: { label: 'Common Citations', ids: () => COMMON.citations, list: '#/study/list/citations',
          intro: 'Start here: the traffic and Class C offenses officers cite most' },
        // Only offenses: Criminal Code entries have their own section.
        saved: { label: 'Saved', ids: savedEntries(o => o.type === 'offense' && o.code !== 'CR'), list: '#/saved',
          intro: 'Your saved offenses, newest first', empty: savedHint('offense') },
      },
      codeDecks: true,
      get: id => store.byId.get(id),
      random: code => store.randomOffense(code, state.levels),
      card: offenseCard,
    },
    code: {
      label: 'Criminal Code',
      decks: {
        '': { label: 'All' },
        saved: { label: 'Saved', ids: savedEntries(o => o.code === 'CR'), list: '#/saved',
          intro: 'Your saved Criminal Code entries, newest first', empty: savedHint('Criminal Code entry') },
      },
      get: id => store.byId.get(id),
      random: () => pick(D.offenses.filter(o => o.code === 'CR')),
      card: codeCard,
    },
    cases: {
      label: 'Case Law',
      decks: {
        '': { label: 'All' },
        saved: { label: 'Saved', ids: () => state.savedCases.filter(id => store.caseById.has(id)), list: '#/saved',
          intro: 'Your saved cases, newest first', empty: savedHint('case') },
      },
      get: id => store.caseById.get(id),
      random: () => pick(D.cases || []),
      card: caseCard,
    },
    bills: {
      label: 'HB/SB',
      decks: {
        '': { label: 'All' },
        saved: { label: 'Saved', ids: () => state.savedBills.filter(id => store.billById.has(id)), list: '#/saved',
          intro: 'Your saved bills, newest first', empty: savedHint('bill') },
      },
      get: id => store.billById.get(id),
      random: () => pick(D.bills || []),
      card: billCard,
    },
  };
  let studySection = STUDY[load('studySection', 'offenses')] ? load('studySection', 'offenses') : 'offenses';
  const studyDeck = { offenses: 'arrests', code: '', cases: '', bills: '' }; // chosen deck in each section
  let studyCard = null;
  const studyPos = load('studyPos', {});
  // Where an ordered deck was left. Criminal Offenses keeps its original keys ("arrests").
  const posKey = () => (studySection === 'offenses' ? '' : studySection + ':') + studyDeck[studySection];

  function renderStudy(reveal) {
    setTitle('Study', false);
    const sec = STUDY[studySection];
    const key = studyDeck[studySection];
    const deck = sec.decks[key];
    const ordered = deck && deck.ids; // "All" and the code decks are random
    const ids = ordered ? deck.ids() : [];
    if (!studyCard) {
      if (ordered) {
        const i = ids.length ? (studyPos[posKey()] || 0) % ids.length : 0;
        studyCard = { item: ids.length ? sec.get(ids[i]) : null, pos: i };
      } else {
        studyCard = { item: sec.random(key) };
      }
    }
    const item = studyCard.item;
    const chip = (attr, current) => ([k, n]) => '<button class="chip" ' + attr + '="' + k + '" aria-pressed="' + (k === current) + '">' + esc(n) + '</button>';
    const sections = '<div class="seg-grid study-sections">' +
      Object.entries(STUDY).map(([k, x]) => [k, x.label]).map(chip('data-study-section', studySection)).join('') + '</div>';
    const deckList = Object.entries(sec.decks).map(([k, d]) => [k, d.label]);
    const deckButtons = '<div class="seg-grid decks' + (deckList.length === 2 ? ' two' : '') + '">' + deckList.map(chip('data-study-code', key)).join('') + '</div>' +
      (sec.codeDecks ? '<div class="seg-grid">' + D.tree.filter(c => c.code !== 'CR').map(c => [c.code, c.name.replace(/ Code$/, '')]).map(chip('data-study-code', key)).join('') + '</div>' : '');
    const deckInfo = ordered && item
      ? '<div class="study-intro"><strong>' + esc(deck.intro) + '</strong>' +
        '<span>Card ' + (studyCard.pos + 1) + ' of ' + ids.length + ' · <a href="' + deck.list + '">See the full list</a></span></div>'
      : '';
    const empty = '<div class="empty">' + esc(deck && deck.empty ? deck.empty : studySection === 'offenses' ? 'No offenses match this filter.' : 'Nothing to study here yet.') + '</div>';
    view.innerHTML = sections + (studySection === 'offenses' && !ordered ? filterNote() : '') + deckButtons + deckInfo +
      (item ? '<div class="card flash">' + sec.card(item, reveal) + '</div>' +
        '<button class="primary-btn" data-action="' + (reveal ? 'study-next' : 'study-reveal') + '">' + (reveal ? 'Next card' : 'Show answer') + '</button>' +
        (ordered ? '<div class="study-nav"><button class="text-btn" data-action="study-prev">‹ Previous card</button>' +
          (reveal ? '' : '<button class="text-btn" data-action="study-next">Skip ›</button>') + '</div>' : '')
        : empty);
  }

  // One flash card for each section: the question, then the answer once revealed.
  function offenseCard(o, reveal) {
    const rank = studyDeck.offenses === 'arrests' && arrestCount.has(o.id)
      ? '<div class="muted">#' + (studyCard.pos + 1) + ' in Texas arrests · ' + arrestCount.get(o.id).toLocaleString() + ' in 2025</div>' : '';
    return '<div class="cite">' + esc(store.citation(o)) + '</div><div class="q">' + esc(o.name) + '</div>' + rank +
      '<div class="muted">What is the punishment level?</div>' +
      (reveal ? '<div class="answer">' + levelPills(o) + '<p>' + esc(o.summary) + '</p>' +
        o.tiers.slice(0, 6).map(t => '<div class="tier">' + pill(t.group, t.level) + '<div class="when">' + esc(t.when) + '</div></div>').join('') +
        '<a href="#/o/' + encodeURIComponent(o.id) + '">Open full entry</a></div>' : '');
  }
  function codeCard(o, reveal) {
    return '<div class="cite">' + esc(store.citation(o)) + '</div><div class="q">' + esc(o.name) + '</div>' +
      '<div class="muted">What does this provision say?</div>' +
      (reveal ? '<div class="answer"><p>' + esc(o.summary) + '</p>' + (o.notes ? '<h4>Notes</h4><p>' + esc(o.notes) + '</p>' : '') +
        '<a href="#/o/' + encodeURIComponent(o.id) + '">Open full entry</a></div>' : '');
  }
  function caseCard(c, reveal) {
    return '<div class="cite">' + esc(c.cite) + ' (' + c.year + ') · ' + COURT_NAME[c.court] + '</div><div class="q">' + esc(c.name) + '</div>' +
      '<div class="muted">What did the court hold?</div>' +
      (reveal ? '<div class="answer"><h4>Holding</h4><p>' + esc(c.held) + '</p><h4>For patrol</h4><p>' + esc(c.patrol) + '</p>' +
        '<a href="#/case/' + encodeURIComponent(c.id) + '">Open full case</a></div>' : '');
  }
  function billCard(b, reveal) {
    return '<div class="cite">' + esc(b.sessionName) + '</div><div class="q">' + esc(b.bill) + '</div>' +
      '<div class="pill-row" style="justify-content:center">' + b.topics.map(t => '<span class="pill lv-other">' + esc(t) + '</span>').join('') + '</div>' +
      '<div class="muted">What did this bill change?</div>' +
      (reveal ? '<div class="answer"><p>' + esc(b.summary) + '</p>' + (b.patrol ? '<h4>For patrol</h4><p>' + esc(b.patrol) + '</p>' : '') +
        '<p class="muted">Effective ' + esc(b.effective) + '</p><a href="#/bill/' + encodeURIComponent(b.id) + '">Open full bill summary</a></div>' : '');
  }

  // Moves through an ordered deck and remembers the position on this device.
  function stepStudy(delta) {
    const deck = STUDY[studySection].decks[studyDeck[studySection]];
    const n = deck && deck.ids ? deck.ids().length : 0;
    if (n) {
      studyPos[posKey()] = ((studyCard ? studyCard.pos : 0) + delta + n) % n;
      save('studyPos', studyPos);
    }
    studyCard = null;
    renderStudy(false);
  }

  // The full ranked list for a "start here" deck.
  function renderStudyList(key) {
    const deck = ['arrests', 'citations'].includes(key) && STUDY.offenses.decks[key];
    if (!deck) return renderNotFound();
    setTitle(deck.label, true);
    const rows = deck.ids().map((id, i) => {
      const o = store.byId.get(id);
      return '<a class="row" href="#/o/' + encodeURIComponent(id) + '"><span class="rank">' + (i + 1) + '</span><div class="main">' +
        '<div class="title">' + esc(o.name) + '</div>' +
        '<div class="cite">' + esc(store.citation(o)) + (key === 'arrests' ? ' · ' + arrestCount.get(id).toLocaleString() + ' arrests in 2025' : '') + '</div>' +
        levelPills(o) + '</div>' + CHEV + '</a>';
    }).join('');
    view.innerHTML =
      '<p class="muted" style="margin:4px 4px 12px">' + (key === 'arrests'
        ? 'Ranked by statewide arrests in 2025 (adult and juvenile), from Texas Department of Public Safety criminal history records. These counts mostly leave out Class C citations.'
        : 'Traffic and Class C offenses officers write most often. Texas does not publish a statewide count of citations by offense, so this list is not ranked.') + '</p>' +
      '<div class="list">' + rows + '</div>' +
      '<div class="actions"><a class="secondary-btn" href="#/study">Study these as flash cards</a></div>';
  }

  // The About and disclaimer content. Shown in the start-up disclaimer popup (which must be
  // acknowledged before use) and on the About & Disclaimer page reached from Browse.
  function aboutHtml() {
    const verified = D.offenses.filter(o => o.status === 'Verified').length;
    return '<div class="card"><h3>Not legal advice</h3><p>This is a study and quick-reference tool for Texas peace officers. It is not legal advice and is not a substitute for the advice of an attorney, your prosecutor, or your department\'s policy. Always confirm against the current statute text.</p></div>' +
      '<div class="card"><h3>About the data</h3><p>' + D.offenses.length + ' entries (' + D.offenses.filter(o => o.type === 'offense').length + ' offenses). Statute text from the Texas Legislature, downloaded ' + esc(D.statutesDownloaded) + '. Data built ' + esc(D.builtOn) + '.</p>' +
        '<p>Proofread and verified: ' + verified + ' of ' + D.offenses.length + '.' + (D.release ? '' : ' <strong>This is a development build: entries marked “Not yet proofread” were written by AI from the statute text and have not been checked by a person.</strong>') + '</p></div>' +
      '<div class="card"><h3>Privacy</h3><p>No account, no tracking, and no data leaves your phone. Saved items and settings are stored only on this device.</p></div>' +
      '<div class="card"><h3>Codes included</h3><p>' + D.tree.map(c => esc(c.name)).join(', ') + '.</p></div>' +
      '<div class="card"><h3>Case law</h3><p>' + (D.cases || []).length + ' decisions of the U.S. Supreme Court and the Texas Court of Criminal Appeals, linked to the Library of Congress, supremecourt.gov, and search.txcourts.gov.</p></div>' +
      '<div class="card"><h3>House and Senate bills</h3><p>' + (D.bills || []).length + ' bills from the 89th Texas Legislature (2025) that changed laws officers enforce, linked to Texas Legislature Online (capitol.texas.gov).</p></div>';
  }

  function renderAbout() {
    setTitle('About & Disclaimer', true);
    view.innerHTML = aboutHtml() +
      '<div class="card"><h3>Terms of Use</h3><p><a href="#/terms">Read the Terms of Use</a> (version ' + esc(T.TERMS_VERSION) +
        (termsAccepted() ? ', acknowledged ' + esc(load('terms', {}).acceptedOn) : '') + ')</p></div>';
  }

  function renderTerms() {
    setTitle('Terms of Use', true);
    view.innerHTML = '<div class="card terms-text">' + T.TEXT + '</div>';
  }

  function renderNotFound() {
    setTitle('Not found', true);
    view.innerHTML = '<div class="empty">That page was not found. <a href="#/">Go to Browse</a></div>';
  }

  // Footer at the bottom of every module, with a link to About & Disclaimer.
  const pageFooter = $('#page-footer');
  pageFooter.innerHTML = 'Statutes current as downloaded ' + esc(D.statutesDownloaded) + '. Not legal advice.<br>' +
    '<a href="#/about">Click here to review About and Disclaimer</a>';

  // ---- Router --------------------------------------------------------------------------------

  function route() {
    const hash = location.hash || '#/';
    const parts = hash.slice(2).split('/').map(decodeURIComponent);
    const q = searchInput.value.trim();
    const isCriminalCode = parts[0] === 'code' || (parts[0] === 'c' && parts[1] === 'CR') || (parts[0] === 'o' && /^CCP-/.test(parts[1] || ''));
    const activeTab = isCriminalCode ? 'code' : parts[0] === 'case' ? 'cases' : parts[0] === 'bill' ? 'bills' : ['cases', 'bills', 'study', 'saved'].includes(parts[0]) ? parts[0] : 'offenses';
    document.querySelectorAll('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.tab === activeTab));
    // Footer only on the main page of each module, not on pages opened from them or on search results.
    const isModuleHome = (!parts[0] && !q) || parts[0] === 'code' || (parts[0] === 'c' && parts[1] === 'CR' && parts.length === 2) ||
      (['cases', 'bills', 'study', 'saved'].includes(parts[0]) && parts.length === 1);
    pageFooter.hidden = !isModuleHome;
    if (q && (parts[0] === '' || parts[0] === 'search')) return renderSearch(q);
    if (parts[0] === '' || parts[0] === undefined) return renderCodes();
    if (parts[0] === 'code' || (parts[0] === 'c' && parts[1] === 'CR' && parts.length === 2)) return renderCriminalCode();
    if (parts[0] === 'c' && parts.length === 2) return renderCode(parts[1]);
    if (parts[0] === 'c' && parts[2] === 'g' && parts.length === 4) return renderGroup(parts[1], +parts[3]);
    if (parts[0] === 'c' && parts[4] === 'ch') return renderChapter(parts[1], +parts[3], +parts[5]);
    if (parts[0] === 'o') return renderDetail(parts.slice(1).join('/'));
    if (parts[0] === 'saved') return renderSaved();
    if (parts[0] === 'study' && parts[1] === 'list') return renderStudyList(parts[2]);
    if (parts[0] === 'study') return renderStudy(false);
    if (parts[0] === 'levels') return renderLevels();
    if (parts[0] === 'about') return renderAbout();
    if (parts[0] === 'terms') return renderTerms();
    if (parts[0] === 'cases' && parts.length === 1) return renderCaseTopics();
    if (parts[0] === 'cases' && parts[1] === 't') return renderCaseList(parts[2]);
    if (parts[0] === 'case') return renderCase(parts[1]);
    if (parts[0] === 'bills' && parts.length === 1) return renderBillTopics();
    if (parts[0] === 'bills' && parts[1] === 't') return renderBillList(parts[2]);
    if (parts[0] === 'bill') return renderBill(parts[1]);
    renderNotFound();
  }

  function rerender() {
    const top = window.scrollY;
    route();
    window.scrollTo(0, top);
  }

  // ---- Events --------------------------------------------------------------------------------

  window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });
  function goBack() { if (history.length > 1) history.back(); else location.hash = '#/'; }
  $('#back').addEventListener('click', goBack);

  // Swipe gestures: swipe left to right to go back, right to left to go forward.
  // A swipe must be mostly sideways, at least 70px, and quick. Ignored while the disclaimer or
  // filter sheet is open. In the Safari browser (not the Home Screen app), swipes that start at
  // the left edge are left to Safari's own back gesture so the page does not go back twice.
  let swipe = null;
  const swipeHint = document.createElement('div');
  swipeHint.className = 'swipe-hint';
  swipeHint.setAttribute('aria-hidden', 'true');
  document.body.appendChild(swipeHint);
  document.addEventListener('touchstart', e => {
    swipe = null;
    if (e.touches.length !== 1 || !$('#disclaimer').hidden || !$('#filter-sheet').hidden) return;
    if (e.target.closest('input, textarea, select, .statute-text')) return;
    const t = e.touches[0];
    if (!navigator.standalone && t.clientX < 24) return;
    swipe = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (!swipe) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipe.x;
    const dy = t.clientY - swipe.y;
    const quick = Date.now() - swipe.time < 700;
    swipe = null;
    if (!quick || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2) return;
    swipeHint.textContent = dx > 0 ? '‹' : '›';
    swipeHint.className = 'swipe-hint show ' + (dx > 0 ? 'left' : 'right');
    setTimeout(() => { swipeHint.className = 'swipe-hint'; }, 350);
    if (dx > 0) goBack(); else history.forward();
  }, { passive: true });
  document.addEventListener('touchcancel', () => { swipe = null; }, { passive: true });

  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (searchInput.value.trim() && location.hash !== '#/' && location.hash !== '') location.hash = '#/';
      else route();
    }, 120);
  });
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchInput.blur(); });

  view.addEventListener('click', e => {
    const t = e.target.closest('[data-action], [data-level], [data-cite], [data-study-code], [data-study-section], [data-saved-view]');
    if (!t) return;
    if (t.dataset.action === 'save') {
      const id = t.dataset.id;
      state.saved = state.saved.includes(id) ? state.saved.filter(x => x !== id) : [id].concat(state.saved);
      save('saved', state.saved);
      t.textContent = state.saved.includes(id) ? '★ Saved' : '☆ Save';
    } else if (t.dataset.action === 'save-case') {
      const id = t.dataset.id;
      state.savedCases = state.savedCases.includes(id) ? state.savedCases.filter(x => x !== id) : [id].concat(state.savedCases);
      save('savedCases', state.savedCases);
      t.textContent = state.savedCases.includes(id) ? '★ Saved' : '☆ Save';
    } else if (t.dataset.action === 'save-bill') {
      const id = t.dataset.id;
      state.savedBills = state.savedBills.includes(id) ? state.savedBills.filter(x => x !== id) : [id].concat(state.savedBills);
      save('savedBills', state.savedBills);
      t.textContent = state.savedBills.includes(id) ? '★ Saved' : '☆ Save';
    } else if (t.dataset.savedView) {
      state.savedView = t.dataset.savedView;
      save('savedView', state.savedView);
      renderSaved();
    } else if (t.dataset.action === 'clear-filter') {
      setLevels([]);
    } else if (t.dataset.action === 'study-reveal') {
      renderStudy(true);
    } else if (t.dataset.action === 'study-next') {
      stepStudy(1);
    } else if (t.dataset.action === 'study-prev') {
      stepStudy(-1);
    } else if (t.dataset.studyCode !== undefined) {
      studyDeck[studySection] = t.dataset.studyCode; studyCard = null; renderStudy(false);
    } else if (t.dataset.studySection) {
      studySection = t.dataset.studySection; save('studySection', studySection); studyCard = null; renderStudy(false);
    } else if (t.dataset.level) {
      showLevelInfo(t.dataset.level);
    } else if (t.dataset.cite) {
      const d = $('#statute');
      if (d && !d.open) {
        pendingCite = t.dataset.cite;
        d.open = true; // the toggle handler loads the text and highlights the subsection
      } else if (d) {
        highlight(t.dataset.cite);
      }
    }
  });

  let infoTimer = null;
  function showLevelInfo(group) {
    const info = store.levelInfo(group);
    if (!info) return;
    let box = $('.levelinfo');
    if (!box) { box = document.createElement('div'); box.className = 'levelinfo'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    box.innerHTML = '<strong>' + esc(info.level) + '</strong>' + esc(info.confinement) + '. Fine: ' + esc(info.fine) + '. (' + esc(info.authority) + ')';
    clearTimeout(infoTimer);
    infoTimer = setTimeout(() => box.remove(), 5000);
    box.onclick = () => box.remove();
  }

  // Filter sheet.
  const sheet = $('#filter-sheet');
  const backdrop = $('#sheet-backdrop');
  function openSheet(open) { sheet.hidden = !open; backdrop.hidden = !open; if (open) renderChips(); }
  function renderChips() {
    $('#filter-chips').innerHTML = L.LEVEL_ORDER.map(g =>
      '<button class="chip" data-g="' + esc(g) + '" aria-pressed="' + state.levels.includes(g) + '">' + esc(g) + '</button>').join('');
  }
  function setLevels(levels) {
    state.levels = levels;
    save('levels', levels);
    const badge = $('#filter-count');
    badge.hidden = !levels.length;
    badge.textContent = levels.length;
    rerender();
  }
  $('#filter-btn').addEventListener('click', () => openSheet(true));
  $('#filter-done').addEventListener('click', () => openSheet(false));
  backdrop.addEventListener('click', () => openSheet(false));
  $('#filter-clear').addEventListener('click', () => { setLevels([]); renderChips(); });
  $('#filter-chips').addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    const g = c.dataset.g;
    setLevels(state.levels.includes(g) ? state.levels.filter(x => x !== g) : state.levels.concat(g));
    renderChips();
  });

  // Start-up disclaimer popup (About content, warning, and Terms of Use). It must be acknowledged
  // before the app can be used, and again whenever TERMS_VERSION changes. The acknowledgment is
  // stored only on this device.
  function termsAccepted() {
    return load('terms', {}).version === T.TERMS_VERSION;
  }
  function showDisclaimer() {
    $('#disclaimer-summary').innerHTML = T.SUMMARY.map(s => '<li>' + s + '</li>').join('');
    $('#disclaimer-about').innerHTML = aboutHtml();
    $('#disclaimer-terms').innerHTML = T.TEXT;
    $('#disclaimer').hidden = false;
    document.body.classList.add('locked');
  }
  const ackBox = $('#disclaimer-agree');
  const ackBtn = $('#disclaimer-ok');
  ackBox.addEventListener('change', () => {
    ackBtn.disabled = !ackBox.checked;
    $('#disclaimer-hint').hidden = ackBox.checked;
  });
  ackBtn.addEventListener('click', () => {
    if (!ackBox.checked) return;
    save('terms', { version: T.TERMS_VERSION, acceptedOn: new Date().toISOString().slice(0, 10) });
    $('#disclaimer').hidden = true;
    document.body.classList.remove('locked');
  });
  if (!termsAccepted()) showDisclaimer();

  // Offline support when served over http(s) (not when opened as a local file).
  // Skipped on localhost so code changes show up immediately while developing.
  if ('serviceWorker' in navigator && location.protocol.startsWith('http') && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  setLevels(state.levels);
})();
