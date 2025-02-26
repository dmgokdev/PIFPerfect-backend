import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import { DASHBOARD_FETCHED_SUCCESS } from '../constants';
import { DashboardService } from '../services';
import { successResponse } from '../utils';

export const getDashboard = asyncHandler(async (req, res) => {
	const dashboardService = new DashboardService(req);
	const data = await dashboardService.mainDashboard();

	return successResponse(res, HttpStatus.OK, DASHBOARD_FETCHED_SUCCESS, data);
});
