import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status-codes';

import {
	INVALID_CREDENTIALS,
	USER_NOT_FOUND,
	ACCOUNT_STATUS,
} from '../constants';
import { AppError } from '../errors';
import { createAccessToken, createOtpToken, sendEmail } from '../utils';

const prisma = new PrismaClient();

export class AuthService {
	constructor(req) {
		this.req = req;
	}

	async login() {
		const { email, password } = this.req.body;

		const user = await prisma.users.findFirst({
			where: {
				email,
			},
			include: {
				users_companies: {
					select: {
						role_id: true,
						companies: {
							select: {
								id: true,
								name: true,
								currencySymbol: true,
							},
						},
					},
				},
			},
		});

		if (!user || !user.id)
			throw new AppError(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid)
			throw new AppError(INVALID_CREDENTIALS, HttpStatus.BAD_REQUEST);

		await prisma.auth_log.create({
			data: {
				user_id: user.id,
				type: 'login',
			},
		});

		await prisma.users.update({
			where: {
				id: user.id,
			},
			data: {
				lastLogin: new Date(),
			},
		});

		const companies = user.users_companies.map(uc => ({
			id: uc.companies.id,
			name: uc.companies.name,
			currencySymbol: uc.companies.currencySymbol,
			roleId: uc.role_id,
		}));

		delete user.users_companies;

		return {
			token: createAccessToken({ id: user.id }),
			companies,
			...user,
		};
	}

	async register() {
		const { body } = this.req;
		const { password } = body;

		body.password = await bcrypt.hash(password, 12);

		const user = await prisma.users.create({
			data: {
				status: ACCOUNT_STATUS.ACTIVE,
				role: 2,
				...body,
			},
		});

		return {
			token: createAccessToken({ id: user.id }),
			...user,
		};
	}

	async getLoggedInUser() {
		const { user } = this.req;
		return this.publicProfile(user);
	}

	async OtpVerify() {
		const { type } = this.req;
		const { id } = this.req.params;
		let updateData;
		let rememberToken;
		let updateRecord;

		if (type === 'reset') {
			rememberToken = createOtpToken({ userId: id, type });
			updateData = { remember_token: rememberToken };
		} else {
			updateData = { status: ACCOUNT_STATUS.ACTIVE, remember_token: null };
		}

		updateRecord = await prisma.users.update({
			where: { id: parseInt(id, 10) },
			data: updateData,
		});
		updateRecord = this.publicProfile(updateRecord);

		if (type === 'reset' && rememberToken) {
			updateRecord.resetToken = rememberToken;
		}

		return updateRecord;
	}

	async ResendOTP() {
		const { id } = this.req.params;
		const { query } = this.req;
		const type = query?.type && query.type === 'reset' ? 'reset' : 'verify';

		const updateRecord = await this.createOTP(id, type);

		return this.publicProfile(updateRecord);
	}

	// eslint-disable-next-line class-methods-use-this
	async createOTP(userID, type = 'verify') {
		const OTP = Math.floor(1000 + Math.random() * 9000);

		const rememberToken = createOtpToken({ userId: userID, OTP, type });
		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(userID, 10),
			},
			data: {
				remember_token: rememberToken,
			},
		});

		const mailOptions = {
			to: updateRecord.email,
			subject: 'OTP',
			text: 'Your One Time Password',
			html: `<p>Your one time password is ${OTP}.</p>`,
		};

		sendEmail(mailOptions);

		// updateRecord.OTP = OTP;

		return updateRecord;
	}

	async ForgotPassword() {
		const { email } = this.req.body;

		const record = await prisma.users.findFirst({
			where: {
				deleted: false,
				email,
			},
		});

		const updateRecord = await this.createOTP(record.id, 'reset');

		return this.publicProfile(updateRecord);
	}

	async ResetPassword() {
		const { id } = this.req.params;
		const { password } = this.req.body;

		const passwordHash = await bcrypt.hash(password, 12);

		const updateRecord = await prisma.users.update({
			where: {
				id: parseInt(id, 10),
			},
			data: {
				password: passwordHash,
				remember_token: null,
			},
		});

		return this.publicProfile(updateRecord);
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

	async changePassword() {
		const { oldPassword, newPassword } = this.req.body;
		const userId = this.req.user.id;

		const user = await prisma.users.findUnique({
			where: { id: userId, deleted: false },
		});

		if (!user) {
			throw new Error('User not found.');
		}

		const isOldPasswordCorrect = await bcrypt.compare(
			oldPassword,
			user.password,
		);
		if (!isOldPasswordCorrect) {
			throw new Error('Old password is incorrect.');
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await prisma.users.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});

		return null;
	}

	/* eslint-disable-next-line class-methods-use-this */
	async getRoles() {
		const allRecords = await prisma.roles.findMany({
			where: {
				deleted: false,
			},
		});
		return allRecords;
	}
}
