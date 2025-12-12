import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WskModule } from './wsk/wsk.module';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelModule } from './modules/channel/channel.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MessageModule } from './modules/message/message.module';
import { DateTransformInterceptor } from './interceptors/date-transform.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    WskModule, 
    AuthModule, 
    UserModule, 
    MessageModule, 
    ChannelModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DateTransformInterceptor,
    },
  ],
})
export class AppModule {}
