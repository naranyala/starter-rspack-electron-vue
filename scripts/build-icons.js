const fs = require('fs');
const path = require('path');

// Copy icon files to dist directory
function copyIcons() {
  const assetsDir = path.join(__dirname, '..', 'src', 'assets');
  const distDir = path.join(__dirname, '..', 'dist');

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy icon files
  const iconFiles = ['icon.png', 'icon.ico'];

  iconFiles.forEach((file) => {
    const sourcePath = path.join(assetsDir, file);
    const destPath = path.join(distDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    } else {
      if (file === 'icon.ico') {
        // If icon.ico doesn't exist, try to copy icon.png as icon.ico
        const pngSourcePath = path.join(assetsDir, 'icon.png');
        if (fs.existsSync(pngSourcePath)) {
          fs.copyFileSync(pngSourcePath, destPath);
          console.log(`Copied ${pngSourcePath} to ${destPath} (as fallback)`);
        } else {
          console.warn(`Warning: ${sourcePath} does not exist`);
        }
      } else {
        console.warn(`Warning: ${sourcePath} does not exist`);
      }
    }
  });
}

copyIcons();
