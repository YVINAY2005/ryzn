# Ryze AI - Deterministic UI Generator

An AI-powered agent that converts natural language UI intent into working UI code using a fixed, deterministic component library.

## 🚀 Overview

Ryze AI is a "Claude-Style" UI generator built for speed, safety, and reproducibility. It uses a three-step agent architecture to ensure that every UI generated follows strict design rules and uses a predefined set of components.

## 🏗 Architecture

The application follows a modular architecture:

- **Frontend**: React + TypeScript + Vite
- **UI System**: A fixed library of atomic components (`@/ui`)
- **Agent Orchestration**: Powered by **Claude 3.5 Sonnet** (Anthropic API) using a multi-step process (Planner -> Generator -> Explainer)
- **Live Preview**: Real-time rendering using `react-live`
- **Code Editor**: `monaco-editor` for a professional code editing experience

### 🤖 Agent Design

The agent uses **Claude 3.5 Sonnet** to ensure high-quality UI generation while remaining deterministic. It follows these steps:

1.  **Planner**: Interprets user intent, chooses the layout strategy, and selects the necessary components. It outputs a structured JSON plan.
2.  **Generator**: Converts the JSON plan into valid React + TypeScript code. It is restricted to using only allowed components and layout wrappers.
3.  **Explainer**: Provides a natural language explanation of the design decisions made by the agent.

Each step is a separate API call to Claude with specific system instructions to maintain prompt separation and role integrity.

### 🛠 Component System

The system uses a fixed set of components defined in `src/ui`:
- `Button`, `Card`, `Input`, `Table`, `Modal`, `Sidebar`, `Navbar`, `Chart`

**Constraints:**
- No inline styles allowed in generated code.
- No Tailwind classes allowed (except for predefined layout wrappers: `layout`, `row`, `col`, `stack`, `grid`).
- No external UI libraries.

## 🛡 Safety & Validation

- **Component Whitelist**: The generator is restricted to a specific list of components.
- **Static Analysis**: A validator checks the generated code for forbidden imports, inline styles, and unauthorized CSS classes before rendering.
- **Prompt Injection Protection**: The system prompts include strict "HARD RULES" and role-specific boundaries to prevent bypassing the component system.

## ⏱ Features

- **AI-Powered UI Generation**: Real-time conversion of text to UI using **Claude 3.5 Sonnet**.
- **Iterative Edits**: Modify existing UI by chatting with the agent.
- **Live Preview**: See changes instantly as you type or chat.
- **Version Control**: Roll back to any previous version of the generated UI.
- **Step Transparency**: View the agent's "Thinking Process" for each generation.

## 🚀 Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root and add your Anthropic API Key:
    ```env
    VITE_ANTHROPIC_API_KEY=your_key_here
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 📉 Known Limitations

- **Browser-Side API Calls**: In this demo, API calls are made directly from the client (using `dangerouslyAllowBrowser: true`). In a production app, these should be handled via a secure backend.
- **Simple Layouts**: Complex nested layouts might require more specific layout wrappers.
- **Data Persistence**: Versions are stored in-memory and will be lost on page refresh.

## 🔮 Future Improvements

- **Streaming Responses**: Implement real-time streaming for the AI's explanation and code generation.
- **Diff View**: Add a visual diff between versions to see exactly what changed.
- **Advanced Validation**: Use AST-based parsing for more robust code validation.
- **Component Schema**: Define a JSON schema for components to allow for better planning and validation.
- **Export Functionality**: Allow users to export the generated code as a standalone React component or a zip file.
