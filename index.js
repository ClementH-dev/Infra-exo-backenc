const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(express.json());

// -- Connexion à la base de données SQLite --

const db = new sqlite3.Database('./jeux.db', (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la DB.', err);
  }else {
    console.log('Connexion à la DB réussie.');
  }
});

// -- Création de la table si elle n'existe pas --
db.run(`
  CREATE TABLE IF NOT EXISTS jeux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    genre TEXT,
    plateforme TEXT,
    annee INTEGER
  )
`);



// -- Endpoint 1: Route de test --
app.get('/', (req, res) => {
  res.send('API de gestion de jeux vidéo - Bienvenue !');
});

// -- Endpoint 2: Récupérer tous les jeux --
app.get('/jeux', (req, res) => {
  db.all('SELECT * FROM jeux', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erreur: err.message });
    }
    res.json(rows);
  });
});

// -- Endpoint 3: Ajouter un nouveau jeu --
app.post('/jeux', (req, res) => {
  const { titre, genre, plateforme, annee } = req.body;
  
  if (!titre) {
    return res.status(400).json({ erreur: 'Le titre est requis.' });
  }

  const sql = 'INSERT INTO jeux (titre, genre, plateforme, annee) VALUES (?, ?, ?, ?)';
  db.run(sql, [titre, genre, plateforme, annee], function(err) {
    if (err) {
      return res.status(500).json({ erreur: err.message });
    }
    res.status(201).json({ id: this.lastID, titre, genre, plateforme, annee });
  });
});

// -- Endpoint 4: Récupérer un jeu par ID --
app.get('/jeux/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM jeux WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erreur: err.message });
    }
    if (!row) {
      return res.status(404).json({ erreur: 'Jeu non trouvé' });
    }
    res.json(row);
  });
});

// -- Lancement du serveur --²
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});