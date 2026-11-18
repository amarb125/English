# English Coach

Say or type a sentence in your own language (Hindi, Hinglish, Tamil, Spanish, …) and learn how it is said in natural English — and **why** it is framed that way.

For every sentence you get:

- **The natural English sentence**, with a 🔊 button to hear it
- **Word-for-word meaning**, so you can see why direct translation sounds wrong
- **Why it's framed this way**: the sentence pattern, the tense, and the reasoning (word order, articles, prepositions…)
- **Piece by piece** mapping from your words to the English words
- **Grammar points** with new example sentences
- **Other ways to say it** (casual, formal, polite…)
- **Common mistakes** speakers of your language make
- **A practice sentence** to try yourself

Voice input (🎤) works in Chrome and Edge: choose your language, press Speak, and say your sentence. Your recent sentences are saved in your browser.

## Run it

Requires Node.js 18+ and an Anthropic API key (https://console.anthropic.com).

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

Open http://localhost:3000.

Optional environment variables: `PORT` (default 3000), `CLAUDE_MODEL` (default `claude-opus-5-5`).

## How it works

- `server.js` — Express server. `POST /api/explain` sends the sentence to Claude and uses structured outputs (a Zod schema) so the lesson always comes back in the same shape.
- `public/index.html` — the whole UI: input, voice input, lesson cards, text-to-speech, and history.
