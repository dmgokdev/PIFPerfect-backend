import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { METRIC_NOT_FOUND, SUBMIT_NUMBERS_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class DashboardService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async mainDashboard() {
		const { query } = this.req;
		let { startDate, endDate, mainMetricId, secondaryMetricId, companyId } =
			query;

		const today = new Date();
		startDate = startDate
			? new Date(startDate).toISOString()
			: new Date(
					today.getFullYear() - 1,
					today.getMonth(),
					today.getDate(),
				).toISOString();
		endDate = endDate ? new Date(endDate).toISOString() : today.toISOString();

		const metricIds = [mainMetricId, secondaryMetricId].filter(Boolean);

		const metrics = await prisma.metrics.findMany({
			where: {
				...(metricIds.length ? { id: { in: metricIds } } : {}),
				...(companyId ? { company_metric: { some: { companyId } } } : {}),
			},
		});

		if (!metrics.length) {
			return {
				records: [],
			};
		}

		const whereCondition = {
			date: { gte: startDate, lte: endDate },
			deleted: false,
			...(metricIds.length && { metricId: { in: metricIds } }),
		};

		const [dailyMetrics, projections] = await Promise.all([
			prisma.daily_metrics.findMany({
				where: whereCondition,
				select: {
					metricId: true,
					date: true,
					value: true,
				},
			}),
			prisma.projections.findMany({
				where: {
					startDate: { lte: endDate },
					endDate: { gte: startDate },
					deleted: false,
					status: 'ACTIVE',
					...(metricIds.length && { metricId: { in: metricIds } }),
				},
				select: {
					metricId: true,
					startDate: true,
					endDate: true,
					targetValue: true,
				},
			}),
		]);

		// Group daily metrics and projections by month
		const groupByMonth = (data, key) => {
			return data.reduce((acc, item) => {
				const month = new Date(item.date || item.startDate).toLocaleString(
					'default',
					{ month: 'short' },
				);
				acc[month] = acc[month] || [];
				acc[month].push(item);
				return acc;
			}, {});
		};

		const monthlyActuals = groupByMonth(dailyMetrics, 'date');
		const monthlyProjections = groupByMonth(projections, 'startDate');

		const revenueMap = dailyMetrics.reduce((acc, { metricId, value }) => {
			acc[metricId] = (acc[metricId] || 0) + value;
			return acc;
		}, {});

		const expenseMap = projections.reduce((acc, { metricId, targetValue }) => {
			acc[metricId] = (acc[metricId] || 0) + targetValue;
			return acc;
		}, {});

		return metrics.map(({ id, name, type, isDefault }) => ({
			metricId: id,
			metricName: name,
			metricType: type,
			isDefault: isDefault,
			isMainMetric: id === mainMetricId,
			isSecondaryMetric: id === secondaryMetricId,
			revenueGenerated: revenueMap[id] || 0,
			expenses: expenseMap[id] || 0,
			profitRatio:
				(expenseMap[id] || 0) > 0
					? (((revenueMap[id] || 0) - expenseMap[id]) / expenseMap[id]) * 100
					: 0,
			lastYearRevenue: Object.keys(monthlyActuals).reduce((acc, month) => {
				const totalActual = (monthlyActuals[month] || [])
					.filter(({ metricId }) => metricId === id)
					.reduce((sum, { value }) => sum + value, 0);

				const totalProjected = (monthlyProjections[month] || [])
					.filter(proj => proj.metricId === id)
					.reduce((sum, { targetValue }) => sum + targetValue, 0);

				acc[month] = { actual: totalActual, projected: totalProjected };

				return acc;
			}, {}),
		}));
	}
}
