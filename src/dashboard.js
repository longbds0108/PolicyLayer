const STORAGE_KEY = 'policylayer-dapp-state-v1';

const initialState = {
  policies: [{
    id: 'PL-001',
    title: 'Treasury Governance Policy',
    version: '1.2',
    description: 'Treasury proposals must respect the spending cap, publish their source code and escalate large requests to the community.',
    maxAmount: 20000,
    voteThreshold: 10000,
    requireOpenSource: true,
    active: true,
    createdAt: new Date().toISOString(),
  }],
  proposals: [],
  decisions: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.policies && saved?.proposals && saved?.decisions) return saved;
  } catch (error) {
    console.warn('PolicyLayer local storage could not be read.', error);
  }
  const fresh = clone(initialState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
};

let state = readState();
const $ = (selector) => document.querySelector(selector);
const money = (value) => `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value) || 0)} USDC`;
const date = (value) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const shorten = (value) => value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-7)}` : value;
const activePolicy = () => state.policies.find((policy) => policy.active) || state.policies[0] || null;
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const verdictClass = (verdict) => verdict.toLowerCase().replaceAll(' ', '-');

function reviewProposal({ amount, openSource }, policy) {
  const violations = [];
  if (amount > policy.maxAmount) violations.push(`Amount exceeds the ${money(policy.maxAmount)} single-proposal cap.`);
  if (policy.requireOpenSource && !openSource) violations.push('Proposal is not marked open-source, but the active policy requires published source code.');
  if (violations.length) return { verdict: 'BLOCKED', reasoning: violations.join(' ') };
  if (amount >= policy.voteThreshold) return { verdict: 'NEEDS COMMUNITY VOTE', reasoning: `Amount reaches the ${money(policy.voteThreshold)} community-vote threshold. The proposal follows the policy, but the DAO must decide the exception.` };
  return { verdict: 'ALLOWED', reasoning: 'Amount is within the policy cap, the open-source requirement is satisfied and no community exception is required.' };
}

function emptyState(title, copy, actionId, actionLabel) {
  return `<div class="empty-state"><span class="empty-mark">＋</span><strong>${title}</strong><p>${copy}</p>${actionId ? `<button class="secondary" data-open="${actionId}">${actionLabel}</button>` : ''}</div>`;
}

function renderMetrics(policy) {
  $('#metricPolicy').textContent = policy ? `v${policy.version}` : '—';
  $('#metricPolicyStatus').textContent = policy ? 'Active on testnet' : 'Create a policy';
  $('#metricProposals').textContent = state.proposals.length;
  $('#metricReviewed').textContent = state.decisions.length;
  $('#metricVotes').textContent = state.decisions.filter((decision) => decision.verdict === 'NEEDS COMMUNITY VOTE').length;
}

function renderPolicy(policy) {
  $('#policyStatus').textContent = policy ? `● v${policy.version} active` : '● No policy';
  $('#activePolicy').innerHTML = policy ? `<div class="policy-title"><strong>${escapeHtml(policy.title)}</strong><span>${escapeHtml(policy.id)}</span></div><p class="policy-description">${escapeHtml(policy.description)}</p><div class="rule-list"><div class="rule"><span class="rule-icon">⌁</span><div><strong>Single-proposal cap</strong><small>${money(policy.maxAmount)}</small></div></div><div class="rule"><span class="rule-icon">◎</span><div><strong>Community vote from</strong><small>${money(policy.voteThreshold)}</small></div></div><div class="rule"><span class="rule-icon">◈</span><div><strong>Open-source status</strong><small>${policy.requireOpenSource ? 'Required' : 'Optional'}</small></div></div></div>` : emptyState('No active policy', 'Create a policy version before reviewing proposals.', 'newPolicy', 'Create policy');
}

function renderProposals() {
  const proposals = [...state.proposals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  $('#queueCount').textContent = `${proposals.length} proposal${proposals.length === 1 ? '' : 's'}`;
  $('#proposalList').innerHTML = proposals.length ? proposals.map((proposal) => `<article class="proposal-card"><div class="proposal-top"><div><span class="proposal-id">${escapeHtml(proposal.id)} · ${date(proposal.createdAt)}</span><h3>${escapeHtml(proposal.title)}</h3></div><span class="verdict ${verdictClass(proposal.verdict)}">${escapeHtml(proposal.verdict)}</span></div><p>${escapeHtml(proposal.summary)}</p><div class="proposal-meta"><span>${money(proposal.amount)}</span><span>Recipient ${escapeHtml(shorten(proposal.recipient))}</span><span>Policy v${escapeHtml(proposal.policyVersion)}</span></div><div class="proposal-actions"><button class="secondary" data-detail-id="${proposal.id}">View detail</button><button class="primary" data-detail-id="${proposal.id}">View reasoning ↗</button></div></article>`).join('') : emptyState('No proposals yet', 'Create the first proposal and the active policy will review it instantly.', 'newProposal', 'Create proposal');
}

function renderDecisionLog() {
  const decisions = [...state.decisions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  $('#logCount').textContent = `${decisions.length} decision${decisions.length === 1 ? '' : 's'}`;
  $('#decisionLog').innerHTML = decisions.length ? decisions.map((decision) => `<button class="decision-item" data-detail-id="${decision.proposalId}"><span class="decision-dot ${verdictClass(decision.verdict)}"></span><span class="decision-content"><span class="decision-head"><strong>${escapeHtml(decision.title)}</strong><span class="verdict ${verdictClass(decision.verdict)}">${escapeHtml(decision.verdict)}</span></span><span class="decision-reasoning">${escapeHtml(decision.reasoning)}</span><small>${date(decision.createdAt)} · Policy v${escapeHtml(decision.policyVersion)}</small></span></button>`).join('') : emptyState('No decisions recorded', 'Every reviewed proposal will appear here with its policy version and reasoning.');
}

function renderPolicyVersions() {
  const policies = [...state.policies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  $('#versionCount').textContent = `${policies.length} version${policies.length === 1 ? '' : 's'}`;
  $('#policyVersions').innerHTML = policies.length ? policies.map((policy) => `<article class="version-item ${policy.active ? 'active' : ''}"><div><strong>v${escapeHtml(policy.version)}</strong><span>${escapeHtml(policy.title)}</span></div><span class="version-state">${policy.active ? 'ACTIVE' : 'ARCHIVED'}</span><small>${date(policy.createdAt)}</small></article>`).join('') : emptyState('No policy history', 'Create a versioned policy to start the registry.');
}

function render() {
  const policy = activePolicy();
  renderMetrics(policy);
  renderPolicy(policy);
  renderProposals();
  renderDecisionLog();
  renderPolicyVersions();
  renderProposalPolicyPreview();
}

function renderProposalPolicyPreview() {
  const policy = activePolicy();
  $('#proposalPolicyPreview').innerHTML = policy ? `<span class="preview-label">Reviewing against</span><strong>${escapeHtml(policy.title)} · v${escapeHtml(policy.version)}</strong><small>Cap ${money(policy.maxAmount)} · Community vote from ${money(policy.voteThreshold)} · Open-source ${policy.requireOpenSource ? 'required' : 'optional'}</small>` : '<strong>No active policy</strong><small>Create a policy before submitting a proposal.</small>';
}

function showDetail(proposalId) {
  const proposal = state.proposals.find((item) => item.id === proposalId);
  const decision = state.decisions.find((item) => item.proposalId === proposalId);
  if (!proposal || !decision) return;
  $('#decisionDetail').innerHTML = `<div class="detail-title"><h2>${escapeHtml(proposal.title)}</h2><span class="verdict ${verdictClass(decision.verdict)}">${escapeHtml(decision.verdict)}</span></div><p class="detail-summary">${escapeHtml(proposal.summary)}</p><div class="detail-grid"><div><span>Amount</span><strong>${money(proposal.amount)}</strong></div><div><span>Recipient</span><strong>${escapeHtml(proposal.recipient)}</strong></div><div><span>Open-source</span><strong>${proposal.openSource ? 'Yes' : 'No'}</strong></div><div><span>Policy version</span><strong>v${escapeHtml(decision.policyVersion)}</strong></div><div><span>Vote status</span><strong>${decision.verdict === 'NEEDS COMMUNITY VOTE' ? 'Community vote required' : decision.verdict === 'ALLOWED' ? 'Ready for DAO vote' : 'Vote not available'}</strong></div><div><span>Execution</span><strong>${decision.verdict === 'BLOCKED' ? 'Stopped by policy' : 'Not executed'}</strong></div></div><div class="reasoning-box"><span class="eyebrow">GenLayer reasoning</span><p>${escapeHtml(decision.reasoning)}</p></div><small class="detail-time">Reviewed ${date(decision.createdAt)}</small>`;
  $('#decisionDialog').showModal();
}

function openDialog(dialog) {
  if (dialog?.showModal) dialog.showModal();
}

$('#newPolicy').addEventListener('click', () => openDialog($('#policyDialog')));
$('#newProposal').addEventListener('click', () => { renderProposalPolicyPreview(); openDialog($('#proposalDialog')); });
$('#closeDecision').addEventListener('click', () => $('#decisionDialog').close());

$('#policyForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const policy = { id: `PL-${String(state.policies.length + 1).padStart(3, '0')}`, title: $('#policyName').value.trim(), version: $('#policyVersion').value.trim(), description: $('#policyDescription').value.trim(), maxAmount: Number($('#policyMaxAmount').value), voteThreshold: Number($('#policyVoteThreshold').value), requireOpenSource: $('#policyRequireOpenSource').checked, active: true, createdAt: new Date().toISOString() };
  if (!policy.title || !policy.version || !policy.maxAmount || !policy.voteThreshold) return;
  state.policies.forEach((item) => { item.active = false; });
  state.policies.push(policy);
  persist();
  $('#policyDialog').close();
  render();
});

$('#proposalForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const policy = activePolicy();
  if (!policy) return;
  const proposal = { id: `PR-${String(state.proposals.length + 1).padStart(3, '0')}`, title: $('#proposalTitle').value.trim(), summary: $('#proposalSummary').value.trim(), amount: Number($('#proposalAmount').value), recipient: $('#proposalRecipient').value.trim(), openSource: $('#proposalOpenSource').checked, policyId: policy.id, policyVersion: policy.version, createdAt: new Date().toISOString() };
  if (!proposal.title || !proposal.summary || !proposal.amount || !proposal.recipient) return;
  const decision = reviewProposal(proposal, policy);
  const record = { proposalId: proposal.id, title: proposal.title, verdict: decision.verdict, reasoning: decision.reasoning, policyId: policy.id, policyVersion: policy.version, createdAt: new Date().toISOString() };
  proposal.verdict = decision.verdict;
  state.proposals.push(proposal);
  state.decisions.push(record);
  persist();
  $('#proposalDialog').close();
  $('#proposalForm').reset();
  render();
  showDetail(proposal.id);
});

document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-open]');
  if (openButton) openDialog($(`#${openButton.dataset.open}`));
  const detailButton = event.target.closest('[data-detail-id]');
  if (detailButton) showDetail(detailButton.dataset.detailId);
  if (event.target.closest('#resetDemo')) {
    if (window.confirm('Reset local policies, proposals and decision log?')) { localStorage.removeItem(STORAGE_KEY); state = readState(); render(); }
  }
});

window.addEventListener('storage', () => { state = readState(); render(); });
render();
