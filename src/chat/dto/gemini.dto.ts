import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GeminiDto {
  @ApiProperty()
  @IsNotEmpty()
  prompt: string;
}
