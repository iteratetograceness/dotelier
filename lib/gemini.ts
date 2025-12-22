'server-only'

import { GoogleGenAI } from '@google/genai'

export const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export const GEMINI_MODEL = 'gemini-3-pro-image-preview'
