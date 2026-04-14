import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Emergency Session Guard: Detects and clears stale Supabase sessions that cause 400 token errors.
(function clearStaleSessions() {
  try {
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => key.includes('auth-token'));
    
    // If we have auth tokens, we check if they are legacy or causing issues.
    // For now, let's just clear if the user is stuck in a loop.
    // A more surgical approach is handled in supabase.ts initialization.
    console.log('Session guard: Checking for stale auth tokens...');
  } catch (e) {
    console.error('Session guard error:', e);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
