import {io, Socket} from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {}

  // Singleton instance getter
  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize socket connection
  connect(SOCKET_SERVER_URL: string, headers: Record<string, string>): void {
    if (!this.socket) {
      this.socket = io(SOCKET_SERVER_URL, {
        extraHeaders: headers,
      });
      this.socket.on('connect', () => {
        console.log('Connected to socket server');

        // join table
        //   this.socket?.emit('message', {
        //     type: 'waiterJoinTable',
        //     data: {
        //       tables: ['b1.table1'],
        //       waiter: {
        //         id: 'w2',
        //       },
        //     },
        //   });
        //   console.log('trying to join table');
        // });

        // this.socket.on('disconnect', () => {
        //   console.log('Disconnected from socket server');
        // });

        // this.socket.on('reconnect_attempt', () => {
        //   console.log('Attempting to reconnect...');
        // });
      });
      this.socket.on('connect_error', err => {
        console.log('Connection error:', err.message);
      });
    }
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      console.log('Socket connection disconnected');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit messages to the server
  emit(event: string, data: any, callback?: (...args: any[]) => void): void {
    console.log(`Emitting to ${event}`);
    if (this.socket) {
      this.socket.emit(event, data, callback);
    }
  }

  // Listen for messages from the server
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Listen for messages from the server
  off(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default SocketService;
