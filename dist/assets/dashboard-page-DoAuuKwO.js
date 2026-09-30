import{r as m,w as L,h as P,G as _}from"./en_US-SK3WV2N3-DnwsPM3A.js";var C;const g=((C=document.getElementById("app"))==null?void 0:C.dataset.page)||"policies",f=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let h={policies:[],checks:[]},d={available:!1,policy:null,policies:[],checks:[],error:""};function k(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}function A(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:String(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function G(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-CHK-${String(t+1).padStart(3,"0")}`,policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:String(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||""),createdAt:e.createdAt||new Date().toISOString()}}function b(){return d.available?d.policies:h.policies}function N(){return d.available?d.checks:h.checks}async function S(e=!0){try{const[t,s,o]=await Promise.all([m("get_active_policy"),m("get_policy_history"),m("get_decision_log")]),l=k(s).map(A).filter(Boolean),i=A(t,l.length),r=l.length?l.map((a,n)=>({...a,active:n===l.length-1})):i?[i]:[];return i&&!r.some(a=>a.version===i.version&&a.text===i.text)&&r.push({...i,active:!0}),d={available:!0,policy:i||r.find(a=>a.active)||null,policies:r.map(a=>({...a,active:a.version===((i==null?void 0:i.version)||a.version)})),checks:k(o).map(G).filter(Boolean).reverse(),error:""},e&&y(),!0}catch(t){return d={...d,error:(t==null?void 0:t.message)||"GenLayer is unavailable"},e&&y(),!1}}function y(){g==="policies"&&B(),g==="check-proposal"&&H(),g==="decision-log"&&M()}function $(e,t,s="error"){let o=e.querySelector(".form-message");o||(o=document.createElement("p"),o.className="form-message",e.appendChild(o)),o.className=`form-message ${s}`,o.textContent=t}const E=[{key:"signing",label:"Sign in wallet"},{key:"broadcast",label:"Broadcasting"},{key:"consensus",label:"Validators reviewing"},{key:"accepted",label:"Verdict accepted"}];function D(e){var i;(i=e.querySelector(".tx-status"))==null||i.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
    <ol class="tx-steps">
      ${E.map(r=>`
        <li class="tx-step" data-step="${r.key}">
          <span class="tx-dot"></span><span class="tx-label">${r.label}</span>
        </li>
      `).join("")}
    </ol>
    <div class="tx-footer">
      <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
      <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
    </div>
  `,e.appendChild(t);const s=new AbortController;t.querySelector(".tx-cancel").addEventListener("click",()=>s.abort());let o=-1;const l=r=>{const a=E.findIndex(n=>n.key===r);a<=o||(o=a,t.querySelectorAll(".tx-step").forEach((n,v)=>{n.classList.remove("active","done"),v<o&&n.classList.add("done"),v===o&&n.classList.add("active")}))};return{signal:s.signal,onStatus:l,onHash(r){const a=`${r.slice(0,10)}…${r.slice(-6)}`,n=t.querySelector(".tx-hash");n.textContent=`Tx ${a} ↗`,n.href=`https://studio-next.genlayer.com/tx/${r}`,n.hidden=!1,t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function p(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function T(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function O(){return d.available?d.policy:h.policies.find(e=>e.active)||h.policies[0]||null}function w(e){return e.toLowerCase().replaceAll(" ","-")}function I(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function x(e,t){var v,u;const s=f.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),o=f.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),l=d.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${p(d.error)}</span></div>`:"";document.title=`PolicyLayer — ${((v=f.find(c=>c.key===e))==null?void 0:v.label)||"Policies"}`;const i=document.getElementById("app");if(!i)return;const r=document.getElementById("wallet-header-root");i.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${s}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${d.available?_:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${o}</nav>
      ${l}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `,r&&((u=i.querySelector("#wallet-header-root"))==null||u.replaceWith(r));const a=i.querySelector("#mobileNavToggle"),n=i.querySelector("#mobileNav");a==null||a.addEventListener("click",()=>{const c=n==null?void 0:n.classList.toggle("open");a.setAttribute("aria-expanded",c?"true":"false")}),n==null||n.querySelectorAll("a").forEach(c=>c.addEventListener("click",()=>{n.classList.remove("open"),a==null||a.setAttribute("aria-expanded","false")}))}function q(e,t=!1){return e?`
    <div class="policy-title"><strong>${p(e.title)}</strong><span>v${p(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${p(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function V(){const e=[...b()].sort((t,s)=>new Date(s.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${p(t.version)}</strong><span>${p(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${p(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function B(){var t;const e=O();x("policies",`
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${b().length} version${b().length===1?"":"s"}</span></div>
      ${V()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async s=>{var u;s.preventDefault();const o=s.currentTarget,l=o.querySelector('button[type="submit"]'),i=new FormData(o),r=String(i.get("title")||"").trim(),a=String(i.get("version")||"").trim(),n=String(i.get("text")||"").trim();if(!r||!a||!n)return;(u=o.querySelector(".form-message"))==null||u.remove(),l.disabled=!0,l.textContent="Saving on GenLayer…";const v=D(o);try{await L("create_policy",[r,a,n],v),v.done(),await S(!1),y()}catch(c){v.done(),$(o,P(c)),l.disabled=!1,l.textContent="Save policy version ↗"}})}function j(e){return e?`
    <div class="result-card ${w(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${w(e.verdict)}">${I(e.verdict)}</span></div>
      <h2>${p(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${p(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${p(e.policyVersion)}</span><span>${T(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function H(){var s;const e=O(),t=N()[0]||null;x("check-proposal",`
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
        <div id="result-root">${j(t)}</div>
      </aside>
    </section>
  `),(s=document.getElementById("check-form"))==null||s.addEventListener("submit",async o=>{var n;o.preventDefault();const l=o.currentTarget,i=String(new FormData(l).get("proposal")||"").trim();if(!i)return;if((n=l.querySelector(".form-message"))==null||n.remove(),i.length<24){$(l,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const r=l.querySelector('button[type="submit"]');r.disabled=!0,r.textContent="Checking on GenLayer…";const a=D(l);try{await L("check_proposal",[i],a),a.done(),await S(!1),y()}catch(v){a.done(),$(l,P(v)),r.disabled=!1,r.textContent="Check policy ↗"}})}function M(){const e=[...N()].sort((s,o)=>new Date(o.createdAt)-new Date(s.createdAt)),t=e.length?`<div class="decision-list decision-log-list">${e.map(s=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${p(s.id)} · ${T(s.createdAt)}</span><h3>${p(s.policyTitle)} <small>v${p(s.policyVersion)}</small></h3></div><span class="verdict ${w(s.verdict)}">${I(s.verdict)}</span></div>
      <p class="decision-reasoning">${p(s.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${p(s.proposalText)}</p></details>
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
