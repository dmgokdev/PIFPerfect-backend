import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';
import moment from 'moment';

import {
	PROJECTION_NOT_FOUND,
	A_PROJECTION_ALREADY_EXISTS,
} from '../constants';
import { AppError } from '../errors';
import { calculatePace } from '../utils';

const prisma = new PrismaClient();

export class ProjectionService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createProjection() {
		const { body, user } = this.req;
		const { metricId, startDate, endDate, userId } = body;

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			throw new Error('Invalid startDate or endDate provided.');
		}

		if (start >= end) {
			throw new Error('startDate must be before endDate.');
		}

		const existingProjection = await prisma.projections.findFirst({
			where: {
				userId,
				metricId,
				endDate: { gte: new Date() },
				deleted: false,
			},
		});

		if (existingProjection) {
			throw new Error(A_PROJECTION_ALREADY_EXISTS);
		}

		return {
			projection: await prisma.projections.create({
				data: {
					...body,
					startDate: start,
					endDate: end,
					companyId: user.companyId,
				},
			}),
		};
	}

	async getAllProjections() {
		const { query, user } = this.req;
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
			},
			include: {
				metrics: {
					select: {
						type: true,
						dailyMetrics: {
							where: {
								userId: user.id,
							},
							select: {
								value: true,
							},
						},
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
			const searchConditions = [];

			Object.entries(search).forEach(([key, value]) => {
				if (key === 'name') {
					searchConditions.push({
						users: {
							OR: [
								{ firstName: { contains: value } },
								{ lastName: { contains: value } },
								{
									AND: [
										{ firstName: { contains: value.split(' ')[0] || '' } },
										{ lastName: { contains: value.split(' ')[1] || '' } },
									],
								},
							],
						},
					});
				} else if (key === 'userId') {
					searchConditions.push({
						userId: value,
					});
				} else if (key === 'companyId') {
					searchConditions.push({
						companyId: value,
					});
				} else if (key === 'period') {
					searchConditions.push({
						period: value,
					});
				} else {
					searchConditions.push({
						[key]: { contains: value },
					});
				}
			});

			options.where.AND = searchConditions;
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.projections.count({ where: options.where });
		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.projections.findMany(options);

		if (!allRecords || !allRecords.length) {
			return {
				records: [],
				totalRecords: 0,
				totalPages: 0,
				query,
			};
		}

		const recordsWithMetrics = allRecords.map(record => {
			const recordMetricsSum = record.metrics.dailyMetrics.reduce(
				(sum, metric) => sum + metric.value,
				0,
			);
			const remaining = Math.max(0, record.targetValue - recordMetricsSum);

			const projection = record.targetValue;
			const closesSoFar = recordMetricsSum;
			const totalDays =
				moment(record.endDate).diff(moment(record.startDate), 'days') + 1;
			const elapsedDays = moment().diff(moment(record.startDate), 'days') + 1;

			const { pacingPercentage, pacingRate } = calculatePace(
				closesSoFar,
				projection,
				totalDays,
				elapsedDays,
			);

			return {
				...record,
				totalMetricsValue: recordMetricsSum,
				remaining,
				pacingRate,
				pacingPercentage,
			};
		});

		return {
			records: recordsWithMetrics,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateProjection() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.projections.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async getProjections() {
		const { id } = this.req.params;
		const record = await prisma.projections.findUnique({
			where: {
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(PROJECTION_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async deleteProjection() {
		const { id } = this.req.params;

		await prisma.projections.update({
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
