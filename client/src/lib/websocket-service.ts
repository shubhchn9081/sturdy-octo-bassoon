// WebSocket connection service for live odds updates
class WebSocketService {
  private socket: WebSocket | null = null;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectTimeout: number = 2000; // ms
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnecting: boolean = false;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  public connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnected = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnected);
            resolve();
          }
        }, 100);
      });
    }

    this.isConnecting = true;
    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = this.handleMessage;

        this.socket.onclose = (event) => {
          console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
          this.socket = null;
          this.isConnecting = false;
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, this.reconnectTimeout);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(topic: string, callback: (data: any) => void): void {
    const subscribers = this.subscribers.get(topic) || [];
    subscribers.push(callback);
    this.subscribers.set(topic, subscribers);

    // Send subscription message to server if connected
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ action: 'subscribe', topic }));
    } else {
      // Connect if not already connected
      this.connect().then(() => {
        this.socket?.send(JSON.stringify({ action: 'subscribe', topic }));
      });
    }
  }

  public unsubscribe(topic: string, callback: (data: any) => void): void {
    const subscribers = this.subscribers.get(topic);
    if (subscribers) {
      const index = subscribers.indexOf(callback);
      if (index !== -1) {
        subscribers.splice(index, 1);
        if (subscribers.length === 0) {
          this.subscribers.delete(topic);
          // Send unsubscribe message to server if connected
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ action: 'unsubscribe', topic }));
          }
        }
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      if (data.topic && this.subscribers.has(data.topic)) {
        const subscribers = this.subscribers.get(data.topic);
        subscribers?.forEach(callback => callback(data.payload));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  public send(message: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Cannot send message.');
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();