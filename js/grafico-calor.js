const caminhoDadosCalor = "../dados/tratados/passageiros_mensais_eua.csv";

d3.csv(caminhoDadosCalor, (d) => ({
  year: +d.year,
  month: +d.month,
  passengers: +d.passengers,
}))
  .then((dados) => {
    dados = dados
      .filter(
        (d) =>
          Number.isInteger(d.year) &&
          Number.isInteger(d.month) &&
          d.month >= 1 &&
          d.month <= 12 &&
          Number.isFinite(d.passengers),
      )
      .sort((a, b) => a.year - b.year || a.month - b.month);

    if (!dados.length) {
      throw new Error("Nenhum dado válido encontrado.");
    }

    const anos = d3.range(
      d3.min(dados, (d) => d.year),
      d3.max(dados, (d) => d.year) + 1,
    );

    const meses = d3.range(1, 13);

    const nomesMeses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const largura = 950;
    const margem = {
      top: 85,
      right: 65,
      bottom: 110,
      left: 90,
    };

    const tamanhoCelula = 43;
    const espaco = 7;
    const passo = tamanhoCelula + espaco;

    const altura = margem.top + anos.length * passo + margem.bottom;

    const svg = d3
      .select("#grafico-calor")
      .append("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("role", "img")
      .attr(
        "aria-label",
        "Mapa de calor dos passageiros aéreos mensais nos Estados Unidos, de 2000 a outubro de 2020.",
      );

    const maximo = d3.max(dados, (d) => d.passengers);

    const escalaCor = d3
      .scaleSequential()
      .domain([0, maximo])
      .interpolator(d3.interpolateBlues);

    const formatarNumero = (valor) => valor.toLocaleString("pt-BR");

    const formatarMilhoes = (valor) =>
      `${(valor / 1000000).toFixed(1).replace(".", ",")} mi`;

    // Título dos eixos
    svg
      .append("text")
      .attr("x", margem.left)
      .attr("y", 35)
      .attr("font-size", 15)
      .attr("font-weight", 600)
      .attr("fill", "#334155")
      .text("Passageiros por mês e ano");

    // Rótulos dos meses
    meses.forEach((mes, indice) => {
      svg
        .append("text")
        .attr("x", margem.left + indice * passo + tamanhoCelula / 2)
        .attr("y", margem.top - 18)
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("font-weight", 600)
        .attr("fill", "#334155")
        .text(nomesMeses[indice]);
    });

    // Rótulos dos anos
    anos.forEach((ano, indice) => {
      svg
        .append("text")
        .attr("x", margem.left - 15)
        .attr("y", margem.top + indice * passo + tamanhoCelula / 2 + 5)
        .attr("text-anchor", "end")
        .attr("font-size", 13)
        .attr("font-weight", ano === 2020 ? 700 : 400)
        .attr("fill", ano === 2020 ? "#b45309" : "#334155")
        .text(ano);
    });

    // Células do mapa de calor
    svg
      .selectAll(".celula-calor")
      .data(dados)
      .enter()
      .append("rect")
      .attr("class", "celula-calor")
      .attr("x", (d) => margem.left + (d.month - 1) * passo)
      .attr("y", (d) => margem.top + (d.year - anos[0]) * passo)
      .attr("width", tamanhoCelula)
      .attr("height", tamanhoCelula)
      .attr("rx", 4)
      .attr("fill", (d) => escalaCor(d.passengers))
      .attr("stroke", "none");

    // Meses sem dados no final de 2020
    const mesesDisponiveis = new Set(dados.map((d) => `${d.year}-${d.month}`));

    const mesesSemDados = [];

    anos.forEach((ano) => {
      meses.forEach((mes) => {
        if (!mesesDisponiveis.has(`${ano}-${mes}`)) {
          mesesSemDados.push({ year: ano, month: mes });
        }
      });
    });

    svg
      .selectAll(".celula-sem-dados")
      .data(mesesSemDados)
      .enter()
      .append("rect")
      .attr("class", "celula-sem-dados")
      .attr("x", (d) => margem.left + (d.month - 1) * passo)
      .attr("y", (d) => margem.top + (d.year - anos[0]) * passo)
      .attr("width", tamanhoCelula)
      .attr("height", tamanhoCelula)
      .attr("rx", 4)
      .attr("fill", "#f1f5f9")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-dasharray", "3,3");

    // Tooltip
    const tooltip = d3
      .select("#grafico-calor")
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    svg
      .selectAll(".celula-calor")
      .on("mousemove", function (event, d) {
        d3.select(this).attr("stroke", "#0f172a").attr("stroke-width", 2);

        tooltip.style("display", "block").html(`
          <strong>${nomesMeses[d.month - 1]}/${d.year}</strong>
          <p>Passageiros:
          <strong>${formatarNumero(d.passengers)}</strong></p>
          <p>Em milhões:
          <strong>${formatarMilhoes(d.passengers)}</strong></p>
        `);

        const container = document.querySelector("#grafico-calor");

        const [px, py] = d3.pointer(event, container);

        const larguraContainer = container.clientWidth;

        tooltip
          .style(
            "left",
            `${Math.max(0, Math.min(px + 15, larguraContainer - 220))}px`,
          )
          .style("top", `${Math.max(0, py - 65)}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke", "none");
        tooltip.style("display", "none");
      });

    // Legenda de cores
    const legendaX = margem.left;
    const legendaY = altura - 65;
    const larguraLegenda = 350;

    svg
      .selectAll(".legenda-cor")
      .data(d3.range(100))
      .enter()
      .append("rect")
      .attr("x", (i) => legendaX + (i * larguraLegenda) / 100)
      .attr("y", legendaY)
      .attr("width", larguraLegenda / 100 + 0.5)
      .attr("height", 15)
      .attr("fill", (i) => escalaCor((i / 99) * maximo));

    [0, 0.5, 1].forEach((fracao) => {
      svg
        .append("text")
        .attr("x", legendaX + fracao * larguraLegenda)
        .attr("y", legendaY + 34)
        .attr(
          "text-anchor",
          fracao === 0 ? "start" : fracao === 1 ? "end" : "middle",
        )
        .attr("font-size", 12)
        .attr("fill", "#475569")
        .text(formatarMilhoes(fracao * maximo));
    });

    svg
      .append("text")
      .attr("x", legendaX)
      .attr("y", legendaY - 12)
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .text("Quantidade mensal de passageiros");

    // Indicação dos meses sem dados
    if (mesesSemDados.length > 0) {
      svg
        .append("rect")
        .attr("x", margem.left + 450)
        .attr("y", legendaY)
        .attr("width", 15)
        .attr("height", 15)
        .attr("rx", 2)
        .attr("fill", "#f1f5f9")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-dasharray", "3,3");

      svg
        .append("text")
        .attr("x", margem.left + 474)
        .attr("y", legendaY + 12)
        .attr("font-size", 12)
        .attr("fill", "#475569")
        .text("Sem dados");
    }
  })
  .catch((erro) => {
    console.error("Erro ao carregar o mapa de calor:", erro);

    d3.select("#grafico-calor")
      .append("p")
      .text("Não foi possível carregar o mapa de calor.");
  });
