import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { GeminiDto } from './dto/gemini.dto';
import { User } from 'src/auth/entities/user.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Auth()
  @Post('new-chat')
  getGeminiResponse(@Body() geminiDto: GeminiDto, @GetUser() user: User) {
    return this.chatService.generateGeminiResponse(geminiDto.prompt, user);
  }

  @Auth()
  @Get()
  getChats(@GetUser() user: User) {
    return this.chatService.getChats(user);
  }

  @Auth()
  @Get('messages/:chatId')
  getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessagesByChat(chatId);
  }

  @Auth()
  @Post(':id')
  getGeminiResponseByChat(
    @Param('id') id: string,
    @Body() geminiDto: GeminiDto,
  ) {
    return this.chatService.generateGeminiResponseByChat(id, geminiDto.prompt);
  }
}
