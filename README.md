# Ansible Playbook Launcher

Une application web permettant de lister et d'exécuter des playbooks Ansible sur des hôtes spécifiés. L'application est construite en utilisant Node.js et Express pour le backend, et utilise une interface HTML/CSS/JavaScript pour le frontend.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Structure du Projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation avec Docker](#utilisation-avec-docker)
- [Volume Persitant pour les Playbooks](#volume-persitant-pour-les-playbooks)

## Fonctionnalités

- **Lister les playbooks** : Affiche les playbooks disponibles dans un dossier spécifié.
- **Exécuter un playbook** : Permet d'exécuter un playbook sur un hôte spécifié via une interface utilisateur simple.
- **Affichage en temps réel** : Affiche la sortie de la commande Ansible en temps réel dans l'interface.

## Structure du Projet

```
project-root/
├── backend/                 # Contient le code backend (Node.js et Express)
│   ├── server.js            # Code du serveur et des routes API
│   ├── package.json         # Dépendances du backend
│   └── Dockerfile           # Dockerfile pour l'image backend
│
├── frontend/                # Contient le code frontend
│   ├── index.html           # Fichier HTML principal
│   ├── script.js            # JavaScript pour le frontend
│   ├── style.css            # Fichier de styles CSS
│   └── playbooks/           # Dossier monté pour stocker les playbooks
│
├── docker-compose.yml       # Fichier Docker Compose pour orchestrer les services
└── README.md                # Documentation du projet
```

## Prérequis

- **Docker** et **Docker Compose** : Assurez-vous que Docker et Docker Compose sont installés sur votre machine.
- **Node.js** : Si vous souhaitez exécuter l'application en local sans Docker.

## Installation

Si vous souhaitez exécuter l'application sans Docker, suivez les étapes ci-dessous :

1. **Backend** :
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend** : Ouvrez le fichier `frontend/index.html` dans un navigateur.

## Utilisation avec Docker

1. **Construire et démarrer l'application** :

   Dans le dossier racine du projet, exécutez la commande suivante pour construire et démarrer les conteneurs :
   ```bash
   docker-compose up -d
   ```

   L'application sera accessible à l'adresse `http://localhost:3000`.

2. **Arrêter l'application** :

   Pour arrêter les conteneurs, exécutez :
   ```bash
   docker-compose down
   ```

## Volume Persitant pour les Playbooks

Les playbooks Ansible sont stockés dans un volume Docker persistant, ce qui signifie que même si le conteneur est supprimé, les fichiers de playbooks restent sauvegardés. Vous pouvez ajouter des playbooks au volume pour qu'ils soient automatiquement détectés par l'application.

Pour accéder aux playbooks stockés dans le volume :
1. Trouvez le chemin du volume en exécutant :
   ```bash
   docker volume inspect project-root_playbooks
   ```

2. Ajoutez vos fichiers `.yml` dans le dossier monté.


---
