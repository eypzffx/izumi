FROM node:lts-buster

# Install dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  git \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  npm install -g pm2 && \
  rm -rf /var/lib/apt/lists/*

# Clone the repo into /root/rndr
RUN git clone https://github.com/Akshay-Eypz/izumi-bot.git /root/rndr/

# Set working directory
WORKDIR /root/rndr/

# Install project dependencies
RUN yarn install

# Expose port for Render/Koyeb or other platforms
EXPOSE 8000

# Start the bot using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
