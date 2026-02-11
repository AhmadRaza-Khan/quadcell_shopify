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
      {
        label: 'E-SIM',
        code: 'ESIM',
        weight: 0,
        requiresShipping: false,
      },
      {
        label: 'Physical SIM',
        code: 'PSIM',
        weight: 0.01,
        requiresShipping: true,
      },
    ];

    const products = await this.prisma.product.findMany({
      where: { syncStatus: 'pending' },
      orderBy: { coverage: 'asc' },
    });

    if (!products.length) {
      return { message: 'No pending products to sync' };
    }

    const coverageGroups: Record<string, typeof products> = {};
    for (const product of products) {
      const key = product.coverage || 'Default Coverage';
      if (!coverageGroups[key]) coverageGroups[key] = [];
      coverageGroups[key].push(product);
    }

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
          price: String(p.price ?? 0.0),

          // SKU must be unique
          sku: `${p.sku}-${simType.code}`,

          option1: simType.label,
          option2: p.name,

          inventory_management: 'shopify',
          inventory_quantity: 100,

          // ✅ SHIPPING & WEIGHT
          weight: simType.weight,
          weight_unit: 'kg',
          requires_shipping: simType.requiresShipping,
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
      `Synced coverage "${coverage}" with ${shopifyProduct.variants.length} variants`
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
async test(res: any) {
  const customerId = "8741188829274";
  const newIccid = "8985211116108993460"
  const baseUrl = `${this.shopifyUrl}/admin/api/2024-01`;

  // ✅ TypeScript-safe headers
  const headers: Record<string, string> = {
    'X-Shopify-Access-Token': this.accessToken || '',
    'Content-Type': 'application/json'
  };

  // 1️⃣ Fetch existing metafield
  const getRes = await fetch(
    `${baseUrl}/customers/${customerId}/metafields.json?namespace=custom&key=sim`,
    { headers }
  );

  if (!getRes.ok) {
    console.log(getRes.statusText)
    return (`Failed to fetch metafields: ${getRes.status} ${getRes.statusText}`);
  }

  const getData = await getRes.json();
  console.log(getData.metafields[0].value.trim())
  const metafield = getData.metafields?.[0];

  // 2️⃣ Parse existing IMSIs
  let imsis: string[] = [];
  if (metafield?.value) {
    try {
      imsis = JSON.parse(metafield.value);
    } catch {
      imsis = [];
    }
  }

  // 3️⃣ Append new IMSI if not duplicate
  if (!imsis.includes(newIccid)) {
    imsis.push(newIccid);
  }

  const payload = {
    metafield: {
      namespace: "custom",                 // matches Shopify default for your UI
      key: "sim",                          // auto-generated from Name in Admin UI
      type: "list.single_line_text_field", // List of strings
      value: JSON.stringify(imsis)         // Shopify expects stringified JSON array
    }
  };

  // 4️⃣ Update if exists, else create
  if (metafield?.id) {
    const updateRes = await fetch(`${baseUrl}/metafields/${metafield.id}.json`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload)
    });
    const upJson = await updateRes.json();
    console.log("upJson: ", upJson)

    if (!updateRes.ok) {
      console.log(updateRes.statusText)
      return (`Failed to update metafield: ${updateRes.status} ${updateRes.statusText}`);
    }
  } else {
    const createRes = await fetch(`${baseUrl}/customers/${customerId}/metafields.json`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const crJson = await createRes.json();
    console.log("crJson: ", crJson);

    if (!createRes.ok) {
      console.log(createRes.statusText)
      return (`Failed to create metafield: ${createRes.status} ${createRes.statusText}`);
    }
  }

  return (`IMSI ${newIccid} appended for customer ${customerId}`);
}



}
