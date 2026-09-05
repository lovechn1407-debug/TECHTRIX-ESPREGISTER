// ImgBB Image Upload Service

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '83e3f88941efd1059a89f016ff302d9e';
const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

/**
 * Upload an image file to ImgBB and return its public URL
 * @param {File|Blob} file 
 * @returns {Promise<string>} Hosted image URL
 */
export async function uploadImageToImgBB(file) {
  if (!file) {
    throw new Error('No image file provided for upload.');
  }

  // Validate size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size must be less than 10MB.');
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    if (json && json.data && json.data.url) {
      return json.data.url;
    }

    if (json && json.data && json.data.display_url) {
      return json.data.display_url;
    }

    throw new Error('Invalid response structure from ImgBB API.');
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
}
