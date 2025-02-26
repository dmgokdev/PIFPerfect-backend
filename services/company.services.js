import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import { COMPANY_NOT_FOUND } from '../constants';
import { AppError } from '../errors';
import { sendEmail } from '../utils';
import { number } from 'yup';

const prisma = new PrismaClient();

export class CompanyService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllCompanies() {
		const { query } = this.req;
		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, searchInput, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const where = {
			deleted: false,
		};

		if (Object.keys(search).length > 0) {
			where.AND = Object.keys(search).map(key => {
				if (key === 'isActive') {
					return { [key]: search[key] === 'true' };
					``;
				}
				return { [key]: { contains: search[key] } };
			});
		}

		if (searchInput) {
			where.OR = [
				{
					name: { contains: searchInput },
				},
				{
					users_companies: {
						some: {
							role_id: 2,
							users: {
								email: { contains: searchInput },
							},
						},
					},
				},
			];
		}

		const totalCount = await prisma.companies.count({
			where,
		});

		if (totalCount === 0) {
			return {
				records: [],
				totalRecords: 0,
				totalPages: 0,
				query,
			};
		}

		const totalPages = Math.ceil(totalCount / limit);

		const orderBy = sort
			? [{ [sort.split(':')[0]]: sort.split(':')[1] }]
			: undefined;

		const allRecords = await prisma.companies.findMany({
			where,
			orderBy,
			skip: (page - 1) * limit,
			take: limit,
			include: {
				users_companies: {
					where: {
						role_id: 2,
					},
					select: {
						userId: true,
						users: {
							select: {
								email: true,
							},
						},
					},
					take: 1,
				},
				_count: {
					select: {
						users_companies: true,
					},
				},
			},
		});

		if (!allRecords?.length) {
			throw new AppError(COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
		}

		const adminUserIds = allRecords
			.map(company => company.users_companies[0]?.userId)
			.filter(Boolean);

		const adminLastLogins = await prisma.auth_log.findMany({
			where: {
				user_id: {
					in: adminUserIds,
				},
			},
			orderBy: {
				created_at: 'desc',
			},
			distinct: ['user_id'],
			select: {
				user_id: true,
				type: true,
				created_at: true,
			},
		});

		const activeUserCounts = await prisma.companies.findMany({
			where: {
				id: {
					in: allRecords.map(r => r.id),
				},
			},
			select: {
				id: true,
				_count: {
					select: {
						users_companies: {
							where: {
								users: {
									deleted: false,
									status: 'ACTIVE',
								},
							},
						},
					},
				},
			},
		});

		const activeUsersMap = new Map(
			activeUserCounts.map(company => [
				company.id,
				company._count.users_companies,
			]),
		);

		const loginMap = new Map(
			adminLastLogins.map(login => [login.user_id, login]),
		);

		const transformedRecords = allRecords.map(company => {
			const adminUserId = company.users_companies[0]?.userId;
			const adminLastLogin = adminUserId ? loginMap.get(adminUserId) : null;

			const { users_companies, _count, ...companyData } = company;

			return {
				...companyData,
				totalUsers: _count.users_companies,
				activeUsers: activeUsersMap.get(company.id) || 0,
				adminEmail: company.users_companies[0]?.users?.email || null,
				adminLastLogin: adminLastLogin
					? {
							type: adminLastLogin.type,
							timestamp: adminLastLogin.created_at,
						}
					: null,
			};
		});

		return {
			records: transformedRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getCompany() {
		const { id } = this.req.params;
		const record = await prisma.companies.findUnique({
			where: {
				id: parseInt(id, 10),
			},
			include: {
				company_role_labels: {
					select: {
						roleId: true,
						label: true,
					},
				},
			},
		});
		if (!record || !record.id)
			throw new AppError(COMPANY_NOT_FOUND, HttpStatus.NOT_FOUND);
		return record;
	}

	async createCompany() {
		const { body, user } = this.req;

		const {
			name,
			industry,
			email,
			adminFirstName,
			adminLastName,
			isTaxable,
			joinDate,
			establishedDate,
		} = body;

		body.logo = this.req.file ? this.req.file.filename : null;
		const company = await prisma.companies.create({
			data: {
				name,
				industry,
				createdBy: user.id,
				isTaxable,
				joinDate,
				establishedDate,
				logo: body.logo,
			},
		});

		const hashedPassword = await bcrypt.hash('123456', 12);

		const admin = await prisma.users.create({
			data: {
				firstName: adminFirstName,
				lastName: adminLastName,
				companyId: company.id,
				email: email,
				password: hashedPassword,
				role: 2,
				createdBy: user.id,
			},
		});

		const updatedCompany = await prisma.companies.update({
			where: { id: company.id },
			data: { primaryContactId: admin.id },
		});

		await prisma.users_companies.create({
			data: {
				userId: admin.id,
				companyId: company.id,
				role_id: 2,
			},
		});

		const defaultMetrics = await prisma.metrics.findMany({
			where: { isDefault: true },
		});

		if (defaultMetrics.length > 0) {
			await prisma.company_metric.createMany({
				data: defaultMetrics.map(metric => ({
					companyId: company.id,
					metricId: metric.id,
				})),
			});
		}

		const mailOptions = {
			to: admin.email,
			subject: 'You are invited to join the platform',
			text: 'Admin has created an account for you',
			html: `<p>Admin has created an account for you. Your credentials are: <br> Email: ${admin.email}<br> Password: 123456</p>`,
		};

		sendEmail(mailOptions);

		return { company: updatedCompany };
	}

	async updateCompany() {
		const { id } = this.req.params;
		const { body, user } = this.req;

		const {
			name,
			industry,
			adminEmail,
			adminFirstName,
			adminLastName,
			adminPhone,
			adminPassword,
		} = body;

		const company = await prisma.companies.update({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			data: {
				name,
				industry,
				primaryContactId: user.id,
			},
		});

		const hashedPassword = await bcrypt.hash(adminPassword, 12);

		const primaryContact = await prisma.users.findFirst({
			where: {
				companyId: company.id,
				role: 2,
			},
		});

		if (primaryContact) {
			await prisma.users.update({
				where: { id: primaryContact.id },
				data: {
					firstName: adminFirstName,
					lastName: adminLastName,
					email: adminEmail,
					phone: adminPhone,
					password: hashedPassword,
				},
			});
		}

		return company;
	}

	async deleteCompany() {
		const { id } = this.req.params;

		await prisma.companies.update({
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

	async deleteManyCompany() {
		const { ids } = this.req.body;

		await prisma.companies.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				deleted: true,
			},
		});

		return null;
	}

	async addCompany() {
		const { body, user } = this.req;

		body.logo = this.req.file ? this.req.file.filename : null;

		return await prisma.$transaction(async tx => {
			const company = await tx.companies.create({
				data: {
					...body,
					createdBy: user.id,
				},
			});

			const defaultMetrics = await tx.metrics.findMany({
				where: { isDefault: true },
			});

			if (defaultMetrics.length > 0) {
				await tx.company_metric.createMany({
					data: defaultMetrics.map(metric => ({
						companyId: company.id,
						metricId: metric.id,
					})),
				});
			}

			return { company };
		});
	}

	async companyUpdate() {
		const { body } = this.req;
		const { id } = this.req.params;
		const { roleLabels, ...companyData } = body;

		if (this.req.file?.filename) {
			companyData.logo = this.req.file.filename;
		} else if (!companyData.logo) {
			companyData.logo = null;
		}

		const result = await prisma.$transaction(async prisma => {
			const oldRoleLabels = await prisma.company_role_labels.findMany({
				where: {
					companyId: parseInt(id, 10),
				},
			});

			const company = await prisma.companies.update({
				where: {
					id: parseInt(id, 10),
					deleted: false,
				},
				data: {
					...companyData,
				},
			});

			if (roleLabels && Array.isArray(roleLabels)) {
				await prisma.company_role_labels.deleteMany({
					where: {
						companyId: company.id,
					},
				});

				if (roleLabels.length > 0) {
					await prisma.company_role_labels.createMany({
						data: roleLabels.map(({ roleId, label }) => ({
							companyId: company.id,
							roleId: parseInt(roleId, 10),
							label: (label || '').toString().trim(),
						})),
					});
				}
			}

			for (const oldRole of oldRoleLabels) {
				const newRole = roleLabels.find(
					r => parseInt(r.roleId, 10) === oldRole.roleId,
				);

				if (newRole && newRole.label !== oldRole.label) {
					await prisma.metrics.updateMany({
						where: {
							role: oldRole.roleId,
							roleLabel: oldRole.label,
						},
						data: {
							roleLabel: newRole.label,
						},
					});
				}
			}

			const updatedCompany = await prisma.companies.findUnique({
				where: { id: company.id },
				include: {
					company_role_labels: {
						select: {
							id: true,
							companyId: true,
							roleId: true,
							label: true,
							created_at: true,
							updated_at: true,
						},
					},
				},
			});

			return { company: updatedCompany };
		});

		return result;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getIndustries() {
		const allRecords = await prisma.industries.findMany({
			where: {
				deleted: false,
			},
		});
		return allRecords;
	}

	async getCompanyUsers() {
		const { id } = this.req.params;
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, roleId, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100;

		const options = {
			where: {
				deleted: false,
				companyId: parseInt(id, 10),
				roles: {
					id: {
						gt: roleId,
					},
				},
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				image: true,
				address: true,
				createdAt: true,
				roles: {
					select: {
						id: true,
						name: true,
					},
				},
				status: true,
			},
		};

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'name') {
					return {
						OR: [
							{ firstName: { contains: search[key] } },
							{ lastName: { contains: search[key] } },
						],
					};
				}
				return { [key]: { contains: search[key] } };
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

		const totalCount = await prisma.users.count({
			where: options.where,
		});

		if (totalCount === 0) {
			return {
				records: [],
				totalRecords: 0,
				totalPages: 0,
				query,
			};
		}

		const totalPages = Math.ceil(totalCount / limit);

		options.skip = (page - 1) * limit;
		options.take = limit;

		const allRecords = await prisma.users.findMany(options);

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(
				'No users found for the given company.',
				HttpStatus.NOT_FOUND,
			);

		const userRole = [...new Set(allRecords.map(user => user.roles.id))];

		const metrics = await prisma.metrics.findMany({
			where: {
				deleted: false,
				companyId: parseInt(id, 10),
				roles: {
					in: userRole,
				},
			},
			select: {
				salesTarget: true,
				roles: true,
			},
		});

		const metricsByRole = metrics.reduce((acc, metric) => {
			acc[metric.roles] = metric.salesTarget;
			return acc;
		}, {});

		const updatedRecords = allRecords.map(user => {
			return {
				...user,
				salesTarget: metricsByRole[user.roles.id] || null,
			};
		});

		return {
			records: updatedRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}
}
