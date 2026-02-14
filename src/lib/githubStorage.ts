/**
 * GitHub Storage Service - Handle file uploads to GitHub repository
 * Used for large file storage while Firestore handles real-time chat metadata
 */

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  branch?: string;
}

interface FileUploadResult {
  name: string;
  path: string;
  url: string; // Raw content URL for downloading
  size: number;
  type: string;
  uploadedAt: string;
}

let config: GitHubConfig | null = null;

/**
 * Initialize GitHub storage configuration
 */
export function initializeGitHubStorage(cfg: GitHubConfig) {
  config = {
    ...cfg,
    branch: cfg.branch || 'main',
  };
  console.log('✅ GitHub storage initialized:', {
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  });
}

/**
 * Check if GitHub storage is initialized
 */
export function isInitialized(): boolean {
  return config !== null;
}

/**
 * Get GitHub config
 */
function getConfig(): GitHubConfig {
  if (!config) {
    throw new Error('GitHub storage not initialized. Call initializeGitHubStorage() first.');
  }
  return config;
}

/**
 * Upload a file to GitHub
 */
export async function uploadToGitHub(
  file: File,
  applicationId: string,
  userId: string
): Promise<FileUploadResult> {
  try {
    const cfg = getConfig();
    
    // Create file path in GitHub repo: messages/{applicationId}/{userId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filePath = `messages/${applicationId}/${userId}/${filename}`;
    
    console.log('📤 [GITHUB] Uploading file:', {
      name: file.name,
      size: file.size,
      path: filePath,
      repo: `${cfg.owner}/${cfg.repo}`,
    });

    // Convert file to base64 for GitHub API
    const fileContent = await fileToBase64(file);
    
    // GitHub API endpoint to create/update file
    const apiUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`;
    
    console.log('🌐 [GITHUB] Calling API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${cfg.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Upload message attachment: ${file.name}`,
        content: fileContent,
        branch: cfg.branch,
      }),
    });

    console.log('📬 [GITHUB] API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const error = await response.json();
        errorMsg = error.message || error.errors?.[0]?.message || response.statusText;
        console.error('📋 [GITHUB] API Error details:', error);
      } catch (e) {
        console.error('📋 [GITHUB] Could not parse error response');
      }
      
      console.error('❌ [GITHUB] Upload failed:', {
        status: response.status,
        message: errorMsg,
        url: apiUrl,
      });
      throw new Error(`GitHub API error (${response.status}): ${errorMsg}`);
    }

    const result = await response.json();
    
    // Construct the raw content URL for downloading
    const rawUrl = `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${filePath}`;
    
    console.log('✅ [GITHUB] File uploaded successfully:', {
      path: filePath,
      url: rawUrl,
      sha: result.content.sha?.substring(0, 7),
      htmlUrl: result.content.html_url,
    });

    return {
      name: file.name,
      path: filePath,
      url: rawUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = (error as Error).message || String(error);
    console.error('❌ [GITHUB] Error uploading file:', {
      message: errorMessage,
      name: file.name,
      size: file.size,
    });
    throw error;
  }
}

/**
 * Delete a file from GitHub
 */
export async function deleteFromGitHub(filePath: string): Promise<void> {
  try {
    const cfg = getConfig();
    const apiUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${filePath}`;
    
    console.log('🗑️ [GITHUB] Deleting file:', filePath);

    // First, get the current file to get its SHA
    const getResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${cfg.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file info: ${getResponse.statusText}`);
    }

    const fileData = await getResponse.json();

    // Delete the file
    const deleteResponse = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${cfg.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Delete message attachment`,
        sha: fileData.sha,
        branch: cfg.branch,
      }),
    });

    if (!deleteResponse.ok) {
      throw new Error(`GitHub delete failed: ${deleteResponse.statusText}`);
    }

    console.log('✅ [GITHUB] File deleted successfully:', filePath);
  } catch (error) {
    console.error('❌ [GITHUB] Error deleting file:', error);
    throw error;
  }
}

/**
 * Get download URL for a GitHub file
 */
export function getDownloadURL(filePath: string): string {
  const cfg = getConfig();
  return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${filePath}`;
}

/**
 * Convert File to base64 string for GitHub API
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 content (remove data:application/octet-stream;base64, prefix)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check GitHub storage connectivity
 */
export async function checkGitHubConnectivity(): Promise<boolean> {
  try {
    const cfg = getConfig();
    const response = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
      headers: {
        'Authorization': `token ${cfg.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ [GITHUB] Connectivity check failed:', error);
    return false;
  }
}
