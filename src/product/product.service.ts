// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from '../prisma/prisma.service';
// import { UpdateProductDto } from './dto';
// import { productSchema } from '../schemas';

// @Injectable()
// export class ProductService {
//     private readonly shopifyUrl: string;
//     private readonly accessToken: string;
//     private readonly apiUrl: string;
//     constructor(private readonly config: ConfigService, private prisma: PrismaService){
//         this.shopifyUrl = this.config.get<string>("SHOPIFY_URL")!;
//         this.accessToken = this.config.get<string>("SHOPIFY_API_SECRET")!;
//         this.apiUrl = this.config.get<string>("API_URL")!
//     }

// async saveProducts() {
//     try {
//       const response = await fetch(this.apiUrl, {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       const savedProducts = await Promise.all(
//         data.products.map(async (prod: any) => {
//           return this.prisma.product.create({
//             data: {
//               sku: prod.sku,
//               title: prod.title,
//               description: prod.description,
//               price: prod.price,
//               stock: prod.stock,
//               images: prod.images,
//             },
//           });
//         })
//       );

//       return savedProducts;
//     } catch (error: any) {
//       throw new Error(`Failed to fetch products: ${error.message}`);
//     }
//   }


// async syncProductsToShopify() {
//   try {
//     const selectFields: any = {};
//     for (const [key, value] of Object.entries(productSchema)) {
//       if (value === true) {
//         selectFields[key] = true;
//       }
//     }

//     if (productSchema.variants) {
//       selectFields['groupId'] = true;
//     }

//     const products = await this.prisma.product.findMany({
//       where: { syncStatus: 'pending' },
//       take: 5,
//       select: selectFields,
//     });

//     let groupedProducts: Record<string, any[]> = {};

//     if (productSchema.variants) {
//         groupedProducts = products.reduce((groups, product) => {
//         const groupId = product.groupId;
//         if (!groups[groupId]) groups[groupId] = [];
//         groups[groupId].push(product);
//         return groups;
//       }, {} as Record<string, any[]>);
//     } else {
//       products.forEach((product, idx) => {
//         groupedProducts[`product_${idx}`] = [product];
//       });
//     }

//     for (const [groupId, groupItems] of Object.entries(groupedProducts)) {
//       const mainProduct = groupItems[0];

//       const imageObjects = mainProduct.images?.map((url: string) => ({ src: url })) || [];

//       let variants: any[] = [];
//       if (productSchema.variants) {
//           variants = groupItems.map(item => ({
//           price: item.price,
//           sku: item.sku,
//           inventory_management: 'shopify',
//           inventory_quantity: Number(item.stock) || 0,
//           option1: item.title || 'Default Title',
//         }));
//       } else {
//         variants = [
//           {
//             price: mainProduct.price,
//             sku: mainProduct.sku,
//             inventory_management: 'shopify',
//             inventory_quantity: Number(mainProduct.stock) || 0,
//             option1: 'Default Title',
//           },
//         ];
//       }

//       const productPayload: any = {};

//       if (productSchema.title) {
//         productPayload.title = mainProduct.title;
//       }
//       if (productSchema.description) {
//         productPayload.body_html = `<strong>Description: </strong><p>${mainProduct.description}</p>`;
//       }
//       if (productSchema.status) {
//         productPayload.status = 'active';
//       }
//       productPayload.variants = variants;
//       if (productSchema.images) {
//         productPayload.images = imageObjects;
//       }
//       if (productSchema.barcode) {
//         variants = variants.map(v => ({ ...v, barcode: mainProduct.barcode }));
//       }
//       if (productSchema.handle) {
//         productPayload.handle = mainProduct.handle;
//       }
//       if (productSchema.shortDescription) {
//         productPayload.body_html = `<p><strong>Short Description: </strong><p>${mainProduct.shortDescription}</p>`;
//       }
//       if (productSchema.category) {
//         productPayload.product_type = mainProduct.category;
//       }
//       if (productSchema.subCategory) {
//         productPayload.tags = [...(productPayload.tags || []), mainProduct.subCategory];
//       }
//       if (productSchema.tags) {
//         productPayload.tags = [...(productPayload.tags || []), ...(mainProduct.tags || [])];
//       }
//       if (productSchema.vendor) {
//         productPayload.vendor = mainProduct.vendor;
//       }
//       if (productSchema.compareAtPrice) {
//         variants = variants.map(v => ({ ...v, compare_at_price: mainProduct.compareAtPrice }));
//       }
//       if (productSchema.costPerItem) {
//         variants = variants.map(v => ({ ...v, cost: mainProduct.costPerItem }));
//       }
//       if (productSchema.currency) {
//         productPayload.currency = mainProduct.currency || 'USD';
//       }
//       if (productSchema.inventoryPolicy) {
//         variants = variants.map(v => ({ ...v, inventory_policy: mainProduct.inventoryPolicy }));
//       }
//       if (productSchema.fulfillmentService) {
//         variants = variants.map(v => ({ ...v, fulfillment_service: mainProduct.fulfillmentService }));
//       }
//       if (productSchema.stockStatus) {
//         productPayload.status = mainProduct.stockStatus;
//       }
//       if (productSchema.videos) {
//         productPayload.media = (mainProduct.videos || []).map(url => ({ media_type: 'video', src: url }));
//       }
//       if (productSchema.thumbnail) {
//         productPayload.images = [{ src: mainProduct.thumbnail }, ...(productPayload.images || [])];
//       }
//       if (productSchema.weight) {
//         variants = variants.map(v => ({ ...v, weight: mainProduct.weight }));
//       }
//       if (productSchema.weightUnit) {
//         variants = variants.map(v => ({ ...v, weight_unit: mainProduct.weightUnit }));
//       }
//       if (productSchema.height) {
//         productPayload.height = mainProduct.height;
//       }
//       if (productSchema.width) {
//         productPayload.width = mainProduct.width;
//       }
//       if (productSchema.length) {
//         productPayload.length = mainProduct.length;
//       }
//       if (productSchema.requiresShipping) {
//         variants = variants.map(v => ({ ...v, requires_shipping: mainProduct.requiresShipping }));
//       }
//       if (productSchema.seoTitle) {
//         productPayload.metafields_global_title_tag = mainProduct.seoTitle;
//       }
//       if (productSchema.seoDescription) {
//         productPayload.metafields_global_description_tag = mainProduct.seoDescription;
//       }
//       if (productSchema.publishedAt) {
//         productPayload.published_at = mainProduct.publishedAt;
//       }
//       if (productSchema.source) {
//         productPayload.source = mainProduct.source;
//       }
//       if (productSchema.externalUrl) {
//         productPayload.external_url = mainProduct.externalUrl;
//       }
//       if (productSchema.additionalData) {
//         productPayload.additional_data = mainProduct.additionalData;
//       }
//       if (productSchema.isbn) {
//          productPayload.body_html = `<p><strong>ISBN:</strong> ${mainProduct.isbn}</p>`;
//       }
//       if (productSchema.publisher) {
//          productPayload.body_html = `<p><strong>Publisher:</strong> ${mainProduct.publisher}</p>`;
//       }
//       if (productSchema.publishingDate) {
//          productPayload.body_html = `<p><strong>Publishing Date:</strong> ${mainProduct.publishingDate}</p>`;
//       }
//       if (productSchema.language) {
//          productPayload.body_html = `<p><strong>Language:</strong> ${mainProduct.language}</p>`;
//       }

//       if (productSchema.translation) {
//          productPayload.body_html = `<p><strong>Translation:</strong> ${mainProduct.translation}</p>`;
//       }
//       if (productSchema.translator) {
//         productPayload.body_html = `<p><strong>Translator:</strong> ${mainProduct.translator}</p>`;
//       }

//       const productData = { product: productPayload };

//       try {
//         const response = await fetch(`${this.shopifyUrl}/products.json`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Shopify-Access-Token': this.accessToken,
//           },
//           body: JSON.stringify(productData),
//         });

//         const response_data = await response.json();
//         console.log(response_data)

//         if (response_data.product) {
//           const data = response_data.product.variants;

//           for (const variantData of data) {
//             await this.prisma.product.update({
//               where: { sku: variantData.sku },
//               data: {
//                 syncStatus: 'synced',
//                 inventoryItemId: variantData.inventory_item_id.toString(),
//                 productId: response_data.product.id.toString(),
//                 variantId: variantData.id.toString(),
//               },
//             });
//           }
//         }
//       } catch (error) {
//         console.error(`Error syncing product group ${groupId}:`, error.message);
//       }
//     }

//     return { message: 'products synced successfully' };
//   } catch (error) {
//     console.error('Error fetching products:', error.message);
//     throw new Error('Failed to fetch products');
//   }
// }


// async getSyncedProducts(res){
//       const products = await this.prisma.product.findMany({
//         where: {
//           syncStatus: "synced"
//         }
//       });
//       return res.json({"success": true, "products": products})
// }

// async getUnSyncedProducts(res){
//       const products = await this.prisma.product.findMany({
//         where: {
//           syncStatus: "pending"
//         }
//       });
//       return res.json({"success": true, "products": products})
// }

// async updateProduct(dto: UpdateProductDto) {
//   const response = await this.prisma.product.update({
//     where: {
//       sku: dto.sku,
//     },
//     data: {
//       title: dto.title,
//       description: dto.description,
//       price: dto.price,
//       stock: dto.stock,
//     },
//   });

//   return response;
// }

// }
