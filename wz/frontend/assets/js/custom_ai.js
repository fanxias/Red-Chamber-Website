document.addEventListener('DOMContentLoaded', () => {
    // --- AI 文本翻译功能 ---
    const translateInput = document.getElementById('ai-translate-input');
    const translateButton = document.getElementById('ai-translate-btn');
    const translatedOutput = document.getElementById('ai-translated-output');

    if (translateButton && translateInput && translatedOutput) {
        translateButton.addEventListener('click', async () => {
            const textToTranslate = translateInput.value.trim();
            if (!textToTranslate) {
                translatedOutput.innerHTML = '<span style="color: red;">请输入要翻译的文本。</span>';
                return;
            }

            translatedOutput.innerText = '正在翻译中...';
            translateButton.disabled = true; // 禁用按钮防止重复点击
            translateButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 翻译中...';


            try {
                // 向后端 API 发送请求
                const response = await fetch('http://localhost:5000/api/translate', { // 指向你的后端API
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: textToTranslate,
                        target_language: 'en' // 固定翻译成英文
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || response.statusText}`);
                }

                const data = await response.json();
                if (data.translated_text) {
                    translatedOutput.innerText = data.translated_text;
                } else {
                    translatedOutput.innerHTML = '<span style="color: red;">翻译失败：</span>' + (data.error || '未知错误');
                }

            } catch (error) {
                console.error('翻译请求失败:', error);
                translatedOutput.innerHTML = '<span style="color: red;">翻译失败，请检查后端服务是否运行或API Key是否正确。</span>';
            } finally {
                translateButton.disabled = false; // 启用按钮
                translateButton.innerHTML = '翻译成英文';
            }
        });
    }


    // --- AI 聊天机器人功能 ---
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessagesDiv = document.getElementById('chat-messages');

    if (chatInput && sendChatBtn && chatMessagesDiv) {
        sendChatBtn.addEventListener('click', async () => {
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;

            addMessage(userMessage, 'user'); // 添加用户消息到聊天界面
            chatInput.value = ''; // 清空输入框
            sendChatBtn.disabled = true; // 禁用按钮
            sendChatBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 发送中...';


            try {
                // 向后端 API 发送请求
                const response = await fetch('http://localhost:5000/api/chat', { // 指向你的后端API
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || response.statusText}`);
                }

                const data = await response.json();
                if (data.response) {
                    addMessage(data.response, 'ai'); // 添加AI回复到聊天界面
                } else {
                    addMessage('AI回复失败：' + (data.error || '未知错误'), 'ai');
                }

            } catch (error) {
                console.error('聊天请求失败:', error);
                addMessage('聊天请求发送失败，请检查后端服务是否运行或API Key是否正确。', 'ai');
            } finally {
                sendChatBtn.disabled = false; // 启用按钮
                sendChatBtn.innerHTML = '<i class="bi bi-send"></i> 发送';
            }
        });

        // 允许按回车键发送消息
        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // 阻止默认的回车换行行为
                sendChatBtn.click(); // 触发点击事件
            }
        });
    }

    // 辅助函数：添加消息到聊天界面
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.innerHTML = `<strong>${sender === 'user' ? '你' : 'AI'}:</strong> ${message}`;
        chatMessagesDiv.appendChild(messageElement);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // 滚动到底部
    }
});