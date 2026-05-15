const initFirebaseAdmin = require('../_firebaseAdmin');
const { verifyTokenFromReq } = require('../_auth');

module.exports = async (req, res) => {
    try {
        const admin = verifyTokenFromReq(req, res);
        if (!admin) return;

        const { db } = initFirebaseAdmin();
        const snap = await db.collection('monsters').get();
        const monsters = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(monsters);
    } catch (error) {
        console.error('monsters error:', error);
        res.status(500).json({ message: 'Error fetching monsters', error: String(error) });
    }
};
