/**
 * Bootup India — Auth Helpers
 * Manages POC session via localStorage
 */

const SESSION_KEY = 'bootup_session';

/** Get current session or null */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Save session after successful OTP verify */
function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email:    data.email,
    poc_id:   data.poc_id,
    poc_name: data.poc_name,
    points:   data.points,
    city:     data.city,
    college:  data.college,
    logged_in_at: Date.now(),
  }));
}

/** Clear session + redirect to login */
function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/';
}

/** Redirect to login if not authenticated */
function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = '/';
    return null;
  }
  return session;
}

/** Render the top navbar for authenticated pages */
function renderAuthNav(session) {
  const nav = document.getElementById('auth-nav');
  if (!nav || !session) return;
  nav.innerHTML = `
    <div class="auth-nav-inner">
      <a href="/leaderboard" class="auth-nav-logo">
        <img src="https://res.cloudinary.com/dcztgvlfq/image/upload/v1780981956/reliance-digital-seeklogo_ap43wc.png" alt="Reliance Digital" style="height:28px;width:auto">
        <div class="auth-nav-divider"></div>
        <img src="https://res.cloudinary.com/dcztgvlfq/image/upload/v1781072324/unnamed_jycnue.png" alt="Vigorlaunchpad" style="height:26px;width:auto">
      </a>
      <div class="auth-nav-links">
        <a href="/leaderboard" class="auth-nav-link ${window.location.pathname.includes('leaderboard') ? 'active' : ''}">🏆 Leaderboard</a>
        <a href="/dashboard" class="auth-nav-link ${window.location.pathname.includes('dashboard') ? 'active' : ''}">📋 My Tasks</a>
        <div class="auth-nav-user">
          <span class="auth-nav-avatar">${(session.poc_name || 'U')[0].toUpperCase()}</span>
          <span class="auth-nav-name">${session.poc_name}</span>
          <button onclick="logout()" class="auth-nav-logout">Logout</button>
        </div>
      </div>
    </div>
  `;
}

// Expose to global scope
window.getSession    = getSession;
window.saveSession   = saveSession;
window.logout        = logout;
window.requireAuth   = requireAuth;
window.renderAuthNav = renderAuthNav;
