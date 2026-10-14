d3.csv("../dados/montanhas.csv")
  .then(function (dados) {
    dados.forEach(function (d) {
      d.queda = Number(d.queda);
    });

    dados = dados.filter((d) => d.nome && d.pais && Number.isFinite(d.queda));
    dados.sort((a, b) => b.queda - a.queda);

    const largura = 960;
    const alturaBarras = 650;
    const margemBarras = {
      topo: 35,
      direita: 100,
      baixo: 65,
      esquerda: 260,
    };

    const cores = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain([...new Set(dados.map((d) => d.pais))]);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip-grafico")
      .style("display", "none");

    function mostrarTooltip(event, d) {
      tooltip
        .style("display", "block")
        .html(
          "<strong>" +
            d.nome +
            "</strong><br>" +
            "País: " +
            d.pais +
            "<br>" +
            "Queda: " +
            d.queda +
            " pés",
        );

      moverTooltip(event);
    }

    function moverTooltip(event) {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY + 15 + "px");
    }

    function esconderTooltip() {
      tooltip.style("display", "none");
    }

    const filtro = d3.select("#filtro-pais");

    const paises = [...new Set(dados.map((d) => d.pais))].sort();

    filtro
      .selectAll("option.pais")
      .data(paises)
      .join("option")
      .attr("class", "pais")
      .attr("value", (d) => d)
      .text((d) => d);

    d3.select("#limpar-filtro").on("click", function () {
      filtro.property("value", "Todos");
      atualizar();
    });

    filtro.on("change", atualizar);

    function atualizar() {
      const paisSelecionado = filtro.property("value");

      const filtrados =
        paisSelecionado === "Todos"
          ? dados
          : dados.filter((d) => d.pais === paisSelecionado);

      desenharBarras(filtrados);
      desenharPontos(filtrados);
    }

    function desenharBarras(filtrados) {
      d3.select("#grafico-barras").selectAll("*").remove();

      const altura = Math.max(
        260,
        filtrados.length * 42 + margemBarras.topo + margemBarras.baixo,
      );

      const svg = d3
        .select("#grafico-barras")
        .append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .style("width", "100%")
        .style("height", "auto");

      const x = d3
        .scaleLinear()
        .domain([0, 450])
        .range([margemBarras.esquerda, largura - margemBarras.direita]);

      const y = d3
        .scaleBand()
        .domain(filtrados.map((d) => d.nome))
        .range([margemBarras.topo, altura - margemBarras.baixo])
        .padding(0.25);

      svg
        .append("g")
        .attr("class", "eixo")
        .attr("transform", `translate(0, ${altura - margemBarras.baixo})`)
        .call(d3.axisBottom(x).ticks(9));

      svg
        .append("g")
        .attr("class", "eixo")
        .attr("transform", `translate(${margemBarras.esquerda}, 0)`)
        .call(d3.axisLeft(y).tickSize(0));

      svg
        .selectAll(".linha-grade")
        .data(x.ticks(9))
        .join("line")
        .attr("x1", (d) => x(d))
        .attr("x2", (d) => x(d))
        .attr("y1", margemBarras.topo)
        .attr("y2", altura - margemBarras.baixo)
        .attr("stroke", "#e5eaf0")
        .lower();

      const barras = svg
        .selectAll(".barra")
        .data(filtrados, (d) => d.nome)
        .join("rect")
        .attr("class", "barra")
        .attr("x", x(0))
        .attr("y", (d) => y(d.nome))
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", (d) => (d.queda === 418 ? "#e07835" : "#2878b5"))
        .attr("width", 0)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#e07835");
          mostrarTooltip(event, d);
        })
        .on("mousemove", moverTooltip)
        .on("mouseout", function (event, d) {
          d3.select(this).attr("fill", d.queda === 418 ? "#e07835" : "#2878b5");
          esconderTooltip();
        });

      barras
        .transition()
        .duration(650)
        .attr("width", (d) => x(d.queda) - x(0));

      svg
        .selectAll(".valor-barra")
        .data(filtrados)
        .join("text")
        .attr("class", "valor-barra")
        .attr("x", (d) => x(d.queda) + 8)
        .attr("y", (d) => y(d.nome) + y.bandwidth() / 2 + 5)
        .attr("font-size", "13px")
        .attr("fill", "#243247")
        .text((d) => d.queda + " ft");

      svg
        .append("text")
        .attr("x", (margemBarras.esquerda + largura - margemBarras.direita) / 2)
        .attr("y", altura - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Altura da queda (pés)");
    }

    function desenharPontos(filtrados) {
      d3.select("#grafico-pontos").selectAll("*").remove();

      const grupos = d3
        .groups(filtrados, (d) => d.pais)
        .sort(
          (a, b) => d3.max(b[1], (d) => d.queda) - d3.max(a[1], (d) => d.queda),
        );

      const margem = {
        topo: 55,
        direita: 85,
        baixo: 65,
        esquerda: 150,
      };

      const altura = Math.max(320, grupos.length * 95 + 120);

      const svg = d3
        .select("#grafico-pontos")
        .append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .style("width", "100%")
        .style("height", "auto");

      const x = d3
        .scaleLinear()
        .domain([0, 450])
        .range([margem.esquerda, largura - margem.direita]);

      const y = d3
        .scaleBand()
        .domain(grupos.map((g) => g[0]))
        .range([margem.topo, altura - margem.baixo])
        .padding(0.2);

      svg
        .append("g")
        .attr("class", "eixo")
        .attr("transform", `translate(0, ${altura - margem.baixo})`)
        .call(d3.axisBottom(x).ticks(9));

      svg
        .append("g")
        .attr("class", "eixo")
        .attr("transform", `translate(${margem.esquerda}, 0)`)
        .call(d3.axisLeft(y).tickSize(0));

      svg
        .selectAll(".linha-pais")
        .data(grupos)
        .join("line")
        .attr("x1", x(0))
        .attr("x2", x(450))
        .attr("y1", (d) => y(d[0]) + y.bandwidth() / 2)
        .attr("y2", (d) => y(d[0]) + y.bandwidth() / 2)
        .attr("stroke", "#d5dce5")
        .attr("stroke-dasharray", "4,4");

      const pontos = [];

      grupos.forEach(function (grupo) {
        const pais = grupo[0];
        const itens = grupo[1];

        itens.forEach(function (item, indice) {
          pontos.push({
            ...item,
            posicaoY:
              y(pais) +
              y.bandwidth() / 2 +
              (indice - (itens.length - 1) / 2) * 10,
          });
        });
      });

      svg
        .selectAll(".ponto")
        .data(pontos)
        .join("circle")
        .attr("class", "ponto")
        .attr("cx", (d) => x(d.queda))
        .attr("cy", (d) => d.posicaoY)
        .attr("r", 0)
        .attr("fill", (d) => cores(d.pais))
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("mouseover", function (event, d) {
          d3.select(this).attr("r", 10).attr("stroke", "#172b4d");
          mostrarTooltip(event, d);
        })
        .on("mousemove", moverTooltip)
        .on("mouseout", function () {
          d3.select(this).attr("r", 7).attr("stroke", "white");
          esconderTooltip();
        })
        .transition()
        .duration(650)
        .attr("r", 7);

      svg
        .append("text")
        .attr("x", (margem.esquerda + largura - margem.direita) / 2)
        .attr("y", altura - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Altura da queda (pés)");
    }

    atualizar();
  })
  .catch(function (erro) {
    console.error("Erro ao carregar os dados:", erro);
  });
