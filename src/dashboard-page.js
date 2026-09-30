const STORAGE_KEY = 'policylayer-dapp-state-v1';
const app = document.querySelector('#app');
const page = app?.dataset.page || 'overview';
const $ = (selector) => document.querySelector(selector);
const clone = (value) => JSON.parse(JSON.stringify(value));
const initialState = { policies: [{ id: 'PL-001', title: 'Treasury Governance Policy', version: '1.2', description: 'Treasury proposals must respect the spending cap, publish their source code and escalate large requests to the community.', maxAmount: 20000, voteThreshold: 10000, requireOpenSource: true, active: true, createdAt: new Date().toISOString() }], proposals: [], decisions: [] };
const readState = () => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.policies && saved?.proposals && saved?.decisions) return saved; } catch (error) { console.warn(error); } const fresh = clone(initialState); localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); return fresh; };
let state = readState();
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const money = (value) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value) || 0)} USDC`;
const date = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const shorten = (value) => value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-7)}` : value;
const activePolicy = () => state.policies.find((item) => item.active) || state.policies[0] || null;
const verdictClass = (value) => value.toLowerCase().replaceAll(' ', '-');

function reviewProposal(proposal, policy) {
  const violations = [];
  if (proposal.amount > policy.maxAmount) violations.push(`Amount exceeds the ${money(policy.maxAmount)} single-proposal cap.`);
  if (policy.requireOpenSource && !proposal.openSource) violations.push('Proposal is not marked open-source, but the active policy requires published source code.');
  if (violations.length) return { verdict: 'BLOCKED', reasoning: violations.join(' ') };
  if (proposal.amount >= policy.voteThreshold) return { verdict: 'NEEDS COMMUNITY VOTE', reasoning: `Amount reaches the ${money(policy.voteThreshold)} community-vote threshold. The proposal follows the policy, but the DAO must decide the exception.` };
  return { verdict: 'ALLOWED', reasoning: 'Amount is within the policy cap, the open-source requirement is satisfied and no community exception is required.' };
}

function nav(active) {
  return `<nav class="app-nav" aria-label="Dashboard navigation"><a class="${active === 'overview' ? 'active' : ''}" href="dashboard.html">Overview</a><a class="${active === 'policies' ? 'active' : ''}" href="policies.html">Policies</a><a class="${active === 'review-queue' ? 'active' : ''}" href="review-queue.html">Review queue</a><a class="${active === 'decision-log' ? 'active' : ''}" href="decision-log.html">Decision log</a></nav>`;
}

function chrome(active, content) {
  return `<div class="shell"><header class="topbar"><a class="brand" href="index.html#home"><span class="mark">✦</span>PolicyLayer</a>${nav(active)}<div class="top-actions"><span class="network"><i></i>Local browser mode</span><div id="wallet-header-root"></div></div></header><main class="main">${content}<footer class="footer"><span>PolicyLayer · local prototype · no chain calls</span><button class="text-button" id="resetDemo">Reset local demo</button><a href="index.html">Back to landing page ↗</a></footer></main></div>`;
}

function metrics() {
  const policy = activePolicy();
  return `<section class="metrics" aria-label="Workspace metrics"><div class="metric"><span>Active policy</span><strong>${policy ? `v${escapeHtml(policy.version)}` : '—'}</strong><small>${policy ? 'Active locally' : 'Create a policy'}</small></div><div class="metric"><span>Proposals</span><strong>${state.proposals.length}</strong><small>Saved locally</small></div><div class="metric"><span>Reviewed</span><strong>${state.decisions.length}</strong><small>Decision log entries</small></div><div class="metric"><span>Community votes</span><strong>${state.decisions.filter((item) => item.verdict === 'NEEDS COMMUNITY VOTE').length}</strong><small>Needs attention</small></div></section>`;
}

function policyRules(policy) {
  return policy ? `<div class="policy-title"><strong>${escapeHtml(policy.title)}</strong><span>${escapeHtml(policy.id)}</span></div><p class="policy-description">${escapeHtml(policy.description)}</p><div class="rule-list"><div class="rule"><span class="rule-icon">⌁</span><div><strong>Single-proposal cap</strong><small>${money(policy.maxAmount)}</small></div></div><div class="rule"><span class="rule-icon">◎</span><div><strong>Community vote from</strong><small>${money(policy.voteThreshold)}</small></div></div><div class="rule"><span class="rule-icon">◈</span><div><strong>Open-source status</strong><small>${policy.requireOpenSource ? 'Required' : 'Optional'}</small></div></div></div>` : '<div class="empty-state"><strong>No active policy</strong><p>Create a policy version to start reviewing proposals.</p><a class="secondary" href="policies.html">Open policies</a></div>';
}

function proposalCards(proposals, emptyCopy = 'No proposals yet.') {
  if (!proposals.length) return `<div class="empty-state"><span class="empty-mark">＋</span><strong>No proposals yet</strong><p>${emptyCopy}</p><a class="secondary" href="create-proposal.html">Create proposal</a></div>`;
  return proposals.map((proposal) => `<article class="proposal-card"><div class="proposal-top"><div><span class="proposal-id">${escapeHtml(proposal.id)} · ${date(proposal.createdAt)}</span><h3>${escapeHtml(proposal.title)}</h3></div><span class="verdict ${verdictClass(proposal.verdict)}">${escapeHtml(proposal.verdict)}</span></div><p>${escapeHtml(proposal.summary)}</p><div class="proposal-meta"><span>${money(proposal.amount)}</span><span>Recipient ${escapeHtml(shorten(proposal.recipient))}</span><span>Policy v${escapeHtml(proposal.policyVersion)}</span></div><div class="proposal-actions"><a class="secondary" href="proposal-detail.html?id=${encodeURIComponent(proposal.id)}">View detail</a><a class="primary" href="proposal-detail.html?id=${encodeURIComponent(proposal.id)}#reasoning">View reasoning ↗</a></div></article>`).join('');
}

function decisionRows(decisions, emptyCopy = 'Every reviewed proposal will appear here with its policy version and reasoning.') {
  if (!decisions.length) return `<div class="empty-state"><strong>No decisions recorded</strong><p>${emptyCopy}</p></div>`;
  return decisions.map((decision) => `<a class="decision-item" href="proposal-detail.html?id=${encodeURIComponent(decision.proposalId)}"><span class="decision-dot ${verdictClass(decision.verdict)}"></span><span class="decision-content"><span class="decision-head"><strong>${escapeHtml(decision.title)}</strong><span class="verdict ${verdictClass(decision.verdict)}">${escapeHtml(decision.verdict)}</span></span><span class="decision-reasoning">${escapeHtml(decision.reasoning)}</span><small>${date(decision.createdAt)} · Policy v${escapeHtml(decision.policyVersion)}</small></span></a>`).join('');
}

function policyVersions() {
  return [...state.policies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((policy) => `<article class="version-item ${policy.active ? 'active' : ''}"><div><strong>v${escapeHtml(policy.version)}</strong><span>${escapeHtml(policy.title)}</span></div><span class="version-state">${policy.active ? 'ACTIVE' : 'ARCHIVED'}</span><small>${date(policy.createdAt)}</small></article>`).join('');
}

function overview() {
  const policy = activePolicy();
  const proposals = [...state.proposals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const decisions = [...state.decisions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return chrome('overview', `<section class="hero"><div><span class="eyebrow">Overview · Browser storage</span><h1>Make every DAO<br /><em>decision explainable.</em></h1><p>Create a versioned policy, submit a proposal and inspect the verdict with its reasoning.</p></div><div class="hero-actions"><a class="secondary" href="policies.html">＋ New policy</a><a class="primary" href="create-proposal.html">＋ Create proposal</a></div></section>${metrics()}<section class="workspace-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">Current flow</span><h2>Review queue</h2></div><a class="panel-link" href="review-queue.html">View all ↗</a></div><div class="proposal-list">${proposalCards(proposals.slice(0, 3), 'Create a proposal to see it reviewed against the active policy.')}</div></article><aside class="panel"><div class="panel-head"><div><span class="eyebrow">Versioned rules</span><h2>Active policy</h2></div><a class="panel-link" href="policies.html">Manage ↗</a></div><div class="active-policy">${policyRules(policy)}</div></aside></section><section class="lower-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">Recent decisions</span><h2>Decision log</h2></div><a class="panel-link" href="decision-log.html">Open log ↗</a></div><div class="decision-list">${decisionRows(decisions.slice(0, 4), 'Reviewed proposals will appear here.')}</div></article><article class="panel"><div class="panel-head"><div><span class="eyebrow">Policy history</span><h2>Versions</h2></div><span>${state.policies.length} version${state.policies.length === 1 ? '' : 's'}</span></div><div class="version-list">${policyVersions().slice(0, 3)}</div></article></section>`);
}

function policiesPage() {
  const policy = activePolicy();
  return chrome('policies', `<section class="page-heading"><div><span class="eyebrow">Policies · Version registry</span><h1>DAO rules with a<br /><em>clear history.</em></h1><p>Create a new version to change the rules used by future proposal reviews. Previous versions stay in the local history.</p></div></section><section class="page-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">Currently applied</span><h2>Active policy</h2></div><span class="status">● ${policy ? `v${escapeHtml(policy.version)} active` : 'No policy'}</span></div><div class="active-policy">${policyRules(policy)}</div></article><article class="panel"><div class="panel-head"><div><span class="eyebrow">New version</span><h2>Create policy</h2></div><span>Saved locally</span></div>${policyForm()}</article></section><section class="panel"><div class="panel-head"><div><span class="eyebrow">Audit trail</span><h2>Policy versions</h2></div><span>${state.policies.length} versions</span></div><div class="version-list">${policyVersions()}</div></section>`);
}

function policyForm() {
  return `<form id="policyForm" class="inline-form"><label>Policy name<input id="policyName" required value="Treasury Governance Policy" /></label><div class="form-grid"><label>Version<input id="policyVersion" required value="${activePolicy() ? `${Number.parseFloat(activePolicy().version) + 0.1}` : '1.0'}" /></label><label>Max proposal (USDC)<input id="policyMaxAmount" type="number" min="1" required value="20000" /></label></div><label>Community vote threshold (USDC)<input id="policyVoteThreshold" type="number" min="1" required value="10000" /></label><label>Description<textarea id="policyDescription" rows="3" required>Treasury proposals must respect the spending cap, publish their source code and escalate large requests to the community.</textarea></label><label class="check-row"><input id="policyRequireOpenSource" type="checkbox" checked /><span><strong>Require open-source status</strong><small>Block proposals that do not publish source code.</small></span></label><button class="primary" type="submit">Save policy version</button></form>`;
}

function reviewQueue() {
  const proposals = [...state.proposals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return chrome('review-queue', `<section class="page-heading"><div><span class="eyebrow">Review queue · Policy engine</span><h1>Every proposal gets<br /><em>a visible verdict.</em></h1><p>Requests are reviewed locally against the active policy. GenLayer integration can replace this engine later without changing the proposal record.</p></div><a class="primary" href="create-proposal.html">＋ Create proposal</a></section><section class="metrics" aria-label="Review metrics"><div class="metric"><span>Total proposals</span><strong>${proposals.length}</strong><small>Saved locally</small></div><div class="metric"><span>Allowed</span><strong>${proposals.filter((item) => item.verdict === 'ALLOWED').length}</strong><small>Policy passed</small></div><div class="metric"><span>Blocked</span><strong>${proposals.filter((item) => item.verdict === 'BLOCKED').length}</strong><small>Rule violation</small></div><div class="metric"><span>Needs vote</span><strong>${proposals.filter((item) => item.verdict === 'NEEDS COMMUNITY VOTE').length}</strong><small>DAO decision</small></div></section><section class="panel"><div class="panel-head"><div><span class="eyebrow">Latest first</span><h2>Proposal review queue</h2></div><span>${proposals.length} records</span></div><div class="proposal-list">${proposalCards(proposals, 'The queue is empty. Create a proposal to run the local review engine.')}</div></section>`);
}

function decisionLog() {
  const decisions = [...state.decisions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return chrome('decision-log', `<section class="page-heading"><div><span class="eyebrow">Decision log · Audit trail</span><h1>Reasoning behind<br /><em>every verdict.</em></h1><p>Each record keeps the proposal, policy version, verdict, timestamp and reasoning together.</p></div></section><section class="panel"><div class="panel-head"><div><span class="eyebrow">Local record</span><h2>All decisions</h2></div><span>${decisions.length} entries</span></div><div class="decision-list">${decisionRows(decisions, 'Submit a proposal to create the first decision log entry.')}</div></section>`);
}

function createProposal() {
  const policy = activePolicy();
  return chrome('review-queue', `<section class="page-heading"><div><span class="eyebrow">Create proposal · Proposal intake</span><h1>Submit a request<br /><em>for review.</em></h1><p>The active policy will review this proposal immediately and save the result in the Decision Log.</p></div><a class="secondary" href="review-queue.html">← Back to queue</a></section><section class="page-grid"><article class="panel"><div class="panel-head"><div><span class="eyebrow">New proposal</span><h2>Proposal details</h2></div><span>Required fields</span></div><form id="proposalForm" class="inline-form"><label>Title<input id="proposalTitle" required placeholder="Fund public developer tools" /></label><label>Description<textarea id="proposalSummary" rows="5" required placeholder="What should the DAO approve?"></textarea></label><div class="form-grid"><label>Amount (USDC)<input id="proposalAmount" type="number" min="1" step="0.01" required placeholder="12000" /></label><label>Recipient<input id="proposalRecipient" required placeholder="0x8a...29b1" /></label></div><label>Project type<select id="proposalType"><option>Public goods</option><option>Treasury grant</option><option>Core protocol</option><option>Contributor compensation</option><option>Other</option></select></label><label>Documentation / source link<input id="proposalLink" type="url" placeholder="https://github.com/..." /></label><label class="check-row"><input id="proposalOpenSource" type="checkbox" /><span><strong>This proposal is open-source</strong><small>The project publishes its source code for community review.</small></span></label><button class="primary" type="submit">Review and save proposal ↗</button></form></article><aside class="panel"><div class="panel-head"><div><span class="eyebrow">Applied automatically</span><h2>Active policy</h2></div></div><div class="active-policy">${policyRules(policy)}</div><div class="policy-preview"><span class="preview-label">What happens next</span><strong>Policy review → Decision Log</strong><small>The local engine produces ALLOWED, BLOCKED or NEEDS COMMUNITY VOTE with reasoning.</small></div></aside></section>`);
}

function proposalDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  const proposal = state.proposals.find((item) => item.id === id);
  const decision = state.decisions.find((item) => item.proposalId === id);
  if (!proposal || !decision) return chrome('review-queue', `<section class="page-heading"><div><span class="eyebrow">Proposal detail</span><h1>Proposal not found.</h1><p>This local record may have been reset or the URL is missing a proposal id.</p></div><a class="secondary" href="review-queue.html">← Back to queue</a></section>`);
  return chrome('review-queue', `<section class="page-heading"><div><span class="eyebrow">Proposal detail · ${escapeHtml(proposal.id)}</span><h1>${escapeHtml(proposal.title)}</h1><p>${escapeHtml(proposal.summary)}</p></div><a class="secondary" href="review-queue.html">← Back to queue</a></section><section class="detail-layout"><article class="panel"><div class="detail-title"><div><span class="eyebrow">Policy review result</span><h2>${escapeHtml(decision.verdict)}</h2></div><span class="verdict ${verdictClass(decision.verdict)}">${escapeHtml(decision.verdict)}</span></div><div class="reasoning-box" id="reasoning"><span class="eyebrow">Reasoning</span><p>${escapeHtml(decision.reasoning)}</p></div><div class="detail-grid"><div><span>Amount</span><strong>${money(proposal.amount)}</strong></div><div><span>Recipient</span><strong>${escapeHtml(proposal.recipient)}</strong></div><div><span>Project type</span><strong>${escapeHtml(proposal.projectType || 'Not specified')}</strong></div><div><span>Open-source</span><strong>${proposal.openSource ? 'Yes' : 'No'}</strong></div><div><span>Policy version</span><strong>v${escapeHtml(decision.policyVersion)}</strong></div><div><span>Reviewed</span><strong>${date(decision.createdAt)}</strong></div></div>${proposal.link ? `<a class="source-link" href="${escapeHtml(proposal.link)}" target="_blank" rel="noreferrer">Open documentation / source ↗</a>` : '<p class="muted-note">No documentation link was attached.</p>'}</article><aside class="panel"><div class="panel-head"><div><span class="eyebrow">Next state</span><h2>Lifecycle</h2></div></div><div class="lifecycle"><div class="lifecycle-step done"><span>01</span><strong>Policy review</strong><small>Completed locally</small></div><div class="lifecycle-step ${decision.verdict === 'BLOCKED' ? 'blocked' : decision.verdict === 'NEEDS COMMUNITY VOTE' ? 'active' : 'active'}"><span>02</span><strong>${decision.verdict === 'BLOCKED' ? 'Blocked by policy' : decision.verdict === 'NEEDS COMMUNITY VOTE' ? 'Community vote' : 'Ready for DAO vote'}</strong><small>${decision.verdict === 'BLOCKED' ? 'Execution stopped' : 'Next governance action'}</small></div><div class="lifecycle-step"><span>03</span><strong>Execution</strong><small>Not executed in local mode</small></div></div></aside></section>`);
}

if (page === 'overview') app.innerHTML = overview();
if (page === 'policies') app.innerHTML = policiesPage();
if (page === 'review-queue') app.innerHTML = reviewQueue();
if (page === 'decision-log') app.innerHTML = decisionLog();
if (page === 'create-proposal') app.innerHTML = createProposal();
if (page === 'proposal-detail') app.innerHTML = proposalDetail();

const policyFormEl = $('#policyForm');
if (policyFormEl) policyFormEl.addEventListener('submit', (event) => { event.preventDefault(); const policy = { id: `PL-${String(state.policies.length + 1).padStart(3, '0')}`, title: $('#policyName').value.trim(), version: $('#policyVersion').value.trim(), description: $('#policyDescription').value.trim(), maxAmount: Number($('#policyMaxAmount').value), voteThreshold: Number($('#policyVoteThreshold').value), requireOpenSource: $('#policyRequireOpenSource').checked, active: true, createdAt: new Date().toISOString() }; if (!policy.title || !policy.version || !policy.maxAmount || !policy.voteThreshold) return; state.policies.forEach((item) => { item.active = false; }); state.policies.push(policy); persist(); window.location.reload(); });

const proposalFormEl = $('#proposalForm');
if (proposalFormEl) proposalFormEl.addEventListener('submit', (event) => { event.preventDefault(); const policy = activePolicy(); if (!policy) return; const proposal = { id: `PR-${String(state.proposals.length + 1).padStart(3, '0')}`, title: $('#proposalTitle').value.trim(), summary: $('#proposalSummary').value.trim(), amount: Number($('#proposalAmount').value), recipient: $('#proposalRecipient').value.trim(), projectType: $('#proposalType')?.value || 'Other', link: $('#proposalLink')?.value.trim() || '', openSource: $('#proposalOpenSource').checked, policyId: policy.id, policyVersion: policy.version, createdAt: new Date().toISOString() }; if (!proposal.title || !proposal.summary || !proposal.amount || !proposal.recipient) return; const result = reviewProposal(proposal, policy); proposal.verdict = result.verdict; state.proposals.push(proposal); state.decisions.push({ proposalId: proposal.id, title: proposal.title, verdict: result.verdict, reasoning: result.reasoning, policyId: policy.id, policyVersion: policy.version, createdAt: new Date().toISOString() }); persist(); window.location.href = `proposal-detail.html?id=${encodeURIComponent(proposal.id)}`; });

if ($('#resetDemo')) $('#resetDemo').addEventListener('click', () => { if (window.confirm('Reset local policies, proposals and decision log?')) { localStorage.removeItem(STORAGE_KEY); window.location.href = 'dashboard.html'; } });
window.addEventListener('storage', () => { state = readState(); window.location.reload(); });
