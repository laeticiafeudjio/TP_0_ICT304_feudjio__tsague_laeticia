const { db } = require('../config/db');

exports.listAccounts = (req, res) => {
  res.json(db.comptes);
};

exports.createAccount = (req, res) => {
  const { numero_compte, client_id, type_compte_id, solde, plafond_retrait, devise } = req.body;
  if (!numero_compte || !client_id || !type_compte_id) {
    return res.status(400).json({ error: 'numero_compte, client_id et type_compte_id requis' });
  }
  if (db.comptes.find(c => c.numero_compte === numero_compte)) {
    return res.status(409).json({ error: 'numero_compte déjà utilisé' });
  }
  const client = db.clients.find(c => c.id === Number(client_id));
  if (!client) return res.status(404).json({ error: 'client introuvable' });

  const newAccount = {
    id: Math.max(0, ...db.comptes.map(c => c.id)) + 1,
    numero_compte,
    client_id: Number(client_id),
    type_compte_id: Number(type_compte_id),
    solde: Number(solde || 0),
    devise: devise || 'XAF',
    statut: 'actif',
    date_ouverture: new Date(),
    plafond_retrait: Number(plafond_retrait || 500000),
    created_at: new Date(),
    updated_at: new Date()
  };
  db.comptes.push(newAccount);
  res.status(201).json(newAccount);
};

exports.getAccountByNumero = (req, res) => {
  const numero = req.params.numero;
  const compte = db.comptes.find(c => c.numero_compte === numero);
  if (!compte) return res.status(404).json({ error: 'compte non trouvé' });
  res.json(compte);
};
