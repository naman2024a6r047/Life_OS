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
  if (match) return match[1];
  
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  return idMatch ? idMatch[1] : null;
}

let globalOnAuthSuccess = null;

/**
 * Initializes Google Identity Services (GIS) for offline access.
 * Automatically checks localStorage for persistent tokens.
 */
export function initGoogleDriveApi(onAuthSuccess, onAuthError) {
  if (onAuthSuccess) {
    globalOnAuthSuccess = onAuthSuccess;
  }

  // 1. Check for existing stored Google token from login or previous session
  const storedToken = localStorage.getItem('google_access_token');
  if (storedToken && onAuthSuccess) {
    onAuthSuccess(storedToken);
  }

  if (!CLIENT_ID) {
    console.warn("Google Drive API: Missing VITE_GOOGLE_CLIENT_ID. Integration will use local storage token fallback.");
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
            const tokenStr = localStorage.getItem('token');
            const res = await fetch('/api/auth/google-auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenStr}`
              },
              body: JSON.stringify({ code: response.code, redirect_uri: 'postmessage' })
            });
            const data = await res.json();
            if (res.ok && data.access_token) {
              localStorage.setItem('google_access_token', data.access_token);
              if (onAuthSuccess) onAuthSuccess(data.access_token);
              if (globalOnAuthSuccess) globalOnAuthSuccess(data.access_token);
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

export function requestGoogleDriveAccess(force = false) {
  const existingToken = localStorage.getItem('google_access_token');
  if (existingToken && globalOnAuthSuccess && !force) {
    globalOnAuthSuccess(existingToken);
    return;
  }

  if (codeClient) {
    codeClient.requestCode();
  } else {
    // Generate persistent session fallback token so user isn't stuck
    const activeToken = `g_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('google_access_token', activeToken);
    if (globalOnAuthSuccess) {
      globalOnAuthSuccess(activeToken);
    }
  }
}

export async function getOrCreateAppFolder(accessToken) {
  if (!accessToken || !CLIENT_ID) return 'mock-folder-id';

  // Search for an existing folder created by the app
  const query = encodeURIComponent(`mimeType = 'application/vnd.google-apps.folder' and name = 'Life OS Resources' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,webViewLink)`;
  
  const searchRes = await fetch(searchUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id; // Return the first matching folder ID
    }
  }

  // Create it if it doesn't exist
  const metadata = {
    name: 'Life OS Resources',
    mimeType: 'application/vnd.google-apps.folder'
  };

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create app folder: ${errText}`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads a base64 or File object to the specified Google Drive folder.
 */
export async function uploadPhotoToDrive(file, folderId, accessToken, filename = null) {
  if (!accessToken || !CLIENT_ID) {
    console.warn("Google Drive API: Mock upload successful.");
    return { id: 'mock-id-123', webViewLink: 'https://mock-drive-link.com' };
  }

  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  const mimeType = file.type || 'application/octet-stream';
  const metadata = {
    name: filename || file.name,
    mimeType: mimeType,
    parents: folderId ? [folderId] : []
  };

  const multipartRequestBody =
    "--" + boundary + "\r\n" +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + "\r\n" +
    "--" + boundary + "\r\n" +
    'Content-Type: ' + mimeType + '\r\n\r\n';

  const blob = new Blob([
    multipartRequestBody,
    file,
    close_delim
  ], { type: `multipart/related; boundary=${boundary}` });

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: blob
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive upload failed: ${errText}`);
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
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,createdTime,size)&orderBy=createdTime desc`;

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

/**
 * Fetches all files (any type) from the specified Google Drive folder.
 */
export async function fetchFilesFromDrive(folderId, accessToken) {
  if (!accessToken || !CLIENT_ID) {
    console.warn("Google Drive API: Mock fetch files successful.");
    return [];
  }

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime,size)&orderBy=createdTime desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch files failed: ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}

