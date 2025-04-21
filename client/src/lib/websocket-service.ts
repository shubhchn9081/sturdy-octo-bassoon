// WebSocket service for real-time data
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private connected = false;

  // Connect to the WebSocket server
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        this.connected = true;
        resolve();
        return;
      }

      // Create WebSocket with the correct protocol and path
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Resubscribe to all topics
        this.resubscribe();
        
        resolve();
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        this.connected = false;
        
        // Try to reconnect if not a normal closure
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connected = false;
        reject(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Process message based on topic
          if (data.topic) {
            const callbacks = this.subscriptions.get(data.topic);
            if (callbacks) {
              callbacks.forEach(callback => callback(data.payload));
            }
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };
    });
  }

  // Attempt to reconnect after connection is lost
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnect();
      });
    }, 1000); // Wait 1 second before attempting to reconnect
  }

  // Subscribe to a topic
  public subscribe(topic: string, callback: (data: any) => void): void {
    // Add to local subscriptions map
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)?.add(callback);
    
    // Send subscription message to server if connected
    if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'subscribe',
        topic
      }));
    }
  }

  // Unsubscribe from a topic
  public unsubscribe(topic: string, callback?: (data: any) => void): void {
    if (!this.subscriptions.has(topic)) {
      return;
    }
    
    if (callback) {
      // Remove specific callback
      this.subscriptions.get(topic)?.delete(callback);
      
      // If no callbacks left, remove the topic
      if (this.subscriptions.get(topic)?.size === 0) {
        this.subscriptions.delete(topic);
        
        // Send unsubscribe message to server
        if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({
            action: 'unsubscribe',
            topic
          }));
        }
      }
    } else {
      // Remove all callbacks for this topic
      this.subscriptions.delete(topic);
      
      // Send unsubscribe message to server
      if (this.connected && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          action: 'unsubscribe',
          topic
        }));
      }
    }
  }

  // Resubscribe to all topics (used after reconnect)
  private resubscribe(): void {
    if (!this.connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    this.subscriptions.forEach((_, topic) => {
      this.socket?.send(JSON.stringify({
        action: 'subscribe',
        topic
      }));
    });
  }

  // Disconnect from the WebSocket server
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Check if connected
  public isConnected(): boolean {
    return this.connected && !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();