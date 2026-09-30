import{r as g,w as L,h as P,G as I}from"./en_US-SK3WV2N3-CZO3Mzyn.js";var E;const f=((E=document.getElementById("app"))==null?void 0:E.dataset.page)||"policies",b=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let m={policies:[],checks:[]},c={available:!1,policy:null,policies:[],checks:[],error:""};function A(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}function k(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:String(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function _(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-CHK-${String(t+1).padStart(3,"0")}`,policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:String(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||""),createdAt:e.createdAt||new Date().toISOString()}}function $(){return c.available?c.policies:m.policies}function D(){return c.available?c.checks:m.checks}async function x(e=!0){try{const[t,a,i]=await Promise.all([g("get_active_policy"),g("get_policy_history"),g("get_decision_log")]),n=A(a).map(k).filter(Boolean),s=k(t,n.length),r=n.length?n.map((o,d)=>({...o,active:d===n.length-1})):s?[s]:[];return s&&!r.some(o=>o.version===s.version&&o.text===s.text)&&r.push({...s,active:!0}),c={available:!0,policy:s||r.find(o=>o.active)||null,policies:r.map(o=>({...o,active:o.version===((s==null?void 0:s.version)||o.version)})),checks:A(i).map(_).filter(Boolean).reverse(),error:""},e&&y(),!0}catch(t){return c={...c,error:(t==null?void 0:t.message)||"GenLayer is unavailable"},e&&y(),!1}}function y(){f==="policies"&&V(),f==="check-proposal"&&W(),f==="decision-log"&&j()}function S(e,t,a="error"){let i=e.querySelector(".form-message");i||(i=document.createElement("p"),i.className="form-message",e.appendChild(i)),i.className=`form-message ${a}`,i.textContent=t}function N(e){var i;(i=e.querySelector(".tx-status"))==null||i.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
    <span class="tx-spinner"></span>
    <span class="tx-message">Waiting for the wallet to sign…</span>
    <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
    <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
  `,e.appendChild(t);const a=new AbortController;return t.querySelector(".tx-cancel").addEventListener("click",()=>a.abort()),{signal:a.signal,onHash(n){const s=`${n.slice(0,10)}…${n.slice(-6)}`,r=t.querySelector(".tx-hash");r.textContent=s,r.href=`https://studio-next.genlayer.com/tx/${n}`,r.hidden=!1,t.querySelector(".tx-message").textContent="Waiting for validators…",t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function l(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function h(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function T(){return c.available?c.policy:m.policies.find(e=>e.active)||m.policies[0]||null}function w(e){return e.toLowerCase().replaceAll(" ","-")}function O(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function C(e,t){var v,u;const a=b.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),i=b.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),n=c.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${l(c.error)}</span></div>`:"";document.title=`PolicyLayer — ${((v=b.find(p=>p.key===e))==null?void 0:v.label)||"Policies"}`;const s=document.getElementById("app");if(!s)return;const r=document.getElementById("wallet-header-root");s.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><span class="mark">P</span><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${a}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${c.available?I:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${i}</nav>
      ${n}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span>${c.available?"Reads and decisions from GenLayer Studio Dev":"Waiting for GenLayer · local data remains available"}</span></footer>
    </div>
  `,r&&((u=s.querySelector("#wallet-header-root"))==null||u.replaceWith(r));const o=s.querySelector("#mobileNavToggle"),d=s.querySelector("#mobileNav");o==null||o.addEventListener("click",()=>{const p=d==null?void 0:d.classList.toggle("open");o.setAttribute("aria-expanded",p?"true":"false")})}function q(e,t=!1){return e?`
    <div class="policy-title"><strong>${l(e.title)}</strong><span>v${l(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${l(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span><span>Created ${h(e.createdAt)}</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function G(){const e=[...$()].sort((t,a)=>new Date(a.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${l(t.version)}</strong><span>${l(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${h(t.createdAt)} · ${l(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function V(){var t;const e=T();C("policies",`
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${e?"Current rules":"Start your registry"}</h2></div><span>${e?`Version ${l(e.version)}`:"Empty"}</span></div>
        ${q(e)}
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${$().length} version${$().length===1?"":"s"}</span></div>
      ${G()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async a=>{var u;a.preventDefault();const i=a.currentTarget,n=i.querySelector('button[type="submit"]'),s=new FormData(i),r=String(s.get("title")||"").trim(),o=String(s.get("version")||"").trim(),d=String(s.get("text")||"").trim();if(!r||!o||!d)return;(u=i.querySelector(".form-message"))==null||u.remove(),n.disabled=!0,n.textContent="Saving on GenLayer…";const v=N(i);try{await L("create_policy",[r,o,d],v),v.done(),await x(!1),y()}catch(p){v.done(),S(i,P(p)),n.disabled=!1,n.textContent="Save policy version ↗"}})}function B(e){return e?`
    <div class="result-card ${w(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${w(e.verdict)}">${O(e.verdict)}</span></div>
      <h2>${l(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${l(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${l(e.policyVersion)}</span><span>${h(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function W(){var a;const e=T(),t=D()[0]||null;C("check-proposal",`
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Paste the proposal text. It is checked against the active policy, and the verdict plus reasoning are stored in the Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>${c.available?"GenLayer review":"Waiting for network"}</span></div>
        <form id="check-form" class="inline-form">
          <label>Paste proposal<textarea name="proposal" required rows="14" placeholder="Example: Fund the open-source contributor grant with 500 GEN. Recipient and source code are public, and the proposal will go through DAO vote."></textarea></label>
          <div class="policy-preview"><span class="preview-label">Checked against</span>${q(e,!0)}</div>
          <button class="primary" type="submit">Check policy ↗</button>
        </form>
        <p class="muted-note">The proposal is checked by the deployed PolicyLayer contract. No treasury action or vote is created automatically.</p>
      </article>
      <aside class="panel result-panel">
        <div class="panel-head"><div><span class="eyebrow">Decision output</span><h2>Verdict</h2></div><span>Saved after check</span></div>
        <div id="result-root">${B(t)}</div>
      </aside>
    </section>
  `),(a=document.getElementById("check-form"))==null||a.addEventListener("submit",async i=>{var d;i.preventDefault();const n=i.currentTarget,s=String(new FormData(n).get("proposal")||"").trim();if(!s)return;if((d=n.querySelector(".form-message"))==null||d.remove(),s.length<24){S(n,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const r=n.querySelector('button[type="submit"]');r.disabled=!0,r.textContent="Checking on GenLayer…";const o=N(n);try{await L("check_proposal",[s],o),o.done(),await x(!1),y()}catch(v){o.done(),S(n,P(v)),r.disabled=!1,r.textContent="Check policy ↗"}})}function j(){const e=[...D()].sort((a,i)=>new Date(i.createdAt)-new Date(a.createdAt)),t=e.length?`<div class="decision-list decision-log-list">${e.map(a=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${l(a.id)} · ${h(a.createdAt)}</span><h3>${l(a.policyTitle)} <small>v${l(a.policyVersion)}</small></h3></div><span class="verdict ${w(a.verdict)}">${O(a.verdict)}</span></div>
      <p class="decision-reasoning">${l(a.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${l(a.proposalText)}</p></details>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>';C("decision-log",`
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>A history of every policy check: proposal, policy version, verdict and reasoning, kept on chain for the community to audit.</p></div>
      <a class="secondary" href="/check-proposal.html">New policy check ↗</a>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${e.length} result${e.length===1?"":"s"}</span></div>
      ${t}
    </section>
  `)}y();x();
