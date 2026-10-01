import {
  GENLAYER_NETWORK_LABEL,
  humanizeWalletError,
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

// Local fallback shown while the chain is still loading; it holds no data.
let state = { policies: [], checks: [] };

let chainState = {
  available: false,
  policy: null,
  policies: [],
  checks: [],
  error: '',
};

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

// Strip any leading 'v' / 'V' the user typed into the version field so the
// UI never shows "vv1.0" when it prepends its own 'v'.
const stripVersionPrefix = (v) => String(v || '').trim().replace(/^v/i, '');

function normalizeChainPolicy(policy, index = 0) {
  if (!policy || typeof policy !== 'object') return null;
  return {
    id: `GEN-${String(index + 1).padStart(3, '0')}`,
    title: String(policy.title || policy.policy_title || 'Untitled policy'),
    version: stripVersionPrefix(policy.version || policy.policy_version || '—'),
    text: String(policy.text || policy.policy_text || ''),
    active: true,
    createdAt: policy.createdAt || new Date().toISOString(),
  };
}

function normalizeChainCheck(check, index = 0) {
  if (!check || typeof check !== 'object') return null;
  return {
    id: String(check.id || `GEN-CHK-${String(index + 1).padStart(3, '0')}`),
    policyId: null,
    policyTitle: String(check.policy_title || check.policyTitle || 'PolicyLayer policy'),
    policyVersion: stripVersionPrefix(check.policy_version || check.policyVersion || '—'),
    proposalText: String(check.proposal || check.proposalText || ''),
    submitter: String(check.submitter || ''),
    verdict: String(check.verdict || 'NEEDS DAO VOTE'),
    reasoning: String(check.reasoning || '').replace(/\bvv(\d)/gi, 'v$1'),
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
    // Collapse the noisy viem + Studio errors into a short, user-friendly line.
    // Join every field the error exposes — viem's shortMessage drops the
    // "Details: execution failed" line we need to classify the root cause.
    const raw = [
      error?.shortMessage,
      error?.message,
      error?.details,
      error?.cause?.message,
      error?.cause?.details,
    ].filter(Boolean).join(' ');
    let msg = 'GenLayer Studio did not return the current policy. Reload the page in a moment.';
    if (/not found/i.test(raw)) {
      msg = 'The PolicyLayer contract was not found on this GenLayer network. The frontend may be pointing at the wrong chain.';
    } else if (/index out of range/i.test(raw) || /execution failed/i.test(raw)) {
      msg = 'The contract state is empty — its deploy constructor never ran. Deploy a fresh PolicyLayer with its three constructor fields filled in.';
    } else if (/network|fetch|timeout/i.test(raw)) {
      msg = 'Could not reach GenLayer Studio right now. Check your network and try again.';
    }
    chainState = { ...chainState, error: msg };
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

// Renders a running status card under the submit button while a write is in
// flight: a 4-step progress row (signing → broadcast → consensus → accepted),
// the truncated tx hash with an explorer link, and a Stop waiting button
// that unblocks the UI. The tx itself keeps running on chain.
const TX_STEPS = [
  { key: 'signing',   label: 'Sign in wallet' },
  { key: 'broadcast', label: 'Broadcasting' },
  { key: 'consensus', label: 'Validators reviewing' },
  { key: 'accepted',  label: 'Verdict accepted' },
];

function attachTxStatus(form) {
  form.querySelector('.tx-status')?.remove();
  const status = document.createElement('div');
  status.className = 'tx-status';
  status.innerHTML = `
    <ol class="tx-steps">
      ${TX_STEPS.map((step) => `
        <li class="tx-step" data-step="${step.key}">
          <span class="tx-dot"></span><span class="tx-label">${step.label}</span>
        </li>
      `).join('')}
    </ol>
    <div class="tx-footer">
      <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
      <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
    </div>
  `;
  form.appendChild(status);
  const controller = new AbortController();
  status.querySelector('.tx-cancel').addEventListener('click', () => controller.abort());

  let currentIndex = -1;
  const advance = (key) => {
    const nextIndex = TX_STEPS.findIndex((step) => step.key === key);
    if (nextIndex <= currentIndex) return;
    currentIndex = nextIndex;
    status.querySelectorAll('.tx-step').forEach((el, i) => {
      el.classList.remove('active', 'done');
      if (i < currentIndex) el.classList.add('done');
      if (i === currentIndex) el.classList.add('active');
    });
  };

  return {
    signal: controller.signal,
    onStatus: advance,
    onHash(hash) {
      const short = `${hash.slice(0, 10)}…${hash.slice(-6)}`;
      const link = status.querySelector('.tx-hash');
      link.textContent = `Tx ${short} ↗`;
      link.href = `https://studio-next.genlayer.com/tx/${hash}`;
      link.hidden = false;
      status.querySelector('.tx-cancel').hidden = false;
    },
    done() { status.remove(); },
  };
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
  return new Intl.DateTimeFormat('en-US', {
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
  const mobileNav = NAV_ITEMS.map((item) => `
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
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${chainState.available ? GENLAYER_NETWORK_LABEL : 'Local fallback'}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${mobileNav}</nav>
      ${chainNotice}
      <main class="main">${content}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `;
  if (walletRoot) app.querySelector('#wallet-header-root')?.replaceWith(walletRoot);
  const toggle = app.querySelector('#mobileNavToggle');
  const menu = app.querySelector('#mobileNav');
  toggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close the mobile menu after the user picks a link.
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
}

function policyCard(policy, compact = false) {
  if (!policy) {
    return `<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>`;
  }

  return `
    <div class="policy-title"><strong>${escapeHtml(policy.title)}</strong><span>v${escapeHtml(policy.version)}</span></div>
    <p class="policy-description ${compact ? 'policy-description-compact' : ''}">${escapeHtml(policy.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `;
}

function policyHistory() {
  const policies = [...displayPolicies()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!policies.length) return '<div class="empty-state"><strong>No policy versions</strong></div>';
  return `<div class="version-list">${policies.map((policy) => `
    <article class="version-item ${policy.active ? 'active' : ''}">
      <div><strong>v${escapeHtml(policy.version)}</strong><span>${escapeHtml(policy.title)}</span></div>
      <span class="version-state">${policy.active ? 'Active' : 'Archived'}</span>
      <small>${escapeHtml(policy.text)}</small>
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
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${policy ? 'Current rules' : 'Start your registry'}</h2></div><span>${policy ? '' : 'Empty'}</span></div>
        ${policyCard(policy)}
      </article>
      <article class="panel">
        <div class="panel-head"><div><span class="eyebrow">Create policy</span><h2>New version</h2></div><span>Any wallet</span></div>
        <p class="muted-note admin-hint">Any wallet with enough GEN for the fee can publish a new active policy. Governance stays off-chain.</p>
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
    const formEl = event.currentTarget;
    const submit = formEl.querySelector('button[type="submit"]');
    const form = new FormData(formEl);
    const title = String(form.get('title') || '').trim();
    const version = String(form.get('version') || '').trim();
    const text = String(form.get('text') || '').trim();
    if (!title || !version || !text) return;
    formEl.querySelector('.form-message')?.remove();
    submit.disabled = true;
    submit.textContent = 'Saving on GenLayer…';
    const tx = attachTxStatus(formEl);
    try {
      await writePolicyLayer('create_policy', [title, version, text], tx);
      tx.done();
      await hydrateChain(false);
      renderPage();
    } catch (error) {
      tx.done();
      setFormMessage(formEl, humanizeWalletError(error));
      submit.disabled = false;
      submit.textContent = 'Save policy version ↗';
    }
  });
}

function resultCard(check) {
  if (!check) return '<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>';
  return `
    <div class="result-card ${verdictClass(check.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${verdictClass(check.verdict)}">${verdictLabel(check.verdict)}</span></div>
      <h2>${escapeHtml(check.verdict === 'COMPLIANT' ? 'Proposal follows the policy' : check.verdict === 'CONFLICT' ? 'Proposal must be revised' : 'DAO decision required')}</h2>
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
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Paste the proposal text. It is checked against the active policy, and the verdict plus reasoning are stored in the Decision Log.</p></div>
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
    const formEl = event.currentTarget;
    const proposal = String(new FormData(formEl).get('proposal') || '').trim();
    if (!proposal) return;
    formEl.querySelector('.form-message')?.remove();
    if (proposal.length < 24) {
      setFormMessage(formEl, 'Proposal must be at least 24 characters long. Add more detail so validators can review it.');
      return;
    }
    const submit = formEl.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Checking on GenLayer…';
    const tx = attachTxStatus(formEl);
    try {
      await writePolicyLayer('check_proposal', [proposal], tx);
      tx.done();
      await hydrateChain(false);
      renderPage();
    } catch (error) {
      tx.done();
      setFormMessage(formEl, humanizeWalletError(error));
      submit.disabled = false;
      submit.textContent = 'Check policy ↗';
    }
  });
}

function decisionLogPage() {
  // On-chain ids look like DEC-1, DEC-2… — sort by that numeric suffix so the
  // newest check is always on top, independent of our page-load timestamp.
  const extractSeq = (id) => {
    const m = String(id || '').match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  };
  const checks = [...displayChecks()].sort((a, b) => extractSeq(b.id) - extractSeq(a.id));
  const content = checks.length ? `<div class="decision-list decision-log-list">${checks.map((check) => `
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${escapeHtml(check.id)}${check.submitter ? ` · ${escapeHtml(check.submitter.slice(0,6))}…${escapeHtml(check.submitter.slice(-4))}` : ''}</span><h3>${escapeHtml(check.policyTitle)} <small>v${escapeHtml(check.policyVersion)}</small></h3></div><span class="verdict ${verdictClass(check.verdict)}">${verdictLabel(check.verdict)}</span></div>
      <p class="decision-reasoning">${escapeHtml(check.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${escapeHtml(check.proposalText)}</p></details>
    </article>
  `).join('')}</div>` : `<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>`;

  chrome('decision-log', `
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>A history of every policy check: proposal, policy version, verdict and reasoning, kept on chain for the community to audit.</p></div>
      <button class="secondary" id="refresh-log" type="button">Refresh ↻</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${checks.length} result${checks.length === 1 ? '' : 's'}</span></div>
      ${content}
    </section>
  `);

  document.getElementById('refresh-log')?.addEventListener('click', async (event) => {
    const btn = event.currentTarget;
    btn.disabled = true;
    btn.textContent = 'Refreshing…';
    await hydrateChain(false);
    renderPage();
  });
}

renderPage();
void hydrateChain();
