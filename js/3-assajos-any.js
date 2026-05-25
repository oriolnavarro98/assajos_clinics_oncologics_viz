d3.csv("data/final_dataset.csv").then(function(data) {

    // verificacio
    console.log("Dades carregades:", data);
    console.log("Exemple:", data[0]);

    // Extreure any de Start Date
    data.forEach(function(d) {
        d.year = +d["Start Date"].substring(0, 4);
    });

    // Verificar els anys disponibles
    const anys = [...new Set(data.map(d => d.year))].sort();
    console.log("Anys disponibles:", anys);

    // agrupar per any i tipus de cancer
    const cancerTypes = [...new Set(data.map(d => d["cancer_type_ca"]))];

    const dataPerAny = cancerTypes.map(cancer => {
        const assajosCancer = data.filter(d => d["cancer_type_ca"] === cancer);

        let acumulat = 0;
        const valors = anys.map(any => {
            const count = new Set(
                assajosCancer
                    .filter(d => d.year === any)
                    .map(d => d["NCT Number"])
            ).size;

            acumulat += count;

            return { any, count, acumulat };
        });
        
        return { cancer, valors };
    });

    console.log("Exemple registre:", dataPerAny[0]);

    // Definir el mode inicial (count)
    let mode = "count"; // "count" o "acumulat"

    function actualitzarLine() {
        // Actualitzar domini eix Y
        y.domain([0, d3.max(dataPerAny, d => d3.max(d.valors, v => v[mode]))]);

        // Actualitzar generador de línies
        line.y(d => y(d[mode]));

        // Actualitzar eix Y amb transició
        svg.select(".eix-y")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5));

        // Actualitzar línies amb transició
        lines.transition()
            .duration(500)
            .attr("d", d => line(d.valors));

        // Actualitzar labels
        svg.selectAll(".label-line")
            .transition()
            .duration(500)
            .attr("y", d => y(d.valors[d.valors.length - 1][mode]));
    }

    // Dimensions i marges
    const margin = { top: 20, right: 160, bottom: 40, left: 60 };
    const width = 620;
    const height = 600 - margin.top - margin.bottom;

    // Crear el SVG dins el div #chart-trials-line
    const svg = d3.select("#chart-trials-line")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    console.log("SVG creat!");

    // Escala Y - Nombre d'assajos
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataPerAny, d => d3.max(d.valors, v => v[mode]))])
        .range([height, 0]);
    
    // Escala X - Any
    const x = d3.scaleLinear()
        .domain([d3.min(anys), d3.max(anys)])
        .range([0, width]);    
    
    // Eix Y - esquerra
    svg.append("g")
        .attr("class", "eix-y")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "13px");

    // Eix X - abaix
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(6)
            .tickFormat(d3.format("d"))
    )
    .selectAll("text")
    .style("font-size", "13px");

    // Generador de linies
    const line = d3.line()
        .x(d => x(d.any))
        .y(d => y(d.count));

    // Escala de colors
    const color = d3.scaleOrdinal()
        .domain(cancerTypes)
        .range(d3.quantize(d3.interpolateRainbow, cancerTypes.length));

    // Top 5 per nombre d'assajos únics
    const top5 = dataPerAny
        .sort((a, b) => d3.max(b.valors, v => v.acumulat) - d3.max(a.valors, v => v.acumulat))
        .slice(0, 5)
        .map(d => d.cancer);

    console.log("Top 5:", top5);

    // Dibuixar una linia per cada tipus de cancer
    const lines = svg.selectAll(".line-cancer")
        .data(dataPerAny)
        .enter()
        .append("path")
            .attr("class", "line-cancer")
            .attr("d", d => line(d.valors))
            .attr("fill", "none")
            .attr("stroke", d => color(d.cancer))
            .attr("stroke-width", d => top5.includes(d.cancer) ? 2.5 : 1.5)
            .attr("opacity", d => top5.includes(d.cancer) ? 0.9 : 0.4)

    lines
        .on("mouseover", function(event, d) {
            lines.attr("opacity", 0.1);
            d3.select(this)
                .attr("opacity", 1)
                .attr("stroke-width", 3);
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.cancer}</strong>`);
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            lines
                .attr("opacity", d => top5.includes(d.cancer) ? 0.9 : 0.4)
                .attr("stroke-width", d => top5.includes(d.cancer) ? 2.5 : 1.5);
            tooltip.style("opacity", 0);
        });

        // Labels per als top 5
        svg.selectAll(".label-line")
            .data(dataPerAny.filter(d => top5.includes(d.cancer)))
            .enter()
            .append("text")
                .attr("class", "label-line")
                .attr("x", d => x(d.valors[d.valors.length - 1].any) + 5)
                .attr("y", d => y(d.valors[d.valors.length - 1].count))
                .attr("dominant-baseline", "middle")
                .style("font-size", "11px")
                .style("fill", d => color(d.cancer))
                .text(d => d.cancer);

    // Events dels botons
    d3.select("#btn-count").on("click", function() {
        mode = "count";
        // Estil botó actiu/inactiu
        d3.select("#btn-count")
            .style("background-color", "#2A6EBB")
            .style("color", "white")
            .style("border", "none");
        d3.select("#btn-acumulat")
            .style("background-color", "#F7F9FC")
            .style("color", "#2D3748")
            .style("border", "1px solid #A8D1E7");
        actualitzarLine();
    });

    d3.select("#btn-acumulat").on("click", function() {
        mode = "acumulat";
        // Estil botó actiu/inactiu
        d3.select("#btn-acumulat")
            .style("background-color", "#2A6EBB")
            .style("color", "white")
            .style("border", "none");
        d3.select("#btn-count")
            .style("background-color", "#F7F9FC")
            .style("color", "#2D3748")
            .style("border", "1px solid #A8D1E7");
        actualitzarLine();
    });

    // Títol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Any");

    // Títol eix Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")  // vermell per veure'l clarament
        .style("opacity", 1)
        .text("Nombre d'assajos");
});