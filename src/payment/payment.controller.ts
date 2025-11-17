
import { Controller, Get, Post, Patch, Delete, Body, Param, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    try {
      // Ensure buyerId is set from authenticated user
      console.log('PaymentController: Authenticated user:', req.user);
      createPaymentDto.buyerId = req.user.userId;
      console.log('PaymentController: Setting buyerId to:', createPaymentDto.buyerId);
      return await this.paymentService.create(createPaymentDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create order');
    }
  }

  @Post('confirm/:orderId')
  async confirmPayment(@Param('orderId') orderId: string) {
    try {
      return await this.paymentService.confirmPayment(orderId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to confirm order');
    }
  }

  @Patch(':orderId/status')
  async updateStatus(@Param('orderId') orderId: string, @Body() body: { status: 'Completed' | 'Cancelled' }) {
    try {
      return await this.paymentService.updateStatus(orderId, body.status);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to update order status');
    }
  }

  @Get(':orderId')
  async findOne(@Param('orderId') orderId: string) {
    try {
      return await this.paymentService.findOne(orderId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Order not found');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    try {
      const buyerId = req.user.userId; // Extract user ID from JWT token (matches JWT strategy)
      console.log('PaymentController: Fetching orders for buyerId:', buyerId);
      console.log('PaymentController: Authenticated user object:', req.user);
      return await this.paymentService.findAll(buyerId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch orders');
    }
  }

  @Get('admin/all')
  async findAllForAdmin() {
    try {
      console.log('PaymentController: Fetching all orders for admin');
      return await this.paymentService.findAll(); // No buyerId parameter = get all orders
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to fetch orders');
    }
  }

  @Delete(':orderId')
  async deleteOrder(@Param('orderId') orderId: string) {
    try {
      console.log('PaymentController: Deleting order:', orderId);
      await this.paymentService.deleteOrder(orderId);
      return { message: 'Order deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to delete order');
    }
  }
}
