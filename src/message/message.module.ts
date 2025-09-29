import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { UserModule } from 'src/user/user.module';
import { WskModule } from 'src/wsk/wsk.module';

@Module({
  imports: [UserModule, WskModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
