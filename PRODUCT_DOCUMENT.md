# Product Document: Traycer - A Conversational AI Planning Assistant

## 1. Product Vision

Traycer is a web-based application that acts as a conversational planning layer, inspired by the concept of using AI to break down high-level goals into actionable steps. The vision for this project is to create a user-friendly, chat-based interface for interacting with a powerful language model to generate, track, and refine plans. This version focuses on the core conversational UI/UX and the foundational ideas of an AI-powered planning tool that asks clarifying questions before generating a plan.

## 2. Core Features

### Existing Features (v3.0)

- **Conversational Plan Generation:** Users interact with the application through a chat interface. They can provide a high-level goal, and the AI assistant will ask clarifying questions if the goal is ambiguous.
- **AI-Powered Backend:** The application uses a Python Flask backend to communicate with the OpenAI API (`gpt-3.5-turbo`) to generate plans and ask clarifying questions.
- **Interactive Plan Steps:** Once enough information has been gathered, the AI will generate a plan, which is rendered as a list of interactive steps, each with a checkbox to mark it as complete.
- **Structured Plan Data:** The backend returns a structured JSON object that can represent either a plan or a question.
- **Stateful Conversation Management:** The frontend manages the state of the conversation, sending the entire chat history to the backend with each request.

### Planned Features (v4.0)

- **Plan Refinement:** A "Refine Plan" feature will be added to allow users to request a new plan based on additional feedback.
- **Improved UI/UX:** The user interface will be enhanced to provide a more intuitive and engaging experience, with better loading states and the ability to clear the current plan.

## 3. Architecture Overview

The application is built with a modern web stack, separating the frontend and backend for a clean and scalable architecture.

### Frontend

- **Framework:** React with TypeScript
- **Key Components:**
  - `App.tsx`: The main application component that manages the overall layout and state of the chat interface.
  - `ChatMessage.tsx`: A component to render individual chat messages, which can be either text or a plan.
- **Responsibilities:**
  - Providing the user interface for the chat conversation.
  - Sending the entire conversation history to the backend with each new message.
  - Receiving the AI's response (either a question or a plan) and rendering it in the chat window.
  - Managing the state of the conversation.

### Backend

- **Framework:** Python with Flask
- **Key Components:**
  - `main.py`: The main Flask application file that defines the API endpoints.
  - `requirements.txt`: A file listing the Python dependencies.
  - `.env`: A file to store environment variables, such as the OpenAI API key.
- **Responsibilities:**
  - Exposing a RESTful API (`/api/generate`) for the frontend to consume.
  - Receiving the conversation history from the frontend.
  - Communicating with the OpenAI API to either ask a clarifying question or generate a plan.
  - Sending the AI's response back to the frontend in a structured JSON format.

## 4. Data Flow

The data flow in the application is conversational and follows a continuous back-and-forth pattern.

1.  **User Input:** The user types a message into the chat input in the React frontend and clicks "Send".
2.  **API Request:** The frontend triggers an asynchronous `fetch` request (`POST /api/generate`) to the backend, sending the entire conversation history (including the new message) in the JSON body of the request.
3.  **Backend Processing:**
    - The Flask server receives the request and extracts the `messages` array.
    - The backend constructs a request to the OpenAI API, including the system prompt and the full conversation history.
4.  **OpenAI API:** The OpenAI API processes the request and returns a response, which will be either a clarifying question or a structured plan.
5.  **API Response:** The Flask server sends the AI's response back to the frontend in a structured JSON format (e.g., `{"question": "..."}` or `{"plan": [...]}`).
6.  **UI Update:**
    - The React frontend receives the response and updates its state, adding the new message from the assistant to the conversation history.
    - React re-renders the UI to display the new message in the chat window.
7.  **Conversation Continues:** The user can then respond to the assistant's question, and the cycle repeats until a plan is generated.

This document will serve as the guiding context for all future development on the Traycer project.
