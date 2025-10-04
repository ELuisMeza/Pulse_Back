import { Channel } from "../channel.entity";

export class CreateChannel {
  
}

export interface ChannelDetails extends Channel {
  totalMembers: number
}