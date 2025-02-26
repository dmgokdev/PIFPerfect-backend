export const INVALID_INDUSTRY_ID = 'Invalid Industry ID';
export const INDUSTRY_NOT_FOUND = 'Industry Not Found';
export const GET_INDUSTRY_SUCCESS = 'Industries fetched successfully';
export const INDUSTRY_CREATED_SUCCESS = 'Industry created successfully';
export const INDUSTRY_UPDATED_SUCCESS = 'Industry updated successfully';
export const INDUSTRY_DELETED_SUCCESS = 'Industry deleted successfully';
export const INDUSTRY_EXISTS = 'Industry already exists';
export const AT_LEAST_ONE_VALUE = 'At least one product must be included';

export const ALLOWED_INDUSTRY_SORT_OPTIONS = [
	'id',
	'name',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_INDUSTRY_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_INDUSTRY_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_INDUSTRY_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'parent_id',
		type: ['number', 'null'],
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_INDUSTRY_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_INDUSTRY_SORT_OPTIONS.includes(field);
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
