import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	PRODUCT_CREATED_SUCCESS,
	GET_PRODUCT_SUCCESS,
	PRODUCT_UPDATED_SUCCESS,
	PRODUCT_DELETED_SUCCESS,
} from '../constants';
import { ProductService } from '../services';
import { successResponse } from '../utils';

export const createProduct = asyncHandler(async (req, res) => {
	const productService = new ProductService(req);
	const data = await productService.createProduct();

	return successResponse(res, HttpStatus.OK, PRODUCT_CREATED_SUCCESS, data);
});

export const getAllProducts = asyncHandler(async (req, res) => {
	const productService = new ProductService(req);
	const data = await productService.getAllProducts();

	return successResponse(res, HttpStatus.OK, GET_PRODUCT_SUCCESS, data);
});

export const updateProducts = asyncHandler(async (req, res) => {
	const productsService = new ProductService(req);
	const data = await productsService.updateProducts();

	return successResponse(res, HttpStatus.OK, PRODUCT_UPDATED_SUCCESS, data);
});

export const getProduct = asyncHandler(async (req, res) => {
	const productService = new ProductService(req);
	const data = await productService.getProduct();

	return successResponse(res, HttpStatus.OK, GET_PRODUCT_SUCCESS, data);
});

export const deleteProduct = asyncHandler(async (req, res) => {
	const productService = new ProductService(req);
	const data = await productService.deleteProduct();

	return successResponse(res, HttpStatus.OK, PRODUCT_DELETED_SUCCESS, data);
});
