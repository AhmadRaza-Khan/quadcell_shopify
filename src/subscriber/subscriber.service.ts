import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from 'src/handler/handler.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuadcellCryptoService } from 'src/qc-crypto/qc-crypto.service';

@Injectable()
export class SubscriberService {
    private readonly apiKey: string;
    constructor(
    private readonly quadcellCrypto: QuadcellCryptoService,
    private config: ConfigService,
    private prisma: PrismaService,
    private handler: HandlerService
  ) {
    this.apiKey = this.config.get<string>("API_AUTH_KEY")!;
  }


  async registerAccountWebhook(payload: any) {
    await this.prisma.subscriber.create({
      data: {
        customerId: String(payload.id),
      },
    });
    return {message: "Webhook recieved", status: 200, success: true};
  }
  
  async getAllSubscribersFromDB(): Promise<any>{
    return await this.prisma.subscriber.findMany({});
  }

  async subscriberWithId(id: any): Promise<any>{
    const subFromDb = await this.prisma.subscriber.findFirst({
      where: {customerId: String(id)}
    })
    const imsi = subFromDb?.imsi;
    const payload = {"authKey": this.apiKey,"imsi":imsi};
    const sub = await this.handler.quadcellApiHandler(payload, "qrysub");

    const packList = await this.handler.quadcellApiHandler(payload, "qrypacklist");
    
    const subscriber = await this.prisma.subscriber.findFirst({});
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = subscriber?.updatedAt.toISOString().slice(0, 10).replace(/-/g, '');
    const payload1 = {"authKey": this.apiKey, "imsi": imsi, "beginDate": startDate, "endDate": today};
    const usage = await this.handler.quadcellApiHandler(payload1, "qryusage")

    const customer = {
      "id": id,
      "imsi": imsi,
      "iccid": subFromDb?.iccid,
      "planCode": subFromDb?.planCode,
      "expiryTime": sub.expTime,
      "lifeCycle": sub.lifeCycle,
      "validity": sub.validity,
      "packages": packList.packList,
      "totalUsage": usage?.usageTotal,
      "usageList": usage?.usageList,
      "qr": `/uploads/products/${sub.iccid}.png`, 
    }
    return customer;

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
  async deletePackage(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775", "packCode": "822144" };
    const response = await this.handler.quadcellApiHandler(payload, "delpack");
    return response;
  }
}
