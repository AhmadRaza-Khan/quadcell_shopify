import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  private readonly shop: string;
  private readonly token: string;

  private get headers() {
    return {
      'X-Shopify-Access-Token': this.token,
      'Content-Type': 'application/json',
    };
  }

  constructor(private readonly config: ConfigService, private prisma: PrismaService){
          this.shop = this.config.get<string>("SHOPIFY_URL")!;
          this.token = this.config.get<string>("SHOPIFY_ACCESS_TOKEN")!;
  }

  async orderWebhook(data: any) {
    console.log("Order Webhook Data:", data);
      await this.prisma.webhook.create({
        data: {
          payload: JSON.stringify(data),
        }
      })

      return {message: "Webhook received", status: 200, success: true};
  }
  
  async getAllOrders() {
    const url = `${this.shop}/admin/api/2023-10/orders.json?status=any`;
    const resData = await fetch(url, { headers: this.headers });
    if (!resData.ok) {
      throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
    }

    const jsonData = await resData.json();

    const data: {
      name: string;
      email: string;
      phone: string;
      price: string;
      address: string;
      status: string;
      items: string[];
    }[] = [];

    for (const d of jsonData.orders) {
        const order = {
          name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
          email: d.customer?.email ?? "",
          phone: d.customer?.phone ?? "",
          price: d.current_subtotal_price,
          address: d.shipping_address
            ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
            : "",
          status: d.financial_status,
          items: d.line_items.map((item: any) => " " + item.name),
        };

        data.push(order);
      }

      return data;
  }

  async getTodayOrders() {
    const today = new Date().toISOString().split('T')[0];

    const url = `${this.shop}/admin/api/2023-10/orders.json?status=any&created_at_min=${today}T00:00:00-00:00&created_at_max=${today}T23:59:59-00:00`;

    const resData = await fetch(url, { headers: this.headers });

    if (!resData.ok) {
      throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
    }

    const jsonData = await resData.json();

    const data: {
      name: string;
      email: string;
      phone: string;
      price: string;
      address: string;
      status: string;
      items: string[];
    }[] = [];

    for (const d of jsonData.orders) {
      const order = {
        name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
        email: d.customer?.email ?? "",
        phone: d.customer?.phone ?? "",
        price: d.current_subtotal_price,
        address: d.shipping_address
          ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
          : "",
        status: d.financial_status,
        items: d.line_items.map((item: any) => " " + item.name),
      };
      data.push(order);
    }

    return data;
  }
}
