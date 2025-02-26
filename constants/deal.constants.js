export const INVALID_DEAL_ID = 'Invalid Deal ID';
export const DEAL_NOT_FOUND = 'Deal Not Found';
export const GET_DEAL_SUCCESS = 'Deals fetched successfully';
export const DEAL_CREATED_SUCCESS = 'Deal created successfully';
export const DEAL_UPDATED_SUCCESS = 'Deal updated successfully';
export const DEAL_DELETED_SUCCESS = 'Deal deleted successfully';
export const DEAL_EXISTS = 'Deal already exists';
export const INVALID_VALUE = 'Total revenue cannot be negative';
export const AT_LEAST_ONE_VALUE = 'At least one product must be included';
export const INVALID_DATE = 'Invalid date format';

export const ALLOWED_DEAL_SORT_OPTIONS = [
	'id',
	'totalRevenue',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_DEAL_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_DEAL_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_DEAL_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'totalRevenue',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_DEAL_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_DEAL_SORT_OPTIONS.includes(field);
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
