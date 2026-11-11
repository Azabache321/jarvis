# Personal Jarvis

Netlify hosts the frontend and an authenticated OpenAI chat function. OPENAI_API_KEY must be a production secret available to Functions. It is never sent to the browser.

The browser uses a separate random Jarvis access token in Settings → Connection → API key. Only its SHA-256 verifier is committed in frontend/netlify/functions/jarvis.mjs. Keep the token private; changing browsers requires entering it again. To rotate, generate a fresh random 256-bit token, replace the verifier and redeploy, then update the browser. Never use the OpenAI key as the browser token.

Models are discovered from the OpenAI project and filtered to text chat model families. Access and Chat Completions compatibility can still vary by model. API errors appear in chat. Input length and output tokens are capped; OpenAI usage is billed to the saved key's project.

This deployment supports model selection and streaming text chat. Agents, research tools, integrations, speech, server memory and device telemetry require the full Python backend. Conversations remain in browser storage. The upstream analytics invitation is disabled on this hosted build.
