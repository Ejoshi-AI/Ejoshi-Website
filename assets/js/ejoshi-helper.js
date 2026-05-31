/* ============================================================
   Ejoshi Learning Helper — "Ask Ejoshi"
   A floating, owl-launched AI helper that sits on learning pages
   so readers can get help while they read.
   ------------------------------------------------------------
   Drop-in usage (on any learning page):
     <script src="assets/js/ejoshi-helper.js" defer></script>
   Adjust the relative path to ejoshi-helper.js / the icon per page depth.
   ------------------------------------------------------------
   v9 "Warm Scholarly" aesthetic · amber-bronze on near-black.
   Self-injecting: no extra CSS file needed. No external deps.
   ============================================================ */
(function () {
  'use strict';

  // ============================================================
  // CONFIG — wire your agent here
  // ============================================================
  var CONFIG = {
    // Your agent's HTTP endpoint. Leave '' to run in DEMO mode (canned reply).
    endpoint: '',

    // HTTP method for the request.
    method: 'POST',

    // Extra headers if your endpoint needs them, e.g. { 'Content-Type': 'application/json' }.
    // SECURITY (Rule 78): do NOT put secret API keys here — this file ships to the
    // browser and anyone can read it. If your agent needs a secret key, put a tiny
    // serverless proxy (e.g. a Cloudflare/Vercel function) in front of it and point
    // `endpoint` at the proxy. Never expose the raw key client-side.
    headers: { 'Content-Type': 'application/json' },

    // Shape the request body your endpoint expects.
    // `message` = the user's latest text; `history` = [{role:'user'|'assistant', text}].
    buildBody: function (message, history) {
      return JSON.stringify({ message: message, history: history });
    },

    // Pull the assistant's reply text out of your endpoint's JSON response.
    // Edit this to match your endpoint's actual response shape.
    parseReply: function (data) {
      return (
        data.reply || data.message || data.text ||
        (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
        ''
      );
    },

    // Path to the Ejoshi owl icon (the launcher mark). Adjust per page depth.
    iconSrc: '../../../../Ejoshi Assets/Website/assets/img/ejoshi-icon.svg',

    // Visible copy (DRAFT — run through the Brand Voice Guardian, Rule 109, before live).
    launcherLabel: 'Ask Ejoshi',
    panelTitle: 'Ask Ejoshi',
    panelSubtitle: 'Your reading companion',
    greeting: "Hi — I'm Ejoshi's helper. Ask me anything about what you're reading and I'll explain it simply.",
    placeholder: 'Ask a question about this lesson…',
    // Honest empty/error states (Rule 111 — never pretend to be more than we are).
    errorText: "Sorry — I couldn't reach the helper just now. Please try again in a moment.",
    notWiredText: "The helper isn't connected yet. (This is a preview — your agent endpoint plugs into CONFIG.endpoint.)"
  };

  if (window.__ejoshiHelperLoaded) return;
  window.__ejoshiHelperLoaded = true;

  var DEMO = !CONFIG.endpoint;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // STYLES (scoped under #ejoshi-helper)
  // ============================================================
  var css = '\
  #ejoshi-helper, #ejoshi-helper * { box-sizing: border-box; }\
  #ejoshi-helper {\
    --eh-bg:#0F0A05; --eh-surface:#1A130A; --eh-surface2:#261C10;\
    --eh-amber:#E2A847; --eh-bronze:#BE9646; --eh-cream:#E6D7B4;\
    --eh-dim:rgba(230,215,180,0.62); --eh-line:rgba(190,150,70,0.22);\
    --eh-serif:"Fraunces",Georgia,serif; --eh-sans:"Inter",system-ui,sans-serif;\
    position:fixed; right:24px; bottom:24px; z-index:2147483000;\
    font-family:var(--eh-sans);\
  }\
  #ejoshi-helper .eh-launch {\
    width:60px; height:60px; border-radius:50%; border:none; cursor:pointer;\
    background:radial-gradient(circle at 30% 28%, #2A1E10, #0F0A05 78%);\
    box-shadow:0 10px 26px rgba(0,0,0,0.5), 0 0 0 1px var(--eh-line), 0 0 32px rgba(226,168,71,0.22);\
    display:flex; align-items:center; justify-content:center; padding:0;\
    transition:transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s;\
  }\
  #ejoshi-helper .eh-launch:hover { transform:translateY(-3px); box-shadow:0 16px 34px rgba(0,0,0,0.55), 0 0 0 1px rgba(226,168,71,0.5), 0 0 48px rgba(226,168,71,0.4); }\
  #ejoshi-helper .eh-launch img { width:34px; height:34px; filter:drop-shadow(0 2px 6px rgba(226,168,71,0.4)); }\
  #ejoshi-helper .eh-launch .eh-pulse {\
    position:absolute; inset:0; border-radius:50%; pointer-events:none;\
    box-shadow:0 0 0 0 rgba(226,168,71,0.45); animation:eh-pulse 3.2s ease-out infinite;\
  }\
  @keyframes eh-pulse { 0%{box-shadow:0 0 0 0 rgba(226,168,71,0.4);} 70%{box-shadow:0 0 0 14px rgba(226,168,71,0);} 100%{box-shadow:0 0 0 0 rgba(226,168,71,0);} }\
  #ejoshi-helper .eh-panel {\
    position:absolute; right:0; bottom:74px; width:370px; max-width:calc(100vw - 32px);\
    height:520px; max-height:calc(100vh - 120px);\
    background:linear-gradient(180deg, rgba(26,19,10,0.98), rgba(15,10,5,0.98));\
    border:1px solid var(--eh-line); border-radius:18px; overflow:hidden;\
    box-shadow:0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(226,168,71,0.07);\
    display:flex; flex-direction:column;\
    opacity:0; transform:translateY(12px) scale(.98); pointer-events:none;\
    transition:opacity .28s ease, transform .28s cubic-bezier(.16,1,.3,1);\
    backdrop-filter:blur(18px);\
  }\
  #ejoshi-helper.eh-open .eh-panel { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }\
  #ejoshi-helper .eh-head { display:flex; align-items:center; gap:12px; padding:16px 18px; border-bottom:1px solid var(--eh-line); }\
  #ejoshi-helper .eh-head img { width:30px; height:30px; }\
  #ejoshi-helper .eh-head .eh-tt { font-family:var(--eh-serif); font-size:17px; color:var(--eh-cream); line-height:1.1; }\
  #ejoshi-helper .eh-head .eh-sub { font-size:11.5px; color:var(--eh-dim); letter-spacing:.02em; }\
  #ejoshi-helper .eh-close { margin-left:auto; background:transparent; border:none; color:var(--eh-dim); font-size:22px; cursor:pointer; line-height:1; padding:4px 6px; border-radius:8px; }\
  #ejoshi-helper .eh-close:hover { color:var(--eh-amber); }\
  #ejoshi-helper .eh-log { flex:1; overflow-y:auto; padding:18px; display:flex; flex-direction:column; gap:12px; }\
  #ejoshi-helper .eh-msg { max-width:84%; padding:11px 15px; border-radius:14px; font-size:14px; line-height:1.5; white-space:pre-wrap; }\
  #ejoshi-helper .eh-msg.eh-bot { align-self:flex-start; background:var(--eh-surface2); color:var(--eh-cream); border:1px solid var(--eh-line); border-bottom-left-radius:4px; }\
  #ejoshi-helper .eh-msg.eh-user { align-self:flex-end; background:linear-gradient(135deg, var(--eh-amber), var(--eh-bronze)); color:#2A1B08; border-bottom-right-radius:4px; }\
  #ejoshi-helper .eh-typing { align-self:flex-start; display:flex; gap:5px; padding:13px 16px; background:var(--eh-surface2); border:1px solid var(--eh-line); border-radius:14px; border-bottom-left-radius:4px; }\
  #ejoshi-helper .eh-typing span { width:7px; height:7px; border-radius:50%; background:var(--eh-amber); opacity:.5; animation:eh-bounce 1.2s infinite; }\
  #ejoshi-helper .eh-typing span:nth-child(2){animation-delay:.18s;} #ejoshi-helper .eh-typing span:nth-child(3){animation-delay:.36s;}\
  @keyframes eh-bounce { 0%,60%,100%{transform:translateY(0);opacity:.4;} 30%{transform:translateY(-5px);opacity:1;} }\
  #ejoshi-helper .eh-foot { padding:12px; border-top:1px solid var(--eh-line); display:flex; gap:8px; }\
  #ejoshi-helper .eh-input { flex:1; resize:none; max-height:96px; min-height:42px; padding:11px 14px; border-radius:12px;\
    background:rgba(15,10,5,0.7); border:1px solid var(--eh-line); color:var(--eh-cream); font-family:var(--eh-sans); font-size:14px; line-height:1.4; }\
  #ejoshi-helper .eh-input:focus { outline:none; border-color:var(--eh-amber); box-shadow:0 0 0 3px rgba(226,168,71,0.15); }\
  #ejoshi-helper .eh-send { flex:0 0 auto; width:42px; height:42px; border-radius:12px; border:none; cursor:pointer;\
    background:linear-gradient(135deg, var(--eh-amber), var(--eh-bronze)); color:#2A1B08; font-size:18px; display:flex; align-items:center; justify-content:center; }\
  #ejoshi-helper .eh-send:disabled { opacity:.45; cursor:default; }\
  #ejoshi-helper .eh-disclaimer { padding:0 14px 10px; font-size:10.5px; color:rgba(230,215,180,0.35); text-align:center; }\
  @media (prefers-reduced-motion: reduce){ #ejoshi-helper .eh-launch .eh-pulse, #ejoshi-helper .eh-typing span { animation:none; } #ejoshi-helper .eh-panel{transition:opacity .12s;} }\
  @media (max-width:480px){ #ejoshi-helper{right:14px; bottom:14px;} #ejoshi-helper .eh-panel{ width:calc(100vw - 28px); height:70vh; } }';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ============================================================
  // DOM
  // ============================================================
  var root = document.createElement('div');
  root.id = 'ejoshi-helper';
  root.innerHTML = '\
    <button class="eh-launch" aria-label="' + CONFIG.launcherLabel + '" aria-expanded="false">\
      <span class="eh-pulse" aria-hidden="true"></span>\
      <img src="' + CONFIG.iconSrc + '" alt="" aria-hidden="true">\
    </button>\
    <section class="eh-panel" role="dialog" aria-label="' + CONFIG.panelTitle + '" aria-hidden="true">\
      <header class="eh-head">\
        <img src="' + CONFIG.iconSrc + '" alt="" aria-hidden="true">\
        <div><div class="eh-tt">' + CONFIG.panelTitle + '</div><div class="eh-sub">' + CONFIG.panelSubtitle + '</div></div>\
        <button class="eh-close" aria-label="Close helper">&times;</button>\
      </header>\
      <div class="eh-log" aria-live="polite"></div>\
      <div class="eh-disclaimer">Ejoshi can make mistakes — check anything important.</div>\
      <div class="eh-foot">\
        <textarea class="eh-input" rows="1" placeholder="' + CONFIG.placeholder + '" aria-label="Your question"></textarea>\
        <button class="eh-send" aria-label="Send">&#8593;</button>\
      </div>\
    </section>';
  document.body.appendChild(root);

  var launch = root.querySelector('.eh-launch');
  var panel  = root.querySelector('.eh-panel');
  var closeB = root.querySelector('.eh-close');
  var log    = root.querySelector('.eh-log');
  var input  = root.querySelector('.eh-input');
  var sendB  = root.querySelector('.eh-send');

  var history = [];
  var greeted = false;

  function addMsg(text, who) {
    var d = document.createElement('div');
    d.className = 'eh-msg ' + (who === 'user' ? 'eh-user' : 'eh-bot');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  function showTyping() {
    var t = document.createElement('div');
    t.className = 'eh-typing'; t.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    return t;
  }

  function openPanel() {
    root.classList.add('eh-open');
    launch.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    if (!greeted) { addMsg(CONFIG.greeting, 'bot'); greeted = true; }
    setTimeout(function () { input.focus(); }, 200);
  }
  function closePanel() {
    root.classList.remove('eh-open');
    launch.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    launch.focus();
  }

  async function send() {
    var msg = input.value.trim();
    if (!msg) return;
    addMsg(msg, 'user');
    history.push({ role: 'user', text: msg });
    input.value = ''; input.style.height = 'auto';
    sendB.disabled = true;
    var typing = showTyping();

    try {
      var reply;
      if (DEMO) {
        await new Promise(function (r) { setTimeout(r, 700); });
        reply = CONFIG.notWiredText;
      } else {
        var res = await fetch(CONFIG.endpoint, {
          method: CONFIG.method,
          headers: CONFIG.headers,
          body: CONFIG.buildBody(msg, history)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var data = await res.json();
        reply = CONFIG.parseReply(data) || CONFIG.errorText;
      }
      typing.remove();
      addMsg(reply, 'bot');
      history.push({ role: 'assistant', text: reply });
    } catch (e) {
      typing.remove();
      addMsg(CONFIG.errorText, 'bot');
    } finally {
      sendB.disabled = false;
      input.focus();
    }
  }

  // events
  launch.addEventListener('click', function () {
    root.classList.contains('eh-open') ? closePanel() : openPanel();
  });
  closeB.addEventListener('click', closePanel);
  sendB.addEventListener('click', send);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('eh-open')) closePanel();
  });
})();
