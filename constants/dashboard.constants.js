export const DASHBOARD_FETCHED_SUCCESS = 'Dashboard fetched successfully';

export const ALLOWED_DASHBOARD_SORT_OPTIONS = ['companyId'];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_DASHBOARD_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_DASHBOARD_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_DASHBOARD_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'startDate',
		type: 'string',
	},
	{
		propertyName: 'endDate',
		type: 'string',
	},
	{
		propertyName: 'mainMetricId',
		type: 'number',
	},
	{
		propertyName: 'secondaryMetricId',
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
			message: INVALID_DASHBOARD_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_DASHBOARD_SORT_OPTIONS.includes(field);
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
