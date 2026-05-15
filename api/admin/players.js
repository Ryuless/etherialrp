const initFirebaseAdmin = require('../_firebaseAdmin');
const { verifyTokenFromReq } = require('../_auth');

module.exports = async (req, res) => {
    try {
        const admin = verifyTokenFromReq(req, res);
        if (!admin) return; // verifyTokenFromReq already sent response

        const { db } = initFirebaseAdmin();
        const snap = await db.collection('characters').get();
        const players = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(players);
    } catch (error) {
        console.error('players error:', error);
        res.status(500).json({ message: 'Error fetching players', error: String(error) });
    }
};
