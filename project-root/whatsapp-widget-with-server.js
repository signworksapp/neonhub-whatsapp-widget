{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 /* NeonHub WhatsApp Widget - With Server Integration */\
/* Connects to server for email notifications via Mailgun */\
\
(function() \{\
  'use strict';\
  \
  // Configuration - Use window.NEONHUB_CONFIG if available (from Liquid template), otherwise use defaults\
  const NEONHUB_CONFIG = window.NEONHUB_CONFIG || \{\
    // Your WhatsApp number (include country code)\
    whatsappNumber: '971502528436',\
    \
    // \uc0\u9989  Updated: Your server API URL on Vercel\
    apiUrl: 'https://neonhub-whatsapp-widget.vercel.app/api/submit-lead',\
    \
    // Agent details\
    agentName: 'Mia from NeonHub',\
    agentSubtitle: 'online now',\
    \
    // Messages\
    message1: "Hi! I'm Mia from the NeonHub design team. I'll help you get started with your custom neon sign.",\
    message2: "Just share your email and phone below and we'll connect with you on WhatsApp to discuss your project!",\
    whatsappMessage: "Hi! I'm interested in a custom neon sign, Looking forward to discussing my project!",\
    \
    // GTM tracking (set to false if you don't use Google Tag Manager)\
    enableGTM: true\
  \};\
\
  // Initialize widget when DOM is ready\
  if (document.readyState === 'loading') \{\
    document.addEventListener('DOMContentLoaded', initNeonHubWidget);\
  \} else \{\
    initNeonHubWidget();\
  \}\
\
  function initNeonHubWidget() \{\
    const existingWidget = document.getElementById('neonhub-whatsapp-widget');\
    \
    if (existingWidget) \{\
      console.log('NeonHub Widget: Using existing HTML from Liquid template');\
      initEventListeners();\
    \} else \{\
      console.log('NeonHub Widget: Creating HTML dynamically');\
      createWidgetHTML();\
      initEventListeners();\
    \}\
  \}\
\
  function createWidgetHTML() \{\
    const widgetContainer = document.createElement('div');\
    widgetContainer.id = 'neonhub-whatsapp-widget';\
    widgetContainer.innerHTML = `\
      <!-- Floating Button -->\
      <div class="neonhub-whatsapp-float">\
        <button id="neonhubOpenBtn" type="button">\
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">\
          <span>Chat on WhatsApp</span>\
        </button>\
      </div>\
\
      <!-- Popup -->\
      <div class="neonhub-whatsapp-popup" id="neonhubPopup">\
        <div class="neonhub-whatsapp-header">\
          <div class="neonhub-agent-info">\
            <div class="neonhub-agent-avatar">\
              <div class="neonhub-online-dot"></div>\
            </div>\
            <div class="neonhub-agent-details">\
              <h4>$\{NEONHUB_CONFIG.agentName\}</h4>\
              <p>$\{NEONHUB_CONFIG.agentSubtitle\}</p>\
            </div>\
          </div>\
          <span class="neonhub-whatsapp-close" id="neonhubCloseBtn">\'d7</span>\
        </div>\
        \
        <div class="neonhub-whatsapp-body">\
          <div class="neonhub-chat-bubble" id="neonhubMessage1" style="display: none;">\
            $\{NEONHUB_CONFIG.message1\}\
          </div>\
          \
          <div class="neonhub-typing" id="neonhubTyping" style="display: none;">\
            <span></span><span></span><span></span>\
          </div>\
          \
          <div class="neonhub-chat-bubble" id="neonhubMessage2" style="display: none;">\
            $\{NEONHUB_CONFIG.message2\}\
          </div>\
\
          <div class="neonhub-form-container" id="neonhubForm" style="display: none;">\
            <div class="neonhub-input-bubble">\
              <input type="email" id="neonhubEmail" placeholder="Your Email" required>\
            </div>\
            <div class="neonhub-input-bubble">\
              <input type="tel" id="neonhubPhone" placeholder="Your Phone Number" required>\
            </div>\
            <button type="button" class="neonhub-submit-btn" id="neonhubSubmitBtn">\
              Connect me on WhatsApp\
            </button>\
          </div>\
        </div>\
      </div>\
\
      <!-- Toast -->\
      <div class="neonhub-toast" id="neonhubToast">Connecting you to WhatsApp...</div>\
    `;\
    document.body.appendChild(widgetContainer);\
  \}\
\
  function initEventListeners() \{\
    setTimeout(function() \{\
      const popup = document.getElementById('neonhubPopup');\
      const openBtn = document.getElementById('neonhubOpenBtn');\
      const closeBtn = document.getElementById('neonhubCloseBtn');\
      const submitBtn = document.getElementById('neonhubSubmitBtn');\
\
      if (!openBtn || !closeBtn || !submitBtn || !popup) return;\
\
      openBtn.addEventListener('click', function(e) \{\
        e.preventDefault();\
        showPopup();\
      \});\
\
      closeBtn.addEventListener('click', function(e) \{\
        e.preventDefault();\
        hidePopup();\
      \});\
\
      submitBtn.addEventListener('click', function(e) \{\
        e.preventDefault();\
        submitForm();\
      \});\
    \}, 100);\
  \}\
\
  function showPopup() \{\
    const popup = document.getElementById('neonhubPopup');\
    const typing = document.getElementById('neonhubTyping');\
    const msg1 = document.getElementById('neonhubMessage1');\
    const msg2 = document.getElementById('neonhubMessage2');\
    const form = document.getElementById('neonhubForm');\
\
    if (!popup) return;\
\
    popup.style.display = 'block';\
    if (msg1) msg1.style.display = 'none';\
    if (msg2) msg2.style.display = 'none';\
    if (typing) typing.style.display = 'none';\
    if (form) form.style.display = 'none';\
\
    setTimeout(() => \{ if (msg1) msg1.style.display = 'block'; \}, 500);\
    setTimeout(() => \{ if (typing) typing.style.display = 'block'; \}, 1200);\
    setTimeout(() => \{ if (typing) typing.style.display = 'none'; if (msg2) msg2.style.display = 'block'; \}, 2200);\
    setTimeout(() => \{ if (form) form.style.display = 'block'; \}, 2800);\
  \}\
\
  function hidePopup() \{\
    const popup = document.getElementById('neonhubPopup');\
    if (popup) popup.style.display = 'none';\
  \}\
\
  function submitForm() \{\
    const emailInput = document.getElementById('neonhubEmail');\
    const phoneInput = document.getElementById('neonhubPhone');\
    const submitBtn = document.getElementById('neonhubSubmitBtn');\
    \
    if (!emailInput || !phoneInput || !submitBtn) return;\
    \
    const email = emailInput.value.trim();\
    const phone = phoneInput.value.trim();\
    \
    if (!email || !phone) \{\
      alert('Please fill in your email and phone number.');\
      return;\
    \}\
\
    submitBtn.disabled = true;\
    submitBtn.innerHTML = '<div class="neonhub-loading"></div>Submitting...';\
\
    fetch(NEONHUB_CONFIG.apiUrl, \{\
      method: 'POST',\
      headers: \{ 'Content-Type': 'application/json' \},\
      body: JSON.stringify(\{ email: email, phone: phone \})\
    \})\
    .then(res => res.json())\
    .then(result => \{\
      if (result.success) \{\
        submitBtn.innerHTML = 'Connected';\
        submitBtn.style.background = '#4CAF50';\
        emailInput.value = '';\
        phoneInput.value = '';\
\
        setTimeout(() => \{\
          const whatsappURL = `https://wa.me/$\{NEONHUB_CONFIG.whatsappNumber\}?text=$\{encodeURIComponent(NEONHUB_CONFIG.whatsappMessage)\}`;\
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);\
          if (isMobile) \{\
            window.location.href = whatsappURL;\
          \} else \{\
            window.open(whatsappURL, '_blank');\
          \}\
          setTimeout(() => \{ hidePopup(); \}, isMobile ? 100 : 500);\
        \}, 1500);\
      \} else \{\
        throw new Error(result.error || 'Submission failed');\
      \}\
    \})\
    .catch(err => \{\
      console.error('Error submitting lead:', err);\
      submitBtn.innerHTML = 'Try again';\
      submitBtn.style.background = '#f44336';\
      setTimeout(() => \{\
        submitBtn.innerHTML = 'Connect me on WhatsApp';\
        submitBtn.style.background = '';\
        submitBtn.disabled = false;\
      \}, 3000);\
    \});\
  \}\
\
\})();\
}