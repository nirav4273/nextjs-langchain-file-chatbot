// Configuration for file upload
export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB - change this single line to modify limit

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.size > FILE_SIZE_LIMIT) {
    const maxSizeMB = FILE_SIZE_LIMIT / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { valid: true };
};