import asyncHandler from 'express-async-handler';
import HttpStatus from 'http-status-codes';

import {
	PERMISSIONS_UPDATED_SUCCESS,
	PERMISSIONS_GET_SUCCESS,
	PERMISSIONS_CREATED_SUCCESS,
	PERMISSIONS_DELETED_SUCCESS,
} from '../constants';
import { PermissionService } from '../services';
import { successResponse } from '../utils';

export const assignPermissions = asyncHandler(async (req, res) => {
	const permissionService = new PermissionService(req);
	const data = await permissionService.assignPermissions();

	return successResponse(res, HttpStatus.OK, PERMISSIONS_UPDATED_SUCCESS, data);
});

export const getRolePermissions = asyncHandler(async (req, res) => {
	const permissionService = new PermissionService(req);
	const data = await permissionService.getPermissions();

	return successResponse(res, HttpStatus.OK, PERMISSIONS_GET_SUCCESS, data);
});

export const addPermission = asyncHandler(async (req, res) => {
	const permissionService = new PermissionService(req);
	const data = await permissionService.addPermission();

	return successResponse(res, HttpStatus.OK, PERMISSIONS_CREATED_SUCCESS, data);
});

export const updatePermission = asyncHandler(async (req, res) => {
	const permissionService = new PermissionService(req);
	const data = await permissionService.updatePermission();

	return successResponse(res, HttpStatus.OK, PERMISSIONS_UPDATED_SUCCESS, data);
});

export const deletePermission = asyncHandler(async (req, res) => {
	const permissionService = new PermissionService(req);
	const data = await permissionService.deletePermission();

	return successResponse(res, HttpStatus.OK, PERMISSIONS_DELETED_SUCCESS, data);
});
