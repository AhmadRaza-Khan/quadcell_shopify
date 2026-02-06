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

  async subscriberWithId(customerId: any, customerEmail: string): Promise<any>{
    await this.prisma.subscriber.upsert({
      where: { customerId },
      create: { customerId, email: customerEmail},
      update: {}
    })
    const subFromDb = await this.prisma.subscriber.findFirst({
      where: {customerId: String(customerId)}
    })
    if(!subFromDb?.packCode){
      return {"success": true, "status": 200, "message": "You don't have any active plan right now!", "id": customerId}
    }
    const order = await this.prisma.order.findFirst({
      where: { customerId: subFromDb?.customerId },
    });

    const sku = order?.productSku;

    if (!sku) {
      return { message: 'No sku found' };
    }

    const [id, type] = sku.split('-');

    if (!id || !type) {
      return { message: 'Invalid sku format' };
    }

    const simType = type === 'ESIM' ? 'e-sim' : 'p-sim';

    const product = await this.prisma.product.findFirst({
      where: { sku: id }
    })

    if (!product) {
      throw new Error("Product not found");
    }

    if(!subFromDb?.imsi){
      return {"success": true, "status": 200, "message": "You are not subscribed!"}
    }
    const imsi = subFromDb?.imsi;
    const payload = {"authKey": this.apiKey,"imsi":imsi};
    const sub = await this.handler.quadcellApiHandler(payload, "qrysub");
    const payload1 = {"authKey": this.apiKey, "imsi": imsi};
    const usage = await this.handler.quadcellApiHandler(payload1, "qrypackquota");

    const customer = {
      "id": customerId,
      "coverage": product?.coverage,
      "name": product?.name,
      "description": product?.description,
      "email": subFromDb?.email,
      "simType": simType,
      "imsi": imsi,
      "iccid": subFromDb?.iccid,
      "planCode": subFromDb?.planCode,
      "packCode": subFromDb?.packCode,
      "msisdn": subFromDb?.msisdn,
      "expiryTime": sub.expTime,
      "lifeCycle": sub.lifeCycle,
      "validity": sub.validity,
      "effTime": usage.packQuotaList[0].effTime,
      "total": usage?.packQuotaList[0].totalQuota,
      "consumedQuota": usage.packQuotaList[0].consumedQuota,
      "remainingQuota": usage.packQuotaList[0].remainingQuota,
      "planEffTime": usage.packQuotaList[0].effTime,
      "planExpTime": usage.packQuotaList[0].expTime,
      "qr": `https://api.m-mobile.net/uploads/QR/${sub.iccid}.png`,
    }
    return customer;

  }

  async getSubscriber(): Promise<any> {
    const payload = {"authKey":"M!m9icN#","imsi":"454070059289775"};
    const response = await this.handler.quadcellApiHandler(payload, "qrysub");
    return response;
  }

  async deleteSubscriber(id: any): Promise<any> {
    try {
      const subscriber = await this.prisma.subscriber.findFirst({
      where: {
        customerId: id
      }
    })
    const imsi = subscriber?.imsi
    if(!imsi){
      await this.prisma.subscriber.delete({where: { customerId: id}})
      return {"message": "Subscriber deleted", "success": true}
    }

    const payload = {"authKey": this.apiKey, "imsi":subscriber?.imsi};
    const response = await this.handler.quadcellApiHandler(payload, "delsub");
    if(response.retCode == "000000"){
      await this.prisma.subscriber.delete({ where: { customerId: id}})
      await this.prisma.esim.update({ where: { imsi },
        data: { isActive: false }
      })
      return {"success": true}
    } else {
      return {"success": false, "message": "Failed to delete subscriber!"}
    }
    } catch (error) {
      console.log(error.message)
      return {"success": false, "message": error.message}
    }
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
    try {
      const subscriber = await this.prisma.subscriber.findFirst({
      where: {
        customerId: id
      }
    })
    if(!subscriber?.imsi){
      return {"message": "Imsi not found"}
    }
    const payload = {"authKey": this.apiKey,"imsi": subscriber?.imsi, "packCode": subscriber?.packCode };
    const response = await this.handler.quadcellApiHandler(payload, "delpack");
    if(response.retCode == "000000"){
      await this.prisma.subscriber.update({
        where: { customerId: id },
        data: { packCode: null }
      })
      return {"success": true}
    } else {
      return {"success": false, "message": "Failed to delete plan!"}
    }
    } catch (error) {
      console.log(error.message)
      return {"success": false, "message": error.message}
    }
  }
}
