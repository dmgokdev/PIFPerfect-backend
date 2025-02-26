import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	INDUSTRY_CREATED_SUCCESS,
	GET_INDUSTRY_SUCCESS,
	INDUSTRY_UPDATED_SUCCESS,
	INDUSTRY_DELETED_SUCCESS,
} from '../constants';
import { IndustryService } from '../services';
import { successResponse } from '../utils';

export const createIndustry = asyncHandler(async (req, res) => {
	const productService = new IndustryService(req);
	const data = await productService.createIndustry();

	return successResponse(res, HttpStatus.OK, INDUSTRY_CREATED_SUCCESS, data);
});

export const getAllIndustries = asyncHandler(async (req, res) => {
	const productService = new IndustryService(req);
	const data = await productService.getAllIndustries();

	return successResponse(res, HttpStatus.OK, GET_INDUSTRY_SUCCESS, data);
});

export const updateIndustry = asyncHandler(async (req, res) => {
	const productsService = new IndustryService(req);
	const data = await productsService.updateIndustry();

	return successResponse(res, HttpStatus.OK, INDUSTRY_UPDATED_SUCCESS, data);
});

export const getIndustry = asyncHandler(async (req, res) => {
	const productService = new IndustryService(req);
	const data = await productService.getIndustry();

	return successResponse(res, HttpStatus.OK, GET_INDUSTRY_SUCCESS, data);
});

export const deleteIndustry = asyncHandler(async (req, res) => {
	const productService = new IndustryService(req);
	const data = await productService.deleteIndustry();

	return successResponse(res, HttpStatus.OK, INDUSTRY_DELETED_SUCCESS, data);
});

export const getChildIndustries = asyncHandler(async (req, res) => {
	const productService = new IndustryService(req);
	const data = await productService.getChildIndustries();

	return successResponse(res, HttpStatus.OK, GET_INDUSTRY_SUCCESS, data);
});
