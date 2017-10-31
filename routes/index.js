var express = require('express');
var router = express.Router();
var VideoController = require('../controllers/VideoController');


/* Mostramos el formualario para crear usuarios nuevos */
router.get('/', function(req, res)
{
  res.render('index', { title: 'Servicio rest con nodejs, express 4 y mysql WORKER CON SEMAFORO 3002 v6'});
});

module.exports = router;
