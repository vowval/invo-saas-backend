"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const typeorm_1 = require("typeorm");
const super_admin_seed_1 = require("./super-admin.seed");
const user_entity_1 = require("../users/user.entity");
const company_entity_1 = require("../companies/company.entity");
const product_entity_1 = require("../products/product.entity");
const invoice_entity_1 = require("../invoices/invoice.entity");
const invoice_item_entity_1 = require("../invoices/invoice-item.entity");
const dyeing_job_entity_1 = require("../dyeing-jobs/dyeing-job.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_URL,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        user_entity_1.User,
        company_entity_1.Company,
        product_entity_1.Product,
        invoice_entity_1.Invoice,
        invoice_item_entity_1.InvoiceItem,
        dyeing_job_entity_1.DyeingJob,
    ],
    synchronize: false,
});
async function run() {
    try {
        await dataSource.initialize();
        await (0, super_admin_seed_1.seedSuperAdmin)(dataSource);
        await dataSource.destroy();
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Seed failed', err);
        process.exit(1);
    }
}
run();
//# sourceMappingURL=run-seed.js.map