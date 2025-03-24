import { Client } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || Array.isArray(id)) {
    return NextResponse.json({ error: 'Invalid pixel ID' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      sendEvent({
        type: 'connected',
        message: `Listening for updates on post_processing_${id}`,
      })

      try {
        const pgClient = new Client({
          connectionString: process.env.DATABASE_URL_UNPOOLED,
        })
        await pgClient.connect()
        await pgClient.query(`LISTEN "post_processing_${id}"`)

        const heartbeatInterval = setInterval(async () => {
          try {
            await pgClient.query('SELECT 1')
            sendEvent({ type: 'heartbeat', timestamp: Date.now() })
          } catch (error) {
            await cleanUp({ pgClient, heartbeatInterval, id })
            controller.error(error)
          }
        }, 30000)

        pgClient.on('notification', (notification) => {
          try {
            const payload = JSON.parse(notification.payload || '{}')
            sendEvent({
              type: 'update',
              payload,
            })

            if (
              payload.status === 'completed' ||
              payload.status === 'background_removal_failed' ||
              payload.status === 'convert_to_svg_failed'
            ) {
              void cleanUp({ pgClient, heartbeatInterval, id }).then(() => {
                controller.close()
              })
            }
          } catch (error) {
            sendEvent({
              type: 'error',
              message: 'Error parsing notification payload',
              error: String(error),
            })
          }
        })

        req.signal.addEventListener('abort', async () => {
          try {
            await cleanUp({ pgClient, heartbeatInterval, id })
          } catch (error) {
            console.error('Error cleaning up connection:', error)
          } finally {
            controller.close()
          }
        })
      } catch (error) {
        console.error('Error setting up notification listener:', error)
        sendEvent({
          type: 'error',
          message: 'Failed to setup notification listener',
          error: String(error),
        })
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

async function cleanUp({
  pgClient,
  heartbeatInterval,
  id,
}: {
  pgClient: Client
  heartbeatInterval: NodeJS.Timeout
  id: string
}) {
  clearInterval(heartbeatInterval)
  return pgClient
    .query(`UNLISTEN "post_processing_${id}"`)
    .then(() => pgClient.end())
    .catch((error) => console.error('Error cleaning up connection:', error))
}
