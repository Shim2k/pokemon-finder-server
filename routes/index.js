var express = require('express');
var router = express.Router();

///////////// CONFIGURATION FILES /////////////
var config = require('../config.js');
var locations = require('../locations.js');
var credentials = require('../credentials.js');
/////////////         END         /////////////

var sys = require('util')
var exec = require('child_process').exec;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('wall');
});

router.get('/main', function(req, res, next) {
  console.log(req.query['pass']);
  if (req.query['pass'] === 'lol') {
    res.render('index', { title: 'Shim\'s Pokemap', locations: locations });
  } else {
    res.render('wall', { details : 'סיסמא לא נכונה יגבר'});
  }
});

router.post('/login', function(req, res, next) {
  console.log(req);
  res.redirect('/main?pass=' + req.body.name);
});

router.get('/setup', function(req, res, next) {
  pwd = exec("pwd", function (error, stdout, stderr) {
    if (error) { console.log('error writing to bash'); }
  });

  // Installing pokemon finder
  exec('git clone https://github.com/AHAAAAAAA/PokemonGo-Map.git', function(error, stdout, stderr) {
    exec('sudo -H python "PokemonGo-Map/Easy Setup/get-pip.py"', function(error, stdout, stderr) {
      output(error, stdout, stderr);
      exec('cd PokemonGo-Map/ && pip install -r requirements.txt', function(error, stdout, stderr) {
        output(error, stdout, stderr);
      })
    });
  });

  res.send('setting up dependencies..');
});

function output(error, stdout, stderr) {
  console.log('out: ' + stdout);
  if (stderr) {
    console.log('err: ' + stderr);
  }
  if (error) {
    console.log('error: '+ error);
  }
}

router.get('/shim', function(req, res, next) {
  console.log(req.query['q']);
  exec('cd PokemonGo-Map/ && python runserver.py -u ' + credentials.user + ' -p ' + credentials.pass + ' -l "' +  req.query['q'] + '" -H "0.0.0.0" -st 10', function(error, stdout, stderr) {
    output(error, stdout, stderr);
  })
  setTimeout(function() {
    res.redirect('/map')
  }, 10);
});

router.get('/poke', function(req, res, next) {
  exec("kill -9 $(ps aux | grep runserver.py | grep -v grep | awk '{print $2}')", function(error, stdout, stderr) {
    output(error, stdout, stderr);
    res.redirect('/shim?q=' + req.query['q']);
  });
});

router.get('/location', function(req, res, next) {
  res.redirect('/poke?q=' + req.query['location'])
});

router.get('/map', function(req, res, next) {
  setTimeout(function() {
    res.render('redirect');
    // res.redirect(config.server);
  }, 10);
});

module.exports = router;
