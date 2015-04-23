var models = require('../models');

var Granama = models.Granama;

//renders the game
function gamePage(req, res) {
    res.render('game');
}

module.exports.gamePage = gamePage;