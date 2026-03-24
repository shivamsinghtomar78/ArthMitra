import "server-only"
import Groq from "groq-sdk"

const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
const groqApiKey = process.env.GROQ_API_KEY

function getGroqClient() {
  if (!groqApiKey) {
    throw new Error("Missing GROQ_API_KEY.")
  }

  return new Groq({
    apiKey: groqApiKey,
  })
}

export async function callGroqJSON<T>({
  systemPrompt,
  payload,
}: {
  systemPrompt: string
  payload: unknown
}): Promise<T> {
  const client = getGroqClient()
  const completion = await client.chat.completions.create({
    model: groqModel,
    temperature: 0.2,
    max_tokens: 1500,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error("Groq returned an empty response.")
  }

  return JSON.parse(content) as T
}
