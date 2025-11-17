import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { JwtGuard } from '../Auther/guards/jwt.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only JPG and PNG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
  @Req() req,
  @Body() body: any,
  @UploadedFiles() files: Express.Multer.File[],
) {
  try {
    // Handle admin authentication first
    const authHeader = req.headers.authorization;
    let userId = null;
    let isAdmin = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Check if it's an admin token (base64 encoded JSON)
        const decoded = JSON.parse(atob(token));
        if (decoded.role === 'admin' && decoded.id) {
          userId = decoded.id;
          isAdmin = true;
        }
      } catch (e) {
        // Not an admin token, check regular user auth
        if (req.user && (req.user.id || req.user.userId)) {
          userId = req.user.id || req.user.userId;
        }
      }
    } else if (req.user && (req.user.id || req.user.userId)) {
      userId = req.user.id || req.user.userId;
    }

    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const createListingDto: CreateListingDto = {
      title: body.title,
      type: body.type,
      breed: body.breed,
      age: body.age ? parseFloat(body.age) : undefined,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      price: body.price ? parseFloat(body.price) : undefined,
      location: body.location,
      description: body.description,
    };

    const imagePaths = files.map((file) => `/uploads/${file.filename}`);

    const listing = await this.listingsService.create(createListingDto, imagePaths, userId);

    return listing;
  } catch (error) {
    throw error; // or handle error/log here
  }
}

  @Get()
  async findAll() {
    return this.listingsService.findAll();
  }

  @Get(':id')
  async getListing(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only JPG and PNG files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const updateListingDto: UpdateListingDto = {
      title: body.title,
      type: body.type,
      breed: body.breed,
      age: body.age ? parseFloat(body.age) : undefined,
      weight: body.weight ? parseFloat(body.weight) : undefined,
      price: body.price ? parseFloat(body.price) : undefined,
      location: body.location,
      description: body.description,
    };

    const imagePaths = files.length > 0 ? files.map((file) => `/uploads/${file.filename}`) : undefined;
    return this.listingsService.update(id, updateListingDto, imagePaths);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.listingsService.remove(id);
  }
}
