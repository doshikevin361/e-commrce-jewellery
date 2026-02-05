import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

// Store active SSE connections
const connections = new Set<ReadableStreamDefaultController>();

// Broadcast function to send updates to all connected clients
export function broadcastMetalPriceUpdate(metalType: string, newRate: number, updatedCount: number) {
  const message = JSON.stringify({
    type: 'metal_price_updated',
    data: {
      metalType,
      newRate,
      updatedCount,
      timestamp: new Date().toISOString(),
    },
  });

  connections.forEach((controller) => {
    try {
      controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
    } catch (error) {
      console.error('[SSE] Error sending message:', error);
      connections.delete(controller);
    }
  });
}

// SSE endpoint for real-time updates
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Add connection to set
        connections.add(controller);

        // Send initial connection message
        const welcomeMessage = JSON.stringify({
          type: 'connected',
          data: { message: 'Connected to metal price updates' },
        });
        controller.enqueue(new TextEncoder().encode(`data: ${welcomeMessage}\n\n`));

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          connections.delete(controller);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for nginx
      },
    });
  } catch (error) {
    console.error('[SSE] Error setting up SSE:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
