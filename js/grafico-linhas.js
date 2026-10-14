const caminhoCSV = "../dados/tratados/tsa_passageiros_2020_2021.csv";

d3.csv(caminhoCSV, (d) => ({
  date: d3.timeParse("%Y-%m-%d")(d.date),
  passengers: +d.passengers,
  moving_avg_7d: +d.moving_avg_7d,
}))
  .then((dados) => {
    dados = dados
      .filter((d) => d.date && Number.isFinite(d.moving_avg_7d))
      .sort((a, b) => a.date - b.date);

    if (!dados.length) {
      throw new Error("Não há dados válidos.");
    }

    // Referência: média móvel em 01/03/2020
    const referencia = dados[0].moving_avg_7d;

    dados.forEach((d) => {
      d.indice = (d.moving_avg_7d / referencia) * 100;
    });

    const largura = 950;
    const altura = 490;
    const margem = {
      top: 55,
      right: 45,
      bottom: 65,
      left: 85,
    };

    const svg = d3
      .select("#grafico-linhas")
      .append("svg")
      .attr("viewBox", `0 0 ${largura} ${altura}`);

    const x = d3
      .scaleTime()
      .domain(d3.extent(dados, (d) => d.date))
      .range([margem.left, largura - margem.right]);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        Math.max(
          110,
          d3.max(dados, (d) => d.indice),
        ),
      ])
      .nice()
      .range([altura - margem.bottom, margem.top]);

    // Faixa de referência: 100%
    svg
      .append("line")
      .attr("x1", margem.left)
      .attr("x2", largura - margem.right)
      .attr("y1", y(100))
      .attr("y2", y(100))
      .attr("stroke", "#b45309")
      .attr("stroke-dasharray", "6,5")
      .attr("stroke-width", 1.5);

    svg
      .append("text")
      .attr("x", largura - margem.right)
      .attr("y", y(100) - 10)
      .attr("text-anchor", "end")
      .attr("fill", "#92400e")
      .attr("font-size", 13)
      .text("Referência: 100% em 01/03/2020");

    // Eixos
    svg
      .append("g")
      .attr("class", "eixo")
      .attr("transform", `translate(0,${altura - margem.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeMonth.every(2))
          .tickFormat(d3.timeFormat("%b/%y")),
      );

    svg
      .append("g")
      .attr("class", "eixo")
      .attr("transform", `translate(${margem.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((d) => `${d}%`),
      );

    // Área preenchida abaixo da curva
    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.indice));

    svg
      .append("path")
      .datum(dados)
      .attr("d", area)
      .attr("fill", "#dbeafe")
      .attr("opacity", 0.75);

    // Linha principal
    const linha = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.indice));

    svg
      .append("path")
      .datum(dados)
      .attr("d", linha)
      .attr("fill", "none")
      .attr("stroke", "#12558a")
      .attr("stroke-width", 3.5);

    // Pontos importantes
    const menor = d3.least(dados, (d) => d.indice);
    const ultimo = dados[dados.length - 1];

    function destacar(dado, rotulo, deslocamentoY) {
      svg
        .append("circle")
        .attr("cx", x(dado.date))
        .attr("cy", y(dado.indice))
        .attr("r", 5)
        .attr("fill", "#e76f51")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      svg
        .append("text")
        .attr("x", x(dado.date) + 12)
        .attr("y", y(dado.indice) + deslocamentoY)
        .attr("font-size", 14)
        .attr("font-weight", 700)
        .attr("fill", "#334155")
        .attr("paint-order", "stroke")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .text(`${rotulo}: ${dado.indice.toFixed(1)}%`);
    }

    destacar(menor, "Menor movimento", -35);

    // Rótulo final alinhado à direita do gráfico
    svg
      .append("circle")
      .attr("cx", x(ultimo.date))
      .attr("cy", y(ultimo.indice))
      .attr("r", 5)
      .attr("fill", "#12558a");

    svg
      .append("text")
      .attr("x", x(ultimo.date) - 15)
      .attr("y", y(ultimo.indice) + 35)
      .attr("text-anchor", "end")
      .attr("font-size", 14)
      .attr("font-weight", 700)
      .attr("fill", "#12558a")
      .attr("paint-order", "stroke")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 5)
      .attr("stroke-linejoin", "round")
      .text(`Final: ${ultimo.indice.toFixed(1)}%`);

    // Tooltip
    const tooltip = d3
      .select("#grafico-linhas")
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    const formatarData = d3.timeFormat("%d/%m/%Y");
    const bissetriz = d3.bisector((d) => d.date).center;

    const guia = svg
      .append("line")
      .attr("class", "linha-guia")
      .attr("y1", margem.top)
      .attr("y2", altura - margem.bottom)
      .style("display", "none");

    svg
      .append("rect")
      .attr("x", margem.left)
      .attr("y", margem.top)
      .attr("width", largura - margem.left - margem.right)
      .attr("height", altura - margem.top - margem.bottom)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event, this);
        const dataMouse = x.invert(mx + margem.left);
        const dado = dados[bissetriz(dados, dataMouse)];

        if (!dado) return;

        const posX = x(dado.date);

        guia.attr("x1", posX).attr("x2", posX).style("display", null);

        tooltip.style("display", "block").html(`
                    <strong>${formatarData(dado.date)}</strong>
                    <p>Índice: <strong>${dado.indice.toFixed(1)}%</strong></p>
                    <p>Média de 7 dias:
                    <strong>${Math.round(dado.moving_avg_7d).toLocaleString("pt-BR")}</strong></p>
                `);

        const [px, py] = d3.pointer(
          event,
          document.querySelector("#grafico-linhas"),
        );

        const larguraContainer =
          document.querySelector("#grafico-linhas").clientWidth;

        tooltip
          .style(
            "left",
            `${Math.max(0, Math.min(px + 18, larguraContainer - 220))}px`,
          )
          .style("top", `${Math.max(0, py - 75)}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("display", "none");
        guia.style("display", "none");
      });
  })
  .catch((erro) => {
    console.error("Erro ao carregar o gráfico:", erro);
  });
