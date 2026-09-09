"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./users/user.entity");
const company_entity_1 = require("./companies/company.entity");
const product_entity_1 = require("./products/product.entity");
const invoice_entity_1 = require("./invoices/invoice.entity");
const invoice_item_entity_1 = require("./invoices/invoice-item.entity");
const dyeing_job_entity_1 = require("./dyeing-jobs/dyeing-job.entity");
const subscription_plan_entity_1 = require("./subscriptions/subscription-plan.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_URL,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [user_entity_1.User, company_entity_1.Company, product_entity_1.Product, invoice_entity_1.Invoice, invoice_item_entity_1.InvoiceItem, dyeing_job_entity_1.DyeingJob, subscription_plan_entity_1.SubscriptionPlan],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
});
//# sourceMappingURL=data-source.js.map