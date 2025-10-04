import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { Channel } from './channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsUsers, Channel])],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
