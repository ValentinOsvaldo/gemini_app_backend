import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from './chat.entity';

export enum MessageType {
  USER = 'user',
  AI = 'ai',
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
  })
  type: MessageType;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
