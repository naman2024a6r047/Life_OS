import React, { useState, useEffect } from 'react';

export default function DriveImage({ fileId, thumbnailLink, accessToken, alt, className }) {
  const [imgSrc, setImgSrc] = useState(thumbnailLink ? thumbnailLink.replace('=s220', '=s600') : null);
  const [useAuthFetch, setUseAuthFetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(thumbnailLink ? thumbnailLink.replace('=s220', '=s600') : null);
    setUseAuthFetch(!thumbnailLink); // If no thumbnailLink, force auth fetch immediately
    setHasError(false);
  }, [thumbnailLink, fileId]);

  useEffect(() => {
    let objectUrl = null;

    const fetchSecureImage = async () => {
      setIsLoading(true);
      try {
        // Fallback: Fetch original image securely using Access Token
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch image securely');
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
        setHasError(false);
      } catch (err) {
        console.error('Error fetching secure Drive image:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (useAuthFetch && fileId && accessToken) {
      fetchSecureImage();
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [useAuthFetch, fileId, accessToken]);

  const handleError = () => {
    if (!useAuthFetch && accessToken) {
      setUseAuthFetch(true); // Trigger fallback
    } else {
      setHasError(true);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-surface-elevated text-text-muted ${className}`}>
        <div className="w-4 h-4 border-2 border-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-surface-elevated text-text-muted text-xs ${className}`}>
        No Preview
      </div>
    );
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt || 'Drive Image'} 
      className={className} 
      onError={handleError}
    />
  );
}
