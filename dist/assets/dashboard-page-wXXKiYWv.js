const d="policylayer-local-policy-check-v1";var f;const h=((f=document.getElementById("app"))==null?void 0:f.dataset.page)||"policies",g=[{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"}],y={policies:[{id:"PL-001",title:"Treasury Governance Policy",version:"1.0",text:"Every treasury proposal must include a public source link and a clear recipient. Transfers to a personal wallet are not allowed. Any exception requires a DAO vote.",active:!0,createdAt:new Date().toISOString()}],checks:[]};function D(){try{const e=JSON.parse(localStorage.getItem(d)||"null");if(e!=null&&e.policies&&Array.isArray(e.checks))return e}catch{}return localStorage.setItem(d,JSON.stringify(y)),structuredClone(y)}let n=D();function $(){localStorage.setItem(d,JSON.stringify(n))}function s(e=""){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function p(e){return new Intl.DateTimeFormat("vi-VN",{dateStyle:"medium",timeStyle:"short"}).format(new Date(e))}function l(){return n.policies.find(e=>e.active)||n.policies[0]||null}function v(e){return e.toLowerCase().replaceAll(" ","-")}function k(e){return e==="NEEDS DAO VOTE"?"NEEDS DAO VOTE":e}function u(e,t){var r;const a=g.map(c=>`
    <a class="${c.key===e?"active":""}" href="${c.href}">${c.label}</a>
  `).join("");document.title=`PolicyLayer — ${((r=g.find(c=>c.key===e))==null?void 0:r.label)||"Policies"}`;const i=document.getElementById("app");i&&(i.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/policies.html"><span class="mark">P</span><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${a}</nav>
        <div class="top-actions">
          <span class="network"><i></i>Local browser mode</span>
          <div id="wallet-header-root"></div>
        </div>
      </header>
      <main class="main">${t}</main>
      <footer class="footer"><span>PolicyLayer · local policy prototype</span><span>No chain calls · data stays in this browser</span></footer>
    </div>
  `)}function w(e,t=!1){return e?`
    <div class="policy-title"><strong>${s(e.title)}</strong><span>v${s(e.version)}</span></div>
    <p class="policy-description ${t?"policy-description-compact":""}">${s(e.text)}</p>
    <div class="policy-meta-row"><span class="status">Active policy</span><span>Created ${p(e.createdAt)}</span></div>
  `:'<div class="empty-state"><div class="empty-mark">+</div><strong>No active policy yet</strong><p>Create a policy in plain language before checking a proposal.</p></div>'}function C(){const e=[...n.policies].sort((t,a)=>new Date(a.createdAt)-new Date(t.createdAt));return e.length?`<div class="version-list">${e.map(t=>`
    <article class="version-item ${t.active?"active":""}">
      <div><strong>v${s(t.version)}</strong><span>${s(t.title)}</span></div>
      <span class="version-state">${t.active?"Active":"Archived"}</span>
      <small>${p(t.createdAt)} · ${s(t.text)}</small>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><strong>No policy versions</strong></div>'}function A(){var t;const e=l();u("policies",`
    <section class="page-heading">
      <div><span class="eyebrow">01 / POLICY REGISTRY</span><h1>Write the rules<br /><em>in plain language.</em></h1><p>DAO admins define the policy once. Members use the active version to check proposal content before a decision is recorded.</p></div>
      <a class="secondary" href="/check-proposal.html">Check a proposal ↗</a>
    </section>
    <section class="page-grid">
      <article class="panel active-policy">
        <div class="panel-head"><div><span class="eyebrow">Active policy</span><h2>${e?"Current rules":"Start your registry"}</h2></div><span>${e?`Version ${s(e.version)}`:"Empty"}</span></div>
        ${w(e)}
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
      <div class="panel-head"><div><span class="eyebrow">Version history</span><h2>Policy changes</h2></div><span>${n.policies.length} version${n.policies.length===1?"":"s"}</span></div>
      ${C()}
    </section>
  `),(t=document.getElementById("policy-form"))==null||t.addEventListener("submit",a=>{a.preventDefault();const i=new FormData(a.currentTarget);n.policies=n.policies.map(r=>({...r,active:!1})),n.policies.push({id:`PL-${String(n.policies.length+1).padStart(3,"0")}`,title:String(i.get("title")).trim(),version:String(i.get("version")).trim(),text:String(i.get("text")).trim(),active:!0,createdAt:new Date().toISOString()}),$(),A()})}function m(e,t){return t.some(a=>a.test(e))}function E(e,t){if(!e)return{verdict:"NEEDS DAO VOTE",reasoning:"Chưa có policy active để đối chiếu proposal. DAO cần tạo policy trước khi kết luận."};const a=e.text.toLowerCase(),i=t.toLowerCase(),r=[/\bmaybe\b/,/\bperhaps\b/,/\bunclear\b/,/\bdepends\b/,/\bcase[- ]by[- ]case\b/,/\bexception\b/,/\bngoại lệ\b/,/\bcó thể\b/,/\bchưa rõ\b/,/\btùy trường hợp\b/,/\bkhông chắc\b/,/\bunknown\b/];if(m(a,r)||m(i,r))return{verdict:"NEEDS DAO VOTE",reasoning:`Policy “${e.title}” v${e.version} hoặc proposal có ngôn ngữ mơ hồ/ngoại lệ. Không tự suy diễn; cần DAO vote để quyết định.`};const o=[{pattern:/(without|skip|bypass|no)\s+(a\s+)?(dao\s+)?vote|không\s+(cần|có)\s+(dao\s+)?vote|bỏ qua\s+(dao\s+)?vote/,reason:"proposal có ý định bỏ qua DAO vote"},{pattern:/(personal|private)\s+(wallet|account)|ví\s+(cá nhân|riêng)|tài khoản cá nhân/,reason:"recipient là ví/tài khoản cá nhân"},{pattern:/(secret|private|confidential|ẩn danh|không công khai)/,reason:"proposal có nội dung hoặc recipient không công khai"},{pattern:/(bypass|circumvent|trái với|vi phạm|không tuân thủ)/,reason:"proposal tự mô tả hành vi đi ngược policy"}].find(S=>S.pattern.test(i));return o?{verdict:"CONFLICT",reasoning:`Xung đột với policy “${e.title}” v${e.version}: ${o.reason}. Cần chỉnh proposal trước khi gửi tiếp.`}:!/\b(must|must not|required|not allowed|prohibited|only|phải|không được|bắt buộc|chỉ được|cấm)\b/.test(a)||t.trim().length<24?{verdict:"NEEDS DAO VOTE",reasoning:`Policy “${e.title}” v${e.version} chưa đủ rõ để đánh giá chắc chắn proposal này. Đưa ra DAO vote để cộng đồng quyết định.`}:{verdict:"COMPLIANT",reasoning:`Proposal không phát hiện xung đột với các rule rõ ràng trong policy “${e.title}” v${e.version}. Kết quả này được tạo bởi local rule checker để test flow; chưa gọi GenLayer.`}}function b(e){return e?`
    <div class="result-card ${v(e.verdict)}">
      <div class="result-top"><span class="eyebrow">Policy verdict</span><span class="verdict ${v(e.verdict)}">${k(e.verdict)}</span></div>
      <h2>${s(e.verdict==="COMPLIANT"?"Proposal phù hợp policy":e.verdict==="CONFLICT"?"Proposal cần chỉnh sửa":"Cần quyết định của DAO")}</h2>
      <p>${s(e.reasoning)}</p>
      <div class="result-meta"><span>Policy v${s(e.policyVersion)}</span><span>${p(e.createdAt)}</span></div>
    </div>
  `:'<div class="empty-state"><div class="empty-mark">✓</div><strong>Ready to check</strong><p>Kết quả và reasoning sẽ xuất hiện ở đây sau khi bạn bấm Check policy.</p></div>'}function O(){var a;const e=l();let t=null;u("check-proposal",`
    <section class="page-heading">
      <div><span class="eyebrow">02 / POLICY CHECK</span><h1>Check a proposal<br /><em>before it moves.</em></h1><p>Dán nội dung proposal vào đây. Công cụ sẽ đối chiếu với policy đang active và lưu verdict cùng reasoning vào Decision Log.</p></div>
      <a class="secondary" href="/decision-log.html">Open decision log ↗</a>
    </section>
    <section class="check-layout">
      <article class="panel check-form">
        <div class="panel-head"><div><span class="eyebrow">Member action</span><h2>Proposal content</h2></div><span>Local check</span></div>
        <form id="check-form" class="inline-form">
          <label>Paste proposal<textarea name="proposal" required rows="14" placeholder="Example: Fund the open-source contributor grant with 500 GEN. Recipient and source code are public, and the proposal will go through DAO vote."></textarea></label>
          <div class="policy-preview"><span class="preview-label">Checked against</span>${w(e,!0)}</div>
          <button class="primary" type="submit">Check policy ↗</button>
        </form>
        <p class="muted-note">This prototype stores data in localStorage only. No treasury action, vote creation, or GenLayer call is triggered.</p>
      </article>
      <aside class="panel result-panel">
        <div class="panel-head"><div><span class="eyebrow">Decision output</span><h2>Verdict</h2></div><span>Saved after check</span></div>
        <div id="result-root">${b(null)}</div>
      </aside>
    </section>
  `),(a=document.getElementById("check-form"))==null||a.addEventListener("submit",i=>{i.preventDefault();const r=String(new FormData(i.currentTarget).get("proposal")||"").trim(),c=E(l(),r),o=l();t={id:`CHK-${String(n.checks.length+1).padStart(3,"0")}`,policyId:(o==null?void 0:o.id)||null,policyTitle:(o==null?void 0:o.title)||"No policy",policyVersion:(o==null?void 0:o.version)||"—",proposalText:r,verdict:c.verdict,reasoning:c.reasoning,createdAt:new Date().toISOString()},n.checks.unshift(t),$(),document.getElementById("result-root").innerHTML=b(t)})}function P(){const e=[...n.checks].sort((a,i)=>new Date(i.createdAt)-new Date(a.createdAt)),t=e.length?`<div class="decision-list decision-log-list">${e.map(a=>`
    <article class="check-record">
      <div class="record-top"><div><span class="record-id">${s(a.id)} · ${p(a.createdAt)}</span><h3>${s(a.policyTitle)} <small>v${s(a.policyVersion)}</small></h3></div><span class="verdict ${v(a.verdict)}">${k(a.verdict)}</span></div>
      <p class="decision-reasoning">${s(a.reasoning)}</p>
      <details><summary>View proposal content</summary><p class="proposal-text">${s(a.proposalText)}</p></details>
    </article>
  `).join("")}</div>`:'<div class="empty-state"><div class="empty-mark">—</div><strong>No decisions yet</strong><p>Run your first policy check and the saved verdict will appear here.</p><a class="secondary" href="/check-proposal.html">Check a proposal ↗</a></div>';u("decision-log",`
    <section class="page-heading">
      <div><span class="eyebrow">03 / DECISION LOG</span><h1>Every verdict<br /><em>has a memory.</em></h1><p>Lịch sử local của các lần check: proposal, policy version, verdict và reasoning được lưu để cộng đồng có thể kiểm tra lại.</p></div>
      <a class="secondary" href="/check-proposal.html">New policy check ↗</a>
    </section>
    <section class="panel">
      <div class="panel-head"><div><span class="eyebrow">Saved checks</span><h2>Decision history</h2></div><span>${e.length} result${e.length===1?"":"s"}</span></div>
      ${t}
    </section>
  `)}h==="policies"&&A();h==="check-proposal"&&O();h==="decision-log"&&P();
