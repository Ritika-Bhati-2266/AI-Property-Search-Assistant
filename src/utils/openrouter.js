const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/auto";
const API_KEY = process.env.REACT_APP_OPENROUTER_KEY;

console.log("API KEY:", API_KEY);
// ─── QUERY PARSER ────────────────────────────────────────────────
export async function parseSearchQuery(query) {
  const systemPrompt = `You are a real estate search parser for an Indian property platform focused on Gurgaon/NCR.
Extract structured filters from natural language property search queries.

Return ONLY a valid JSON object with these exact fields (use null if not mentioned):
{
  "bhk": number or null,
  "minPrice": number or null (in Lakhs),
  "maxPrice": number or null (in Lakhs),
  "sectors": array of strings or [],
  "amenities": array of strings or [],
  "facing": string or null,
  "keywords": array of strings or [],
  "summary": "one sentence describing what the user wants"
}

Rules:
- Convert Crore to Lakhs (1 Crore = 100 Lakhs)
- "good sunlight" or "bright" → amenities: ["Natural Light"]
- "near school" or "DPS" or "Ryan" → amenities: ["School Nearby"]
- "metro" → amenities: ["Metro Access"]
- "pool" or "swim" → amenities: ["Swimming Pool"]
- "gym" → amenities: ["Gym"]
- Extract sector numbers: "Sector 50" → sectors: ["Sector 50"]
- "under 80 lakhs" → maxPrice: 80
- "under 1 crore" → maxPrice: 100
- "budget" or "affordable" → maxPrice: 70
- "luxury" or "premium" → minPrice: 100
- Do not wrap output in markdown or code blocks`;

  try {
    console.log("Calling API with key:", API_KEY?.slice(0, 10)); 
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://360ghar.com",
        "X-Title": "360 Ghar AI Search",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this property search query: "${query}"` },
        ],
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("parseSearchQuery failed:", err);
    // Graceful fallback: basic local parse
    return localFallbackParse(query);
  }
}

// ─── PROPERTY SUMMARY ────────────────────────────────────────────
export async function generatePropertySummary(property, userQuery) {
  const prompt = `You are a warm, knowledgeable real estate advisor for 360 Ghar, an AI-powered property platform in Gurgaon.

The user searched for: "${userQuery}"

Property details:
- ${property.bhk}BHK, ${property.area} sq ft in ${property.sector}, Gurgaon
- Price: ${property.priceUnit === "Crore" ? `₹${property.price} Crore` : `₹${property.price} Lakhs`}
- Floor: ${property.floor}
- Facing: ${property.facing}
- Amenities: ${property.amenities.join(", ")}
- Nearby schools: ${property.nearbySchools.join(", ")}
- Builder: ${property.builder}, Built: ${property.yearBuilt}
- Possession: ${property.possession}

Write exactly 2-3 sentences explaining why THIS property is a great match for the user's search.
Be specific — mention actual features that match the query. Write in second person ("you").
Do NOT use generic filler phrases. Do NOT add disclaimers or headers.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://360ghar.com",
        "X-Title": "360 Ghar Property Summary",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error("Summary API error");
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || fallbackSummary(property, userQuery);
} catch (err) {
    console.error("Summary error:", err);
    return fallbackSummary(property, userQuery);
  }
}

// ─── AI FOLLOW-UP ────────────────────────────────────────────────
export async function generateFollowUp(query, filters) {
  const prompt = `You are an AI assistant for a Gurgaon real estate search app.

User searched: "${query}"
Parsed filters: ${JSON.stringify(filters)}

Generate ONE short helpful follow-up question to clarify or refine their search.
Be conversational, specific, and add value. Examples:
- "Did you mean Sector 50 or Sector 57? Both have great 2BHK options in this range."
- "Are you open to 3BHK units slightly above ₹80L? There are some exceptional deals available."
Return ONLY the question. No preamble, no explanation.`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://360ghar.com",
        "X-Title": "360 Ghar Follow-up",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 80,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

// ─── LOCAL FALLBACK (if API key not set) ─────────────────────────
function localFallbackParse(query) {
  const q = query.toLowerCase();
  const bhk = (() => { const m = q.match(/(\d)\s*bhk/); return m ? +m[1] : null; })();
  const maxPrice = (() => {
    let m = q.match(/under\s*[₹]?\s*(\d+)\s*l/); if (m) return +m[1];
    m = q.match(/under\s*[₹]?\s*(\d+)\s*cr/); if (m) return +m[1] * 100;
    if (/budget|affordable/.test(q)) return 70;
    return null;
  })();
  const sectors = [...q.matchAll(/sector\s*(\d+)/g)].map(m => `Sector ${m[1]}`);
  const amenities = [];
  if (/sun|bright|light/.test(q)) amenities.push("Natural Light");
  if (/school|dps/.test(q)) amenities.push("School Nearby");
  if (/metro/.test(q)) amenities.push("Metro Access");
  if (/pool/.test(q)) amenities.push("Swimming Pool");
  if (/gym/.test(q)) amenities.push("Gym");
  return { bhk, maxPrice, minPrice: null, sectors, amenities, facing: null, keywords: [], summary: query };
}

function fallbackSummary(property, userQuery) {
  return `This ${property.bhk}BHK in ${property.sector} by ${property.builder} aligns well with your search for "${userQuery}". The ${property.facing}-facing unit on the ${property.floor} floor offers ${property.amenities.slice(0, 2).join(" and ").toLowerCase()}, with ${property.nearbySchools[0]} nearby. At ${property.priceUnit === "Crore" ? `₹${property.price} Crore` : `₹${property.price} Lakhs`}, possession is ${property.possession.toLowerCase()}.`;
}
