# 🎬 Hero Slideshow - Adding Your Own Visuals

## Current Setup

The hero slideshow automatically cycles through images/videos every 5 seconds. Currently using placeholder images from Unsplash.

## How to Add Your Own Visuals

### Option 1: Use Your Own Project Screenshots/Videos (Recommended)

1. **Take screenshots/videos of your actual projects:**
   - Website designs
   - Mobile app interfaces
   - E-commerce stores
   - Dashboards

2. **Add them to your project:**
   ```bash
   # Create a public folder for images/videos
   mkdir -p apps/client-portal/public/hero-slides
   ```

3. **Update the slides array in `hero-slideshow.tsx`:**
   ```typescript
   const slides = [
     {
       type: 'image',
       url: '/hero-slides/website-1.jpg', // Your image
       alt: 'My website project',
     },
     {
       type: 'video',
       url: '/hero-slides/mobile-app-demo.mp4', // Your video
       alt: 'My mobile app demo',
     },
   ];
   ```

### Option 2: Use High-Quality Stock Media

**Free Image Sources:**
- **Unsplash**: https://unsplash.com/s/photos/website-design
- **Pexels**: https://www.pexels.com/search/website/
- **Pixabay**: https://pixabay.com/images/search/website/

**Free Video Sources:**
- **Pexels Videos**: https://www.pexels.com/videos/
- **Pixabay Videos**: https://pixabay.com/videos/
- **Coverr**: https://coverr.co/

**Search Terms:**
- "website design"
- "mobile app interface"
- "e-commerce website"
- "dashboard design"
- "UI design"
- "web development"

### Option 3: Create Custom Videos

Use tools like:
- **ScreenFlow** (Mac) - Record your website/app in action
- **OBS Studio** (Free) - Screen recording
- **Loom** - Quick screen recordings
- **After Effects** - Animated mockups

## Video Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 or higher
- **Duration**: 5-15 seconds (will loop)
- **File Size**: Keep under 10MB for fast loading
- **Optimization**: Use tools like HandBrake to compress

## Image Requirements

- **Resolution**: 1920x1080 or higher
- **Format**: JPG or WebP
- **Quality**: High (90-100%)
- **File Size**: Optimize for web (use tools like TinyPNG)

## Quick Start

1. Edit `apps/client-portal/src/components/hero-slideshow.tsx`
2. Replace the `slides` array with your visuals
3. Save and refresh your browser

## Example with Mixed Content

```typescript
const slides = [
  {
    type: 'image',
    url: '/hero-slides/my-website.jpg',
    alt: 'My portfolio website',
  },
  {
    type: 'video',
    url: 'https://videos.pexels.com/video-files/123456.mp4',
    alt: 'Mobile app demo',
  },
  {
    type: 'image',
    url: '/hero-slides/ecommerce-site.jpg',
    alt: 'E-commerce project',
  },
];
```

## Tips

1. **Use 6-8 slides** for variety without being overwhelming
2. **Mix images and videos** for dynamic feel
3. **Ensure all visuals are high quality** - blurry images look unprofessional
4. **Test on mobile** - make sure visuals look good on all devices
5. **Optimize file sizes** - large files slow down your site

## Need Help?

- Check the component code in `apps/client-portal/src/components/hero-slideshow.tsx`
- All slides auto-advance every 5 seconds
- Click the dots at the bottom to manually navigate

