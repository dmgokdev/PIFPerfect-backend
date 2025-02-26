import { ALLOWED_USER_SORT_OPTIONS } from './auth.constants';

export const INVALID_COMPANY_ID = 'Invalid Company ID';
export const COMPANY_NOT_FOUND = 'Company Not Found';
export const GET_COMPANY_SUCCESS = 'Companies fetched successfully';
export const COMPANY_CREATED_SUCCESS = 'Company created successfully';
export const COMPANY_UPDATED_SUCCESS = 'Company updated successfully';
export const COMPANY_DELETED_SUCCESS = 'Company deleted successfully';
export const COMPANY_EXISTS = 'Company already exists';
export const GET_INDUSTRIES_SUCCESS = 'Industries fetched successfully';
export const ALLOWED_COMPANY_SORT_OPTIONS = [
	'id',
	'name',
	'isActive',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_COMPANY_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_COMPANY_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'isActive',
		type: 'boolean',
	},
	{
		propertyName: 'searchInput',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_COMPANY_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
];

export const GET_COMPANY_USER_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'email',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_USER_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'roleId',
		type: 'number',
	},
];
