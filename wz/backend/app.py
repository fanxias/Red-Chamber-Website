import os
import socket
# --- 修复：强制getfqdn返回本地地址，绕过主机名解析错误 ---
# 这个修改是为了解决在某些Windows环境下socket.getfqdn()可能导致的UnicodeDecodeError
socket.getfqdn = lambda *args: "127.0.0.1"
# --- 修复结束 ---

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import requests # 导入 requests 库，用于发送 HTTP 请求

# 加载环境变量 (例如 .env 文件中的 API Key)
load_dotenv()

# 从环境变量中获取 DeepSeek API Key
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# DeepSeek API 的基础 URL
DEEPSEEK_API_BASE_URL = "https://api.deepseek.com/chat/completions"

# 初始化 Flask 应用
# static_folder='../frontend' 指明静态文件（如 index.html, CSS, JS）的根目录
# static_url_path='/' 表示这些静态文件可以通过根URL '/' 访问
app = Flask(__name__, static_folder='../frontend', static_url_path='/')

# 允许跨域请求
# 在开发环境中，CORS(app) 允许所有来源的请求，方便测试。
# 在生产环境中，建议限制为你的前端域名，例如 CORS(app, origins=["https://your-frontend-domain.com"])
CORS(app)

# --- 辅助函数：调用 DeepSeek API ---
def call_deepseek_api(messages, model="deepseek-chat"):
    """
    调用 DeepSeek API 发送请求并获取响应。
    :param messages: 遵循 DeepSeek API 消息格式的对话列表。
    :param model: 要使用的 DeepSeek 模型名称。
    :return: DeepSeek API 的 JSON 响应。
    :raises ValueError: 如果 DeepSeek API Key 未找到。
    :raises requests.exceptions.RequestException: 如果 HTTP 请求失败。
    """
    if not DEEPSEEK_API_KEY:
        raise ValueError("DeepSeek API Key not found in .env file. Please ensure DEEPSEEK_API_KEY is set.")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    payload = {
        "model": model,
        "messages": messages,
        "stream": False # 这里设置为 False，表示一次性返回所有内容
    }

    response = requests.post(DEEPSEEK_API_BASE_URL, headers=headers, json=payload)
    # 如果请求失败 (例如 4xx 或 5xx 状态码)，会抛出 HTTPError 异常
    response.raise_for_status() 
    return response.json()


# --- 路由：提供前端静态文件 ---
@app.route('/')
def serve_index():
    """
    处理根URL请求，返回前端的 index.html 文件。
    """
    return send_from_directory(app.static_folder, 'index.html')


# --- API 接口：AI 文本翻译 ---
@app.route('/api/translate', methods=['POST'])
def translate_text():
    """
    处理文本翻译请求。接收要翻译的文本、源语言和目标语言，
    然后调用 DeepSeek API 进行翻译。
    """
    data = request.get_json()
    text_to_translate = data.get('text')
    source_language = data.get('source_language', 'auto')
    target_language = data.get('target_language', 'en')

    if not text_to_translate:
        return jsonify({"error": "No text provided for translation"}), 400

    # 定义一个语言名称映射，用于在 prompt 中提供更友好的语言名称
    lang_names = {
        'en': 'English',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'fr': 'French',
        'de': 'German',
        'auto': 'the source language' # 用于自动检测时的提示
    }

    # 获取用户选择的语言的友好名称
    source_lang_name = lang_names.get(source_language, source_language)
    target_lang_name = lang_names.get(target_language, target_language)


    try:
        print(f"Received translation request: text='{text_to_translate[:50]}...' from '{source_language}' ({source_lang_name}) to '{target_language}' ({target_lang_name}) using DeepSeek") # 调试信息

        # 构造 DeepSeek 消息格式，请求翻译
        # 优化 system 消息，明确指出源语言和目标语言，并要求只返回翻译结果
        if source_language == 'auto':
            system_prompt = (
                f"You are a professional translator. "
                f"Translate the following text into {target_lang_name}. "
                f"Only return the translated text, without any additional comments or explanations."
            )
        else:
            system_prompt = (
                f"You are a professional translator. "
                f"Translate the following {source_lang_name} text into {target_lang_name}. "
                f"Only return the translated text, without any additional comments or explanations."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text_to_translate}
        ]

        deepseek_response = call_deepseek_api(messages)
        
        # --- 新增：打印 DeepSeek 的完整响应，用于调试 ---
        print("DeepSeek Translation Raw Response:")
        print(deepseek_response)
        # --- 打印结束 ---

        # 从 DeepSeek 响应中提取翻译结果
        # 假设 DeepSeek 响应结构为 deepseek_response['choices'][0]['message']['content']
        translated_text = deepseek_response['choices'][0]['message']['content']
        return jsonify({"translated_text": translated_text})

    except ValueError as ve:
        print(f"Configuration error: {ve}")
        return jsonify({"error": str(ve)}), 503
    except requests.exceptions.RequestException as re:
        print(f"DeepSeek API request error: {re}")
        if re.response is not None and re.response.status_code == 402:
            return jsonify({"error": "Failed to connect to DeepSeek API: 402 Client Error: Payment Required. Please check your DeepSeek account balance."}), 402
        return jsonify({"error": f"Failed to connect to DeepSeek API: {str(re)}"}), 500
    except Exception as e:
        print(f"Translation error: {e}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500


# --- API 接口：智能体交互 (聊天机器人) ---
@app.route('/api/chat', methods=['POST'])
def chat_with_agent():
    """
    处理聊天机器人请求。接收用户消息，然后调用 DeepSeek API 进行智能回复。
    """
    data = request.get_json()
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        print(f"Chatbot received: '{user_message[:50]}...' using DeepSeek") # 调试信息

        messages = [
            {"role": "system", "content": "You are a helpful and knowledgeable assistant specialized in 'Dream of the Red Chamber' (红楼梦). Provide accurate and insightful answers about its characters, plots, themes, and cultural significance. If a question is outside this scope, politely redirect the user to questions related to 'Dream of the Red Chamber'."},
            {"role": "user", "content": user_message}
        ]

        deepseek_response = call_deepseek_api(messages)
        
        # --- 新增：打印 DeepSeek 的完整响应，用于调试 ---
        print("DeepSeek Chat Raw Response:")
        print(deepseek_response)
        # --- 打印结束 ---

        agent_response = deepseek_response['choices'][0]['message']['content']
        return jsonify({"response": agent_response})

    except ValueError as ve:
        print(f"Configuration error: {ve}")
        return jsonify({"error": str(ve)}), 503
    except requests.exceptions.RequestException as re:
        print(f"DeepSeek API request error: {re}")
        if re.response is not None and re.response.status_code == 402:
            return jsonify({"error": "Failed to connect to DeepSeek API: 402 Client Error: Payment Required. Please check your DeepSeek account balance."}), 402
        return jsonify({"error": f"Failed to connect to DeepSeek API: {str(re)}"}), 500
    except Exception as e:
        print(f"Chatbot error: {e}")
        return jsonify({"error": f"Chatbot failed: {str(e)}"}), 500


# --- 运行 Flask 应用 ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
