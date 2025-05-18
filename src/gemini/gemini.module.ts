import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [],
  providers: [GeminiService],
  imports: [ConfigModule, AuthModule],
  exports: [GeminiService],
})
export class GeminiModule {}
