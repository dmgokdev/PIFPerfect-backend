import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	GET_COMPANY_SUCCESS,
	COMPANY_CREATED_SUCCESS,
	COMPANY_UPDATED_SUCCESS,
	COMPANY_DELETED_SUCCESS,
	GET_INDUSTRIES_SUCCESS,
	GET_USERS_SUCCESS,
} from '../constants';
import { CompanyService } from '../services';
import { successResponse } from '../utils';

export const getAllCompanies = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.getAllCompanies();

	return successResponse(res, HttpStatus.OK, GET_COMPANY_SUCCESS, data);
});

export const getCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.getCompany();

	return successResponse(res, HttpStatus.OK, GET_COMPANY_SUCCESS, data);
});

export const createCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.createCompany();

	return successResponse(res, HttpStatus.OK, COMPANY_CREATED_SUCCESS, data);
});

export const updateCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.updateCompany();

	return successResponse(res, HttpStatus.OK, COMPANY_UPDATED_SUCCESS, data);
});

export const deleteCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.deleteCompany();

	return successResponse(res, HttpStatus.OK, COMPANY_DELETED_SUCCESS, data);
});

export const deleteManyCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.deleteManyCompany();

	return successResponse(res, HttpStatus.OK, COMPANY_DELETED_SUCCESS, data);
});

export const addCompany = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.addCompany();

	return successResponse(res, HttpStatus.OK, COMPANY_CREATED_SUCCESS, data);
});

export const companyUpdate = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.companyUpdate();

	return successResponse(res, HttpStatus.OK, COMPANY_UPDATED_SUCCESS, data);
});

export const getIndustries = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.getIndustries();
	return successResponse(res, HttpStatus.OK, GET_INDUSTRIES_SUCCESS, data);
});

export const getCompanyUsers = asyncHandler(async (req, res) => {
	const companyService = new CompanyService(req);
	const data = await companyService.getCompanyUsers();
	return successResponse(res, HttpStatus.OK, GET_USERS_SUCCESS, data);
});
