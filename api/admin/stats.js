const initFirebaseAdmin = require('../_firebaseAdmin');

module.exports = async (req, res) => {
    try {
        const { db } = initFirebaseAdmin();

        // Basic counts
        const [usersSnap, monstersSnap, itemsSnap, skillsSnap, racesSnap, jobsSnap] = await Promise.all([
            db.collection('characters').get(),
            db.collection('monsters').get(),
            db.collection('items').get(),
            db.collection('skills').get(),
            db.collection('races').get(),
            db.collection('jobs').get()
        ]);

        // Compute simple distributions for races and jobs
        const characters = usersSnap.docs.map(d => d.data());
        const charactersByRace = {};
        const charactersByJob = {};
        let totalGold = 0;

        characters.forEach(c => {
            totalGold += c.gold || 0;
            if (c.race) charactersByRace[c.race] = (charactersByRace[c.race] || 0) + 1;
            if (c.job) charactersByJob[c.job] = (charactersByJob[c.job] || 0) + 1;
        });

        const raceData = Object.entries(charactersByRace).map(([name, value]) => ({ name, value }));
        const jobData = Object.entries(charactersByJob).map(([name, value]) => ({ name, value }));

        res.status(200).json({
            totalUsers: usersSnap.size,
            totalMonsters: monstersSnap.size,
            totalItems: itemsSnap.size,
            totalSkills: skillsSnap.size,
            totalRaces: racesSnap.size,
            totalJobs: jobsSnap.size,
            recentBattles: 0,
            totalGold,
            timePeriods: { hourly: [], daily: [], weekly: [], monthly: [] },
            distributions: { races: raceData, jobs: jobData },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Vercel admin stats error:', error);
        res.status(500).json({ message: 'Error fetching stats', error: String(error) });
    }
};
