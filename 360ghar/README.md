# 360 Ghar — AI Property Search Assistant

> India's AI & VR-Powered Real Estate Platform — Intern Assignment Submission

---

## 🚀 Setup Instructions

### 1. Clone & Install
```bash
cd 360ghar-ai-search
npm install
```

### 2. Add OpenRouter API Key
```bash
cp .env.example .env
```
Edit `.env` and replace with your key:
```
REACT_APP_OPENROUTER_KEY=sk-or-v1-xxxxxxxxxxxxxxxx
```
Get a **free key** (no credit card) at [openrouter.ai/keys](https://openrouter.ai/keys)

### 3. Run
```bash
npm start
```
Opens at [http://localhost:3000](http://localhost:3000)

---

## 🛠 Stack
| Layer | Choice |
|---|---|
| Framework | React 18 (Create React App) |
| LLM API | OpenRouter — `google/gemma-3-27b-it:free` |
| Styling | Pure CSS, CSS variables, Google Fonts |
| Icons | Lucide React |
| Data | 12 mock properties (Gurgaon sectors, realistic prices) |

---

## ✅ Features Built

### Core (All 4 Required)
1. **Natural Language Search** → LLM parses query into structured filters (BHK, price, sectors, amenities) → drives results
2. **Property Cards** — polished grid with BHK, price, area, match reason badges, 360° thumbnail
3. **AI Property Summary** — live OpenRouter call on card click, personalised 2-3 lines referencing the original query
4. **Bonus Feature** — multiple bonus features below

### Bonus Features
- 🎙 **Voice Search** — Web Speech API (Chrome), locale `en-IN` for Indian accents
- ⚖️ **Side-by-Side Comparison** — select 2 properties, compare all attributes with winner highlights
- 💡 **AI Follow-up Question** — after each search, AI suggests a clarifying question
- 🔗 **Shareable Search Links** — query encoded in URL (`?q=...`), pre-fills on load

---

## 🧠 Prompt Design Notes

### Query Parsing Prompt
The system prompt returns **only a strict JSON schema** — no prose, no markdown wrappers. Key design decisions:

1. **Schema-first**: All field names, types, and null behaviour defined upfront. This prevents hallucination and makes parsing deterministic.

2. **Explicit mapping rules**: `"good sunlight" → ["Natural Light"]`, `"near school" → ["School Nearby"]`, Crore→Lakhs conversion — all spelled out. Without this, the model returns inconsistent keys that don't map to the property data.

3. **Heuristics for vague queries**: `"budget" → maxPrice: 70`, `"luxury" → minPrice: 100`. The model doesn't leave null when intent is clear.

4. **Fallback parser**: If the API call fails, a local regex-based parser handles the query gracefully — app never breaks.

### What Didn't Work
- **No system prompt**: Model returned verbose explanations + JSON mixed together — fragile to parse.
- **Asking for confidence scores**: Added noise without value at this scale.
- **Mistral-7b-instruct**: Occasionally returned malformed JSON on complex multi-criteria queries. Gemma-3-27b was noticeably more reliable for structured output.

### Property Summary Prompt
- Injects both the user's **exact original query** and full property data into one message.
- Explicit instructions: *second person, specific references, no disclaimers, no generic phrases*.
- `max_tokens: 200` forces conciseness — prevents rambling.

### Model Choice: `google/gemma-3-27b-it:free`
- More reliable structured JSON output than smaller free models
- 27B parameters gives better nuance for personalised summaries
- Free tier with no rate limit issues for prototype usage

---

## 📁 Architecture

```
src/
├── App.jsx                  # Root: search state, routing, orchestration
├── App.css                  # All styles (dark luxury theme, CSS variables)
├── components/
│   ├── PropertyCard.jsx     # Card UI + match badges
│   ├── PropertyModal.jsx    # Detail modal + live AI summary
│   └── CompareModal.jsx     # Side-by-side comparison
├── data/
│   └── properties.js        # 12 mock Gurgaon properties + helpers
└── utils/
    ├── openrouter.js        # All LLM API calls (parse, summary, follow-up)
    └── filter.js            # Client-side filtering, ranking, badge logic
```

State managed entirely with React hooks — no Redux or external state library needed.

---

## 🎨 Design Notes
- **Dark luxury aesthetic** — intentional for a premium real estate brand
- **Playfair Display** serif for headings — editorial, authoritative, real estate-appropriate
- **Gold accent** (#e8b86d) — wealth and property feel without being garish
- Cards lift on hover, modals animate in — polish without overengineering

---

## ⚠️ Known Limitations
- API key in frontend env var — fine for prototype; production would proxy through a backend
- Voice search requires Chrome (Web Speech API not universally supported)
- OpenRouter free tier has occasional rate limits under heavy concurrent use
