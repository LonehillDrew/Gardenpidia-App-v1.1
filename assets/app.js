/* GardenPedia workbench: front-end logic with multi-user and multi-provider support */
(function () {
  "use strict";

  const GP = window.GP;
  const AUTH = window.AUTH;

  /* ---- User-scoped Storage ---- */
  const STORE = {
    get key() {
      const provider = AUTH.currentUser?.aiProvider || "claude";
      if (provider === "claude") {
        return AUTH.currentUser?.claudeKey || localStorage.getItem("gp_admin_claude_key") || "";
      } else if (provider === "chatgpt") {
        return AUTH.currentUser?.chatgptKey || "";
      }
      return "";
    },
    get model() { return localStorage.getItem("gp_model") || GP.DEFAULT_MODEL; },
    set model(v) { localStorage.setItem("gp_model", v); },
    get chatHistory() { try { return JSON.parse(localStorage.getItem("gp_chat_history_" + AUTH.currentUser.email) || "[]"); } catch(_) { return []; } },
    set chatHistory(v) { localStorage.setItem("gp_chat_history_" + AUTH.currentUser.email, JSON.stringify(v)); },
    get aiProvider() { return AUTH.currentUser?.aiProvider || "claude"; },
    get claudePlan() { return AUTH.currentUser?.claudePlan || "pro"; }
  };

  /* ---- Tiny helpers ---- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const esc = (s) => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const paragraphs = (text) =>
    esc(text).split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

  const validateInput = (value, fieldName) => {
    if (!value || value.trim().length === 0) return `${fieldName} cannot be empty`;
    if (value.trim().length > 1000) return `${fieldName} is too long (max 1000 characters)`;
    return null;
  };

  /* ---- Claude API (Browser, bring-your-own-key or admin bypass) ---- */
  async function callClaude({ system, messages, max_tokens = 2000, model }) {
    const key = STORE.key;
    const plan = STORE.claudePlan;

    if (!key) {
      if (plan === "pro" && AUTH.isAdmin()) {
        const e = new Error("Admin Claude Pro key not configured. Please set it in Settings.");
        e.code = "NO_ADMIN_KEY";
        throw e;
      } else if (plan === "free") {
        const e = new Error("Free plan requires an API key. Please configure your provider in Settings.");
        e.code = "NO_KEY";
        throw e;
      }
      const e = new Error("No API key set. Please configure your provider.");
      e.code = "NO_KEY";
      throw e;
    }

    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: model || STORE.model, max_tokens, system, messages })
      });
    } catch (err) {
      const e = new Error("Could not reach the Anthropic API. Check your connection.");
      e.code = "NETWORK";
      throw e;
    }

    if (!res.ok) {
      let detail = "";
      try { const j = await res.json(); detail = (j.error && j.error.message) || JSON.stringify(j); } catch (_) {}
      let msg;
      if (res.status === 401) msg = "The API key was rejected. Check it in Settings.";
      else if (res.status === 429) msg = "Rate limit reached. Wait a moment and try again.";
      else if (res.status === 400) msg = "The request was rejected: " + (detail || "bad request") + ".";
      else msg = "Request failed (" + res.status + "). " + detail;
      const e = new Error(msg);
      e.status = res.status;
      throw e;
    }

    const data = await res.json();
    return data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  }

  /* ---- Routing ---- */
  function show(view) {
    $$(".view").forEach(v => (v.hidden = v.id !== "view-" + view));
    $$(".nav-link").forEach(b => {
      const on = b.dataset.view === view;
      b.classList.toggle("is-active", on);
      if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    if (location.hash !== "#" + view) history.replaceState(null, "", "#" + view);
    const main = $("#workspace");
    if (main) main.scrollTop = 0;
  }

  /* ---- Connection badge ---- */
  function refreshStatus() {
    const user = AUTH.currentUser;
    const provider = STORE.aiProvider;
    const dot = $("#status-dot"), label = $("#status-label"), modelTag = $("#status-model"), userTag = $("#status-user");

    if (userTag && user) {
      userTag.textContent = user.name + " · ";
    }

    const hasKey = !!STORE.key;
    dot.classList.toggle("is-on", hasKey);
    label.textContent = hasKey ? provider.charAt(0).toUpperCase() + provider.slice(1) + " ready" : "No provider";

    if (provider === "claude") {
      const m = GP.MODELS.find(x => x.id === STORE.model);
      modelTag.textContent = m ? m.label.split("  ")[0] : STORE.model;
    } else if (provider === "chatgpt") {
      modelTag.textContent = "GPT-4";
    } else {
      modelTag.textContent = "Copilot";
    }
  }

  /* ===== CHAT ===== */
  const chat = { messages: [], busy: false };

  function chatRender() {
    const log = $("#chat-log");
    log.innerHTML = "";
    if (!chat.messages.length) {
      log.appendChild(el("p", "muted-note",
        "Ask anything. Every message is reframed into RCTIO and answered under GardenPedia house rules."));
    }
    chat.messages.forEach(m => {
      const row = el("div", "bubble bubble-" + m.role);
      row.innerHTML = paragraphs(m.content);
      log.appendChild(row);
    });
    if (chat.busy) {
      const t = el("div", "bubble bubble-assistant thinking");
      t.appendChild(el("span", "dot")); t.appendChild(el("span", "dot")); t.appendChild(el("span", "dot"));
      log.appendChild(t);
    }
    log.scrollTop = log.scrollHeight;
  }

  function saveChatHistory() {
    STORE.chatHistory = chat.messages;
  }

  function loadChatHistory() {
    const saved = STORE.chatHistory;
    if (saved && saved.length > 0) {
      chat.messages = saved;
      chatRender();
    }
  }

  async function chatSend() {
    const input = $("#chat-input");
    const text = input.value.trim();
    if (!text || chat.busy) return;
    if (!STORE.key) { show("settings"); flash("Configure your AI provider first."); return; }

    const error = validateInput(text, "Message");
    if (error) { flash(error); return; }

    chat.messages.push({ role: "user", content: text });
    input.value = ""; input.style.height = "auto";
    chat.busy = true; chatRender();

    try {
      const reply = await callClaude({
        system: GP.CHAT_SYSTEM,
        messages: chat.messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 2000
      });
      chat.messages.push({ role: "assistant", content: reply || "[MISSING INFO] No content returned." });
      saveChatHistory();
    } catch (e) {
      chat.messages.push({ role: "assistant", content: "Error: " + e.message });
    } finally {
      chat.busy = false; chatRender();
    }
  }

  /* ===== FACT FINDER ===== */
  function metrics(s) {
    return {
      chars: [...s].length,
      words: (s.trim().match(/\S+/g) || []).length,
      spaces: (s.match(/ /g) || []).length,
      sentences: (s.match(/[.!?](?=\s|$)/g) || []).length
    };
  }
  const inRange = (v, [lo, hi]) => v >= lo && v <= hi;

  function specimenCard(item, index) {
    const m = metrics(item.fact || "");
    const checks = [
      ["chars", m.chars, GP.FACT_RANGES.chars],
      ["words", m.words, GP.FACT_RANGES.words],
      ["spaces", m.spaces, GP.FACT_RANGES.spaces],
      ["sentences", m.sentences, GP.FACT_RANGES.sentences]
    ];
    const pass = checks.every(([, v, r]) => inRange(v, r));

    const card = el("article", "specimen " + (pass ? "specimen-pass" : "specimen-fail"));

    const head = el("div", "specimen-head");
    head.appendChild(el("span", "specimen-no", String(index + 1).padStart(2, "0")));
    head.appendChild(el("span", "specimen-cat", item.category || "[MISSING INFO]"));
    head.appendChild(el("span", "specimen-verdict", pass ? "Within format" : "Out of format"));
    card.appendChild(head);

    const body = el("p", "specimen-fact");
    body.innerHTML = paragraphs(item.fact || "[MISSING INFO]");
    card.appendChild(body);

    const label = el("div", "specimen-label");
    checks.forEach(([name, v, r]) => {
      const chip = el("span", "chip " + (inRange(v, r) ? "chip-ok" : "chip-bad"));
      chip.appendChild(el("span", "chip-key", name));
      chip.appendChild(el("span", "chip-val", name === "sentences" ? String(v) : v + " / " + r[0] + "–" + r[1]));
      label.appendChild(chip);
    });
    card.appendChild(label);

    if (item.sources && item.sources.length) {
      const src = el("div", "specimen-sources");
      src.appendChild(el("span", "specimen-sources-key", "Sources"));
      src.appendChild(el("span", "specimen-sources-val", item.sources.join("; ")));
      card.appendChild(src);
    } else {
      const src = el("div", "specimen-sources");
      src.appendChild(el("span", "specimen-sources-key flag", "Sources"));
      src.appendChild(el("span", "specimen-sources-val flag", "[MISSING INFO]"));
      card.appendChild(src);
    }
    return { card, pass };
  }

  let lastFacts = [];

  function renderFacts(items) {
    const out = $("#ff-output");
    out.innerHTML = "";
    lastFacts = items;

    let passes = 0;
    const counts = {};
    GP.FACT_CATEGORIES.forEach(c => (counts[c] = 0));

    const summary = el("div", "ff-summary");
    out.appendChild(summary);

    items.forEach((item, i) => {
      if (counts[item.category] != null) counts[item.category]++;
      const { card, pass } = specimenCard(item, i);
      if (pass) passes++;
      out.appendChild(card);
    });

    const passRate = items.length > 0 ? Math.round((passes / items.length) * 100) : 0;
    summary.innerHTML =
      `<strong>${items.length}</strong> facts returned, ` +
      `<strong>${passes}</strong> within format (${passRate}%), ` +
      `<strong>${items.length - passes}</strong> out of format. ` +
      GP.FACT_CATEGORIES.map(c => `${c}: ${counts[c]}`).join(" · ");

    $("#ff-actions").hidden = items.length === 0;
  }

  async function factFinderRun() {
    if (!STORE.key) { show("settings"); flash("Configure your AI provider first."); return; }
    const scope = $("#ff-scope").value.trim() || "South Africa";
    const topic = $("#ff-topic").value.trim();
    const mode = $("#ff-mode").value;
    const btn = $("#ff-run");
    const out = $("#ff-output");

    const scopeError = validateInput(scope, "Geographic scope");
    if (scopeError) { flash(scopeError); return; }

    const ask = (mode === "all")
      ? `Produce 10 facts for EACH of the four categories, 40 in total.`
      : `Produce 10 facts for the category "${mode}" only.`;
    const topicLine = topic ? ` Theme or focus: ${topic}.` : "";
    const userMsg =
      `Geographic scope: ${scope}.${topicLine} ${ask} Return the JSON array exactly as specified.`;

    btn.disabled = true; btn.textContent = "Generating…";
    out.innerHTML = "";
    out.appendChild(el("p", "muted-note", "Generating and validating against the format ranges…"));

    try {
      const raw = await callClaude({
        system: GP.FACTFINDER_SYSTEM,
        messages: [{ role: "user", content: userMsg }],
        max_tokens: 8000
      });
      const items = parseFactJson(raw);
      if (!items.length) {
        out.innerHTML = "";
        out.appendChild(el("p", "muted-note", "No valid JSON came back. Raw reply below."));
        const pre = el("pre", "raw-dump"); pre.textContent = raw; out.appendChild(pre);
        $("#ff-actions").hidden = true;
        return;
      }
      renderFacts(items);
    } catch (e) {
      out.innerHTML = "";
      out.appendChild(el("p", "error-note", "Error: " + e.message));
      $("#ff-actions").hidden = true;
    } finally {
      btn.disabled = false; btn.textContent = "Generate facts";
    }
  }

  function parseFactJson(raw) {
    let t = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = t.indexOf("["), end = t.lastIndexOf("]");
    if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.filter(x => x && typeof x.fact === "string");
    } catch (_) {}
    return [];
  }

  function factsToMarkdown(items) {
    const date = new Date().toLocaleDateString("en-GB");
    let md = `# GardenPedia Fact Finder\n\nGenerated ${date}.\n\n`;
    GP.FACT_CATEGORIES.forEach(cat => {
      const group = items.filter(i => i.category === cat);
      if (!group.length) return;
      md += `## ${cat}\n\n`;
      group.forEach((i, n) => {
        const m = metrics(i.fact);
        md += `${n + 1}. ${i.fact}\n`;
        md += `   - Metrics: ${m.chars} chars, ${m.words} words, ${m.spaces} spaces, ${m.sentences} sentences\n`;
        md += `   - Sources: ${(i.sources && i.sources.length) ? i.sources.join("; ") : "[MISSING INFO]"}\n\n`;
      });
    });
    return md;
  }

  function download(name, text, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const a = el("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ===== RESEARCH ===== */
  async function researchRun() {
    if (!STORE.key) { show("settings"); flash("Configure your AI provider first."); return; }
    const q = $("#rs-query").value.trim();
    if (!q) { flash("Please enter a research question."); return; }
    const scope = $("#rs-scope").value.trim() || "South Africa";
    const btn = $("#rs-run"), out = $("#rs-output");

    const scopeError = validateInput(scope, "Geographic scope");
    if (scopeError) { flash(scopeError); return; }

    btn.disabled = true; btn.textContent = "Researching…";
    out.innerHTML = "";
    out.appendChild(el("p", "muted-note", "Working…"));

    try {
      const reply = await callClaude({
        system: GP.RESEARCH_SYSTEM,
        messages: [{ role: "user", content: `Geographic scope: ${scope}.\n\n${q}` }],
        max_tokens: 3000
      });
      out.innerHTML = "";
      const block = el("div", "prose");
      block.innerHTML = paragraphs(reply);
      out.appendChild(block);
    } catch (e) {
      out.innerHTML = "";
      out.appendChild(el("p", "error-note", "Error: " + e.message));
    } finally {
      btn.disabled = false; btn.textContent = "Run research";
    }
  }

  /* ===== SETTINGS ===== */
  function settingsInit() {
    const provider = STORE.aiProvider;
    const providerSelect = $("#set-ai-provider");

    // Set initial provider selection
    providerSelect.value = provider;
    updateProviderOptions();

    providerSelect.addEventListener("change", updateProviderOptions);

    // Claude options
    const claudePlanSelect = $("#set-claude-plan");
    claudePlanSelect.value = STORE.claudePlan;

    const claudeKeyInput = $("#set-claude-key");
    claudeKeyInput.value = AUTH.currentUser?.claudeKey || "";

    $("#set-claude-toggle").addEventListener("click", () => {
      claudeKeyInput.type = claudeKeyInput.type === "password" ? "text" : "password";
      $("#set-claude-toggle").textContent = claudeKeyInput.type === "password" ? "Show" : "Hide";
    });

    // ChatGPT options
    const chatgptPlanSelect = $("#set-chatgpt-plan");
    chatgptPlanSelect.value = AUTH.currentUser?.chatgptPlan || "free";

    const chatgptKeyInput = $("#set-chatgpt-key");
    chatgptKeyInput.value = AUTH.currentUser?.chatgptKey || "";

    $("#set-chatgpt-toggle").addEventListener("click", () => {
      chatgptKeyInput.type = chatgptKeyInput.type === "password" ? "text" : "password";
      $("#set-chatgpt-toggle").textContent = chatgptKeyInput.type === "password" ? "Show" : "Hide";
    });

    // Copilot options
    const copilotPlanSelect = $("#set-copilot-plan");
    copilotPlanSelect.value = AUTH.currentUser?.copilotPlan || "free";

    // Save settings
    $("#set-save").addEventListener("click", () => {
      const selectedProvider = providerSelect.value;
      const users = window.getUsers();
      const userEmail = AUTH.currentUser.email;

      users[userEmail].aiProvider = selectedProvider;

      if (selectedProvider === "claude") {
        users[userEmail].claudePlan = claudePlanSelect.value;
        const claudeKey = claudeKeyInput.value.trim();
        if (claudeKey) {
          if (!claudeKey.startsWith("sk-ant-")) {
            flash("Claude API key should start with 'sk-ant-'.");
            return;
          }
          users[userEmail].claudeKey = claudeKey;
          if (AUTH.isAdmin()) {
            localStorage.setItem("gp_admin_claude_key", claudeKey);
          }
        }
      } else if (selectedProvider === "chatgpt") {
        users[userEmail].chatgptPlan = chatgptPlanSelect.value;
        const chatgptKey = chatgptKeyInput.value.trim();
        if (chatgptKey) {
          if (!chatgptKey.startsWith("sk-")) {
            flash("ChatGPT API key should start with 'sk-'.");
            return;
          }
          users[userEmail].chatgptKey = chatgptKey;
        }
      } else if (selectedProvider === "copilot") {
        users[userEmail].copilotPlan = copilotPlanSelect.value;
      }

      AUTH.currentUser.aiProvider = selectedProvider;
      AUTH.currentUser.claudePlan = users[userEmail].claudePlan;
      AUTH.currentUser.claudeKey = users[userEmail].claudeKey;
      AUTH.currentUser.chatgptPlan = users[userEmail].chatgptPlan;
      AUTH.currentUser.chatgptKey = users[userEmail].chatgptKey;
      AUTH.currentUser.copilotPlan = users[userEmail].copilotPlan;

      window.saveUsers(users);
      refreshStatus();
      flash("Settings saved.");
    });

    // Test connection
    $("#set-test").addEventListener("click", async () => {
      const btn = $("#set-test"), res = $("#set-test-result");
      btn.disabled = true;
      btn.textContent = "Testing…";
      res.textContent = "";

      try {
        await callClaude({ messages: [{ role: "user", content: "ping" }], max_tokens: 5 });
        res.textContent = "Connection works!";
        res.className = "test-result ok-note";
      } catch (e) {
        res.textContent = e.message;
        res.className = "test-result error-note";
      } finally {
        btn.disabled = false;
        btn.textContent = "Test Connection";
      }
    });

    // Update user profile display
    const user = AUTH.currentUser;
    $("#user-display-name").textContent = user.name;
    $("#user-display-email").textContent = user.email;
    $("#user-account-type").textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    // Admin section
    if (AUTH.isAdmin()) {
      const adminSection = $("#admin-section");
      adminSection.hidden = false;
      renderTeamMembers();

      $("#invite-member").addEventListener("click", () => {
        const email = prompt("Enter team member email:");
        if (!email) return;

        const users = window.getUsers();
        if (users[email]) {
          flash("User already exists.");
          return;
        }

        users[email] = {
          email,
          name: email.split("@")[0],
          password: hashPassword("welcome123"),
          role: "user",
          aiProvider: "claude",
          claudePlan: "free",
          claudeKey: null,
          chatgptPlan: "free",
          chatgptKey: null,
          copilotPlan: "free",
          createdAt: new Date().toISOString()
        };

        window.saveUsers(users);
        renderTeamMembers();
        flash("Team member invited. They can sign in with password: welcome123");
      });
    }
  }

  function updateProviderOptions() {
    const provider = $("#set-ai-provider").value;
    $("#claude-options").hidden = provider !== "claude";
    $("#chatgpt-options").hidden = provider !== "chatgpt";
    $("#copilot-options").hidden = provider !== "copilot";
  }

  function renderTeamMembers() {
    const list = $("#team-members-list");
    const users = window.getUsers();
    list.innerHTML = "";

    Object.values(users).forEach(user => {
      const item = el("div", "team-member-item");
      item.innerHTML = `
        <div class="team-member-info">
          <strong>${esc(user.name)}</strong><br>
          <small>${esc(user.email)}</small>
        </div>
        <div class="team-member-provider">
          <small>${user.aiProvider.toUpperCase()}</small>
        </div>
      `;
      list.appendChild(item);
    });
  }

  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  /* ---- Toast ---- */
  let flashTimer;
  function flash(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => t.classList.remove("is-on"), 3200);
  }

  /* ---- Keyboard Shortcuts ---- */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); show("home"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); show("chat"); }
  });

  /* ---- Initialize ---- */
  function init() {
    if (!AUTH.currentUser) return;

    $$(".nav-link").forEach(b => b.addEventListener("click", () => show(b.dataset.view)));

    // Chat
    $("#chat-send").addEventListener("click", chatSend);
    const ci = $("#chat-input");
    ci.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend(); }
    });
    ci.addEventListener("input", () => { ci.style.height = "auto"; ci.style.height = ci.scrollHeight + "px"; });
    $("#chat-clear").addEventListener("click", () => { chat.messages = []; localStorage.removeItem("gp_chat_history_" + AUTH.currentUser.email); chatRender(); flash("Chat cleared."); });
    loadChatHistory();
    chatRender();

    // Fact Finder
    const modeSel = $("#ff-mode");
    GP.FACT_CATEGORIES.forEach(c => { const o = el("option"); o.value = c; o.textContent = c; modeSel.appendChild(o); });
    $("#ff-run").addEventListener("click", factFinderRun);
    $("#ff-copy").addEventListener("click", () => {
      const txt = lastFacts.map(i => i.fact).join("\n\n");
      navigator.clipboard.writeText(txt).then(() => {
        flash("Facts copied to clipboard.");
        const btn = $("#ff-copy");
        btn.classList.add("btn-copy-success");
        btn.textContent = "Copied!";
        setTimeout(() => { btn.classList.remove("btn-copy-success"); btn.textContent = "Copy facts"; }, 2000);
      }).catch(() => flash("Failed to copy to clipboard."));
    });
    $("#ff-download").addEventListener("click", () => {
      download("gardenpedia-fact-finder.md", factsToMarkdown(lastFacts), "text/markdown");
      flash("Report downloaded.");
    });

    // Research
    $("#rs-run").addEventListener("click", researchRun);

    // Settings
    settingsInit();
    refreshStatus();

    // Initial route
    const start = (location.hash || "#home").slice(1);
    show($("#view-" + start) ? start : "home");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
