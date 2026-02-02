import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ORDER_QUEUE } from './queue.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

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
          host: process.env.REDIS_HOST || 'localhost',
          port: +(process.env.REDIS_PORT || 6379),
        },
        concurrency: 3,
        lockDuration: 120_000,
      },
    );
  }

  private async handleOrder(orderPayload: any) {
    const exists = await this.prisma.order.findUnique({
      where: { orderId: String(orderPayload.id) },
    });

    if (exists) {
      console.log('Order already processed:', orderPayload.id);
      return;
    }

    try {
      const sku = orderPayload.line_items[0].sku;
      const [id, type] = sku.split('-');
      const simType = type === 'ESIM' ? 'e-sim' : 'p-sim';

      const plan = await this.prisma.product.findFirst({
        where: { sku: id },
      });

      if (!plan) {
        throw new NonRetryableError('Plan not found');
      }

      const sim = await this.prisma.esim.findFirst({
        where: {
          isActive: false,
          type: simType,
          imsi: { startsWith: String(plan.imsi) },
        },
        orderBy: { id: 'asc' },
      });

      if (!sim) {
        throw new NonRetryableError('SIM not available');
      }

      await this.prisma.order.create({
        data: {
          orderId: String(orderPayload.id),
          customerId: String(orderPayload.customer.id),
          productSku: sku,
        },
      });

      const encrypted = this.quadcellCrypto.encrypt(
        {
          authKey: process.env.API_AUTH_KEY,
          imsi: sim.imsi,
          iccid: sim.iccid,
          msisdn: sim.msisdn,
          planCode: plan.planCode,
          validity: plan.lifeCycle,
        },
        0x01,
      );

      const response = await fetch(`${process.env.API_URL}/addsub`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: encrypted,
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const encryptedResponseHex = await response.json();

      await this.prisma.esim.update({
        where: { id: sim.id },
        data: { isActive: true },
      });

      await this.prisma.test.create({
        data: { payload: encryptedResponseHex },
      });

    return {success: true};

    } catch (error) {
      if (error instanceof NonRetryableError) {
        console.error('Non-retryable:', error.message);
        await this.prisma.test.create({
          data: { jsonPayload: error.message },
        });
        return;
      }

      console.error('Retryable error:', error);
      throw error;
    }
  }
}
