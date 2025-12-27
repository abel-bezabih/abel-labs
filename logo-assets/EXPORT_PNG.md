# How to Export Logo as PNG

## Quick Method (Recommended)

1. **Open the SVG file** (`abel-labs-logo.svg`) in any modern browser (Chrome, Safari, Firefox)
2. **Right-click on the logo** and select "Save image as..." or "Copy image"
3. If that doesn't work, use one of these methods:

## Method 1: Online Converter (Easiest)

1. Go to: https://convertio.co/svg-png/
2. Upload `abel-labs-logo.svg`
3. Click "Convert"
4. Download the PNG file

## Method 2: Browser Screenshot

1. Open `render-logo.html` in your browser
2. Press `Cmd+Shift+4` (Mac) to take a screenshot
3. Select the logo area
4. Save as PNG

## Method 3: Using Preview (Mac)

1. Open `abel-labs-logo.svg` in Preview app
2. Go to File → Export
3. Choose PNG format
4. Set resolution to 300 DPI or higher
5. Save as `abel-labs-logo.png`

## Method 4: Command Line (if you have ImageMagick)

```bash
convert abel-labs-logo.svg -background none abel-labs-logo.png
```

## Recommended Settings for PNG

- **Resolution**: 300 DPI (for print) or 72 DPI (for web)
- **Size**: 2x or 4x the original SVG size for better quality
- **Background**: Transparent (if needed)

---

**Note**: The SVG file is already in the `logo-assets` folder. You can convert it using any of the methods above.












