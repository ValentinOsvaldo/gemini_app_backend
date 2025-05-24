import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthSocket } from '../auth/auth-ws.middleware';
import { User } from 'src/auth/entities/user.entity';
import { ChatService } from './chat.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { MessageType } from './entities/message.entity';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly geminiService: GeminiService,
    private readonly jwtAuthSocket: JwtAuthSocket,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user: User = await this.jwtAuthSocket.validateSocketClient(client);

      (client as any).user = user;
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { message } = payload;

    const chat = await this.chatService.getOrCreateChat(
      (client as any).user.id,
    );
    
    await this.chatService.addMessage(chat, message, MessageType.USER);

    const stream = await this.geminiService.getGeminiStream(message);

    let fullResponse = '';

    for await (const { text } of stream) {
      fullResponse += text;
      client.emit('response-token', text);
    }

    await this.chatService.addMessage(chat, fullResponse, MessageType.AI);
  }
}
