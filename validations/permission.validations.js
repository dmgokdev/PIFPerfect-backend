import { PrismaClient } from '@prisma/client';
import yup from 'yup';

import {
	REQUIRED_FIELDS,
	ROLE_NOT_FOUND,
	PERMISSIONS_EXISTS,
	PERMISSION_NOT_FOUND,
} from '../constants';

const prisma = new PrismaClient();

export const assignPermissionSchema = yup.object({
	body: yup.object({
		roleId: yup
			.number()
			.required(REQUIRED_FIELDS)
			.test(ROLE_NOT_FOUND, async value => {
				const role = await prisma.roles.findUnique({
					where: { id: value },
				});
				return role !== null;
			}),
		permissions: yup.array().required(REQUIRED_FIELDS),
	}),
});

export const roleIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Role ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: ROLE_NOT_FOUND,
				async test(value) {
					const record = await prisma.roles.findFirst({
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

export const addPermissionSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				name: 'unique-name',
				message: PERMISSIONS_EXISTS,
				async test(value) {
					if (!value) return false;
					const record = await prisma.permissions.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		categoryId: yup.number().required(REQUIRED_FIELDS),
		slug: yup
			.string()
			.required(REQUIRED_FIELDS)
			.test({
				slug: 'unique-slug',
				message: PERMISSIONS_EXISTS,
				async test(value) {
					if (!value) return false;
					const record = await prisma.permissions.findFirst({
						where: { slug: value },
					});
					return !record;
				},
			}),
	}),
});

export const updatePermissionSchema = yup.object({
	body: yup.object({
		name: yup
			.string()
			.notRequired()
			.test({
				name: 'unique-name',
				message: PERMISSIONS_EXISTS,
				async test(value) {
					if (!value) return true;
					const record = await prisma.permissions.findFirst({
						where: { name: value },
					});
					return !record;
				},
			}),
		categoryId: yup.number().notRequired(),
		slug: yup
			.string()
			.notRequired()
			.test({
				slug: 'unique-slug',
				message: PERMISSIONS_EXISTS,
				async test(value) {
					if (!value) return true;
					const record = await prisma.permissions.findFirst({
						where: { slug: value },
					});
					return !record;
				},
			}),
	}),
	params: yup.object({
		id: yup
			.number()
			.integer('Permission ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PERMISSION_NOT_FOUND,
				async test(value) {
					const record = await prisma.permissions.findUnique({
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

export const permissionIdSchema = yup.object({
	params: yup.object({
		id: yup
			.number()
			.integer('Permission ID must be an integer.')
			.max(99999999999)
			.required(REQUIRED_FIELDS)
			.test({
				name: 'valid-form',
				message: PERMISSION_NOT_FOUND,
				async test(value) {
					const record = await prisma.permissions.findUnique({
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
