d3.csv("data/final_dataset_agg.csv").then(function(data) {

    data.forEach(function(d) {
        d.total_incidence = +d.total_incidence;
        d.total_mortality = +d.total_mortality;
        d.unique_trials = +d.unique_trials;
    });

    data = data.filter(d => d.total_incidence > 0);

    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart-bubble")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ClipPath per evitar que les bombolles surtin fora
    svg.append("defs")
        .append("clipPath")
            .attr("id", "clip")
        .append("rect")
            .attr("width", width)
            .attr("height", height);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_incidence) * 1.1])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_mortality) * 1.1])
        .range([height, 0]);

    const r = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.unique_trials)])
        .range([2, 40]);

    // Eix X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.format(".2s")(d)));

    // Eix Y
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(".2s")(d)));

    // Títol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Incidència global (2022)");

    // Títol eix Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Mortalitat global (2022)");

    // Línies de quadrant
    const midX = d3.mean(data, d => d.total_incidence);
    const midY = d3.mean(data, d => d.total_mortality);

    svg.append("line")
        .attr("x1", x(midX)).attr("y1", 0)
        .attr("x2", x(midX)).attr("y2", height)
        .attr("stroke", "#A8D1E7")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

    svg.append("line")
        .attr("x1", 0).attr("y1", y(midY))
        .attr("x2", width).attr("y2", y(midY))
        .attr("stroke", "#A8D1E7")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

    // Etiqueta línia vertical (incidència mitjana)
    svg.append("text")
        .attr("x", x(midX) + 5)
        .attr("y", 15)
        .style("font-size", "11px")
        .style("fill", "#718096")
        .style("font-style", "italic")
        .text("Incidència mitjana");

    // Etiqueta línia horitzontal (mortalitat mitjana)
    svg.append("text")
        .attr("x", width - 5)
        .attr("y", y(midY) - 5)
        .attr("text-anchor", "end")
        .style("font-size", "11px")
        .style("fill", "#718096")
        .style("font-style", "italic")
        .text("Mortalitat mitjana");
    
    // Bombolles amb clipPath
    svg.append("g")
        .attr("clip-path", "url(#clip)")
        .selectAll(".bubble")
        .data(data)
        .enter()
        .append("circle")
            .attr("class", "bubble")
            .attr("cx", d => x(d.total_incidence))
            .attr("cy", d => y(d.total_mortality))
            .attr("r", d => r(d.unique_trials))
            .attr("fill", "#2A6EBB")
            .attr("opacity", 0.6)
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${d.cancer_type_ca}</strong><br>
                        Incidència: ${d3.format(",")(d.total_incidence)}<br>
                        Mortalitat: ${d3.format(",")(d.total_mortality)}<br>
                        Assajos: ${d3.format(",")(d.unique_trials)}
                    `);
                d3.select(this)
                    .attr("stroke", "#2A6EBB")
                    .attr("stroke-width", 2)
                    .attr("opacity", 1);
            })
            .on("mousemove", function(event) {
                tooltip
                    .style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.6);
            });
});