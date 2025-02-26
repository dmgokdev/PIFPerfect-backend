export const INVALID_DAILY_METRIC_ID = 'Invalid Daily_Metric ID';
export const DAILY_METRIC_NOT_FOUND = 'Daily_Metric Not Found';
export const GET_DAILY_METRIC_SUCCESS = 'Daily_Metrics fetched successfully';
export const DAILY_METRIC_CREATED_SUCCESS =
	'Numbers are successfully submitted';
export const DAILY_METRIC_UPDATED_SUCCESS = 'Daily_Metric updated successfully';
export const DAILY_METRIC_DELETED_SUCCESS = 'Daily_Metric deleted successfully';
export const DAILY_METRIC_EXISTS = 'Daily_Metric already exists';

export const ALLOWED_DAILY_METRIC_SORT_OPTIONS = [
	'id',
	'value',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_DAILY_METRIC_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_DAILY_METRIC_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_DAILY_METRIC_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'value',
		type: 'string',
	},
	{
		propertyName: 'userId',
		type: 'string',
	},
	{
		propertyName: 'startDate',
		type: 'string',
	},
	{
		propertyName: 'endDate',
		type: 'string',
	},
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_DAILY_METRIC_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_DAILY_METRIC_SORT_OPTIONS.includes(field);
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
