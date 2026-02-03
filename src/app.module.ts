import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { ProductModule } from './product/product.module';
import { HomeModule } from './home/home.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriberModule } from './subscriber/subscriber.module';
import { QuadcellCryptoModule } from './qc-crypto/qc-crypto.module';
import { SimModule } from './sim/sim.module';
import { OrderModule } from './order/order.module';
import { QueueModule } from './queue/queue.module';
import { HandlerModule } from './handler/handler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, 
    PrismaModule,
    UserModule,
    ProductModule,
    HomeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    SubscriberModule,
    QuadcellCryptoModule,
    SimModule,
    OrderModule,
    QueueModule,
    HandlerModule
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class AppModule {}
