#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Image paths to validate
const imagePaths = [
  // PWA Icons
  'public/icons/app-icon.svg',
  'public/icons/apple-icon-180.png',
  'public/icons/manifest-icon-192.maskable.png',
  'public/icons/manifest-icon-512.maskable2.png',
  'public/favicon.svg',
  
  // Gym images
  'public/images/gyms/gym-1.svg',
  'public/images/gyms/gym-2.svg',
  'public/images/gyms/gym-3.svg',
  
  // Profile avatars
  'public/images/profiles/avatar-male.svg',
  'public/images/profiles/avatar-female.svg',
  
  // Illustrations
  'public/images/illustrations/workout.svg',
  
  // Logos
  'public/images/logos/logo-horizontal.svg'
];

console.log('🔍 Validating Image Assets...\n');

let allValid = true;
let totalSize = 0;

imagePaths.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    
    console.log(`✅ ${imagePath} (${sizeKB}KB)`);
  } else {
    console.log(`❌ ${imagePath} - NOT FOUND`);
    allValid = false;
  }
});

console.log(`\n📊 Total size: ${(totalSize / 1024).toFixed(2)}KB`);

if (allValid) {
  console.log('\n🎉 All image assets validated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Check browser console for any image loading errors');
  console.log('3. Test PWA installation on mobile devices');
  console.log('4. Verify offline functionality');
} else {
  console.log('\n⚠️  Some image assets are missing. Please check the paths above.');
}

// Validate image constants file
const constFile = 'src/constants/images.ts';
if (fs.existsSync(constFile)) {
  console.log(`✅ Image constants file exists: ${constFile}`);
} else {
  console.log(`❌ Image constants file missing: ${constFile}`);
  allValid = false;
}

process.exit(allValid ? 0 : 1);
