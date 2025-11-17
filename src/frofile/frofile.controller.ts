import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './frofile.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const imageFileName = (req, file, callback) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname);
  callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
};

@UseGuards(AuthGuard('jwt'))
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: imageFileName,
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createProfile(@Req() req, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const sellerId = req.user.id;
    const payload: any = { ...body };
    if (file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      payload.image = `${baseUrl}/uploads/profiles/${file.filename}`;
    }
    return this.profileService.createProfile(sellerId, payload);
  }

  @Get()
  async getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: imageFileName,
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
async updateProfile(@Req() req, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
  const sellerId = req.user.id;
  const payload: any = { ...body };
  if (file) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    payload.image = `${baseUrl}/uploads/profiles/${file.filename}`;
  }
  return this.profileService.updateProfile(sellerId, payload);
}

  @Delete()
  async deleteProfile(@Req() req) {
    return this.profileService.deleteProfile(req.user.id);
  }
}
