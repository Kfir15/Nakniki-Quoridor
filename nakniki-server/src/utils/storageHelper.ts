import sharp from 'sharp';
const { supabase } = require('../lib/supabase');

export const uploadAvatarToSupabase = async (file: Express.Multer.File): Promise<string> => {
    // resize the image
    const processedBuffer = await sharp(file.buffer)
        .resize(256, 256, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

    // create the file name
    const fileName = `public/${Date.now()}_avatar.webp`;

    // upload the avatar
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, processedBuffer, {
            contentType: 'image/webp'
        });
    if (uploadError) throw uploadError;

    // return the url of the avatar
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
};

export const deleteOldAvatar = async (avatarUrl: string) => {
    // check if the avatar is in storage
    if (avatarUrl && avatarUrl.includes('/storage/v1/object/public/avatars/')) {
        // get the file path
        const parts = avatarUrl.split('/storage/v1/object/public/avatars/');
        if (parts.length === 2) {
            const filePath = parts[1];

            // remove the avatar
            const { error } = await supabase.storage.from('avatars').remove([filePath]);

            if (error) {
                console.error("Failed to delete old avatar:", error);
            }
        }
    }
};