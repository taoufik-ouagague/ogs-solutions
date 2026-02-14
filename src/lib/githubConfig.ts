/**
 * GitHub Storage Configuration
 * Environment variables:
 * VITE_GITHUB_OWNER - GitHub repository owner
 * VITE_GITHUB_REPO - GitHub repository name
 * VITE_GITHUB_TOKEN - GitHub personal access token (with repo scope)
 * VITE_GITHUB_BRANCH - GitHub branch (default: main)
 */

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch: string;
  enabled: boolean;
}

/**
 * Load GitHub configuration from environment variables
 */
export function loadGitHubConfig(): GitHubConfig {
  const owner = import.meta.env.VITE_GITHUB_OWNER || '';
  const repo = import.meta.env.VITE_GITHUB_REPO || '';
  const token = import.meta.env.VITE_GITHUB_TOKEN || '';
  const branch = import.meta.env.VITE_GITHUB_BRANCH || 'main';
  const enabled = !!(owner && repo && token);

  if (!enabled) {
    console.warn('⚠️ GitHub storage not configured. Set VITE_GITHUB_OWNER, VITE_GITHUB_REPO, and VITE_GITHUB_TOKEN environment variables.');
  }

  return {
    owner,
    repo,
    token,
    branch,
    enabled,
  };
}

/**
 * Validate GitHub configuration
 */
export function validateGitHubConfig(config: GitHubConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.owner) errors.push('GitHub owner is required');
  if (!config.repo) errors.push('GitHub repository is required');
  if (!config.token) errors.push('GitHub token is required');
  if (!config.branch) errors.push('GitHub branch is required');

  // Basic format validation for token
  if (config.token && !config.token.startsWith('ghp_') && !config.token.startsWith('github_pat_')) {
    errors.push('GitHub token format appears invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
