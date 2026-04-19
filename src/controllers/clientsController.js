const { db, supabase } = require('../config/db');

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

exports.listClients = async (req, res) => {
  if (supabase) {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  res.json(db.clients);
};

exports.createClient = async (req, res) => {
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

  if (supabase) {
    const { data: exists, error: existsError } = await supabase
      .from('clients')
      .select('id')
      .or(numero_cni
        ? `email.eq.${email},numero_cni.eq.${numero_cni}`
        : `email.eq.${email}`)
      .limit(1);
    if (existsError) return res.status(500).json({ error: existsError.message });
    if (exists && exists.length > 0) return res.status(409).json({ error: 'client déjà existant' });

    const { data, error } = await supabase.from('clients').insert([{ 
      nom,
      prenom,
      email,
      telephone: telephone || null,
      adresse: adresse || null,
      date_naissance: date_naissance || null,
      numero_cni: numero_cni || null,
      statut: 'actif'
    }]).select('*').single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  }

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

exports.getClient = async (req, res) => {
  const id = Number(req.params.id);
  if (supabase) {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST102') {
        return res.status(404).json({ error: 'client non trouvé' });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  }

  const client = db.clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'client non trouvé' });
  res.json(client);
};
