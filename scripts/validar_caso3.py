
import duckdb
from pathlib import Path

arquivo = Path(__file__).resolve().parent.parent / "dados" / "tratados" / "coachella.csv"

conexao = duckdb.connect()

dados = conexao.execute("""
    SELECT
        year,
        friday,
        saturday,
        sunday,
        total
    FROM read_csv_auto(?)
    ORDER BY year
""", [str(arquivo)]).fetchall()

print("DADOS DO COACHELLA:")
for linha in dados:
    print(linha)

ausentes = conexao.execute("""
    SELECT COUNT(*)
    FROM read_csv_auto(?)
    WHERE year IS NULL
       OR friday IS NULL
       OR saturday IS NULL
       OR sunday IS NULL
       OR total IS NULL
""", [str(arquivo)]).fetchone()[0]

print("\nQuantidade de registros com valores ausentes:", ausentes)

diferencas = conexao.execute("""
    SELECT
        year,
        total,
        friday + saturday + sunday AS soma_dias,
        total - (friday + saturday + sunday) AS diferenca
    FROM read_csv_auto(?)
    ORDER BY year
""", [str(arquivo)]).fetchall()

print("\nVALIDAÇÃO DOS TOTAIS:")
for linha in diferencas:
    print(linha)

conexao.close()
