const caminhoCSV = "../dados/tratados/passageiros_mensais_eua.csv";

d3.csv(caminhoCSV, (d) => ({
  date: new Date(+d.year, +d.month - 1, 1),
  passengers: +d.passengers,
}))
  .then((dados) => {
    dados = dados
      .filter((d) => d.date && Number.isFinite(d.passengers))
      .sort((a, b) => a.date - b.date);

    if (!dados.length) {
      throw new Error("Não há dados válidos.");
    }

    dados.forEach((d) => {
      d.milhoes = d.passengers / 1000000;
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
      .domain([0, d3.max(dados, (d) => d.milhoes)])
      .nice()
      .range([altura - margem.bottom, margem.top]);

    // Eixos
    svg
      .append("g")
      .attr("class", "eixo")
      .attr("transform", `translate(0,${altura - margem.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.timeYear.every(2))
          .tickFormat(d3.timeFormat("%Y")),
      );

    svg
      .append("g")
      .attr("class", "eixo")
      .attr("transform", `translate(${margem.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((d) => `${d} mi`),
      );

    // Área preenchida abaixo da curva
    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(y(0))
      .y1((d) => y(d.milhoes));

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
      .y((d) => y(d.milhoes));

    svg
      .append("path")
      .datum(dados)
      .attr("d", linha)
      .attr("fill", "none")
      .attr("stroke", "#12558a")
      .attr("stroke-width", 3.5);

    // Pontos importantes
    const menor2020 = d3.least(
      dados.filter((d) => d.date.getFullYear() === 2020),
      (d) => d.milhoes,
    );

    const ultimo = dados[dados.length - 1];

    function destacar(dado, rotulo, deslocamentoY) {
      svg
        .append("circle")
        .attr("cx", x(dado.date))
        .attr("cy", y(dado.milhoes))
        .attr("r", 5)
        .attr("fill", "#e76f51")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      svg
        .append("text")
        .attr("x", x(dado.date) - 12)
        .attr("y", y(dado.milhoes) + deslocamentoY)
        .attr("text-anchor", "end")
        .attr("font-size", 14)
        .attr("font-weight", 700)
        .attr("fill", "#334155")
        .attr("paint-order", "stroke")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .text(`${rotulo}: ${dado.milhoes.toFixed(1)} mi`);
    }

    destacar(menor2020, "Menor movimento em 2020", -25);

    // Rótulo final alinhado à direita do gráfico
    svg
      .append("circle")
      .attr("cx", x(ultimo.date))
      .attr("cy", y(ultimo.milhoes))
      .attr("r", 5)
      .attr("fill", "#12558a");

    svg
      .append("text")
      .attr("x", x(ultimo.date) - 15)
      .attr("y", y(ultimo.milhoes) + 35)
      .attr("text-anchor", "end")
      .attr("font-size", 14)
      .attr("font-weight", 700)
      .attr("fill", "#12558a")
      .attr("paint-order", "stroke")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 5)
      .attr("stroke-linejoin", "round")
      .text(`Out/2020: ${ultimo.milhoes.toFixed(1)} mi`);

    // Tooltip
    const tooltip = d3
      .select("#grafico-linhas")
      .append("div")
      .attr("class", "tooltip")
      .style("display", "none");

    const formatarData = d3.timeFormat("%m/%Y");
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
  <p>Passageiros:
  <strong>${dado.passengers.toLocaleString("pt-BR")}</strong></p>
  <p>Em milhões:
  <strong>${dado.milhoes.toFixed(1)} mi</strong></p>
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
