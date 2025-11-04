/**
 * Cloudinary Diagnostic Script
 *
 * This script helps diagnose Cloudinary configuration issues:
 * 1. Verifies API credentials
 * 2. Tests direct upload with folder parameter
 * 3. Shows what's actually in your Cloudinary account
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Cloudinary Diagnostics\n');
console.log('Configuration:');
console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ MISSING');
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ MISSING');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ MISSING');
console.log('');

async function testUploadWithFolder() {
  console.log('📤 Testing upload with folder parameter...\n');

  // Create a simple test image (1x1 red pixel PNG as base64)
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  try {
    // Test 1: Upload WITHOUT preset (manual folder specification)
    console.log('Test 1: Upload WITHOUT preset (manual folder)');
    const result1 = await cloudinary.uploader.upload(testImage, {
      folder: 'so-quotable/test-manual',
      resource_type: 'image',
    });
    console.log('✅ Success!');
    console.log('   Public ID:', result1.public_id);
    console.log('   URL:', result1.secure_url);
    console.log('   Folder:', result1.folder || 'NO FOLDER METADATA');
    console.log('');

    // Test 2: Upload WITH base-images preset
    console.log('Test 2: Upload WITH base-images preset');
    try {
      const result2 = await cloudinary.uploader.upload(testImage, {
        upload_preset: 'base-images',
        folder: 'so-quotable/people',
        resource_type: 'image',
      });
      console.log('✅ Success!');
      console.log('   Public ID:', result2.public_id);
      console.log('   URL:', result2.secure_url);
      console.log('   Folder:', result2.folder || 'NO FOLDER METADATA');
      console.log('');
    } catch (error: unknown) {
      console.log('❌ Failed with preset:');
      console.log('   Error:', (error as Error).message);
      console.log('   This might mean the preset doesn\'t exist or isn\'t configured for signed uploads');
      console.log('');
    }

    // Test 3: Upload WITHOUT preset but to people folder
    console.log('Test 3: Upload WITHOUT preset to so-quotable/people folder');
    const result3 = await cloudinary.uploader.upload(testImage, {
      folder: 'so-quotable/people',
      resource_type: 'image',
    });
    console.log('✅ Success!');
    console.log('   Public ID:', result3.public_id);
    console.log('   URL:', result3.secure_url);
    console.log('   Folder:', result3.folder || 'NO FOLDER METADATA');
    console.log('');

  } catch (error: unknown) {
    const err = error as Error & { http_code?: number };
    console.error('❌ Upload test failed:');
    console.error('   Error:', err.message);
    if (err.http_code) {
      console.error('   HTTP Code:', err.http_code);
    }
    console.log('');
  }
}

async function listResources() {
  console.log('📋 Listing resources in your Cloudinary account...\n');

  try {
    // List all resources (limit to 30)
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 30,
    });

    if (result.resources.length === 0) {
      console.log('ℹ️  No resources found in your account');
      console.log('   This is normal if you haven\'t uploaded anything yet');
    } else {
      console.log(`Found ${result.resources.length} resources:\n`);
      result.resources.forEach((resource: Record<string, unknown>, index: number) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   Format: ${resource.format}`);
        console.log(`   Created: ${resource.created_at}`);
        console.log(`   URL: ${resource.secure_url}`);
        if (resource.folder) {
          console.log(`   Folder: ${resource.folder}`);
        }
        console.log('');
      });
    }

    // Try to list folders
    try {
      const folders = await cloudinary.api.root_folders();
      if (folders.folders && folders.folders.length > 0) {
        console.log('📁 Root folders in your account:');
        folders.folders.forEach((folder: Record<string, unknown>) => {
          console.log(`   - ${folder.name} (${folder.path})`);
        });
      } else {
        console.log('ℹ️  No root folders found');
      }
    } catch (error: unknown) {
      console.log('ℹ️  Could not list folders (this API might be disabled on free tier)');
    }

  } catch (error: unknown) {
    console.error('❌ Failed to list resources:');
    console.error('   Error:', (error as Error).message);
  }
}

async function checkUploadPresets() {
  console.log('\n🎨 Checking upload presets...\n');

  try {
    const presets = await cloudinary.api.upload_presets();

    if (presets.presets && presets.presets.length > 0) {
      console.log(`Found ${presets.presets.length} upload presets:\n`);
      presets.presets.forEach((preset: Record<string, unknown> & { settings?: { folder?: string } }) => {
        console.log(`📌 ${preset.name}`);
        console.log(`   Unsigned: ${preset.unsigned ? 'Yes' : 'No (Signed)'}`);
        if (preset.settings?.folder) {
          console.log(`   Folder: ${preset.settings.folder}`);
        } else {
          console.log(`   Folder: ⚠️  NOT SET (this is the issue!)`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No upload presets found');
      console.log('   You need to create the presets in Cloudinary dashboard:');
      console.log('   1. Go to Settings → Upload → Upload presets');
      console.log('   2. Create "base-images" preset with folder: so-quotable/people');
      console.log('   3. Create "generated-images" preset with folder: so-quotable/generated');
    }
  } catch (error: unknown) {
    console.error('❌ Failed to check presets:');
    console.error('   Error:', (error as Error).message);
    console.log('   Note: Preset checking requires admin API access');
  }
}

// Run diagnostics
(async () => {
  try {
    await testUploadWithFolder();
    await listResources();
    await checkUploadPresets();

    console.log('\n✅ Diagnostics complete!\n');
    console.log('💡 Next Steps:');
    console.log('1. Check your Cloudinary dashboard: https://console.cloudinary.com');
    console.log('2. Look for the test images we just uploaded');
    console.log('3. Verify the folder structure matches expectations');
    console.log('4. If presets are missing folder config, update them in Settings → Upload');

  } catch (error: unknown) {
    console.error('\n❌ Diagnostic failed:');
    console.error(error);
  }
})();
