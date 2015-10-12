(function() {
    'use strict';
    const pg        = require('pg');
    const conString = 'postgres://postgres:postgres@192.168.33.4/s4c_teste_olddb2';
    const wellknown = require('wellknown');
    const _         = require('lodash');

    function calculateRisk(route, callback) {
        let wkt = wellknown.stringify(route);
        console.log(wkt);
        let client = new pg.Client(conString);

        client.connect(function(err) {
            if (err) {
                return console.error('could not connect to postgres', err);
            }
            let sql = `
            WITH
            linha AS (
                SELECT ST_GeomFromEWKT('SRID=4326;${wkt}')
            ),
            areas_buffer_100metros AS (
                SELECT
                    ST_Buffer(CAST(geom AS geography), 100)::geometry as geom,
                    id,
                    (criticidade * 0.7) AS criticidade,
                    nome
                FROM "Areas"
            ),
            areas_buffer_200metros AS (
                SELECT
                    ST_Buffer(CAST(geom AS geography), 200)::geometry AS geom,
                    id,
                    (criticidade * 0.3) AS criticidade,
                    nome
                FROM "Areas"
            ),
            areas_buffer_400metros AS (
                SELECT
                    ST_Buffer(CAST(geom AS geography), 400)::geometry AS geom,
                    id,
                    (criticidade * 0.1) AS criticidade,
                    nome
                FROM "Areas"
            )

            (
                SELECT
                    id,
                    ST_AsGeoJSON(geom) AS geojson,
                    criticidade,
                    nome
                FROM "Areas"
                WHERE
                    ST_Disjoint(
                        geom,
                        (SELECT * FROM linha)
                    ) IS false
            )
            UNION
            (
                SELECT
                    areas_buffer_100metros.id,
                    ST_AsGeoJSON(areas_buffer_100metros.geom) AS geojson,
                    areas_buffer_100metros.criticidade,
                    areas_buffer_100metros.nome
                FROM
                    areas_buffer_100metros
                WHERE
                    ST_Disjoint(
                        areas_buffer_100metros.geom,
                        (SELECT * FROM linha)
                    ) IS false
            )
            UNION
            (
                SELECT
                    areas_buffer_200metros.id,
                    ST_AsGeoJSON(areas_buffer_200metros.geom) AS geojson,
                    areas_buffer_200metros.criticidade,
                    areas_buffer_200metros.nome
                FROM
                    areas_buffer_200metros
                WHERE
                    ST_Disjoint(
                        areas_buffer_200metros.geom,
                        (SELECT * FROM linha)
                    ) IS false
            )
            UNION
            (
                SELECT
                    areas_buffer_400metros.id,
                    ST_AsGeoJSON(areas_buffer_400metros.geom) AS geojson,
                    areas_buffer_400metros.criticidade,
                    areas_buffer_400metros.nome
                FROM
                    areas_buffer_400metros
                WHERE
                    ST_Disjoint(
                        areas_buffer_400metros.geom,
                        (SELECT * FROM linha)
                    ) IS false
            )`;

            client.query(sql, function(err, result) {
                if (err) {
                    return console.error('error running query', err);
                }
                result = result.rows.map(function(row) {
                    row.geojson = JSON.parse(row.geojson);
                    return row;
                });

                let maxCrit = _.max(result, 'criticidade');

                callback({
                    max: maxCrit !== undefined ? maxCrit.criticidade : 0,
                    results: result
                });

                client.end();
            });

        });
    }

    module.exports.calculateRisk = calculateRisk;
}());
