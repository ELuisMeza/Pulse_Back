import { IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  channelId: string;
}

export interface MessageDto {
  id: string
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
}
