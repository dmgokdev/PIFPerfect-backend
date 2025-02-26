import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	INDUSTRY_EXISTS,
	GET_INDUSTRY_QUERY_SCHEMA_CONFIG,
	INDUSTRY_NOT_FOUND,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createIndustrySchema = yup.object({
	body: yup.object({
		parent_id: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: INDUSTRY_EXISTS,
				async test(value) {
					if (!value) return true;
					const record = await prisma.industries.findFirst({
						where: { id: value },
					});
					return !record;
				},
			}),
		name: yup.string().required(REQUIRED_FIELDS),
		image: yup.number().notRequired(),
		description: yup.string().notRequired(),
	}),
	file: yup.mixed(),
});

export const getIndustriesSchema = yup.object({
	query: createQueryParamsSchema(GET_INDUSTRY_QUERY_SCHEMA_CONFIG),
});

export const updateIndustrySchema = yup.object({
	body: yup.object({
		parent_id: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: INDUSTRY_EXISTS,
				async test(value) {
					if (!value) return true;
					const record = await prisma.industries.findFirst({
						where: { id: value },
					});
					return !record;
				},
			}),
		name: yup.string().notRequired(),
		image: yup.number().notRequired(),
		description: yup.string().notRequired(),
	}),
	file: yup.mixed(),
	params: yup.object({
		id: yup
			.number()
			.integer('Industry ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INDUSTRY_NOT_FOUND,
				async test(value) {
					const record = await prisma.industries.findUnique({
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

export const IndustryIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Industry ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: INDUSTRY_NOT_FOUND,

				async test(value) {
					const record = await prisma.industries.findUnique({
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
