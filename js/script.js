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
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

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
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

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
    const width = 400 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const states = ["State1", "State2"];  // Replace with actual state names you want to compare

    states.forEach((state, i) => {
        const svg = d3.select(`#lineChart${i+1}`).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const stateData = data.filter(d => d.state === state);

        const x = d3.scaleTime()
            .domain(d3.extent(stateData, d => new Date(d.month)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(stateData, d => d.monthly_deaths_2022)]).nice()
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
            .datum(stateData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line);

        svg.selectAll(".dot")
            .data(stateData)
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
    });
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
