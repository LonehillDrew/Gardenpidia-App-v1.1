/* GardenPedia Authentication System */
(function () {
  "use strict";

  const AUTH = {
    currentUser: null,
    adminEmail: "drew@thegardener.co.za",
    isAdmin() { return this.currentUser && this.currentUser.email === this.adminEmail; }
  };

  /* ---- Storage Helpers ---- */
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("gp_users") || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem("gp_users", JSON.stringify(users));
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

  function getCurrentUser() {
    const stored = localStorage.getItem("gp_current_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (_) {}
    }
    return null;
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem("gp_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gp_current_user");
    }
    AUTH.currentUser = user;
  }

  /* ---- Initialize Users (First Time) ---- */
  function initializeDefaultAdmin() {
    const users = getUsers();
    if (Object.keys(users).length === 0) {
      users[AUTH.adminEmail] = {
        email: AUTH.adminEmail,
        name: "Admin",
        password: hashPassword("admin123"),
        role: "admin",
        aiProvider: "claude",
        claudePlan: "pro",
        claudeKey: null,
        chatgptPlan: "free",
        chatgptKey: null,
        copilotPlan: "free",
        createdAt: new Date().toISOString()
      };
      saveUsers(users);
    }
  }

  /* ---- UI Helpers ---- */
  const $ = (sel) => document.querySelector(sel);
  const flash = (msg) => {
    const toast = $("#toast");
    if (toast) {
      toast.textContent = msg;
      toast.classList.add("is-on");
      setTimeout(() => toast.classList.remove("is-on"), 3200);
    }
  };

  /* ---- Login ---- */
  function handleLogin() {
    const email = $("#login-email").value.trim();
    const password = $("#login-password").value.trim();
    const errorEl = $("#login-error");

    errorEl.textContent = "";

    if (!email || !password) {
      errorEl.textContent = "Please enter email and password.";
      return;
    }

    const users = getUsers();
    const user = users[email];

    if (!user || user.password !== hashPassword(password)) {
      errorEl.textContent = "Invalid email or password.";
      return;
    }

    const userSession = {
      email: user.email,
      name: user.name,
      role: user.role,
      aiProvider: user.aiProvider,
      claudePlan: user.claudePlan,
      claudeKey: user.claudeKey,
      chatgptPlan: user.chatgptPlan,
      chatgptKey: user.chatgptKey,
      copilotPlan: user.copilotPlan
    };

    setCurrentUser(userSession);

    if ($("#login-remember").checked) {
      localStorage.setItem("gp_remember_email", email);
    } else {
      localStorage.removeItem("gp_remember_email");
    }

    showAppScreen();
    flash("Welcome " + user.name);
  }

  function handleSignup() {
    const name = $("#signup-name").value.trim();
    const email = $("#signup-email").value.trim();
    const password = $("#signup-password").value.trim();
    const passwordConfirm = $("#signup-password-confirm").value.trim();
    const errorEl = $("#signup-error");

    errorEl.textContent = "";

    if (!name || !email || !password || !passwordConfirm) {
      errorEl.textContent = "All fields are required.";
      return;
    }

    if (password !== passwordConfirm) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters.";
      return;
    }

    const users = getUsers();
    if (users[email]) {
      errorEl.textContent = "Email already registered.";
      return;
    }

    users[email] = {
      email,
      name,
      password: hashPassword(password),
      role: "user",
      aiProvider: "claude",
      claudePlan: "free",
      claudeKey: null,
      chatgptPlan: "free",
      chatgptKey: null,
      copilotPlan: "free",
      createdAt: new Date().toISOString()
    };

    saveUsers(users);

    const userSession = {
      email,
      name,
      role: "user",
      aiProvider: "claude",
      claudePlan: "free",
      claudeKey: null,
      chatgptPlan: "free",
      chatgptKey: null,
      copilotPlan: "free"
    };

    setCurrentUser(userSession);
    showAppScreen();
    flash("Account created. Welcome " + name);
  }

  function handleLogout() {
    setCurrentUser(null);
    showLoginScreen();
    flash("Signed out.");
  }

  /* ---- UI State ---- */
  function showLoginScreen() {
    $("#login-screen").hidden = false;
    $("#app-screen").hidden = true;
  }

  function showAppScreen() {
    $("#login-screen").hidden = true;
    $("#app-screen").hidden = false;
  }

  function toggleForms() {
    const loginForm = $("#login-form");
    const signupForm = $("#signup-form");
    loginForm.hidden = !loginForm.hidden;
    signupForm.hidden = !signupForm.hidden;
  }

  /* ---- Initialization ---- */
  function init() {
    initializeDefaultAdmin();

    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      showAppScreen();
    } else {
      showLoginScreen();
      // Pre-fill email if remembered
      const rememberedEmail = localStorage.getItem("gp_remember_email");
      if (rememberedEmail) {
        $("#login-email").value = rememberedEmail;
      }
    }

    // Login events
    $("#login-submit").addEventListener("click", handleLogin);
    $("#toggle-signup").addEventListener("click", toggleForms);
    $("#toggle-login").addEventListener("click", toggleForms);
    $("#signup-submit").addEventListener("click", handleSignup);

    // Logout
    const logoutBtn = $("#logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    // Enter key on login
    $("#login-password").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
    $("#signup-password-confirm").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSignup();
    });

    // Store AUTH globally for app.js
    window.AUTH = AUTH;
    window.getUsers = getUsers;
    window.saveUsers = saveUsers;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
