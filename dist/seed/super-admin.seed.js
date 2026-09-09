"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = seedSuperAdmin;
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/user.entity");
const role_enum_1 = require("../auth/role.enum");
async function seedSuperAdmin(dataSource) {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Platform Super Admin';
    if (!email || !password) {
        throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set before seeding');
    }
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const existing = await userRepo.findOne({
        where: { email },
    });
    if (existing) {
        console.log('✅ Super Admin already exists. Skipping seed.');
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const superAdmin = userRepo.create({
        name,
        email,
        password: hashedPassword,
        role: role_enum_1.Role.SUPER_ADMIN,
        company: null,
    });
    await userRepo.save(superAdmin);
    console.log('🚀 Super Admin created successfully!');
    console.log(`📧 Email: ${email}`);
}
//# sourceMappingURL=super-admin.seed.js.map