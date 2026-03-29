import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelsUsers } from '../entity/channels_users.entity';
import { Channel } from './channel.entity';
import { UserModule } from '../user/user.module';
import { WskModule } from '../../wsk/wsk.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelsUsers, Channel]), forwardRef(() => UserModule), forwardRef(() => WskModule)],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
