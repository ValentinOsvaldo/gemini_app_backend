import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeminiService } from 'src/gemini/gemini.service';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { User } from 'src/auth/entities/user.entity';
import { Message, MessageType } from './entities/message.entity';

// TODO: move this to interface file

interface GenerateMessageArgs {
  content: string;
  chat: Chat;
  type: MessageType;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly geminiService: GeminiService,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async generateGeminiResponse(prompt: string, user: User) {
    try {
      const response = await this.geminiService.getGemini(prompt);

      const title = await this._generateChatTitle(response.text);
      const chat = await this._generateChat(title, user);

      await this._saveMessage({
        chat,
        content: prompt,
        type: MessageType.USER,
      });

      await this._saveMessage({
        chat,
        content: response.text,
        type: MessageType.AI,
      });

      return {
        text: response.text,
        chat_id: chat.id,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async generateGeminiResponseByChat(id: string, prompt: string) {
    try {
      const response = await this.geminiService.getGemini(prompt);
      const chat = await this.chatRepository.findOne({
        where: { id },
      });

      if (!chat) throw new NotFoundException("This chat doesn't exists");

      await this._saveMessage({
        chat,
        content: prompt,
        type: MessageType.USER,
      });

      await this._saveMessage({
        chat,
        content: response.text,
        type: MessageType.AI,
      });

      return {
        text: response.text,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async getChats(user: User, limit: number = 10, offset: number = 0) {
    const chats = await this.chatRepository.find({
      where: { user },
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
    });

    return chats;
  }

  async getMessagesByChat(chatId: string) {
    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: {
        id: 'ASC',
      },
    });

    return messages;
  }

  private async _saveMessage(args: GenerateMessageArgs) {
    const { chat, content, type } = args;
    const message = this.messageRepository.create({
      content,
      chat,
      type,
    });

    return await this.messageRepository.save(message);
  }

  private async _generateChat(title: string, user: User) {
    try {
      const chat = this.chatRepository.create({
        title,
        user,
      });

      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error(error);
    }
  }

  private async _generateChatTitle(prompt: string) {
    const { text } = await this.geminiService.getGemini(
      `Genera un título corto (máximo 5 palabras) y directo para la siguiente pregunta: ${prompt}. Responde solo con el título, sin introducciones ni explicaciones.`,
    );

    return text;
  }
}
