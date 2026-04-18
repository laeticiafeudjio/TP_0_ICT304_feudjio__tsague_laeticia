const { db } = require('../config/db');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

exports.listClients = (req, res) => {
  res.json(db.clients);
};

exports.createClient = (req, res) => {
  const body = req.body || {};
  if (!body || Object.keys(body).length === 0) {
    return res.status(400).json({ error: 'Requête vide ou Content-Type incorrect (attendu application/json)' });
  }
  const { nom, prenom, email, telephone, adresse, date_naissance, numero_cni } = body;
  if (!nom || !prenom || !email) {
    return res.status(400).json({ error: 'nom, prenom et email requis' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'email invalide' });
  }
  const exists = db.clients.find(c => c.email === email || (numero_cni && c.numero_cni === numero_cni));
  if (exists) return res.status(409).json({ error: 'client déjà existant' });

  const newClient = {
    id: Math.max(0, ...db.clients.map(c => c.id)) + 1,
    nom,
    prenom,
    email,
    telephone: telephone || null,
    adresse: adresse || null,
    date_naissance: date_naissance || null,
    numero_cni: numero_cni || null,
    statut: 'actif',
    created_at: new Date(),
    updated_at: new Date()
  };
  db.clients.push(newClient);
  res.status(201).json(newClient);
};

exports.getClient = (req, res) => {
  const id = Number(req.params.id);
  const client = db.clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'client non trouvé' });
  res.json(client);
};
