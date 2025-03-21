const admin = require('firebase-admin');
const serviceAccount = require('./twitterclone-47ebf-firebase-adminsdk-ffeu2-ac2901c132.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function setupAdmin() {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail('admin@example.com');
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin'
    });

    // Update user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Admin user setup completed successfully');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

setupAdmin().then(() => process.exit()); 