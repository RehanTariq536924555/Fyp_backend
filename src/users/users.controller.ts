import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Buyer } from './entities/buyer.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<Buyer[]> {
    console.log('UsersController: Fetching all users');
    return this.usersService.findAll();
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<string> {
    console.log('UsersController: Deleting user with ID:', id);
    await this.usersService.deleteUserById(id);
    return 'Successfully Deleted.';
  }

  // Add other endpoints if needed (e.g., createUser, findById)
}