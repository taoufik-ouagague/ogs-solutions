import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Get all available states (from State Pricing Management)
 * Returns both US states and custom states configured in the system
 */
export const getAvailableStates = functions.https.onCall(async (data, context) => {
  try {
    const statesSnapshot = await db.collection('package_state').get();
    const states = statesSnapshot.docs.map(doc => ({
      code: doc.data().state,
      name: doc.data().name,
      ...doc.data()
    }));
    
    return {
      success: true,
      states: states,
      count: states.length
    };
  } catch (error) {
    console.error('Error fetching states:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
});

/**
 * Get pricing for a specific state
 */
export const getStatePricing = functions.https.onCall(async (data, context) => {
  const { stateCode } = data;
  
  if (!stateCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'State code is required'
    );
  }

  try {
    const stateDoc = await db.collection('package_state').doc(stateCode).get();
    
    if (!stateDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        `State ${stateCode} not found`
      );
    }

    return {
      success: true,
      state: stateDoc.data()
    };
  } catch (error) {
    console.error('Error fetching state pricing:', error);
    throw new functions.https.HttpsError(
      'internal',
      (error as Error).message
    );
  }
});

/**
 * Create a new LLC application
 */
export const createApplication = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { state, state_name, company_name, package_id, form_data } = data;

  if (!state || !company_name || !package_id) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'State, company name, and package ID are required'
    );
  }

  try {
    const applicationRef = db.collection('llc_applications').doc();
    
    await applicationRef.set({
      id: applicationRef.id,
      user_id: context.auth.uid,
      state,
      state_name: state_name || state,
      company_name,
      package_id,
      form_data: form_data || {},
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return {
      success: true,
      applicationId: applicationRef.id,
      message: 'Application created successfully'
    };
  } catch (error) {
    console.error('Error creating application:', error);
    throw new functions.https.HttpsError(
      'internal',
      (error as Error).message
    );
  }
});

/**
 * Get user's LLC applications
 */
export const getUserApplications = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const applicationsSnapshot = await db
      .collection('llc_applications')
      .where('user_id', '==', context.auth.uid)
      .orderBy('created_at', 'desc')
      .get();

    const applications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      applications: applications,
      count: applications.length
    };
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new functions.https.HttpsError(
      'internal',
      (error as Error).message
    );
  }
});

/**
 * Get all packages (with optional state filter)
 */
export const getPackages = functions.https.onCall(async (data, context) => {
  try {
    const { stateCode } = data || {};
    
    let query: FirebaseFirestore.Query = db.collection('packages');
    
    if (stateCode) {
      query = query.where('state', '==', stateCode);
    }
    
    const packagesSnapshot = await query.get();
    const packages = packagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      packages: packages,
      count: packages.length
    };
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw new functions.https.HttpsError(
      'internal',
      (error as Error).message
    );
  }
});
