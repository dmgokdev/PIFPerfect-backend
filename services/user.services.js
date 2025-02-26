import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import {
	USER_NOT_FOUND,
	ACCOUNT_STATUS,
	OLD_PASSWORD_NOT_MATCHED,
	OLD_PASSWORD_REQUIRED,
} from '../constants';
import { AppError } from '../errors';
import { getAllSecurityLogs, validateRoleCreation, sendEmail } from '../utils';

const prisma = new PrismaClient();

export class UserService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getAllUsers() {
		const { query } = this.req;

		/* eslint-disable-next-line prefer-const */
		let { page, limit, sort, companyId, searchInput, sales_rep, ...search } = query;

		page = parseInt(page, 10) || 1;
		limit = parseInt(limit, 10) || 100000;

		const options = {
			where: {
				deleted: false,
				NOT: {
					role: 1,
				},
			},
		};

		if (companyId) {
			options.where.companyId = Number(companyId);
		}

		if (sales_rep) {
			options.where.users_companies = {
				some: {
					roles: {
						id: {
							in: [4, 5],
						},
					},
				},
			};
		}

		if (search) {
			options.where.AND = Object.keys(search).map(key => {
				if (key === 'status') {
					return {
						[key]: search[key] === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
					};
				}
				if (key === 'role') {
					return {
						users_companies: {
							role_id: Number(search[key]),
						},
					};
				}
				if (key === 'userId') {
					return {
						id: parseInt(search[key], 10),
					}
				}
				return {
					[key]: { contains: search[key] },
				};
			});
		}

		if (searchInput) {
			options.where.OR = [
				{
					AND: [
						{ firstName: { contains: searchInput.split(' ')[0] } },
						{ lastName: { contains: searchInput.split(' ')[1] || '' } },
					],
				},
				{
					firstName: { contains: searchInput },
				},
				{
					lastName: { contains: searchInput },
				},
				{
					email: { contains: searchInput },
				},
			];
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
		options.select = {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			image: true,
			status: true,
			createdAt: true,
			updatedAt: true,
			lastLogin: true,
			roles: {
				select: {
					name: true,
				},
			},
			company: {
				select: {
					name: true,
				},
			},
			users_companies: {
				select: {
					companies: {
						select: {
							id: true,
							name: true,
						},
					},
					roles: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		};

		const allRecords = await prisma.users.findMany(options);

		const transformedRecords = allRecords.map(record => {
			const { roles, users_companies, company, ...rest } = record;

			const companies = users_companies
				.filter(uc => !sales_rep || (uc.roles.id === 4 || uc.roles.id === 5))
				.map(uc => ({
					companyId: uc.companies.id,
					companyName: uc.companies.name,
					roleId: uc.roles.id,
					roleName: uc.roles.name,
				}));

			return {
				...rest,
				company: company?.name || null,
				role: roles?.name || null,
				companiesCount: companies.length || 0,
				companies,
			};
		});

		if (!allRecords || !Array.isArray(allRecords) || allRecords.length === 0)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		return {
			records: transformedRecords,
			totalRecords: totalCount,
			totalPages,
			query,
		};
	}

	async getUser() {
		const { id } = this.req.params;
		const record = await prisma.users.findFirst({
			where: {
				deleted: false,
				id: parseInt(id, 10),
			},
			include: {
				users_companies: {
					include: {
						companies: {
							select: {
								id: true,
								name: true,
							},
						},
						roles: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				},
			},
		});
		return this.publicProfile(record);
	}

	async createUser() {
		const { body, user } = this.req;

		body.image = this.req.file ? this.req.file.filename : null;

		await validateRoleCreation(user.role, body.role);

		body.password = await bcrypt.hash('123456', 12);
		body.status = ACCOUNT_STATUS.ACTIVE;
		body.createdBy = user.id;

		const { companyRoles, ...userData } = body;

		let primaryCompanyId = null;
		let primaryRoleId = null;

		if (companyRoles && companyRoles.length > 0) {
			const highestRole = companyRoles.reduce((prev, curr) =>
				curr.role < prev.role ? curr : prev,
			);
			primaryCompanyId = highestRole.companyId;
			primaryRoleId = highestRole.role;
		}

		if (primaryCompanyId && primaryRoleId) {
			userData.companyId = primaryCompanyId;
			userData.role = primaryRoleId;
		} else {
			throw new AppError(
				'No valid companyRoles provided',
				HttpStatus.BAD_REQUEST,
			);
		}

		const newUser = await prisma.$transaction(async prisma => {
			const createdUser = await prisma.users.create({
				data: userData,
			});

			if (companyRoles && companyRoles.length > 0) {
				for (const companyRole of companyRoles) {
					await prisma.users_companies.create({
						data: {
							userId: createdUser.id,
							companyId: companyRole.companyId,
							role_id: companyRole.role,
						},
					});
				}
			}

			return {
				...createdUser,
				companyRoles,
			};
		});

		const mailOptions = {
			to: newUser.email,
			subject: 'You are invited to join the platform',
			text: 'Admin has created an account for you',
			html: `<p>Admin has created an account for you. Your credentials are: <br> Email: ${newUser.email}<br> Password: 123456</p>`,
		};

		await sendEmail(mailOptions);

		return this.publicProfile(newUser);
	}

	async updateUser() {
		const { id } = this.req.params;
		const { body } = this.req;
		const { password, oldPassword, reason, companyRoles } = body;

		if (this.req.file?.filename) {
			body.image = this.req.file.filename;
		} else {
			body.image = null;
		}

		if (password) {
			if (!oldPassword) {
				throw new AppError(OLD_PASSWORD_REQUIRED, HttpStatus.BAD_REQUEST);
			}

			const existingUser = await prisma.users.findFirst({
				where: {
					id: parseInt(id, 10),
				},
				select: {
					password: true,
				},
			});

			const isPasswordValid = await bcrypt.compare(
				oldPassword,
				existingUser.password,
			);
			if (!isPasswordValid) {
				throw new AppError(OLD_PASSWORD_NOT_MATCHED, HttpStatus.UNAUTHORIZED);
			}

			body.password = await bcrypt.hash(password, 12);
		}

		const {
			reason: _,
			oldPassword: __,
			companyRoles: ___,
			...updatedData
		} = body;
		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(id, 10),
				deleted: false,
			},
			data: updatedData,
		});

		if (companyRoles && companyRoles.length > 0) {
			const deletedRecords = await prisma.users_companies.deleteMany({
				where: {
					userId: updateRecord.id,
				},
			});

			console.log('deletedRecords', deletedRecords);
			await prisma.users_companies.createMany({
				data: companyRoles.map(companyRole => ({
					userId: updateRecord.id,
					companyId: companyRole.companyId,
					role_id: companyRole.role,
				})),
			});
		}

		if (body.companyId || body.role) {
			await prisma.users_companies.update({
				where: {
					userId_companyId: {
						userId: updateRecord.id,
						companyId: body.companyId,
					},
				},
				data: {
					role_id: body.role,
					companyId: body.companyId,
				},
			});
		}
		if (reason) {
			await prisma.user_meta.create({
				data: {
					user_id: updateRecord.id,
					key: 'password_reset',
					value: reason,
				},
			});
		}

		return this.publicProfile({
			...updateRecord,
			companyRoles,
		});
	}

	async updateManyUser() {
		const { ids, status } = this.req.body;

		const updateRecord = await prisma.users.updateMany({
			where: {
				id: {
					in: ids,
				},
			},
			data: {
				status,
			},
		});

		return updateRecord;
	}

	async deleteUser() {
		const { id } = this.req.params;

		await prisma.users.update({
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

	async deleteManyUser() {
		const { ids } = this.req.body;

		await prisma.users.updateMany({
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

	/* eslint-disable-next-line class-methods-use-this */
	async getSecurityLogs() {
		try {
			const securityLogs = await getAllSecurityLogs(prisma);

			return securityLogs;
		} catch (error) {
			return error;
		}
	}

	/* eslint-disable-next-line class-methods-use-this */
	publicProfile(user) {
		const record = { ...user };
		if (!record || !record.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (record.password) delete record.password;
		if (record.remember_token) delete record.remember_token;

		return record;
	}
}
