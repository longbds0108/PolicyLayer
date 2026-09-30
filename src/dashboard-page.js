import {
  GENLAYER_NETWORK_LABEL,
  readPolicyLayer,
  writePolicyLayer,
} from './genlayer-client.js';

const STORAGE_KEY = 'policylayer-local-policy-check-v1';

const page = document.getElementById('app')?.dataset.page || 'policies';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'policies', label: 'Policies', href: '/policies.html' },
  { key: 'check-proposal', label: 'Check Proposal', href: '/check-proposal.html' },
  { key: 'decision-log', label: 'Decision Log', href: '/decision-log.html' },
];

const initialState = {
  policies: [
    {
      id: 'PL-001',
      title: 'Treasury Governance Policy',
      version: '1.0',
      text: 'Every treasury proposal must include a public source link and a clear recipient. Transfers to a personal wallet are not allowed. Any exception requires a DAO vote.',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ],
  checks: [],
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved?.policies && Array.isArray(saved.checks)) return saved;
  } catch {
    // Ignore invalid local data and restore the demo state.
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return structuredClone(initialState);
}

let state = loadState();

let chainState = {
  available: false,
  policy: null,
  policies: [],
  checks: [],
  error: '',
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function parseJsonLines(value) {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object');
  if (value && typeof value === 'object') return [value];
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function normalizeChainPolicy(policy, index = 0) {
  if (!policy || typeof policy !== 'object') return null;
  return {
    id: `GEN-${String(index + 1).padStart(3, '0')}`,
    title: String(policy.title || policy.policy_title || 'Untitled policy'),
    version: String(policy.version || policy.policy_version || '—'),
    text: String(policy.text || policy.policy_text || ''),
    active: true,
    createdAt: policy.createdAt || new Date().toISOString(),
  };
}

function normalizeChainCheck(check, index = 0) {
  if (!check || typeof check !== 'object') return null;
  return {
    id: `GEN-CHK-${String(index + 1).padStart(3, '0')}`,
    policyId: null,
    policyTitle: String(check.policy_title || check.policyTitle || 'PolicyLayer policy'),
    policyVersion: String(check.policy_version || check.policyVersion || '—'),
    proposalText: String(check.proposal || check.proposalText || ''),
    verdict: String(check.verdict || 'NEEDS DAO VOTE'),
    reasoning: String(check.reasoning || ''),
    createdAt: check.createdAt || new Date().toISOString(),
  };
}

function displayPolicies() {
  return chainState.available ? chainState.policies : state.policies;
}

function displayChecks() {
  return chainState.available ? chainState.checks : state.checks;
}

async function hydrateChain(render = true) {
  try {
    const [active, history, log] = await Promise.all([
      readPolicyLayer('get_active_policy'),
      readPolicyLayer('get_policy_history'),
      readPolicyLayer('get_decision_log'),
    ]);
    const historyPolicies = parseJsonLines(history).map(normalizeChainPolicy).filter(Boolean);
    const activePolicyRecord = normalizeChainPolicy(active, historyPolicies.length);
    const policies = historyPolicies.length
      ? historyPolicies.map((item, index) => ({ ...item, active: index === historyPolicies.length - 1 }))
      : activePolicyRecord ? [activePolicyRecord] : [];
    if (activePolicyRecord && !policies.some((item) => item.version === activePolicyRecord.version && item.text === activePolicyRecord.text)) {
      policies.push({ ...activePolicyRecord, active: true });
    }
    chainState = {
      available: true,
      policy: activePolicyRecord || policies.find((item) => item.active) || null,
      policies: policies.map((item) => ({ ...item, active: item.version === (activePolicyRecord?.version || item.version) })),
      checks: parseJsonLines(log).map(normalizeChainCheck).filter(Boolean).reverse(),
      error: '',
    };
    if (render) renderPage();
    return true;
  } catch (error) {
    chainState = { ...chainState, error: error?.message || 'GenLayer is unavailable' };
    if (render) renderPage();
    return false;
  }
}

function renderPage() {
  if (page === 'policies') policiesPage();
  if (page === 'check-proposal') checkProposalPage();
  if (page === 'decision-log') decisionLogPage();
}

function setFormMessage(form, message, kind = 'error') {
  let node = form.querySelector('.form-message');
  if (!node) {
    node = document.createElement('p');
    node.className = 'form-message';
    form.appendChild(node);
  }
  node.className = `form-message ${kind}`;
  node.textContent = message;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function activePolicy() {
  if (chainState.available) return chainState.policy;
  return state.policies.find((policy) => policy.active) || state.policies[0] || null;
}

function verdictClass(verdict) {
  return verdict.toLowerCase().replaceAll(' ', '-');
}

function verdictLabel(verdict) {
  return verdict === 'NEEDS DAO VOTE' ? 'NEEDS DAO VOTE' : verdict;
}

function chrome(activeKey, content) {
  const nav = NAV_ITEMS.map((item) => `
    <a class="${item.key === activeKey ? 'active' : ''}" href="${item.href}">${item.label}</a>
  `).join('');
  const chainNotice = chainState.error
    ? `<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${escapeHtml(chainState.error)}</span></div>`
    : '';

  document.title = `PolicyLayer — ${NAV_ITEMS.find((item) => item.key === activeKey)?.label || 'Policies'}`;
  const app = document.getElementById('app');
  if (!app) return;
  // Keep the React wallet button mounted across re-renders.
  const walletRoot = document.getElementById('wallet-header-root');
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><span class="mark">P</span><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${chainState.available ? GENLAYER_NETWORK_LABEL : 'Local fallback'}</span>
          <div id="wallet-header-root"></div>
        </div>
      </header>
      ${chainNotice}
      <main class="main">${content}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span>${chainState.available ? 'Reads and decisions from GenLayer Studio Dev' : 'Waiting for GenLayer · local data remains available'}</span></footer>
    </div>
  `;
  if (walletRoot) app.querySelector('#wallet-header-root')?.replaceWith(walletRoot);
}

function policyCard(policy, compact = false) {
  if (!policy) {
    return `<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>`;
  }

  return `
    <div class="policy-title"><strong>${escapeHtml(policy.title)}</strong><span>v${escapeHtml(policy.version)}</span></div>
    <p class="policy-description ${compact ? 'policy-description-compact' : ''}">${escapeHtml(policy.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span><span>Created ${formatDate(policy.createdAt)}</span></div>
  `;
}

function policyHistory() {
  const policies = [...displayPolicies()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!policies.length) return '<div class="empty-state"><strong>No policy versions</strong></div>';
  return `<div class="version-list">${policies.map((policy) => `
    <article class="version-item ${policy.active ? 'active' : ''}">
      <div><strong>v${escapeHtml(policy.version)}</strong><span>${escapeHtml(policy.title)}</span></div>
      <span class="version-state">${policy.active ? 'Active' : 'Archived'}</span>
      <small>${formatDate(policy.createdAt)} · ${escapeHtml(policy.text)}</small>
    </article>
  `).join('')}</div>`;
}

function policiesPage() {
  const policy = activePolicy();
  chrome('policies', `
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${policy ? 'Current rules' : 'Start your registry'}</h2></div><span>${policy ? `Version ${escapeHtml(policy.version)}` : 'Empty'}</span></div>
        ${policyCard(policy)}
      </article>
      <article class="panel">
        <div class="panel-head"><div><span class="eyebrow">Create policy</span><h2>New version</h2></div><span>Admin only</span></div>
        <form id="policy-form" class="inline-form">
          <label>Policy name<input name="title" required maxlength="90" placeholder="e.g. Treasury Governance Policy" /></label>
          <label>Version<input name="version" required maxlength="20" placeholder="e.g. 1.1" /></label>
          <label>Policy in natural language<textarea name="text" required rows="7" placeholder="Write the rules your DAO wants proposals to follow..."></textarea></label>
          <button class="primary" type="submit">Save policy version ↗</button>
        </form>
      </article>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${displayPolicies().length} version${displayPolicies().length === 1 ? '' : 's'}</span></div>
      ${policyHistory()}
    </section>
  `);

  document.getElementById('policy-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') || '').trim();
    const version = String(form.get('version') || '').trim();
    const text = String(form.get('text') || '').trim();
    if (!title || !version || !text) return;
    submit.disabled = true;
    submit.textContent = 'Saving on GenLayer…';
    try {
      await writePolicyLayer('create_policy', [title, version, text]);
      await hydrateChain(false);
      renderPage();
    } catch (error) {
      setFormMessage(event.currentTarget, error?.message || 'Could not save this policy on GenLayer.');
      submit.disabled = false;
      submit.textContent = 'Save policy version ↗';
    }
  });
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function evaluateProposal(policy, proposal) {
  if (!policy) {
    return { verdict: 'NEEDS DAO VOTE', reasoning: 'Chưa có policy active để đối chiếu proposal. DAO cần tạo policy trước khi kết luận.' };
  }

  const policyText = policy.text.toLowerCase();
  const proposalText = proposal.toLowerCase();
  const ambiguous = [
    /\bmaybe\b/, /\bperhaps\b/, /\bunclear\b/, /\bdepends\b/, /\bcase[- ]by[- ]case\b/, /\bexception\b/, /\bngoại lệ\b/, /\bcó thể\b/, /\bchưa rõ\b/, /\btùy trường hợp\b/, /\bkhông chắc\b/, /\bunknown\b/,
  ];
  if (hasAny(policyText, ambiguous) || hasAny(proposalText, ambiguous)) {
    return {
      verdict: 'NEEDS DAO VOTE',
      reasoning: `Policy “${policy.title}” v${policy.version} hoặc proposal có ngôn ngữ mơ hồ/ngoại lệ. Không tự suy diễn; cần DAO vote để quyết định.`,
    };
  }

  const violations = [
    { pattern: /(without|skip|bypass|no)\s+(a\s+)?(dao\s+)?vote|không\s+(cần|có)\s+(dao\s+)?vote|bỏ qua\s+(dao\s+)?vote/, reason: 'proposal có ý định bỏ qua DAO vote' },
    { pattern: /(personal|private)\s+(wallet|account)|ví\s+(cá nhân|riêng)|tài khoản cá nhân/, reason: 'recipient là ví/tài khoản cá nhân' },
    { pattern: /(secret|private|confidential|ẩn danh|không công khai)/, reason: 'proposal có nội dung hoặc recipient không công khai' },
    { pattern: /(bypass|circumvent|trái với|vi phạm|không tuân thủ)/, reason: 'proposal tự mô tả hành vi đi ngược policy' },
  ];
  const violation = violations.find((item) => item.pattern.test(proposalText));
  if (violation) {
    return {
      verdict: 'CONFLICT',
      reasoning: `Xung đột với policy “${policy.title}” v${policy.version}: ${violation.reason}. Cần chỉnh proposal trước khi gửi tiếp.`,
    };
  }

  const policyHasExplicitRules = /\b(must|must not|required|not allowed|prohibited|only|phải|không được|bắt buộc|chỉ được|cấm)\b/.test(policyText);
  if (!policyHasExplicitRules || proposal.trim().length < 24) {
    return {
      verdict: 'NEEDS DAO VOTE',
      reasoning: `Policy “${policy.title}” v${policy.version} chưa đủ rõ để đánh giá chắc chắn proposal này. Đưa ra DAO vote để cộng đồng quyết định.`,
    };
  }

  return {
    verdict: 'COMPLIANT',
    reasoning: `Proposal không phát hiện xung đột với các rule rõ ràng trong policy “${policy.title}” v${policy.version}. Kết quả này được tạo bởi local rule checker để test flow; chưa gọi GenLayer.`,
  };
}

function resultCard(check) {
  if (!check) return '<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>Kết quả và reasoning sẽ xuất hiện ở đây sau khi bạn bấm Check policy.</p></div>';
  return `
    <div class="result-card ${verdictClass(check.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${verdictClass(check.verdict)}">${verdictLabel(check.verdict)}</span></div>
      <h2>${escapeHtml(check.verdict === 'COMPLIANT' ? 'Proposal phù hợp policy' : check.verdict === 'CONFLICT' ? 'Proposal cần chỉnh sửa' : 'Cần quyết định của DAO')}</h2>
      <p>${escapeHtml(check.reasoning)}</p>
      <div class="result-meta"><span>Policy v${escapeHtml(check.policyVersion)}</span><span>${formatDate(check.createdAt)}</span></div>
    </div>
  `;
}

function checkProposalPage() {
  const policy = activePolicy();
  const latestCheck = displayChecks()[0] || null;
  chrome('check-proposal', `
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Dán nội dung proposal vào đây. Công cụ sẽ đối chiếu với policy đang active và lưu verdict cùng reasoning vào Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>${chainState.available ? 'GenLayer review' : 'Waiting for network'}</span></div>
        <form id="check-form" class="inline-form">
          <label>Paste proposal<textarea name="proposal" required rows="14" placeholder="Example: Fund the open-source contributor grant with 500 GEN. Recipient and source code are public, and the proposal will go through DAO vote."></textarea></label>
          <div class="policy-preview"><span class="preview-label">Checked against</span>${policyCard(policy, true)}</div>
          <button class="primary" type="submit">Check policy ↗</button>
        </form>
        <p class="muted-note">The proposal is checked by the deployed PolicyLayer contract. No treasury action or vote is created automatically.</p>
      </article>
      <aside class="panel result-panel">
        <div class="panel-head"><div><span class="eyebrow">Decision output</span><h2>Verdict</h2></div><span>Saved after check</span></div>
        <div id="result-root">${resultCard(latestCheck)}</div>
      </aside>
    </section>
  `);

  document.getElementById('check-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const proposal = String(new FormData(event.currentTarget).get('proposal') || '').trim();
    if (!proposal) return;
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Checking on GenLayer…';
    try {
      await writePolicyLayer('check_proposal', [proposal]);
      await hydrateChain(false);
      renderPage();
    } catch (error) {
      setFormMessage(event.currentTarget, error?.message || 'Could not check this proposal on GenLayer.');
      submit.disabled = false;
      submit.textContent = 'Check policy ↗';
    }
  });
}

function decisionLogPage() {
  const checks = [...displayChecks()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const content = checks.length ? `<div class="decision-list decision-log-list">${checks.map((check) => `
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${escapeHtml(check.id)} · ${formatDate(check.createdAt)}</span><h3>${escapeHtml(check.policyTitle)} <small>v${escapeHtml(check.policyVersion)}</small></h3></div><span class="verdict ${verdictClass(check.verdict)}">${verdictLabel(check.verdict)}</span></div>
      <p class="decision-reasoning">${escapeHtml(check.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${escapeHtml(check.proposalText)}</p></details>
    </article>
  `).join('')}</div>` : `<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>`;

  chrome('decision-log', `
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>Lịch sử local của các lần check: proposal, policy version, verdict và reasoning được lưu để cộng đồng có thể kiểm tra lại.</p></div>
      <a class="secondary" href="/check-proposal.html">New policy check ↗</a>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${checks.length} result${checks.length === 1 ? '' : 's'}</span></div>
      ${content}
    </section>
  `);
}

renderPage();
void hydrateChain();
