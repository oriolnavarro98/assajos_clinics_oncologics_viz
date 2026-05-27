d3.csv("data/final_dataset.csv").then(function(data) {

    // Classificació del finançament
    const PUBLIC = ["FED", "NIH", "OTHER_GOV"];
    const PRIVATE = ["INDUSTRY"];

    // Agrupar per tipus de càncer i calcular percentatges
    const cancerTypes = [...new Set(data.map(d => d.cancer_type_ca))];

    const dataProcessada = cancerTypes.map(cancer => {
        const assajos = data.filter(d => d.cancer_type_ca === cancer);
        const public_ = new Set(assajos.filter(d => PUBLIC.includes(d["Funder Type"])).map(d => d["NCT Number"])).size;
        const private_ = new Set(assajos.filter(d => PRIVATE.includes(d["Funder Type"])).map(d => d["NCT Number"])).size;
        const total = public_ + private_

        return {
            cancer,
            total,
            public: total > 0 ? (public_ / total * 100).toFixed(1) : 0,
            private: total > 0 ? (private_ / total * 100).toFixed(1) : 0,
        };
    });

    // Ordenar per percentatge privat descendent
    dataProcessada.sort((a, b) => b.private - a.private);

    console.log("Exemple:", dataProcessada[0]);
    console.log("Top 5 privat:", dataProcessada.slice(0, 5).map(d => d.cancer + ": " + d.private + "%"));

    // dimensions i marges
    const margin = { top: 20, right: 150, bottom: 40, left: 250 };
    const width = 900 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // crear el SVG
    const svg = d3.select("#chart-financament")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    console.log("SVG creat!");

    // Escala Y
    const y = d3.scaleBand()
        .domain(dataProcessada.map(d => d.cancer))
        .range([0, height])
        .padding(0.3);

    // Escala X
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    // Eix Y
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "13px");
    
    // Eix X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d => d + "%")
    );

    // Titol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Percentatge d'assajos clínics");

    // colors
    const colors = {
        public: "#2A6EBB",
        private: "#C0392B",
    };

    // Barres públic
    svg.selectAll(".bar-public")
        .data(dataProcessada)
        .enter()
        .append("rect")
            .attr("class", "bar-public")
            .attr("x", 0)
            .attr("y", d => y(d.cancer))
            .attr("width", d => x(+d.public))
            .attr("height", y.bandwidth())
            .attr("fill", colors.public)
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.cancer}</strong><br>Públic: ${d.public}%`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() { tooltip.style("opacity", 0); });

    // Barres privat
    svg.selectAll(".bar-privat")
        .data(dataProcessada)
        .enter()
        .append("rect")
            .attr("class", "bar-privat")
            .attr("x", d => x(+d.public))
            .attr("y", d => y(d.cancer))
            .attr("width", d => x(+d.private))
            .attr("height", y.bandwidth())
            .attr("fill", colors.private)
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                    .html(`<strong>${d.cancer}</strong><br>Privat: ${d.private}%`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() { tooltip.style("opacity", 0); });
    
    console.log("Verificació:", dataProcessada.map(d => d.cancer + " - P:" + d.public + " A:" + " Pr:" + d.private));
    
    // Llegenda
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 20}, ${height / 2 - 30})`);

    legend.append("rect")
        .attr("width", 14).attr("height", 14)
        .attr("fill", colors.public);

    legend.append("text")
        .attr("x", 20).attr("y", 12)
        .style("font-size", "12px")
        .style("fill", "#2D3748")
        .text("Públic");

    legend.append("rect")
        .attr("width", 14).attr("height", 14)
        .attr("y", 25)
        .attr("fill", colors.private);

    legend.append("text")
        .attr("x", 20).attr("y", 37)
        .style("font-size", "12px")
        .style("fill", "#2D3748")
        .text("Privat");
    
});