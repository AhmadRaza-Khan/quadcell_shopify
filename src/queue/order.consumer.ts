import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ORDER_QUEUE } from './queue.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';
import { HandlerService } from 'src/handler/handler.service';

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

@Injectable()
export class OrderConsumer implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quadcellCrypto: QuadcellCryptoService,
    private readonly handler: HandlerService
  ) {}

  onModuleInit() {
    new Worker(
      ORDER_QUEUE,
      async (job: Job) => {
        if (job.name === 'process-order') {
          await this.handleOrder(job.data);
        }
      },
      {
        connection: {
          host: '127.0.0.1',
          port: +(process.env.REDIS_PORT || 6379),
        },
        concurrency: 3,
        lockDuration: 120_000,
      },
    );
  }

  private async handleOrder(orderPayload: any) {
    if(!orderPayload.id){
      console.log("no order id found");
      return;
    }
    const order = await this.prisma.order.findUnique({
      where: { orderId: orderPayload.id }
    })
    if(order?.status){
      console.log("order already processed!");
      return {"message": "Order aleady processed", "status": true}
    }

    try {
      const sku = orderPayload.line_items[0].sku;
      const [id, type] = sku.split('-');
      const simType = type === 'ESIM' ? 'e-sim' : 'p-sim';

      const plan = await this.prisma.product.findFirst({
        where: { sku: id },
      });

      if (!plan) {
        await this.prisma.failure.create(
          {data:{
            customerId: orderPayload.customer.id,
            message: "Plan not found"
          }
        })
        console.log("Plan not found")
        return {"Message": "Failed to create"}
      }

      const sim = await this.prisma.esim.findFirst({
        where: {
          isActive: true,
          type: simType,
          imsi: { startsWith: String(plan?.imsi) },
        },
        orderBy: { id: 'asc' },
      });

      if (!sim) {
         await this.prisma.failure.create(
          {data:{
            customerId: orderPayload.customer.id,
            message: "Sim not found"
          }
        })
        return {"Message": "Failed to create"}
      }

      await this.prisma.order.upsert({
        where:{orderId: String(orderPayload.id)},
        create: {
          orderId: String(orderPayload.id),
          customerId: String(orderPayload.customer.id),
          productSku: sku,
        },
        update: {}
      });
 
        const payload ={
          authKey: process.env.API_AUTH_KEY,
          imsi: sim.imsi,
          iccid: sim.iccid,
          msisdn: sim.msisdn,
          planCode: plan.planCode,
          validity: plan.lifeCycle,
        }

      const response = await this.handler.quadcellApiHandler(payload, "addsub");

      if(response.retCode !== "000000"){
        throw new HttpException('Operation failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const payld = {
        authKey: process.env.API_AUTH_KEY,
        imsi: sim.imsi,
        packCode: String(plan.packCode)
      }

      const res = await this.handler.quadcellApiHandler(payld, "v2/addpack");
      if(res.retCode !== "000000"){
        throw new HttpException('Operation failed', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      await this.prisma.esim.update({
        where: { id: sim.id },
        data: { isActive: true },
      });

      await this.prisma.subscriber.update({
        where: {
            customerId: orderPayload.customer.id
        },
        data: {
            imsi: sim.imsi,
            iccid: sim.iccid,
            msisdn: sim.msisdn,
            planCode: String(plan.planCode),
        }
      })
      await this.prisma.order.update({
        where: { orderId: orderPayload.id },
        data: { status: true }
      })

    return {success: true};

    } catch (error) {
      if (error instanceof NonRetryableError) {
        console.error('Non-retryable:', error.message);
        await this.prisma.failure.create({
          data: { jsonPayload: error.message },
        });
        return;
      }
      await this.prisma.failure.create({
          data: { jsonPayload: error.message },
        });
      console.error('Retryable error:', error);
      throw error;
    }
  }
}
