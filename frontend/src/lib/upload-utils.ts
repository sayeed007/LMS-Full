// Upload utilities for handling file uploads to backend/Cloudinary

interface UploadResponse {
  status: string;
  data: {
    url: string;
    publicId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    resourceType: string;
    format: string;
  };
}

interface UploadError {
  status: string;
  message: string;
}

export const uploadFileToBackend = async (
  file: File,
  contentType: string,
  token: string
): Promise<UploadResponse['data']> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', contentType);

    const response = await fetch('/api/v1/upload/file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: UploadError = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data: UploadResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const deleteFileFromBackend = async (
  publicId: string,
  resourceType: string,
  token: string
): Promise<void> => {
  try {
    const response = await fetch('/api/v1/upload/file', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType,
      }),
    });

    if (!response.ok) {
      const errorData: UploadError = await response.json();
      throw new Error(errorData.message || 'Delete failed');
    }
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};

// Helper utilities for MediaContentEditor refs
export interface MediaContentEditorRef {
  uploadSelectedFile: () => Promise<boolean>;
}

/**
 * Helper function to handle file uploads for multiple media editors
 * @param refs Array of refs to MediaContentEditor components
 * @returns Promise<boolean> - true if all uploads succeed, false if any fail
 */
export const uploadAllMediaFiles = async (refs: (React.RefObject<MediaContentEditorRef> | null)[]): Promise<boolean> => {
  try {
    const uploadPromises = refs
      .filter(ref => ref?.current) // Filter out null refs
      .map(ref => ref!.current!.uploadSelectedFile());

    const results = await Promise.all(uploadPromises);

    // Return true only if all uploads succeeded
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error during batch file upload:', error);
    return false;
  }
};

/**
 * Helper function to handle file upload for a single media editor
 * @param ref Ref to MediaContentEditor component
 * @returns Promise<boolean> - true if upload succeeds, false if it fails
 */
export const uploadMediaFile = async (ref: React.RefObject<MediaContentEditorRef> | null): Promise<boolean> => {
  if (!ref?.current) {
    return true; // No file to upload is considered success
  }

  try {
    return await ref.current.uploadSelectedFile();
  } catch (error) {
    console.error('Error during file upload:', error);
    return false;
  }
};