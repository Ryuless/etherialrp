// Import the necessary modules
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { initializeDatabase } = require('./database/initDatabase');
const { seedDatabase } = require('./seed');
const { router: adminRouter } = require('./api/adminRoutes');

// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function bootstrapDatabase() {
	await seedDatabase(db);
}

// Discord bot token
const token = process.env.DISCORD_BOT_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Command handling
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Event handling
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args, db));
	}
}


// Setup Express API Server for Admin Dashboard
const app = express();
const API_PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Pass db to routes
app.use((req, res, next) => {
	req.db = db;
	next();
});

// Development request logger (temporary)
app.use((req, res, next) => {
	console.log('[API REQ]', req.method, req.originalUrl);
	next();
});

// Admin API Routes
app.use('/api/admin', adminRouter);

// Start Express server
bootstrapDatabase()
	.then(() => {
		app.listen(API_PORT, () => {
			console.log(`🌐 Admin API Server running on http://localhost:${API_PORT}`);
		});

		// Log in to Discord with your client's token
		return client.login(token);
	})
	.catch(error => {
		console.error('Failed to bootstrap application:', error);
		process.exit(1);
	});
