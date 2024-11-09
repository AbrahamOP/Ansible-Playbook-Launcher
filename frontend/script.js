let selectedPlaybook = '';

function renderPlaybooks(playbooks, parentElement) {
  playbooks.sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  playbooks.forEach(playbook => {
    const li = document.createElement('li');
    const displayName = playbook.name.replace('.yml', '');
    li.textContent = displayName;

    if (playbook.type === 'folder') {
      const folder = document.createElement('ul');
      folder.style.display = 'none';
      li.classList.add('folder');
      li.addEventListener('click', () => {
        folder.style.display = folder.style.display === 'none' ? 'block' : 'none';
      });
      renderPlaybooks(playbook.children, folder);
      li.appendChild(folder);
    } else if (playbook.type === 'file') {
      const button = document.createElement('button');
      button.textContent = 'Lancer';
      button.addEventListener('click', () => openModal(playbook.path));
      li.appendChild(button);
    }

    parentElement.appendChild(li);
  });
}

fetch('/api/playbooks')
  .then(response => response.json())
  .then(data => {
    const list = document.getElementById('playbook-list');
    renderPlaybooks(data.playbooks, list);
  })
  .catch(error => console.error('Erreur lors du chargement des playbooks:', error));

function openModal(playbookPath) {
  selectedPlaybook = playbookPath;
  const playbookName = playbookPath.split('/').pop().replace('.yml', '');
  document.getElementById('modal-title').textContent = `Lancer ${playbookName}`;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('host').value = '';
}

document.getElementById('execute-btn').addEventListener('click', executePlaybook);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

function executePlaybook() {
  const host = document.getElementById('host').value;
  if (!host) {
    alert('Veuillez entrer un hôte.');
    return;
  }

  closeModal();
  const consoleOutput = document.getElementById('console-output');
  consoleOutput.style.display = 'block';
  consoleOutput.textContent = '';

  fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: selectedPlaybook, host })
  })
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    return reader.read().then(function processText({ done, value }) {
      if (done) return;
      consoleOutput.textContent += decoder.decode(value);
      return reader.read().then(processText);
    });
  })
  .catch(error => {
    consoleOutput.textContent = 'Erreur lors de l\'exécution du playbook : ' + error;
  });
}
