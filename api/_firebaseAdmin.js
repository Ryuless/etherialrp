const admin = require('firebase-admin');

let initialized = false;
function initFirebaseAdmin() {
    if (initialized) return { admin: admin, db: admin.firestore() };

    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8') : null);
    if (!envJson) {
        throw new Error('Missing Firebase service account. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64 in environment.');
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(envJson);
    } catch (err) {
        throw new Error('Invalid JSON for Firebase service account: ' + err.message);
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    initialized = true;
    const db = admin.firestore();
    return { admin, db };
}

module.exports = initFirebaseAdmin;
