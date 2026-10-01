import{r as g,w as P,h as A,G as _}from"./en_US-SK3WV2N3-DcekEoTe.js";var C;const f=((C=document.getElementById("app"))==null?void 0:C.dataset.page)||"policies",b=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}];let h={policies:[],checks:[]},d={available:!1,policy:null,policies:[],checks:[],error:""};function k(e){return Array.isArray(e)?e.filter(t=>t&&typeof t=="object"):e&&typeof e=="object"?[e]:String(e||"").split(`
`).map(t=>t.trim()).filter(Boolean).map(t=>{try{return JSON.parse(t)}catch{return null}}).filter(Boolean)}const T=e=>String(e||"").trim().replace(/^v/i,"");function L(e,t=0){return!e||typeof e!="object"?null:{id:`GEN-${String(t+1).padStart(3,"0")}`,title:String(e.title||e.policy_title||"Untitled policy"),version:T(e.version||e.policy_version||"—"),text:String(e.text||e.policy_text||""),active:!0,createdAt:e.createdAt||new Date().toISOString()}}function G(e,t=0){return!e||typeof e!="object"?null:{id:String(e.id||`GEN-CHK-${String(t+1).padStart(3,"0")}`),policyId:null,policyTitle:String(e.policy_title||e.policyTitle||"PolicyLayer policy"),policyVersion:T(e.policy_version||e.policyVersion||"—"),proposalText:String(e.proposal||e.proposalText||""),submitter:String(e.submitter||""),verdict:String(e.verdict||"NEEDS DAO VOTE"),reasoning:String(e.reasoning||"").replace(/\bvv(\d)/gi,"v$1"),createdAt:e.createdAt||new Date().toISOString()}}function w(){return d.available?d.policies:h.policies}function N(){return d.available?d.checks:h.checks}async function m(e=!0){try{const[t,l,i]=await Promise.all([g("get_active_policy"),g("get_policy_history"),g("get_decision_log")]),a=k(l).map(L).filter(Boolean),s=L(t,a.length),r=a.length?a.map((n,o)=>({...n,active:o===a.length-1})):s?[s]:[];return s&&!r.some(n=>n.version===s.version&&n.text===s.text)&&r.push({...s,active:!0}),d={available:!0,policy:s||r.find(n=>n.active)||null,policies:r.map(n=>({...n,active:n.version===((s==null?void 0:s.version)||n.version)})),checks:k(i).map(G).filter(Boolean).reverse(),error:""},e&&u(),!0}catch(t){const l=String((t==null?void 0:t.shortMessage)||(t==null?void 0:t.message)||t||"");let i="GenLayer Studio did not return the current policy. Reload the page in a moment.";return/not found/i.test(l)?i="The PolicyLayer contract was not found on this GenLayer network. The frontend may be pointing at the wrong chain.":/index out of range/i.test(l)||/execution failed/i.test(l)?i="The contract state is empty — its deploy constructor never ran. Deploy a fresh PolicyLayer with its three constructor fields filled in.":/network|fetch|timeout/i.test(l)&&(i="Could not reach GenLayer Studio right now. Check your network and try again."),d={...d,error:i},e&&u(),!1}}function u(){f==="policies"&&R(),f==="check-proposal"&&H(),f==="decision-log"&&M()}function S(e,t,l="error"){let i=e.querySelector(".form-message");i||(i=document.createElement("p"),i.className="form-message",e.appendChild(i)),i.className=`form-message ${l}`,i.textContent=t}const E=[{key:"signing",label:"Sign in wallet"},{key:"broadcast",label:"Broadcasting"},{key:"consensus",label:"Validators reviewing"},{key:"accepted",label:"Verdict accepted"}];function D(e){var s;(s=e.querySelector(".tx-status"))==null||s.remove();const t=document.createElement("div");t.className="tx-status",t.innerHTML=`
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
  `,e.appendChild(t);const l=new AbortController;t.querySelector(".tx-cancel").addEventListener("click",()=>l.abort());let i=-1;const a=r=>{const n=E.findIndex(o=>o.key===r);n<=i||(i=n,t.querySelectorAll(".tx-step").forEach((o,v)=>{o.classList.remove("active","done"),v<i&&o.classList.add("done"),v===i&&o.classList.add("active")}))};return{signal:l.signal,onStatus:a,onHash(r){const n=`${r.slice(0,10)}…${r.slice(-6)}`,o=t.querySelector(".tx-hash");o.textContent=`Tx ${n} ↗`,o.href=`https://studio-next.genlayer.com/tx/${r}`,o.hidden=!1,t.querySelector(".tx-cancel").hidden=!1},done(){t.remove()}}}function c(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function V(e){return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function I(){return d.available?d.policy:h.policies.find(e=>e.active)||h.policies[0]||null}function $(e){return e.toLowerCase().replaceAll(" ","-")}function O(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function x(e,t){var v,y;const l=b.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),i=b.map(p=>`
    <a class="${p.key===e?"active":""}" href="${p.href}">${p.label}</a>
  `).join(""),a=d.error?`<div class="chain-alert"><strong>GenLayer unavailable</strong><span>${c(d.error)}</span></div>`:"";document.title=`PolicyLayer — ${((v=b.find(p=>p.key===e))==null?void 0:v.label)||"Policies"}`;const s=document.getElementById("app");if(!s)return;const r=document.getElementById("wallet-header-root");s.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${l}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${d.available?_:"Local fallback"}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${i}</nav>
      ${a}
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
    </div>
  `,r&&((y=s.querySelector("#wallet-header-root"))==null||y.replaceWith(r));const n=s.querySelector("#mobileNavToggle"),o=s.querySelector("#mobileNav");n==null||n.addEventListener("click",()=>{const p=o==null?void 0:o.classList.toggle("open");n.setAttribute("aria-expanded",p?"true":"false")}),o==null||o.querySelectorAll("a").forEach(p=>p.addEventListener("click",()=>{o.classList.remove("open"),n==null||n.setAttribute("aria-expanded","false")}))}function q(e,t=!1){return e?`
    <div class="policy-title"><strong>${c(e.title)}</strong><span>v${c(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${c(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function B(){const e=[...w()].sort((t,l)=>new Date(l.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${c(t.version)}</strong><span>${c(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${c(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function R(){var t;const e=I();x("policies",`
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${w().length} version${w().length===1?"":"s"}</span></div>
      ${B()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",async l=>{var y;l.preventDefault();const i=l.currentTarget,a=i.querySelector('button[type="submit"]'),s=new FormData(i),r=String(s.get("title")||"").trim(),n=String(s.get("version")||"").trim(),o=String(s.get("text")||"").trim();if(!r||!n||!o)return;(y=i.querySelector(".form-message"))==null||y.remove(),a.disabled=!0,a.textContent="Saving on GenLayer…";const v=D(i);try{await P("create_policy",[r,n,o],v),v.done(),await m(!1),u()}catch(p){v.done(),S(i,A(p)),a.disabled=!1,a.textContent="Save policy version ↗"}})}function j(e){return e?`
    <div class="result-card ${$(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${$(e.verdict)}">${O(e.verdict)}</span></div>
      <h2>${c(e.verdict==="COMPLIANT"?"Proposal follows the policy":e.verdict==="CONFLICT"?"Proposal must be revised":"DAO decision required")}</h2>
      <p>${c(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${c(e.policyVersion)}</span><span>${V(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>The verdict and reasoning will appear here after you click Check policy.</p></div>'}function H(){var l;const e=I(),t=N()[0]||null;x("check-proposal",`
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
  `),(l=document.getElementById("check-form"))==null||l.addEventListener("submit",async i=>{var o;i.preventDefault();const a=i.currentTarget,s=String(new FormData(a).get("proposal")||"").trim();if(!s)return;if((o=a.querySelector(".form-message"))==null||o.remove(),s.length<24){S(a,"Proposal must be at least 24 characters long. Add more detail so validators can review it.");return}const r=a.querySelector('button[type="submit"]');r.disabled=!0,r.textContent="Checking on GenLayer…";const n=D(a);try{await P("check_proposal",[s],n),n.done(),await m(!1),u()}catch(v){n.done(),S(a,A(v)),r.disabled=!1,r.textContent="Check policy ↗"}})}function M(){var i;const e=a=>{const s=String(a||"").match(/(\d+)$/);return s?parseInt(s[1],10):0},t=[...N()].sort((a,s)=>e(s.id)-e(a.id)),l=t.length?`<div class="decision-list decision-log-list">${t.map(a=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${c(a.id)}${a.submitter?` · ${c(a.submitter.slice(0,6))}…${c(a.submitter.slice(-4))}`:""}</span><h3>${c(a.policyTitle)} <small>v${c(a.policyVersion)}</small></h3></div><span class="verdict ${$(a.verdict)}">${O(a.verdict)}</span></div>
      <p class="decision-reasoning">${c(a.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${c(a.proposalText)}</p></details>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>';x("decision-log",`
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>A history of every policy check: proposal, policy version, verdict and reasoning, kept on chain for the community to audit.</p></div>
      <button class="secondary" id="refresh-log" type="button">Refresh ↻</button>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${t.length} result${t.length===1?"":"s"}</span></div>
      ${l}
    </section>
  `),(i=document.getElementById("refresh-log"))==null||i.addEventListener("click",async a=>{const s=a.currentTarget;s.disabled=!0,s.textContent="Refreshing…",await m(!1),u()})}u();m();
