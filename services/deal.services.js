import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { DEAL_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class DealService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createDeals() {
		const { body } = this.req;

		try {
			const deals = await prisma.deals.create({
				data: {
					...body,
				},
			});
			return {
				deals,
			};
		} catch (error) {
			throw new Error('Failed to create deal');
		}
	}

	async getAllDeals() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
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

		const totalCount = await prisma.deals.count(options);

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.deals.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(DEAL_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateDeal() {
		const { id } = this.req.params;
		const { body } = this.req;

		const updateRecord = await prisma.deals.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async getDeal() {
		const { id } = this.req.params;
		const record = await prisma.deals.findUnique({
			where: {
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(DEAL_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async deleteDeal() {
		const { id } = this.req.params;

		await prisma.deals.update({
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
