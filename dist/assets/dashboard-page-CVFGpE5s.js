import{r as h,g as B,w as T,h as D,G as j}from"./en_US-SK3WV2N3-CZocFWra.js";var E;const b=((E=document.getElementById("app"))==null?void 0:E.dataset.page)||"policies",w=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let g={policies:[],checks:[]},u={available:!1,policy:null,policies:[],checks:[],owner:null,wallet:null,isAdmin:!1,error:""};function P(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}const O=e=>String(e||"").trim().replace(/^v/i,"");function C(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:O(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function R(e,t=0){return!e||typeof e!="object"?null:{id:String(e.id||`GEN-CHK-${String(t+1).padStart(3,"0")}`),policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:O(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),submitter:String(e.submitter||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||"").replace(/\bvv(\d)/gi,"v$1"),createdAt:e.createdAt||new Date().toISOString()}}function $(){return u.available?u.policies:g.policies}function q(){return u.available?u.checks:g.checks}async function f(e=!0){var t,o;try{const[a,i,s,l,r]=await Promise.all([h("get_active_policy"),h("get_policy_history"),h("get_decision_log"),h("get_owner").catch(()=>null),B().catch(()=>null)]),n=P(i).map(C).filter(Boolean),c=C(a,n.length),m=n.length?n.map((v,V)=>({...v,active:V===n.length-1})):c?[c]:[];c&&!m.some(v=>v.version===c.version&&v.text===c.text)&&m.push({...c,active:!0});const p=l?String(l).toLowerCase():null,L=r?String(r).toLowerCase():null;return u={available:!0,policy:c||m.find(v=>v.active)||null,policies:m.map(v=>({...v,active:v.version===((c==null?void 0:c.version)||v.version)})),checks:P(s).map(R).filter(Boolean).reverse(),owner:l||null,wallet:r||null,isAdmin:!!(p&&L&&p===L),error:""},e&&y(),!0}catch(a){const i=[a==null?void 0:a.shortMessage,a==null?void 0:a.message,a==null?void 0:a.details,(t=a==null?void 0:a.cause)==null?void 0:t.message,(o=a==null?void 0:a.cause)==null?void 0:o.details].filter(Boolean).join(" ");let s="GenLayer Studio did not return the current policy. Reload the page in a moment.";return/not found/i.test(i)?s="The PolicyLayer contract was not found on this GenLayer network. The frontend may be pointing at the wrong chain.":/index out of range/i.test(i)||/execution failed/i.test(i)?s="The contract state is empty — its deploy constructor never ran. Deploy a fresh PolicyLayer with its three constructor fields filled in.":/network|fetch|timeout/i.test(i)&&(s="Could not reach GenLayer Studio right now. Check your network and try again."),u={...u,error:s},e&&y(),!1}}function y(){b==="policies"&&Y(),b==="check-proposal"&&z(),b==="decision-log"&&J()}function x(e,t,o="error"){let a=e.querySelector(".form-message");a||(a=document.createElement("p"),a.className="form-message",e.appendChild(a)),a.className=`form-message ${o}`,a.textContent=t}const A=[{key:"signing",label:"Sign in wallet"},{key:"broadcast",label:"Broadcasting"},{key:"consensus",label:"Validators reviewing"},{key:"accepted",label:"Verdict accepted"}];function N(e){var s;(s=e.querySelector(".tx-status"))==null||s.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
    <ol class="tx-steps">
      ${A.map(l=>`
        <li class="tx-step" data-step="${l.key}">
          <span class="tx-dot"></span><span class="tx-label">${l.label}</span>
        </li>
      `).join("")}
    </ol>
    <div class="tx-footer">
      <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
      <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
    </div>
  `,e.appendChild(t);const o=new AbortController;t.querySelector(".tx-cancel").addEventListener("click",()=>o.abort());let a=-1;const i=l=>{const r=A.findIndex(n=>n.key===l);r<=a||(a=r,t.querySelectorAll(".tx-step").forEach((n,c)=>{n.classList.remove("active","done"),c<a&&n.classList.add("done"),c===a&&n.classList.add("active")}))};return{signal:o.signal,onStatus:i,onHash(l){const r=`${l.slice(0,10)}…${l.slice(-6)}`,n=t.querySelector(".tx-hash");n.textContent=`Tx ${r} ↗`,n.href=`https://studio-next.genlayer.com/tx/${l}`,n.hidden=!1,t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function d(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function W(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function I(){return u.available?u.policy:g.policies.find(e=>e.active)||g.policies[0]||null}function S(e){return e.toLowerCase().replaceAll(" ","-")}function _(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function k(e,t){var c,m;const o=w.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),a=w.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),i=u.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${d(u.error)}</span></div>`:"";document.title=`PolicyLayer — ${((c=w.find(p=>p.key===e))==null?void 0:c.label)||"Policies"}`;const s=document.getElementById("app");if(!s)return;const l=document.getElementById("wallet-header-root");s.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${o}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${u.available?j:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${a}</nav>
      ${i}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `,l&&((m=s.querySelector("#wallet-header-root"))==null||m.replaceWith(l));const r=s.querySelector("#mobileNavToggle"),n=s.querySelector("#mobileNav");r==null||r.addEventListener("click",()=>{const p=n==null?void 0:n.classList.toggle("open");r.setAttribute("aria-expanded",p?"true":"false")}),n==null||n.querySelectorAll("a").forEach(p=>p.addEventListener("click",()=>{n.classList.remove("open"),r==null||r.setAttribute("aria-expanded","false")}))}function G(e,t=!1){return e?`
    <div class="policy-title"><strong>${d(e.title)}</strong><span>v${d(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${d(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function H(){const e=[...$()].sort((t,o)=>new Date(o.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${d(t.version)}</strong><span>${d(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${d(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function M(){const e=u.owner,t=u.wallet;if(!e)return`
      <p class="muted-note admin-hint">Only the wallet that deployed this contract can publish a new policy version.</p>
      <form id="policy-form" class="inline-form">
        <label>Policy name<input name="title" required maxlength="90" placeholder="e.g. Treasury Governance Policy" /></label>
        <label>Version<input name="version" required maxlength="20" placeholder="e.g. 1.1" /></label>
        <label>Policy in natural language<textarea name="text" required rows="7" placeholder="Write the rules your DAO wants proposals to follow..."></textarea></label>
        <button class="primary" type="submit">Save policy version ↗</button>
      </form>
    `;if(!t){const o=`${e.slice(0,6)}…${e.slice(-4)}`;return`
      <p class="muted-note admin-hint">Only the admin wallet <code>${d(o)}</code> can publish a new policy. Connect that wallet to continue.</p>
      <form id="policy-form" class="inline-form">
        <label>Policy name<input name="title" required maxlength="90" placeholder="e.g. Treasury Governance Policy" /></label>
        <label>Version<input name="version" required maxlength="20" placeholder="e.g. 1.1" /></label>
        <label>Policy in natural language<textarea name="text" required rows="7" placeholder="Write the rules your DAO wants proposals to follow..."></textarea></label>
        <button class="primary" type="submit">Save policy version ↗</button>
      </form>
    `}if(!u.isAdmin){const o=`${e.slice(0,6)}…${e.slice(-4)}`,a=`${t.slice(0,6)}…${t.slice(-4)}`;return`
      <div class="admin-gate">
        <div class="admin-gate-mark">✓</div>
        <strong>You are viewing as a member</strong>
        <p>Publishing a new policy version is limited to the wallet that deployed the contract.</p>
        <dl class="admin-gate-meta">
          <div><dt>Admin wallet</dt><dd><code>${d(o)}</code></dd></div>
          <div><dt>Your wallet</dt><dd><code>${d(a)}</code></dd></div>
        </dl>
        <a class="secondary" href="/check-proposal.html">Check a proposal instead ↗</a>
      </div>
    `}return`
    <p class="muted-note admin-hint">Your wallet matches the contract owner — you can publish a new policy version.</p>
    <form id="policy-form" class="inline-form">
      <label>Policy name<input name="title" required maxlength="90" placeholder="e.g. Treasury Governance Policy" /></label>
      <label>Version<input name="version" required maxlength="20" placeholder="e.g. 1.1" /></label>
      <label>Policy in natural language<textarea name="text" required rows="7" placeholder="Write the rules your DAO wants proposals to follow..."></textarea></label>
      <button class="primary" type="submit">Save policy version ↗</button>
    </form>
  `}function Y(){var t;const e=I();k("policies",`
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${e?"Current rules":"Start your registry"}</h2></div><span>${e?"":"Empty"}</span></div>
        ${G(e)}
      </article>
      <article class="panel">
        <div class="panel-head"><div><span class="eyebrow">Create policy</span><h2>New version</h2></div><span>${u.isAdmin?"You are the admin":"Admin only"}</span></div>
        ${M()}
      </article>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${$().length} version${$().length===1?"":"s"}</span></div>
      ${H()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async o=>{var m;o.preventDefault();const a=o.currentTarget,i=a.querySelector('button[type="submit"]'),s=new FormData(a),l=String(s.get("title")||"").trim(),r=String(s.get("version")||"").trim(),n=String(s.get("text")||"").trim();if(!l||!r||!n)return;(m=a.querySelector(".form-message"))==null||m.remove(),i.disabled=!0,i.textContent="Saving on GenLayer…";const c=N(a);try{await T("create_policy",[l,r,n],c),c.done(),await f(!1),y()}catch(p){c.done(),x(a,D(p)),i.disabled=!1,i.textContent="Save policy version ↗"}})}function F(e){return e?`
    <div class="result-card ${S(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${S(e.verdict)}">${_(e.verdict)}</span></div>
      <h2>${d(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${d(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${d(e.policyVersion)}</span><span>${W(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function z(){var o;const e=I(),t=q()[0]||null;k("check-proposal",`
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Paste the proposal text. It is checked against the active policy, and the verdict plus reasoning are stored in the Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>${u.available?"GenLayer review":"Waiting for network"}</span></div>
        <form id="check-form" class="inline-form">
          <label>Paste proposal<textarea name="proposal" required rows="14" placeholder="Example: Fund the open-source contributor grant with 500 GEN. Recipient and source code are public, and the proposal will go through DAO vote."></textarea></label>
          <div class="policy-preview"><span class="preview-label">Checked against</span>${G(e,!0)}</div>
          <button class="primary" type="submit">Check policy ↗</button>
        </form>
        <p class="muted-note">The proposal is checked by the deployed PolicyLayer contract. No treasury action or vote is created automatically.</p>
      </article>
      <aside class="panel result-panel">
        <div class="panel-head"><div><span class="eyebrow">Decision output</span><h2>Verdict</h2></div><span>Saved after check</span></div>
        <div id="result-root">${F(t)}</div>
      </aside>
    </section>
  `),(o=document.getElementById("check-form"))==null||o.addEventListener("submit",async a=>{var n;a.preventDefault();const i=a.currentTarget,s=String(new FormData(i).get("proposal")||"").trim();if(!s)return;if((n=i.querySelector(".form-message"))==null||n.remove(),s.length<24){x(i,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const l=i.querySelector('button[type="submit"]');l.disabled=!0,l.textContent="Checking on GenLayer…";const r=N(i);try{await T("check_proposal",[s],r),r.done(),await f(!1),y()}catch(c){r.done(),x(i,D(c)),l.disabled=!1,l.textContent="Check policy ↗"}})}function J(){var a;const e=i=>{const s=String(i||"").match(/(\d+)$/);return s?parseInt(s[1],10):0},t=[...q()].sort((i,s)=>e(s.id)-e(i.id)),o=t.length?`<div class="decision-list decision-log-list">${t.map(i=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${d(i.id)}${i.submitter?` · ${d(i.submitter.slice(0,6))}…${d(i.submitter.slice(-4))}`:""}</span><h3>${d(i.policyTitle)} <small>v${d(i.policyVersion)}</small></h3></div><span class="verdict ${S(i.verdict)}">${_(i.verdict)}</span></div>
      <p class="decision-reasoning">${d(i.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${d(i.proposalText)}</p></details>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>';k("decision-log",`
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>A history of every policy check: proposal, policy version, verdict and reasoning, kept on chain for the community to audit.</p></div>
      <button class="secondary" id="refresh-log" type="button">Refresh ↻</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${t.length} result${t.length===1?"":"s"}</span></div>
      ${o}
    </section>
  `),(a=document.getElementById("refresh-log"))==null||a.addEventListener("click",async i=>{const s=i.currentTarget;s.disabled=!0,s.textContent="Refreshing…",await f(!1),y()})}y();f();
