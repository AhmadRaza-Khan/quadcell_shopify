import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from 'src/handler/handler.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriberService {
    private readonly apiKey: string;
    constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private handler: HandlerService
  ) {
    this.apiKey = this.config.get<string>("API_AUTH_KEY")!;
  }


  async registerAccountWebhook(payload: any) {
    const resp = await this.prisma.subscriber.create({
      data: {
        customerId: String(payload.id),
      },
    });
    console.log(resp)
    return {message: "Webhook recieved", status: 200, success: true};
  }
  
  async getAllSubscribersFromDB(): Promise<any>{
    return await this.prisma.subscriber.findMany({});
  }

  async subscriberWithId(id: any, customerEmail): Promise<any>{
    // const subFromDb = await this.prisma.subscriber.findFirst({
    //   where: {customerId: String(id)}
    // })
    // const order = await this.prisma.order.findFirst({
    //   where: {customerId: subFromDb?.customerId}
    // })
    // const fullSku = order?.productSku;
    // const sku  = fullSku?.split("-")[0];

    // const product = await this.prisma.product.findFirst({
    //   where: { sku: sku }
    // })

    // if (!product) {
    //   throw new Error("Product not found");
    // }

    // if(!subFromDb?.imsi){
    //   return {"success": true, "status": 200, "message": "You are not subscribed!"}
    // }
    // if (subFromDb?.email == null){
    //       await this.prisma.subscriber.update({
    //       where: {customerId: id},
    //       data:{email: customerEmail}
    // })
    // }
    // const imsi = subFromDb?.imsi;
    // const payload = {"authKey": this.apiKey,"imsi":imsi};
    // const sub = await this.handler.quadcellApiHandler(payload, "qrysub");
    // const payload1 = {"authKey": this.apiKey, "imsi": imsi};
    // const usage = await this.handler.quadcellApiHandler(payload1, "qrypackquota");

    // const customer = {
    //   "id": id,
    //   "coverage": product?.coverage,
    //   "name": product?.name,
    //   "description": product?.description,
    //   "email": subFromDb?.email,
    //   "imsi": imsi,
    //   "iccid": subFromDb?.iccid,
    //   "planCode": subFromDb?.planCode,
    //   "packCode": subFromDb?.packCode,
    //   "msisdn": subFromDb?.msisdn,
    //   "expiryTime": sub.expTime,
    //   "lifeCycle": sub.lifeCycle,
    //   "validity": sub.validity,
    //   "effTime": usage.packQuotaList[0].effTime,
    //   "total": usage?.packQuotaList[0].totalQuota,
    //   "consumedQuota": usage.packQuotaList[0].consumedQuota,
    //   "remainingQuota": usage.packQuotaList[0].remainingQuota,
    //   "planEffTime": usage.packQuotaList[0].effTime,
    //   "planExpTime": usage.packQuotaList[0].expTime,
    //   "qr": `https://api.m-mobile.net/uploads/QR/${sub.iccid}.png`,
    // }

    return {
  "id": "8741188829274",
  "coverage": "Austria",
  "name": "Austria - Daily Unlimited",
  "description": "Unlimited Data (1 Day), Full Speeds (Best Rate)",
  "email": "devkraft1@gmail.com",
  "imsi": "454070059289775",
  "iccid": "8985207220057816325",
  "planCode": "820025",
  "packCode": "822144",
  "msisdn": "852193011425267",
  "expiryTime": "20501231235959",
  "lifeCycle": "0",
  "validity": "1",
  "effTime": "20260204215001",
  "total": "UNLIMITED",
  "consumedQuota": "0.00",
  "remainingQuota": "UNLIMITED",
  "planEffTime": "20260204215001",
  "planExpTime": "20530620235959",
  "qr": "https://api.m-mobile.net/uploads/QR/8985207220057816325.png"
};

  }

  async getSubscriber(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    const response = await this.handler.quadcellApiHandler(payload, "qrysub");
    return response;
  }

  async deleteSubscriber(id: any): Promise<any> {
    // const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    // const response = await this.handler.quadcellApiHandler(payload, "delsub");
    // return response;
    console.log(id)
    return {"succes": true}
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
  async deletePackage(id:any): Promise<any> {
    // const payload = {"authKey":"M!m9icN#","imsi":"454070059289775", "packCode": "822144" };
    // const response = await this.handler.quadcellApiHandler(payload, "delpack");
    // return response;
    console.log(id);
    return {"succes": true}
  }
}
