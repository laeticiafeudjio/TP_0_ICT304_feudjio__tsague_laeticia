const { db, uuidv4 } = require('../config/db');

function makeReference() {
  return 'TX-' + uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function categorieCodeToId(code) {
  const map = { DEPOT: 1, RETRAIT: 2 };
  return map[code] || null;
}

exports.depot = (req, res) => {
  const { numero_compte, montant, description, canal } = req.body;
  if (!numero_compte || !montant) return res.status(400).json({ error: 'numero_compte et montant requis' });
  const compte = db.comptes.find(c => c.numero_compte === numero_compte);
  if (!compte) return res.status(404).json({ error: 'compte introuvable' });
  if (compte.statut !== 'actif') return res.status(400).json({ error: 'compte inactif' });
  const m = Number(montant);
  if (!(m > 0)) return res.status(400).json({ error: 'montant invalide' });

  const ref = makeReference();
  const soldeAvant = Number(compte.solde || 0);
  const soldeApres = soldeAvant + m;

  const tx = {
    id: Math.max(0, ...db.transactions.map(t => t.id)) + 1,
    reference: ref,
    compte_id: compte.id,
    categorie_id: categorieCodeToId('DEPOT'),
    type_operation: 'CREDIT',
    montant: m,
    solde_avant: soldeAvant,
    solde_apres: soldeApres,
    devise: compte.devise || 'XAF',
    description: description || 'Dépôt',
    statut: 'confirmee',
    effectuee_par: null,
    canal: canal || 'API',
    date_valeur: new Date(),
    created_at: new Date()
  };

  db.transactions.push(tx);
  compte.solde = soldeApres;
  compte.updated_at = new Date();

  res.status(201).json({ success: true, message: 'Dépôt effectué', transaction: tx });
};

exports.retrait = (req, res) => {
  const { numero_compte, montant, description, canal } = req.body;
  if (!numero_compte || !montant) return res.status(400).json({ error: 'numero_compte et montant requis' });
  const compte = db.comptes.find(c => c.numero_compte === numero_compte);
  if (!compte) return res.status(404).json({ error: 'compte introuvable' });
  if (compte.statut !== 'actif') return res.status(400).json({ error: 'compte inactif' });
  const m = Number(montant);
  if (!(m > 0)) return res.status(400).json({ error: 'montant invalide' });
  if (Number(compte.solde) < m) return res.status(400).json({ error: 'solde insuffisant' });
  if (compte.plafond_retrait && m > Number(compte.plafond_retrait)) return res.status(400).json({ error: 'montant dépasse le plafond de retrait' });

  const ref = makeReference();
  const soldeAvant = Number(compte.solde || 0);
  const soldeApres = soldeAvant - m;

  const tx = {
    id: Math.max(0, ...db.transactions.map(t => t.id)) + 1,
    reference: ref,
    compte_id: compte.id,
    categorie_id: categorieCodeToId('RETRAIT'),
    type_operation: 'DEBIT',
    montant: m,
    solde_avant: soldeAvant,
    solde_apres: soldeApres,
    devise: compte.devise || 'XAF',
    description: description || 'Retrait',
    statut: 'confirmee',
    effectuee_par: null,
    canal: canal || 'API',
    date_valeur: new Date(),
    created_at: new Date()
  };

  db.transactions.push(tx);
  compte.solde = soldeApres;
  compte.updated_at = new Date();

  res.status(201).json({ success: true, message: 'Retrait effectué', transaction: tx });
};

exports.listTransactions = (req, res) => {
  const { numero_compte } = req.query;
  if (numero_compte) {
    const compte = db.comptes.find(c => c.numero_compte === numero_compte);
    if (!compte) return res.status(404).json({ error: 'compte introuvable' });
    const txs = db.transactions.filter(t => t.compte_id === compte.id);
    return res.json(txs);
  }
  res.json(db.transactions);
};
