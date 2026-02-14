import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Backend API Service
 * Provides utilities for calling Firebase Cloud Functions
 */

export const backendAPI = {
  /**
   * Get all available states (from State Pricing Management)
   */
  async getAvailableStates() {
    try {
      const getAvailableStatesFunc = httpsCallable(functions, 'getAvailableStates');
      const result = await getAvailableStatesFunc({});
      return (result.data as any).states || [];
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  },

  /**
   * Get pricing for a specific state
   */
  async getStatePricing(stateCode: string) {
    try {
      const getStatePricingFunc = httpsCallable(functions, 'getStatePricing');
      const result = await getStatePricingFunc({ stateCode });
      return (result.data as any).state;
    } catch (error) {
      console.error('Error fetching state pricing:', error);
      throw error;
    }
  },

  /**
   * Create a new LLC application
   */
  async createApplication(data: {
    state: string;
    state_name?: string;
    company_name: string;
    package_id: string;
    form_data?: Record<string, unknown>;
  }) {
    try {
      const createApplicationFunc = httpsCallable(functions, 'createApplication');
      const result = await createApplicationFunc(data);
      return (result.data as any);
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  /**
   * Get user's LLC applications
   */
  async getUserApplications() {
    try {
      const getUserApplicationsFunc = httpsCallable(functions, 'getUserApplications');
      const result = await getUserApplicationsFunc({});
      return (result.data as any).applications || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  /**
   * Get all packages with optional state filter
   */
  async getPackages(stateCode?: string) {
    try {
      const getPackagesFunc = httpsCallable(functions, 'getPackages');
      const result = await getPackagesFunc({ stateCode });
      return (result.data as any).packages || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }
};
