import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import UIVersion from './models/UIVersion.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB (ESM)'))
  .catch(err => console.error('MongoDB connection error:', err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const primaryModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

const ALLOWED_COMPONENTS = ["Button", "Card", "Input", "Table", "Modal", "Sidebar", "Navbar", "Chart"];
const ALLOWED_CLASSES = [
  "layout", "row", "col", "stack", "grid",
  "text-center", "text-primary", "text-muted", "text-lg", "text-xl", "font-bold", "font-semibold",
  "p-2", "p-4", "p-8", "m-2", "m-4", "w-full", "h-full", "flex-1",
  "items-center", "justify-center", "justify-between", "gap-2", "gap-4",
  "rounded-lg", "shadow-sm"
];

const validateCode = (code) => {
  const errors = [];
  
  // Forbidden imports
  const imports = code.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || [];
  imports.forEach(imp => {
    const source = imp.match(/from\s+['"](.*?)['"]/)?.[1];
    if (source && !source.startsWith('react') && source !== '@/ui') {
      errors.push(`Forbidden import: ${source}`);
    }
  });

  // Inline styles
  if (code.includes('style={{')) {
    errors.push("Forbidden: Inline styles are not allowed.");
  }

  // Component whitelist
  const componentTags = code.match(/<([A-Z][a-zA-Z]*)/g) || [];
  componentTags.forEach(tag => {
    const name = tag.substring(1);
    if (!ALLOWED_COMPONENTS.includes(name) && name !== 'GeneratedUI' && name !== 'React') {
      errors.push(`Forbidden component: ${name}`);
    }
  });

  // Class whitelist
  const classMatches = code.match(/className=["'](.*?)["']/g) || [];
  classMatches.forEach(match => {
    const classStr = match.match(/className=["'](.*?)["']/)?.[1] || "";
    const classList = classStr.split(/\s+/).filter(Boolean);
    classList.forEach(c => {
      if (!ALLOWED_CLASSES.includes(c)) {
        errors.push(`Forbidden class: ${c}`);
      }
    });
  });

  return { isValid: errors.length === 0, errors };
};

const SYSTEM_PROMPT_BASE = `You are an expert React developer for Ryze AI.
You generate UI code using a FIXED COMPONENT LIBRARY.

ALLOWED COMPONENTS from "@/ui":
${ALLOWED_COMPONENTS.map(c => `- ${c}`).join('\n')}

ALLOWED LAYOUT & UTILITY WRAPPERS (classNames):
${ALLOWED_CLASSES.map(c => `- ${c}`).join('\n')}

HARD RULES:
1. Use ONLY components from "@/ui".
2. Use ONLY the classNames above for styling. NEVER invent new classNames.
3. NEVER use inline styles (style={{...}}).
4. NEVER use external libraries or icons (like lucide-react).
5. NEVER create new components.
6. If you need a color or style not in the list, you MUST stick to the allowed list regardless.
7. Output ONLY valid React code.
`;

async function runStep(stepName, prompt) {
  const models = [primaryModel, fallbackModel];
  let lastError = null;

  for (const model of models) {
    let retries = 5;
    let delay = 3000; // Increased base delay
    
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        const isRateLimit = error.message.includes('429') || error.message.includes('Too Many Requests') || error.message.includes('quota');
        const isServiceUnavailable = error.message.includes('503') || error.message.includes('Service Unavailable') || error.message.includes('overloaded');
        
        if (isRateLimit || isServiceUnavailable) {
          const waitTime = isRateLimit ? 20000 : delay; // 20s for rate limits
          console.log(`[${stepName}] ${isRateLimit ? '429 Rate Limit' : '503 Busy'} detected, retrying in ${waitTime/1000}s... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          delay *= 2;
          continue;
        }
        break; // If it's not a retryable error, stop retrying this model
      }
    }
    console.log(`[${stepName}] Failed with current model, trying fallback if available...`);
  }
  
  throw new Error(`The AI service is currently at maximum capacity. This usually happens on the Google Free Tier when too many requests are sent at once. Please wait 30-60 seconds and try again.`);
}

app.post('/api/generate', async (req, res) => {
  const { message, mode, currentCode } = req.body;
  const thinking = [];

  try {
    // 1. Planner Step
    thinking.push("Step 1: Planner - Interpreting user intent and selecting components...");
    const plannerPrompt = `${SYSTEM_PROMPT_BASE}\n\nTASK: Act as the PLANNER. Analyze user intent and output a structured JSON plan.\n\nIntent: "${message}"\nMode: ${mode}\nCurrent Code: ${currentCode}\n\nOutput a JSON object with: intent_summary, layout_strategy, components_used, and specific_changes. Output ONLY the JSON.`;
    const planText = await runStep("Planner", plannerPrompt);
    const plan = JSON.parse(planText.match(/\{[\s\S]*\}/)?.[0] || '{}');

    // 2. Generator Step
    thinking.push("Step 2: Generator - Converting plan into React code...");
    const genPrompt = `${SYSTEM_PROMPT_BASE}\n\nTASK: Act as the GENERATOR. Convert the provided plan into valid React code using ONLY allowed components. Output ONLY the code block.\n\nPlan: ${JSON.stringify(plan)}\nCurrent Code: ${currentCode}`;
    const rawCode = await runStep("Generator", genPrompt);
    const code = rawCode.match(/```tsx?([\s\S]*?)```/)?.[1] || rawCode;

    // 3. Validation Step
    thinking.push("Step 3: Validation - Ensuring code safety and correctness...");
    const validation = validateCode(code);
    if (!validation.isValid) {
      throw new Error(`Safety Violation: ${validation.errors.join(', ')}`);
    }

    // 4. Explainer Step
    thinking.push("Step 4: Explainer - Documenting design decisions...");
    const expPrompt = `${SYSTEM_PROMPT_BASE}\n\nTASK: Act as the EXPLAINER. Explain the decisions in plain English, referencing components and layout choices.\n\nIntent: "${message}"\nPlan: ${JSON.stringify(plan)}\nGenerated Code: ${code}`;
    const explanation = await runStep("Explainer", expPrompt);

    // 5. Database Persistence
    const lastVersion = await UIVersion.findOne().sort({ version: -1 });
    const nextVersion = (lastVersion?.version || 0) + 1;
    
    const uiVersion = new UIVersion({
      version: nextVersion,
      userMessage: message,
      plan,
      code,
      explanation,
      thinking
    });
    await uiVersion.save();

    res.json({ version: nextVersion, plan, code, explanation, thinking });
  } catch (error) {
    console.error('Agent Orchestration Error Details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
    });
    res.status(500).json({ error: error.message, thinking: ["Error encountered during generation steps."] });
  }
});

app.get('/api/versions', async (req, res) => {
  try {
    const versions = await UIVersion.find().sort({ version: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend (ESM) running on port ${PORT}`));
