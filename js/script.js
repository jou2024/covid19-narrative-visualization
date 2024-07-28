const yearTabs = document.querySelectorAll('.year-tabs a');
const sceneTabs = document.querySelectorAll('.scene-tabs a');
const scenes = document.querySelectorAll('.scene');

let currentYear = '2022'; // Default year

// Event listener for year tabs
yearTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        currentYear = this.getAttribute('data-year');

        // Update active class for year tabs
        yearTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Load data for the selected year
        loadDataForYear(currentYear);
    });
});

// Event listener for scene tabs
sceneTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');

        // Update active class for scene tabs
        sceneTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Show the selected scene
        scenes.forEach(scene => scene.classList.remove('active'));
        document.getElementById(target).classList.add('active');
    });
});

// Function to load data for the selected year
function loadDataForYear(year) {
    d3.csv(`data/total_deaths_state_${year}.csv`).then(totalDeathsData => {
        d3.csv(`data/monthly_deaths_state_${year}.csv`).then(monthlyDeathsData => {
            // Initialize the visualizations
            createBarChart(totalDeathsData);
            createLineChart(monthlyDeathsData);
            createStateComparison(monthlyDeathsData);
        }).catch(error => {
            console.error(`Error loading monthly deaths data for ${year}: `, error);
        });
    }).catch(error => {
        console.error(`Error loading total deaths data for ${year}: `, error);
    });
}

// Initial load for the default year
loadDataForYear(currentYear);

// Helper function to get monthly deaths based on the selected year
function getMonthlyDeaths(d, year) {
    console.log("Input year for getMonthlyDeaths  ", year); // Debugging
    console.log("Input d for getMonthlyDeaths  ", d); // Debugging
    if (year === '2020') {
        return +d.monthly_deaths_2020;
    } else if (year === '2021') {
        return +d.monthly_deaths_2021;
    } else if (year === '2022') {
        return +d.monthly_deaths_2022;
    }
    return 0; // Default case, should not happen if the year is correctly set
}

function getTotalDeaths(d, year) {
    if (year === '2020') {
        return +d.total_deaths_2020;
    } else if (year === '2021') {
        return +d.total_deaths_2021;
    } else if (year === '2022') {
        return +d.total_deaths_2022;
    }
    return 0; // Default case, should not happen if the year is correctly set
}

function createBarChart(data) {
    console.log("Start to run createBarChart"); // Debugging
    d3.select("#barChart").html(""); // Clear existing chart

    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = window.innerWidth - margin.left - margin.right - 100;
    const height = window.innerHeight - margin.top - margin.bottom - 200;

    const svg = d3.select("#barChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => getTotalDeaths(d, currentYear))]).nice()
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
        .attr("width", d => x(getTotalDeaths(d, currentYear)))
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
    console.log("Start createLineChart"); // Debugging
    d3.select("#lineChart").html(""); // Clear existing chart

    const margin = { top: 20, right: 30, bottom: 40, left: 90 };
    const width = window.innerWidth - margin.left - margin.right - 100;
    const height = window.innerHeight - margin.top - margin.bottom - 200;

    // Create dropdown menu for state selection
    d3.select("#lineChart").html(`
        <label for="stateFilter">Select State:</label>
        <select id="stateFilter"></select>
        <div id="lineChartContent"></div>
    `);

    const states = [...new Set(data.map(d => d.state))];
    const stateFilterSelect = d3.select("#stateFilter");

    stateFilterSelect.append("option").text("All States").attr("value", "All");
    states.forEach(state => {
        stateFilterSelect.append("option").text(state).attr("value", state);
    });

    stateFilterSelect.on("change", function() {
        const selectedState = d3.select(this).node().value;
        updateChart(selectedState);
    });

    function updateChart(selectedState) {
        console.log("Start updateChart"); // Debugging

        d3.select("#lineChartContent").html("");

        const filteredData = selectedState === "All" ? data : data.filter(d => d.state === selectedState);

        const svg = d3.select("#lineChartContent").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleTime()
            .domain(d3.extent(filteredData, d => new Date(d.month)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => getMonthlyDeaths(d, currentYear))]).nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

        svg.selectAll(".y-axis").remove(); // Remove the existing y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
            

        const color = d3.scaleOrdinal(d3.schemeCategory10).domain(states);

        const line = d3.line()
            .x(d => x(new Date(d.month)))
            .y(d => y(getMonthlyDeaths(d, currentYear)));

        const stateGroups = d3.groups(filteredData, d => d.state);

        // Add lines for each state
        svg.selectAll(".line")
            .data(stateGroups)
          .enter().append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => color(d[0]))
            .attr("stroke-width", 1.5)
            .attr("d", d => line(d[1]))
            .attr("data-state", d => d[0]);

        // Add dots and tooltips for each state
        svg.selectAll(".dot")
            .data(filteredData)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.month)))
            .attr("cy", d => y(getMonthlyDeaths(d, currentYear)))
            .attr("r", 5)
            .attr("fill", d => color(d.state))
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 7);
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${d.state}<br>Month: ${d.month}<br>Deaths: ${getMonthlyDeaths(d, currentYear)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("r", 5);
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add annotations for state names at the end of each line
        svg.selectAll(".state-label")
            .data(stateGroups)
          .enter().append("text")
            .attr("class", "state-label")
            .attr("transform", d => `translate(${width},${y(getMonthlyDeaths(d[1][d[1].length - 1], currentYear))})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", d => color(d[0]))
            .text(d => d[0]);

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    // Initialize with all states
    updateChart("All");
}

function createStateComparison(data) {

    console.log("Start createStateComparison"); // Debugging

    d3.select("#comparisonChart").html(""); // Clear existing chart

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
    console.log("State: ", states); // Debugging


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
            .domain([0, d3.max([...stateData1, ...stateData2], d => getMonthlyDeaths(d, currentYear))]).nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));

        svg.append("g")
            .call(d3.axisLeft(y));

        const line = d3.line()
            .x(d => x(new Date(d.month)))
            .y(d => y(getMonthlyDeaths(d, currentYear)));

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

        // Add dots and tooltips for state 1
        svg.selectAll(".dot1")
            .data(stateData1)
          .enter().append("circle")
            .attr("class", "dot1")
            .attr("cx", d => x(new Date(d.month)))
            .attr("cy", d => y(getMonthlyDeaths(d, currentYear)))
            .attr("r", 5)
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${state1}<br>Month: ${d.month}<br>Deaths: ${getMonthlyDeaths(d, currentYear)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add dots and tooltips for state 2
        svg.selectAll(".dot2")
            .data(stateData2)
          .enter().append("circle")
            .attr("class", "dot2")
            .attr("cx", d => x(new Date(d.month)))
            .attr("cy", d => y(getMonthlyDeaths(d, currentYear)))
            .attr("r", 5)
            .attr("fill", "orange")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "steelblue");
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${state2}<br>Month: ${d.month}<br>Deaths: ${getMonthlyDeaths(d, currentYear)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("fill", "orange");
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add annotations for state names
        svg.append("text")
            .attr("transform", `translate(${width},${getMonthlyDeaths(y(stateData1[stateData1.length - 1], currentYear))})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "steelblue")
            .text(state1);

        svg.append("text")
            .attr("transform", `translate(${width},${getMonthlyDeaths(y(stateData2[stateData2.length - 1], currentYear))})`)
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
