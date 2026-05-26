// Carregar les dades de països i el GeoJSON alhora
Promise.all([
    d3.csv("data/country_trials.csv"),
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
]).then(function([data, geojson]) {

    // Convertir a numèric
    data.forEach(d => d.unique_trials = +d.unique_trials);

    const nameMapping = {
        "United States": "USA",
        "South Korea": "South Korea",
        "Taiwan": "Taiwan",
    };

    // Crear dataMap amb el mapping
    const dataMap = {};
    data.forEach(d => {
        const nom = nameMapping[d.Country] || d.Country;
        dataMap[nom] = d.unique_trials;
    });

    console.log("Dades carregades:", data.length, "països");
    console.log("GeoJSON carregat:", geojson.features.length, "països");
    console.log("Exemple dataMap:", Object.entries(dataMap).slice(0, 3));
    
    // Dimensions
    const margin = { top: 10, right: 80, bottom: 50, left: 10 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Crear SVG
    const svg = d3.select("#chart-map")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Projecció del mapa
    const projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);

    // Generador de paths geogràfics
    const path = d3.geoPath().projection(projection);

    console.log("SVG i projecció creats!");

    // Escala de colors
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(data, d => d.unique_trials)])
        .interpolator(d3.interpolateBlues);

    // Dibuixar els països
    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const valor = dataMap[d.properties.name];
                return valor ? colorScale(valor) : "#e0e0e0";
            })
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                const valor = dataMap[d.properties.name];
                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.properties.name}</strong><br>Assajos: ${valor ? d3.format(",")(valor) : "Sense dades"}`);
                d3.select(this)
                    .attr("stroke", "#2A6EBB")
                    .attr("stroke-width", 2);
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
                    .attr("stroke-width", 0.5);
            });
    
    // Llegenda
    const legendWidth = 20;
    const legendHeight = 300;

    const legendSvg = svg.append("g")
        .attr("transform", `translate(${width + 5}, ${height / 2 - legendHeight / 2})`);

    // Gradient vertical
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");

    linearGradient.selectAll("stop")
        .data([
            { offset: "0%", color: d3.interpolateBlues(0) },
            { offset: "100%", color: d3.interpolateBlues(1) }
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // Rectangle del gradient
    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    // Etiquetes
    legendSvg.append("text")
        .attr("x", legendWidth + 5)
        .attr("y", legendHeight)
        .style("font-size", "11px")
        .style("fill", "#718096")
        .text("0");

    legendSvg.append("text")
        .attr("x", legendWidth + 5)
        .attr("y", 0)
        .style("font-size", "11px")
        .style("fill", "#718096")
        .text(d3.format(",")(d3.max(data, d => d.unique_trials)));

    // Títol (dues línies)
    legendSvg.append("text")
        .attr("x", legendWidth + 5)
        .attr("y", legendHeight / 2 - 10)
        .style("font-size", "11px")
        .style("fill", "#718096")
        .text("Nombre");

    legendSvg.append("text")
        .attr("x", legendWidth + 5)
        .attr("y", legendHeight / 2 + 5)
        .style("font-size", "11px")
        .style("fill", "#718096")
        .text("d'assajos");

});