import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from 'src/handler/handler.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

@Injectable()
export class SubscriberService {
    constructor(
    private readonly quadcellCrypto: QuadcellCryptoService,
    private config: ConfigService,
    private prisma: PrismaService,
    private handler: HandlerService
  ) {}


  async registerAccountWebhook(payload: any) {
    await this.prisma.failure.create({
      data: {jsonPayload: payload}
    });
    // await this.prisma.subscriber.create({
    //   data: {
    //     customerId: String(payload.id),
    //   },
    // });
    return {message: "Webhook recieved", status: 200, success: true};
  }
  
  async getAllSubscribersFromDB(): Promise<any>{
    return await this.prisma.subscriber.findMany({});
  }

  async getSubscriber(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    const response = await this.handler.quadcellApiHandler(payload, "qrysub");
    return response;
  }

  async deleteSubscriber(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    const response = await this.handler.quadcellApiHandler(payload, "delsub");
    return response;
  }

  async queryPackageList(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    const response = await this.handler.quadcellApiHandler(payload, "qrypacklist");
    return response;
  }
  async queryUsage(): Promise<any> {
    const subscriber = await this.prisma.subscriber.findFirst({});
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = subscriber?.updatedAt.toISOString().slice(0, 10).replace(/-/g, '');
    const payload = {"authKey": "M!m9icN#", "imsi": "454070059289775", "beginDate": startDate, "endDate": today};
    return this.handler.quadcellApiHandler(payload, "qryusage")
  }
}
