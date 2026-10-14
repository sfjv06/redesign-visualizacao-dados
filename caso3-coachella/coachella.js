
d3.csv("caso3-coachella/coachella.csv").then(function (dados) {

    dados.forEach(function (d) {
        d.year = +d.year;
        d.friday = +d.friday;
        d.saturday = +d.saturday;
        d.sunday = +d.sunday;
        d.total = +d.total;
    });

    const dias = ["friday", "saturday", "sunday"];

    const nomes = {
        friday: "Sexta-feira",
        saturday: "Sábado",
        sunday: "Domingo"
    };

    const cores = d3.scaleOrdinal()
        .domain(dias)
        .range(["#7353BA", "#F29E4C", "#4E9F8A"]);

    function criarBarras(seletor, dadosGrafico, largura = 850, altura = 450) {

        const margem = {
            top: 55,
            right: 30,
            bottom: 60,
            left: 65
        };

        const svg = d3.select(seletor)
            .append("svg")
            .attr("viewBox", `0 0 ${largura} ${altura}`)
            .style("width", "100%")
            .style("max-width", `${largura}px`)
            .style("height", "auto");

        const x = d3.scaleBand()
            .domain(dadosGrafico.map(d => d.year))
            .range([margem.left, largura - margem.right])
            .padding(0.2);

        const xDia = d3.scaleBand()
            .domain(dias)
            .range([0, x.bandwidth()])
            .padding(0.08);

        const y = d3.scaleLinear()
            .domain([0, 70])
            .range([altura - margem.bottom, margem.top]);

        svg.append("g")
            .attr("stroke", "#dddddd")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(y.ticks(7))
            .enter()
            .append("line")
            .attr("x1", margem.left)
            .attr("x2", largura - margem.right)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d));

        svg.append("g")
            .attr("transform", `translate(0,${altura - margem.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("transform", `translate(${margem.left},0)`)
            .call(d3.axisLeft(y).ticks(7));

        const grupos = svg.selectAll(".grupo-ano")
            .data(dadosGrafico)
            .enter()
            .append("g")
            .attr("class", "grupo-ano")
            .attr("transform", d => `translate(${x(d.year)},0)`);

        grupos.selectAll("rect")
            .data(d => dias.map(dia => ({
                dia: dia,
                valor: d[dia]
            })))
            .enter()
            .append("rect")
            .attr("x", d => xDia(d.dia))
            .attr("y", d => y(d.valor))
            .attr("width", xDia.bandwidth())
            .attr("height", d => altura - margem.bottom - y(d.valor))
            .attr("fill", d => cores(d.dia))
            .append("title")
            .text(d => `${nomes[d.dia]}: ${d.valor} artistas`);

        dias.forEach(function (dia, i) {

            const legenda = svg.append("g")
                .attr("transform", `translate(${margem.left + i * 145},20)`);

            legenda.append("rect")
                .attr("width", 13)
                .attr("height", 13)
                .attr("fill", cores(dia));

            legenda.append("text")
                .attr("x", 20)
                .attr("y", 11)
                .attr("font-size", "13px")
                .text(nomes[dia]);
        });

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(altura / 2))
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", "13px")
            .text("Quantidade de artistas");
    }

    criarBarras("#coachella-redesign1", dados);

    const painel2 = d3.select("#coachella-redesign2");

    painel2.append("h4")
        .text("Evolução do total de artistas");

    const largura = 850;
    const altura = 320;

    const margem = {
        top: 35,
        right: 45,
        bottom: 55,
        left: 65
    };

    const svgLinha = painel2.append("svg")
        .attr("viewBox", `0 0 ${largura} ${altura}`)
        .style("width", "100%")
        .style("max-width", `${largura}px`)
        .style("height", "auto");

    const xLinha = d3.scalePoint()
        .domain(dados.map(d => d.year))
        .range([margem.left, largura - margem.right]);

    const yLinha = d3.scaleLinear()
        .domain([0, d3.max(dados, d => d.total) + 20])
        .nice()
        .range([altura - margem.bottom, margem.top]);

    svgLinha.append("g")
        .attr("stroke", "#dddddd")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(yLinha.ticks(5))
        .enter()
        .append("line")
        .attr("x1", margem.left)
        .attr("x2", largura - margem.right)
        .attr("y1", d => yLinha(d))
        .attr("y2", d => yLinha(d));

    svgLinha.append("g")
        .attr("transform", `translate(0,${altura - margem.bottom})`)
        .call(d3.axisBottom(xLinha).tickFormat(d3.format("d")));

    svgLinha.append("g")
        .attr("transform", `translate(${margem.left},0)`)
        .call(d3.axisLeft(yLinha).ticks(5));

    const linha = d3.line()
        .x(d => xLinha(d.year))
        .y(d => yLinha(d.total));

    svgLinha.append("path")
        .datum(dados)
        .attr("fill", "none")
        .attr("stroke", "#7353BA")
        .attr("stroke-width", 3)
        .attr("d", linha);

    svgLinha.selectAll(".ponto-total")
        .data(dados)
        .enter()
        .append("circle")
        .attr("class", "ponto-total")
        .attr("cx", d => xLinha(d.year))
        .attr("cy", d => yLinha(d.total))
        .attr("r", 5)
        .attr("fill", "#7353BA")
        .append("title")
        .text(d => `${d.year}: ${d.total} artistas`);

    svgLinha.selectAll(".rotulo-total")
        .data(dados)
        .enter()
        .append("text")
        .attr("class", "rotulo-total")
        .attr("x", d => xLinha(d.year))
        .attr("y", d => yLinha(d.total) - 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#333333")
        .text(d => d.total);

    svgLinha.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(altura / 2))
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text("Total de artistas");

}).catch(function (erro) {
    console.error("Erro ao carregar os dados do Coachella:", erro);
});
