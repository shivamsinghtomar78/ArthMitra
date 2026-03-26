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
  temperature = 0.2,
}: {
  systemPrompt: string
  payload: unknown
  temperature?: number
}): Promise<T> {
  const client = getGroqClient()
  const completion = await client.chat.completions.create({
    model: groqModel,
    temperature,
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

/**
 * Calls Groq with exponential backoff retry.
 * Slightly raises temperature on each attempt to get different results.
 */
export async function callGroqJSONWithRetry<T>({
  systemPrompt,
  payload,
  maxRetries = 2,
}: {
  systemPrompt: string
  payload: unknown
  maxRetries?: number
}): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callGroqJSON<T>({
        systemPrompt,
        payload,
        temperature: 0.2 + attempt * 0.1,
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        )
      }
    }
  }
  throw lastError
}

/**
 * Calls Groq with streaming response for real-time output.
 */
export async function callGroqStream({
  systemPrompt,
  payload,
  temperature = 0.2,
}: {
  systemPrompt: string
  payload: unknown
  temperature?: number
}) {
  const client = getGroqClient()
  const completion = await client.chat.completions.create({
    model: groqModel,
    temperature,
    max_tokens: 1500,
    stream: true,
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

  return completion
}


