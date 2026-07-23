export default function handler(req, res) {
  res.status(200).json({
    aiConnected: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  });
}
