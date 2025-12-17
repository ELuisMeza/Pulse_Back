import { Body, ClassSerializerInterceptor, Controller, Get, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDtoCreate } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('all')
  async getAllUsers(
    @Body() body: { page: number, limit: number, search?: string }
  ) {
    return this.userService.getAllUsers(Number(body.page), Number(body.limit), body.search)
  }

}
