import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PermissionService {
	constructor(req) {
		this.req = req;
		this.body = req.body;
	}

	async assignPermissions() {
		const { roleId, permissions } = this.req.body;

		try {
			const permissionRecords = await prisma.permissions.findMany({
				where: {
					id: {
						in: permissions,
					},
				},
			});

			if (permissionRecords.length !== permissions.length) {
				return { error: 'Some permissions were not found' };
			}

			await prisma.role_permissions.deleteMany({
				where: {
					role_id: roleId,
				},
			});

			await prisma.role_permissions.createMany({
				data: permissions.map(permissionId => ({
					role_id: roleId,
					permission_id: permissionId,
				})),
			});

			const updatedRole = await prisma.roles.findUnique({
				where: { id: roleId },
				include: {
					role_permissions: {
						include: {
							permission: true,
						},
					},
				},
			});

			return {
				permissions: updatedRole.role_permissions.map(rp => rp.permission),
			};
		} catch (error) {
			return { error: 'An error occurred while assigning permissions' };
		}
	}

	async getPermissions() {
		const { id } = this.req.params;

		const allPermissions = await prisma.categories.findMany({
			include: {
				permissions: {
					include: {
						role_permissions: {
							where: {
								role_id: parseInt(id, 10),
							},
						},
					},
				},
			},
		});

		const role = await prisma.roles.findUnique({
			where: {
				id: parseInt(id, 10),
			},
		});

		if (!role) {
			return { error: 'Role not found' };
		}

		return {
			allPermissions: allPermissions,
		};
	}

	async addPermission() {
		const { body } = this.req;

		try {
			const permissions = await prisma.permissions.create({
				data: {
					...body,
				},
			});
			return {
				permissions,
			};
		} catch (error) {
			throw new Error('Failed to create permission');
		}
	}

	async updatePermission() {
		try {
			const { id } = this.req.params;
			const { body } = this.req;

			const updateRecord = await prisma.permissions.update({
				where: {
					deleted: false,
					id: parseInt(id, 10),
				},
				data: body,
			});

			return updateRecord;
		} catch (error) {
			throw new Error('Failed to update permission');
		}
	}

	async deletePermission() {
		const { id } = this.req.params;

		await prisma.permissions.update({
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
