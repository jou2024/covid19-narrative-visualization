// Load the data
d3.csv('data/total_deaths_state_2022.csv').then(totalDeathsData => {
    console.log("Total Deaths Data Loaded", totalDeathsData); // Debugging

    d3.csv('data/monthly_deaths_state_2022.csv').then(monthlyDeathsData => {
        console.log("Monthly Deaths Data Loaded", monthlyDeathsData); // Debugging

        // Initialize the visualizations
        createBarChart(totalDeathsData);
        createLineChart(monthlyDeathsData);
        createStateComparison(monthlyDeathsData);
    }).catch(error => {
        console.error("Error loading monthly deaths data: ", error);
    });
}).catch(error => {
    console.error("Error loading total deaths data: ", error);
});

function createBarChart(data) {
    console.log("Start to run createBarChart"); // Debugging
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = window.innerWidth - margin.left - margin.right - 100;
    const height = window.innerHeight - margin.top - margin.bottom - 200;

    const svg = d3.select("#barChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total_deaths_2022)]).nice()
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map(d => d.state))
        .range([0, height])
        .padding(0.1);

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.state))
        .attr("width", d => x(d.total_deaths_2022))
        .attr("height", y.bandwidth())
        .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("fill", "orange");
            // Show tooltip or additional data
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
              .attr("fill", "steelblue");
            // Hide tooltip or additional data
        });
}

function createLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = window.innerWidth - margin.left - margin.right - 100;
    const height = window.innerHeight - margin.top - margin.bottom - 200;

    const svg = d3.select("#lineChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.month)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.monthly_deaths_2022)]).nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

    svg.append("g")
        .call(d3.axisLeft(y));

    const line = d3.line()
        .x(d => x(new Date(d.month)))
        .y(d => y(d.monthly_deaths_2022));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(new Date(d.month)))
        .attr("cy", d => y(d.monthly_deaths_2022))
        .attr("r", 5)
        .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("fill", "orange");
            // Show tooltip or additional data
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
              .attr("fill", "steelblue");
            // Hide tooltip or additional data
        });
}

function createStateComparison(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = window.innerWidth - margin.left - margin.right - 100;
    const height = window.innerHeight - margin.top - margin.bottom - 200;

    // Create dropdown menus for state selection
    d3.select("#comparisonChart").html(`
        <label for="state1">Select State 1:</label>
        <select id="state1"></select>
        <label for="state2">Select State 2:</label>
        <select id="state2"></select>
        <button id="compareButton">Compare</button>
        <div id="lineChart_compare"></div>
    `);

    const states = Array.from(new Set(data.map(d => d.state)));
    const state1Select = d3.select("#state1");
    const state2Select = d3.select("#state2");

    states.forEach(state => {
        state1Select.append("option").text(state).attr("value", state);
        state2Select.append("option").text(state).attr("value", state);
    });

    d3.select("#compareButton").on("click", function() {
        const selectedState1 = d3.select("#state1").node().value;
        const selectedState2 = d3.select("#state2").node().value;
        updateChart(selectedState1, selectedState2);
    });

    function updateChart(state1, state2) {
        d3.select("#lineChart_compare").html("");

        const svg = d3.select("#lineChart_compare").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const stateData1 = data.filter(d => d.state === state1);
        const stateData2 = data.filter(d => d.state === state2);

        const x = d3.scaleTime()
            .domain(d3.extent(stateData1, d => new Date(d.month)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max([...stateData1, ...stateData2], d => +d.monthly_deaths_2022)]).nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

        svg.append("g")
            .call(d3.axisLeft(y));

        const line = d3.line()
            .x(d => x(new Date(d.month)))
            .y(d => y(+d.monthly_deaths_2022));

        // Add line for state 1
        svg.append("path")
            .datum(stateData1)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add line for state 2
        svg.append("path")
            .datum(stateData2)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        // Add dots for state 1
        svg.selectAll(".dot1")
            .data(stateData1)
          .enter().append("circle")
            .attr("class", "dot1")
            .attr("cx", d => x(new Date(d.month)))
            .attr("cy", d => y(+d.monthly_deaths_2022))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${state1}<br>Month: ${d.month}<br>Deaths: ${d.monthly_deaths_2022}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add dots for state 2
        svg.selectAll(".dot2")
            .data(stateData2)
          .enter().append("circle")
            .attr("class", "dot2")
            .attr("cx", d => x(new Date(d.month)))
            .attr("cy", d => y(+d.monthly_deaths_2022))
            .attr("r", 5)
            .attr("fill", "orange")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${state2}<br>Month: ${d.month}<br>Deaths: ${d.monthly_deaths_2022}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add annotations for state names
        svg.append("text")
            .attr("transform", `translate(${width},${y(stateData1[stateData1.length - 1].monthly_deaths_2022)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "steelblue")
            .text(state1);

        svg.append("text")
            .attr("transform", `translate(${width},${y(stateData2[stateData2.length - 1].monthly_deaths_2022)})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "orange")
            .text(state2);

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    // Initialize with the first two states
    updateChart(states[0], states[1]);
}


// Handle navigation
document.querySelectorAll('.pagination a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        console.log("Navigating to", target); // Debugging
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });
        document.getElementById(target).classList.add('active');
        console.log("Activated", target); // Debugging
    });
});

// Initialize the first scene as active
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Initializing first scene as active"); // Debugging
    document.getElementById('scene1').classList.add('active');
});
