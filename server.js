(function() {
    'use strict';
    const express = require('express');
    const app = express();
    const router = express.Router();
    const bodyParser = require('body-parser');
    const areas = require('./areas');

    app.use(bodyParser());

    app.post('/', function(req, res) {
        let route = req.body.route;
        areas.calculateRisk(route, (result) => res.send(result));
    });

    app.post('/rota_risco/areas', function(req, res) {
        let route = req.body.route;
        areas.calculateRisk(route, (result) => res.send(result));
    });

    router.route('/areas/:id')
        .get(function(req, res, next) {
            res.send('Get id: ' + req.params.id);
        })
        .put(function(req, res, next) {
            res.send('Put id: ' + req.params.id);
        })
        .delete(function(req, res, next) {
            res.send('Delete id: ' + req.params.id);
        });

    const server = app.listen(3001, function() {
        console.log('Express is listening to http://localhost:3001');
    });
}());
