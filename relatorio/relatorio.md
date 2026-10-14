# Caso 1 — Montanhas-russas: comparação das alturas das quedas

## 1. Visualização original

A visualização original, intitulada *The 10 Tallest Roller Coasters in the World*, foi publicada pela TripSavvy e disponibilizada como referência no Makeover Monday.

O gráfico apresenta atrações de diferentes países e seus respectivos valores de queda, medidos em pés (ft). Seu objetivo é permitir que o leitor identifique as maiores quedas e compare os valores entre as montanhas-russas apresentadas.

**Fonte da visualização:** TripSavvy  
**Fonte dos dados utilizados no redesign:** Makeover Monday — Tallest Rollercoasters

## 2. Problemas identificados

A visualização original apresenta escolhas que podem dificultar a leitura e a comparação dos dados.

**Legibilidade dos rótulos:** a disposição dos nomes das atrações dificulta a leitura rápida, especialmente quando os nomes são longos.

**Excesso de elementos visuais:** o uso de elementos decorativos compete com os dados pela atenção do leitor.

**Comparação dos valores:** a apresentação original não facilita tanto a comparação precisa entre atrações com quedas próximas.

**Hierarquia visual:** a informação principal, que é a altura da queda, poderia receber maior destaque em relação aos elementos secundários.

## 3. Redesign 1 — Ranking interativo de barras horizontais

O primeiro redesign utiliza barras horizontais ordenadas da maior para a menor queda.

Essa escolha facilita a leitura dos nomes das atrações e permite comparar seus valores por meio do comprimento das barras, utilizando uma escala quantitativa com origem em zero.

A visualização também inclui um destaque cromático para a maior queda, rótulos numéricos e informações adicionais ao passar o cursor sobre as barras.

O filtro por país permite explorar subconjuntos dos dados sem modificar a pergunta central da visualização.

## 4. Redesign 2 — Gráfico de pontos agrupados por país

O segundo redesign apresenta as mesmas alturas das quedas utilizando pontos posicionados em uma escala horizontal.

As atrações são organizadas por país, permitindo observar a distribuição dos valores dentro de cada grupo e comparar países diferentes.

O uso de pontos reduz a área ocupada pelas marcas visuais. As cores auxiliam na distinção entre os países, enquanto as informações exibidas ao passar o cursor permitem identificar cada atração.

Esse redesign complementa o primeiro ao priorizar a comparação da distribuição das quedas entre os países representados.

## 5. Tratamento e validação dos dados com DuckDB

Os dados foram organizados em um arquivo CSV contendo o nome da atração, o país e a altura da queda em pés.

O DuckDB foi utilizado para consultar os registros, verificar os tipos de dados e calcular estatísticas descritivas.

Foram identificadas 13 atrações, com queda mínima de 256 pés, máxima de 418 pés e média de 315,77 pés.

Também foi realizada uma consulta de agrupamento por país para obter a quantidade de atrações e a maior queda registrada em cada grupo.

As consultas SQL estão documentadas no arquivo `sql/caso1.sql`.

## 6. Comparação e conclusão

Os dois redesigns procuram corrigir problemas de legibilidade, organização e comparação identificados na visualização original.

O gráfico de barras horizontais favorece a identificação do ranking geral e a comparação das magnitudes. Já o gráfico de pontos agrupados por país oferece uma perspectiva complementar, permitindo analisar a distribuição das alturas entre os países presentes no conjunto de dados.

A utilização do D3.js possibilitou incorporar filtros, animações e informações contextuais, tornando a exploração dos dados mais dinâmica.

Dessa forma, os redesigns não buscam apenas modificar a aparência do gráfico original, mas melhorar a clareza e a interpretação das informações apresentadas.