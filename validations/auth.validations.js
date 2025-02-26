import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	INVALID_EMAIL,
	PASSWORD_MIN_LENGTH,
	EMAIL_EXISTS,
	REQUIRED_FIELDS,
	ALL_ROLES,
	ALL_STATUS,
	INVALID_ROLE,
	USER_NOT_FOUND,
	INVALID_STATUS,
	GET_USER_QUERY_SCHEMA_CONFIG,
	NEW_PASSWORD_MIN_LENGTH,
	PASSWORD_NOT_MATCHED,
	ROLE_NOT_FOUND,
	COMPANY_NOT_FOUND,
} from '../constants';
import { createQueryParamsSchema } from '../utils';

const prisma = new PrismaClient();

export const loginSchema = yup.object().shape({
	body: yup.object().shape({
		email: yup.string().email(INVALID_EMAIL).required(),
		password: yup
			.string()
			.required(REQUIRED_FIELDS)
			.min(6, PASSWORD_MIN_LENGTH),
	}),
});

export const getUsersSchema = yup.object({
	query: createQueryParamsSchema(GET_USER_QUERY_SCHEMA_CONFIG),
});

export const registerSchema = yup.object({
	body: yup.object({
		firstName: yup.string().required(REQUIRED_FIELDS),
		lastName: yup.string().required(REQUIRED_FIELDS),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		password: yup.string().required().min(6),
		companyId: yup.number().notRequired(),
		phone: yup.string().notRequired(),
	}),
});

export const brandRegisterSchema = yup.object({
	body: yup.object({
		name: yup.string().required(REQUIRED_FIELDS),
		number: yup.string().notRequired(REQUIRED_FIELDS),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findUnique({
						where: {
							deleted: false,
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		role: yup.string().required(REQUIRED_FIELDS).oneOf(ALL_ROLES, INVALID_ROLE),
		address: yup.string().notRequired(),
		city: yup.string().notRequired(),
		state: yup.string().notRequired(),
		country: yup.string().notRequired(),
	}),
});

export const verifySchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		otp: yup.string().min(4).max(4).required(REQUIRED_FIELDS),
	}),
});

export const userIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resendOTPSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	query: yup.object({
		type: yup.string().notRequired(),
	}),
});

export const updateUserSchema = yup.object({
	body: yup.object({
		firstName: yup.string().notRequired(),
		lastName: yup.string().notRequired(),
		password: yup.string().notRequired().min(6),
		phone: yup.string().notRequired(),
		companyId: yup.number().notRequired(),
		language: yup.string().notRequired(),
		region: yup.string().notRequired(),
		country: yup.string().notRequired(),
		state: yup.string().notRequired(),
		city: yup.string().notRequired(),
		address: yup.string().notRequired(),
		zipCode: yup.number().notRequired(),
		pushNotification: yup.boolean().notRequired(),
		status: yup.string().notRequired().oneOf(ALL_STATUS, INVALID_STATUS),
		isBlocked: yup.boolean().notRequired(),
		reason: yup.string().notRequired(),
		oldPassword: yup.string().notRequired(),
		role: yup.number().notRequired(),
		companyId: yup.number().notRequired(),
		timezone: yup.string().notRequired(),
		companyRoles: yup
			.array()
			.of(
				yup.object({
					companyId: yup
						.number()
						.notRequired()
						.test({
							name: 'valid-company',
							message: COMPANY_NOT_FOUND,
							async test(value) {
								if (!value) return true;
								const record = await prisma.companies.findFirst({
									where: {
										id: value,
									},
								});
								return record !== null;
							},
						}),
					role: yup
						.number()
						.notRequired()
						.test({
							name: 'valid-role',
							message: ROLE_NOT_FOUND,
							async test(value) {
								if (!value) return true;
								const record = await prisma.roles.findFirst({
									where: {
										id: value,
									},
								});
								return record !== null;
							},
						}),
				}),
			)
			.notRequired(),
	}),
	file: yup.mixed(),
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const updateManyUserSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
		status: yup
			.string()
			.required(REQUIRED_FIELDS)
			.oneOf(ALL_STATUS, INVALID_STATUS),
	}),
});

export const forgotSchema = yup.object({
	body: yup.object({
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							email: value,
							// status: {
							// 	not: 'BLOCKED',
							// },
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
});

export const resetSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('User ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: USER_NOT_FOUND,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							deleted: false,
							id: parseInt(value, 10),
							status: {
								not: 'BLOCKED',
							},
						},
					});
					return !record || !record.id ? Boolean(0) : Boolean(1);
				},
			}),
	}),
	body: yup.object({
		password: yup.string().required(REQUIRED_FIELDS).min(6),
	}),
});

export const deleteUsersSchema = yup.object({
	body: yup.object({
		ids: yup.array().required(REQUIRED_FIELDS),
	}),
});

export const changePasswordSchema = yup.object({
	body: yup.object({
		oldPassword: yup.string().required(REQUIRED_FIELDS),
		newPassword: yup
			.string()
			.required(REQUIRED_FIELDS)
			.min(6, NEW_PASSWORD_MIN_LENGTH),
		retypePassword: yup
			.string()
			.required(REQUIRED_FIELDS)
			.oneOf([yup.ref('newPassword')], PASSWORD_NOT_MATCHED),
	}),
});

export const createUserSchema = yup.object({
	body: yup.object({
		firstName: yup.string().required(REQUIRED_FIELDS),
		lastName: yup.string().required(REQUIRED_FIELDS),
		email: yup
			.string()
			.email(INVALID_EMAIL)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: EMAIL_EXISTS,
				async test(value) {
					const record = await prisma.users.findFirst({
						where: {
							email: value,
						},
					});
					return !record || !record.id ? Boolean(1) : Boolean(0);
				},
			}),
		companyRoles: yup
			.array()
			.of(
				yup.object({
					companyId: yup
						.number()
						.required(REQUIRED_FIELDS)
						.test({
							name: 'valid-company',
							message: COMPANY_NOT_FOUND,
							async test(value) {
								const record = await prisma.companies.findFirst({
									where: {
										id: value,
									},
								});
								return record !== null;
							},
						}),
					role: yup
						.number()
						.required(REQUIRED_FIELDS)
						.test({
							name: 'valid-role',
							message: ROLE_NOT_FOUND,
							async test(value) {
								const record = await prisma.roles.findFirst({
									where: {
										id: value,
									},
								});
								return record !== null;
							},
						}),
				}),
			)
			.required(REQUIRED_FIELDS)
			.min(1, 'At least one company role must be provided'),
		country: yup.string().notRequired(),
		city: yup.string().notRequired(),
		address: yup.string().notRequired(),
		phone: yup.string().notRequired(),
		timezone: yup.string().notRequired(),
	}),
	file: yup.mixed().notRequired(),
});
