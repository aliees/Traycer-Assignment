# Traycer Assignment

This project is a simplified implementation of Traycer, an AI-powered planning assistant. It consists of a React frontend and a Python backend that uses the OpenAI API to generate plans based on user prompts.

## Getting Started

To get started with this project, you will need to have Node.js, npm, and Python 3 installed on your machine.

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/traycer-assignment.git
cd traycer-assignment
```

### 2. Set Up the Backend

Navigate to the `backend` directory and create a virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key
```

### 3. Set Up the Frontend

Navigate to the `frontend` directory and install the required npm packages:

```bash
cd ../frontend
npm install
```

### 4. Run the Application

You will need to run the backend and frontend servers in separate terminals.

**Backend:**

```bash
cd ../backend
source venv/bin/activate
python main.py
```

The backend server will be running at `http://localhost:5000`.

**Frontend:**

```bash
cd ../frontend
npm start
```

The frontend will be running at `http://localhost:3000`, and will automatically open in your default browser.

## Usage

Once both servers are running, you can interact with the application through a chat-based interface.

1.  **Start a Conversation:** Type your high-level goal into the chat input and press "Send".
2.  **Clarify Requirements:** If your goal is ambiguous, the AI assistant will ask you clarifying questions to better understand your needs.
3.  **Receive Your Plan:** Once the assistant has enough information, it will generate a detailed, step-by-step implementation plan.
4.  **Interact with the Plan:** The plan will be displayed as a list of interactive steps. You can click the checkbox next to each step to mark it as complete.
