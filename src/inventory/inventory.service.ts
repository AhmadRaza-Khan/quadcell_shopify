// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from '../prisma/prisma.service';
// @Injectable()
// export class InventoryService {
//     private readonly shopifyUrl: string;
//     private readonly accessToken: string;
//     private readonly apiUrl: string;
//     private readonly locationId: string;
//     constructor(private readonly config: ConfigService, private prisma: PrismaService){
//             this.shopifyUrl = this.config.get<string>("SHOPIFY_URL")!;
//             this.accessToken = this.config.get<string>("SHOPIFY_API_SECRET")!;
//             this.apiUrl = this.config.get<string>("API_URL")!
//             this.locationId = this.config.get<string>("LOCATION_ID")!
//     }

//     async stockUpdateInDB(){
//         try {
//             const response = await fetch(this.apiUrl, {
//                 method: 'GET',
//                 headers: { 'Content-Type': 'application/json' },
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             const data = await response.json();
//             const updateStock = await Promise.all(
//             data.products.map(async (prod: any) => {
//             return this.prisma.product.update({
//                 where:{
//                     sku: prod.sku
//                 },
//                 data: {
//                     stock: prod.stock,
//                     stockStatus: "pending",
//                     },
//                 });
//             })
//             );
//             console.log(updateStock);
//         } catch (error) {
//             console.log(error); 
//         }
//     }

//     async updateInventory(res){
//         let successCount = 0;
//         let errorCount = 0;
//         try {
//             const products = await this.prisma.product.findMany({
//                 where: { stockStatus: 'pending' },
//                 take: 25,
//             });

//             if (products.length === 0) {
//                 return res.json({
//                     success: false,
//                     message: 'No products to update'
//                 });
//             }

//             for (const product of products) {
//                 const {sku, inventoryItemId, stock } = product;
              
//                     if (stock !== null && stock !== undefined) {
//                       try {
//                         const payload = {
//                           location_id: this.locationId,
//                           inventory_item_id: inventoryItemId,
//                           available: stock
//                         };
              
//                         const response = await fetch(`${this.shopifyUrl}/inventory_levels/set.json`, {
//                           method: "POST",
//                           headers: {
//                             'Content-Type': 'application/json',
//                             'X-Shopify-Access-Token': this.accessToken
//                           },
//                           body: JSON.stringify(payload)
//                         });
//                         const jsonResponse = await response.json()
//                         console.log(jsonResponse);

//                         if (jsonResponse.inventory_level) {
//                           await this.prisma.product.update({
//                             where: {
//                                 sku: sku
//                             },
//                             data: { stockStatus: 'synced' } 
//                         });
              
//                         successCount++;
//                         console.log(`${successCount} products stock updated`)
//                         } else {
//                           await this.prisma.product.update({ 
//                             where: {
//                                 sku: sku 
//                             },
//                              data: { 
//                                 stockStatus: 'API Error'
//                             }
//                           });
//                         }   
//                     } catch (error) {
//                         await this.prisma.product.update({
//                           where :{ sku },
//                           data: { stockStatus: 'API Error' } 
//                         });
//                         errorCount++;
//                         console.log(`${errorCount} products failed to update stock` )
//                     }
//                         }
//                     }
//         } catch (error) {
//             console.log(error)
//             console.log(`${errorCount} products failed to update stock` )
//         }
//      }

//     async getAllStock(res) {
//         const stock = await this.prisma.product.findMany({})
//         return res.json(stock);
//     }
//     async getStockGoing(res) {
//         const data = await this.prisma.product.findMany({
//             where: {
//                 stock: {
//                     lt: 20,
//                 },
//             }
//         })
//         return res.json(data);
//     }
//     async getStockOut(res) {
//         const data = await this.prisma.product.findMany({
//             where: {
//                 stock: 0,
//             }
//         })
//         return res.json(data);
//     }
// }
