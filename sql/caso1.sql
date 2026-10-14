
-- CASO 1: Montanhas-russas
-- Fonte: Makeover Monday - Tallest Rollercoasters
-- Unidade de medida: pés (ft)

-- 1. Visualizar todos os registros
SELECT *
FROM read_csv_auto('dados/montanhas.csv');

-- 2. Validar quantidade e estatísticas das quedas
SELECT
    COUNT(*) AS total,
    MIN(queda) AS menor,
    MAX(queda) AS maior,
    ROUND(AVG(queda), 2) AS media
FROM read_csv_auto('dados/montanhas.csv');

-- 3. Analisar as atrações por país
SELECT
    pais,
    COUNT(*) AS quantidade,
    MAX(queda) AS maior_queda
FROM read_csv_auto('dados/montanhas.csv')
GROUP BY pais
ORDER BY maior_queda DESC;

-- 4. Organizar o ranking das maiores quedas
SELECT
    nome,
    pais,
    queda
FROM read_csv_auto('dados/montanhas.csv')
ORDER BY queda DESC;

-- 5. Verificar registros com informações ausentes
SELECT *
FROM read_csv_auto('dados/montanhas.csv')
WHERE nome IS NULL
   OR pais IS NULL
   OR queda IS NULL;
