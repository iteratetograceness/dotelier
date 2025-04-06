import { authorizeRequest } from '@/lib/auth/request'
import { ERROR_CODES } from '@/lib/error'
import { Client } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [{ id }, authorized] = await Promise.all([params, authorizeRequest()])

  if (!authorized.success) {
    return NextResponse.json(
      { error: ERROR_CODES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  if (!id || Array.isArray(id)) {
    return NextResponse.json({ error: 'Invalid pixel ID' }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let isControllerClosed = false

      const sendEvent = (data: unknown) => {
        if (!isControllerClosed) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            )
          } catch {
            isControllerClosed = true
          }
        }
      }

      try {
        const pgClient = new Client({
          connectionString: process.env.DATABASE_URL_UNPOOLED,
        })
        await pgClient.connect()
        await pgClient.query(`LISTEN "post_processing_${id}"`)

        const heartbeatInterval = setInterval(async () => {
          try {
            if (!isControllerClosed) {
              await pgClient.query('SELECT 1')
              sendEvent({ type: 'heartbeat', timestamp: Date.now() })
            }
          } catch (error) {
            isControllerClosed = true
            await cleanUp({ pgClient, heartbeatInterval, id })
            controller.error(error)
          }
        }, 30000)

        pgClient.on('notification', (notification) => {
          if (isControllerClosed) return

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
              isControllerClosed = true
              void cleanUp({ pgClient, heartbeatInterval, id })
              controller.close()
            }
          } catch (error) {
            sendEvent({
              type: 'error',
              message: 'Error parsing notification payload',
              error: String(error),
            })
            isControllerClosed = true
            controller.close()
          }
        })

        req.signal.addEventListener('abort', async () => {
          isControllerClosed = true
          try {
            await cleanUp({ pgClient, heartbeatInterval, id })
            try {
              controller.close()
            } catch {
              // Controller might already be closed
            }
          } catch (error) {
            console.error('Error cleaning up connection:', error)
          }
        })

        sendEvent({
          type: 'connected',
          message: `Listening for updates on post_processing_${id}`,
        })
      } catch (error) {
        console.error('Error setting up notification listener:', error)
        sendEvent({
          type: 'error',
          message: 'Failed to setup notification listener',
          error: String(error),
        })
        isControllerClosed = true
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
