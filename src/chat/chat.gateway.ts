import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthSocket } from '../auth/auth-ws.middleware';
import { User } from 'src/auth/entities/user.entity';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly jwtAuthSocket: JwtAuthSocket) {}

  async handleConnection(client: Socket) {
    try {
      const user: User = await this.jwtAuthSocket.validateSocketClient(client);

      (client as any).user = user;
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello world!';
  }
}
