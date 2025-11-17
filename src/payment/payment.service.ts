
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from '../order/order.entity';
import { Buyer } from '../users/entities/buyer.entity';
import { Seller } from '../seller/entities/seller.entity';
import { Listing } from '../listings/entities/listing.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Buyer)
    private buyerRepository: Repository<Buyer>,
    @InjectRepository(Seller)
    private sellerRepository: Repository<Seller>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    console.log('PaymentService: Creating order with data:', createPaymentDto);
    const { amount, currency, paymentMethod, orderId, items, paymentDetails, seller, buyerId } = createPaymentDto;

    const companyTaxRate = 0.02;
    const subtotal = amount / (1 + companyTaxRate);
    const companyTax = amount - subtotal;

    let stripePaymentIntentId: string | undefined;

    if (paymentMethod === 'stripe') {
      try {
        const paymentIntent = await this.stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Stripe expects amount in cents
          currency: currency.toLowerCase(),
          payment_method_types: ['card'],
          metadata: { orderId },
        });
        stripePaymentIntentId = paymentIntent.id;
      } catch (error) {
        throw new Error(`Stripe payment intent creation failed: ${error.message}`);
      }
    }

    const order = this.orderRepository.create({
      orderId,
      items,
      subtotal,
      tax: companyTax,
      total: amount,
      paymentMethod,
      paymentDetails: paymentMethod === 'stripe' ? { stripePaymentIntentId } : paymentDetails || null,
      
      buyerId: buyerId || null,
      seller: seller || null,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });

    try {
      console.log('PaymentService: Saving order to database:', order);
      const savedOrder = await this.orderRepository.save(order);
      console.log('PaymentService: Order saved successfully:', savedOrder);
      return {
        orderId,
        status: 'Pending',
        stripeClientSecret: paymentMethod === 'stripe' ? stripePaymentIntentId : undefined,
        message: `Order created successfully for ${paymentMethod} payment`,
      };
    } catch (error) {
      console.error('PaymentService: Failed to save order:', error);
      throw new Error(`Failed to save order to database: ${error.message}`);
    }
  }

  async confirmPayment(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.paymentMethod === 'stripe' && order.paymentDetails?.stripePaymentIntentId) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(order.paymentDetails.stripePaymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Stripe payment not completed');
      }
    }

    order.status = order.paymentMethod === 'cash' ? 'Pending' : 'Completed';
    try {
      await this.orderRepository.save(order);
      return {
        orderId: order.orderId,
        status: order.status,
        message: order.paymentMethod === 'cash' 
          ? 'Order awaiting delivery confirmation' 
          : `Order completed with ${order.paymentMethod} payment`,
      };
    } catch (error) {
      throw new Error('Failed to confirm order');
    }
  }

  async updateStatus(orderId: string, status: 'Completed' | 'Cancelled') {
    const order = await this.orderRepository.findOne({ where: { orderId } });
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status !== 'Pending') {
      throw new Error('Only pending orders can be updated');
    }

    if (status === 'Cancelled' && order.paymentMethod === 'stripe' && order.paymentDetails?.stripePaymentIntentId) {
      try {
        await this.stripe.paymentIntents.cancel(order.paymentDetails.stripePaymentIntentId);
      } catch (error) {
        throw new Error(`Failed to cancel Stripe payment: ${error.message}`);
      }
    }

    order.status = status;
    try {
      await this.orderRepository.save(order);
      return {
        orderId: order.orderId,
        status: order.status,
        message: `Order ${status} successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to update order status to ${status}`);
    }
  }

  async findOne(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { orderId } });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async findAll(buyerId?: number) {
    try {
      console.log('PaymentService: Finding orders for buyerId:', buyerId);
      const whereCondition = buyerId ? { buyerId } : {};
      console.log('PaymentService: Using where condition:', whereCondition);
      
      const orders = await this.orderRepository.find({ where: whereCondition });
      console.log('PaymentService: Filtered orders found:', orders.map(o => ({ id: o.id, orderId: o.orderId, buyerId: o.buyerId })));
      
      // Fetch buyer and seller names for each order
      const ordersWithNames = await Promise.all(
        orders.map(async (order) => {
          let buyerName = null;
          let sellerName = null;
          
          // Fetch buyer name if buyerId exists
          if (order.buyerId) {
            try {
              const buyer = await this.buyerRepository.findOne({ where: { id: order.buyerId } });
              buyerName = buyer ? buyer.name : null;
            } catch (error) {
              console.error(`Error fetching buyer with ID ${order.buyerId}:`, error);
            }
          }
          
          // Fetch seller name
          try {
            if (order.seller) {
              // Try by name
              let seller = await this.sellerRepository.findOne({ where: { name: order.seller } });
              // Try by id if string is numeric
              if (!seller && !isNaN(Number(order.seller))) {
                seller = await this.sellerRepository.findOne({ where: { id: parseInt(order.seller) } });
              }
              sellerName = seller ? seller.name : order.seller;
            }
            // If still not resolved, try to infer seller from listing items
            if (!sellerName && order.items && order.items.length > 0) {
              const firstItemId = Number(order.items[0].id);
              if (!isNaN(firstItemId)) {
                const listing = await this.listingRepository.findOne({ where: { id: firstItemId } });
                if (listing && listing.seller) {
                  sellerName = listing.seller.name;
                }
              }
            }
          } catch (error) {
            console.error('Error resolving seller name:', error);
          }
          
          return {
            id: order.id,
            orderId: order.orderId,
            items: order.items,
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentDetails: order.paymentDetails,
            status: order.status,
            buyer: buyerName,
            seller: sellerName,
            buyerId: order.buyerId || null,
            date: order.date || null,
          };
        })
      );
      
      return ordersWithNames;
    } catch (error) {
      console.error('PaymentService: Failed to fetch orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async deleteOrder(orderId: string) {
    try {
      console.log('PaymentService: Deleting order with orderId:', orderId);
      const order = await this.orderRepository.findOne({ where: { orderId } });
      if (!order) {
        throw new Error('Order not found');
      }
      
      await this.orderRepository.remove(order);
      console.log('PaymentService: Order deleted successfully:', orderId);
      return { message: 'Order deleted successfully' };
    } catch (error) {
      console.error('PaymentService: Failed to delete order:', error);
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }
}
