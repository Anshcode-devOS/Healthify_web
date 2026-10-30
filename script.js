(function () {
  "use strict";

  /* ================= exercise library ================= */
  // eq: 'bw' = bodyweight/home, 'gym' = needs equipment. t = timed hold (seconds). met = gross metabolic equivalent.
  var EX = {
    push: [
      { n: "Dumbbell bench press", met: 5, eq: "gym" }, { n: "Overhead dumbbell press", met: 5, eq: "gym" },
      { n: "Cable triceps pushdown", met: 4, eq: "gym" }, { n: "Lateral raises", met: 3.8, eq: "gym" },
      { n: "Push-ups", met: 4.5, eq: "bw" }, { n: "Incline push-ups", met: 4, eq: "bw" }, { n: "Pike push-ups", met: 4.5, eq: "bw" },
      { n: "Chair dips", met: 4, eq: "bw" }, { n: "Wide push-ups", met: 4.5, eq: "bw" }, { n: "Diamond push-ups", met: 4.5, eq: "bw" }
    ],
    pull: [
      { n: "Lat pulldown", met: 4.5, eq: "gym" }, { n: "Seated cable row", met: 4.5, eq: "gym" }, { n: "One-arm dumbbell row", met: 4.5, eq: "gym" },
      { n: "Assisted pull-up", met: 5, eq: "gym" }, { n: "Dumbbell biceps curl", met: 3.8, eq: "gym" }, { n: "Face pull", met: 3.8, eq: "gym" },
      { n: "Backpack bent-over row", met: 4.2, eq: "bw" }, { n: "Towel door row", met: 4, eq: "bw" }, { n: "Superman hold", met: 3.5, eq: "bw", t: 30 },
      { n: "Reverse snow angels", met: 3.5, eq: "bw" }, { n: "Backpack biceps curl", met: 3.8, eq: "bw" }, { n: "Prone Y raise", met: 3.5, eq: "bw" }
    ],
    legs: [
      { n: "Leg press", met: 5, eq: "gym" }, { n: "Goblet squat", met: 5.5, eq: "gym" }, { n: "Romanian deadlift", met: 5.5, eq: "gym" },
      { n: "Walking lunges with dumbbells", met: 5.5, eq: "gym" }, { n: "Seated leg curl", met: 4, eq: "gym" }, { n: "Barbell hip thrust", met: 5, eq: "gym" },
      { n: "Bodyweight squat", met: 5, eq: "bw" }, { n: "Reverse lunge", met: 5, eq: "bw" }, { n: "Glute bridge", met: 4, eq: "bw" },
      { n: "Step-ups on a stair", met: 5.5, eq: "bw" }, { n: "Wall sit", met: 4, eq: "bw", t: 40 }, { n: "Calf raise", met: 3.5, eq: "bw" },
      { n: "Bulgarian split squat", met: 5.5, eq: "bw" }
    ],
    core: [
      { n: "Plank", met: 3.8, eq: "bw", t: 30 }, { n: "Dead bug", met: 3.5, eq: "bw" }, { n: "Bicycle crunch", met: 4, eq: "bw" },
      { n: "Lying leg raise", met: 4, eq: "bw" }, { n: "Mountain climbers", met: 6, eq: "bw", t: 30 }, { n: "Russian twist", met: 4, eq: "bw" },
      { n: "Side plank", met: 3.8, eq: "bw", t: 25 }, { n: "Bird dog", met: 3.2, eq: "bw" }
    ],
    cardio: [
      { n: "Treadmill incline walk", met: 5.3, eq: "gym", d: "incline 8–10%, steady pace" }, { n: "Stationary bike", met: 6.8, eq: "gym", d: "moderate resistance" },
      { n: "Rowing machine", met: 7, eq: "gym", d: "steady stroke rate" }, { n: "Stair climber", met: 8, eq: "gym", d: "steady pace" },
      { n: "Treadmill intervals", met: 9, eq: "gym", d: "1 min fast, 1 min easy" },
      { n: "Jumping jacks and high knees", met: 8, eq: "bw", d: "45 s on, 15 s off" }, { n: "Brisk outdoor walk or jog", met: 6.5, eq: "bw", d: "talking pace" },
      { n: "Skipping rope", met: 10, eq: "bw", d: "30 s on, 30 s off" }, { n: "Stair climbing at home", met: 8, eq: "bw", d: "steady pace" }
    ]
  };
  var TEMPL = {
    full: ["legs", "push", "pull", "legs", "core", "push", "pull"],
    upper: ["push", "pull", "push", "pull", "core", "push", "pull"],
    lower: ["legs", "legs", "legs", "core", "legs", "core", "legs"],
    push: ["push", "push", "push", "core", "push", "push", "core"],
    pull: ["pull", "pull", "pull", "core", "pull", "pull", "core"],
    legs: ["legs", "legs", "legs", "legs", "core", "legs", "core"]
  };
  var TNAME = { full: "Full body", upper: "Upper body", lower: "Lower body", push: "Push day", pull: "Pull day", legs: "Legs and glutes" };
  var SPLIT = { 3: ["full", "full", "full"], 4: ["upper", "lower", "upper", "lower"], 5: ["push", "pull", "legs", "upper", "lower"], 6: ["push", "pull", "legs", "push", "pull", "legs"] };
  var DAYS_ON = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };
  var DN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DEF = { sex: "m", age: 28, height: 170, weight: 75, target: 68, goal: "lose", activity: 1.375, level: 1, perWeek: 4, place: "gym" };

  /* ================= state ================= */
  var state = { profile: null, days: {}, tab: "today", date: ymd(new Date()), open: null, mode: "local", setup: false, loading: true };
  var store = { col: null }, timers = {}, chain = {};
  var app = document.getElementById("app");

  /* ================= helpers ================= */
  function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function parse(s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function shift(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function today() { return ymd(new Date()); }
  function widx(s) { return (parse(s).getDay() + 6) % 7; }
  function longDate(s) { return parse(s).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }); }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function r0(n) { return Math.round(n); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function nf(n) { return Math.round(n).toLocaleString("en-IN"); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function day(s) { return state.days[s] || {}; }
  function toast(m) { var t = document.getElementById("toast"); t.textContent = m; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3200); }

  /* ================= body maths ================= */
  function curWeight() {
    var p = state.profile; if (!p) return DEF.weight;
    var s = today();
    for (var i = 0; i < 400; i++) { var w = num(day(s).weight); if (w > 0) return w; s = shift(s, -1); }
    return p.weight;
  }
  function calc() {
    var p = state.profile, w = curWeight();
    var bmr = 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === "m" ? 5 : -161);
    var tdee = bmr * p.activity;
    var deficit = p.goal === "lose" ? Math.min(500, tdee * 0.2) : p.goal === "gain" ? -250 : 0;
    var target = tdee - deficit;
    if (p.goal === "lose") target = Math.max(target, p.sex === "m" ? 1500 : 1200);
    deficit = tdee - target;
    var protein = r0(w * (p.goal === "maintain" ? 1.2 : 1.6));
    var fat = r0(target * 0.25 / 9);
    var carbs = Math.max(0, r0((target - protein * 4 - fat * 9) / 4));
    var water = r1(w * 0.035);
    var base = { 1.2: 5000, 1.375: 6500, 1.55: 8000, 1.725: 9500 }[p.activity] || 6500;
    if (p.goal === "lose") base += 1000;
    var cap = Math.max(base, p.goal === "lose" ? 11000 : 10000);
    var weeks = Math.max(0, Math.floor((parse(today()) - parse(p.start)) / 604800000));
    var steps = Math.min(cap, base + weeks * 500);
    var rate = deficit > 0 ? deficit * 7 / 7700 : 0;
    var toGo = p.goal === "lose" ? Math.max(0, w - p.target) : p.goal === "gain" ? Math.max(0, p.target - w) : 0;
    var eta = rate > 0 && p.goal === "lose" && toGo > 0 ? Math.ceil(toGo / rate) : null;
    return { w: w, bmr: bmr, tdee: tdee, deficit: deficit, target: r0(target), protein: protein, fat: fat, carbs: carbs, water: water, glasses: Math.max(6, r0(water * 4)), steps: r0(steps / 100) * 100, rate: rate, toGo: toGo, eta: eta, cap: cap, weeks: weeks };
  }
  function stepKm(s) { return s * 0.00075; }
  function stepKcal(s, w) { return stepKm(s) * w * 0.55; }
  function stepMin(s) { return s / 105; }

  /* ================= plan ================= */
  var planCache = { key: "", v: null };
  function plan() {
    var p = state.profile, c = calc(), key = JSON.stringify(p) + "|" + r0(c.w) + "|" + c.steps;
    if (planCache.key === key) return planCache.v;
    var w = c.w, days = [];
    var sessions = SPLIT[p.perWeek], on = DAYS_ON[p.perWeek], sIdx = 0;
    var sets = [3, 3, 4][p.level - 1], N = [5, 6, 7][p.level - 1];
    var reps = p.goal === "gain" ? "8–12" : p.goal === "lose" ? "12–15" : "10–12";
    var rest = p.goal === "gain" ? 75 : p.goal === "lose" ? 30 : 60;
    var kc = function (met, min) { return (met - 1) * w * min / 60; };
    for (var d = 0; d < 7; d++) {
      var items = [];
      if (on.indexOf(d) >= 0) {
        var type = sessions[sIdx], seq = TEMPL[type], used = {}, cnt = {};
        items.push({ id: "w" + d + "a", kind: "warm", name: "Warm-up", detail: "Arm circles, bodyweight squats, light cardio", min: 5, kcal: r0(kc(3.5, 5)) });
        for (var i = 0; i < N; i++) {
          var g = seq[i], list = EX[g].filter(function (e) { return p.place === "gym" || e.eq === "bw"; });
          if (p.place === "gym") list = list.filter(function (e) { return e.eq === "gym"; }).concat(list.filter(function (e) { return e.eq !== "gym"; }));
          var start = ((cnt[g] || 0) + sIdx) % list.length, e = null;
          for (var k = 0; k < list.length; k++) { var cand = list[(start + k) % list.length]; if (!used[cand.n]) { e = cand; break; } }
          if (!e) continue;
          used[e.n] = 1; cnt[g] = (cnt[g] || 0) + 1;
          var work = e.t ? e.t : 40, min = sets * (work + rest) / 60;
          items.push({ id: "w" + d + "m" + i, kind: "main", name: e.n, group: g, detail: e.t ? sets + " × " + e.t + " s hold · rest " + rest + " s" : sets + " × " + reps + " · rest " + rest + " s", min: r1(min), kcal: r0(kc(e.met, min)) });
        }
        var cl = EX.cardio.filter(function (e) { return p.place === "gym" || e.eq === "bw"; });
        var ce = cl[sIdx % cl.length], cmin = (p.goal === "lose" ? [12, 15, 20] : [8, 10, 12])[p.level - 1];
        items.push({ id: "w" + d + "c", kind: "cardio", name: ce.n, detail: cmin + " min · " + ce.d, min: cmin, kcal: r0(kc(ce.met, cmin)) });
        items.push({ id: "w" + d + "z", kind: "cool", name: "Cool-down stretch", detail: "Hamstrings, chest, hips, calves", min: 5, kcal: r0(kc(2.5, 5)) });
        days.push({ d: d, rest: false, name: TNAME[type], items: items });
        sIdx++;
      } else {
        var wm = clamp(r0(c.steps / 105 * 0.25 / 5) * 5, 20, 45);
        items.push({ id: "r" + d + "a", kind: "walk", name: "Easy recovery walk", detail: wm + " min · conversational pace", min: wm, kcal: r0(kc(3.3, wm)) });
        items.push({ id: "r" + d + "b", kind: "cool", name: "Mobility and stretching", detail: "Hips, spine, shoulders", min: 10, kcal: r0(kc(2.5, 10)) });
        days.push({ d: d, rest: true, name: "Active recovery", items: items });
      }
    }
    days.forEach(function (x) {
      x.min = r0(x.items.reduce(function (a, b) { return a + b.min; }, 0));
      x.kcal = r0(x.items.reduce(function (a, b) { return a + b.kcal; }, 0));
      x.count = x.items.filter(function (i) { return i.kind === "main" || i.kind === "cardio"; }).length;
    });
    planCache = { key: key, v: days };
    return days;
  }
  function planFor(date) { return plan()[widx(date)]; }
  function itemsDone(date) { var d = day(date), done = d.done || {}; return planFor(date).items.filter(function (i) { return done[i.id]; }); }
  function activeBurn(date) {
    var d = day(date), c = calc();
    return itemsDone(date).reduce(function (a, i) { return a + i.kcal; }, 0) + stepKcal(num(d.steps), c.w);
  }
  function meals(date) { return day(date).meals || []; }
  function eaten(date) { return meals(date).reduce(function (a, m) { return a + num(m.k); }, 0); }
  function proteinEaten(date) { return meals(date).reduce(function (a, m) { return a + num(m.p); }, 0); }
  function tasks(date) {
    var d = day(date), c = calc(), pl = planFor(date), done = itemsDone(date).length, total = pl.items.length;
    var e = eaten(date), p = state.profile;
    var onTarget = e > 0 && (p.goal === "gain" ? e >= c.target - 150 : e <= c.target + 50);
    return [
      { k: "workout", t: pl.rest ? "Recovery walk and stretch" : pl.name + " workout", s: done + " of " + total + " steps done · about " + pl.kcal + " kcal", done: done === total },
      { k: "steps", t: "Walk " + nf(c.steps) + " steps", s: nf(num(d.steps)) + " so far · " + r1(stepKm(c.steps)) + " km goal", done: num(d.steps) >= c.steps },
      { k: "water", t: "Drink " + c.water + " L of water", s: num(d.water) + " of " + c.glasses + " glasses", done: num(d.water) >= c.glasses },
      { k: "food", t: (p.goal === "gain" ? "Eat at least " : "Stay under ") + nf(c.target) + " kcal", s: e ? nf(e) + " kcal logged" : "Log your meals below", done: onTarget },
      { k: "protein", t: "Reach " + c.protein + " g protein", s: r0(proteinEaten(date)) + " g logged", done: proteinEaten(date) >= c.protein * 0.9 },
      { k: "sleep", t: "Sleep 7 hours or more", s: num(d.sleep) ? r1(num(d.sleep)) + " h logged" : "Log last night's sleep", done: num(d.sleep) >= 7 },
      { k: "stretch", t: "10 minutes of stretching", s: "Tap to tick when done", done: !!d.stretch, manual: true }
    ];
  }
  function activeDay(date) { var d = state.days[date]; return !!d && (num(d.steps) > 0 || Object.keys(d.done || {}).length > 0 || meals(date).length > 0); }
  function streak() { var s = today(), n = 0; if (!activeDay(s)) s = shift(s, -1); while (activeDay(s)) { n++; s = shift(s, -1); } return n; }

  /* ================= accounts and encrypted saving ================= */
  // Each account is one document: AES-GCM ciphertext of {profile, days}. The key comes from the password (PBKDF2), so the password is never stored.
  var te = new TextEncoder(), td = new TextDecoder(), saving = Promise.resolve();
  state.authMode = "in"; state.authErr = ""; state.authBusy = false; state.confirmDel = false; state.resetUser = "";
  try { state.authUser = localStorage.getItem("healthify-last-user") || ""; } catch (e) { state.authUser = ""; }
  function b64(buf) { var a = new Uint8Array(buf), s = ""; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function unb64(t) { var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  function deriveKey(pw, salt) {
    return crypto.subtle.importKey("raw", te.encode(pw), "PBKDF2", false, ["deriveKey"]).then(function (km) {
      return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: 210000, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
    });
  }
  function vaultId(user) {
    return crypto.subtle.digest("SHA-256", te.encode("healthify:" + user.toLowerCase())).then(function (h) {
      return Array.from(new Uint8Array(h)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("").slice(0, 40);
    });
  }
  function seal(key, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, te.encode(JSON.stringify(obj))).then(function (ct) { return { iv: b64(iv), ct: b64(ct) }; });
  }
  function unseal(key, doc) {
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(doc.iv) }, key, unb64(doc.ct)).then(function (buf) { return JSON.parse(td.decode(buf)); });
  }
  function getVault(id) {
    if (store.dbm) return store.dbm.doc("vault/" + id).get().then(function (s) { return s.exists ? s.data() : null; });
    try { var r = localStorage.getItem("healthify-vault-" + id); return Promise.resolve(r ? JSON.parse(r) : null); } catch (e) { return Promise.resolve(null); }
  }
  function putVault(id, doc) {
    if (store.dbm) return store.dbm.doc("vault/" + id).set(doc);
    try { localStorage.setItem("healthify-vault-" + id, JSON.stringify(doc)); } catch (e) {}
    return Promise.resolve();
  }
  function dropVault(id) {
    if (store.dbm) return store.dbm.doc("vault/" + id).delete();
    try { localStorage.removeItem("healthify-vault-" + id); return Promise.resolve(); } catch (e) { return Promise.reject(e); }
  }
  function saveVault() {
    var a = state.auth; if (!a) return saving;
    var snap = JSON.parse(JSON.stringify({ profile: state.profile, days: state.days }));
    saving = saving.then(function () { return seal(a.key, snap); }).then(function (p) { return putVault(a.id, { v: 1, salt: a.salt, iv: p.iv, ct: p.ct, at: Date.now() }); })
      .catch(function () { toast("Could not save that change. Check your connection."); });
    return saving;
  }
  function queueSave() { clearTimeout(timers.v); timers.v = setTimeout(saveVault, 500); }
  function startSession(user, id, key, salt, data) {
    state.auth = { user: user, id: id, key: key, salt: salt };
    state.profile = data.profile || null; state.days = data.days || {}; planCache.key = "";
    state.tab = "today"; state.setup = false; state.authErr = ""; state.authBusy = false; state.confirmDel = false;
    try { localStorage.setItem("healthify-last-user", user); } catch (e) {}
    render(); window.scrollTo(0, 0);
  }
  function authFail(msg) { state.authErr = msg; state.authBusy = false; render(); }
  function doLogin(user, pw) {
    vaultId(user).then(function (id) {
      return getVault(id).then(function (doc) {
        if (!doc) throw { m: "No account found with that username." };
        return deriveKey(pw, unb64(doc.salt)).then(function (key) {
          return unseal(key, doc).then(function (data) { startSession(user, id, key, doc.salt, data); }, function () { throw { m: "Wrong password. Try again." }; });
        });
      });
    }).catch(function (e) { authFail(e && e.m ? e.m : "Could not sign in. Check your connection and try again."); });
  }
  function doSignup(user, pw) {
    var id, salt, key, ref;
    vaultId(user).then(function (v) {
      id = v; ref = store.dbm ? store.dbm.doc("vault/" + id) : null;
      return ref ? ref.acquire({ holder: String(Math.random()), ttlMs: 8000 }) : { acquired: true };
    }).then(function (lease) {
      if (!lease.acquired) throw { m: "That username is being claimed right now. Try again in a moment." };
      return getVault(id);
    }).then(function (existing) {
      if (existing) throw { m: "That username is taken. Pick another or sign in." };
      var s = crypto.getRandomValues(new Uint8Array(16)); salt = b64(s);
      return deriveKey(pw, s);
    }).then(function (k) {
      key = k; return seal(key, { profile: null, days: {} });
    }).then(function (p) {
      return putVault(id, { v: 1, salt: salt, iv: p.iv, ct: p.ct, at: Date.now() });
    }).then(function () { startSession(user, id, key, salt, { profile: null, days: {} }); toast("Account created."); })
      .catch(function (e) { authFail(e && e.m ? e.m : "Could not create the account. Check your connection and try again."); });
  }
  function signOut() {
    clearTimeout(timers.v);
    return saveVault().then(function () {
      state.auth = null; state.profile = null; state.days = {}; planCache.key = ""; state.setup = false; state.confirmDel = false; state.tab = "today"; state.authMode = "in"; state.menu = false;
      render(); window.scrollTo(0, 0);
    });
  }
  function authView() {
    var up = state.authMode === "up";
    var resetting = state.authMode === "reset", resetConfirm = resetting && !!state.resetUser;
    var title = resetting ? (resetConfirm ? "Confirm account reset" : "Reset password") : up ? "Create account" : "Sign in";
    var intro = resetting ? "A forgotten password cannot be recovered. You can erase the encrypted account and start over." : up ? "Pick a username and password. Your plan and logs are saved to it." : "Welcome back. Enter your username and password.";
    var accountField = '<div class="f"><label for="a-user">Username</label><input class="in" id="a-user" maxlength="30" autocomplete="username" autocapitalize="none" spellcheck="false" required value="' + esc(state.authUser) + '"></div>';
    var error = state.authErr ? '<p class="note" role="alert">' + esc(state.authErr) + "</p>" : "";
    var form;
    if (resetting) {
      form = resetConfirm
        ? '<form id="reset-confirm" class="card"><p class="note">This permanently deletes the saved plan and all logs for <b>' + esc(state.resetUser) + '</b>. This cannot be undone. To confirm, type the username below.</p><div class="f"><label for="reset-confirm-username">Type username to confirm</label><input class="in" id="reset-confirm-username" maxlength="30" autocomplete="off" autocapitalize="none" required></div>' + error + '<button class="btn pri big" type="submit"' + (state.authBusy ? " disabled" : "") + ">" + (state.authBusy ? "Erasing…" : "Erase data and continue") + '</button><button class="btn" type="button" data-act="cancel-reset">Cancel</button></form>'
        : '<form id="auth-reset" class="card">' + accountField + error + '<p class="note">Resetting means permanently deleting the account’s encrypted data. It cannot be recovered.</p><button class="btn pri big" type="submit"' + (state.authBusy ? " disabled" : "") + ">" + (state.authBusy ? "Checking…" : "Continue") + '</button><button class="btn" type="button" data-act="cancel-reset">Cancel</button></form>';
    } else {
      form = '<form id="auth" class="card">' + accountField + '<div class="f"><label for="a-pw">Password' + (up ? " (8 characters or more)" : "") + '</label><input class="in" id="a-pw" type="password" autocomplete="' + (up ? "new-password" : "current-password") + '" required></div>' +
        (up ? '<div class="f"><label for="a-pw2">Repeat password</label><input class="in" id="a-pw2" type="password" autocomplete="new-password" required></div>' : "") +
        error + '<button class="btn pri big" type="submit"' + (state.authBusy ? " disabled" : "") + ">" + (state.authBusy ? "Working…" : up ? "Create account" : "Sign in") + "</button>" +
        '<p class="hint">Your details are encrypted with your password in this browser before they are saved. Nobody can read them. If you forget your password, you can erase the saved data and start over.</p></form>';
    }
    return '<div class="app-page"><div class="wrap" style="max-width:480px"><div class="view"><div class="head"><div><h1>' + title + '</h1><p class="sub">' + intro + "</p></div></div>" +
      (resetting ? "" : '<div class="row"><button class="chip" data-act="authmode" data-v="in" aria-pressed="' + !up + '">Sign in</button><button class="chip" data-act="authmode" data-v="up" aria-pressed="' + up + '">Create account</button></div>') +
      form + (!resetting && !up ? '<button class="btn" type="button" data-act="forgot-password">Forgot password?</button>' : "") + "</div></div></div>";
  }

  function setDay(date, patch) { state.days[date] = Object.assign({}, day(date), patch, { date: date }); queueSave(); render(); }
  function saveProfile(p) { state.profile = p; planCache.key = ""; queueSave(); }

  /* ================= icons & small views ================= */
  var IC = {
    today: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
    plan: '<svg viewBox="0 0 24 24"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>',
    progress: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15l4-5 3 3 4-6"/></svg>',
    life: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/></svg>',
    l: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
    r: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    ck: '<svg viewBox="0 0 24 24"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>'
  };
  function ring(pct, color, big, label) {
    var C = 2 * Math.PI * 38, f = clamp(pct, 0, 1) * C;
    return '<div class="ring"><svg viewBox="0 0 100 100" role="img" aria-label="' + label + " " + big + '"><circle class="t" cx="50" cy="50" r="38" style="fill:none;stroke:var(--surface2);stroke-width:10"/><circle class="v" cx="50" cy="50" r="38" style="stroke:' + color + ";stroke-width:10;stroke-dasharray:" + f + " " + C + '"/><text x="50" y="57" text-anchor="middle">' + big + '</text></svg><span class="lab">' + label + "</span></div>";
  }
  function opt(v, l, cur) { return '<option value="' + v + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + l + "</option>"; }
  function bar(v, max, c) { return '<div class="bar" style="--c:' + c + '"><i style="width:' + clamp(v / max * 100, 0, 100) + '%"></i></div>'; }

  IC.profile = '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.500-4 4.500-6 8-6s6.500 2 8 6"/></svg>';
  function viewProfile() {
    var p = state.profile, c = calc();
    var GOAL = { lose: "Lose fat", maintain: "Stay fit and healthy", gain: "Build muscle" }, ACT = { 1.2: "Mostly sitting", 1.375: "Light movement", 1.55: "On my feet a lot", 1.725: "Physical job or sport" };
    var rows = [["Sex", p.sex === "m" ? "Male" : "Female"], ["Age", p.age + " years"], ["Height", p.height + " cm"], ["Weight now", r1(c.w) + " kg"], ["Target weight", p.target + " kg"], ["Main goal", GOAL[p.goal]], ["Daily life", ACT[p.activity]], ["Experience", ["Beginner", "Intermediate", "Advanced"][p.level - 1]], ["Workout days", p.perWeek + " a week"], ["Training at", p.place === "gym" ? "Gym with equipment" : "Home, no equipment"]];
    return '<div class="view"><div class="head"><div><h1>Profile</h1><p class="sub">Your details drive every number in your plan</p></div></div>' +
      '<section class="card"><div class="row" style="gap:14px"><span class="avatar">' + esc((p.name || "H").charAt(0).toUpperCase()) + '</span><div><h3>' + (esc(p.name) || "Your profile") + '</h3><p class="sub">Plan started ' + parse(p.start).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + '</p></div></div>' +
      '<form id="nameform" class="row" style="align-items:flex-end"><div class="f" style="flex:1;min-width:160px"><label for="p-name">Display name</label><input class="in" id="p-name" maxlength="30" value="' + esc(p.name || "") + '" placeholder="Your name"></div><button class="btn" type="submit">Save name</button></form>' +
      '<div>' + rows.map(function (r) { return '<div class="prow"><span>' + r[0] + "</span><b>" + r[1] + "</b></div>"; }).join("") + "</div>" +
      '<button class="btn pri big" data-act="setup">Edit profile</button><p class="hint">Changing your weight, goal or workout days rebuilds your plan. Everything you have logged is kept.</p></section>' +
      '<section class="card"><h2>Account</h2><div class="prow"><span>Username</span><b>' + esc(state.auth.user) + '</b></div><p class="hint">Your username stays the same. You can change your name, details and password any time.</p><button class="btn big" data-act="signout">Sign out</button>' +
      '<form id="chpw" class="stack" style="gap:10px"><div class="fg"><div class="f"><label for="pw-new">New password</label><input class="in" id="pw-new" type="password" autocomplete="new-password" minlength="8" required></div><div class="f"><label for="pw-new2">Repeat new password</label><input class="in" id="pw-new2" type="password" autocomplete="new-password" required></div></div><button class="btn" type="submit">Change password</button></form>' +
      (state.confirmDel ? '<p class="note">This permanently deletes your account, plan and all logs. It cannot be undone.</p><div class="row"><button class="btn pri" data-act="delacct">Yes, delete everything</button><button class="btn" data-act="delcancel">Keep my account</button></div>' : '<button class="btn" data-act="delacct">Delete my account</button>') + '</section>' +
      '<section class="card"><h2>Your daily targets</h2><div class="prow"><span>Eat</span><b>' + nf(c.target) + ' kcal</b></div><div class="prow"><span>Protein</span><b>' + c.protein + ' g</b></div><div class="prow"><span>Water</span><b>' + c.water + ' L</b></div><div class="prow"><span>Walk</span><b>' + nf(c.steps) + ' steps</b></div></section></div>';
  }

  /* ================= setup ================= */
  function viewSetup() {
    var p = state.profile || DEF, first = !state.profile;
    return '<div class="view"><div class="head"><div><h1>' + (first ? "Build your plan" : "Your profile") + '</h1><p class="sub">' + (first ? "Answer these once. Your calories, steps, water and weekly workouts are worked out from them." : "Change anything and your plan updates.") + "</p></div></div>" +
      '<form id="setup" class="card"><div class="f"><label for="s-name">First name</label><input class="in" id="s-name" maxlength="30" autocomplete="given-name" value="' + esc(p.name || "") + '" placeholder="Your name"></div>' +
      '<div class="fg"><div class="f"><label for="s-sex">Sex (for the calorie formula)</label><select class="in" id="s-sex">' + opt("m", "Male", p.sex) + opt("f", "Female", p.sex) + "</select></div>" +
      '<div class="f"><label for="s-age">Age</label><input class="in" id="s-age" type="number" inputmode="numeric" min="14" max="90" value="' + p.age + '"></div>' +
      '<div class="f"><label for="s-height">Height (cm)</label><input class="in" id="s-height" type="number" inputmode="numeric" min="120" max="230" value="' + p.height + '"></div>' +
      '<div class="f"><label for="s-weight">Weight now (kg)</label><input class="in" id="s-weight" type="number" inputmode="decimal" step="0.1" min="35" max="250" value="' + (state.profile ? r1(curWeight()) : p.weight) + '"></div>' +
      '<div class="f"><label for="s-target">Target weight (kg)</label><input class="in" id="s-target" type="number" inputmode="decimal" step="0.1" min="35" max="250" value="' + p.target + '"></div>' +
      '<div class="f"><label for="s-goal">Main goal</label><select class="in" id="s-goal">' + opt("lose", "Lose fat", p.goal) + opt("maintain", "Stay fit and healthy", p.goal) + opt("gain", "Build muscle", p.goal) + "</select></div>" +
      '<div class="f"><label for="s-activity">Daily life</label><select class="in" id="s-activity">' + opt(1.2, "Mostly sitting", p.activity) + opt(1.375, "Light movement", p.activity) + opt(1.55, "On my feet a lot", p.activity) + opt(1.725, "Physical job or sport", p.activity) + "</select></div>" +
      '<div class="f"><label for="s-level">Gym experience</label><select class="in" id="s-level">' + opt(1, "Beginner", p.level) + opt(2, "Intermediate", p.level) + opt(3, "Advanced", p.level) + "</select></div>" +
      '<div class="f"><label for="s-per">Workout days per week</label><select class="in" id="s-per">' + opt(3, "3 days", p.perWeek) + opt(4, "4 days", p.perWeek) + opt(5, "5 days", p.perWeek) + opt(6, "6 days", p.perWeek) + "</select></div>" +
      '<div class="f"><label for="s-place">Where you train</label><select class="in" id="s-place">' + opt("gym", "Gym with equipment", p.place) + opt("home", "Home, no equipment", p.place) + "</select></div></div>" +
      '<button class="btn pri big" type="submit">' + (first ? "Build my plan" : "Save changes") + "</button>" +
      (first ? "" : '<button class="btn" type="button" data-act="cancel-setup">Cancel</button>') +
      '<p class="hint">These are estimates for healthy adults, not medical advice. If you have a health condition, are pregnant, or are under 18, check with a doctor before changing your diet or training.</p></form></div>';
  }
  function submitSetup() {
    var g = function (id) { return document.getElementById(id).value; };
    var p = {
      name: g("s-name").trim(), sex: g("s-sex"), age: clamp(r0(parseFloat(g("s-age")) || DEF.age), 14, 90),
      height: clamp(r0(parseFloat(g("s-height")) || DEF.height), 120, 230), weight: clamp(r1(parseFloat(g("s-weight")) || DEF.weight), 35, 250),
      target: clamp(r1(parseFloat(g("s-target")) || DEF.target), 35, 250), goal: g("s-goal"), activity: parseFloat(g("s-activity")),
      level: parseInt(g("s-level"), 10), perWeek: parseInt(g("s-per"), 10), place: g("s-place"),
      start: state.profile ? state.profile.start : today()
    };
    var newW = p.weight; if (state.profile) p.weight = state.profile.weight;
    if (p.goal === "lose" && p.target >= newW) { toast("For fat loss, set a target weight below your current weight."); return; }
    if (p.goal === "gain" && p.target <= newW) { toast("For muscle gain, set a target weight above your current weight."); return; }
    var first = !state.profile;
    saveProfile(p);
    if (first) setDay(today(), { weight: p.weight });
    else if (Math.abs(newW - curWeight()) > 0.04) setDay(today(), { weight: newW });
    state.setup = false; state.tab = "today";
    if (!first && state.route !== "profile") location.hash = "#profile"; render(); window.scrollTo(0, 0);
  }

  /* ================= today ================= */
  function viewToday() {
    var date = state.date, d = day(date), c = calc(), p = state.profile, pl = planFor(date), isToday = date === today();
    var done = itemsDone(date).length, ts = tasks(date), tdone = ts.filter(function (t) { return t.done; }).length;
    var steps = num(d.steps), act = activeBurn(date), e = eaten(date), pe = proteinEaten(date);
    var burnGoal = pl.kcal + stepKcal(c.steps, c.w);
    var out = c.bmr * 1.2 + act;
    var greet = p.name ? (isToday ? "Hi " + esc(p.name) : esc(p.name)) : (isToday ? "Today" : DN[widx(date)]);

    var exList = pl.items.map(function (i) {
      var on = !!(d.done && d.done[i.id]), tag = i.kind === "main" ? "" : '<span class="tag">' + ({ warm: "Warm-up", cardio: "Cardio", cool: "Cool-down", walk: "Walk" }[i.kind]) + "</span>";
      return '<button class="ex' + (on ? " on" : "") + '" data-act="ex" data-v="' + i.id + '" aria-pressed="' + on + '"><span class="box">' + IC.ck + '</span><span class="tx"><b>' + tag + esc(i.name) + "</b><span>" + esc(i.detail) + '</span></span><span class="k">' + i.kcal + "<small>kcal</small></span></button>";
    }).join("");

    var taskList = ts.map(function (t) {
      var inner = '<span class="box">' + IC.ck + '</span><span class="tx"><b>' + esc(t.t) + "</b><span>" + esc(t.s) + "</span></span>";
      return t.manual ? '<button class="task' + (t.done ? " on" : "") + '" data-act="stretch" aria-pressed="' + t.done + '">' + inner + "</button>" : '<div class="task' + (t.done ? " on" : "") + '">' + inner + "</div>";
    }).join("");

    var gl = ""; for (var i = 0; i < c.glasses; i++) gl += '<button class="gl' + (i < num(d.water) ? " on" : "") + '" data-act="glass" data-v="' + (i + 1) + '" aria-label="Glass ' + (i + 1) + '"></button>';

    var mealList = meals(date).map(function (m, i) {
      return '<div class="meal"><div class="tx"><b>' + esc(m.n) + "</b><br><span>" + nf(m.k) + " kcal" + (m.p ? " · " + r0(m.p) + " g protein" : "") + '</span></div><button class="x" data-act="delmeal" data-v="' + i + '" aria-label="Remove ' + esc(m.n) + '">&times;</button></div>';
    }).join("");

    return '<div class="view"><div class="head"><div><h1>' + greet + '</h1><p class="sub">' + longDate(date) + '</p></div><div class="pill"><b>' + streak() + "</b>day streak</div></div>" +
      '<div class="datebar"><button class="ib" data-act="day" data-v="-1" aria-label="Previous day">' + IC.l + '</button><div class="mid">' + (isToday ? "Today" : '<button class="chip" data-act="day" data-v="0">Back to today</button>') + '</div><button class="ib" data-act="day" data-v="1" aria-label="Next day"' + (isToday ? " disabled" : "") + ">" + IC.r + "</button></div>" +

      '<div class="hero"><span class="kick">' + (pl.rest ? "Recovery day" : "Today’s workout") + '</span><span class="big">' + esc(pl.name) + '</span><div class="facts"><span><b>' + pl.count + "</b>" + (pl.rest ? "walk and stretch" : "exercises") + "</span><span><b>" + pl.min + "</b>min</span><span><b>" + pl.kcal + "</b>kcal</span><span><b>" + done + "/" + pl.items.length + "</b>done</span></div></div>" +

      '<div class="cols"><div class="stack">' +
      '<section class="card"><h2>Today’s numbers</h2><div class="rings">' +
      ring(steps / c.steps, "var(--accent)", nf(steps), "Steps of " + nf(c.steps)) +
      ring(act / burnGoal, "var(--violet)", nf(act), "Burned of " + nf(burnGoal)) +
      ring(e / c.target, "var(--good)", nf(e), "Eaten of " + nf(c.target)) +
      '</div><div class="callout">' + (e ? '<span class="sub">' + (e <= c.target ? "Left to eat today" : "Over your target by") + '</span><span class="num">' + nf(Math.abs(c.target - e)) + ' kcal</span><span class="hint">If you finish the day at ' + nf(Math.max(e, c.target)) + ' kcal, you burn about ' + (Math.max(e, c.target) < out ? r0((out - Math.max(e, c.target)) / 7.7) + " g of body fat." : "no net body fat today.") + ' Burned so far: ' + nf(act) + ' kcal from activity.</span>' : '<span class="sub">Fat burn estimate</span><span class="hint">Log your meals below. You will see what is left to eat and the body fat you burn if you finish the day on target.</span>') + "</div></section>" +

      '<section class="card"><div class="row" style="justify-content:space-between"><h2>Daily tasks</h2><span class="score">' + tdone + " / " + ts.length + "</span></div>" + bar(tdone, ts.length, "var(--good)") + taskList + "</section></div>" +

      '<div class="stack"><section class="card"><div class="row" style="justify-content:space-between"><h2>Workout</h2><span class="sub">Tap each when finished</span></div><div>' + exList + "</div></section>" +

      '<section class="card"><h2>Walking</h2><div class="row" style="align-items:baseline;gap:10px"><span class="num" style="font-size:40px;line-height:1">' + nf(steps) + '</span><span class="sub">of ' + nf(c.steps) + " steps</span></div>" + bar(steps, c.steps, "var(--accent)") +
      '<p class="hint">Goal: ' + r1(stepKm(c.steps)) + " km, about " + r0(stepMin(c.steps)) + " min of brisk walking, around " + r0(stepKcal(c.steps, c.w)) + " kcal. Your goal rises by 500 steps a week up to " + nf(c.cap) + ".</p>" +
      '<div class="row"><div class="f" style="flex:1;min-width:120px"><label for="in-steps">Total steps today</label><input class="in" id="in-steps" type="number" inputmode="numeric" min="0" max="100000" value="' + (steps || "") + '" data-f="steps" placeholder="0"></div><button class="btn pri" data-act="steps" data-v="1000" style="align-self:flex-end">+1,000</button></div></section></div>' +

      '<section class="card"><h2>Food</h2>' + (mealList ? "<div>" + mealList + "</div>" : '<p class="hint">Nothing logged. Add each meal with its calories.</p>') +
      '<div class="mrow"><span>Calories</span>' + bar(e, c.target, "var(--good)") + "<span>" + nf(e) + "/" + nf(c.target) + "</span></div>" +
      '<div class="mrow"><span>Protein</span>' + bar(pe, c.protein, "var(--blue)") + "<span>" + r0(pe) + "/" + c.protein + " g</span></div>" +
      '<form id="meal" class="row" style="align-items:flex-end"><div class="f" style="flex:1 1 100%"><label for="m-n">Meal</label><input class="in" id="m-n" maxlength="40" placeholder="e.g. Dal, rice, curd" required></div>' +
      '<div class="f" style="flex:1;min-width:90px"><label for="m-k">kcal</label><input class="in" id="m-k" type="number" inputmode="numeric" min="1" max="5000" required></div>' +
      '<div class="f" style="flex:1;min-width:90px"><label for="m-p">Protein g</label><input class="in" id="m-p" type="number" inputmode="numeric" min="0" max="300"></div><button class="btn pri" type="submit">Add</button></form></section>' +

      '<section class="card"><h2>Water, sleep and weight</h2><div><div class="row" style="justify-content:space-between;margin-bottom:8px"><span>Water</span><span class="num">' + num(d.water) + " / " + c.glasses + " glasses</span></div><div class=\"glasses\">" + gl + '</div><p class="hint" style="margin-top:6px">One glass is 250 ml. Goal ' + c.water + " L.</p></div>" +
      '<div class="fg"><div class="f"><label for="in-sleep">Sleep last night (hours)</label><input class="in" id="in-sleep" type="number" inputmode="decimal" step="0.5" min="0" max="16" value="' + (num(d.sleep) || "") + '" data-f="sleep"></div>' +
      '<div class="f"><label for="in-weight">Weight (kg)</label><input class="in" id="in-weight" type="number" inputmode="decimal" step="0.1" min="35" max="250" value="' + (num(d.weight) || "") + '" data-f="weight" placeholder="' + r1(c.w) + '"></div></div></section>' +
      "</div></div>";
  }

  /* ================= plan view ================= */
  function viewPlan() {
    var days = plan(), c = calc(), td = widx(today()), p = state.profile;
    var wk = days.reduce(function (a, x) { return a + x.kcal; }, 0), sk = stepKcal(c.steps, c.w) * 7;
    var workouts = days.filter(function (x) { return !x.rest; }).length;
    var cards = days.map(function (x) {
      var open = state.open === x.d;
      var list = open ? '<div class="list">' + x.items.map(function (i) { return '<div class="li"><span>' + esc(i.name) + "</span><span>" + esc(i.detail.split(" · ")[0]) + " · " + i.kcal + " kcal</span></div>"; }).join("") + "</div>" : "";
      return '<button class="day' + (x.d === td ? " today" : "") + '" data-act="open" data-v="' + x.d + '" aria-expanded="' + open + '"><div class="top"><span class="dn">' + DN[x.d] + '</span><span class="nm">' + esc(x.name) + "<span>" + (x.rest ? "Walk " + x.min + " min total" : x.count + " exercises · " + x.min + " min") + '</span></span><span class="num" style="font-size:22px">' + x.kcal + ' <small class="hint">kcal</small></span></div>' + list + "</button>";
    }).join("");
    return '<div class="view"><div class="head"><div><h1>Weekly plan</h1><p class="sub">' + p.perWeek + " workouts a week, " + (p.place === "gym" ? "gym" : "home") + " · " + ["beginner", "intermediate", "advanced"][p.level - 1] + '</p></div></div>' +
      '<div class="kpis"><div class="kpi"><span class="num">' + workouts + "</span><span>Workouts per week</span></div>" +
      '<div class="kpi"><span class="num">' + nf(wk) + "</span><span>kcal from training</span></div>" +
      '<div class="kpi"><span class="num">' + nf(c.steps) + "</span><span>Steps every day</span></div>" +
      '<div class="kpi"><span class="num">' + nf(wk + sk) + "</span><span>kcal burned in total</span></div></div>" +
      '<div class="cols">' + cards + '</div><p class="hint">Tap a day to see its exercises. Calories use the MET method with your body weight, so treat them as estimates. Increase weights or reps when the last set feels easy for two sessions in a row.</p></div>';
  }

  /* ================= progress ================= */
  function barChart(data, goal, color) {
    var W = 360, H = 190, L = 34, R = 8, T = 18, B = 24, pw = W - L - R, ph = H - T - B;
    var mx = Math.max.apply(null, data.map(function (x) { return x.v; }).concat([goal || 0, 1]));
    var p10 = Math.pow(10, Math.floor(Math.log10(mx))), n = mx / p10, hi = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p10;
    function y(v) { return T + ph * (1 - v / hi); }
    function cmp(v) { return v >= 1000 ? r1(v / 1000) + "k" : String(r0(v)); }
    var s = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" style="--c:' + color + '" role="img">';
    [0, hi / 2, hi].forEach(function (t) { s += '<line class="gl-l" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text x="' + (L - 5) + '" y="' + (y(t) + 3) + '" text-anchor="end">' + cmp(t) + "</text>"; });
    var slot = pw / data.length;
    data.forEach(function (x, i) {
      var cx = L + slot * i + slot / 2, bw = slot * 0.56;
      s += '<text x="' + cx + '" y="' + (H - 7) + '" text-anchor="middle">' + x.l + "</text>";
      if (x.v > 0) s += '<rect class="vb' + (x.sel ? "" : " dim") + '" x="' + (cx - bw / 2) + '" y="' + y(x.v) + '" width="' + bw + '" height="' + (T + ph - y(x.v)) + '" rx="3"/><text class="vt" x="' + cx + '" y="' + (y(x.v) - 4) + '" text-anchor="middle">' + cmp(x.v) + "</text>";
    });
    if (goal) s += '<line class="goal" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(goal) + '" y2="' + y(goal) + '"/><text class="gt" x="' + (W - R) + '" y="' + (y(goal) - 4) + '" text-anchor="end">goal ' + cmp(goal) + "</text>";
    return s + "</svg>";
  }
  function lineChart(pts, color, unit) {
    var W = 360, H = 200, L = 36, R = 14, T = 20, B = 26, pw = W - L - R, ph = H - T - B;
    var vs = pts.map(function (x) { return x.v; }), lo = Math.floor(Math.min.apply(null, vs) - 1), hi = Math.ceil(Math.max.apply(null, vs) + 1);
    if (hi - lo < 2) hi = lo + 2;
    function y(v) { return T + ph * (1 - (v - lo) / (hi - lo)); }
    function x(i) { return pts.length === 1 ? L + pw / 2 : L + pw * i / (pts.length - 1); }
    var s = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" style="--c:' + color + '" role="img">';
    [lo, (lo + hi) / 2, hi].forEach(function (t) { s += '<line class="gl-l" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text x="' + (L - 5) + '" y="' + (y(t) + 3) + '" text-anchor="end">' + r1(t) + "</text>"; });
    if (pts.length > 1) s += '<polyline class="ln" points="' + pts.map(function (q, i) { return x(i) + "," + y(q.v); }).join(" ") + '"/>';
    pts.forEach(function (q, i) {
      s += '<circle class="dt" cx="' + x(i) + '" cy="' + y(q.v) + '" r="4"/>';
      if (i === 0 || i === pts.length - 1) s += '<text class="vt" x="' + x(i) + '" y="' + (y(q.v) - 9) + '" text-anchor="' + (i === 0 && pts.length > 1 ? "start" : "end") + '">' + r1(q.v) + " " + unit + "</text>";
      if (i === 0 || i === pts.length - 1) s += '<text x="' + x(i) + '" y="' + (H - 7) + '" text-anchor="' + (i === 0 && pts.length > 1 ? "start" : "end") + '">' + parse(q.d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + "</text>";
    });
    return s + "</svg>";
  }
  function viewProgress() {
    var c = calc(), p = state.profile, t = today(), wk = [], i;
    for (i = 6; i >= 0; i--) wk.push(shift(t, -i));
    var steps = wk.map(function (s) { return { l: DN[widx(s)], v: num(day(s).steps), sel: s === t }; });
    var burn = wk.map(function (s) { return { l: DN[widx(s)], v: r0(activeBurn(s)), sel: s === t }; });
    var avgSteps = steps.reduce(function (a, b) { return a + b.v; }, 0) / 7, totBurn = burn.reduce(function (a, b) { return a + b.v; }, 0);
    var sessions = wk.filter(function (s) { var pl = planFor(s); return !pl.rest && itemsDone(s).filter(function (x) { return x.kind === "main"; }).length >= pl.count - (pl.items.some(function (x) { return x.kind === "cardio"; }) ? 1 : 0) && itemsDone(s).length > 0; }).length;
    var planned = plan().filter(function (x) { return !x.rest; }).length;
    var wpts = [], keys = Object.keys(state.days).sort();
    keys.forEach(function (k) { var w = num(state.days[k].weight); if (w > 0) wpts.push({ d: k, v: w }); });
    wpts = wpts.slice(-30);
    var change = wpts.length > 1 ? wpts[wpts.length - 1].v - wpts[0].v : null;
    var fatKg = totBurn / 7700;
    var goalPct = p.goal === "maintain" ? null : clamp(Math.abs(p.weight - c.w) / Math.abs(p.weight - p.target), 0, 1);
    return '<div class="view"><div class="head"><div><h1>Progress</h1><p class="sub">Last 7 days and your weight trend</p></div></div>' +
      '<div class="kpis"><div class="kpi"><span class="num">' + sessions + "/" + planned + '</span><span>Workouts done this week</span></div>' +
      '<div class="kpi"><span class="num">' + nf(avgSteps) + '</span><span>Average steps a day</span></div>' +
      '<div class="kpi"><span class="num">' + nf(totBurn) + '</span><span>kcal burned by activity</span></div>' +
      '<div class="kpi"><span class="num">' + (change === null ? "–" : (change > 0 ? "+" : "") + r1(change) + " kg") + "</span><span>Weight change logged</span></div></div>" +
      '<div class="cols"><section class="card"><h2>Weight</h2>' + (wpts.length ? lineChart(wpts, "var(--accent)", "kg") : '<p class="hint">Enter your weight on the Today tab. Weigh yourself at the same time of day once or twice a week.</p>') +
      (goalPct === null ? "" : '<div class="mrow" style="grid-template-columns:90px 1fr auto"><span>To target</span>' + bar(goalPct, 1, "var(--accent)") + "<span>" + r0(goalPct * 100) + "%</span></div><p class=\"hint\">" + r1(c.w) + " kg now, target " + p.target + " kg.</p>") + "</section>" +
      '<section class="card"><h2>Steps</h2>' + barChart(steps, c.steps, "var(--accent)") + "</section>" +
      '<section class="card"><h2>Calories burned by activity</h2>' + barChart(burn, 0, "var(--violet)") + '<p class="hint">Workouts you ticked plus walking. About ' + r1(fatKg) + " kg of fat equivalent over these 7 days, if your food intake stayed at maintenance.</p></section>" +
      '<section class="card"><h2>Fat loss pace</h2>' + (p.goal === "lose" && c.rate > 0 ? '<div class="callout"><span class="num">' + r1(c.rate) + " kg per week</span><span class=\"hint\">From a daily gap of about " + r0(c.deficit) + " kcal between food and what you burn." + (c.eta ? " At this pace you reach " + p.target + " kg in about " + c.eta + " weeks." : " You are at or below your target.") + "</span></div>" : '<p class="hint">Fat-loss pace shows when your goal is to lose fat.</p>') +
      '<p class="hint">Safe, lasting loss is usually 0.25 to 0.75 kg a week. Faster usually costs muscle.</p></section></div></div>';
  }

  /* ================= lifestyle ================= */
  function viewLife() {
    var c = calc(), p = state.profile;
    var tips = [
      ["Walk after meals", "A 10 minute walk after lunch and dinner helps blood sugar and adds about " + r0(stepKcal(1300, c.w)) + " kcal each."],
      ["Protein at every meal", "Aim for " + r0(c.protein / 4) + " g in each of four meals. Eggs, dal, paneer, curd, chicken, fish and tofu all count."],
      ["Sleep 7 to 9 hours", "Short sleep raises hunger and cuts recovery. Keep a fixed bedtime and put screens away 30 minutes before."],
      ["Drink water first", "Have a glass before each meal and keep a bottle with you. Your goal is " + c.water + " L, or " + c.glasses + " glasses."],
      ["Half the plate is vegetables", "Fill half your plate with vegetables, a quarter with protein and a quarter with rice, roti or other carbs."],
      ["Lift to keep your muscle", "Strength training protects muscle while you lose fat, so what you lose is mostly fat. Do not skip it for extra cardio."],
      ["Take the stairs, stand up often", "Stand and move for 2 minutes every hour you sit. It adds steps without a workout."],
      ["Rest days count", "Muscles grow while you recover. Keep the easy walk and stretching on rest days."]
    ];
    return '<div class="view"><div class="head"><div><h1>Healthy life</h1><p class="sub">Your daily targets and habits</p></div><button class="chip" data-act="setup">Edit profile</button></div>' +
      '<div class="kpis"><div class="kpi"><span class="num">' + nf(c.target) + '</span><span>kcal to eat a day</span></div><div class="kpi"><span class="num">' + c.protein + ' g</span><span>protein a day</span></div><div class="kpi"><span class="num">' + c.water + ' L</span><span>water a day</span></div><div class="kpi"><span class="num">' + nf(c.steps) + '</span><span>steps a day</span></div></div>' +
      '<div class="cols"><section class="card"><h2>Daily macros</h2>' +
      '<div class="mrow"><span>Protein</span>' + bar(c.protein * 4, c.target, "var(--blue)") + "<span>" + c.protein + " g</span></div>" +
      '<div class="mrow"><span>Carbs</span>' + bar(c.carbs * 4, c.target, "var(--amber)") + "<span>" + c.carbs + " g</span></div>" +
      '<div class="mrow"><span>Fat</span>' + bar(c.fat * 9, c.target, "var(--violet)") + "<span>" + c.fat + " g</span></div>" +
      '<p class="hint">Bars show each share of your ' + nf(c.target) + " kcal.</p></section>" +
      '<section class="card"><h2>How your numbers were worked out</h2><div class="mrow" style="grid-template-columns:1fr auto"><span>Resting burn (BMR)</span><span>' + nf(c.bmr) + " kcal</span></div>" +
      '<div class="mrow" style="grid-template-columns:1fr auto"><span>With daily life</span><span>' + nf(c.tdee) + " kcal</span></div>" +
      '<div class="mrow" style="grid-template-columns:1fr auto"><span>' + (p.goal === "gain" ? "Surplus" : p.goal === "lose" ? "Fat-loss gap" : "Gap") + '</span><span>' + (c.deficit < 0 ? "+" : "−") + nf(Math.abs(c.deficit)) + " kcal</span></div>" +
      '<div class="mrow" style="grid-template-columns:1fr auto"><span>Eating target</span><span>' + nf(c.target) + " kcal</span></div>" +
      '<p class="hint">BMR uses the Mifflin-St Jeor formula. Walking goal starts from your daily activity and rises 500 steps a week.</p></section>' +
      '<section class="card full"><h2>Habits that work</h2><div>' + tips.map(function (t, i) { return '<div class="tip"><span class="n">' + (i + 1) + "</span><div><b>" + t[0] + "</b><span>" + t[1] + "</span></div></div>"; }).join("") + "</div></section></div>" +
      '<p class="hint">Healthify gives general fitness estimates, not medical advice. See a doctor before starting if you have heart, blood pressure, diabetes or joint problems, or if you feel chest pain, dizziness or unusual breathlessness while exercising.</p></div>';
  }

  /* ================= site: routes, chrome, pages ================= */
  var ROUTES = ["home", "features", "about", "developers", "contact", "tracker", "profile"];
  function routeFromHash() { var h = (location.hash || "").replace("#", ""); return ROUTES.indexOf(h) >= 0 ? h : "home"; }
  state.route = routeFromHash(); state.menu = false; state.contact = "";

  var SI = {
    flame: '<svg viewBox="0 0 24 24"><path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>',
    walk: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.500" r="1.800"/><path d="M9 21l3-6-2-3 1-4 3 2 3 1M12 15l3 2 1 4M10 8L7 10"/></svg>',
    dumb: '<svg viewBox="0 0 24 24"><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/></svg>',
    check: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 12.500l2.500 2.500 4.500-5"/></svg>',
    bowl: '<svg viewBox="0 0 24 24"><path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15l4-5 3 3 4-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.500A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500z"/></svg>'
  };
  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="var(--deep)"/><circle cx="16" cy="16" r="8" fill="none" stroke="var(--accent-deep)" stroke-width="3.500" stroke-dasharray="38 50" stroke-linecap="round" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="2.500" fill="var(--deep-ink)"/></svg>';
  var ORB = '<svg class="orb" viewBox="0 0 620 620" fill="none" aria-hidden="true"><g stroke="var(--deep-ink)" stroke-opacity=".12"><circle cx="310" cy="310" r="300"/><circle cx="310" cy="310" r="240"/><circle cx="310" cy="310" r="180"/></g><circle cx="310" cy="310" r="240" stroke="var(--accent-deep)" stroke-opacity=".75" stroke-width="10" stroke-linecap="round" stroke-dasharray="880 1600" transform="rotate(-70 310 310)"/><circle cx="310" cy="310" r="180" stroke="var(--deep-ink)" stroke-opacity=".35" stroke-width="10" stroke-linecap="round" stroke-dasharray="640 1200" transform="rotate(20 310 310)"/></svg>';
  var NAV = [["home", "Home"], ["features", "Features"], ["about", "About"], ["developers", "Developers"], ["contact", "Contact"]];

  function siteHeader() {
    var links = NAV.map(function (n) { return '<a href="#' + n[0] + '"' + (state.route === n[0] ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("");
    var cta = '<a class="cta" href="#tracker"' + (state.route === "tracker" ? ' aria-current="page"' : "") + ">" + (state.auth ? "Open tracker" : "Start free") + "</a>";
    var me = "";
    if (state.auth) {
      var nm = (state.profile && state.profile.name) || state.auth.user;
      me = '<a class="me" href="#profile"' + (state.route === "profile" ? ' aria-current="page"' : "") + '><span class="av">' + esc(nm.charAt(0).toUpperCase()) + "</span>Profile</a>" + '<button class="so" data-act="signout">Sign out</button>';
    } else {
      me = '<a href="#profile"' + (state.route === "profile" ? ' aria-current="page"' : "") + ">Sign in</a>";
    }
    return '<header class="site-h"><div class="wrap"><a class="logo" href="#home">' + LOGO + "Healthify</a><nav class=\"links\" aria-label=\"Main\">" + links + me + cta + '</nav><button class="ib burger" data-act="menu" aria-label="Menu" aria-expanded="' + state.menu + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="' + (state.menu ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16") + '"/></svg></button></div>' +
      (state.menu ? '<nav class="drawer" aria-label="Main"><div class="wrap">' + links + me + cta + "</div></nav>" : "") + "</header>";
  }
  function siteFooter() {
    return '<footer class="foot"><div class="wrap"><div><a class="logo" href="#home" style="display:flex">' + LOGO + "Healthify</a><p>A free daily fitness and nutrition tracker. It works out your calories, steps and workouts from your own numbers.</p></div>" +
      '<div><h4>Explore</h4><a href="#home">Home</a><a href="#features">Features</a><a href="#about">About</a><a href="#tracker">Tracker</a></div>' +
      '<div><h4>Company</h4><a href="#developers">Developers</a><a href="#contact">Contact us</a><a href="#contact">Help and FAQ</a></div>' +
      '<div class="legal">&copy; 2026 Healthify. Healthify gives general fitness estimates and is not medical advice. Talk to a doctor before big changes to your diet or training.</div></div></footer>';
  }
  function band(title, lead, eyebrow) {
    return '<section class="lp ph">' + ORB + '<div class="wrap lp-in"><div><span class="eyebrow">' + eyebrow + '</span><h1 class="lp-h">' + title + '</h1><p class="lp-p">' + lead + "</p></div></div></section>";
  }
  function fcard(ic, t, p) { return '<div class="fcard"><span class="ico">' + SI[ic] + "</span><h3>" + t + "</h3><p>" + p + "</p></div>"; }
  function cta(text) { return '<section class="cta-band"><div class="wrap"><h2 class="sh">' + text + '</h2><a class="btn pri lg" href="#tracker">Build my plan</a></div></section>'; }

  function pageHome() {
    var mock = '<div class="mock"><div class="mh"><b>Push day</b><span class="badge">Example day</span></div><div class="rings">' +
      ring(0.72, "var(--accent)", "7,412", "Steps of 10,000") + ring(0.55, "var(--violet)", "380", "Burned of 690") + ring(0.8, "var(--good)", "1,480", "Eaten of 1,850") + "</div>" +
      ["Push day workout|6 of 8 done", "Walk 10,000 steps|74%", "Drink 2.6 L of water|8 glasses", "Reach 120 g protein|98 g"].map(function (r, i) {
        var p = r.split("|"); return '<div class="row2' + (i === 0 ? " on" : "") + '"><span class="box" style="' + (i === 0 ? "background:var(--good);border-color:var(--good)" : "") + '">' + (i === 0 ? IC.ck.replace("<svg", '<svg style="opacity:1;stroke:#fff"') : "") + "</span><span>" + p[0] + "</span><span>" + p[1] + "</span></div>";
      }).join("") + "</div>";
    var days = ["Upper", "Lower", "Rest", "Upper", "Lower", "Rest", "Rest"];
    var week = days.map(function (n, i) { return '<div class="wk' + (n !== "Rest" ? " on" : "") + '"><b>' + DN[i] + "</b><span>" + (n === "Rest" ? "Walk and stretch" : n + " body") + "</span></div>"; }).join("");
    return '<section class="lp">' + ORB + '<div class="wrap lp-in"><div><span class="eyebrow">Free fitness and nutrition tracker</span><h1 class="lp-h">Know what to eat, how far to walk and what to lift <em>today</em>.</h1><p class="lp-p">Healthify turns your age, weight and goal into a daily calorie target, a walking goal and a weekly gym or home workout plan. Then it tracks your day with you.</p>' +
      '<div class="lp-btns"><a class="btn pri lg" href="#tracker">Build my plan</a><a class="btn deep lg" href="#features">See features</a></div>' +
      '<div class="lp-facts"><span>3 to 6 workout days a week</span><span>Gym or home</span><span>Password protected</span></div></div>' + mock + "</div></section>" +

      '<section class="sec"><div class="wrap"><div class="sec-h"><h2 class="sh">Your plan in three steps</h2><p class="lead">It takes about a minute to set up. After that, you open it each day and follow the list.</p></div><div class="steps3">' +
      '<div class="st"><h3>Tell us about you</h3><p>Enter your age, height, weight, goal, experience and where you train.</p></div>' +
      '<div class="st"><h3>Get your numbers</h3><p>See your calories, protein, water, steps and a full week of workouts, worked out from your details.</p></div>' +
      '<div class="st"><h3>Tick off your day</h3><p>Log workouts, steps, meals, water and sleep. Watch your fat-loss pace and weight trend.</p></div></div></div></section>' +

      '<section class="sec alt"><div class="wrap"><div class="sec-h"><h2 class="sh">Everything for a healthier day</h2><p class="lead">One place for training, food and habits, so you are not juggling five apps.</p></div><div class="grid3">' +
      fcard("flame", "Calorie and fat-burn estimates", "A daily eating target from your body and goal, plus an estimate of the body fat you burn.") +
      fcard("walk", "A walking goal that grows", "Starts at a level you can reach and rises 500 steps a week, with km, minutes and calories.") +
      fcard("dumb", "Gym and home workouts", "52 exercises, with sets, reps and rest worked out for your level and goal.") +
      fcard("check", "Daily task list", "Seven clear tasks each day, from workout to stretching, with a daily score.") +
      fcard("bowl", "Food and protein log", "Add meals with calories and protein and see what is left to eat today.") +
      fcard("chart", "Progress you can see", "Weight trend, 7-day steps and calories burned, and an estimated date for your target.") +
      '</div><p style="margin-top:22px"><a class="btn lg" href="#features">Explore all features</a></p></div></section>' +

      '<section class="sec"><div class="wrap"><div class="split"><div class="plain"><h2 class="sh">A week that fits your life</h2><p class="lead">Pick 3 to 6 workout days. Healthify splits the week into upper and lower body, or push, pull and legs, and fills the rest days with an easy walk and stretching.</p><ul class="checks"><li>Beginner, intermediate and advanced levels</li><li>More cardio finishers when your goal is fat loss</li><li>Heavier, lower-rep sets when your goal is muscle</li></ul></div><div class="fcard"><h2>Example 4-day week</h2><div class="week">' + week + "</div><p>Rest days keep a short recovery walk and 10 minutes of mobility, so you stay moving without overdoing it.</p></div></div></div></section>" +
      cta("Ready to see your plan?");
  }

  function pageFeatures() {
    return band("Features", "Training, nutrition and daily habits in one tracker, built around your own numbers.", "What you get") +
      '<section class="sec"><div class="wrap"><div class="grid3">' +
      fcard("flame", "Personal calorie target", "Uses the Mifflin-St Jeor formula for your resting burn, adds your daily activity, then applies a safe gap to lose fat or a small surplus to build muscle.") +
      fcard("walk", "Daily walking goal", "Your step goal depends on how active you are and whether you want to lose fat. It rises by 500 steps each week up to a cap, so progress stays realistic.") +
      fcard("dumb", "Weekly workout plan", "Choose gym or home, 3 to 6 days and your level. Each day lists exercises, sets, reps, rest, time and calories, with a warm-up, cardio finisher and cool-down.") +
      fcard("check", "Daily tasks and score", "Workout, steps, water, calories, protein, sleep and stretching. Most tick themselves from what you log, so your score is always up to date.") +
      fcard("bowl", "Food and protein log", "Add each meal with its calories and protein. See calories left to eat and the body fat you burn if you finish the day on target.") +
      fcard("drop", "Water, sleep and weight", "Tap glasses to track water against a goal set from your body weight. Log sleep in half hours and weight whenever you weigh in.") +
      fcard("chart", "Progress charts", "A weight trend line, 7-day steps against your goal and calories burned by activity, plus how many workouts you finished this week.") +
      fcard("moon", "Light and dark modes", "Follows your device setting so it is easy to read in a bright gym or late at night.") +
      fcard("lock", "Password-protected accounts", "Create an account with a username and password. Your plan and logs are encrypted with your password in your browser before they are saved.") +
      '</div></div></section>' +
      '<section class="sec alt"><div class="wrap"><div class="split"><div class="plain"><h2 class="sh">How your numbers are worked out</h2><p class="lead">No black box. These are the standard methods used by dietitians and trainers.</p></div><div class="tbl"><table><thead><tr><th>Number</th><th>Method</th></tr></thead><tbody>' +
      "<tr><td>Resting burn</td><td>Mifflin-St Jeor equation from weight, height, age and sex</td></tr>" +
      "<tr><td>Daily burn</td><td>Resting burn times an activity factor from 1.2 to 1.725</td></tr>" +
      "<tr><td>Fat loss gap</td><td>Up to 500 kcal a day or 20 percent, never below 1,200 kcal (women) or 1,500 kcal (men)</td></tr>" +
      "<tr><td>Protein</td><td>1.6 g per kg to lose fat or build muscle, 1.2 g per kg to maintain</td></tr>" +
      "<tr><td>Exercise calories</td><td>(MET &minus; 1) &times; body weight in kg &times; hours</td></tr>" +
      "<tr><td>Fat equivalent</td><td>About 7,700 kcal for each kg of body fat</td></tr></tbody></table></div></div></div></section>" +
      cta("Try every feature free");
  }

  function pageAbout() {
    return band("About Healthify", "We think a good health plan should be clear, personal and honest about what it can and cannot tell you.", "Our story") +
      '<section class="sec"><div class="wrap"><div class="split"><div class="plain"><h2 class="sh">Why Healthify exists</h2><p>Most people know they should eat better and move more. What they lack is a simple answer to three daily questions: how much should I eat, how far should I walk, and what should I train today?</p><p>Healthify answers those from your own age, weight, goal and experience, then gives you one place to check them off. No guesswork, no huge menus, no pressure.</p></div><div class="fcard"><h2>What we stand for</h2><ul class="checks"><li><b>Plain numbers.</b> Every target shows how it was worked out.</li><li><b>Small steps.</b> Walking goals grow slowly so you can keep up.</li><li><b>Strength first.</b> Lifting protects muscle while you lose fat.</li><li><b>Rest counts.</b> Recovery days are part of the plan.</li></ul></div></div></div></section>' +
      '<section class="sec alt"><div class="wrap"><div class="sec-h"><h2 class="sh">What to expect</h2></div><div class="grid3">' +
      fcard("flame", "Estimates, not promises", "Calorie and fat-burn figures are estimates based on averages. Your body may differ, so adjust as you see results.") +
      fcard("lock", "Your data stays yours", "Your profile and logs are encrypted with your password before they are saved. Healthify does not run ads or tracking scripts.") +
      fcard("check", "Not medical advice", "Healthify is a fitness tool. Check with a doctor if you have a health condition, are pregnant, are under 18 or take medication.") +
      "</div></div></section>" + cta("Start with your own numbers");
  }

  function pageDevelopers() {
    return band("Developers", "How Healthify is built, how it calculates, and how its data is stored.", "Under the hood") +
      '<section class="sec"><div class="wrap"><div class="grid3">' +
      fcard("check", "Plain web stack", "One page in HTML, CSS and JavaScript with no framework and no tracking. Routes use the URL hash, so every page has a shareable link.") +
      fcard("lock", "Encrypted accounts", "Each account is one AES-GCM encrypted document. The key comes from the password with PBKDF2 (210,000 rounds), so the password is never stored. Without the artifact database it falls back to browser storage.") +
      fcard("chart", "Deterministic plans", "Workout plans are generated by rules from your profile, so the same inputs always give the same week. No AI model is called at run time.") +
      '</div></div></section>' +
      '<section class="sec alt"><div class="wrap"><div class="sec-h"><h2 class="sh">Formulas</h2><p class="lead">All constants in one place, so you can check or change them.</p></div><div class="tbl"><table><thead><tr><th>Value</th><th>Formula or constant</th></tr></thead><tbody>' +
      "<tr><td>BMR</td><td><code>10&middot;kg + 6.25&middot;cm &minus; 5&middot;age + 5</code> (men), <code>&minus;161</code> (women)</td></tr>" +
      "<tr><td>Eating target</td><td><code>BMR &times; activity &minus; gap</code>, gap <code>min(500, 20%)</code></td></tr>" +
      "<tr><td>Exercise kcal</td><td><code>(MET &minus; 1) &times; kg &times; minutes / 60</code></td></tr>" +
      "<tr><td>Walking</td><td>0.75 m per step, 105 steps per minute, <code>km &times; kg &times; 0.55</code> kcal</td></tr>" +
      "<tr><td>Water</td><td><code>0.035 L &times; kg</code>, shown as 250 ml glasses</td></tr>" +
      "<tr><td>Step goal</td><td>Base 5,000 to 9,500 by activity, +1,000 to lose fat, +500 each week up to a cap</td></tr></tbody></table></div></div></section>" +
      '<section class="sec"><div class="wrap"><div class="plain"><h2 class="sh">Data model</h2><p class="lead">Each account is stored as one encrypted vault.</p><p>The encrypted payload contains a profile and daily logs keyed by date. The stored vault includes the encryption salt, initialization vector, ciphertext, and save time; profile and log values are not stored as readable fields. Healthify uses the configured database or falls back to browser storage.</p></div></div></section>' +
      '<section class="sec alt"><div class="wrap"><div class="sec-h"><h2 class="sh">Known limits</h2></div><ul class="checks"><li>A forgotten password cannot be recovered. Anyone with access to the page could overwrite or delete an encrypted account, though they cannot read it.</li><li>Steps are typed in. There is no sync with watches or phone health apps yet.</li><li>Calories use averages and do not account for individual differences.</li><li>The exercise library has 52 moves. It does not include injury-specific programs.</li></ul></div></section>' +
      cta("See it working");
  }

  function pageContact() {
    var faq = [
      ["Is Healthify free?", "Yes. You can build a plan and use every feature without paying."],
      ["Is my data private?", "Yes. Your plan and logs are encrypted with your password in your browser before they are saved, so nobody else can read them."],
      ["What if I forget my password?", "You can erase the encrypted account data and start over with the same username, but the old plan and logs cannot be recovered."],
      ["How accurate are the calories?", "They are estimates from standard formulas. Use them as a starting point, check your weight trend over two to three weeks and adjust."],
      ["Can I train at home?", "Yes. Choose Home when you set up and every workout uses bodyweight moves only."],
      ["Does it connect to my watch?", "Not yet. Type in your step count once a day, or add 1,000 at a time."],
      ["Is it safe for me?", "It suits healthy adults. If you have a medical condition, are pregnant or under 18, ask a doctor first."]
    ].map(function (q) { return '<details class="faq"><summary>' + q[0] + "</summary><p>" + q[1] + "</p></details>"; }).join("");
    var st = state.contact;
    var form = st === "sent" ? '<div class="cform"><h3>Message sent</h3><p class="sub">Thanks. We read every message.</p><button class="btn" data-act="contact-again">Send another</button></div>' :
      '<form id="contact" class="cform"><h3>Send us a message</h3>' +
      '<div class="fg"><div class="f"><label for="c-name">Your name</label><input class="in" id="c-name" maxlength="60" required autocomplete="name"></div><div class="f"><label for="c-email">Email (optional)</label><input class="in" id="c-email" type="email" maxlength="100" autocomplete="email"></div></div>' +
      '<div class="f"><label for="c-topic">Topic</label><select class="in" id="c-topic"><option>Question</option><option>Feedback</option><option>Report a problem</option><option>Feature idea</option></select></div>' +
      '<div class="f"><label for="c-msg">Message</label><textarea class="in" id="c-msg" maxlength="1500" required></textarea></div>' +
      (st === "error" ? '<p class="note" role="alert">Your message could not be sent. Check your connection and try again.</p>' : "") +
      '<button class="btn pri big" type="submit">Send message</button></form>';
    return band("Contact us", "Questions, feedback or a problem? Send a message and we will get back to you.", "We read everything") +
      '<section class="sec"><div class="wrap"><div class="split"><div>' + form + '</div><div class="plain"><h2 class="sh" style="font-size:30px">Quick answers</h2><div>' + faq + "</div></div></div></div></section>";
  }

  function profileHTML() {
    if (state.loading) return '<div class="app-page"><div class="wrap"><p class="sub" style="padding:60px 0;text-align:center">Loading…</p></div></div>';
    if (!state.auth) return authView();
    if (state.setup || !state.profile) return '<div class="app-page"><div class="wrap" style="max-width:680px">' + viewSetup() + "</div></div>";
    return '<div class="app-page"><div class="wrap" style="max-width:720px">' + viewProfile() + "</div></div>";
  }
  function trackerHTML() {
    if (!state.loading && !state.auth) return authView();
    if (state.loading) return '<div class="app-page"><div class="wrap"><p class="sub" style="padding:60px 0;text-align:center">Loading your plan…</p></div></div>';
    if (!state.profile || state.setup) return '<div class="app-page"><div class="wrap" style="max-width:680px">' + viewSetup() + "</div></div>";
    var body = state.tab === "today" ? viewToday() : state.tab === "plan" ? viewPlan() : state.tab === "progress" ? viewProgress() : viewLife();
    var tabs = [["today", "Today"], ["plan", "Plan"], ["progress", "Progress"], ["life", "Lifestyle"]].map(function (t) {
      return '<button data-act="tab" data-v="' + t[0] + '"' + (state.tab === t[0] ? ' aria-current="page"' : "") + ">" + IC[t[0]] + t[1] + "</button>";
    }).join("");
    return '<div class="app-page"><div class="wrap"><div class="shell"><div class="appnav"><div>' + tabs + "</div></div><div>" + body + "</div></div></div></div>";
  }

  function render() {
    var a = document.activeElement, keep = a && a.id ? a.id : null, r = state.route;
    var page = r === "tracker" ? trackerHTML() : r === "features" ? pageFeatures() : r === "about" ? pageAbout() : r === "developers" ? pageDevelopers() : r === "contact" ? pageContact() : r === "profile" ? profileHTML() : pageHome();
    app.innerHTML = siteHeader() + "<main>" + page + "</main>" + siteFooter();
    if (keep) { var el = document.getElementById(keep); if (el && el.tagName !== "BUTTON") el.focus(); }
  }
  window.addEventListener("hashchange", function () { state.route = routeFromHash(); state.menu = false; render(); window.scrollTo(0, 0); });

  /* ================= events ================= */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el || el.disabled) return;
    var act = el.getAttribute("data-act"), v = el.getAttribute("data-v"), date = state.date, d = day(date);
    if (act === "tab") { state.tab = v; render(); window.scrollTo(0, 0); }
    else if (act === "day") { var n = v === "0" ? today() : shift(date, Number(v)); if (n <= today()) { state.date = n; render(); } }
    else if (act === "ex") { var dn = Object.assign({}, d.done || {}); if (dn[v]) delete dn[v]; else dn[v] = true; setDay(date, { done: dn }); }
    else if (act === "stretch") setDay(date, { stretch: !d.stretch });
    else if (act === "glass") { var g = Number(v); setDay(date, { water: num(d.water) === g ? g - 1 : g }); }
    else if (act === "steps") setDay(date, { steps: clamp(num(d.steps) + Number(v), 0, 100000) });
    else if (act === "delmeal") { var ms = meals(date).slice(); ms.splice(Number(v), 1); setDay(date, { meals: ms }); }
    else if (act === "open") { state.open = state.open === Number(v) ? null : Number(v); render(); }
    else if (act === "setup") { state.setup = true; render(); window.scrollTo(0, 0); }
    else if (act === "cancel-setup") { state.setup = false; render(); }
    else if (act === "authmode") { state.authMode = v; state.authErr = ""; state.resetUser = ""; var ui = document.getElementById("a-user"); if (ui) state.authUser = ui.value; render(); }
    else if (act === "forgot-password") { var userInput = document.getElementById("a-user"); if (userInput) state.authUser = userInput.value; state.authMode = "reset"; state.resetUser = ""; state.authErr = ""; render(); }
    else if (act === "cancel-reset") { state.authMode = "in"; state.resetUser = ""; state.authErr = ""; render(); }
    else if (act === "signout") signOut();
    else if (act === "delacct") { if (!state.confirmDel) { state.confirmDel = true; render(); } else { var a0 = state.auth; dropVault(a0.id).then(function () { state.auth = null; state.profile = null; state.days = {}; state.confirmDel = false; toast("Account deleted."); render(); window.scrollTo(0, 0); }).catch(function () { toast("Could not delete the account."); }); } }
    else if (act === "delcancel") { state.confirmDel = false; render(); }
    else if (act === "menu") { state.menu = !state.menu; render(); }
    else if (act === "contact-again") { state.contact = ""; render(); }
  });
  document.addEventListener("change", function (e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-f"); if (!f) return;
    var n = parseFloat(e.target.value), date = state.date;
    if (f === "steps") setDay(date, { steps: isNaN(n) ? 0 : clamp(r0(n), 0, 100000) });
    if (f === "sleep") setDay(date, { sleep: isNaN(n) ? 0 : clamp(Math.round(n * 2) / 2, 0, 16) });
    if (f === "weight") setDay(date, { weight: isNaN(n) ? 0 : clamp(r1(n), 35, 250) });
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "setup") submitSetup();
    else if (e.target.id === "auth-reset") {
      var resetUsername = document.getElementById("a-user").value.trim();
      state.authUser = resetUsername;
      if (!/^[A-Za-z0-9._-]{3,30}$/.test(resetUsername)) { authFail("Username must be 3 to 30 letters, numbers, dots, dashes or underscores."); return; }
      state.authBusy = true; state.authErr = ""; render();
      vaultId(resetUsername).then(function (id) {
        return getVault(id).then(function (doc) {
          if (!doc) throw { m: "No account found with that username." };
          state.resetUser = resetUsername; state.authBusy = false; state.authErr = ""; render();
        });
      }).catch(function (err) { authFail(err && err.m ? err.m : "Could not check the account. Check your connection and try again."); });
    }
    else if (e.target.id === "reset-confirm") {
      var confirmUsername = document.getElementById("reset-confirm-username").value.trim();
      if (confirmUsername.toLowerCase() !== state.resetUser.toLowerCase()) { authFail("The username does not match. No data was deleted."); return; }
      var resetAccount = state.resetUser;
      state.authBusy = true; state.authErr = ""; render();
      vaultId(resetAccount).then(function (id) { return dropVault(id); }).then(function () {
        state.authUser = resetAccount; state.resetUser = ""; state.authMode = "up"; state.authBusy = false;
        state.authErr = "Saved data was permanently erased. Create a new account with a new password.";
        render();
      }).catch(function () { authFail("Could not erase the account. Check your connection and try again."); });
    }
    else if (e.target.id === "auth") {
      var u = document.getElementById("a-user").value.trim(), pw = document.getElementById("a-pw").value, p2 = document.getElementById("a-pw2");
      state.authUser = u;
      if (!/^[A-Za-z0-9._-]{3,30}$/.test(u)) { authFail("Username must be 3 to 30 letters, numbers, dots, dashes or underscores."); return; }
      if (state.authMode === "up") {
        if (pw.length < 8) { authFail("Password needs at least 8 characters."); return; }
        if (p2 && p2.value !== pw) { authFail("The two passwords do not match."); return; }
      }
      if (!window.crypto || !crypto.subtle) { authFail("This browser cannot encrypt data, so accounts are unavailable."); return; }
      state.authBusy = true; state.authErr = ""; render();
      if (state.authMode === "up") doSignup(u, pw); else doLogin(u, pw);
    }
    else if (e.target.id === "nameform") {
      var nn = document.getElementById("p-name").value.trim();
      saveProfile(Object.assign({}, state.profile, { name: nn })); toast("Name saved."); render();
    }
    else if (e.target.id === "chpw") {
      var n1 = document.getElementById("pw-new").value, n2 = document.getElementById("pw-new2").value;
      if (n1.length < 8) { toast("New password needs at least 8 characters."); return; }
      if (n1 !== n2) { toast("The two passwords do not match."); return; }
      var s2 = crypto.getRandomValues(new Uint8Array(16));
      deriveKey(n1, s2).then(function (k) { state.auth.key = k; state.auth.salt = b64(s2); return saveVault(); }).then(function () { toast("Password changed."); render(); });
    }
    else if (e.target.id === "contact") {
      var dbm = store.dbm, gv = function (id) { return document.getElementById(id).value.trim(); };
      var m = { name: gv("c-name"), email: gv("c-email"), topic: gv("c-topic"), msg: gv("c-msg"), at: Date.now() };
      if (!m.name || !m.msg) { toast("Add your name and a message."); return; }
      if (!dbm || !store.uid) { toast("Messages cannot be sent from this view. Try again from the signed-in page."); return; }
      dbm.collection("messages/" + store.uid + "/items").add(m).then(function () { state.contact = "sent"; render(); }).catch(function () { toast("Your message could not be sent. Check your connection and try again."); });
    }
    else if (e.target.id === "meal") {
      var name = document.getElementById("m-n").value.trim(), k = parseFloat(document.getElementById("m-k").value), pr = parseFloat(document.getElementById("m-p").value);
      if (!name || isNaN(k) || k <= 0) { toast("Enter a meal name and its calories."); return; }
      setDay(state.date, { meals: meals(state.date).concat([{ n: name, k: r0(k), p: isNaN(pr) ? 0 : r0(pr) }]) });
      var nm = document.getElementById("m-n"); if (nm) nm.focus();
    }
  });

  /* ================= start-up ================= */
  render();
  (function init() {
    var c = window.claude;
    function done() { if (state.loading) { state.loading = false; render(); } }
    if (!c || !c.use) { done(); return; }
    Promise.all([c.use("db"), c.use("user")]).then(function (r) {
      store.dbm = r[0];
      return r[0] && r[1] ? r[1].id().catch(function () { return null; }) : null;
    }).then(function (id) { store.uid = id; done(); }).catch(done);
    setTimeout(done, 2500);
  })();
})();
