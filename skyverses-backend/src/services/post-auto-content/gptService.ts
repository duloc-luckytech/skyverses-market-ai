import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function generateCaption(topic: string) {
  const prompt = `
Bạn là chuyên gia marketing. Viết 1 caption ngắn (40–80 chữ), thân thiện, có CTA.
Chủ đề: ${topic}
Tool quảng cáo: https://toolabc.com
`;

  const res = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
}
