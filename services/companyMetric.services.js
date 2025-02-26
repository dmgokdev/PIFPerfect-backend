import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors';

import HttpStatus from 'http-status-codes';
const prisma = new PrismaClient();

export class CompanyMetricService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async assignMetrics() {
		const { companyId, metrics } = this.req.body;

		const companyIdNumber = Number(companyId);

		if (!Array.isArray(metrics) || metrics.length === 0) {
			throw new Error(
				'Metrics must be an array and contain at least one metric.',
			);
		}

		const metricIds = metrics.map(m => Number(m.metricId));

		const existingMetrics = await prisma.company_metric.findMany({
			where: { companyId: companyIdNumber },
			select: { metricId: true },
		});

		const existingMetricIds = new Set(existingMetrics.map(m => m.metricId));

		const newMetrics = metrics.filter(
			m => !existingMetricIds.has(Number(m.metricId)),
		);

		if (newMetrics.length === 0) {
			throw new Error(
				`All selected metrics are already assigned to company with ID ${companyIdNumber}.`,
			);
		}

		const assignMetrics = newMetrics.map(({ metricId, label }) => ({
			companyId: companyIdNumber,
			metricId: Number(metricId),
			label: label || null,
		}));

		await prisma.company_metric.createMany({
			data: assignMetrics,
			skipDuplicates: true,
		});

		return {
			assignedMetrics: newMetrics.map(m => m.metricId),
			alreadyAssigned: [...existingMetricIds],
		};
	}

	async getCompanyMetrics() {
		const { query } = this.req;

		let { id, page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100;

		const options = {
			where: {
				companyId: parseInt(id, 10),
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => ({
				[key]: { contains: search[key] },
			}));
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.company_metric.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.company_metric.findMany({
			...options,
			include: {
				metric: true,
			},
		});

		if (!allRecords || allRecords.length === 0) {
			throw new AppError(
				'No metrics found for this company',
				HttpStatus.NOT_FOUND,
			);
		}

		return {
			metrics: allRecords.map(record => ({
				...record.metric,
				label: record.label,
			})),
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}
	async updateCompanyMetric() {
		const { metricId, companyId, label } = this.req.body;

		const companyMetric = await prisma.company_metric.findFirst({
			where: {
				companyId: companyId,
				metricId: metricId,
			},
		});
		const updatedRecord = await prisma.company_metric.update({
			where: {
				id: companyMetric.id,
			},
			data: { label },
		});

		return updatedRecord;
	}
}
