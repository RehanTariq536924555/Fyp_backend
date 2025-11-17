import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_SECURE === 'true', // Convert to boolean
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
    
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Email Verification',
          text: `Please verify your email by clicking the following link: ${verificationLink}`,
          html: `<p>Please verify your email by clicking the following link:</p>
                 <a href="${verificationLink}">Verify Email</a>`,
        };
    
        try {
          const info = await this.transporter.sendMail(mailOptions);
          console.log('Email sent:', info.messageId);
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }
      
      //method for sending password reset email

      async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Reset your password',
          text: `Hello ${name},\n\nPlease reset your password by clicking the following link: ${resetUrl}`,
          html: `<p>Hello ${name},</p>
                 <p>Please reset your password by clicking the following link:</p>
                 <a href="${resetUrl}">Reset Password</a>`,
        };
    
        try {
          const info = await this.transporter.sendMail(mailOptions);
          console.log('Password reset email sent:', info.messageId);
        } catch (error) {
          console.error('Error sending password reset email:', error);
        }
      }
}
