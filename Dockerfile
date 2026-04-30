FROM node:20-slim

# Install LibreOffice for file conversion
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create required folders
RUN mkdir -p uploads outputs

EXPOSE 3000

CMD ["node", "server.js"]