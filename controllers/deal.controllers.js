import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	DEAL_CREATED_SUCCESS,
	DEAL_UPDATED_SUCCESS,
	GET_DEAL_SUCCESS,
	DEAL_DELETED_SUCCESS,
} from '../constants';
import { DealService } from '../services';
import { successResponse } from '../utils';

export const createDeal = asyncHandler(async (req, res) => {
	const dealService = new DealService(req);
	const data = await dealService.createDeals();

	return successResponse(res, HttpStatus.OK, DEAL_CREATED_SUCCESS, data);
});

export const getAllDeals = asyncHandler(async (req, res) => {
	const dealService = new DealService(req);
	const data = await dealService.getAllDeals();

	return successResponse(res, HttpStatus.OK, GET_DEAL_SUCCESS, data);
});

export const updateDeal = asyncHandler(async (req, res) => {
	const dealService = new DealService(req);
	const data = await dealService.updateDeal();

	return successResponse(res, HttpStatus.OK, DEAL_UPDATED_SUCCESS, data);
});

export const getDeal = asyncHandler(async (req, res) => {
	const dealService = new DealService(req);
	const data = await dealService.getDeal();

	return successResponse(res, HttpStatus.OK, GET_DEAL_SUCCESS, data);
});

export const deleteDeal = asyncHandler(async (req, res) => {
	const dealService = new DealService(req);
	const data = await dealService.deleteDeal();

	return successResponse(res, HttpStatus.OK, DEAL_DELETED_SUCCESS, data);
});
