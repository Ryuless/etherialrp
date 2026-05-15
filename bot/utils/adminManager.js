// Admin Management Utilities
const { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const crypto = require('crypto');

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
        const adminRef = doc(db, 'admins', username);
        const existingAdmin = await getDoc(adminRef);
        
        if (existingAdmin.exists()) {
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

        await setDoc(adminRef, adminData);
        
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
        const adminRef = doc(db, 'admins', username);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            return null;
        }

        const admin = adminSnap.data();
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (admin.passwordHash !== passwordHash) {
            return null;
        }

        if (!admin.isActive) {
            return null;
        }

        // Update last login
        await updateDoc(adminRef, {
            lastLogin: new Date()
        });

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
        const adminsCollection = collection(db, 'admins');
        const adminsSnap = await getDocs(adminsCollection);
        const admins = [];

        adminsSnap.forEach(doc => {
            admins.push({
                username: doc.id,
                ...doc.data(),
                passwordHash: undefined // Don't expose password hash
            });
        });

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
        const adminRef = doc(db, 'admins', username);
        await updateDoc(adminRef, {
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
        const adminRef = doc(db, 'admins', username);
        await updateDoc(adminRef, {
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
        const adminRef = doc(db, 'admins', currentUsername);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
            throw new Error('Admin account not found');
        }

        const adminData = adminSnap.data();
        const targetUsername = (updates.newUsername || currentUsername).trim();
        const nextPasswordHash = updates.newPassword
            ? crypto.createHash('sha256').update(updates.newPassword).digest('hex')
            : adminData.passwordHash;

        if (targetUsername !== currentUsername) {
            const newAdminRef = doc(db, 'admins', targetUsername);
            const existingAdmin = await getDoc(newAdminRef);

            if (existingAdmin.exists()) {
                throw new Error('Username already exists');
            }

            const updatedAdmin = {
                ...adminData,
                username: targetUsername,
                passwordHash: nextPasswordHash
            };

            await setDoc(newAdminRef, updatedAdmin);
            await deleteDoc(adminRef);

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

        await updateDoc(adminRef, {
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
