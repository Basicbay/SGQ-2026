import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './user.entity.js';
import { Customer } from './customer.entity.js';
import { Project } from './project.entity.js';
import { Product } from './product.entity.js';
import { Quotation, QuotationItem } from './quotation.entity.js';
import { CreateUsers1789800000000 } from './migrations/1789800000000-CreateUsers.js';
import { SystemSettings } from './system-settings.entity.js';
import { CreateSystemSettings1789800001000 } from './migrations/1789800001000-CreateSystemSettings.js';
import { AddUserProfileFields1789800002000 } from './migrations/1789800002000-AddUserProfileFields.js';
import { CreateCustomers1789800003000 } from './migrations/1789800003000-CreateCustomers.js';
import { AddUserStatus1789800004000 } from './migrations/1789800004000-AddUserStatus.js';
import { AddUserLineId1789800005000 } from './migrations/1789800005000-AddUserLineId.js';
import { AddCustomerLineId1789800006000 } from './migrations/1789800006000-AddCustomerLineId.js';
import { CreateProjects1789800007000 } from './migrations/1789800007000-CreateProjects.js';
import { CreateProducts1789800008000 } from './migrations/1789800008000-CreateProducts.js';
import { CreateQuotations1789800009000 } from './migrations/1789800009000-CreateQuotations.js';

export const databaseOptions = {
  type: 'postgres' as const,
  entities: [User, SystemSettings, Customer, Project, Product, Quotation, QuotationItem],
  migrations: [
    CreateUsers1789800000000,
    CreateSystemSettings1789800001000,
    AddUserProfileFields1789800002000,
    CreateCustomers1789800003000,
    AddUserStatus1789800004000,
    AddUserLineId1789800005000,
    AddCustomerLineId1789800006000,
    CreateProjects1789800007000,
    CreateProducts1789800008000,
    CreateQuotations1789800009000,
  ],
  synchronize: false,
  migrationsRun: true,
};

export default new DataSource({ ...databaseOptions, url: process.env.DATABASE_URL });
