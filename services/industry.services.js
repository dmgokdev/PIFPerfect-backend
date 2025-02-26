import { PrismaClient } from '@prisma/client';
import HttpStatus from 'http-status-codes';

import { INDUSTRY_NOT_FOUND } from '../constants';
import { AppError } from '../errors';

const prisma = new PrismaClient();

export class IndustryService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async createIndustry() {
		const { body } = this.req;

		body.image = this.req.file ? this.req.file.filename : null;

		const industry = await prisma.industries.create({
			data: {
				...body,
			},
		});
		return {
			industry,
		};
	}

	async getAllIndustries() {
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
			options.where.AND = Object.keys(search).map(key => {
				const value = search[key];
				if (key === 'parent_id' || !isNaN(value)) {
					if (value === 'null') {
						return {
							[key]: null,
						};
					}
					const parsedValue = value === '' ? null : parseInt(value, 10) || null;
					return {
						[key]: parsedValue,
					};
				}
				return {
					[key]: { contains: value },
				};
			});
		}

		if (sort) {
			const [field, direction] = sort.split(':');
			options.orderBy = [
				{
					[field]: direction,
				},
			];
		}

		const totalCount = await prisma.industries.count({
			where: options.where,
		});

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.industries.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(INDUSTRY_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: allRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async updateIndustry() {
		const { id } = this.req.params;
		const { body } = this.req;

		body.image = this.req.file ? this.req.file.filename : null;

		const updateRecord = await prisma.industries.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: body,
		});

		return updateRecord;
	}

	async getIndustry() {
		const { id } = this.req.params;
		const record = await prisma.industries.findUnique({
			where: {
				id: parseInt(id, 10),
			},
		});
		if (!record || !record.id)
			throw new AppError(INDUSTRY_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async getChildIndustries() {
		const { id } = this.req.params;
		const record = await prisma.industries.findMany({
			where: {
				parent_id: parseInt(id, 10),
				deleted: false,
			},
			orderBy: {
				name: 'asc',
			},
		});

		if (!record || !Array.isArray(record) || record.length === 0) {
			throw new AppError(INDUSTRY_NOT_FOUND, HttpStatus.NOT_FOUND);
		}
		return record;
	}

	async deleteIndustry() {
		const { id } = this.req.params;

		await prisma.industries.update({
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
