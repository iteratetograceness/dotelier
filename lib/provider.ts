if (!process.env.API_KEY) {
  throw new Error('API_KEY is not set')
}

if (!process.env.API_GENERATE_URL) {
  throw new Error('API_GENERATE_URL is not set')
}

if (!process.env.API_STYLE_URL) {
  throw new Error('API_STYLE_URL is not set')
}

export const apiKey = process.env.API_KEY
export const apiUrlGenerate = process.env.API_GENERATE_URL
export const apiUrlStyle = process.env.API_STYLE_URL
