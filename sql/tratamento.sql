-- Caso 2: fluxo diário de passageiros nos controles da TSA
-- Executar a partir da raiz do repositório redesign-visualizacao-dados.
-- Entrada: dados/original/export.csv
-- Saída: dados/tratados/tsa_passageiros_2020_2021.csv

COPY (
    WITH dados_tsa AS (
        SELECT
            strptime(split_part("Date", ' ', 1), '%m/%d/%Y')::DATE AS date,
            TRY_CAST(replace("Current", ',', '') AS BIGINT) AS passengers
        FROM read_csv_auto('dados/original/export.csv', all_varchar = true)
        WHERE "Indicator" = 'Person Throughput at All Airports'
    ),
    dados_validos AS (
        SELECT date, passengers
        FROM dados_tsa
        WHERE date BETWEEN DATE '2020-02-24' AND DATE '2021-01-26'
          AND passengers IS NOT NULL
    ),
    com_media AS (
        SELECT
            date,
            passengers,
            ROUND(AVG(passengers) OVER (
                ORDER BY date
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
            ), 2) AS moving_avg_7d
        FROM dados_validos
    )
    SELECT date, passengers, moving_avg_7d
    FROM com_media
    WHERE date BETWEEN DATE '2020-03-01' AND DATE '2021-01-26'
    ORDER BY date
) TO 'dados/tratados/tsa_passageiros_2020_2021.csv'
  (HEADER, DELIMITER ',');
