// import { Injectable } from '@nestjs/common';
// import { Request } from 'express';
// import * as crypto from 'crypto';
// import { join } from 'path';
// import * as fs from 'fs';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class OrderService {
//   private readonly shop: string;
//   private readonly token: string;

//   private get headers() {
//     return {
//       'X-Shopify-Access-Token': this.token,
//       'Content-Type': 'application/json',
//     };
//   }

//       constructor(private readonly config: ConfigService){
//           this.shop = this.config.get<string>("SHOPIFY_URL")!;
//           this.token = this.config.get<string>("SHOPIFY_API_SECRET")!;
//       }

//   async handleOrderCreated(req: Request) {
//     const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
//     const secret = process.env.SHOPIFY_API_SECRET!;

//     const body = (req as any).rawBody;
//     const digest = crypto
//       .createHmac('sha256', secret)
//       .update(body, 'utf8')
//       .digest('base64');

//     if (digest !== hmacHeader) {
//       return { ok: false };
//     }

//     const data = JSON.parse(body.toString());
//     console.log('✅ Verified order webhook:', data);

//     // forward to third-party API here (using fetch)
//     // await fetch('https://third-party.com/api', { method: 'POST', body: JSON.stringify(data) });

//     return { ok: true, data };
//   }
//   getFailedOrders(res) {
//     const filePath = join(process.cwd(), 'public', 'dummyData', 'orders-failed.json');
//     const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//     return res.json(data);
//   }
  
//   async getAllOrders() {
//     const url = `${this.shop}/orders.json?status=any`;
//     const resData = await fetch(url, { headers: this.headers });
//     if (!resData.ok) {
//       throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
//     }
    
//     const jsonData = await resData.json();

//     const data: {
//       name: string;
//       email: string;
//       phone: string;
//       price: string;
//       address: string;
//       status: string;
//       items: string[];
//     }[] = [];

//     for (const d of jsonData.orders) {
//         const order = {
//           name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
//           email: d.customer?.email ?? "",
//           phone: d.customer?.phone ?? "",
//           price: d.current_subtotal_price,
//           address: d.shipping_address
//             ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
//             : "",
//           status: d.financial_status,
//           items: d.line_items.map((item: any) => " " + item.name),
//         };

//         data.push(order);
//       }

//       return data;
//   }


//   async getTodayOrders() {
//     const today = new Date().toISOString().split('T')[0];

//     const url = `${this.shop}/orders.json?status=any&created_at_min=${today}T00:00:00-00:00&created_at_max=${today}T23:59:59-00:00`;

//     const resData = await fetch(url, { headers: this.headers });

//     if (!resData.ok) {
//       throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
//     }

//     const jsonData = await resData.json();

//     const data: {
//       name: string;
//       email: string;
//       phone: string;
//       price: string;
//       address: string;
//       status: string;
//       items: string[];
//     }[] = [];

//     for (const d of jsonData.orders) {
//       const order = {
//         name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
//         email: d.customer?.email ?? "",
//         phone: d.customer?.phone ?? "",
//         price: d.current_subtotal_price,
//         address: d.shipping_address
//           ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
//           : "",
//         status: d.financial_status,
//         items: d.line_items.map((item: any) => " " + item.name),
//       };
//       data.push(order);
//     }

//     return data;
//   }
// }
