/* GardenPedia auth gate.
   A local, client-side convenience gate. NOT secure: on a static site anyone with
   the files can bypass it, and it does not protect the API key. Accounts and the
   session live in this browser's local storage only.

   A default administrator is always available: username "admin", password "password". */
(function () {
  "use strict";

  const USERS_KEY = "gp_users";
  const SESSION_KEY = "gp_session";
  const $ = (s, r) => (r || document).querySelector(s);

  function loadUsers() {
    try { const u = JSON.parse(localStorage.getItem(USERS_KEY)); if (Array.isArray(u)) return u; } catch (_) {}
    return [];
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  // Ensure the admin account always exists, without disturbing other accounts.
  function seed() {
    const u = loadUsers();
    if (!u.some(x => (x.email || "").toLowerCase() === "admin")) {
      u.push({ name: "Administrator", email: "admin", password: "password", role: "admin" });
      saveUsers(u);
    }
    return u;
  }

  function findUser(id) {
    const k = String(id || "").trim().toLowerCase();
    return loadUsers().find(x => (x.email || "").toLowerCase() === k);
  }

  const setSession = (email) => localStorage.setItem(SESSION_KEY, email);
  const getSession = () => localStorage.getItem(SESSION_KEY) || "";
  const clearSession = () => localStorage.removeItem(SESSION_KEY);

  const lock = () => document.body.classList.add("locked");
  const unlock = () => document.body.classList.remove("locked");

  function msg(which, text, kind) {
    const n = $("#auth-" + which + "-msg");
    n.textContent = text || "";
    n.classList.toggle("is-on", !!text);
    n.classList.toggle("is-error", kind === "error");
  }
  function clearMsgs() { msg("signin", ""); msg("create", ""); }

  function showSignin() { $("#auth-signin").hidden = false; $("#auth-create").hidden = true; clearMsgs(); }
  function showCreate() { $("#auth-signin").hidden = true; $("#auth-create").hidden = false; clearMsgs(); }

  function enterApp(user) {
    unlock();
    const who = $("#whoami");
    if (who) who.textContent = user.name || user.email;
    window.scrollTo(0, 0);
  }

  function doSignin() {
    const email = $("#auth-si-email").value.trim();
    const pass = $("#auth-si-pass").value;
    if (!email || !pass) { msg("signin", "Enter your email and password.", "error"); return; }
    const u = findUser(email);
    if (!u || u.password !== pass) { msg("signin", "Those details were not recognised.", "error"); return; }
    setSession(u.email);
    enterApp(u);
  }

  function doCreate() {
    const name = $("#auth-cr-name").value.trim();
    const email = $("#auth-cr-email").value.trim();
    const p1 = $("#auth-cr-pass").value, p2 = $("#auth-cr-confirm").value;
    if (!name || !email || !p1) { msg("create", "Fill in every field.", "error"); return; }
    if (p1 !== p2) { msg("create", "The passwords do not match.", "error"); return; }
    if (findUser(email)) { msg("create", "An account with that email already exists.", "error"); return; }
    const u = loadUsers();
    u.push({ name, email, password: p1, role: "editor" });
    saveUsers(u);
    setSession(email);
    enterApp({ name, email, role: "editor" });
  }

  function signOut() {
    clearSession();
    $("#auth-si-email").value = ""; $("#auth-si-pass").value = "";
    lock(); showSignin();
  }

  document.addEventListener("DOMContentLoaded", function () {
    seed();

    $("#auth-to-create").addEventListener("click", e => { e.preventDefault(); showCreate(); });
    $("#auth-to-signin").addEventListener("click", e => { e.preventDefault(); showSignin(); });
    $("#auth-si-btn").addEventListener("click", doSignin);
    $("#auth-cr-btn").addEventListener("click", doCreate);
    $("#auth-signin").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); doSignin(); } });
    $("#auth-create").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); doCreate(); } });
    const so = $("#signout"); if (so) so.addEventListener("click", signOut);

    const sess = getSession();
    const u = sess && findUser(sess);
    if (u) enterApp(u); else { lock(); showSignin(); }
  });
})();
