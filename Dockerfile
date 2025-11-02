# Utilise une image Node compatible avec Alpine Linux
FROM node:18-alpine

# Crée un dossier de travail
WORKDIR /app

# Copie les fichiers nécessaires
COPY package*.json ./

# Installe les dépendances de production (compatible si package-lock.json n'existe pas)
RUN npm install --production

# Copie le reste du code
COPY . .

# Expose le port du backend
EXPOSE 3000

# Lance le serveur
CMD ["node", "src/index.js"]
