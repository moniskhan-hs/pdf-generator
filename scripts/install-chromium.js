import { execSync } from 'child_process';

try {
  console.log('Installing Chromium dependencies...');
  execSync('apt-get update && apt-get install -y chromium chromium-sandbox', { stdio: 'inherit' });
  console.log('Chromium installed successfully');
} catch (error) {
  console.error('Chromium installation failed:', error);
  process.exit(1);
}