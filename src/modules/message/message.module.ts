import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UserModule } from '../user/user.module';
import { WskModule } from '../../wsk/wsk.module';
import { Message } from './message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, WskModule, ChannelModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
