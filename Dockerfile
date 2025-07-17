# Etapa base com Node.js e Debian
FROM node:20

# Define o fuso horário explicitamente
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Instala as dependências necessárias para o Chromium funcionar no Docker
RUN apt-get update && apt-get install -y \
    libgbm1 \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    xdg-utils \
    wget \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Cria diretório da aplicação
WORKDIR /app

# Copia e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta (se estiver usando Express)
EXPOSE 3000

# Comando para iniciar o app
CMD ["node", "index.js"]
