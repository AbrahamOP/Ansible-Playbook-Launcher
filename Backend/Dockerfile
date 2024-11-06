# Utiliser une image Node.js de base
FROM node:16

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code de l'application dans le conteneur
COPY . .

# Exposer le port sur lequel votre application écoute
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
