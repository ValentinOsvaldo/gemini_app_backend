import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GeminiModule } from 'src/gemini/gemini.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [
    AuthModule,
    GeminiModule,
    TypeOrmModule.forFeature([Chat, Message]),
  ],
  exports: [TypeOrmModule],
})
export class ChatModule {}
