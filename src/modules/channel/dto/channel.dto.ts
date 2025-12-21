import { IsNotEmpty, IsString } from "class-validator";

export class CreateChannel {
  @IsString()
  @IsNotEmpty()
  name: string;
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

export interface ChannelDto {
  id:            string;
  name:          string;
  created_at:    Date;
  modified_at:   Date;
  user_creator:  string;
  state:         string;
  total_members: string;
  is_global: boolean;
}

export interface ChannelQueryFilters {
  isGlobal?: boolean;
  channelId?: string;
  excludeUserId?: string;
  creatorId?: string;
  search?: string;
  userId?: string; // Para filtros que parten de channels_users
  excludeCreatorId?: string; // Para excluir canales donde el usuario es el creador
}