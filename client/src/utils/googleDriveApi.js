/**
 * Google Drive API Integration Utility
 * 
 * Note: To use this in production, you must set up a Google Cloud Project,
 * enable the Google Drive API, and configure an OAuth consent screen to get a Client ID.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;

/**
 * Extract Folder ID from a Google Drive URL
 * Example: https://drive.google.com/drive/folders/1abc123... -> 1abc123...
 */
export function extractFolderId(url) {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Initializes Google Identity Services (GIS).
 */
export function initGoogleDriveApi(onAuthSuccess, onAuthError) {
  if (!CLIENT_ID) {
    console.warn("Google Drive API: Missing VITE_GOOGLE_CLIENT_ID. Integration will be mocked.");
    return;
  }

  if (!document.getElementById('google-gsi-script')) {
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            onAuthSuccess(tokenResponse.access_token);
          } else {
            if (onAuthError) onAuthError('Failed to retrieve access token');
          }
        },
      });
    };
    script.onerror = () => {
      if (onAuthError) onAuthError('Failed to load Google Identity Services');
    };
    document.body.appendChild(script);
  } else {
    if (window.google?.accounts?.oauth2) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            onAuthSuccess(tokenResponse.access_token);
          } else {
            if (onAuthError) onAuthError('Failed to retrieve access token');
          }
        },
      });
    }
  }
}

export function requestGoogleDriveAccess() {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else if (!CLIENT_ID) {
    console.warn("Google Drive API: Mocking OAuth request.");
  } else {
    console.error("Google Drive API not fully initialized yet.");
  }
}

/**
 * Uploads a base64 or File object to the specified Google Drive folder.
 */
export async function uploadPhotoToDrive(file, folderId, accessToken, filename = null) {
  if (!accessToken || !CLIENT_ID) {
    console.warn("Google Drive API: Mock upload successful.");
    return { id: 'mock-id-123', webViewLink: 'https://mock-drive-link.com' };
  }

  const metadata = {
    name: filename || file.name,
    mimeType: file.type,
    parents: folderId ? [folderId] : []
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Upload failed: ${errText}`);
  }

  return response.json();
}

/**
 * Fetches all photos from the specified Google Drive folder.
 */
export async function fetchPhotosFromDrive(folderId, accessToken) {
  if (!accessToken || !CLIENT_ID) {
    console.warn("Google Drive API: Mock fetch photos successful.");
    return [];
  }

  // q='folderId in parents' to get files inside the specific folder
  // fields to request id, name, thumbnailLink, webContentLink, createdTime
  const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,thumbnailLink,webContentLink,createdTime)&orderBy=createdTime desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch photos failed: ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}
