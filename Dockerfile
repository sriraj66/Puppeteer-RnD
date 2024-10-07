FROM node:20

RUN apt-get update && apt-get install -y gnupg wget curl && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Test network connectivity
# RUN curl -I https://www.google.com

RUN which google-chrome-stable || true

# User creation
RUN useradd -m appuser

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir temp/
RUN mkdir csv/

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN chown -R appuser:appuser /app

RUN chmod -R 777 temp/

USER appuser

