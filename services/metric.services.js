import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { METRIC_NOT_FOUND, SUBMIT_NUMBERS_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class MetricService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createMetric() {
		const { body, user } = this.req;
		const { productIds, companyId, ...metricBody } = body;

		const isCalculated = metricBody.operator != null;

		const metric = await prisma.metrics.create({
			data: {
				...metricBody,
				isCalculated,
				createdBy: user.id,
				...(isCalculated
					? {}
					: { operator: null, value1Id: null, value2Id: null }),
				products: {
					create:
						productIds?.map(productId => ({
							product: {
								connect: { id: productId },
							},
						})) || [],
				},
			},
			include: {
				products: {
					include: { product: true },
				},
			},
		});

		if (companyId) {
			await prisma.company_metric.create({
				data: {
					companyId,
					metricId: metric.id,
				},
			});
		}

		return metric;
	}

	async getAllMetrics() {
		const { query } = this.req;
		let { page, limit, sort, companyId, ...search } = query;
		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				OR: [
					{ isDefault: true },
					companyId
						? {
								company_metric: {
									some: {
										companyId: Number(companyId),
									},
								},
							}
						: {},
				],
			},
			include: {
				dailyMetrics: {
					select: { id: true },
				},
				company_metric: companyId
					? {
							where: {
								companyId: Number(companyId),
							},
						}
					: true,
			},
		};

		if (Object.keys(search).length > 0) {
			options.where.AND = Object.entries(search).map(([key, value]) => {
				switch (key) {
					case 'role':
					case 'status':
						return { [key]: { equals: value } };
					case 'isDefault':
						return { [key]: { equals: value === 'true' || value === true } };
					case 'type':
						return { [key]: { not: value } };
					case 'name':
					default:
						return { [key]: { contains: value } };
				}
			});
		}
		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [{ [field]: direction }];
		}

		const totalCount = await prisma.metrics.count({
			where: options.where,
		});
		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.metrics.findMany(options);

		const transformedRecords = allRecords.map(record => ({
			...record,
			isDeleted: record.dailyMetrics.length === 0,
		}));

		return {
			records: transformedRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateMetric() {
		const { body, params } = this.req;
		const { productIds, companyId, ...metricBody } = body;

		const updatedMetric = await prisma.$transaction(async prisma => {
			const existingMetric = await prisma.metrics.findUnique({
				where: {
					id: parseInt(params.id, 10),
				},
			});

			const metric = await prisma.metrics.update({
				where: {
					id: parseInt(params.id, 10),
				},
				data: {
					...metricBody,
					...(existingMetric.isDefault
						? {
								name: existingMetric.name,
							}
						: {
								name: body.name,
							}),
					...(body.hasOwnProperty('operator')
						? {
								isCalculated: body.operator != null,
							}
						: {}),
				},
			});

			if (productIds) {
				await prisma.metrics_products.deleteMany({
					where: {
						metricId: metric.id,
					},
				});

				if (productIds.length > 0) {
					await prisma.metrics_products.createMany({
						data: productIds.map(productId => ({
							metricId: metric.id,
							productId: productId,
						})),
					});
				}
			}

			if (existingMetric.isDefault) {
				await prisma.company_metric.updateMany({
					where: {
						metricId: metric.id,
						companyId,
					},
					data: {
						label: body.name,
					},
				});
			}

			return prisma.metrics.findUnique({
				where: {
					id: metric.id,
				},
				include: {
					products: {
						include: {
							product: true,
						},
					},
					company_metric: true,
				},
			});
		});

		return updatedMetric;
	}

	async deleteMetric() {
		const { id } = this.req.params;
		const metricId = parseInt(id, 10);

		const dailyMetricsCount = await prisma.daily_metrics.count({
			where: {
				metricId,
				deleted: false,
			},
		});

		if (dailyMetricsCount > 0) {
			throw new Error(SUBMIT_NUMBERS_FOUND);
		}

		await prisma.metrics.update({
			where: {
				deleted: false,
				id: metricId,
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async getMetric() {
		const { id } = this.req.params;

		const record = await prisma.metrics.findUnique({
			where: { id: parseInt(id, 10) },
			include: {
				dailyMetrics: { select: { id: true } },
				value1: { select: { id: true, name: true } },
				value2: { select: { id: true, name: true } },
				products: {
					select: {
						product: {
							select: {
								id: true,
								productName: true,
							},
						},
					},
				},
			},
		});

		if (!record) throw new AppError(METRIC_NOT_FOUND, HttpStatus.NOT_FOUND);

		const formattedProducts = record.products.map(p => p.product);

		const result = {
			...record,
			products: formattedProducts,
			isDeleted: record.dailyMetrics.length <= 0,
		};

		return result;
	}
}
