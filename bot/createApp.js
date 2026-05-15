const express = require('express');
const cors = require('cors');
const { router: adminRouter } = require('./api/adminRoutes');

function createApp(db, options = {}) {
	const app = express();
	const loggerEnabled = options.logger !== false;

	app.use(cors());
	app.use(express.json());

	app.use((req, res, next) => {
		req.db = db;
		next();
	});

	if (loggerEnabled) {
		app.use((req, res, next) => {
			console.log('[API REQ]', req.method, req.originalUrl);
			next();
		});
	}

	app.use('/api/admin', adminRouter);

	return app;
}

module.exports = { createApp };