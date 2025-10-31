import os
import openai
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

try:
    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except TypeError:
    # Fallback for older openai versions
    openai.api_key = os.getenv("OPENAI_API_KEY")
    client = openai

@app.route('/api/generate', methods=['POST'])
def generate():
    data = request.get_json()
    messages = data.get('messages')

    if not messages:
        return jsonify({"error": "Messages are required"}), 400

    system_prompt = """
You are an expert software architect that helps users create highly detailed, spec-driven implementation plans. Your goal is to generate a comprehensive, step-by-step plan that is so detailed it can be executed by another AI agent.

**IMPORTANT RULE: Your response MUST be a JSON object containing ONLY ONE of the following top-level keys: "plan" or "question".**

1.  **If the user's request is ambiguous or lacks details**, you MUST ask clarifying questions to ensure you can create a sufficiently detailed plan. Your response must be a JSON object with a single key, "question", which is a string.
    Example: {"question": "What state management library, if any, should be used for the React Native to-do list?"}

2.  **If you have enough information**, you MUST generate a SPEC-DRIVEN plan. Your response must be a JSON object with a single key, "plan".
    - The "plan" is an array of objects, where each object is a step.
    - Each step object must have: 'id' (integer), 'task' (a concise summary of the step), 'status' ('pending'), and 'details' (an array of highly specific, actionable items).
    - **Details must be exhaustive.** For a new file, you must specify its name, path, and a detailed description of its purpose, including function signatures, component props, and state structure.
    - **Commands MUST be explicit and executable.** Do not describe a command; provide the exact command to run.
    - Each detail object must have: 'type' ('command', 'file', or 'info'), 'content' (the specific command, file content placeholder, or detailed information), and optionally 'name' (for files, including the full path).
    - After the plan, you MUST ask for confirmation. Add a "confirmation" key to the JSON response with the value "Do you want to go ahead with this plan?".

    Example of a valid SPEC-DRIVEN plan response:
    {
      "plan": [
        {
          "id": 1,
          "task": "Set up project structure",
          "status": "pending",
          "details": [
            {
              "type": "command",
              "name": "Create Expo App",
              "content": "npx create-expo-app DatingApp --template"
            },
            {
              "type": "command",
              "name": "Install dependencies",
              "content": "npm install @react-navigation/native @react-navigation/stack redux firebase"
            }
          ]
        },
        {
          "id": 2,
          "task": "Create the main App component",
          "status": "pending",
          "details": [
            {
              "type": "file",
              "name": "App.js",
              "content": "This file will contain the main App component and set up the basic navigation."
            }
          ]
        }
      ],
      "confirmation": "Do you want to go ahead with this plan?"
    }
"""

    try:
        if hasattr(client, 'chat'):
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    *messages
                ],
                max_tokens=2000
            )
            return jsonify(json.loads(response.choices[0].message.content))
        else:
            return jsonify({"error": "This version of the OpenAI library does not support conversations."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-code', methods=['POST'])
def generate_code():
    data = request.get_json()
    step = data.get('step')
    messages = data.get('messages')

    if not step:
        return jsonify({"error": "Step is required"}), 400
    
    if not messages:
        return jsonify({"error": "Messages are required"}), 400

    code_generation_prompt = f"""
You are a helpful assistant that generates code based on a given plan step.

Here is the conversation history:
{json.dumps(messages, indent=2)}

Here is the step to implement:
{json.dumps(step, indent=2)}

Please now generate the full code for this step. You must return a JSON object with the following keys:
- 'id': the id of the step from the plan.
- 'files': an array of objects, where each object represents a file to be created or modified. Each file object must have the following keys: 'name' (the name of the file) and 'content' (the full code for the file).
"""

    try:
        if hasattr(client, 'chat'):
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": code_generation_prompt},
                    {"role": "user", "content": "Please generate the code for the step."}
                ],
                max_tokens=4000
            )
            return jsonify(json.loads(response.choices[0].message.content))
        else:
            return jsonify({"error": "This version of the OpenAI library does not support code generation."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)