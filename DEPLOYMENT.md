# Jarvis deployment

The source matches OpenJarvis revision 6201505cd3425079459589f54764667b4758ce48 from the supplied ZIP. Original licensing and attribution are retained.

Netlify hosts the React frontend only. Build configuration is in netlify.toml. Production domain: https://jarvis.argenis.net.

AI chat, agents, integrations, and storage require a separately running OpenJarvis Python backend and configured inference service. Netlify does not run these services. In the web interface Settings, set Server URL to your HTTPS backend and configure its API key locally. Never put private API keys in VITE_* build variables, which are public in the browser bundle.

Configure backend authentication and permit the frontend origin https://jarvis.argenis.net through backend CORS. Keep shell/file tools restricted to a trusted, isolated backend environment. See the upstream installation documentation in README.md for backend setup.
