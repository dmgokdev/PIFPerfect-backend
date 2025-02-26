import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	PRODUCT_EXISTS,
	GET_PRODUCT_QUERY_SCHEMA_CONFIG,
	PRODUCT_NOT_FOUND,
	ALL_STATUS,
	INVALID_STATUS,
	COMPANY_NOT_FOUND,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createProductSchema = yup.object({
	body: yup.object({
		productName: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-name',
				message: PRODUCT_EXISTS,
				async test(value) {
					const record = await prisma.products.findFirst({
						where: { productName: value },
					});
					return !record;
				},
			}),
		companyId: yup
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
					return Boolean(record?.id);
				},
			}),
		description: yup.string().notRequired(),
		defaultCashValue: yup.number().notRequired(),
		price: yup.number().required(REQUIRED_FIELDS),
		productId: yup.number().notRequired(),
		metrics: yup
			.array()
			.of(
				yup
					.number()
					.integer()
					.positive('Metric ID must be a positive integer.'),
			)
			.notRequired(),
	}),
});

export const getProductsSchema = yup.object({
	query: createQueryParamsSchema(GET_PRODUCT_QUERY_SCHEMA_CONFIG),
});

export const updateProductSchema = yup.object({
	body: yup.object({
		productName: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: PRODUCT_EXISTS,
				async test(value, context) {
					if (!value) return true;

					const currentProductId = parseInt(
						context?.options?.context?.params?.id,
						10,
					);

					if (Number.isNaN(currentProductId)) return true;

					const record = await prisma.products.findFirst({
						where: {
							productName: value,
							id: { not: currentProductId },
						},
					});

					return !record;
				},
			}),

		companyId: yup.number().notRequired(),
		defaultCashValue: yup.number().notRequired(),
		description: yup.string().notRequired(),
		api_key: yup.string().notRequired(),
		price: yup.number().notRequired(),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		metrics: yup
			.array()
			.of(
				yup
					.number()
					.integer()
					.positive('Metric ID must be a positive integer.'),
			)
			.notRequired(),
	}),
	file: yup.mixed(),
	params: yup.object({
		id: yup
			.number()
			.integer('Product ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PRODUCT_NOT_FOUND,
				async test(value) {
					const record = await prisma.products.findUnique({
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

export const ProductIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Product ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PRODUCT_NOT_FOUND,

				async test(value) {
					const record = await prisma.products.findUnique({
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
