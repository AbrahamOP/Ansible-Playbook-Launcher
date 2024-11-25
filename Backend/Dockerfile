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

# Créer le répertoire "playbooks"
RUN mkdir -p /app/playbooks

# Cloner le dépôt Git dans /tmp
RUN git clone https://github.com/AbrahamOP/BDD_Ansible.git /tmp/repo-clone

# Vérifier le contenu du dépôt cloné
RUN ls -la /tmp/repo-clone

# Copier le contenu du dépôt dans le dossier "playbooks"
RUN cp -r /tmp/repo-clone/* /app/playbooks/

# Vérifier le contenu du dossier "playbooks"
RUN ls -la /app/playbooks

# Supprimer le dépôt cloné temporaire
RUN rm -rf /tmp/repo-clone

# Ajouter un fichier placeholder si "playbooks" est vide
RUN touch /app/playbooks/.placeholder

# Exposer le port sur lequel votre application écoute
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]