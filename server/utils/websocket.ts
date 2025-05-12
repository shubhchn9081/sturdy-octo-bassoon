import { WebSocketServer, WebSocket } from 'ws';

// Type declaration for global scope
declare global {
  var webSocketBroadcast: (topic: string, payload: any) => void;
  var gameWebSocketServer: WebSocketServer | null;
}

// Initialize global variables if not already set
global.webSocketBroadcast = global.webSocketBroadcast || (() => {});
global.gameWebSocketServer = global.gameWebSocketServer || null;

/**
 * Set the WebSocket server and create the broadcast function
 * @param wss WebSocketServer instance
 */
export function setWebSocketServer(wss: WebSocketServer): void {
  // Store WebSocket server instance
  global.gameWebSocketServer = wss;
  
  // Keep track of clients and their subscriptions
  const clients = new Map<WebSocket, { topics: Set<string> }>();
  
  // Create broadcast function
  global.webSocketBroadcast = (topic: string, payload: any) => {
    if (!clients.size) return;
    
    clients.forEach((clientData, client) => {
      if (client.readyState === WebSocket.OPEN && clientData.topics.has(topic)) {
        client.send(JSON.stringify({
          topic,
          timestamp: Date.now(),
          payload
        }));
      }
    });
  };
  
  // Setup connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Initialize client data
    clients.set(ws, { topics: new Set() });
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        if (data.action === 'subscribe' && data.topic) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.topics.add(data.topic);
            console.log(`Client subscribed to topic: ${data.topic}`);
          }
        } else if (data.action === 'unsubscribe' && data.topic) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.topics.delete(data.topic);
            console.log(`Client unsubscribed from topic: ${data.topic}`);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      message: 'Successfully connected to the WebSocket server'
    }));
  });
}

/**
 * Broadcast a message to all clients subscribed to a topic
 * @param topic Topic name
 * @param payload Data to send
 */
export function broadcastToTopic(topic: string, payload: any): void {
  global.webSocketBroadcast(topic, payload);
}