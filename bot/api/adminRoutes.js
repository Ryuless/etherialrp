// Admin API Routes Helper
const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyAdminCredentials, getAllAdmins, updateAdminCredentials } = require('../utils/adminManager');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware untuk verify JWT token
 */
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error && error.message ? error.message : error);
        return res.status(403).json({ message: 'Invalid token' });
    }
}

/**
 * POST /api/admin/login
 * Admin login endpoint
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    try {
        const admin = await verifyAdminCredentials(req.db, username, password);
        
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token: token,
            admin: {
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics with realtime data
 */
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const usersSnap = await req.db.collection('characters').get();
        const monstersSnap = await req.db.collection('monsters').get();
        const itemsSnap = await req.db.collection('items').get();
        const skillsSnap = await req.db.collection('skills').get();
        const racesSnap = await req.db.collection('races').get();
        const jobsSnap = await req.db.collection('jobs').get();

        // Generate realtime growth data - last 7 days
        const weeklyData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            weeklyData.push({
                name: dateStr,
                newUsers: 0,
                totalUsers: 0,
                battles: 0,
                fullDate: date.setHours(0,0,0,0)
            });
        }

        // Generate hourly data - last 24 hours
        const hourlyData = [];
        for (let i = 23; i >= 0; i--) {
            const date = new Date(today);
            date.setHours(date.getHours() - i);
            date.setMinutes(0, 0, 0);
            const hour = date.getHours().toString().padStart(2, '0');
            hourlyData.push({
                name: `${hour}:00`,
                users: 0,
                newUsers: 0,
                totalUsers: 0,
                battles: 0,
                quests: 0,
                fullDate: date.getTime()
            });
        }

        // Generate daily data - last 30 days
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyData.push({
                name: dateStr,
                users: 0,
                newUsers: 0,
                totalUsers: 0,
                battles: 0,
                quests: 0,
                fullDate: date.setHours(0,0,0,0)
            });
        }

        // Generate weekly data - last 12 weeks
        const weeklyData_new = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - (i * 7));
            const weekStart = new Date(date);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const dateStr = `W${Math.ceil(date.getDate() / 7)}`;
            weeklyData_new.push({
                name: dateStr,
                users: 0,
                newUsers: 0,
                totalUsers: 0,
                battles: 0,
                quests: 0,
                fullDate: weekStart.setHours(0,0,0,0)
            });
        }

        // Generate monthly data - last 12 months
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            monthlyData.push({
                name: monthStr,
                users: 0,
                newUsers: 0,
                totalUsers: 0,
                battles: 0,
                quests: 0,
                fullDate: date.getTime(),
                monthKey: date.getMonth(),
                yearKey: date.getFullYear()
            });
        }

        const hourlyStart = hourlyData[0]?.fullDate || 0;
        const dailyStart = dailyData[0]?.fullDate || 0;
        const weeklyStart = weeklyData_new[0]?.fullDate || 0;
        const monthlyStart = monthlyData[0]?.fullDate || 0;

        let hourlyBaselineUsers = 0;
        let dailyBaselineUsers = 0;
        let weeklyBaselineUsers = 0;
        let monthlyBaselineUsers = 0;

        let recentEngagements = 0;
        const charactersByRace = {};
        const charactersByJob = {};
        let totalGold = 0;

        usersSnap.docs.forEach(doc => {
            const data = doc.data();
            totalGold += data.gold || 0;
            
            // Track by race
            if (data.race) {
                charactersByRace[data.race] = (charactersByRace[data.race] || 0) + 1;
            }
            
            // Track by job
            if (data.job) {
                charactersByJob[data.job] = (charactersByJob[data.job] || 0) + 1;
            }
            
            // Calculate user activity based on lastActive so the chart reflects real usage.
            // Fall back to createdAt only when a character has never been seen active.
            const activitySource = data.lastActive || data.createdAt;
            if (activitySource) {
                // Handle Firestore Timestamp objects
                const activeDate = activitySource.toDate ? activitySource.toDate() : new Date(activitySource);

                // For hourly data: compute the bucket start for this active date and match by fullDate
                const activeBucket = new Date(activeDate);
                activeBucket.setMinutes(0, 0, 0, 0);
                const activeBucketTs = activeBucket.getTime();
                const hourIndex = hourlyData.findIndex(h => h.fullDate === activeBucketTs);
                if (hourIndex !== -1) {
                    hourlyData[hourIndex].users += 1;
                }
                
                // For daily data
                const activeTimestamp = new Date(activeDate).setHours(0,0,0,0);
                const dayIndex = dailyData.findIndex(d => d.fullDate === activeTimestamp);
                if (dayIndex !== -1) {
                    dailyData[dayIndex].users += 1;
                }
                
                // For weekly data
                const weeklyTimestamp = new Date(activeDate);
                weeklyTimestamp.setDate(weeklyTimestamp.getDate() - weeklyTimestamp.getDay());
                const weeklyIndex = weeklyData_new.findIndex(w => w.fullDate === weeklyTimestamp.setHours(0,0,0,0));
                if (weeklyIndex !== -1) {
                    weeklyData_new[weeklyIndex].users += 1;
                }
                
                // For monthly data
                const monthIndex = monthlyData.findIndex(m => {
                    const mDate = new Date(m.name);
                    return activeDate.getMonth() === mDate.getMonth() && activeDate.getFullYear() === mDate.getFullYear();
                });
                if (monthIndex !== -1) {
                    monthlyData[monthIndex].users += 1;
                }
                
                // Count very recent engagements (last 24h)
                if (today.getTime() - activeDate.getTime() < 86400000) {
                    recentEngagements += 1;
                }
            }

            // Track new user signups by createdAt so the chart can show when characters were created.
            if (data.createdAt) {
                const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

                // Baseline counts will be computed after scanning all users

                // Only count newUsers into hourly buckets when the createdAt falls inside that hourly bucket
                const createdBucket = new Date(createdDate);
                createdBucket.setMinutes(0, 0, 0, 0);
                const createdBucketTs = createdBucket.getTime();
                const createdHourIndex = hourlyData.findIndex(h => h.fullDate === createdBucketTs);
                if (createdHourIndex !== -1) {
                    hourlyData[createdHourIndex].newUsers += 1;
                }

                const createdTimestamp = new Date(createdDate).setHours(0, 0, 0, 0);
                const createdDayIndex = dailyData.findIndex(d => d.fullDate === createdTimestamp);
                if (createdDayIndex !== -1) {
                    dailyData[createdDayIndex].newUsers += 1;
                }

                const createdWeekTimestamp = new Date(createdDate);
                createdWeekTimestamp.setDate(createdWeekTimestamp.getDate() - createdWeekTimestamp.getDay());
                const createdWeekIndex = weeklyData_new.findIndex(w => w.fullDate === createdWeekTimestamp.setHours(0, 0, 0, 0));
                if (createdWeekIndex !== -1) {
                    weeklyData_new[createdWeekIndex].newUsers += 1;
                }

                const createdMonthIndex = monthlyData.findIndex(m => {
                    return createdDate.getMonth() === m.monthKey && createdDate.getFullYear() === m.yearKey;
                });
                if (createdMonthIndex !== -1) {
                    monthlyData[createdMonthIndex].newUsers += 1;
                }
            }
        });

        // Recompute baselines from total users minus newUsers counted within each window
        const totalUsersCount = usersSnap.size;
        const sumHourlyNew = hourlyData.reduce((s, b) => s + (b.newUsers || 0), 0);
        const sumDailyNew = dailyData.reduce((s, b) => s + (b.newUsers || 0), 0);
        const sumWeeklyNew = weeklyData_new.reduce((s, b) => s + (b.newUsers || 0), 0);
        const sumMonthlyNew = monthlyData.reduce((s, b) => s + (b.newUsers || 0), 0);

        hourlyBaselineUsers = Math.max(0, totalUsersCount - sumHourlyNew);
        dailyBaselineUsers = Math.max(0, totalUsersCount - sumDailyNew);
        weeklyBaselineUsers = Math.max(0, totalUsersCount - sumWeeklyNew);
        monthlyBaselineUsers = Math.max(0, totalUsersCount - sumMonthlyNew);

        let runningTotalUsers = hourlyBaselineUsers;
        hourlyData.forEach(bucket => {
            runningTotalUsers += bucket.newUsers;
            bucket.totalUsers = runningTotalUsers;
        });

        runningTotalUsers = dailyBaselineUsers;
        dailyData.forEach(bucket => {
            runningTotalUsers += bucket.newUsers;
            bucket.totalUsers = runningTotalUsers;
        });

        runningTotalUsers = weeklyBaselineUsers;
        weeklyData_new.forEach(bucket => {
            runningTotalUsers += bucket.newUsers;
            bucket.totalUsers = runningTotalUsers;
        });

        runningTotalUsers = monthlyBaselineUsers;
        monthlyData.forEach(bucket => {
            runningTotalUsers += bucket.newUsers;
            bucket.totalUsers = runningTotalUsers;
        });

        // More accurate approach: compute totalUsers per bucket by counting characters created up to bucket end
        // Collect created timestamps
        const createdTimestamps = [];
        usersSnap.docs.forEach(doc => {
            const d = doc.data();
            if (d.createdAt) {
                const ts = d.createdAt.toDate ? d.createdAt.toDate().getTime() : new Date(d.createdAt).getTime();
                createdTimestamps.push(ts);
            }
        });
        createdTimestamps.sort((a, b) => a - b);

        // Helper to count <= target using binary search
        function countUpTo(target) {
            let lo = 0, hi = createdTimestamps.length;
            while (lo < hi) {
                const mid = Math.floor((lo + hi) / 2);
                if (createdTimestamps[mid] <= target) lo = mid + 1;
                else hi = mid;
            }
            return lo;
        }

        // Hourly: bucket end = bucket.fullDate + 1 hour
        hourlyData.forEach(bucket => {
            const bucketEnd = bucket.fullDate + 3600000;
            bucket.totalUsers = countUpTo(bucketEnd);
            bucket.newUsers = 0; // reset and compute by range
        });

        // Assign newUsers by checking created timestamps against bucket ranges
        createdTimestamps.forEach(ts => {
            for (const bucket of hourlyData) {
                if (ts >= bucket.fullDate && ts < bucket.fullDate + 3600000) {
                    bucket.newUsers = (bucket.newUsers || 0) + 1;
                    break;
                }
            }
        });

        // Daily: end = fullDate + 24h
        dailyData.forEach(bucket => {
            const bucketEnd = bucket.fullDate + 86400000;
            bucket.totalUsers = countUpTo(bucketEnd);
            bucket.newUsers = 0;
        });
        createdTimestamps.forEach(ts => {
            for (const bucket of dailyData) {
                if (ts >= bucket.fullDate && ts < bucket.fullDate + 86400000) {
                    bucket.newUsers = (bucket.newUsers || 0) + 1;
                    break;
                }
            }
        });

        // Weekly: end = fullDate + 7d
        weeklyData_new.forEach(bucket => {
            const bucketEnd = bucket.fullDate + (7 * 86400000);
            bucket.totalUsers = countUpTo(bucketEnd);
            bucket.newUsers = 0;
        });
        createdTimestamps.forEach(ts => {
            for (const bucket of weeklyData_new) {
                if (ts >= bucket.fullDate && ts < bucket.fullDate + (7 * 86400000)) {
                    bucket.newUsers = (bucket.newUsers || 0) + 1;
                    break;
                }
            }
        });

        // Monthly: compute next month start and assign newUsers by range
        monthlyData.forEach((bucket, idx) => {
            const start = bucket.fullDate;
            let nextStart;
            if (idx < monthlyData.length - 1) nextStart = monthlyData[idx + 1].fullDate;
            else {
                const d = new Date(start);
                d.setMonth(d.getMonth() + 1);
                d.setHours(0,0,0,0);
                nextStart = d.getTime();
            }
            const bucketEnd = nextStart - 1;
            bucket.totalUsers = countUpTo(bucketEnd);
            bucket.newUsers = 0;
        });
        createdTimestamps.forEach(ts => {
            for (const [idx, bucket] of monthlyData.entries()) {
                const start = bucket.fullDate;
                const nextStart = (idx < monthlyData.length - 1) ? monthlyData[idx + 1].fullDate : (new Date(start).setMonth(new Date(start).getMonth()+1));
                if (ts >= start && ts < nextStart) {
                    bucket.newUsers = (bucket.newUsers || 0) + 1;
                    break;
                }
            }
        });

        // Convert character data to chart format
        const raceData = Object.entries(charactersByRace).map(([name, value]) => ({
            name,
            value,
            fullName: name
        }));

        const jobData = Object.entries(charactersByJob).map(([name, value]) => ({
            name: name.substring(0, 8),
            value,
            fullName: name
        }));

        res.json({
            totalUsers: usersSnap.size,
            totalMonsters: monstersSnap.size,
            totalItems: itemsSnap.size,
            totalSkills: skillsSnap.size,
            totalRaces: racesSnap.size,
            totalJobs: jobsSnap.size,
            recentBattles: recentEngagements,
            totalGold: totalGold,
            timePeriods: {
                hourly: hourlyData.map(h => ({name: h.name, users: h.users, newUsers: h.newUsers, totalUsers: h.totalUsers, battles: h.battles, quests: h.quests})),
                daily: dailyData.map(d => ({name: d.name, users: d.users, newUsers: d.newUsers, totalUsers: d.totalUsers, battles: d.battles, quests: d.quests})),
                weekly: weeklyData_new.map(w => ({name: w.name, users: w.users, newUsers: w.newUsers, totalUsers: w.totalUsers, battles: w.battles, quests: w.quests})),
                monthly: monthlyData.map(m => ({name: m.name, users: m.users, newUsers: m.newUsers, totalUsers: m.totalUsers, battles: m.battles, quests: m.quests}))
            },
            distributions: {
                races: raceData,
                jobs: jobData
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});



/**
 * GET /api/admin/players
 * Get all players
 */
router.get('/players', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('characters').get();
        const players = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players' });
    }
});

/**
 * GET /api/admin/items
 * Get all items
 */
router.get('/items', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('items').get();
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items' });
    }
});

/**
 * GET /api/admin/monsters
 * Get all monsters
 */
router.get('/monsters', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('monsters').get();
        const monsters = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(monsters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monsters' });
    }
});

/**
 * GET /api/admin/skills
 * Get all skills
 */
router.get('/skills', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('skills').get();
        const skills = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching skills' });
    }
});

/**
 * GET /api/admin/races
 * Get all races
 */
router.get('/races', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('races').get();
        const races = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(races);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching races' });
    }
});

/**
 * GET /api/admin/jobs
 * Get all jobs
 */
router.get('/jobs', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('jobs').get();
        const jobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching jobs' });
    }
});

/**
 * GET /api/admin/maps
 * Get all maps
 */
router.get('/maps', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('maps').get();
        const maps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(maps);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maps' });
    }
});

/**
 * GET /api/admin/starter-kits
 * Get all starter kits
 */
router.get('/starter-kits', verifyToken, async (req, res) => {
    try {
        const snap = await req.db.collection('starterKits').get();
        const starterKits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(starterKits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching starter kits' });
    }
});

/**
 * PUT /api/admin/:collection/:id
 * Update any collection document
 */


// Place specific account routes before generic collection handlers
router.put('/account/credentials', verifyToken, async (req, res) => {
    console.log('Incoming request to /account/credentials', { method: req.method, path: req.path });
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }

    if (!newUsername && !newPassword) {
        return res.status(400).json({ message: 'New username or password is required' });
    }

    try {
        const currentAdmin = await verifyAdminCredentials(req.db, req.admin.username, currentPassword);

        if (!currentAdmin) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const result = await updateAdminCredentials(req.db, req.admin.username, { newUsername, newPassword });
        const token = jwt.sign(
            {
                username: result.admin.username,
                role: result.admin.role,
                permissions: currentAdmin.permissions
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            ...result,
            token,
            admin: {
                ...result.admin,
                permissions: currentAdmin.permissions
            }
        });
    } catch (error) {
        console.error('Update admin credentials error:', error);
        res.status(500).json({ message: error.message || 'Error updating credentials' });
    }
});

// New explicit route to avoid parameterized route conflicts
router.put('/account/update-credentials', verifyToken, async (req, res) => {
    console.log('Incoming request to /account/update-credentials', { method: req.method, path: req.path });
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
    }

    if (!newUsername && !newPassword) {
        return res.status(400).json({ message: 'New username or password is required' });
    }

    try {
        const currentAdmin = await verifyAdminCredentials(req.db, req.admin.username, currentPassword);

        if (!currentAdmin) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const result = await updateAdminCredentials(req.db, req.admin.username, { newUsername, newPassword });
        const token = jwt.sign(
            {
                username: result.admin.username,
                role: result.admin.role,
                permissions: currentAdmin.permissions
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            ...result,
            token,
            admin: {
                ...result.admin,
                permissions: currentAdmin.permissions
            }
        });
    } catch (error) {
        console.error('Update admin credentials error:', error);
        res.status(500).json({ message: error.message || 'Error updating credentials' });
    }
});

router.post('/:collectionId', verifyToken, async (req, res) => {
    try {
        const { collectionId } = req.params;
        const collectionMap = {
            characters: 'characters',
            items: 'items',
            monsters: 'monsters',
            skills: 'skills',
            races: 'races',
            jobs: 'jobs',
            maps: 'maps',
            starterKits: 'starterKits',
            'starter-kits': 'starterKits'
        };

        const targetCollection = collectionMap[collectionId];
        if (!targetCollection) {
            return res.status(400).json({ message: 'Invalid collection' });
        }

        const payload = { ...req.body };
        const docId = payload.id || payload.job || payload.name;

        if (!docId) {
            return res.status(400).json({ message: 'Document id is required' });
        }

        delete payload.id;
        await req.db.collection(targetCollection).doc(String(docId)).set(payload);
        res.json({ success: true, message: 'Document created successfully', id: String(docId) });
    } catch (error) {
        console.error('Create error:', error);
        res.status(500).json({ message: 'Error creating document' });
    }
});

router.put('/:collectionId/:docId', verifyToken, async (req, res) => {
    console.log('Generic collection PUT hit', { path: req.path, params: req.params });
    try {
        const { collectionId, docId } = req.params;
        const allowedCollections = ['characters', 'items', 'monsters', 'skills', 'races', 'jobs', 'maps', 'starterKits'];
        
        if (!allowedCollections.includes(collectionId)) {
            return res.status(400).json({ message: 'Invalid collection' });
        }

        const updateData = { ...req.body };
        delete updateData.id;

        await req.db.collection(collectionId).doc(docId).update(updateData);
        res.json({ success: true, message: 'Document updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating document' });
    }
});

/**
 * GET /api/admin/admins
 * Get all admin accounts (super_admin only)
 */
router.get('/admins', verifyToken, async (req, res) => {
    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({ message: 'Permission denied' });
    }

    try {
        const admins = await getAllAdmins(req.db);
        res.json(admins);
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ message: 'Error fetching admins' });
    }
});

/**
 * PUT /api/admin/account/credentials
 * Update the currently authenticated admin credentials
 */
 

module.exports = { router, verifyToken };
