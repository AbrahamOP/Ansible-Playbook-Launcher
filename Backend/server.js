const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const session = require('express-session');

const app = express();
const playbooksDirectory = path.join('/playbooks'); // Dossier monté avec Docker pour les playbooks

app.use(express.json());
app.use(session({
  secret: 'votre_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Mettre à true en production avec HTTPS
}));

// Servir les fichiers statiques depuis le dossier "frontend"
app.use(express.static(path.join(__dirname, 'frontend')));

// Fonction pour obtenir les playbooks en structure arborescente
function getPlaybooks(directory) {
  const playbooks = [];
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

  // Chemin du fichier hosts
  const hostsFilePath = path.join(__dirname, 'hosts');
  const hostsContent = `[mes_vms]\n${host} ansible_user=root\n`;

  fs.writeFileSync(hostsFilePath, hostsContent);
  console.log(`Fichier hosts créé à : ${hostsFilePath}`);
  console.log('Contenu du fichier hosts :', hostsContent);

  const command = `ansible-playbook -i ${hostsFilePath} ${playbookPath}`;
  const process = exec(command);

  res.setHeader('Content-Type', 'text/plain');
  process.stdout.on('data', data => res.write(data));
  process.stderr.on('data', data => res.write(data));
  process.on('close', () => {
    res.end();
    fs.unlinkSync(hostsFilePath);
    console.log(`Fichier hosts supprimé de : ${hostsFilePath}`);
  });
});

// Rediriger les requêtes non capturées vers index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
