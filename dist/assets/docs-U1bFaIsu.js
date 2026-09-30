import{G as t,P as i}from"./en_US-SK3WV2N3-2n0F87La.js";/* empty css                  */const l=[{key:"home",label:"Home",href:"/"},{key:"policies",label:"Policies",href:"/policies.html"},{key:"check-proposal",label:"Check Proposal",href:"/check-proposal.html"},{key:"decision-log",label:"Decision Log",href:"/decision-log.html"},{key:"docs",label:"Docs",href:"/docs.html"}],c=[{id:"overview",label:"Overview"},{id:"contract",label:"Contract"},{id:"consensus",label:"Consensus"},{id:"verdicts",label:"Verdicts"},{id:"using",label:"Using the dapp"},{id:"deploy",label:"Deploy your own"},{id:"limits",label:"Limits"}],r=`${i.slice(0,6)}…${i.slice(-4)}`,d=`https://studio-next.genlayer.com/address/${i}`;function n(s){return l.map(e=>`
    <a class="${e.key===s?"active":""}" href="${e.href}">${e.label}</a>
  `).join("")}function p(){return c.map(s=>`<li><a href="#${s.id}">${s.label}</a></li>`).join("")}function h(){document.title="PolicyLayer — Docs";const s=document.getElementById("app");if(!s)return;s.innerHTML=`
    <div class="shell">
      <header class="topbar">
        <a class="brand" href="/"><img class="mark" src="/assets/logo-mark.svg" alt="" width="26" height="26" /><span>PolicyLayer</span></a>
        <nav class="app-nav" aria-label="Primary navigation">${n("docs")}</nav>
        <div class="top-actions">
          <span class="network"><i></i>${t}</span>
          <div id="wallet-header-root"></div>
          <button class="mobile-nav-toggle" id="mobileNavToggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>
      </header>
      <nav class="mobile-nav" id="mobileNav" aria-label="Mobile navigation">${n("docs")}</nav>
      <main class="main docs-main">
        <section class="page-heading">
          <div>
            <span class="eyebrow">Documentation</span>
            <h1>PolicyLayer<br /><em>docs.</em></h1>
            <p>How the on-chain contract, GenLayer consensus and the dapp work — the same source of truth the codebase enforces.</p>
          </div>
          <a class="secondary" href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">View source on GitHub ↗</a>
        </section>

        <div class="docs-layout">
          <aside class="docs-toc" aria-label="Table of contents">
            <span class="eyebrow">On this page</span>
            <ul>${p()}</ul>
          </aside>

          <div class="docs-body">
            <section class="panel" id="overview">
              <div class="panel-head"><div><span class="eyebrow">01 · Overview</span><h2>What PolicyLayer is</h2></div><span>Read-only</span></div>
              <p>PolicyLayer is a GenLayer intelligent contract that gives a DAO one active <em>policy</em> written in plain language, and lets any member check a proposal against it. The verdict — <strong>COMPLIANT</strong>, <strong>CONFLICT</strong> or <strong>NEEDS DAO VOTE</strong> — is decided by GenLayer validators and appended to a <em>Decision Log</em> that nobody can quietly rewrite.</p>
              <p class="muted-note">PolicyLayer never moves treasury funds and never creates a vote. It only produces the review that a DAO can act on afterwards.</p>
            </section>

            <section class="panel" id="contract">
              <div class="panel-head"><div><span class="eyebrow">02 · Contract</span><h2>Storage &amp; public API</h2></div><span>py-genlayer</span></div>
              <p><strong>Deployed at</strong> <a class="page-link" href="${d}" target="_blank" rel="noopener noreferrer">${r} ↗</a> on ${t}.</p>
              <div class="docs-grid">
                <div>
                  <span class="eyebrow">Storage</span>
                  <ul class="doc-list">
                    <li><code>owner</code> — the address that deployed the contract</li>
                    <li><code>policy_title</code>, <code>policy_version</code>, <code>policy_text</code> — the active policy</li>
                    <li><code>policy_history</code> — every published version</li>
                    <li><code>decision_log</code> — every verdict, oldest first</li>
                  </ul>
                </div>
                <div>
                  <span class="eyebrow">Views</span>
                  <ul class="doc-list">
                    <li><code>get_owner()</code></li>
                    <li><code>get_active_policy()</code></li>
                    <li><code>get_policy_history()</code></li>
                    <li><code>get_decision_log()</code></li>
                  </ul>
                </div>
                <div>
                  <span class="eyebrow">Writes</span>
                  <ul class="doc-list">
                    <li><code>create_policy(title, version, text)</code> — owner only, gated by <code>owner</code>. Any other caller is rejected with <code>Only the DAO admin can publish a new policy version</code>.</li>
                    <li><code>check_proposal(proposal)</code> — anyone. Requires <strong>at least 24 characters</strong> so noise never reaches the LLM.</li>
                  </ul>
                </div>
                <div>
                  <span class="eyebrow">Constructor</span>
                  <ul class="doc-list">
                    <li><code>__init__(title, version, policy_text)</code></li>
                    <li>Records <code>gl.message.sender_address.as_hex</code> as <code>owner</code>.</li>
                    <li>Publishes the first policy version.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="panel" id="consensus">
              <div class="panel-head"><div><span class="eyebrow">03 · Consensus</span><h2>How validators agree</h2></div><span>strict_eq</span></div>
              <p>Every <code>check_proposal</code> call runs the same LLM prompt on multiple GenLayer validators. Each validator returns exactly two fields:</p>
              <pre class="code-block">{"verdict": "COMPLIANT | CONFLICT | NEEDS DAO VOTE", "rule": &lt;integer&gt;}</pre>
              <p>The contract splits the active policy into numbered rules by sentence boundary. When the verdict is <code>CONFLICT</code>, <code>rule</code> is the number of the first violated rule; otherwise <code>0</code>. Consensus is reached with <code>gl.eq_principle.strict_eq</code>: <strong>every validator must return the same verdict and the same rule number.</strong> The reasoning sentence shown in the app is then rebuilt by the contract from those two fields, so the wording is deterministic and each validator sees the same result.</p>
            </section>

            <section class="panel" id="verdicts">
              <div class="panel-head"><div><span class="eyebrow">04 · Verdicts</span><h2>The three outcomes</h2></div><span>Only these</span></div>
              <div class="verdict-grid">
                <article class="verdict-card compliant">
                  <span class="verdict compliant">COMPLIANT</span>
                  <p>The proposal clearly follows every rule in the active policy. Recorded as a green entry in the Decision Log.</p>
                </article>
                <article class="verdict-card conflict">
                  <span class="verdict conflict">CONFLICT</span>
                  <p>The proposal clearly violates one policy rule. The reasoning cites the rule number and its text.</p>
                </article>
                <article class="verdict-card needs-dao-vote">
                  <span class="verdict needs-dao-vote">NEEDS DAO VOTE</span>
                  <p>The rule is ambiguous, an exception is claimed, or the validators disagree. The DAO decides by vote.</p>
                </article>
              </div>
            </section>

            <section class="panel" id="using">
              <div class="panel-head"><div><span class="eyebrow">05 · Using the dapp</span><h2>Three pages, one flow</h2></div><span>Wallet required for writes</span></div>
              <ol class="doc-steps">
                <li><a class="page-link" href="/policies.html">Policies</a> — the active policy version, its history and the <em>New version</em> form (only the owner wallet can submit it).</li>
                <li><a class="page-link" href="/check-proposal.html">Check Proposal</a> — paste the proposal text (24+ characters), sign the transaction and wait for the verdict. The transaction hash is shown while validators run, with a link to the Studio explorer and a <em>Stop waiting</em> button if you want to move on.</li>
                <li><a class="page-link" href="/decision-log.html">Decision Log</a> — every verdict on chain, newest first, with the reasoning and the proposal text.</li>
              </ol>
              <p class="muted-note">Landing on any of these pages triggers <em>Get started</em> → wallet connect → chain switch to ${t} → Policies. The chain is added to your wallet if it is missing.</p>
            </section>

            <section class="panel" id="deploy">
              <div class="panel-head"><div><span class="eyebrow">06 · Deploy your own</span><h2>On GenLayer Studio</h2></div><span>~2 minutes</span></div>
              <ol class="doc-steps">
                <li>Open <a class="page-link" href="https://studio-next.genlayer.com/" target="_blank" rel="noopener noreferrer">GenLayer Studio</a>. Paste the contents of <a class="page-link" href="https://github.com/longbds0108/PolicyLayer/blob/main/contracts/policylayer_policy.py" target="_blank" rel="noopener noreferrer"><code>contracts/policylayer_policy.py</code></a>.</li>
                <li>Connect the wallet you want to be the DAO admin. That address is stored as <code>owner</code> at deploy.</li>
                <li>Fill the constructor with a <code>title</code>, a <code>version</code> and a <code>policy_text</code>. Write the policy as short sentences ending with a period — each sentence becomes a numbered rule.</li>
                <li>Bấm Deploy. Copy the new contract address from the finalized transaction.</li>
                <li>In <a class="page-link" href="https://github.com/longbds0108/PolicyLayer/blob/main/src/genlayer-client.js" target="_blank" rel="noopener noreferrer"><code>src/genlayer-client.js</code></a>, replace <code>POLICY_LAYER_ADDRESS</code> and run <code>npm run build</code>.</li>
              </ol>
            </section>

            <section class="panel" id="limits">
              <div class="panel-head"><div><span class="eyebrow">07 · Limits</span><h2>What PolicyLayer is not</h2></div><span>By design</span></div>
              <ul class="doc-list">
                <li><strong>No treasury actions.</strong> The contract never sends tokens or interacts with a treasury contract.</li>
                <li><strong>No vote creation.</strong> The <em>NEEDS DAO VOTE</em> verdict is a signal, not an action; the DAO still has to open the vote.</li>
                <li><strong>Owner-only policy edits.</strong> Only the wallet that deployed the contract can publish new versions. Transferring ownership is not implemented yet.</li>
                <li><strong>Injected wallets only.</strong> Writes go through <code>window.ethereum</code>, so mobile-only WalletConnect flows cannot sign transactions right now — they can still read.</li>
                <li><strong>Deterministic timestamps not stored.</strong> The frontend shows the page-load time next to each entry because the contract does not persist a block timestamp.</li>
              </ul>
            </section>
          </div>
        </div>

        <footer class="footer"><span>PolicyLayer · policy checking dapp</span><span><a href="/docs.html">Policy docs</a> · <a href="https://github.com/longbds0108/PolicyLayer" target="_blank" rel="noopener noreferrer">GitHub</a></span></footer>
      </main>
    </div>
  `;const e=s.querySelector("#mobileNavToggle"),a=s.querySelector("#mobileNav");e==null||e.addEventListener("click",()=>{const o=a==null?void 0:a.classList.toggle("open");e.setAttribute("aria-expanded",o?"true":"false")}),a==null||a.querySelectorAll("a").forEach(o=>o.addEventListener("click",()=>{a.classList.remove("open"),e==null||e.setAttribute("aria-expanded","false")}))}h();
