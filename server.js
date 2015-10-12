(function() {
    'use strict';
    const express = require('express');
    const app = express();
    const router = express.Router();
    const bodyParser = require('body-parser');
    const areas = require('./areas');

    app.use(bodyParser());

    app.post('/areas', function(req, res) {
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


    app.get('/', function(req, res) {
        res.send('wat');
    });

    const server = app.listen(3000, function() {
        console.log('Express is listening to http://localhost:3000');
    });
}());
