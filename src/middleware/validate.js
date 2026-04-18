exports.jsonBody = (req, res, next) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type must be application/json' });
  next();
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
};
