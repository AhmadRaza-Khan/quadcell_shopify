import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProductService {
  private readonly shopifyUrl: string;
  private readonly accessToken: string;
  constructor(private readonly config: ConfigService, private prisma: PrismaService){
    this.shopifyUrl = this.config.get<string>("SHOPIFY_URL")!;
    this.accessToken = this.config.get<string>("SHOPIFY_ACCESS_TOKEN")!;
  }

  async importFromExcel() {
  const filePath = join(process.cwd(), 'public', 'packages.xlsx');

  const fileBuffer = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const clean = (v: any) =>
  v === null || v === undefined || v === '-' || v === ''
    ? null
    : v;

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
  });

  const data = rows
    .filter((row: any) => Number.isFinite(row['__EMPTY_1']))
    .map((row: any) => {
      const v1 = clean(row['__EMPTY_1']);
      const v18 = clean(row['__EMPTY_18']);
      const v19 = clean(row['__EMPTY_19']);
      const v20 = clean(row['__EMPTY_20']);
      const v21 = clean(row['__EMPTY_21']);
      const fupCode = v21 ?? v20;
      const sku = String(v1).trim() + String(v18).trim() + String(v19).trim() + String(fupCode).trim();

      return {
        sku,
        imsi: row['__EMPTY_2'],
        msisdn: row['__EMPTY_3'],
        name: row['__EMPTY_4'],
        coverage: row['__EMPTY_5'],
        description: row['__EMPTY_6'],
        data: row['__EMPTY_7'],
        lifeCycle: row['__EMPTY_8'],
        validityMode: row['__EMPTY_9'],
        speedControlMode: row['__EMPTY_10'],
        initialSpeed: row['__EMPTY_11'],
        price: 0.00,
        speedControllTier1: row['__EMPTY_12'] ? row['__EMPTY_12'] : null,
        speedControllTier2: row['__EMPTY_13']? row['__EMPTY_13'] : null,
        planCode: row['__EMPTY_18'],
        packCode: row['__EMPTY_19'],
        fupCode,
      };
    });

  return this.prisma.product.createMany({
    data,
    skipDuplicates: true,
  });
}

  async resetSyncedProductsToPending() {
    const result = await this.prisma.product.updateMany({
      where: {
        syncStatus: 'synced',
      },
      data: {
        syncStatus: 'pending',
      },
    });

    return {
      message: 'Synced products reset to pending',
      updatedCount: result.count,
    };
  }


  async syncProductsToShopify() {
  try {
    const clean = (v: any) =>
      v === null || v === undefined || v === '-' || v === ''
        ? null
        : String(v);

    const SIM_TYPES = [
      { label: 'E-SIM', code: 'ESIM' },
      { label: 'Physical SIM', code: 'PSIM' },
    ];


    const products = await this.prisma.product.findMany({
      where: { syncStatus: 'pending' },
      orderBy: { coverage: 'asc' },
    });

    if (!products.length) {
      return { message: 'No pending products to sync' };
    }

    // Group by coverage
    const coverageGroups: Record<string, typeof products> = {};
    for (const product of products) {
      const key = product.coverage || 'Default Coverage';
      if (!coverageGroups[key]) coverageGroups[key] = [];
      coverageGroups[key].push(product);
    }

    // Process ONE coverage group per run (your existing behavior)
    const [coverage, groupProducts] = Object.entries(coverageGroups)[0];

    if (!groupProducts?.length) {
      return { message: 'No coverage group found' };
    }

    // Shopify variant limit (100)
    if (groupProducts.length * SIM_TYPES.length > 100) {
      throw new Error(
        `Coverage "${coverage}" exceeds Shopify variant limit`
      );
    }

    // Build variants (SIM Type × Plan)
    const variants: any[] = [];

    for (const p of groupProducts) {
      for (const simType of SIM_TYPES) {
        variants.push({
          price: String(p.price ?? 0.00),

          // SKU must be unique
          sku: `${p.sku}-${simType.code === 'ESIM' ? 'ESIM' : 'PSIM'}`,

          option1: simType.label,
          option2: p.name,

          inventory_management: 'shopify',
          inventory_quantity: 100,
        });
      }
    }

    // Product description
    const body_html = groupProducts
      .map(
        (p) => `
          <strong>Description:</strong><p>${p.description}</p>
          ${p.data ? `<strong>Data:</strong><p>${p.data}</p>` : ''}
          ${p.lifeCycle ? `<strong>Validity Period:</strong><p>${p.lifeCycle}</p>` : ''}
          ${p.validityMode ? `<strong>Validity Mode:</strong><p>${p.validityMode}</p>` : ''}
          ${p.speedControlMode ? `<strong>Speed Control Mode:</strong><p>${p.speedControlMode}</p>` : ''}
          ${p.initialSpeed ? `<strong>Initial Speed:</strong><p>${p.initialSpeed}</p>` : ''}
          ${clean(p.speedControllTier1) ? `<strong>Speed Tier 1:</strong><p>${p.speedControllTier1}</p>` : ''}
          ${clean(p.speedControllTier2) ? `<strong>Speed Tier 2:</strong><p>${p.speedControllTier2}</p>` : ''}
                  `.trim()
                )
                .join('<hr/>');

    const payload = {
      product: {
        title: `Coverage: ${coverage}`,
        body_html,
        vendor: 'M-MobileQC',
        product_type: 'Data Package',
        status: 'active',

        // 🔑 OPTIONS DEFINITION
        options: [
          { name: 'SIM Type' },
          { name: 'Plan' },
        ],

        variants,
      },
    };

    const response = await fetch(
      `${this.shopifyUrl}/admin/api/2024-01/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': this.accessToken,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();
    const shopifyProduct = data.product;

    if (!shopifyProduct?.variants?.length) {
      throw new Error('Shopify returned no variants');
    }

    // Sync back variant IDs
    for (const variant of shopifyProduct.variants) {
      const [baseSku] = variant.sku.split('-');

      await this.prisma.product.update({
        where: { sku: baseSku },
        data: {
          syncStatus: 'synced',
          productId: shopifyProduct.id.toString(),
          variantId: variant.id.toString(),
          inventoryItemId: variant.inventory_item_id.toString(),
        },
      });
    }

    console.log(
      `✅ Synced coverage "${coverage}" with ${shopifyProduct.variants.length} variants`
    );

    return {
      message: `Coverage "${coverage}" synced successfully`,
      coverage,
      variants: shopifyProduct.variants.length,
    };
  } catch (error: any) {
    console.error('❌ Sync failed:', error.message);
    throw new Error('Failed to sync products to Shopify');
  }
}



 async getImsi45400(res){
       const products = await this.prisma.product.findMany({
        where: {
           imsi: 45400
         }
       });
       return res.json({"success": true, "products": products})
}
async getImsi45407(res){
       const products = await this.prisma.product.findMany({
        where: {
           imsi: 45407
         }
       });
       return res.json({"success": true, "products": products})
}
async test(res){
       const products = await this.prisma.product.findMany({
        where: {
           syncStatus: "synced"
         }
       });
       return res.json({"success": true, "products": products.length})
}
}
