const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
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
    components: {
      schemas: {
        Jeu: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Identifiant unique du jeu' },
            titre: { type: 'string', description: 'Titre du jeu' },
            genre: { type: 'string', description: 'Genre du jeu' },
            plateforme: { type: 'string', description: 'Plateforme du jeu' },
            annee: { type: 'integer', description: 'Année de sortie' },
          },
          example: {
            id: 1,
            titre: 'Zelda',
            genre: 'Aventure',
            plateforme: 'Switch',
            annee: 2023,
          },
        },
      },
    },
  },
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// -- "Base de données" en mémoire --
let jeux = [];
let nextId = 1;

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
  res.json(jeux);
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

  const nouveauJeu = { id: nextId++, titre, genre, plateforme, annee };
  jeux.push(nouveauJeu);
  res.status(201).json(nouveauJeu);
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
  const id = parseInt(req.params.id);
  const jeu = jeux.find(j => j.id === id);

  if (!jeu) {
    return res.status(404).json({ erreur: 'Jeu non trouvé' });
  }

  res.json(jeu);
});

// -- Lancement du serveur --
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;