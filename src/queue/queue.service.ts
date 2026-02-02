import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ORDER_QUEUE } from './queue.constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(ORDER_QUEUE)
    private readonly queue: Queue,
  ) {}

  async addOrderJob(orderPayload: any): Promise<void> {
    await this.queue.add(
      'process-order',
      orderPayload,
      {
        jobId: `order-${orderPayload.id}`,

        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }
}
