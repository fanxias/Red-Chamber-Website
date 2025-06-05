/**
* Template Name: BookLanding
* Template URL: https://bootstrapmade.com/bootstrap-book-landing-page-template/
* Updated: Mar 02 2025 with Bootstrap v5.3.3
* Author: fanxias
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  // --- 辅助函数：用于从全局翻译数据中获取当前语言的文本 ---
  // 这个函数依赖于 window.translations 和 window.getTranslation 在 i18n.js 中被正确设置
  function getTranslation(key) {
      if (!window.translations || !window.getTranslation) {
          // Fallback if i18n.js is not loaded or not properly configured
          console.warn("Translation data or getTranslation function not loaded. Make sure i18n.js is loaded before main.js.");
          return key; // Return key itself as Fallback
      }
      return window.getTranslation(key); // Call the global getTranslation from i18n.js
  }

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Countdown timer
   */
  function updateCountDown(countDownItem) {
    const timeleft = new Date(countDownItem.getAttribute('data-count')).getTime() - new Date().getTime();

    const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

    countDownItem.querySelector('.count-days').innerHTML = days;
    countDownItem.querySelector('.count-hours').innerHTML = hours;
    countDownItem.querySelector('.count-minutes').innerHTML = minutes;
    countDownItem.querySelector('.count-seconds').innerHTML = seconds;

  }

  document.querySelectorAll('.countdown').forEach(function(countDownItem) {
    updateCountDown(countDownItem);
    setInterval(function() {
      updateCountDown(countDownItem);
    }, 1000);
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);


  // --- AI 文本翻译功能 ---
  // 确保这些ID与你的HTML中的ID完全匹配
  const translateInput = document.getElementById('ai-translate-input');
  const translateBtn = document.getElementById('ai-translate-btn');
  const translatedTextOutput = document.getElementById('ai-translated-output');
  const translateInputLangSelect = document.getElementById('ai-translate-input-lang'); // 新增：输入语言选择器
  const translateTargetLangSelect = document.getElementById('ai-translate-target-lang'); // 新增：目标语言选择器

  // 假设有加载和错误显示元素，如果HTML中没有，请添加
  const translationLoading = document.getElementById('translation-loading'); // 请在HTML中为加载动画添加此ID
  const translationError = document.getElementById('translation-error');     // 请在HTML中为错误信息添加此ID

  if (translateBtn && translateInput && translatedTextOutput && translateInputLangSelect && translateTargetLangSelect) {
    translateBtn.addEventListener('click', async () => {
      const text = translateInput.value.trim();
      const source_language = translateInputLangSelect.value;
      const target_language = translateTargetLangSelect.value;

      // --- DEBUGGING LOGS ---
      console.log("Frontend: Translate button clicked.");
      console.log("Frontend: Sending text:", text);
      console.log("Frontend: Source Language selected:", source_language);
      console.log("Frontend: Target Language selected:", target_language);
      // --- END DEBUGGING LOGS ---


      if (!text) {
        translatedTextOutput.textContent = getTranslation("js_translate_input_empty");
        translatedTextOutput.style.color = 'red';
        return;
      }

      if (translationLoading) translationLoading.style.display = 'block'; // 显示加载动画
      if (translationError) translationError.style.display = 'none';    // 隐藏错误信息
      translatedTextOutput.textContent = getTranslation("js_translating"); // 显示翻译中...
      translatedTextOutput.style.color = 'var(--default-color)'; // 恢复默认颜色

      try {
        const response = await fetch('http://26.26.26.1:5000/api/translate', { // URL已根据你的后端地址修改
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            source_language: source_language, // 发送源语言参数
            target_language: target_language  // 发送目标语言参数
          })
        });

        const data = await response.json();
        if (response.ok) {
          translatedTextOutput.textContent = data.translated_text;
        } else {
          translatedTextOutput.textContent = `${getTranslation("js_translate_error_prefix")} ${data.error || getTranslation("js_unknown_translation_error")}`;
          translatedTextOutput.style.color = 'red'; // 显示错误时使用红色
          console.error('翻译API错误:', data.error);
        }
      } catch (error) {
        translatedTextOutput.textContent = getTranslation("js_request_failed");
        translatedTextOutput.style.color = 'red';
        console.error('翻译请求失败:', error);
      } finally {
        if (translationLoading) translationLoading.style.display = 'none'; // 隐藏加载动画
      }
    });
  } else {
    console.warn("AI 文本翻译功能所需的部分元素未找到。请检查 'ai-translate-input', 'ai-translate-btn', 'ai-translated-output', 'ai-translate-input-lang', 'ai-translate-target-lang' 的ID是否正确。");
  }


  // --- 红楼梦智能问答（聊天）功能 ---
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatMessages = document.getElementById('chat-messages');

  // 假设有加载和错误显示元素，如果HTML中没有，请添加
  const chatLoading = document.getElementById('chat-loading'); // 请在HTML中为加载动画添加此ID
  const chatError = document.getElementById('chat-error');     // 请在HTML中为错误信息添加此ID


  if (sendChatBtn && chatInput && chatMessages) {
    // AI 助手欢迎语 (如果页面上已有，则跳过)
    // 这里的欢迎语已经通过 data-i18n 属性在 HTML 中处理，
    // i18n.js 会在页面加载时自动翻译。
    // 如果需要动态插入，请确保使用 getTranslation()
    if (!chatMessages.querySelector('.chat-message.ai')) {
         const welcomeMessageDiv = document.createElement('div');
         welcomeMessageDiv.classList.add('chat-message', 'ai');
         welcomeMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_prefix")}</strong> ${getTranslation("ai_chat_welcome_message")}`;
         chatMessages.appendChild(welcomeMessageDiv);
         chatMessages.scrollTop = chatMessages.scrollHeight;
    }


    sendChatBtn.addEventListener('click', async () => {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // 添加用户消息到聊天框
      const userMessageDiv = document.createElement('div');
      userMessageDiv.classList.add('chat-message', 'user');
      userMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_user_prefix") || "你:"}</strong> ${userMessage}`; // 假设有一个用户前缀翻译键
      chatMessages.appendChild(userMessageDiv);
      chatInput.value = ''; // 清空输入框
      chatMessages.scrollTop = chatMessages.scrollHeight; // 滚动到底部

      // 添加 AI 占位符消息
      const aiMessageDiv = document.createElement('div');
      aiMessageDiv.classList.add('chat-message', 'ai');
      aiMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_prefix")}</strong> ${getTranslation("js_thinking_message")}`;
      chatMessages.appendChild(aiMessageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (chatLoading) chatLoading.style.display = 'block'; // 显示加载动画
      if (chatError) chatError.style.display = 'none';     // 隐藏错误信息


      try {
        const response = await fetch('http://26.26.26.1:5000/api/chat', { // URL已根据你的后端地址修改
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        if (response.ok) {
          aiMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_prefix")}</strong> ${data.response}`;
        } else {
          aiMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_prefix")}</strong> ${getTranslation("js_translate_error_prefix")} ${data.error || getTranslation("js_unknown_chat_error")}`;
          aiMessageDiv.style.color = 'red'; // 显示错误时使用红色
          console.error('聊天API错误:', data.error);
        }
      } catch (error) {
        aiMessageDiv.innerHTML = `<strong>${getTranslation("ai_chat_prefix")}</strong> ${getTranslation("js_request_failed")}`;
        aiMessageDiv.style.color = 'red';
        console.error('聊天请求失败:', error);
      } finally {
        chatMessages.scrollTop = chatMessages.scrollHeight; // 确保滚动到最新消息
        if (chatLoading) chatLoading.style.display = 'none'; // 隐藏加载动画
      }
    });

    // 允许按 Enter 键发送消息
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 阻止默认的换行行为
            sendChatBtn.click(); // 触发发送按钮的点击事件
        }
    });

  } else {
    console.warn("红楼梦智能问答功能所需的部分元素未找到。请检查 'chat-input', 'send-chat-btn', 'chat-messages' 的ID是否正确。");
  }

})();
