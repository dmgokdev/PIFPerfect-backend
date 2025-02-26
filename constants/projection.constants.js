export const INVALID_PROJECTION_ID = 'Invalid Projection ID';
export const PROJECTION_NOT_FOUND = 'Projection Not Found';
export const GET_PROJECTION_SUCCESS = 'Projections fetched successfully';
export const PROJECTION_CREATED_SUCCESS = 'Projection created successfully';
export const PROJECTION_UPDATED_SUCCESS = 'Projection updated successfully';
export const PROJECTION_DELETED_SUCCESS = 'Projection deleted successfully';
export const PROJECTION_EXISTS = 'Projection already exists';
export const A_PROJECTION_ALREADY_EXISTS =
	'A projection already exists against this users and metric';

export const PROJECTION_PERIOD = ['weekly', 'monthly', 'quarterly', 'yearly'];

export const ALLOWED_PROJECTION_SORT_OPTIONS = [
	'id',
	'targetValue',
	'period',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PROJECTION_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PROJECTION_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PROJECTION_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'targetValue',
		type: 'string',
	},
	{
		propertyName: 'period',
		type: 'string',
	},
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'userId',
		type: 'number',
	},
	{
		propertyName: 'companyId',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_PROJECTION_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PROJECTION_SORT_OPTIONS.includes(field);
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
