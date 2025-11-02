function tenantContext(req, res, next) {
  try {
    const tenantId = req.user.tenant_id; // récupéré depuis le JWT
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Tenant not found in token' });
    }
    req.tenantId = tenantId; // on l’ajoute dans la requête
    next();
  } catch (error) {
    console.error('Tenant context error:', error);
    res.status(500).json({ success: false, message: 'Error setting tenant context' });
  }
}

module.exports = tenantContext;
