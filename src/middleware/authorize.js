function authorize(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ message: 'Rôle utilisateur manquant' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    next();
  };
}

module.exports = { authorize };
