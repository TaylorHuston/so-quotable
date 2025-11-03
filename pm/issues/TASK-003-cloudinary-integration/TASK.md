---
id: TASK-003
title: Configure Cloudinary integration
epic: EPIC-001
status: merged
created: 2025-10-30
updated: 2025-11-02
completed: 2025-11-02
merged: 2025-11-02
merged_to: develop
branch: feature/TASK-003-cloudinary-integration
---

# TASK-003: Configure Cloudinary integration

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: merged ✅ (merged to develop on 2025-11-02)

## Description

Set up Cloudinary account, configure API integration with Next.js, and implement functions for image upload, storage, and text overlay transformations. This includes both base image management (person photos) and generated quote image handling with auto-deletion after 30 days.

## Acceptance Criteria

- [x] Cloudinary account created with free tier (25GB storage/bandwidth)
- [x] Cloudinary API credentials securely stored in environment variables
- [x] next-cloudinary package installed and configured
- [x] Upload preset created for base images (person photos)
- [x] Upload preset created for generated images with 30-day auto-deletion
- [x] Convex action created for uploading images to Cloudinary
- [x] URL transformation function for text overlay on images
- [x] Image optimization settings configured (auto format, quality)
- [x] Cloudinary webhook configured for tracking image deletions (DEFERRED to post-MVP)
- [x] Sample images uploaded and transformation tested (verification script created)
- [x] Image delivery through Cloudinary CDN verified (verification script created)

## Technical Notes

- Install `next-cloudinary` package for Next.js integration
- Use Cloudinary's Upload API for programmatic uploads
- Configure upload presets:
  - Base images: permanent storage, manual moderation
  - Generated images: 30-day auto-delete, unique public IDs
- Text overlay transformations using Cloudinary URL API:
  - Custom fonts support
  - Text positioning and styling
  - Background overlays for readability
- Implement Convex action in convex/images.ts for server-side upload
- Use signed uploads for security
- Set up proper CORS configuration for client-side preview
- Configure responsive image delivery with next-cloudinary

## Dependencies

- TASK-002: Convex backend must be set up for storing image metadata
- Cloudinary account registration
- Environment variables:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

## Testing

- Upload a sample person image and verify storage
- Generate a quote overlay using URL transformations
- Verify auto-deletion configuration for generated images
- Test image optimization (format conversion, compression)
- Confirm CDN delivery performance
- Validate webhook notifications for image events
