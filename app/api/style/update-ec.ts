import { getStyles } from '../pixelate/style-id'

if (!process.env.VERCEL_API_KEY) {
  throw new Error('VERCEL_API_KEY is not set')
}

const vercelApiKey = process.env.VERCEL_API_KEY

export async function updateEdgeConfig(styleId: string, files: File[]) {
  try {
    const styles = (await getStyles()) || []
    const description = files.map((file) => file.name).join(', ')
    styles.push({ id: styleId, description })

    const updateEdgeConfig = await fetch(
      'https://api.vercel.com/v1/edge-config/ecfg_mm9i1eoy46kpvnw2xud0edwbcvow/items',
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${vercelApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'update',
              key: 'styles',
              value: styles,
            },
          ],
        }),
      }
    )
    const result = await updateEdgeConfig.json()
    console.log(result)
  } catch (error) {
    console.log(error)
  }
}
