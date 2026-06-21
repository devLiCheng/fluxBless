import {
  Controller, Post, Body, Req, UseGuards, Headers,
  RawBodyRequest, ParseIntPipe, Param,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('checkout/:orderId')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: { successUrl: string; cancelUrl: string },
  ) {
    return this.paymentService.createCheckoutSession(
      orderId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody!, signature);
  }
}
