export const ROLE_HIERARCHY = {
	super_admin: 1,
	company_admin: 2,
	sales_manager: 3,
	closer: 4,
	setter: 5,
};

export const validateRoleCreation = async (creatorRoleId, newUserRoleId) => {
	if (creatorRoleId >= newUserRoleId) {
		throw new Error(
			'You do not have permission to create a user with this role',
		);
	}
};
