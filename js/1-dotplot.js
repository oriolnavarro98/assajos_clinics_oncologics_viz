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
});