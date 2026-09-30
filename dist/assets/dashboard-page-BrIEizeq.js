import{r as m,w as E,h as L,G as I}from"./en_US-SK3WV2N3-BMPBigD3.js";var A;const g=((A=document.getElementById("app"))==null?void 0:A.dataset.page)||"policies",f=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let h={policies:[],checks:[]},d={available:!1,policy:null,policies:[],checks:[],error:""};function k(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}function C(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:String(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function _(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-CHK-${String(t+1).padStart(3,"0")}`,policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:String(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||""),createdAt:e.createdAt||new Date().toISOString()}}function b(){return d.available?d.policies:h.policies}function P(){return d.available?d.checks:h.checks}async function S(e=!0){try{const[t,a,o]=await Promise.all([m("get_active_policy"),m("get_policy_history"),m("get_decision_log")]),r=k(a).map(C).filter(Boolean),s=C(t,r.length),n=r.length?r.map((i,l)=>({...i,active:l===r.length-1})):s?[s]:[];return s&&!n.some(i=>i.version===s.version&&i.text===s.text)&&n.push({...s,active:!0}),d={available:!0,policy:s||n.find(i=>i.active)||null,policies:n.map(i=>({...i,active:i.version===((s==null?void 0:s.version)||i.version)})),checks:k(o).map(_).filter(Boolean).reverse(),error:""},e&&y(),!0}catch(t){return d={...d,error:(t==null?void 0:t.message)||"GenLayer is unavailable"},e&&y(),!1}}function y(){g==="policies"&&V(),g==="check-proposal"&&H(),g==="decision-log"&&j()}function $(e,t,a="error"){let o=e.querySelector(".form-message");o||(o=document.createElement("p"),o.className="form-message",e.appendChild(o)),o.className=`form-message ${a}`,o.textContent=t}function D(e){var o;(o=e.querySelector(".tx-status"))==null||o.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
    <span class="tx-spinner"></span>
    <span class="tx-message">Waiting for the wallet to sign…</span>
    <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
    <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
  `,e.appendChild(t);const a=new AbortController;return t.querySelector(".tx-cancel").addEventListener("click",()=>a.abort()),{signal:a.signal,onHash(r){const s=`${r.slice(0,10)}…${r.slice(-6)}`,n=t.querySelector(".tx-hash");n.textContent=s,n.href=`https://studio-next.genlayer.com/tx/${r}`,n.hidden=!1,t.querySelector(".tx-message").textContent="Waiting for validators…",t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function p(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function N(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function T(){return d.available?d.policy:h.policies.find(e=>e.active)||h.policies[0]||null}function w(e){return e.toLowerCase().replaceAll(" ","-")}function O(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function x(e,t){var v,u;const a=f.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),o=f.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),r=d.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${p(d.error)}</span></div>`:"";document.title=`PolicyLayer — ${((v=f.find(c=>c.key===e))==null?void 0:v.label)||"Policies"}`;const s=document.getElementById("app");if(!s)return;const n=document.getElementById("wallet-header-root");s.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${a}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${d.available?I:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${o}</nav>
      ${r}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `,n&&((u=s.querySelector("#wallet-header-root"))==null||u.replaceWith(n));const i=s.querySelector("#mobileNavToggle"),l=s.querySelector("#mobileNav");i==null||i.addEventListener("click",()=>{const c=l==null?void 0:l.classList.toggle("open");i.setAttribute("aria-expanded",c?"true":"false")}),l==null||l.querySelectorAll("a").forEach(c=>c.addEventListener("click",()=>{l.classList.remove("open"),i==null||i.setAttribute("aria-expanded","false")}))}function q(e,t=!1){return e?`
    <div class="policy-title"><strong>${p(e.title)}</strong><span>v${p(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${p(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function G(){const e=[...b()].sort((t,a)=>new Date(a.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${p(t.version)}</strong><span>${p(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${p(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function V(){var t;const e=T();x("policies",`
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${e?"Current rules":"Start your registry"}</h2></div><span>${e?"":"Empty"}</span></div>
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${b().length} version${b().length===1?"":"s"}</span></div>
      ${G()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async a=>{var u;a.preventDefault();const o=a.currentTarget,r=o.querySelector('button[type="submit"]'),s=new FormData(o),n=String(s.get("title")||"").trim(),i=String(s.get("version")||"").trim(),l=String(s.get("text")||"").trim();if(!n||!i||!l)return;(u=o.querySelector(".form-message"))==null||u.remove(),r.disabled=!0,r.textContent="Saving on GenLayer…";const v=D(o);try{await E("create_policy",[n,i,l],v),v.done(),await S(!1),y()}catch(c){v.done(),$(o,L(c)),r.disabled=!1,r.textContent="Save policy version ↗"}})}function B(e){return e?`
    <div class="result-card ${w(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${w(e.verdict)}">${O(e.verdict)}</span></div>
      <h2>${p(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${p(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${p(e.policyVersion)}</span><span>${N(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function H(){var a;const e=T(),t=P()[0]||null;x("check-proposal",`
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Paste the proposal text. It is checked against the active policy, and the verdict plus reasoning are stored in the Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>${d.available?"GenLayer review":"Waiting for network"}</span></div>
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
  `),(a=document.getElementById("check-form"))==null||a.addEventListener("submit",async o=>{var l;o.preventDefault();const r=o.currentTarget,s=String(new FormData(r).get("proposal")||"").trim();if(!s)return;if((l=r.querySelector(".form-message"))==null||l.remove(),s.length<24){$(r,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const n=r.querySelector('button[type="submit"]');n.disabled=!0,n.textContent="Checking on GenLayer…";const i=D(r);try{await E("check_proposal",[s],i),i.done(),await S(!1),y()}catch(v){i.done(),$(r,L(v)),n.disabled=!1,n.textContent="Check policy ↗"}})}function j(){const e=[...P()].sort((a,o)=>new Date(o.createdAt)-new Date(a.createdAt)),t=e.length?`<div class="decision-list decision-log-list">${e.map(a=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${p(a.id)} · ${N(a.createdAt)}</span><h3>${p(a.policyTitle)} <small>v${p(a.policyVersion)}</small></h3></div><span class="verdict ${w(a.verdict)}">${O(a.verdict)}</span></div>
      <p class="decision-reasoning">${p(a.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${p(a.proposalText)}</p></details>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>';x("decision-log",`
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>A history of every policy check: proposal, policy version, verdict and reasoning, kept on chain for the community to audit.</p></div>
      <a class="secondary" href="/check-proposal.html">New policy check ↗</a>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${e.length} result${e.length===1?"":"s"}</span></div>
      ${t}
    </section>
  `)}y();S();
