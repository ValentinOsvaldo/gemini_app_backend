import { IsNotEmpty } from 'class-validator';

export class GeminiDto {
  @IsNotEmpty()
  prompt: string;
}
