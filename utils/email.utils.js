import ElasticMail from 'nodelastic';

import { SMTP_PASS, FROM_NAME, FROM_EMAIL } from '../config';

const client = new ElasticMail(SMTP_PASS);

export const sendEmail = async mailOptions => {
	try {
		client.send({
			from: FROM_EMAIL,
			fromName: FROM_NAME,
			subject: mailOptions.subject,
			msgTo: [mailOptions.to],
			bodyHtml: mailOptions.html,
			textHtml: mailOptions.text,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Error sending email:', error);
	}
};
