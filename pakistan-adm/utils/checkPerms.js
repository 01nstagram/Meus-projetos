module.exports = {
  isOwner: (userId) => {
    const cfg = require('../config/config.json');
    return cfg.proprietarios.includes(userId);
  }
};