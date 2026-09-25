const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');


const app = express();
const port = 3000;

app.use(express.json());

// -- Configuration de Swagger --
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Jeux Vidéo',
      version: '1.0.0',
      description: 'Une API minimale pour gérer une collection de jeux vidéo',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// -- Connexion à la base de données SQLite --
const db = new sqlite3.Database('./jeux.db', (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la DB.', err);
  }else {
    console.log('Connexion à la DB réussie.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS jeux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    genre TEXT,
    plateforme TEXT,
    annee INTEGER
  )
`);

/**
 * @swagger
 * components:
 *   schemas:
 *     Jeu:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique du jeu
 *         titre:
 *           type: string
 *           description: Titre du jeu
 *         genre:
 *           type: string
 *           description: Genre du jeu
 *         plateforme:
 *           type: string
 *           description: Plateforme du jeu
 *         annee:
 *           type: integer
 *           description: Année de sortie
 *       example:
 *         id: 1
 *         titre: Zelda
 *         genre: Aventure
 *         plateforme: Switch
 *         annee: 2023
 */

// -- Endpoint 1: Route de test --
/**
 * @swagger
 * /:
 *   get:
 *     summary: Route de bienvenue
 *     responses:
 *       200:
 *         description: Message de bienvenue
 */
app.get('/', (req, res) => {
  res.send('API de gestion de jeux vidéo - Bienvenue !');
});

// -- Endpoint 2: Récupérer tous les jeux --

/**
 * @swagger
 * /jeux:
 *   get:
 *     summary: Récupère la liste de tous les jeux
 *     tags: [Jeux]
 *     responses:
 *       200:
 *         description: Liste des jeux
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Jeu'
 */
app.get('/jeux', (req, res) => {
  db.all('SELECT * FROM jeux', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erreur: err.message });
    }
    res.json(rows);
  });
});

// -- Endpoint 3: Ajouter un nouveau jeu --
/**
 * @swagger
 * /jeux:
 *   post:
 *     summary: Ajoute un nouveau jeu
 *     tags: [Jeux]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               genre:
 *                 type: string
 *               plateforme:
 *                 type: string
 *               annee:
 *                 type: integer
 *             example:
 *               titre: Zelda
 *               genre: Aventure
 *               plateforme: Switch
 *               annee: 2023
 *     responses:
 *       201:
 *         description: Jeu créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jeu'
 *       400:
 *         description: Titre manquant
 */
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

/**
 * @swagger
 * /jeux/{id}:
 *   get:
 *     summary: Récupère un jeu par son ID
 *     tags: [Jeux]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du jeu
 *     responses:
 *       200:
 *         description: Le jeu trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Jeu'
 *       404:
 *         description: Jeu non trouvé
 */
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

// -- Lancement du serveur --
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});