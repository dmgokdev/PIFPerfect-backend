export const createSecurityLog = async (prisma, data) => {
	if (!data.type || !data.description) {
		throw new Error(
			'Type and description are required to create a security log',
		);
	}

	const securityLog = await prisma.security_log.create({
		data: {
			type: data.type,
			description: data.description,
			userId: data.userId || null,
			location: data.location || null,
			device: data.device || null,
			status: data.status || 'SUCCESS',
		},
	});
	return securityLog;
};

export const getAllSecurityLogs = async (prisma = {}) => {
	const securityLogs = await prisma.security_logs.findMany();

	return {
		securityLogs,
	};
};
