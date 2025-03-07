# Use the official Puppeteer image as base
FROM ghcr.io/puppeteer/puppeteer:24.4.0

# Run as "pptruser" (non-root user defined in the base image)
USER pptruser

# Set working directory (already exists in base image, but safe to redefine)
WORKDIR /home/pptruser/app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm clean-install for production)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Use the Chromium bundled with the base image (no need for PUPPETEER_SKIP_CHROMIUM_DOWNLOAD)
# Launch arguments are critical for containerized environments
CMD [ "node", "index.js" ]