import { supabase } from "@/lib/supabase";

/**
 * Upload an image file to Supabase Storage Bucket ('public-images')
 * Returns the permanent public CDN URL of the uploaded image.
 */
export async function uploadVillageImage(
  file: File,
  folder: "berita" | "umkm" | "perangkat" | "profil" | "dokumen" = "berita"
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase client is not available in current environment.");
  }

  // Generate unique file path: folder/timestamp-random.ext
  const fileExt = file.name.split(".").pop() || "jpg";
  const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const filePath = `${folder}/${Date.now()}-${randomSuffix}.${cleanExt}`;

  const { data, error } = await supabase.storage
    .from("public-images")
    .upload(filePath, file, {
      cacheControl: "31536000", // 1 year cache
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    console.error("Supabase storage upload error:", error);
    throw new Error(`Gagal mengunggah gambar ke server: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("public-images")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
