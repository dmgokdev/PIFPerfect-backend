import yup from 'yup';

import { REQUIRED_FIELDS } from '../constants';

export const createRefundSchema = yup.object({
	body: yup.object({
		userId: yup.number().required(REQUIRED_FIELDS),
		productId: yup.number().required(REQUIRED_FIELDS),
		date: yup.date().required(REQUIRED_FIELDS),
		quantity: yup.number().required(REQUIRED_FIELDS),
		refundValue: yup.number().required(REQUIRED_FIELDS),
		reason: yup.string().notRequired(),
	}),
});
