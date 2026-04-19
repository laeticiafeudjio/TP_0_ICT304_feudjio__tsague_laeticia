const { db, supabase } = require('../config/db');

exports.listAccounts = async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('comptes').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  res.json(db.comptes);
};

exports.createAccount = async (req, res) => {
  const { numero_compte, client_id, type_compte_id, solde, plafond_retrait, devise } = req.body;
  if (!numero_compte || !client_id || !type_compte_id) {
    return res.status(400).json({ error: 'numero_compte, client_id et type_compte_id requis' });
  }

  if (supabase) {
    const { data: existingAccount, error: existingError } = await supabase
      .from('comptes')
      .select('id')
      .eq('numero_compte', numero_compte)
      .limit(1);
    if (existingError) return res.status(500).json({ error: existingError.message });
    if (existingAccount && existingAccount.length > 0) {
      return res.status(409).json({ error: 'numero_compte déjà utilisé' });
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', Number(client_id))
      .single();
    if (clientError) {
      if (clientError.code === 'PGRST116' || clientError.code === 'PGRST102') {
        return res.status(404).json({ error: 'client introuvable' });
      }
      return res.status(500).json({ error: clientError.message });
    }

    const { data, error } = await supabase.from('comptes').insert([{ 
      numero_compte,
      client_id: Number(client_id),
      type_compte_id: Number(type_compte_id),
      solde: Number(solde || 0),
      devise: devise || 'XAF',
      statut: 'actif',
      date_ouverture: new Date(),
      plafond_retrait: Number(plafond_retrait || 500000)
    }]).select('*').single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

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

exports.getAccountByNumero = async (req, res) => {
  const numero = req.params.numero;
  if (supabase) {
    const { data, error } = await supabase.from('comptes').select('*').eq('numero_compte', numero).single();
    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST102') {
        return res.status(404).json({ error: 'compte non trouvé' });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  }

  const compte = db.comptes.find(c => c.numero_compte === numero);
  if (!compte) return res.status(404).json({ error: 'compte non trouvé' });
  res.json(compte);
};
