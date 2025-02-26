import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { METRIC_NOT_FOUND } from '../constants';
import { AppError } from '../errors';
import { calculateMetricValue } from '../utils';

const prisma = new PrismaClient();

export class DailyMetricService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createDailyMetric() {
		const { body, user } = this.req;

		return prisma.$transaction(async tx => {
			const createdMetrics = [];
			const metricValues = {};
			const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
			const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

			for (const { metricId, value, productId } of body.metrics) {
				const metricIdInt = parseInt(metricId);
				const productIdInt = parseInt(productId);

				const metric = await tx.metrics.findUnique({
					where: { id: metricIdInt },
				});

				const product = await tx.products.findFirstOrThrow({
					where: { id: productIdInt },
				});

				if (!metric.isCalculated) {
					const existingDailyMetric = await tx.daily_metrics.findFirst({
						where: {
							userId: user.id,
							metricId: metricIdInt,
							date: { gte: todayStart, lt: todayEnd },
						},
						orderBy: { date: 'desc' },
					});

					let processedMetric;
					if (existingDailyMetric) {
						if (existingDailyMetric.productPrice !== product.price) {
							processedMetric = await tx.daily_metrics.create({
								data: {
									value,
									userId: user.id,
									metricId: metricIdInt,
									date: body.date,
									productId: product.id,
									productPrice: product.price,
								},
							});
						} else {
							processedMetric = await tx.daily_metrics.update({
								where: { id: existingDailyMetric.id },
								data: { value: existingDailyMetric.value + value },
							});
						}
					} else {
						processedMetric = await tx.daily_metrics.create({
							data: {
								value,
								userId: user.id,
								metricId: metricIdInt,
								date: body.date,
								productId: product.id,
								productPrice: product.price,
							},
						});
					}

					metricValues[metricIdInt] = processedMetric.value;
					createdMetrics.push(processedMetric);
				}
			}

			if (Object.keys(metricValues).length === 0) {
				return createdMetrics;
			}

			const calculatedMetrics = await tx.metrics.findMany({
				where: {
					isCalculated: true,
					OR: [
						{ value1Id: { in: Object.keys(metricValues).map(Number) } },
						{ value2Id: { in: Object.keys(metricValues).map(Number) } },
					],
				},
			});

			for (const metric of calculatedMetrics) {
				const latestValue1 = await tx.daily_metrics.findFirst({
					where: {
						userId: user.id,
						metricId: metric.value1Id,
						date: { gte: todayStart, lt: todayEnd },
					},
					orderBy: { date: 'desc' },
				});

				const latestValue2 = await tx.daily_metrics.findFirst({
					where: {
						userId: user.id,
						metricId: metric.value2Id,
						date: { gte: todayStart, lt: todayEnd },
					},
					orderBy: { date: 'desc' },
				});

				const value1 = latestValue1?.value ?? metricValues[metric.value1Id];
				const value2 = latestValue2?.value ?? metricValues[metric.value2Id];

				if (value1 == null || value2 == null) {
					throw new Error(
						`Values for calculated metric with ID ${metric.id} are missing`,
					);
				}

				const calculatedValue = calculateMetricValue(
					value1,
					metric.operator,
					value2,
				);

				const existingCalculatedMetric = await tx.daily_metrics.findFirst({
					where: {
						userId: user.id,
						metricId: metric.id,
						date: { gte: todayStart, lt: todayEnd },
					},
				});

				let processedMetric;
				if (existingCalculatedMetric) {
					processedMetric = await tx.daily_metrics.update({
						where: { id: existingCalculatedMetric.id },
						data: { value: calculatedValue },
					});
				} else {
					processedMetric = await tx.daily_metrics.create({
						data: {
							value: calculatedValue,
							userId: user.id,
							metricId: metric.id,
							date: new Date(),
						},
					});
				}

				createdMetrics.push(processedMetric);
				metricValues[metric.id] = calculatedValue;
			}

			return createdMetrics;
		});
	}

	async getAllDailyMetrics() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, startDate, endDate, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				AND: [],
			},
			include: {
				metrics: {
					select: {
						name: true,
					},
				},
				users: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
		};

		if (search) {
			Object.keys(search).forEach(key => {
				const value = search[key];

				if (key === 'userId') {
					options.where.AND.push({ [key]: parseInt(value, 10) });
				} else if (key === 'name') {
					const nameParts = value.split(' ').filter(Boolean);

					if (nameParts.length === 2) {
						options.where.AND.push({
							users: {
								AND: [
									{
										firstName: { contains: nameParts[0] },
									},
									{ lastName: { contains: nameParts[1] } },
								],
							},
						});
					} else {
						options.where.AND.push({
							users: {
								OR: [
									{ firstName: { contains: value } },
									{ lastName: { contains: value } },
								],
							},
						});
					}
				} else {
					options.where.AND.push({
						[key]: { contains: value },
					});
				}
			});
		}

		if (startDate || endDate) {
			const dateFilter = {};
			if (startDate) dateFilter.gte = new Date(startDate);
			if (endDate) dateFilter.lte = new Date(endDate);
			options.where.AND.push({ date: dateFilter });
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.daily_metrics.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.daily_metrics.findMany(options);

		if (!allRecords || !allRecords.length) {
			return {
				records: [],
				totalRecords: 0,
				totalPages: 0,
				query,
			};
		}

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateDailyMetric() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.daily_metrics.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async getDailyMetric() {
		const { id } = this.req.params;
		const record = await prisma.daily_metrics.findUnique({
			where: {
				id: parseInt(id, 10),
			},
			include: {
				users: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
				metrics: {
					select: {
						name: true,
					},
				},
			}
		});
		if (!record || !record.id)
			throw new AppError(METRIC_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async deleteDailyMetric() {
		const { id } = this.req.params;

		await prisma.daily_metrics.update({
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
