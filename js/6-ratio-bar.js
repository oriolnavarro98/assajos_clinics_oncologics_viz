d3.csv("data/final_dataset_agg.csv").then(function(data) {
   
    // convertir columnes numeriques
    data.forEach(function(d) {
        d.trials_per_100k_incidence = +d.trials_per_100k_incidence;
    });

    // filtrar per nomes dades disponibles
    data = data.filter(d => d.trials_per_100k_incidence > 0);

    // verificacio
    console.log("Dades carregades:", data.lenght);
    console.log("Top 5: ", data.sort((a, b) => b.trials_per_100k_incidence - a.trials_per_100k_incidence).slice(0, 5).map(d => d.cancer_type_ca + ": " + d.trials_per_100k_incidence));

    // dimensions i marges
    const margin = {top: 20, right: 30, bottom: 40, left: 250};
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // crear el svg dins el div #chart-ratio-bar
    const svg = d3.select("#chart-ratio-bar")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    console.log("SVG creat!")

    // ordenar les dades per nombre d'assajos de major a menor
    data.sort((a, b) => b.trials_per_100k_incidence - a.trials_per_100k_incidence);

    // Escala Y - categories (noms dels càncers)
    const y = d3.scaleBand()
        .domain(data.map(d => d.cancer_type_ca))
        .range([0, height])
        .padding(0.3);
    
    // Escala X - valors numérics
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.trials_per_100k_incidence)])
        .range([0, width]);
    
    console.log("Escales creades!")

    // Eix Y - esquerra
    svg.append("g")
        .attr("class", "eix-y")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "13px");

    // Eix X - baix
    svg.append("g")
        .attr("class", "eix-x")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));

    console.log("Eixos creats!");

    // Títol eix X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#718096")
        .text("Nombre d'assajos clínics per cada 100.000 casos (Gener 2021 - Abril 2026)");

    // Barres del gràfic
    svg.selectAll(".barres_assajos")
        .data(data)
        .enter()
        .append("rect")
            .attr("class", "barres_assajos")
            .attr("x", 0)
            .attr("y", d => y(d.cancer_type_ca))
            .attr("width", d => x(d.trials_per_100k_incidence))
            .attr("height", y.bandwidth())
            .attr("fill", "#2A6EBB")
            .on("mouseover", function(event, d) {
                    tooltip
                        .style("opacity", 1)
                        .html(`<strong>${d.cancer_type_ca}</strong><br>Nombre d'assajos clinics / 100.000 casos: ${d3.format(",")(d.trials_per_100k_incidence)}`);
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

    let modeRatio = "incidencia";

    function actualitzarRatio() {
        const variable = modeRatio === "incidencia" ? "trials_per_100k_incidence" : "trials_per_100k_mortality";

        // Reordenar dades
        data.sort((a, b) => b[variable] - a[variable]);

        // Actualitzar escales
        y.domain(data.map(d => d.cancer_type_ca));
        x.domain([0, d3.max(data, d => d[variable])]);

        // Actualitzar eix Y amb transició
        svg.select(".eix-y")
            .transition().duration(500)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "13px");

        // Actualitzar eix X amb transició
        svg.select(".eix-x")
            .transition().duration(500)
            .call(d3.axisBottom(x).ticks(5));

        // Actualitzar barres amb transició
        svg.selectAll(".barres_assajos")
            .data(data, d => d.cancer_type_ca)
            .transition().duration(500)
            .attr("y", d => y(d.cancer_type_ca))
            .attr("width", d => x(d[variable]));
    }

    d3.select("#btn-incidencia").on("click", function() {
        modeRatio = "incidencia";
        d3.select("#btn-incidencia")
            .style("background-color", "#2A6EBB")
            .style("color", "white")
            .style("border", "none");
        d3.select("#btn-mortalitat")
            .style("background-color", "#F7F9FC")
            .style("color", "#2D3748")
            .style("border", "1px solid #A8D1E7");
        actualitzarRatio();
    });

    d3.select("#btn-mortalitat").on("click", function() {
        modeRatio = "mortalitat";
        d3.select("#btn-mortalitat")
            .style("background-color", "#2A6EBB")
            .style("color", "white")
            .style("border", "none");
        d3.select("#btn-incidencia")
            .style("background-color", "#F7F9FC")
            .style("color", "#2D3748")
            .style("border", "1px solid #A8D1E7");
        actualitzarRatio();
    });

    // Càncers exclusius per sexe
    const MASCULINS = ["Pròstata", "Testicles", "Penis"];
    const FEMENINS = ["Càncer de mama", "Coll uterí", "Cos uterí", "Ovaris", "Vagina", "Vulva"];

    function actualitzarHighlight() {
        const masculins = document.getElementById("check-masculins").checked;
        const femenins = document.getElementById("check-femenins").checked;

        svg.selectAll(".barres_assajos")
            .attr("fill", function(d) {
                if (!masculins && !femenins) return "#2A6EBB";
                if (masculins && MASCULINS.includes(d.cancer_type_ca)) return "#2A6EBB";
                if (femenins && FEMENINS.includes(d.cancer_type_ca)) return "#C0392B";
                return "#A8D1E7";
            })
            .attr("opacity", function(d) {
                if (!masculins && !femenins) return 1;
                if (masculins && MASCULINS.includes(d.cancer_type_ca)) return 1;
                if (femenins && FEMENINS.includes(d.cancer_type_ca)) return 1;
                return 0.3;
            });
    }

    d3.select("#check-masculins").on("change", actualitzarHighlight);
    d3.select("#check-femenins").on("change", actualitzarHighlight);
});