import fs from 'fs';
import path from 'path';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import responseTime from 'response-time';

import { PORT } from './config';
import { errorMiddleware, notFound } from './middlewares/error.middlewares';
import {
	AuthRoutes,
	CompanyRoutes,
	UsersRoutes,
	MetricRoutes,
	DailyMetricRoutes,
	ProjectionRoutes,
	ProductRoutes,
	DealRoutes,
	PermissionRoutes,
	IndustryRoutes,
	RoleRoutes
} from './routes/index';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(responseTime());

app.use(cors({ origin: '*' }));
app.use('/public', express.static(path.join(path.resolve(), 'temp_uploads')));
app.use(express.static(path.join(path.resolve(), 'public')));

app.use(helmet());

app.use('/api/auth', AuthRoutes);
app.use('/api/companies', CompanyRoutes);
app.use('/api/users', UsersRoutes);
app.use('/api/metrics', MetricRoutes);
app.use('/api/dailyMetrics', DailyMetricRoutes);
app.use('/api/projections', ProjectionRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/deals', DealRoutes);
app.use('/api/permissions', PermissionRoutes);
app.use('/api/industries', IndustryRoutes);
app.use('/api/roles', RoleRoutes);

app.get('/home', (req, res) => {
	res.status(200).json({ data: 'Server is running' });
});

app.use('*', notFound);
app.use(errorMiddleware);

if (!fs.existsSync('./temp_uploads')) {
	fs.mkdirSync('./temp_uploads', { recursive: true });
}

app.listen(PORT || 3000, () => {
	// eslint-disable-next-line no-console
	console.log(`Server is listening at port ${PORT}`);
});
