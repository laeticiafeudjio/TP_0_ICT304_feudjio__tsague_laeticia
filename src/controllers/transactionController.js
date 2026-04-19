const { db, uuidv4, supabase } = require('../config/db');

function makeReference() {
  return 'TX-' + uuidv4().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function categorieCodeToId(code) {
  const map = { DEPOT: 1, RETRAIT: 2 };
  return map[code] || null;
}

exports.depot = async (req, res) => {
  const { numero_compte, montant, description, canal } = req.body;
  if (!numero_compte || !montant) return res.status(400).json({ error: 'numero_compte et montant requis' });

  if (supabase) {
    const { data: compte, error: compteError } = await supabase.from('comptes').select('*').eq('numero_compte', numero_compte).single();
    if (compteError) {
      if (compteError.code === 'PGRST116' || compteError.code === 'PGRST102') {
        return res.status(404).json({ error: 'compte introuvable' });
      }
      return res.status(500).json({ error: compteError.message });
    }
    if (compte.statut !== 'actif') return res.status(400).json({ error: 'compte inactif' });
    const m = Number(montant);
    if (!(m > 0)) return res.status(400).json({ error: 'montant invalide' });

    const soldeAvant = Number(compte.solde || 0);
    const soldeApres = soldeAvant + m;
    const ref = makeReference();

    const { data: tx, error: txError } = await supabase.from('transactions').insert([{
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
      date_valeur: new Date()
    }]).select('*').single();

    if (txError) return res.status(500).json({ error: txError.message });

    const { error: updateError } = await supabase.from('comptes').update({ solde: soldeApres, updated_at: new Date() }).eq('id', compte.id);
    if (updateError) return res.status(500).json({ error: updateError.message });

    return res.status(201).json({ success: true, message: 'Dépôt effectué', transaction: tx });
  }

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

exports.retrait = async (req, res) => {
  const { numero_compte, montant, description, canal } = req.body;
  if (!numero_compte || !montant) return res.status(400).json({ error: 'numero_compte et montant requis' });

  if (supabase) {
    const { data: compte, error: compteError } = await supabase.from('comptes').select('*').eq('numero_compte', numero_compte).single();
    if (compteError) {
      if (compteError.code === 'PGRST116' || compteError.code === 'PGRST102') {
        return res.status(404).json({ error: 'compte introuvable' });
      }
      return res.status(500).json({ error: compteError.message });
    }
    if (compte.statut !== 'actif') return res.status(400).json({ error: 'compte inactif' });
    const m = Number(montant);
    if (!(m > 0)) return res.status(400).json({ error: 'montant invalide' });
    if (Number(compte.solde) < m) return res.status(400).json({ error: 'solde insuffisant' });
    if (compte.plafond_retrait && m > Number(compte.plafond_retrait)) return res.status(400).json({ error: 'montant dépasse le plafond de retrait' });

    const soldeAvant = Number(compte.solde || 0);
    const soldeApres = soldeAvant - m;
    const ref = makeReference();

    const { data: tx, error: txError } = await supabase.from('transactions').insert([{
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
      date_valeur: new Date()
    }]).select('*').single();

    if (txError) return res.status(500).json({ error: txError.message });

    const { error: updateError } = await supabase.from('comptes').update({ solde: soldeApres, updated_at: new Date() }).eq('id', compte.id);
    if (updateError) return res.status(500).json({ error: updateError.message });

    return res.status(201).json({ success: true, message: 'Retrait effectué', transaction: tx });
  }

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

exports.listTransactions = async (req, res) => {
  const { numero_compte } = req.query;
  if (supabase) {
    if (numero_compte) {
      const { data: compte, error: compteError } = await supabase.from('comptes').select('id').eq('numero_compte', numero_compte).single();
      if (compteError) {
        if (compteError.code === 'PGRST116' || compteError.code === 'PGRST102') {
          return res.status(404).json({ error: 'compte introuvable' });
        }
        return res.status(500).json({ error: compteError.message });
      }
      const { data: txs, error: txError } = await supabase.from('transactions').select('*').eq('compte_id', compte.id);
      if (txError) return res.status(500).json({ error: txError.message });
      return res.json(txs);
    }
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (numero_compte) {
    const compte = db.comptes.find(c => c.numero_compte === numero_compte);
    if (!compte) return res.status(404).json({ error: 'compte introuvable' });
    const txs = db.transactions.filter(t => t.compte_id === compte.id);
    return res.json(txs);
  }
  res.json(db.transactions);
};
