import * as ImageManipulator from "expo-image-manipulator";
import type { ListingDraft } from "../forms/listingSchema";

export interface PropertySubmissionResult {
  success: boolean;
  propertyId?: string;
  error?: string;
}

/**
 * Upload images to backend API which handles Supabase Storage uploads
 * This bypasses RLS issues by using the service role key on the backend
 */
async function uploadImagesToBackend(
  imageUris: { uri: string; width: number; height: number }[],
  propertyId: string,
  apiUrl: string,
  clerkToken: string,
  onProgress?: (message: string) => void
): Promise<{ url: string; width: number; height: number }[]> {
  try {
    console.log(`Uploading ${imageUris.length} images via backend...`);
    if (onProgress) onProgress(`Préparation de ${imageUris.length} photos...`);

    // Helper function to convert ArrayBuffer to base64 (React Native compatible)
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      // Use global Buffer if available (Node.js), otherwise use btoa polyfill
      if (typeof Buffer !== "undefined") {
        return Buffer.from(binary, "binary").toString("base64");
      }
      // Fallback for environments without Buffer
      return btoa(binary);
    };

    // Upload images one at a time to avoid body size limits
    const uploadedImages: { url: string; width: number; height: number }[] = [];

    for (let index = 0; index < imageUris.length; index++) {
      const photo = imageUris[index];
      try {
        console.log(
          `Compressing and uploading image ${index + 1}/${imageUris.length}...`
        );

        // Compress and resize image before upload
        // Max width: 1920px (good quality, reasonable size)
        // Compression: 0.7 (70% quality - good balance)
        const maxWidth = 1920;
        const compression = 0.7;

        let compressedUri = photo.uri;
        let finalWidth = photo.width;
        let finalHeight = photo.height;

        // Resize if image is larger than max width
        if (photo.width > maxWidth) {
          const ratio = maxWidth / photo.width;
          const targetHeight = Math.round(photo.height * ratio);

          console.log(
            `Resizing image from ${photo.width}x${photo.height} to ${maxWidth}x${targetHeight}`
          );

          const manipulatedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: maxWidth } }],
            { compress: compression, format: ImageManipulator.SaveFormat.JPEG }
          );

          compressedUri = manipulatedImage.uri;
          finalWidth = manipulatedImage.width;
          finalHeight = manipulatedImage.height;
        } else {
          // Still compress even if we don't resize
          const manipulatedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [],
            { compress: compression, format: ImageManipulator.SaveFormat.JPEG }
          );

          compressedUri = manipulatedImage.uri;
          finalWidth = manipulatedImage.width;
          finalHeight = manipulatedImage.height;
        }

        // Fetch the compressed image
        const response = await fetch(compressedUri);
        const arrayBuffer = await response.arrayBuffer();

        // Convert to base64
        const base64 = arrayBufferToBase64(arrayBuffer);

        // Log size reduction
        const originalSizeKB = Math.round(
          (photo.width * photo.height * 3) / 1024
        );
        const compressedSizeKB = Math.round(arrayBuffer.byteLength / 1024);
        console.log(
          `Image ${index + 1} compressed: ~${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((1 - compressedSizeKB / originalSizeKB) * 100)}% reduction)`
        );

        // Extract extension (always JPEG after compression)
        const ext = "jpg";

        // Send single image to backend
        const uploadResponse = await fetch(
          `${apiUrl}/api/properties/${propertyId}/upload-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${clerkToken}`,
            },
            body: JSON.stringify({
              data: base64,
              width: finalWidth,
              height: finalHeight,
              ext,
              index,
            }),
          }
        );

        // Get response text first to handle non-JSON responses
        const responseText = await uploadResponse.text();
        console.log(`Image ${index + 1} upload status:`, uploadResponse.status);

        if (!uploadResponse.ok) {
          let error;
          try {
            error = JSON.parse(responseText);
          } catch {
            error = { error: responseText || `HTTP ${uploadResponse.status}` };
          }
          console.error(`Error uploading image ${index + 1}:`, error);
          continue; // Skip failed images
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            `Failed to parse response for image ${index + 1}:`,
            parseError
          );
          continue;
        }

        if (result.url) {
          uploadedImages.push({
            url: result.url,
            width: result.width || photo.width,
            height: result.height || photo.height,
          });
          console.log(`Successfully uploaded image ${index + 1}`);
        }
      } catch (error) {
        console.error(`Error processing image ${index + 1}:`, error);
        // Continue with next image
      }
    }

    console.log(
      `Successfully uploaded ${uploadedImages.length}/${imageUris.length} images`
    );
    return uploadedImages;
  } catch (error) {
    console.error("Error uploading images via backend:", error);
    throw error;
  }
}

/**
 * Submit a property listing via the backend API
 * The backend will verify the Clerk token and handle Supabase insertion with service role
 *
 * @param listingData - The listing form data
 * @param clerkToken - Clerk session token for authentication
 * @param onProgress - Callback for progress updates
 */
export async function submitProperty(
  listingData: ListingDraft,
  clerkToken: string,
  onProgress?: (message: string) => void
): Promise<PropertySubmissionResult> {
  try {
    console.log("Starting property submission...");
    if (onProgress) onProgress("Création de l'annonce...");

    // Get the API URL from environment variables
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error(
        "EXPO_PUBLIC_API_URL not configured. Please set it in your environment."
      );
    }

    // Step 1: Create the property first (without images) to get the property ID
    console.log(`Creating property in database at ${apiUrl}/api/properties...`);
    let createResponse;
    try {
      createResponse = await fetch(`${apiUrl}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify({
          listingData: {
            ...listingData,
            photos: [], // Don't send photos yet
          },
        }),
      });
    } catch (networkError) {
      console.error("Network error calling backend:", networkError);
      throw new Error(
        `Failed to connect to backend: ${networkError instanceof Error ? networkError.message : String(networkError)}`
      );
    }

    console.log("Backend response status:", createResponse.status);
    const createResult = await createResponse.json();

    if (!createResponse.ok) {
      console.error("Backend API error:", createResult);
      return {
        success: false,
        error: createResult.error || "Failed to create property listing",
      };
    }

    const propertyId = createResult.propertyId;
    console.log("Property created with ID:", propertyId);

    // Step 2: Upload images via backend API (bypasses RLS)
    if (listingData.photos && listingData.photos.length > 0) {
      try {
        const uploadedPhotos = await uploadImagesToBackend(
          listingData.photos,
          propertyId,
          apiUrl,
          clerkToken,
          onProgress
        );

        if (uploadedPhotos.length === 0) {
          console.warn("No images were uploaded successfully");
        } else {
          console.log(
            `Successfully uploaded and linked ${uploadedPhotos.length} images`
          );
        }
      } catch (imageError) {
        console.error("Error uploading images:", imageError);
        // Don't fail the whole submission if images fail
        // The property is already created, images can be added later
      }
    }

    console.log("Property submitted successfully:", propertyId);

    return {
      success: true,
      propertyId,
    };
  } catch (error) {
    console.error("Error submitting property:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
