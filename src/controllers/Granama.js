var models = require('../models');

var Granama = models.Granama;

function gamePage(req, res) {
    res.render('game');
}

module.exports.gamePage = gamePage;