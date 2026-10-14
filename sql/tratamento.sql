
-- Caso 2: passageiros aéreos mensais nos Estados Unidos
-- Fonte: Makeover Monday 2021, semana 16
-- Período: janeiro de 2000 a outubro de 2020
-- Executar a partir da raiz do repositório redesign-visualizacao-dados.
-- Entrada: dados/original/US Monthly Air Passengers.csv
-- Saída: dados/tratados/passageiros_mensais_eua.csv

COPY (
    SELECT
        YEAR AS year,
        MONTH AS month,
        SUM(Sum_PASSENGERS) AS passengers
    FROM read_csv_auto(
        'dados/original/US Monthly Air Passengers.csv'
    )
    WHERE YEAR BETWEEN 2000 AND 2020
      AND MONTH BETWEEN 1 AND 12
    GROUP BY YEAR, MONTH
    ORDER BY YEAR, MONTH
)
TO 'dados/tratados/passageiros_mensais_eua.csv'
(HEADER, DELIMITER ',');
