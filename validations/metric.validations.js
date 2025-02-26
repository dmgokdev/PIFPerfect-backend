import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	GET_METRIC_QUERY_SCHEMA_CONFIG,
	METRIC_NOT_FOUND,
	COMPANY_NOT_FOUND,
	PRODUCT_NOT_FOUND,
	ALL_STATUS,
	INVALID_STATUS,
	GET_DASHBOARD_QUERY_SCHEMA_CONFIG,
	PRODUCT_IDS_MUST_BE_INTEGERS,
	GET_COMPANY_METRIC_QUERY_SCHEMA_CONFIG,
	METRIC_EXISTS,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const createMetricSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-name',
				message: METRIC_EXISTS,
				async test(value) {
					if (!value) return false;
					const record = await prisma.metrics.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		type: yup.string().required(REQUIRED_FIELDS),
		operator: yup.string().notRequired(),
		value1Id: yup.number().notRequired(),
		value2Id: yup.number().notRequired(),
		role: yup.number().required(REQUIRED_FIELDS),
		isDefault: yup.boolean().notRequired(),
		roleLabel: yup.string().notRequired(),
		companyId: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.notRequired()
			.test({
				name: 'valid-company',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					if (!value) return true;
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !!(record && record.id);
				},
			}),
		operator: yup.string().notRequired(),
		productIds: yup
			.array()
			.of(
				yup.number().integer('Product IDs must be integers.').max(99999999999),
			)
			.notRequired()
			.test({
				name: 'valid-products',
				message: PRODUCT_NOT_FOUND,
				async test(productIds, context) {
					if (!productIds || productIds.length === 0) return true;

					const { companyId } = context.parent;
					if (!companyId) return true;

					const products = await prisma.products.findMany({
						where: {
							id: { in: productIds },
							companyId: parseInt(companyId, 10),
							deleted: false,
						},
					});

					if (products.length !== productIds.length) {
						return false;
					}

					return true;
				},
			}),
	}),
});

export const getMetricsSchema = yup.object({
	query: createQueryParamsSchema(GET_METRIC_QUERY_SCHEMA_CONFIG),
});

export const updateMetricSchema = yup.object({
	body: yup.object({
		role: yup.number().notRequired(),
		name: yup.string().notRequired(),
		type: yup.string().notRequired(),
		value1Id: yup.number().notRequired(),
		value2Id: yup.number().notRequired(),
		operator: yup.string().notRequired(),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		isDefault: yup.boolean().notRequired(),
		label: yup.string().notRequired(),
		companyId: yup
			.number()
			.integer('Company ID must be an integer.')
			.max(99999999999)
			.notRequired()
			.test({
				name: 'valid-company',
				message: COMPANY_NOT_FOUND,
				async test(value) {
					if (!value) return true;
					const record = await prisma.companies.findUnique({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !!(record && record.id);
				},
			}),
		productIds: yup
			.array()
			.of(yup.number().integer(PRODUCT_IDS_MUST_BE_INTEGERS).max(99999999999))
			.notRequired()
			.nullable()
			.test({
				name: 'valid-products',
				message: PRODUCT_NOT_FOUND,
				async test(productIds, context) {
					if (!productIds) return true;

					const products = await prisma.products.findMany({
						where: {
							id: { in: productIds },
							deleted: false,
						},
					});

					return products.length === productIds.length;
				},
			}),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Metric ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-metric',
				message: METRIC_NOT_FOUND,
				async test(value) {
					const record = await prisma.metrics.findUnique({
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

export const MetricIdSchema = yup.object({
	params: yup.object({
		id: yup
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
});

export const getDashboardSchema = yup.object({
	query: createQueryParamsSchema(GET_DASHBOARD_QUERY_SCHEMA_CONFIG),
});

export const assignMetricsSchema = yup.object({
	body: yup.object({
		metrics: yup
			.array()
			.of(
				yup.object().shape({
					metricId: yup
						.number()
						.integer('Metric ID must be an integer.')
						.max(99999999999)
						.required('Metric ID is required.'),
					label: yup
						.string()
						.trim()
						.max(255, 'Label cannot exceed 255 characters.')
						.nullable(),
				}),
			)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-metrics',
				message: 'One or more selected metrics do not exist',
				async test(metrics) {
					if (!metrics || metrics.length === 0) return false;

					const metricIds = metrics.map(m => m.metricId);

					const existingMetrics = await prisma.metrics.findMany({
						where: { id: { in: metricIds }, deleted: false },
						select: { id: true },
					});

					const existingMetricIds = new Set(existingMetrics.map(m => m.id));

					return metricIds.every(id => existingMetricIds.has(id));
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
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		label: yup.string().notRequired(),
	}),
});

export const getCompanyMetricsSchema = yup.object({
	query: createQueryParamsSchema(GET_COMPANY_METRIC_QUERY_SCHEMA_CONFIG),
});

export const updateCompanyMetricSchema = yup.object({
	body: yup.object({
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
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
		label: yup.string().notRequired(),
	}),
});
