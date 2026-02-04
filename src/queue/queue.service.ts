import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HandlerService } from 'src/handler/handler.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
        private readonly quadcellCrypto: QuadcellCryptoService,
        private handler: HandlerService
  ) {}

    @Cron('* * * * *')
    async handleOrder() {
      const pendingOrders = await this.prisma.order.findMany({
        where: { status: false}
      })

      for (const order of pendingOrders) {    
        try {
          const sku = order.productSku;
          const [id, type] = sku.split('-');
          const simType = type === 'ESIM' ? 'e-sim' : 'p-sim';
    
          const plan = await this.prisma.product.findFirst({
            where: { sku: id },
          });
    
          const sim = await this.prisma.esim.findFirst({
            where: {
              isActive: true,
              type: simType,
              imsi: { startsWith: String(plan?.imsi) },
            },
            orderBy: { id: 'asc' },
          });
    
            const payload ={
              authKey: process.env.API_AUTH_KEY,
              imsi: sim?.imsi,
              iccid: sim?.iccid,
              msisdn: sim?.msisdn,
              planCode: plan?.planCode,
              validity: plan?.lifeCycle,
            }
    
          await this.handler.quadcellApiHandler(payload, "addsub");
    
          const payld = {
            authKey: process.env.API_AUTH_KEY,
            imsi: sim?.imsi,
            packCode: String(plan?.packCode)
          }
    
          const res = await this.handler.quadcellApiHandler(payld, "v2/addpack");
          if(res.retCode != "000000"){
            console.log("Could not create package due to: ", res.retMesg);
            return {"message": "Could not create package"}
          }
    
          await this.prisma.esim.update({
            where: { id: sim?.id },
            data: { isActive: true },
          });
    
          await this.prisma.subscriber.update({
            where: {
                customerId: order.customerId
            },
            data: {
                imsi: sim?.imsi,
                iccid: sim?.iccid,
                msisdn: sim?.msisdn,
                planCode: String(plan?.planCode),
                packCode: String(plan?.packCode)
            }
          })
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: true }
          })
    
        return {success: true};
    
        } catch (error) {
          await this.prisma.failure.create({
              data: { jsonPayload: error.message },
            });
          console.error('Retryable error:', error);
          throw error;
        }
      }
    }
}
