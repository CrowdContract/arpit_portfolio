/*=============== GITHUB INTEGRATION ===============*/

// ─── CONFIG ────────────────────────────────────────────────────────────────
const GITHUB_USERNAME = 'CrowdContract';
const GH_API_BASE = '/api'; // separate name to avoid conflict with chatbot.js

// ─── HELPERS ───────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escHtml(str = '') {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── LANG COLOR MAP (subset) ────────────────────────────────────────────────
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d',
  Shell: '#89e051', Jupyter: '#DA5B0B', Dockerfile: '#384d54',
  default: 'var(--first-color)',
};

// ─── RENDER PINNED REPOS ───────────────────────────────────────────────────
function renderPinnedRepos(repos) {
  const grid = document.getElementById('github-pinned');
  if (!grid) return;

  if (!repos || repos.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-color)">No repositories found.</p>';
    return;
  }

  grid.innerHTML = repos.map(repo => {
    const lang = repo.language || '';
    const color = LANG_COLORS[lang] || LANG_COLORS.default;
    const desc = repo.description || 'No description provided.';

    return `
      <div class="github-repo-card" data-motion="fade-up">
        <div class="repo-header">
          <i class="ri-git-repository-line"></i>
          <span class="repo-name" title="${escHtml(repo.name)}">${escHtml(repo.name)}</span>
        </div>
        <p class="repo-desc">${escHtml(desc)}</p>
        <div class="repo-meta">
          ${lang ? `<span class="repo-lang" style="border-left: 3px solid ${color}; padding-left: 6px;">${lang}</span>` : ''}
          <span class="repo-stars"><i class="ri-star-line"></i> ${repo.stargazers_count || 0}</span>
          <span class="repo-forks"><i class="ri-git-branch-line"></i> ${repo.forks_count || 0}</span>
        </div>
        <a href="${escHtml(repo.html_url)}" target="_blank" rel="noopener" class="repo-link">
          View on GitHub <i class="ri-external-link-line"></i>
        </a>
      </div>
    `;
  }).join('');

  // Trigger animations for new elements
  if (window.refreshMotion) window.refreshMotion();
}

// ─── RENDER COMMIT BELL ───────────────────────────────────────────────────
function renderCommits(commits) {
  const content = document.getElementById('github-bell-content');
  const badge = document.getElementById('github-bell-badge');
  if (!content) return;

  if (!commits || commits.length === 0) {
    content.innerHTML = '<p style="padding:1rem;text-align:center;font-size:.85rem;color:var(--text-color)">No recent commits found.</p>';
    return;
  }

  content.innerHTML = commits.slice(0, 10).map(c => `
    <a class="commit-item" href="${escHtml(c.url || '#')}" target="_blank" rel="noopener">
      <i class="ri-git-commit-line commit-icon"></i>
      <div class="commit-info">
        <div class="commit-repo">${escHtml(c.repo)}</div>
        <div class="commit-msg">${escHtml(c.message || 'commit')}</div>
        <div class="commit-date">${c.date ? timeAgo(c.date) : ''} · ${escHtml(c.sha || '')}</div>
      </div>
    </a>
  `).join('');

  if (badge) {
    badge.textContent = Math.min(commits.length, 9);
    badge.classList.add('visible');
  }
}

// ─── UPDATE STATS ─────────────────────────────────────────────────────────
function updateStats(data) {
  const fields = {
    'gh-repos': data.user?.public_repos,
    'gh-stars': data.totalStars,
    'gh-followers': data.user?.followers,
    'gh-following': data.user?.following,
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) {
      if (window._animateCounter) {
        window._animateCounter(el, parseInt(val) || 0);
      } else {
        el.textContent = val;
      }
    }
  });
}

// ─── FETCH PROFILE ────────────────────────────────────────────────────────
async function loadGithubProfile() {
  try {
    const res = await fetch(`${GH_API_BASE}/github?type=profile`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    updateStats(data);
    renderPinnedRepos(data.pinned);
  } catch (err) {
    console.warn('GitHub profile load failed:', err.message);
    // Fallback: show static cards with known repos
    renderPinnedRepos([
      { name: 'NextGen-EduTrack', description: 'AI-powered education collaboration platform with LLaMA 3.3, MERN stack, real-time notifications.', html_url: 'https://github.com/CrowdContract/NextGen-EduTrack', language: 'JavaScript', stargazers_count: 0, forks_count: 0 },
      { name: 'SmartDocAI', description: 'AI document assistant with EasyOCR, Whisper STT, and LLM summarization for accessibility.', html_url: 'https://github.com/CrowdContract/SmartDocAI', language: 'Python', stargazers_count: 0, forks_count: 0 },
      { name: 'VideoMindAI', description: 'AI-powered video summarization and analysis tool using LLM APIs.', html_url: 'https://github.com/CrowdContract/VideoMindAI', language: 'Python', stargazers_count: 0, forks_count: 0 },
      { name: 'CivicReport', description: 'Community civic issue reporting platform with location tagging and status tracking.', html_url: 'https://github.com/CrowdContract/CivicReport', language: 'JavaScript', stargazers_count: 0, forks_count: 0 },
      { name: 'planto', description: 'Smart plant care assistant with AI disease detection and watering reminders.', html_url: 'https://github.com/CrowdContract/planto', language: 'JavaScript', stargazers_count: 0, forks_count: 0 },
      { name: 'fullstack-ecommerce-mern', description: 'Production-grade MERN e-commerce store with Stripe, JWT auth, and admin panel.', html_url: 'https://github.com/CrowdContract/fullstack-ecommerce-mern', language: 'JavaScript', stargazers_count: 0, forks_count: 0 },
    ]);
    // Set placeholder stats
    ['gh-repos', 'gh-stars', 'gh-followers', 'gh-following'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.textContent === '—') el.textContent = '—';
    });
  }
}

// ─── FETCH COMMITS ────────────────────────────────────────────────────────
async function loadCommits() {
  try {
    const res = await fetch(`${GH_API_BASE}/github?type=commits`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    renderCommits(data.commits);
  } catch (err) {
    console.warn('GitHub commits load failed:', err.message);
    const content = document.getElementById('github-bell-content');
    if (content) {
      content.innerHTML = '<p style="padding:1rem;text-align:center;font-size:.85rem">Could not load commits. <a href="https://github.com/CrowdContract" target="_blank" style="color:var(--first-color)">View on GitHub</a></p>';
    }
  }
}

// ─── BELL TOGGLE ─────────────────────────────────────────────────────────
const bellBtn = document.getElementById('github-bell-btn');
const bellPanel = document.getElementById('github-bell-panel');
const bellClose = document.getElementById('github-bell-close');

let commitsLoaded = false;

if (bellBtn && bellPanel) {
  bellBtn.addEventListener('click', () => {
    const isOpen = bellPanel.classList.toggle('open');
    if (isOpen && !commitsLoaded) {
      loadCommits();
      commitsLoaded = true;
    }
  });
}

if (bellClose && bellPanel) {
  bellClose.addEventListener('click', () => bellPanel.classList.remove('open'));
}

// Close bell on outside click
document.addEventListener('click', e => {
  if (bellPanel && !bellPanel.contains(e.target) && !bellBtn.contains(e.target)) {
    bellPanel.classList.remove('open');
  }
});

// ─── INIT ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadGithubProfile();
});
