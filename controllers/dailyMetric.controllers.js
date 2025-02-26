import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	DAILY_METRIC_CREATED_SUCCESS,
	GET_DAILY_METRIC_SUCCESS,
	DAILY_METRIC_UPDATED_SUCCESS,
	DAILY_METRIC_DELETED_SUCCESS,
} from '../constants';
import { DailyMetricService } from '../services';
import { successResponse } from '../utils';

export const createDailyMetric = asyncHandler(async (req, res) => {
	const dailyMetricService = new DailyMetricService(req);
	const data = await dailyMetricService.createDailyMetric();

	return successResponse(
		res,
		HttpStatus.OK,
		DAILY_METRIC_CREATED_SUCCESS,
		data,
	);
});

export const getAllDailyMetrics = asyncHandler(async (req, res) => {
	const dailyMetricService = new DailyMetricService(req);
	const data = await dailyMetricService.getAllDailyMetrics();

	return successResponse(res, HttpStatus.OK, GET_DAILY_METRIC_SUCCESS, data);
});

export const updateDailyMetirc = asyncHandler(async (req, res) => {
	const dailyMetricService = new DailyMetricService(req);
	const data = await dailyMetricService.updateDailyMetric();

	return successResponse(
		res,
		HttpStatus.OK,
		DAILY_METRIC_UPDATED_SUCCESS,
		data,
	);
});

export const getDailyMetric = asyncHandler(async (req, res) => {
	const dailyMetricService = new DailyMetricService(req);
	const data = await dailyMetricService.getDailyMetric();

	return successResponse(res, HttpStatus.OK, GET_DAILY_METRIC_SUCCESS, data);
});

export const deleteDailyMetric = asyncHandler(async (req, res) => {
	const dailyMetricService = new DailyMetricService(req);
	const data = await dailyMetricService.deleteDailyMetric();

	return successResponse(
		res,
		HttpStatus.OK,
		DAILY_METRIC_DELETED_SUCCESS,
		data,
	);
});
