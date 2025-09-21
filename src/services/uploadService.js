const { getStorage } = require('firebase-admin/storage');

const uploadImageBuffer = async (buffer, destinationPath, mimetype = 'image/jpeg') => {
  const bucket = getStorage().bucket();
  const file = bucket.file(destinationPath);

  await file.save(buffer, {
    metadata: { contentType: mimetype },
  });

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2030'
  });

  return url;
};

module.exports = { uploadImageBuffer };
