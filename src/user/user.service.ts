import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { User } from './dto/user.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {

    private readonly dbPath = path.resolve(__dirname, '../../db/users.json');

    constructor() {
      if (!fs.existsSync(this.dbPath)) {
        fs.writeFileSync(this.dbPath, JSON.stringify([], null, 2));
      }
    }

    private readUsers(): User[] {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    }

    private writeUsers(users: User[]): void {
      fs.writeFileSync(this.dbPath, JSON.stringify(users, null, 2));
    }

   async createUser(email: string, password: string, name: string): Promise<Omit<User, 'password'>> {
    const users = this.readUsers();

    if (users.find(u => u.email === email)) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: uuid(),
      email,
      password: hashedPassword,
      name
    };

    users.push(newUser);
    this.writeUsers(users);

    const { password: _, ...result } = newUser;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = this.readUsers();
    return users.find(u => u.email === email);
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = this.readUsers();
    return users.map(({ password, ...rest }) => rest);
  }

  async getById(id: string): Promise<Omit<User, 'password'>> {
    const users = this.readUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user
  }
}
