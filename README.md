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

## Put it online with Vercel (open it on your phone)

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New → Project** and import the `English` repository.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Click **Deploy**. You'll get a link like `https://english-xxxx.vercel.app`. Open it on your phone and use **Add to Home Screen** to get an app icon.

Anyone with the link can use it, and every sentence is charged to your API key. Set a monthly spend limit in the Anthropic Console (Settings → Limits) and don't share the link widely.

## How it works

- `lib/lesson.js` — sends the sentence to Claude and uses structured outputs (a Zod schema) so the lesson always comes back in the same shape.
- `api/explain.js` — the Vercel serverless function for `POST /api/explain`; `vercel.json` configures it.
- `server.js` — Express server for running it on your own computer.
- `public/index.html` — the whole UI: input, voice input, lesson cards, text-to-speech, and history.
