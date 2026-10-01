// Fills the landing page's proof bar with real chain state so nothing on this
// page is invented. If the RPC is briefly unreachable each `data-live` node
// keeps its placeholder rather than a fake value.
import { readPolicyLayer } from './genlayer-client.js';

const set = (key, value) => {
  document.querySelectorAll(`[data-live="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
};

const stripV = (v) => String(v || '').trim().replace(/^v/i, '');

async function hydrateLanding() {
  try {
    const [active, history, log] = await Promise.all([
      readPolicyLayer('get_active_policy'),
      readPolicyLayer('get_policy_history'),
      readPolicyLayer('get_decision_log'),
    ]);
    const activePolicy = active && typeof active === 'object' ? active : null;
    const versionCount = Array.isArray(history) ? history.length : 0;
    const decisionCount = Array.isArray(log) ? log.length : 0;

    if (activePolicy?.title) set('policy-title', activePolicy.title);
    if (activePolicy?.version) set('policy-version', `v${stripV(activePolicy.version)}`);
    set('policy-count', `${versionCount} version${versionCount === 1 ? '' : 's'}`);
    set('decision-count', `${decisionCount} decision${decisionCount === 1 ? '' : 's'}`);
  } catch (error) {
    set('policy-title', 'Chain unreachable');
    set('policy-version', '—');
    set('policy-count', '—');
    set('decision-count', '—');
  }
}

void hydrateLanding();
