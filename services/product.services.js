import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { PRODUCT_NOT_FOUND, NUMBERS_EXISTS } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class ProductService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createProduct() {
		const { body, user } = this.req;
		const { metrics, ...productData } = body;

		const product = await prisma.products.create({
			data: {
				...productData,
				createdBy: user.id,
				metrics: {
					create: metrics.map(metricId => ({
						metric: { connect: { id: metricId } },
					})),
				},
			},
			include: {
				metrics: {
					select: {
						metricId: true,
						metric: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		const transformedProduct = {
			...product,
			metrics: product.metrics.map(({ metricId, metric }) => ({
				metricId,
				name: metric.name,
			})),
		};

		return { product: transformedProduct };
	}

	async getAllProducts() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const whereClause = {
			deleted: false,
		};

		if (Object.keys(search).length) {
			whereClause.AND = Object.keys(search).map(key =>
				key === 'companyId'
					? { [key]: parseInt(search[key], 10) }
					: { [key]: { contains: search[key] } },
			);
		}

		const totalCount = await prisma.products.count({ where: whereClause });

		const totalPages = Math.ceil(totalCount / limit);

		const options = {
			where: whereClause,
			include: {
				metrics: {
					select: {
						metricId: true,
						metric: {
							select: {
								name: true,
								dailyMetrics: { select: { id: true }, take: 1 },
							},
						},
					},
				},
			},
			skip: (page - 1) * limit,
			take: limit,
		};

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [{ [field]: direction }];
		}

		const allRecords = await prisma.products.findMany(options);

		const transformedRecords = allRecords.map(product => {
			const metrics = product.metrics.map(({ metricId, metric }) => ({
				metricId,
				name: metric.name,
			}));

			const hasMetricWithDailyMetrics = product.metrics.some(
				metric =>
					metric.metric?.dailyMetrics && metric.metric.dailyMetrics.length > 0,
			);

			const isDeleted = !hasMetricWithDailyMetrics;

			return {
				...product,
				metrics,
				isDeleted,
			};
		});

		if (!allRecords.length) {
			return {
				records: [],
				totalRecords: 0,
				totalPages: 0,
				query,
			};
		}

		return {
			records: transformedRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateProducts() {
		const { id } = this.req.params;
		const { body } = this.req;
		const { metrics, ...productData } = body;

		productData.image = this.req.file ? this.req.file.filename : null;

		const checkProduct = await prisma.products.findFirst({
			where: {
				id: parseInt(id, 10),
				deleted: false,
			},
			include: {
				metrics: {
					include: {
						metric: true,
					},
				},
			},
		});

		const existingMetricIds = checkProduct.metrics.map(m => m.metricId);

		const newMetrics = metrics
			? metrics.filter(metricId => !existingMetricIds.includes(metricId))
			: [];

		const updatedProduct = await prisma.products.update({
			where: { id: parseInt(id, 10), deleted: false },
			data: {
				...productData,
				...(newMetrics.length > 0 && {
					metrics: {
						create: newMetrics.map(metricId => ({
							metric: { connect: { id: metricId } },
						})),
					},
				}),
			},
			include: {
				metrics: {
					include: {
						metric: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		return {
			...updatedProduct,
			metrics: updatedProduct.metrics.map(({ metricId, metric }) => ({
				metricId,
				name: metric.name,
			})),
		};
	}

	async getProduct() {
		const { id } = this.req.params;
		const productId = parseInt(id, 10);

		const record = await prisma.products.findUnique({
			where: { id: productId },
			include: {
				metrics: {
					select: {
						metric: {
							select: {
								id: true,
								name: true,
								dailyMetrics: { select: { id: true }, take: 1 },
							},
						},
					},
				},
			},
		});

		if (!record) {
			throw new AppError(PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const hasEditable = record.metrics.some(
			metricProduct =>
				Array.isArray(metricProduct.metric?.dailyMetrics) &&
				metricProduct.metric.dailyMetrics.length > 0,
		);

		const { metrics, ...productData } = record;

		return { ...productData, metrics, hasEditable };
	}

	async deleteProduct() {
		const { id } = this.req.params;

		const checkDailyMetrics = await prisma.products.findFirst({
			where: {
				id: parseInt(id, 10),
				deleted: false,
			},
			include: {
				daily_metrics: true,
			},
		});

		if (checkDailyMetrics?.daily_metrics.length > 0) {
			throw new AppError(NUMBERS_EXISTS, HttpStatus.NOT_FOUND);
		}
		await prisma.products.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}
}
