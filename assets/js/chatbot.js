/*=============== AI CHATBOT — GROQ POWERED ===============*/
(function () {
  'use strict';

  const CHAT_API = '/api/chat';

  /* ── DOM ─────────────────────────────────────────────────────────────── */
  const toggle   = document.getElementById('chatbot-toggle');
  const panel    = document.getElementById('chatbot-panel');
  const input    = document.getElementById('chatbot-input');
  const sendBtn  = document.getElementById('chatbot-send');
  const msgs     = document.getElementById('chatbot-messages');
  const faqWrap  = document.getElementById('chatbot-faq');
  const icoOpen  = document.getElementById('chatbot-icon-open');
  const icoClose = document.getElementById('chatbot-icon-close');

  if (!toggle || !panel) {
    console.warn('Chatbot: required DOM elements missing');
    return;
  }

  /* ── STATE ───────────────────────────────────────────────────────────── */
  let open      = false;
  let loading   = false;
  let chatHist  = [];   // [{role,content}, ...]

  /* ── OPEN / CLOSE ────────────────────────────────────────────────────── */
  function openChat() {
    open = true;
    panel.classList.add('open');
    if (icoOpen)  icoOpen.style.display  = 'none';
    if (icoClose) icoClose.style.display = '';
    if (faqWrap && chatHist.length === 0) faqWrap.style.display = '';
    setTimeout(() => input && input.focus(), 300);
  }

  function closeChat() {
    open = false;
    panel.classList.remove('open');
    if (icoOpen)  icoOpen.style.display  = '';
    if (icoClose) icoClose.style.display = 'none';
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    open ? closeChat() : openChat();
  });

  document.addEventListener('click', function (e) {
    if (open && !panel.contains(e.target) && !toggle.contains(e.target)) {
      closeChat();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && open) closeChat();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open ? input && input.focus() : openChat();
    }
  });

  /* ── HELPERS ─────────────────────────────────────────────────────────── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg ' + role;
    wrap.innerHTML = '<div class="chat-bubble">' + esc(text) + '</div>';
    msgs.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    wrap.innerHTML = '<div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  /* ── SEND ─────────────────────────────────────────────────────────────── */
  async function send(text) {
    text = (text || '').trim();
    if (!text || loading) return;

    loading = true;
    if (sendBtn) sendBtn.disabled = true;
    if (input)   input.value = '';
    if (faqWrap) faqWrap.style.display = 'none';

    addMsg('user', text);
    const typingEl = addTyping();

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHist }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      typingEl.remove();

      const reply = data.reply || data.error || 'Something went wrong.';
      addMsg('bot', reply);

      if (data.reply) {
        chatHist.push({ role: 'user',      content: text  });
        chatHist.push({ role: 'assistant', content: reply });
        if (chatHist.length > 12) chatHist = chatHist.slice(-12);
      }
    } catch (err) {
      typingEl.remove();
      addMsg('bot', '⚠️ Could not reach the server. Make sure it\'s running and GROQ_API_KEY is set in .env');
      console.error('[chatbot]', err);
    }

    loading = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input)   input.focus();
  }

  /* ── EVENTS ───────────────────────────────────────────────────────────── */
  if (sendBtn) {
    sendBtn.addEventListener('click', function () { send(input.value); });
  }

  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
  }

  document.querySelectorAll('.faq-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var q = chip.dataset.q;
      if (q) send(q);
    });
  });

})(); // end IIFE
