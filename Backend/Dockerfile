# Utiliser une image Node.js de base
FROM node:16

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY Backend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le dossier Backend et le dossier frontend dans le conteneur
COPY Backend .  
COPY frontend /app/frontend  

# Exposer le port sur lequel votre application écoute
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
