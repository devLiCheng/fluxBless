import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { LoggerModule } from './logger/logger.module';
import { UploadModule } from './upload/upload.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LoginLogsModule } from './login-logs/login-logs.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { SettingsModule } from './settings/settings.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentModule,
    LoggerModule,
    UploadModule,
    ReviewsModule,
    LoginLogsModule,
    InquiriesModule,
    SettingsModule,
    BlogPostsModule,
    CouponsModule,
  ],
})
export class AppModule {}
