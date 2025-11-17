import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SellerService } from './seller.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  findAll() {
    return this.sellerService.findAll();
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<string> {
    await this.sellerService.deleteUserById(id);
    return 'Successfully Deleted.';
  }

  // Profile endpoints
  @Post(':id/profile')
  @UseGuards(AuthGuard('seller-jwt'))
  createProfile(@Param('id', ParseIntPipe) id: number, @Body() profileData: any) {
    return this.sellerService.createProfile(id, profileData);
  }

  @Get(':id/profile')
  getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.getProfile(id);
  }

  @Patch(':id/profile')
  updateProfile(@Param('id', ParseIntPipe) id: number, @Body() profileData: any) {
    return this.sellerService.updateProfile(id, profileData);
  }

  @Delete(':id/profile')
  deleteProfile(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.deleteProfile(id);
  }
}
