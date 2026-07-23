function safePlay(raw = {}) {
  const positions = Array.isArray(raw.positions) ? raw.positions.slice(0,5).map((p,i)=>({
    n:Number(p.n)||i+1,
    x:Math.max(8,Math.min(92,Number(p.x)||50)),
    y:Math.max(8,Math.min(92,Number(p.y)||50))
  })) : [];
  const arrows = Array.isArray(raw.arrows) ? raw.arrows.slice(0,8).map(a=>({
    x1:Number(a.x1)||50,y1:Number(a.y1)||50,x2:Number(a.x2)||50,y2:Number(a.y2)||50,
    type:['pass','screen','cut','dribble'].includes(a.type)?a.type:'cut'
  })) : [];
  return {
    name:String(raw.name||'AI Generated Play').slice(0,80),
    situation:String(raw.situation||'Basketball').slice(0,80),
    steps:(Array.isArray(raw.steps)?raw.steps:[]).slice(0,8).map(String),
    notes:(Array.isArray(raw.notes)?raw.notes:[]).slice(0,6).map(String),
    counters:(Array.isArray(raw.counters)?raw.counters:[]).slice(0,4).map(String),
    positions, arrows, source:'ai'
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.OPENAI_API_KEY || '';
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  if (!apiKey) return res.status(503).json({ error: 'AI is not connected yet. Add OPENAI_API_KEY in Vercel.' });

  try {
    const input = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const system = 'You are WIN Coach Copilot, an expert basketball strategist. Create one practical, teachable five-player play. Return ONLY valid JSON with keys: name, situation, steps (array), notes (array), counters (array), positions (exactly 5 objects with n 1-5 and x/y percentages 8-92), arrows (objects x1,y1,x2,y2,type where type is pass, screen, cut, or dribble). Use concise coaching language. Do not claim guaranteed outcomes. Coordinates should produce a readable half-court diagram.';
    const user = `Coach request: ${input.prompt || 'Create a useful basketball play.'}\nSituation: ${input.situation || ''}\nDefense: ${input.defense || ''}\nPrimary goal: ${input.goal || ''}\nTeam strength: ${input.strength || ''}\nRequested name: ${input.name || 'automatic'}`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, instructions: system, input: user, temperature: 0.5, max_output_tokens: 1400 })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed' });
    const text = data.output_text || data.output?.flatMap(o=>o.content||[]).find(c=>c.type==='output_text')?.text || '';
    const cleaned = text.replace(/^```json\s*/i,'').replace(/```$/,'').trim();
    return res.status(200).json({ play: safePlay(JSON.parse(cleaned)) });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
}
