import { IsNotEmpty, IsString } from "class-validator";
import { Channel } from "../channel.entity";

export class CreateChannel {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export interface ChannelDetails extends Channel {
  totalMembers: number
}

export class AddUserToChannel {
  @IsString()
  @IsNotEmpty()
  channelId: string;
} 

export class LeaveUserToChannel extends AddUserToChannel {
  @IsString()
  @IsNotEmpty()
  userId: string;
} 