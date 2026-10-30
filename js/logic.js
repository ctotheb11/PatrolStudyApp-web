// Data logic for the app: search, filters, and lookups. No DOM code here, so this file can be
// reused unchanged when the app is rebuilt for iPhone (React Native / Expo).

(function (root) {
  // Display order and short labels for the punishment-level filter.
  const LEVEL_ORDER = [
    'Capital Felony', 'First Degree Felony', 'Second Degree Felony', 'Third Degree Felony', 'State Jail Felony',
    'Class A Misdemeanor', 'Class B Misdemeanor', 'Class C Misdemeanor', 'Fine Only',
    'Other Misdemeanor Penalty', 'Depends on Another Offense',
  ];
  const LEVEL_SHORT = {
    'Capital Felony': 'Capital', 'First Degree Felony': '1st Deg', 'Second Degree Felony': '2nd Deg',
    'Third Degree Felony': '3rd Deg', 'State Jail Felony': 'SJF', 'Class A Misdemeanor': 'Class A',
    'Class B Misdemeanor': 'Class B', 'Class C Misdemeanor': 'Class C', 'Fine Only': 'Fine only',
    'Other Misdemeanor Penalty': 'Other misd.', 'Depends on Another Offense': 'Varies',
  };
  // Citation prefix for each code, used in titles like "PC 49.04".
  const CODE_ABBR = { PE: 'PC', TN: 'TC', HS: 'HSC', AL: 'ABC', CR: 'CCP', FA: 'FC', OC: 'OC', GV: 'GC' };

  function create(data) {
    const byId = new Map(data.offenses.map(o => [o.id, o]));
    const index = data.offenses.map(o => ({
      o,
      name: norm(o.name),
      aliases: norm(o.aliases.join(' ')),
      terms: (o.terms || []).map(norm),
      body: norm([o.summary, o.notes, o.chapter, o.tiers.map(t => t.when).join(' ')].join(' ')),
      section: o.section,
    }));

    // The most serious level of an entry, for sorting and color.
    function topLevel(o) {
      let best = null;
      for (const g of o.levels) if (best === null || LEVEL_ORDER.indexOf(g) < LEVEL_ORDER.indexOf(best)) best = g;
      return best;
    }

    // Entries matching every selected level (an entry matches a level if any tier has it).
    function matchesLevels(o, levels) {
      return !levels || !levels.length || levels.some(l => o.levels.includes(l));
    }

    // Search by section number ("49.04", "PC 49.04", "§ 49.04"), name, "also cited as" names,
    // summary, and tier text. Returns entries best match first.
    function search(query, opts) {
      const q = norm(query);
      if (!q) return [];
      const sec = (query.match(/\d+[A-Z]?\.\d+[A-Za-z]?/) || [])[0];
      const words = q.split(' ').filter(Boolean);
      const results = [];
      for (const item of index) {
        if (opts && opts.code && item.o.code !== opts.code) continue;
        if (opts && !matchesLevels(item.o, opts.levels)) continue;
        let score = 0;
        if (sec && item.section === sec) score += 100;
        else if (sec && item.section.startsWith(sec)) score += 40;
        if (item.name === q) score += 80;
        else if (item.name.startsWith(q)) score += 50;
        else if (item.name.includes(q)) score += 35;
        if (hasWords(item.aliases, q)) score += 30;
        if (item.terms.some(t => t === q)) score += 90;
        else if (q.length >= 3 && item.terms.some(t => hasWords(t, q))) score += 45;
        const all = item.name + ' ' + item.aliases + ' ' + item.terms.join(' ') + ' ' + item.body;
        if (words.every(w => hasWords(all, w))) {
          score += 10 + words.filter(w => hasWords(item.name, w)).length * 5 + words.filter(w => hasWords(item.aliases, w)).length * 3;
        }
        if (score) results.push({ o: item.o, score });
      }
      results.sort((a, b) => b.score - a.score || (a.o.type === 'related') - (b.o.type === 'related') || a.o.name.localeCompare(b.o.name));
      return results.map(r => r.o);
    }

    // Entries in a chapter of the browse tree, filtered by level.
    function chapterEntries(chapter, levels) {
      return chapter.ids.map(id => byId.get(id)).filter(o => matchesLevels(o, levels));
    }

    // Counts of entries under a tree node (code, group, or chapter) that match the level filter.
    function countIn(node, levels) {
      const ids = node.ids || (node.chapters || node.groups.flatMap(g => g.chapters)).flatMap(c => c.ids || c.chapters.flatMap(x => x.ids));
      return ids.filter(id => matchesLevels(byId.get(id), levels)).length;
    }

    function citation(o) {
      return (CODE_ABBR[o.code] || o.code) + ' ' + o.section;
    }

    function levelInfo(level) {
      return data.levels.find(l => l.level === level) || null;
    }

    // A random offense (not a related provision) for study mode, optionally limited to a code.
    function randomOffense(code, levels) {
      const pool = data.offenses.filter(o => o.type === 'offense' && (!code || o.code === code) && matchesLevels(o, levels));
      return pool[Math.floor(Math.random() * pool.length)] || null;
    }

    // ---- Case law ----
    const cases = data.cases || [];
    const caseById = new Map(cases.map(c => [c.id, c]));
    const caseIndex = cases.map(c => ({
      c,
      name: norm(c.name),
      all: norm([c.name, c.cite, c.year, c.topics.join(' '), c.facts, c.held, c.patrol].join(' ')),
    }));

    // Cases matching every word of the query, best match (case name) first.
    function searchCases(query) {
      const q = norm(query);
      if (!q) return [];
      const words = q.split(' ').filter(Boolean);
      return caseIndex
        .map(x => ({ c: x.c, score: (x.name.includes(q) ? 50 : 0) + (words.every(w => hasWords(x.all, w)) ? 10 + words.filter(w => hasWords(x.name, w)).length * 5 : 0) }))
        .filter(x => x.score)
        .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name))
        .map(x => x.c);
    }

    // Cases in a topic ('' for all), U.S. Supreme Court first, then newest first.
    function casesIn(topic) {
      return cases.filter(c => !topic || c.topics.includes(topic))
        .sort((a, b) => (a.court === b.court ? 0 : a.court === 'US' ? -1 : 1) || b.year - a.year);
    }

    // Cases that list an offense or provision as related.
    function casesFor(id) {
      return cases.filter(c => (c.rel || []).includes(id));
    }

    return { data, byId, search, chapterEntries, countIn, topLevel, citation, levelInfo, randomOffense, matchesLevels, caseById, searchCases, casesIn, casesFor };
  }

  // True if `phrase` appears in `text` starting at a word boundary ("meth" matches
  // "meth lab" and "methamphetamine" but not "something").
  function hasWords(text, phrase) {
    return (' ' + text).includes(' ' + phrase);
  }

  function norm(s) {
    return String(s || '').toLowerCase().replace(/§/g, ' ').replace(/[^a-z0-9.\- ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const api = { create, LEVEL_ORDER, LEVEL_SHORT, CODE_ABBR, norm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StatuteLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
