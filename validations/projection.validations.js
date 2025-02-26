import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	PROJECTION_NOT_FOUND,
	PROJECTION_PERIOD,
	GET_PROJECTION_QUERY_SCHEMA_CONFIG,
	USER_NOT_FOUND,
	ALL_STATUS,
	INVALID_STATUS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createProjectionSchema = yup.object({
	body: yup.object({
		targetValue: yup.number().required(REQUIRED_FIELDS),
		metricId: yup
			.number()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-id',
				message: PROJECTION_NOT_FOUND,
				async test(value) {
					const record = await prisma.metrics.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		userId: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		period: yup.string().required(PROJECTION_PERIOD).oneOf(PROJECTION_PERIOD),
		startDate: yup.string().required(REQUIRED_FIELDS),
		endDate: yup.string().required(REQUIRED_FIELDS),
	}),
});

export const getProjectionsSchema = yup.object({
	query: createQueryParamsSchema(GET_PROJECTION_QUERY_SCHEMA_CONFIG),
});

export const updateProjectionSchema = yup.object({
	body: yup.object({
		startDate: yup.date().notRequired(),
		targetValue: yup.number().notRequired(),
		userId: yup.number().notRequired(),
		period: yup.string().notRequired().oneOf(PROJECTION_PERIOD),
		companyId: yup.number().notRequired(),
		reason: yup.string().notRequired(),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		metricId: yup
			.number()
			.notRequired()
			.test({
				name: 'unique-id',
				message: PROJECTION_NOT_FOUND,
				async test(value) {
					if (!value) return true;
					const record = await prisma.metrics.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Projection ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PROJECTION_NOT_FOUND,
				async test(value) {
					const record = await prisma.projections.findUnique({
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

export const ProjectionIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Projection ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PROJECTION_NOT_FOUND,

				async test(value) {
					const record = await prisma.projections.findUnique({
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
