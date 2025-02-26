import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	GET_DAILY_METRIC_QUERY_SCHEMA_CONFIG,
	DAILY_METRIC_NOT_FOUND,
	METRIC_NOT_FOUND,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createDailyMetricSchema = yup.object({
	body: yup.object({
		date: yup.date().required(REQUIRED_FIELDS),
		metrics: yup
			.array()
			.of(
				yup.object({
					availableSlots: yup.number().notRequired(),
					scheduledCalls: yup.number().notRequired(),
					callsTaken: yup.number().notRequired(),
					offers: yup.number().notRequired(),
					productId: yup.number().notRequired(),
					value: yup.number().notRequired(),
					metricId: yup
						.number()
						.integer('Metric ID must be an integer.')
						.max(99999999999)
						.required(REQUIRED_FIELDS)
						.test({
							name: 'valid-form',
							message: METRIC_NOT_FOUND,

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
				}),
			)
			.min(1, 'At least one metric is required')
			.required(REQUIRED_FIELDS),
	}),
});

export const getDailyMetricsSchema = yup.object({
	query: createQueryParamsSchema(GET_DAILY_METRIC_QUERY_SCHEMA_CONFIG),
});

export const updateDailyMetricSchema = yup.object({
	body: yup.object({
		value: yup.number().notRequired(),
		reason: yup.string().notRequired(),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Daily Metric ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: DAILY_METRIC_NOT_FOUND,
				async test(value) {
					const record = await prisma.daily_metrics.findUnique({
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

export const dailyMetricIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Daily Metric ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: DAILY_METRIC_NOT_FOUND,

				async test(value) {
					const record = await prisma.daily_metrics.findUnique({
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
