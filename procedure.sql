CREATE OR REPLACE FUNCTION deteccao_risco(
    linha geometry(LineString, 4326)
)
RETURNS TABLE (
    id integer,
    geom geometry(MultiPolygon, 4326),
    criticidade numeric,
    nome varchar
) AS
$BODY$
#variable_conflict use_variable
BEGIN
    WITH
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
    
    RETURN QUERY (
        SELECT
            id,
            geom,
            criticidade,
            nome
        FROM "Areas"
        WHERE
            ST_Disjoint(
                geom,
                linha
            ) IS false
    )
    UNION
    (
        SELECT
            areas_buffer_100metros.id,
            areas_buffer_100metros.geom,
            areas_buffer_100metros.criticidade,
            areas_buffer_100metros.nome
        FROM
            areas_buffer_100metros
        WHERE
            ST_Disjoint(
                areas_buffer_100metros.geom,
                linha
            ) IS false
    )
    UNION
    (
        SELECT
            areas_buffer_200metros.id,
            areas_buffer_200metros.geom,
            areas_buffer_200metros.criticidade,
            areas_buffer_200metros.nome
        FROM
            areas_buffer_200metros
        WHERE
            ST_Disjoint(
                areas_buffer_200metros.geom,
                linha
            ) IS false
    )
    UNION
    (
        SELECT
            areas_buffer_400metros.id,
            areas_buffer_400metros.geom,
            areas_buffer_400metros.criticidade,
            areas_buffer_400metros.nome
        FROM
            areas_buffer_400metros
        WHERE
            ST_Disjoint(
                areas_buffer_400metros.geom,
                linha
            ) IS false
    );
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION deteccao_risco(geometry)
  OWNER TO postgres;
