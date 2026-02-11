import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';

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

  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private readonly queueService: QueueService,
  ){
          this.shop = this.config.get<string>("SHOPIFY_URL")!;
          this.token = this.config.get<string>("SHOPIFY_ACCESS_TOKEN")!;
  }

  async orderWebhook(payload: any) {
    await this.prisma.failure.create({
      data: { jsonPayload: payload}
    })
      // await this.prisma.order.upsert({
      //     where:{orderId: String(payload.id)},
      //     create: {
      //       orderId: String(payload.id),
      //       customerId: String(payload.customer.id),
      //       productSku: payload.line_items[0].sku,
      //     },
      //     update: {}
      //   });
      return {message: "Webhook received", status: 200, success: true};
  }

async listWebhooks() {
  const url = `${this.shop}/admin/api/2023-10/webhooks.json`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': this.token,
      'Content-Type': 'application/json',
    },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error('Error fetching Shopify webhooks:', text);
    throw new HttpException(
      data || text || 'Failed to fetch Shopify webhooks',
      response.status,
    );
  }

  // returns array of webhooks
  return data.webhooks;
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

  async testData(): Promise<any>{
    const toEmail = "devkraft1@gmail.com";
    const subject = 'Your Plan is Active';
    const bodyHtml = `<p>Your plan has been activated successfully.</p>
                      <p><strong>Thank you for choosing us.</strong></p>`;
    const payload = {
      api_key: process.env.SMTP2GO_API_KEY,
      sender: process.env.SMTP_FROM,
      from_name: process.env.SMTP_FROM_NAME,
      to: toEmail,
      subject,
      html_body: bodyHtml,
      text_body: this.stripHtml(bodyHtml),
    };

    try {
      const response = await fetch('https://api.smtp2go.com/v3/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        response.ok &&
        result?.data?.succeeded &&
        result.data.succeeded > 0
      ) {
        return true;
      }

      console.error('SMTP2GO Email error:', result);
      return false;
    } catch (error) {
      console.error('SMTP2GO Request failed:', error);
      throw new InternalServerErrorException('Email sending failed');
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

}
