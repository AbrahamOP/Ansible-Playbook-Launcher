const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const app = express();
const playbooksDirectory = path.join(__dirname, 'playbooks'); // Dossier où les playbooks sont montés avec Docker

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6380
});

// Ajout de logs pour déboguer les chemins
console.log('Chemin du répertoire courant:', __dirname);
console.log('Chemin du frontend:', path.join(__dirname, 'frontend'));

// Servir les fichiers statiques depuis le dossier frontend
app.use(express.static(path.join(__dirname, 'frontend')));
console.log('Dossier statique:', path.join(__dirname, 'frontend'));

app.use(express.json());
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettre à true en production avec HTTPS
}));

let lastActivity = Date.now();
const INACTIVITY_TIMEOUT = 300000; // 5 minutes

// Modifier la gestion de l'inactivité pour exclure les requêtes statiques
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return next();
  }
  console.log(`Requête API reçue : ${req.path}`);
  lastActivity = Date.now();
  next();
});

setInterval(() => {
  if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
    console.log('Aucune activité détectée. Arrêt du serveur.');
    process.exit(0);
  }
}, 60000); // Vérifier toutes les minutes

// Fonction pour obtenir les playbooks en structure arborescente
function getPlaybooks(directory) {
  const playbooks = [];
  if (!fs.existsSync(directory)) {
    console.error(`Le dossier ${directory} n'existe pas.`);
    return playbooks;
  }

  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      playbooks.push({
        name: file,
        type: 'folder',
        children: getPlaybooks(fullPath)
      });
    } else if (file.endsWith('.yml')) {
      playbooks.push({
        name: file,
        type: 'file',
        path: fullPath
      });
    }
  });
  return playbooks;
}

// Route pour récupérer la structure des playbooks
app.get('/api/playbooks', (req, res) => {
  try {
    const playbooks = getPlaybooks(playbooksDirectory);
    res.json({ playbooks });
  } catch (err) {
    console.error('Erreur lors de la lecture des playbooks:', err);
    res.status(500).json({ error: 'Erreur lors de la lecture des playbooks' });
  }
});

// Route pour exécuter un playbook
app.post('/api/execute', (req, res) => {
  const { path: playbookPath, host } = req.body;

  if (!playbookPath || !host) {
    return res.status(400).json({ error: 'Chemin du playbook ou hôte manquant.' });
  }

  try {
    // Chemin du fichier hosts
    const hostsFilePath = path.join(__dirname, 'hosts');
    const hostsContent = `[mes_vms]\n${host} ansible_user=root\n`;

    // Écrire le fichier hosts
    fs.writeFileSync(hostsFilePath, hostsContent);
    console.log(`Fichier hosts créé à : ${hostsFilePath}`);
    console.log('Contenu du fichier hosts :', hostsContent);

    // Commande pour exécuter le playbook
    const command = `ansible-playbook -i ${hostsFilePath} ${playbookPath}`;
    console.log(`Exécution de la commande : ${command}`);

    const process = exec(command);

    res.setHeader('Content-Type', 'text/plain');

    // Flux de sortie en temps réel
    process.stdout.on('data', data => res.write(data));
    process.stderr.on('data', data => res.write(data));

    process.on('close', code => {
      res.end(`\nExécution terminée avec le code : ${code}`);
      // Supprimer le fichier hosts après exécution
      fs.unlinkSync(hostsFilePath);
      console.log(`Fichier hosts supprimé : ${hostsFilePath}`);
    });

    process.on('error', err => {
      console.error('Erreur lors de l’exécution du playbook :', err);
      res.status(500).end('Erreur lors de l’exécution du playbook.');
    });

  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l’exécution du playbook.' });
  }
});

// Améliorer la redirection vers index.html
app.get('*', (req, res) => {
  console.log(`Tentative d'accès à : ${req.path}`);
  const indexPath = path.join(__dirname, 'frontend', 'index.html');
  console.log(`Envoi du fichier : ${indexPath}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`Fichier non trouvé : ${indexPath}`);
    // Liste les fichiers dans le répertoire frontend pour le débogage
    console.log('Contenu du répertoire frontend:', fs.readdirSync(path.join(__dirname, 'frontend')));
    res.status(404).send('Page non trouvée');
  }
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});