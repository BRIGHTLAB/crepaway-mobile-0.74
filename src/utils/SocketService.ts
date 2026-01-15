import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() { }

  // Singleton instance getter
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize socket connection
  connect(SOCKET_SERVER_URL: string, headers: Record<string, string>): void {
    console.log('[SocketService] connect() called');
    console.log('[SocketService] URL:', SOCKET_SERVER_URL);
    console.log('[SocketService] Headers:', JSON.stringify(headers, null, 2));
    console.log('[SocketService] Existing socket?', !!this.socket);
    console.log('[SocketService] Socket connected?', this.socket?.connected);

    if (!this.socket) {
      console.log('[SocketService] Creating new socket connection...');
      this.socket = io(SOCKET_SERVER_URL, {
        extraHeaders: headers,
      });
      
      console.log('[SocketService] Socket instance created, registering event listeners...');
      
      this.socket.on('connect', () => {
        console.log('[SocketService] ✅ Connected to socket server');
        console.log('[SocketService] Socket ID:', this.socket?.id);
        console.log('[SocketService] Socket connected status:', this.socket?.connected);
      });
      
      this.socket.on('connect_error', err => {
        console.log('[SocketService] ❌ Connection error:', err.message);
        console.log('[SocketService] Error details:', JSON.stringify(err, null, 2));
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] ⚠️ Disconnected from socket server');
        console.log('[SocketService] Disconnect reason:', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[SocketService] 🔄 Reconnected after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('[SocketService] 🔄 Reconnect attempt #', attemptNumber);
      });

      this.socket.on('reconnect_error', (error) => {
        console.log('[SocketService] ❌ Reconnect error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.log('[SocketService] ❌ Reconnect failed');
      });

      console.log('[SocketService] ✅ Event listeners registered');
    } else {
      console.log('[SocketService] ⚠️ Socket already exists, reusing existing connection');
      console.log('[SocketService] Socket connected status:', this.socket.connected);
      console.log('[SocketService] Socket ID:', this.socket.id);
    }
  }

  // Disconnect the socket
  disconnect(): void {
    console.log('[SocketService] disconnect() called');
    console.log('[SocketService] Socket exists?', !!this.socket);
    if (this.socket) {
      console.log('[SocketService] Socket connected before disconnect?', this.socket.connected);
      console.log('[SocketService] Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      console.log('[SocketService] ✅ Socket disconnected and cleared');
    } else {
      console.log('[SocketService] ⚠️ No socket to disconnect');
    }
  }

  // Emit messages to the server
  emit(event: string, data: any, callback?: (...args: any[]) => void): void {
    console.log('[SocketService] emit() called');
    console.log('[SocketService] Event:', event);
    console.log('[SocketService] Data:', JSON.stringify(data, null, 2));
    console.log('[SocketService] Socket exists?', !!this.socket);
    console.log('[SocketService] Socket connected?', this.socket?.connected);
    
    if (this.socket) {
      if (!this.socket.connected) {
        console.log('[SocketService] ⚠️ WARNING: Socket is not connected!');
      }
      this.socket.emit(event, data, callback);
      console.log('[SocketService] ✅ Emit completed');
    } else {
      console.log('[SocketService] ❌ ERROR: Cannot emit - socket is null');
    }
  }

  // Listen for messages from the server
  on(event: string, callback: (data: any) => void): void {
    console.log('[SocketService] on() called - registering listener');
    console.log('[SocketService] Event name:', event);
    console.log('[SocketService] Socket exists?', !!this.socket);
    console.log('[SocketService] Socket connected?', this.socket?.connected);
    
    if (this.socket) {
      // Wrap callback to add logging
      const wrappedCallback = (data: any) => {
        console.log('[SocketService] 🎯 Event received:', event);
        console.log('[SocketService] 📨 Event data:', JSON.stringify(data, null, 2));
        console.log('[SocketService] 📨 Event data type:', typeof data);
        callback(data);
      };
      
      this.socket.on(event, wrappedCallback);
      console.log('[SocketService] ✅ Listener registered for event:', event);
    } else {
      console.log('[SocketService] ❌ ERROR: Cannot register listener - socket is null');
    }
  }

  // Listen for messages from the server
  off(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    const connected = !!this.socket && this.socket.connected;
    console.log('[SocketService] isConnected() called:', connected);
    return connected;
  }

  // Get socket instance (for debugging)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default SocketService;
