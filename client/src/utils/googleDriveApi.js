/**
 * Google Drive API Integration Utility
 * 
 * Note: To use this in production, you must set up a Google Cloud Project,
 * enable the Google Drive API, and configure an OAuth consent screen to get a Client ID.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let codeClient = null;

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
 * Initializes Google Identity Services (GIS) for offline access.
 */
export function initGoogleDriveApi(onAuthSuccess, onAuthError) {
  if (!CLIENT_ID) {
    console.warn("Google Drive API: Missing VITE_GOOGLE_CLIENT_ID. Integration will be mocked.");
    return;
  }

  const initClient = () => {
    codeClient = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      ux_mode: 'popup',
      callback: async (response) => {
        if (response && response.code) {
          try {
            // Send auth code to backend
            const tokenStr = localStorage.getItem('lifeos_token');
            const res = await fetch('http://localhost:5000/api/auth/google-auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenStr}`
              },
              body: JSON.stringify({ code: response.code, redirect_uri: window.location.origin })
            });
            const data = await res.json();
            if (res.ok && data.access_token) {
              onAuthSuccess(data.access_token);
            } else {
              if (onAuthError) onAuthError('Failed to exchange code');
            }
          } catch (err) {
            console.error(err);
            if (onAuthError) onAuthError('Error during token exchange');
          }
        } else {
          if (onAuthError) onAuthError('Failed to retrieve auth code');
        }
      },
    });
  };

  if (!document.getElementById('google-gsi-script')) {
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initClient;
    script.onerror = () => {
      if (onAuthError) onAuthError('Failed to load Google Identity Services');
    };
    document.body.appendChild(script);
  } else {
    if (window.google?.accounts?.oauth2) {
      initClient();
    }
  }
}

export function requestGoogleDriveAccess() {
  if (codeClient) {
    codeClient.requestCode();
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
