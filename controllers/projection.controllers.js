import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	PROJECTION_CREATED_SUCCESS,
	GET_PROJECTION_SUCCESS,
	PROJECTION_UPDATED_SUCCESS,
	PROJECTION_DELETED_SUCCESS,
} from '../constants';
import { ProjectionService } from '../services';
import { successResponse } from '../utils';

export const createProjection = asyncHandler(async (req, res) => {
	const projectionService = new ProjectionService(req);
	const data = await projectionService.createProjection();

	return successResponse(res, HttpStatus.OK, PROJECTION_CREATED_SUCCESS, data);
});

export const getAllProjections = asyncHandler(async (req, res) => {
	const projectionService = new ProjectionService(req);
	const data = await projectionService.getAllProjections();

	return successResponse(res, HttpStatus.OK, GET_PROJECTION_SUCCESS, data);
});

export const updateProjection = asyncHandler(async (req, res) => {
	const projectionService = new ProjectionService(req);
	const data = await projectionService.updateProjection();

	return successResponse(res, HttpStatus.OK, PROJECTION_UPDATED_SUCCESS, data);
});

export const getProjection = asyncHandler(async (req, res) => {
	const projectionService = new ProjectionService(req);
	const data = await projectionService.getProjections();

	return successResponse(res, HttpStatus.OK, GET_PROJECTION_SUCCESS, data);
});

export const deleteProjection = asyncHandler(async (req, res) => {
	const projectionService = new ProjectionService(req);
	const data = await projectionService.deleteProjection();

	return successResponse(res, HttpStatus.OK, PROJECTION_DELETED_SUCCESS, data);
});
