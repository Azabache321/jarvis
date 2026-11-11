# Personal Jarvis voice

Dictation uses the authenticated /v1/speech/transcribe route and OpenAI gpt-transcribe. Spoken replies use /v1/speech/synthesize with the AI-generated Onyx voice through gpt-4o-mini-tts. Both use the production server-side OPENAI_API_KEY and require the same personal Jarvis access token as chat.

Enable Speech-to-Text and Text-to-Speech in Settings → Speech. Click the mic to record, click again to stop, review the transcript, then send. Microphone permission is required. Read-aloud appears on assistant messages; automatic playback is optional. Recordings are forwarded to OpenAI and not stored by this function. Uploads are capped at 4 MB and speech output at 4096 characters.

Maintenance: OpenAI currently schedules the Speech API models to shut down January 6, 2027. This existing read-aloud interface will need migration to the Realtime API before then. See https://developers.openai.com/api/docs/guides/text-to-speech.
