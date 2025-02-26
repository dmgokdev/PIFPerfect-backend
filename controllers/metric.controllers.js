import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	METRIC_CREATED_SUCCESS,
	GET_METRIC_SUCCESS,
	METRIC_UPDATED_SUCCESS,
	METRIC_DELETED_SUCCESS,
	ASSIGN_METRIC_SUCCESS,
} from '../constants';
import { MetricService, CompanyMetricService } from '../services';
import { successResponse } from '../utils';

export const createMetric = asyncHandler(async (req, res) => {
	const metricService = new MetricService(req);
	const data = await metricService.createMetric();

	return successResponse(res, HttpStatus.OK, METRIC_CREATED_SUCCESS, data);
});

export const getAllMetrics = asyncHandler(async (req, res) => {
	const metricService = new MetricService(req);
	const data = await metricService.getAllMetrics();

	return successResponse(res, HttpStatus.OK, GET_METRIC_SUCCESS, data);
});

export const updateMetirc = asyncHandler(async (req, res) => {
	const metricService = new MetricService(req);
	const data = await metricService.updateMetric();

	return successResponse(res, HttpStatus.OK, METRIC_UPDATED_SUCCESS, data);
});

export const deleteMetric = asyncHandler(async (req, res) => {
	const metricService = new MetricService(req);
	const data = await metricService.deleteMetric();

	return successResponse(res, HttpStatus.OK, METRIC_DELETED_SUCCESS, data);
});

export const getMetric = asyncHandler(async (req, res) => {
	const metricService = new MetricService(req);
	const data = await metricService.getMetric();

	return successResponse(res, HttpStatus.OK, GET_METRIC_SUCCESS, data);
});

export const assignMetrics = asyncHandler(async (req, res) => {
	const companyMetricService = new CompanyMetricService(req);
	const data = await companyMetricService.assignMetrics();

	return successResponse(res, HttpStatus.OK, ASSIGN_METRIC_SUCCESS, data);
});

export const getCompanyMetrics = asyncHandler(async (req, res) => {
	const companyMetricService = new CompanyMetricService(req);
	const data = await companyMetricService.getCompanyMetrics();

	return successResponse(res, HttpStatus.OK, GET_METRIC_SUCCESS, data);
});

export const updateCompanyMetric = asyncHandler(async (req, res) => {
	const companyMetricService = new CompanyMetricService(req);
	const data = await companyMetricService.updateCompanyMetric();

	return successResponse(res, HttpStatus.OK, METRIC_UPDATED_SUCCESS, data);
});
