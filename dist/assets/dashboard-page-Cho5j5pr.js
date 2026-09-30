import{r as h,g as G,w as P,h as D,G as B}from"./en_US-SK3WV2N3-D2Gw4svf.js";var E;const f=((E=document.getElementById("app"))==null?void 0:E.dataset.page)||"policies",b=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let m={policies:[],checks:[]},d={available:!1,policy:null,policies:[],checks:[],error:""};function C(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}function A(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:String(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function j(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-CHK-${String(t+1).padStart(3,"0")}`,policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:String(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||""),createdAt:e.createdAt||new Date().toISOString()}}function w(){return d.available?d.policies:m.policies}function N(){return d.available?d.checks:m.checks}async function S(e=!0){try{const[t,s,i]=await Promise.all([h("get_active_policy"),h("get_policy_history"),h("get_decision_log")]),l=C(s).map(A).filter(Boolean),o=A(t,l.length),r=l.length?l.map((a,n)=>({...a,active:n===l.length-1})):o?[o]:[];return o&&!r.some(a=>a.version===o.version&&a.text===o.text)&&r.push({...o,active:!0}),d={available:!0,policy:o||r.find(a=>a.active)||null,policies:r.map(a=>({...a,active:a.version===((o==null?void 0:o.version)||a.version)})),checks:C(i).map(j).filter(Boolean).reverse(),error:""},e&&y(),!0}catch(t){return d={...d,error:(t==null?void 0:t.message)||"GenLayer is unavailable"},e&&y(),!1}}function y(){f==="policies"&&M(),f==="check-proposal"&&W(),f==="decision-log"&&F()}function g(e,t,s="error"){let i=e.querySelector(".form-message");i||(i=document.createElement("p"),i.className="form-message",e.appendChild(i)),i.className=`form-message ${s}`,i.textContent=t}const L=[{key:"signing",label:"Sign in wallet"},{key:"broadcast",label:"Broadcasting"},{key:"consensus",label:"Validators reviewing"},{key:"accepted",label:"Verdict accepted"}];function T(e){var o;(o=e.querySelector(".tx-status"))==null||o.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
    <ol class="tx-steps">
      ${L.map(r=>`
        <li class="tx-step" data-step="${r.key}">
          <span class="tx-dot"></span><span class="tx-label">${r.label}</span>
        </li>
      `).join("")}
    </ol>
    <div class="tx-footer">
      <a class="tx-hash" hidden target="_blank" rel="noopener noreferrer"></a>
      <button type="button" class="tx-cancel text-button" hidden>Stop waiting</button>
    </div>
  `,e.appendChild(t);const s=new AbortController;t.querySelector(".tx-cancel").addEventListener("click",()=>s.abort());let i=-1;const l=r=>{const a=L.findIndex(n=>n.key===r);a<=i||(i=a,t.querySelectorAll(".tx-step").forEach((n,v)=>{n.classList.remove("active","done"),v<i&&n.classList.add("done"),v===i&&n.classList.add("active")}))};return{signal:s.signal,onStatus:l,onHash(r){const a=`${r.slice(0,10)}…${r.slice(-6)}`,n=t.querySelector(".tx-hash");n.textContent=`Tx ${a} ↗`,n.href=`https://studio-next.genlayer.com/tx/${r}`,n.hidden=!1,t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function p(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function O(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function I(){return d.available?d.policy:m.policies.find(e=>e.active)||m.policies[0]||null}function $(e){return e.toLowerCase().replaceAll(" ","-")}function q(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function x(e,t){var v,u;const s=b.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),i=b.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join(""),l=d.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${p(d.error)}</span></div>`:"";document.title=`PolicyLayer — ${((v=b.find(c=>c.key===e))==null?void 0:v.label)||"Policies"}`;const o=document.getElementById("app");if(!o)return;const r=document.getElementById("wallet-header-root");o.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${s}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${d.available?B:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${i}</nav>
      ${l}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `,r&&((u=o.querySelector("#wallet-header-root"))==null||u.replaceWith(r));const a=o.querySelector("#mobileNavToggle"),n=o.querySelector("#mobileNav");a==null||a.addEventListener("click",()=>{const c=n==null?void 0:n.classList.toggle("open");a.setAttribute("aria-expanded",c?"true":"false")}),n==null||n.querySelectorAll("a").forEach(c=>c.addEventListener("click",()=>{n.classList.remove("open"),a==null||a.setAttribute("aria-expanded","false")}))}function _(e,t=!1){return e?`
    <div class="policy-title"><strong>${p(e.title)}</strong><span>v${p(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${p(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function H(){const e=[...w()].sort((t,s)=>new Date(s.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${p(t.version)}</strong><span>${p(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${p(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function M(){var t;const e=I();x("policies",`
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${e?"Current rules":"Start your registry"}</h2></div><span>${e?"":"Empty"}</span></div>
        ${_(e)}
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${w().length} version${w().length===1?"":"s"}</span></div>
      ${H()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async s=>{var u;s.preventDefault();const i=s.currentTarget,l=i.querySelector('button[type="submit"]'),o=new FormData(i),r=String(o.get("title")||"").trim(),a=String(o.get("version")||"").trim(),n=String(o.get("text")||"").trim();if(!r||!a||!n)return;(u=i.querySelector(".form-message"))==null||u.remove(),l.disabled=!0,l.textContent="Verifying admin…";try{const[c,k]=await Promise.all([h("get_owner").catch(()=>null),G().catch(()=>null)]);if(c&&k&&String(c).toLowerCase()!==String(k).toLowerCase()){const V=`${c.slice(0,6)}…${c.slice(-4)}`;g(i,`Only the DAO admin wallet (${V}) can publish a new policy version.`),l.disabled=!1,l.textContent="Save policy version ↗";return}}catch{}l.textContent="Saving on GenLayer…";const v=T(i);try{await P("create_policy",[r,a,n],v),v.done(),await S(!1),y()}catch(c){v.done(),g(i,D(c)),l.disabled=!1,l.textContent="Save policy version ↗"}})}function R(e){return e?`
    <div class="result-card ${$(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${$(e.verdict)}">${q(e.verdict)}</span></div>
      <h2>${p(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${p(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${p(e.policyVersion)}</span><span>${O(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function W(){var s;const e=I(),t=N()[0]||null;x("check-proposal",`
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Paste the proposal text. It is checked against the active policy, and the verdict plus reasoning are stored in the Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>${d.available?"GenLayer review":"Waiting for network"}</span></div>
        <form id="check-form" class="inline-form">
          <label>Paste proposal<textarea name="proposal" required rows="14" placeholder="Example: Fund the open-source contributor grant with 500 GEN. Recipient and source code are public, and the proposal will go through DAO vote."></textarea></label>
          <div class="policy-preview"><span class="preview-label">Checked against</span>${_(e,!0)}</div>
          <button class="primary" type="submit">Check policy ↗</button>
        </form>
        <p class="muted-note">The proposal is checked by the deployed PolicyLayer contract. No treasury action or vote is created automatically.</p>
      </article>
      <aside class="panel result-panel">
        <div class="panel-head"><div><span class="eyebrow">Decision output</span><h2>Verdict</h2></div><span>Saved after check</span></div>
        <div id="result-root">${R(t)}</div>
      </aside>
    </section>
  `),(s=document.getElementById("check-form"))==null||s.addEventListener("submit",async i=>{var n;i.preventDefault();const l=i.currentTarget,o=String(new FormData(l).get("proposal")||"").trim();if(!o)return;if((n=l.querySelector(".form-message"))==null||n.remove(),o.length<24){g(l,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const r=l.querySelector('button[type="submit"]');r.disabled=!0,r.textContent="Checking on GenLayer…";const a=T(l);try{await P("check_proposal",[o],a),a.done(),await S(!1),y()}catch(v){a.done(),g(l,D(v)),r.disabled=!1,r.textContent="Check policy ↗"}})}function F(){const e=[...N()].sort((s,i)=>new Date(i.createdAt)-new Date(s.createdAt)),t=e.length?`<div class="decision-list decision-log-list">${e.map(s=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${p(s.id)} · ${O(s.createdAt)}</span><h3>${p(s.policyTitle)} <small>v${p(s.policyVersion)}</small></h3></div><span class="verdict ${$(s.verdict)}">${q(s.verdict)}</span></div>
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
