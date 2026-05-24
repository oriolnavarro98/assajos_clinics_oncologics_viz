// Crear el tooltip
const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #A8D1E7")
    .style("border-radius", "6px")
    .style("padding", "8px 12px")
    .style("font-size", "12px")
    .style("color", "#2D3748")
    .style("pointer-events", "none")
    .style("opacity", 0);

d3.csv("data/final_dataset_agg.csv").then(function(data) {

    // Convertir columnes numèriques de text a número
    data.forEach(function(d) {
        d.total_incidence = +d.total_incidence;
        d.total_mortality = +d.total_mortality;
    });

    // Verificació
    console.log("Dades carregades:", data);
    console.log("Nombre de files:", data.length);

    // Dimensions i marges
    const margin = { top: 20, right: 30, bottom: 40, left: 200 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Crear el SVG dins el div #chart-dotplot
    const svg = d3.select("#chart-dotplot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    console.log("SVG creat!");

    // Ordenar les dades per incidència de major a menor
    data.sort((a, b) => b.total_incidence - a.total_incidence);

    // Escala Y - categories (noms dels càncers)
    const y = d3.scaleBand()
        .domain(data.map(d => d.cancer_type_ca))
        .range([0, height])
        .padding(0.3);

    // Escala X - valors numèrics
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_incidence)])
        .range([0, width]);

    console.log("Escales creades!");

    // Eix Y - esquerra
    svg.append("g")
        .call(d3.axisLeft(y));

    // Eix X - baix
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    console.log("Eixos creats!");

    // Línies connectores
    svg.selectAll(".line-mortality-incidence")
        .data(data)
        .enter()
        .append("line")
            .attr("x1", d => x(d.total_incidence))
            .attr("y1", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("x2", d => x(d.total_mortality))
            .attr("y2", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("stroke", "#A8D1E7")
            .attr("stroke-width", 2);

    // Cercles d'incidència
    svg.selectAll(".dot-incidence")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "dot-incidence")
            .attr("cx", d => x(d.total_incidence))
            .attr("cy", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("r", 6)
            .attr("fill", "#2A6EBB")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Incidència: ${d3.format(",")(d.total_incidence)}`);
                })
                .on("mousemove", function(event) {
                    tooltip
                        .style("left", (event.pageX + 12) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });

    // Cercles de mortalitat
    svg.selectAll(".dot-mortality")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "dot-mortality")
            .attr("cx", d => x(d.total_mortality))
            .attr("cy", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("r", 6)
            .attr("fill", "#C0392B")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Mortalitat: ${d3.format(",")(d.total_mortality)}`);
                })
                .on("mousemove", function(event) {
                    tooltip
                        .style("left", (event.pageX + 12) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });
    
    console.log("Figures creades")

    // Llegenda
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, ${height - 30})`);

    // Cercle mortalitat
    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", "#C0392B");

    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text("Mortalitat")
        .style("font-size", "12px")
        .style("fill", "#2D3748");

    // Cercle incidència
    legend.append("circle")
        .attr("cx", 100)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", "#2A6EBB");

    legend.append("text")
        .attr("x", 115)
        .attr("y", 5)
        .text("Incidència")
        .style("font-size", "12px")
        .style("fill", "#2D3748");

    console.log("Llegenda creada")

    // Títol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Total de casos (any 2022)");
});