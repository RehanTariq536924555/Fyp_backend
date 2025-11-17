import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'buyer' })
export class Buyer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @BeforeInsert()
  async hashPassword() {
    console.log('BuyerEntity: Normalizing and hashing for email:', this.email);
    this.email = this.email.toLowerCase();
    this.password = await bcrypt.hash(this.password, 10);
    console.log('BuyerEntity: Email normalized and password hashed');
  }
}