export const INVALID_PRODUCT_ID = 'Invalid Product ID';
export const PRODUCT_NOT_FOUND = 'Product Not Found';
export const GET_PRODUCT_SUCCESS = 'Products fetched successfully';
export const PRODUCT_CREATED_SUCCESS = 'Product created successfully';
export const PRODUCT_UPDATED_SUCCESS = 'Product updated successfully';
export const PRODUCT_DELETED_SUCCESS = 'Product deleted successfully';
export const PRODUCT_EXISTS = 'Product already exists';
export const NUMBERS_EXISTS = 'Numbers found against the product';

export const ALLOWED_PRODUCT_SORT_OPTIONS = [
	'id',
	'productName',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_PRODUCT_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_PRODUCT_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_PRODUCT_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'productName',
		type: 'string',
	},
	{
		propertyName: 'defaultCashValue',
		type: 'string',
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
			message: INVALID_PRODUCT_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_PRODUCT_SORT_OPTIONS.includes(field);
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
