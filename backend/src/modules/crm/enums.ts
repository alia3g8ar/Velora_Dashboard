import { registerEnumType } from '@nestjs/graphql';

export enum Role {
    ADMIN = 'ADMIN',
    SALES_MANAGER = 'SALES_MANAGER',
    SALES_PERSON = 'SALES_PERSON',
    SALES_INTERN = 'SALES_INTERN',
}

export enum Industry {
    AEROSPACE = 'AEROSPACE',
    AGRICULTURE = 'AGRICULTURE',
    AUTOMOTIVE = 'AUTOMOTIVE',
    CHEMICALS = 'CHEMICALS',
    CONSTRUCTION = 'CONSTRUCTION',
    DEFENSE = 'DEFENSE',
    EDUCATION = 'EDUCATION',
    ENERGY = 'ENERGY',
    FINANCIAL_SERVICES = 'FINANCIAL_SERVICES',
    FOOD_AND_BEVERAGE = 'FOOD_AND_BEVERAGE',
    GOVERNMENT = 'GOVERNMENT',
    HEALTHCARE = 'HEALTHCARE',
    HOSPITALITY = 'HOSPITALITY',
    INDUSTRIAL_MANUFACTURING = 'INDUSTRIAL_MANUFACTURING',
    INSURANCE = 'INSURANCE',
    LIFE_SCIENCES = 'LIFE_SCIENCES',
    LOGISTICS = 'LOGISTICS',
    MEDIA = 'MEDIA',
    MINING = 'MINING',
    NONPROFIT = 'NONPROFIT',
    OTHER = 'OTHER',
    PHARMACEUTICALS = 'PHARMACEUTICALS',
    PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
    REAL_ESTATE = 'REAL_ESTATE',
    RETAIL = 'RETAIL',
    TECHNOLOGY = 'TECHNOLOGY',
    TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
    TRANSPORTATION = 'TRANSPORTATION',
    UTILITIES = 'UTILITIES',
}

export enum CompanySize {
    ENTERPRISE = 'ENTERPRISE',
    LARGE = 'LARGE',
    MEDIUM = 'MEDIUM',
    SMALL = 'SMALL',
}

export enum BusinessType {
    B2B = 'B2B',
    B2C = 'B2C',
    B2G = 'B2G',
}

export enum ContactStatus {
    NEW = 'NEW',
    QUALIFIED = 'QUALIFIED',
    UNQUALIFIED = 'UNQUALIFIED',
    WON = 'WON',
    NEGOTIATION = 'NEGOTIATION',
    LOST = 'LOST',
    INTERESTED = 'INTERESTED',
    CONTACTED = 'CONTACTED',
    CHURNED = 'CHURNED',
}

export enum ContactStage {
    CUSTOMER = 'CUSTOMER',
    LEAD = 'LEAD',
    SALES_QUALIFIED_LEAD = 'SALES_QUALIFIED_LEAD',
}

registerEnumType(Role, { name: 'Role' });
registerEnumType(Industry, { name: 'Industry' });
registerEnumType(CompanySize, { name: 'CompanySize' });
registerEnumType(BusinessType, { name: 'BusinessType' });
registerEnumType(ContactStatus, { name: 'ContactStatus' });
registerEnumType(ContactStage, { name: 'ContactStage' });
