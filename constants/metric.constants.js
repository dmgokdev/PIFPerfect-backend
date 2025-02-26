export const INVALID_METRIC_ID = 'Invalid Metric ID';
export const METRIC_NOT_FOUND = 'Metric Not Found';
export const GET_METRIC_SUCCESS = 'Metrics fetched successfully';
export const METRIC_CREATED_SUCCESS = 'Metric created successfully';
export const METRIC_UPDATED_SUCCESS = 'Metric updated successfully';
export const METRIC_DELETED_SUCCESS = 'Metric deleted successfully';
export const METRIC_EXISTS = 'Metric already exists';
export const SUBMIT_NUMBERS_FOUND = 'This metric have submit numbers.';
export const PRODUCT_IDS_MUST_BE_INTEGERS = 'Product IDs must be integers.';
export const ASSIGN_METRIC_SUCCESS = 'Metrics assigned successfully';

export const METRIC_TYPE = ['integer', 'numeric', 'percent'];

export const ALLOWED_METRIC_SORT_OPTIONS = [
	'id',
	'label',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_METRIC_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_METRIC_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_METRIC_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'type',
		type: 'string',
	},
	{
		propertyName: 'companyId',
		type: 'number',
	},
	{
		propertyName: 'role',
		type: 'number',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'isDefault',
		type: 'boolean',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_METRIC_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_METRIC_SORT_OPTIONS.includes(field);
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

export const GET_COMPANY_METRIC_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'id',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_METRIC_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_METRIC_SORT_OPTIONS.includes(field);
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
