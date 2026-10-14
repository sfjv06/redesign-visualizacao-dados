
from pathlib import Path
import os
import duckdb

# Pasta raiz do projeto
pasta_projeto = Path(__file__).resolve().parent.parent

# Caminho do arquivo SQL
caminho_sql = pasta_projeto / "sql" / "tratamento.sql"

# Garante que os caminhos relativos do SQL
# sejam interpretados a partir da raiz do projeto
os.chdir(pasta_projeto)

# Cria a pasta de saída, caso não exista
(pasta_projeto / "dados" / "tratados").mkdir(
    parents=True,
    exist_ok=True
)

# Lê o SQL
codigo_sql = caminho_sql.read_text(encoding="utf-8")

# Executa o tratamento com DuckDB
conexao = duckdb.connect()

try:
    conexao.execute(codigo_sql)
    print("Tratamento executado com sucesso!")
finally:
    conexao.close()
