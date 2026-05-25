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

    console.log(Object.keys(data[0]));

    // Convertir columnes numèriques de text a número
    data.forEach(function(d) {
        d.total_incidence = +d.total_incidence;
        d.total_mortality = +d.total_mortality;
    });

    // Verificació
    console.log("Dades carregades:", data);
    console.log("Nombre de files:", data.length);

    // Dimensions i marges
    const margin = { top: 20, right: 30, bottom: 40, left: 250 };
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
        .domain([0, 2500000])
        .range([0, width]);

    console.log("Escales creades!");

    // Eix Y - esquerra
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "13px");

    // Eix X - baix
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d => d3.format(".2s")(d).replace("G", "B"))
        );

    console.log("Eixos creats!");

    function calcularValors(data) {
        const male = document.getElementById("check-male").checked;
        const female = document.getElementById("check-female").checked;
        const age019 = document.getElementById("check-0-19").checked;
        const age2064 = document.getElementById("check-20-64").checked;
        const age65 = document.getElementById("check-65").checked;

        return data.map(d => {
            let incidencia = 0;
            let mortalitat = 0;

            if (male && age019)  { incidencia += +d.inc_m_0_19_number  || 0; mortalitat += +d.mor_m_0_19_number  || 0; }
            if (male && age2064) { incidencia += +d.inc_m_20_64_number  || 0; mortalitat += +d.mor_m_20_64_number  || 0; }
            if (male && age65)   { incidencia += +d.inc_m_65_85_number || 0; mortalitat += +d.mor_m_65_85_number || 0; }
            if (female && age019)  { incidencia += +d.inc_f_0_19_number  || 0; mortalitat += +d.mor_f_0_19_number  || 0; }
            if (female && age2064) { incidencia += +d.inc_f_20_64_number  || 0; mortalitat += +d.mor_f_20_64_number  || 0; }
            if (female && age65)   { incidencia += +d.inc_f_65_85_number || 0; mortalitat += +d.mor_f_65_85_number || 0; }

            return { ...d, incidencia, mortalitat };
        });
    }

    // Calcular valors inicials
    let dataCalculada = calcularValors(data);

    // Línies connectores
    const lines = svg.selectAll(".line-mortality-incidence")
        .data(dataCalculada)
        .enter()
        .append("line")
            .attr("x1", d => x(d.incidencia))
            .attr("y1", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("x2", d => x(d.mortalitat))
            .attr("y2", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("stroke", "#A8D1E7")
            .attr("stroke-width", 2);

    // Cercles d'incidència
    const dotsInc = svg.selectAll(".dot-incidence")
        .data(dataCalculada)
        .enter()
        .append("circle")
            .attr("class", "dot-incidence")
            .attr("cx", d => x(d.incidencia))
            .attr("cy", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("r", 6)
            .attr("fill", "#2A6EBB")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Incidència: ${d3.format(",")(d.incidencia)}`);
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
    const dotsMor = svg.selectAll(".dot-mortality")
        .data(dataCalculada)
        .enter()
        .append("circle")
            .attr("class", "dot-mortality")
            .attr("cx", d => x(d.mortalitat))
            .attr("cy", d => y(d.cancer_type_ca) + y.bandwidth() / 2)
            .attr("r", 6)
            .attr("fill", "#C0392B")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Mortalitat: ${d3.format(",")(d.mortalitat)}`);
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

    // Funcio per actualitzar el grafic quan canvia la seleccio
    function actualitzar() {
        dataCalculada = calcularValors(data);

        lines
            .data(dataCalculada)
            .transition()
            .duration(500)
            .attr("x1", d => x(d.incidencia))
            .attr("x2", d => x(d.mortalitat));

        dotsInc
            .data(dataCalculada)
            .transition()
            .duration(500)
            .attr("cx", d => x(d.incidencia));
        
        dotsMor
            .data(dataCalculada)
            .transition()
            .duration(500)
            .attr("cx", d => x(d.mortalitat));
        
        console.log("Incidència pulmó:", dataCalculada.find(d => d["Cancer Types"] === "Trachea, bronchus and lung").incidencia);
        console.log("Total incidència pulmó:", data.find(d => d["Cancer Types"] === "Trachea, bronchus and lung").total_incidence);
    }

    // Escoltar canvis als checkboxes
    d3.selectAll("input[type=checkbox]").on("change", actualitzar);

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