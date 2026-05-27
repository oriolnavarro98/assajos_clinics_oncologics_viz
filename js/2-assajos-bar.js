d3.csv("data/final_dataset_agg.csv").then(function(data) {
   
    // convertir columnes numeriques
    data.forEach(function(d) {
        d.unique_trials = +d.unique_trials;
    });

    // verificacio
    console.log("Dades assajos carregades:", data.length);
    console.log("Top 5: ", data.sort((a, b) => b.unique_trials - a.unique_trials).slice(0, 5).map(d => d.cancer_type_ca + ": " + d.unique_trials));

    // dimensions i marges
    const margin = {top: 20, right: 30, bottom: 40, left: 250};
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // crear el svg dins el div #chart-trials-bar
    const svg = d3.select("#chart-trials-bar")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    console.log("SVG creat!")

    // ordenar les dades per nombre d'assajos de major a menor
    data.sort((a, b) => b.unique_trials - a.unique_trials);

    // Escala Y - categories (noms dels càncers)
    const y = d3.scaleBand()
        .domain(data.map(d => d.cancer_type_ca))
        .range([0, height])
        .padding(0.3);
    
    // Escala X - valors numérics
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.unique_trials)])
        .range([0, width]);
    
    console.log("Escales creades!")

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
    );

    console.log("Eixos creats!");

    // Títol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Nombre d'assajos clínics (Gener 2021 - Abril 2026)");

    // Barres del gràfic
    svg.selectAll(".barres_assajos")
        .data(data)
        .enter()
        .append("rect")
            .attr("class", "barres_assajos")
            .attr("x", 0)
            .attr("y", d => y(d.cancer_type_ca))
            .attr("width", d => x(d.unique_trials))
            .attr("height", y.bandwidth())
            .attr("fill", "#2A6EBB")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Nombre d'assajos clinics: ${d3.format(",")(d.unique_trials)}`);
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
});