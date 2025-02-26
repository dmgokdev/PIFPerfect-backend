import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INVALID_VALUE,
	INVALID_DATE,
	GET_DEAL_QUERY_SCHEMA_CONFIG,
	DEAL_NOT_FOUND,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createDealSchema = yup.object({
	body: yup.object({
		date: yup.date().required(REQUIRED_FIELDS).typeError(INVALID_DATE),
		totalRevenue: yup.number().required(REQUIRED_FIELDS).min(0, INVALID_VALUE),
		userId: yup.number().required(REQUIRED_FIELDS),
		products: yup.array().required(REQUIRED_FIELDS).min(1, REQUIRED_FIELDS),
	}),
});

export const getDealsSchema = yup.object({
	query: createQueryParamsSchema(GET_DEAL_QUERY_SCHEMA_CONFIG),
});

export const updateDealSchema = yup.object({
	body: yup.object({
		date: yup.date().notRequired().typeError(INVALID_DATE),
		totalRevenue: yup.number().notRequired().min(0, INVALID_VALUE),
		userId: yup.number().notRequired(),
		products: yup.array().notRequired().min(1, REQUIRED_FIELDS),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Deal ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: DEAL_NOT_FOUND,
				async test(value) {
					const record = await prisma.deals.findUnique({
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

export const dealIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Deal ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: DEAL_NOT_FOUND,

				async test(value) {
					const record = await prisma.deals.findUnique({
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
