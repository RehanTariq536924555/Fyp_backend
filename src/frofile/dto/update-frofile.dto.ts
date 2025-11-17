import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-frofile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}