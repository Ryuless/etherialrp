// Database helper functions
const { collection, getDocs, doc, getDoc } = require('firebase/firestore');

/**
 * Get all races from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @returns {Promise<Array>} Array of race names
 */
async function getAllRaces(db) {
    try {
        const racesCollection = collection(db, 'races');
        const racesSnapshot = await getDocs(racesCollection);
        return racesSnapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error getting races:', error);
        return [];
    }
}

/**
 * Get all jobs from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @returns {Promise<Array>} Array of job names
 */
async function getAllJobs(db) {
    try {
        const jobsCollection = collection(db, 'jobs');
        const jobsSnapshot = await getDocs(jobsCollection);
        return jobsSnapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error('Error getting jobs:', error);
        return [];
    }
}

/**
 * Get all map locations from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @returns {Promise<Array>} Array of location objects
 */
async function getAllLocations(db) {
    try {
        const mapsCollection = collection(db, 'maps');
        const mapsSnapshot = await getDocs(mapsCollection);
        const locations = [];
        
        mapsSnapshot.docs.forEach(mapDoc => {
            const mapData = mapDoc.data();
            if (mapData.locations && Array.isArray(mapData.locations)) {
                mapData.locations.forEach(location => {
                    locations.push({
                        id: location,
                        name: location.replace(/_/g, ' '),
                        region: mapData.region
                    });
                });
            }
        });
        
        return locations;
    } catch (error) {
        console.error('Error getting locations:', error);
        return [];
    }
}

/**
 * Get race data from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} raceName - Race name
 * @returns {Promise<Object>} Race data
 */
async function getRaceData(db, raceName) {
    try {
        const raceDoc = await getDoc(doc(db, 'races', raceName));
        return raceDoc.exists() ? raceDoc.data() : null;
    } catch (error) {
        console.error(`Error getting race ${raceName}:`, error);
        return null;
    }
}

/**
 * Get job data from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} jobName - Job name
 * @returns {Promise<Object>} Job data
 */
async function getJobData(db, jobName) {
    try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobName));
        return jobDoc.exists() ? jobDoc.data() : null;
    } catch (error) {
        console.error(`Error getting job ${jobName}:`, error);
        return null;
    }
}

/**
 * Get map data from Firebase
 * @param {Firestore} db - Firebase Firestore instance
 * @param {string} mapId - Map ID
 * @returns {Promise<Object>} Map data
 */
async function getMapData(db, mapId) {
    try {
        const mapDoc = await getDoc(doc(db, 'maps', mapId));
        return mapDoc.exists() ? mapDoc.data() : null;
    } catch (error) {
        console.error(`Error getting map ${mapId}:`, error);
        return null;
    }
}

module.exports = {
    getAllRaces,
    getAllJobs,
    getAllLocations,
    getRaceData,
    getJobData,
    getMapData
};
