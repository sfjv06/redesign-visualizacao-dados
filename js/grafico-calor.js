const caminhoDadosCalor = "../dados/tratados/tsa_passageiros_2020_2021.csv";

d3.csv(caminhoDadosCalor, (d) => ({
  date: d3.timeParse("%Y-%m-%d")(d.date),
  passengers: +d.passengers,
}))
  .then((dados) => {
    dados = dados
      .filter((d) => d.date && Number.isFinite(d.passengers))
      .sort((a, b) => a.date - b.date);

    if (!dados.length) {
      throw new Error("Nenhum dado válido encontrado.");
    }

    const largura = 1050;
    const margem = {
      top: 55,
      right: 110,
      bottom: 85,
      left: 90,
    };

    const tamanhoCelula = 24;
    const espaco = 3;
    const alturaLinha = tamanhoCelula + espaco;

    const inicio = d3.timeMonth.floor(dados[0].date);
    const fim = d3.timeMonth.floor(dados[dados.length - 1].date);
    const meses = d3.timeMonth.range(inicio, d3.timeMonth.offset(fim, 1));

    const maiorDia = 31;
    const larguraUtil = maiorDia * alturaLinha;

    const altura = margem.top + meses.length * alturaLinha + margem.bottom;

    const svg = d3
      .select("#grafico-calor")
      .append("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`)
      .attr("role", "img")
      .attr(
        "aria-label",
        "Mapa de calor do volume diário de passageiros nos aeroportos dos EUA.",
      );

    const escalaCor = d3
      .scaleSequential()
      .domain([0, d3.max(dados, (d) => d.passengers)])
      .interpolator(d3.interpolateBlues);

    const formatarData = d3.timeFormat("%d/%m/%Y");
    const formatarNumero = d3.format(",.0f");

    // Rótulos dos dias do mês
    svg
      .append("text")
      .attr("x", margem.left)
      .attr("y", 17)
      .attr("font-size", 13)
      .attr("font-weight", 600)
      .attr("fill", "#334155")
      .text("Dias do mês →");

    // Rótulos dos meses
    const formatarMes = d3.timeFormat("%b/%y");

    meses.forEach((mes, indice) => {
      svg
        .append("text")
        .attr("x", margem.left - 12)
        .attr("y", margem.top + indice * alturaLinha + tamanhoCelula / 2 + 4)
        .attr("text-anchor", "end")
        .attr("font-size", 12)
        .attr("fill", "#334155")
        .text(formatarMes(mes));
    });

    // Células do mapa de calor
    // Células do mapa de calor
    svg
      .selectAll(".celula-calor")
      .data(dados)
      .enter()
      .append("rect")
      .attr("class", "celula-calor")
      .attr("x", (d) => margem.left + (d.date.getDate() - 1) * alturaLinha)
      .attr("y", (d) => {
        const indiceMes = d3.timeMonth.count(inicio, d.date);
        return margem.top + indiceMes * alturaLinha;
      })
      .attr("width", tamanhoCelula)
      .attr("height", tamanhoCelula)
      .attr("rx", 3)
      .attr("fill", (d) => escalaCor(d.passengers));

    // Fundo cinza para os dias que não existem em cada mês
    meses.forEach((mes, indice) => {
      const quantidadeDias = d3.timeMonth.offset(mes, 1);
      const diasNoMes = d3.timeDay.count(mes, quantidadeDias);

      for (let dia = diasNoMes + 1; dia <= 31; dia++) {
        svg
          .append("rect")
          .attr("x", margem.left + (dia - 1) * alturaLinha)
          .attr("y", margem.top + indice * alturaLinha)
          .attr("width", tamanhoCelula)
          .attr("height", tamanhoCelula)
          .attr("rx", 3)
          .attr("fill", "#f1f5f9")
          .attr("stroke", "#e2e8f0");
      }
    });

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
                    <strong>${formatarData(d.date)}</strong>
                    <p>Passageiros:
                    <strong>${formatarNumero(d.passengers)}</strong></p>
                `);

        const [px, py] = d3.pointer(
          event,
          document.querySelector("#grafico-calor"),
        );

        const larguraContainer =
          document.querySelector("#grafico-calor").clientWidth;

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

    // Legenda de cores com valores numéricos
    const legendaX = margem.left;
    const legendaY = altura - 40;
    const larguraLegenda = 350;
    const maximo = d3.max(dados, (d) => d.passengers);

    svg
      .selectAll(".legenda-cor")
      .data(d3.range(10))
      .enter()
      .append("rect")
      .attr("x", (i) => legendaX + (i * larguraLegenda) / 10)
      .attr("y", legendaY)
      .attr("width", larguraLegenda / 10)
      .attr("height", 14)
      .attr("fill", (i) => escalaCor((i / 9) * maximo));

    const formatarMilhoes = (valor) =>
      `${(valor / 1000000).toFixed(1).replace(".", ",")} mi`;

    [0, 0.5, 1].forEach((fracao) => {
      svg
        .append("text")
        .attr("x", legendaX + fracao * larguraLegenda)
        .attr("y", legendaY + 31)
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
      .attr("y", legendaY - 10)
      .attr("font-size", 12)
      .attr("fill", "#475569")
      .text("Passageiros por dia");
  })
  .catch((erro) => {
    console.error("Erro ao carregar o mapa de calor:", erro);

    d3.select("#grafico-calor")
      .append("p")
      .text("Não foi possível carregar o mapa de calor.");
  });
