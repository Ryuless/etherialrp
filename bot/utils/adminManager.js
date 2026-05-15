// Admin Management Utilities
const crypto = require('crypto');

// Helper to detect admin SDK (server) vs client modular SDK
function isAdminDb(db) {
    return db && typeof db.collection === 'function';
}

async function getDocSnapshot(db, collectionName, id) {
    if (isAdminDb(db)) {
        const ref = db.collection(collectionName).doc(String(id));
        return await ref.get();
    } else {
        const { doc, getDoc } = require('firebase/firestore');
        const ref = doc(db, collectionName, String(id));
        return await getDoc(ref);
    }
}

async function setDocument(db, collectionName, id, data) {
    if (isAdminDb(db)) {
        const ref = db.collection(collectionName).doc(String(id));
        return await ref.set(data);
    } else {
        const { doc, setDoc } = require('firebase/firestore');
        const ref = doc(db, collectionName, String(id));
        return await setDoc(ref, data);
    }
}

async function updateDocument(db, collectionName, id, data) {
    if (isAdminDb(db)) {
        const ref = db.collection(collectionName).doc(String(id));
        return await ref.update(data);
    } else {
        const { doc, updateDoc } = require('firebase/firestore');
        const ref = doc(db, collectionName, String(id));
        return await updateDoc(ref, data);
    }
}

async function deleteDocument(db, collectionName, id) {
    if (isAdminDb(db)) {
        const ref = db.collection(collectionName).doc(String(id));
        return await ref.delete();
    } else {
        const { doc, deleteDoc } = require('firebase/firestore');
        const ref = doc(db, collectionName, String(id));
        return await deleteDoc(ref);
    }
}

async function getCollectionDocs(db, collectionName, constraints = []) {
    if (isAdminDb(db)) {
        let ref = db.collection(collectionName);
        // Basic where constraints support
        for (const c of constraints) {
            // c = { field, op, value }
            ref = ref.where(c.field, c.op, c.value);
        }
        const snap = await ref.get();
        return snap.docs;
    } else {
        const { collection, getDocs, query, where } = require('firebase/firestore');
        const colRef = collection(db, collectionName);
        let q = colRef;
        if (constraints.length > 0) {
            const wheres = constraints.map(c => where(c.field, c.op, c.value));
            q = query(colRef, ...wheres);
        }
        const snap = await getDocs(q);
        return snap.docs;
    }
}

/**
 * Create admin account
 * @param {Firestore} db - Firebase instance
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @param {string} email - Admin email
 * @param {string} role - Admin role (super_admin, admin, moderator)
 * @returns {Object} Admin account data
 */
async function createAdminAccount(db, username, password, email, role = 'admin') {
    try {
        // Hash password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        
        // Check if username exists
        const existingAdmin = await getDocSnapshot(db, 'admins', username);
        if (existingAdmin.exists && existingAdmin.exists()) {
            throw new Error('Username already exists');
        }

        // Create admin account
        const adminData = {
            username: username,
            email: email,
            passwordHash: passwordHash,
            role: role,
            permissions: getPermissionsByRole(role),
            createdAt: new Date(),
            lastLogin: null,
            isActive: true
        };

        await setDocument(db, 'admins', username, adminData);
        
        return {
            success: true,
            message: `Admin account '${username}' created successfully`,
            admin: {
                username: username,
                email: email,
                role: role
            }
        };
    } catch (error) {
        console.error('Error creating admin account:', error);
        throw error;
    }
}

/**
 * Verify admin credentials
 * @param {Firestore} db - Firebase instance
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Object} Admin data if valid, null if invalid
 */
async function verifyAdminCredentials(db, username, password) {
    try {
        const adminSnap = await getDocSnapshot(db, 'admins', username);

        if (!adminSnap.exists && !adminSnap.exists()) {
            return null;
        }

        const admin = isAdminDb(db) ? adminSnap.data() : adminSnap.data();
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (admin.passwordHash !== passwordHash) {
            return null;
        }

        if (!admin.isActive) {
            return null;
        }

        // Update last login
        await updateDocument(db, 'admins', username, { lastLogin: new Date() });

        return {
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        };
    } catch (error) {
        console.error('Error verifying admin credentials:', error);
        return null;
    }
}

/**
 * Get permissions based on role
 * @param {string} role - Admin role
 * @returns {Array} Array of permissions
 */
function getPermissionsByRole(role) {
    const permissions = {
        super_admin: [
            'manage_admins',
            'manage_users',
            'manage_quests',
            'manage_events',
            'manage_monsters',
            'manage_items',
            'manage_skills',
            'manage_races',
            'manage_jobs',
            'manage_maps',
            'view_battles',
            'view_logs',
            'system_settings'
        ],
        admin: [
            'manage_users',
            'manage_quests',
            'manage_events',
            'manage_monsters',
            'manage_items',
            'manage_skills',
            'view_battles',
            'view_logs'
        ],
        moderator: [
            'manage_users',
            'manage_quests',
            'view_battles',
            'view_logs'
        ]
    };

    return permissions[role] || [];
}

/**
 * Get all admins
 * @param {Firestore} db - Firebase instance
 * @returns {Array} Array of admin accounts
 */
async function getAllAdmins(db) {
    try {
        const docs = await getCollectionDocs(db, 'admins');
        const admins = [];
        for (const d of docs) {
            admins.push({
                username: isAdminDb(db) ? d.id : d.id,
                ...d.data(),
                passwordHash: undefined
            });
        }

        return admins;
    } catch (error) {
        console.error('Error getting admins:', error);
        throw error;
    }
}

/**
 * Update admin role
 * @param {Firestore} db - Firebase instance
 * @param {string} username - Admin username
 * @param {string} newRole - New role
 */
async function updateAdminRole(db, username, newRole) {
    try {
        await updateDocument(db, 'admins', username, {
            role: newRole,
            permissions: getPermissionsByRole(newRole)
        });

        return { success: true, message: `Admin '${username}' role updated to '${newRole}'` };
    } catch (error) {
        console.error('Error updating admin role:', error);
        throw error;
    }
}

/**
 * Deactivate admin account
 * @param {Firestore} db - Firebase instance
 * @param {string} username - Admin username
 */
async function deactivateAdmin(db, username) {
    try {
        await updateDocument(db, 'admins', username, {
            isActive: false
        });

        return { success: true, message: `Admin '${username}' deactivated` };
    } catch (error) {
        console.error('Error deactivating admin:', error);
        throw error;
    }
}

/**
 * Update admin username and/or password
 * @param {Firestore} db - Firebase instance
 * @param {string} currentUsername - Existing username
 * @param {Object} updates - Update payload
 * @param {string} [updates.newUsername] - New username
 * @param {string} [updates.newPassword] - New password
 * @returns {Object}
 */
async function updateAdminCredentials(db, currentUsername, updates = {}) {
    try {
        const adminSnap = await getDocSnapshot(db, 'admins', currentUsername);
        if (!adminSnap.exists && !adminSnap.exists()) {
            throw new Error('Admin account not found');
        }

        const adminData = adminSnap.data();
        const targetUsername = (updates.newUsername || currentUsername).trim();
        const nextPasswordHash = updates.newPassword
            ? crypto.createHash('sha256').update(updates.newPassword).digest('hex')
            : adminData.passwordHash;

        if (targetUsername !== currentUsername) {
            const existingAdminSnap = await getDocSnapshot(db, 'admins', targetUsername);
            if (existingAdminSnap.exists && existingAdminSnap.exists()) {
                throw new Error('Username already exists');
            }

            const updatedAdmin = {
                ...adminData,
                username: targetUsername,
                passwordHash: nextPasswordHash
            };

            await setDocument(db, 'admins', targetUsername, updatedAdmin);
            await deleteDocument(db, 'admins', currentUsername);

            return {
                success: true,
                usernameChanged: true,
                admin: {
                    username: targetUsername,
                    email: updatedAdmin.email,
                    role: updatedAdmin.role
                }
            };
        }

        await updateDocument(db, 'admins', currentUsername, {
            passwordHash: nextPasswordHash,
            username: currentUsername
        });

        return {
            success: true,
            usernameChanged: false,
            admin: {
                username: currentUsername,
                email: adminData.email,
                role: adminData.role
            }
        };
    } catch (error) {
        console.error('Error updating admin credentials:', error);
        throw error;
    }
}

module.exports = {
    createAdminAccount,
    verifyAdminCredentials,
    getPermissionsByRole,
    getAllAdmins,
    updateAdminRole,
    deactivateAdmin,
    updateAdminCredentials
};
