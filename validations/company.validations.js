import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	GET_COMPANY_QUERY_SCHEMA_CONFIG,
	COMPANY_EXISTS,
	INVALID_EMAIL,
	COMPANY_NOT_FOUND,
	GET_COMPANY_USER_QUERY_SCHEMA_CONFIG,
	EMAIL_EXISTS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const getCompanySchema = yup.object({
	query: createQueryParamsSchema(GET_COMPANY_QUERY_SCHEMA_CONFIG),
});

export const addCompanySchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-name',
				message: COMPANY_EXISTS,
				async test(value) {
					if (!value) return false;
					const record = await prisma.companies.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		industry: yup.number().required(REQUIRED_FIELDS),
		adminFirstName: yup.string().required(REQUIRED_FIELDS),
		adminLastName: yup.string().required(REQUIRED_FIELDS),
		isTaxable: yup.boolean().notRequired(),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
	}),
	file: yup.mixed(),
});

export const updateCompanySchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: COMPANY_EXISTS,
				async test(value) {
					if (!value) return true;
					const record = await prisma.companies.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		primaryContactId: yup.string().notRequired(),
		adminFirstName: yup.string().notRequired(),
		adminLastName: yup.string().notRequired(),
		adminEmail: yup.string().email(INVALID_EMAIL).notRequired(),
		adminPassword: yup.string().notRequired().min(6),
		adminPhone: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const CompanyIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const deleteCompaniesSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});

export const createCompanySchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-name',
				message: COMPANY_EXISTS,
				async test(value) {
					if (!value) return false;
					const record = await prisma.companies.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		industry: yup.number().required(REQUIRED_FIELDS),
		isTaxable: yup.boolean().notRequired(),
	}),
	file: yup.mixed(),
});

export const companyUpdateSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: COMPANY_EXISTS,
				async test(value, context) {
					if (!value) return true;

					const currentCompanyId = parseInt(
						context?.options?.context?.params?.id,
						10,
					);

					if (Number.isNaN(currentCompanyId)) return true;

					const record = await prisma.companies.findFirst({
						where: {
							name: value,
							id: { not: currentCompanyId },
						},
					});

					return !record;
				},
			}),
		industry: yup.number().notRequired(),
		tradeMark: yup.string().notRequired(),
		licenseNumber: yup.string().notRequired(),
		country: yup.string().notRequired(),
		city: yup.string().notRequired(),
		address: yup.string().notRequired(),
		isActive: yup.boolean().notRequired(),
		isTaxable: yup.boolean().notRequired(),
		roleLabels: yup.array().notRequired(),
		currencySymbol: yup.string().notRequired(),
	}),
	file: yup.mixed(),
	params: yup.object({
		id: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !!(record && record.id);
				},
			}),
	}),
});

export const getCompanyUsersSchema = yup.object({
	query: createQueryParamsSchema(GET_COMPANY_USER_QUERY_SCHEMA_CONFIG),
	params: yup.object({
		id: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});
