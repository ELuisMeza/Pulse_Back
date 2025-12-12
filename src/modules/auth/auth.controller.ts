import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignIn, SignUp } from './dto/singin.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('signin')
  async login(@Body() body: SignIn) {
    const user = await this.authService.validateUser(body.email, body.password);
    const token = await this.authService.login(user);

    return {access_token: token, user};
  }
  
  @Post('signup')
  async signup(@Body() body: SignUp) {
    const user = await this.userService.createUser(body.email, body.password, body.name);
    const token = await this.authService.login(user);
    return {access_token: token, user};
  } 
}
