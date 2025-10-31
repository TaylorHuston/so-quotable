---
id: TASK-003
title: Configure Cloudinary integration
epic: EPIC-001
status: todo
created: 2025-10-30
updated: 2025-10-30
---

# TASK-003: Configure Cloudinary integration

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description

Set up Cloudinary account, configure API integration with Next.js, and implement functions for image upload, storage, and text overlay transformations. This includes both base image management (person photos) and generated quote image handling with auto-deletion after 30 days.

## Acceptance Criteria

- [ ] Cloudinary account created with free tier (25GB storage/bandwidth)
- [ ] Cloudinary API credentials securely stored in environment variables
- [ ] next-cloudinary package installed and configured
- [ ] Upload preset created for base images (person photos)
- [ ] Upload preset created for generated images with 30-day auto-deletion
- [ ] Convex action created for uploading images to Cloudinary
- [ ] URL transformation function for text overlay on images
- [ ] Image optimization settings configured (auto format, quality)
- [ ] Cloudinary webhook configured for tracking image deletions
- [ ] Sample images uploaded and transformation tested
- [ ] Image delivery through Cloudinary CDN verified

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
