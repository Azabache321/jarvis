# Jarvis voice

Enable Speech-to-Text, Text-to-Speech, and Speak replies automatically in Settings. Select a chat model. Click the microphone, speak, and click again to stop. With automatic speech enabled, the transcript is sent automatically and Jarvis answers aloud using OpenAI's AI-generated Onyx voice. Without automatic speech, review and send the transcript manually. Microphone permission is required. This is push-to-talk, not continuous listening.

OpenAI credentials remain server-side. All speech routes require the private application bearer token. Transcription uses gpt-transcribe; synthesis uses gpt-4o-mini-tts. The latter is scheduled to shut down January 6, 2027 and requires migration to Realtime before that date.

The hosted build unregisters legacy offline service workers to prevent stale UI assets.
