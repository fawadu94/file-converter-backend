FROM node:20-slim

# Install LibreOffice + Python + pdf2docx
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-impress \
    python3 \
    python3-pip \
    --no-install-recommends && \
    pip3 install pdf2docx --break-system-packages && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads outputs

EXPOSE 3000

CMD ["node", "server.js"]