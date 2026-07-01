import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey && secretKey !== 'sk_test_placeholder') {
      this.stripe = new Stripe(secretKey);
    }
  }

  async createCheckoutSession(orderId: number, successUrl: string, cancelUrl: string) {
    const order = await this.ordersService.findOne(orderId);

    if (!this.stripe) {
      // Return mock session for development
      const mockSessionId = `mock_session_${orderId}_${Date.now()}`;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentId: mockSessionId },
      });
      return {
        id: mockSessionId,
        url: `${successUrl}?session_id=${mockSessionId}`,
        mock: true,
      };
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.nameEn,
          description: item.product.nameZh,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    let discounts: any = undefined;
    if (this.stripe && order.couponDiscount && Number(order.couponDiscount) > 0) {
      try {
        const stripeCoupon = await this.stripe.coupons.create({
          amount_off: Math.round(Number(order.couponDiscount) * 100),
          currency: 'usd',
          duration: 'once',
        });
        discounts = [{ coupon: stripeCoupon.id }];
      } catch (err) {
        this.logger.error(`Failed to create Stripe coupon: ${err.message}`);
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      discounts,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId.toString(),
      },
    });

    // Save payment session ID to order
    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentId: session.id },
    });

    return { id: session.id, url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !webhookSecret || webhookSecret === 'whsec_placeholder') {
      this.logger.warn('Stripe webhook skipped - not configured');
      return { received: true };
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = parseInt(session.metadata?.orderId || '0');

      if (orderId) {
        await this.ordersService.updateStatus(orderId, { status: 'paid' });
        this.logger.log(`Order ${orderId} marked as paid`);
      }
    }

    return { received: true };
  }
}
