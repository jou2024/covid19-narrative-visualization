const yearTabs = document.querySelectorAll('.year-tabs a[data-year]');
const prevYearBtn = document.getElementById('prevYear');
const nextYearBtn = document.getElementById('nextYear');
const sceneTabs = document.querySelectorAll('.scene-tabs a');
const scenes = document.querySelectorAll('.scene');

let currentYear = '2022'; // Default year

// Event listener for year tabs
yearTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        currentYear = this.getAttribute('data-year');
        loadYear(currentYear);
    });
});

// Event listener for scene tabs
sceneTabs.forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('data-target');
        showScene(target);
    });
});

// Event listener for previous and next year buttons
prevYearBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentYear === '2021') {
        currentYear = '2020';
    } else if (currentYear === '2022') {
        currentYear = '2021';
    }
    loadYear(currentYear);
    updateYearButtons();
});

nextYearBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (currentYear === '2020') {
        currentYear = '2021';
    } else if (currentYear === '2021') {
        currentYear = '2022';
    }
    loadYear(currentYear);
    updateYearButtons();
});

// Function to load data and update visualizations for the selected year
function loadYear(year) {
    yearTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.year-tabs a[data-year="${year}"]`).classList.add('active');
    loadDataForYear(year);
    updateYearButtons();
}

// Function to update the state of year navigation buttons
function updateYearButtons() {
    prevYearBtn.classList.toggle('disabled', currentYear === '2020');
    nextYearBtn.classList.toggle('disabled', currentYear === '2022');
}

// Function to show the selected scene
function showScene(sceneId) {
    scenes.forEach(scene => scene.classList.remove('active'));
    document.getElementById(sceneId).classList.add('active');
}

// Function to load data for the selected year
function loadDataForYear(year) {
    d3.csv(`data/total_deaths_state_${year}.csv`).then(totalDeathsData => {
        d3.csv(`data/monthly_deaths_state_${year}.csv`).then(monthlyDeathsData => {
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

// Initialize with the default year
loadYear('2022');
showScene('scene1');

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

function createAnnotation(svg, annotationData) {
    const annotations = annotationData.map(d => ({
        note: {
            label: d.note.label,
            title: d.note.title,
            wrap: 800 // Adjust this value to increase the width of the text box
        },
        x: d.x,
        y: d.y,
        dy: d.dy,
        dx: d.dx
    }));
    const makeAnnotations = d3.annotation()
        .type(d3.annotationCalloutCircle)
        .annotations(annotationData);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

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

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    const margin = { top: 20, right: 60, bottom: 40, left: 180 };
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
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "16px");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "18px");

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
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`State: ${d.state}<br>Total Deaths: ${getTotalDeaths(d, currentYear)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
              .attr("fill", "steelblue");
            // Hide tooltip or additional data
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Add annotation data
    let annotationData = [];
    if (currentYear === '2020') {
        annotationData = [
            {
                note: { label: "In 2020, New York City was the epicenter of the COVID-19 pandemic in the United States, with over 18,600 deaths reported by June, and the city struggling with overwhelmed healthcare facilities and high transmission rates among densely populated areas", title: "New York" },
                x: x(getTotalDeaths(data.find(d => d.state === "New York"), currentYear)) + 5,
                y: y("New York") + y.bandwidth() / 2,
                dy: -20,
                dx: -50
            },
            {
                note: { label: "California faced significant COVID-19 challenges in 2020, especially in urban areas like Los Angeles, leading to over 25,000 deaths by year-end. The state's response included extensive lockdowns and public health measures", title: "California" },
                x: x(getTotalDeaths(data.find(d => d.state === "California"), currentYear)) + 5,
                y: y("California") + y.bandwidth() / 2,
                dy: 20,
                dx: 50
            },
            {
                note: { label: "Texas experienced a severe surge in COVID-19 cases in the latter half of 2020, with over 20,000 deaths by December. Major cities like Houston and Dallas were heavily impacted​ ", title: "Texas" },
                x: x(getTotalDeaths(data.find(d => d.state === "Texas"), currentYear)) + 5,
                y: y("Texas") + y.bandwidth() / 2,
                dy: -20,
                dx: 150
            }
        ];
    } else if (currentYear === '2021') {
        annotationData = [
            {
                note: { label: "In 2021, California continued to see high death tolls from COVID-19, reaching over 70,000 cumulative deaths. Vaccination campaigns were ramped up, but new variants posed ongoing challenges", title: "California" },
                x: x(getTotalDeaths(data.find(d => d.state === "California"), currentYear)) + 5,
                y: y("California") + y.bandwidth() / 2,
                dy: 20,
                dx: -50
            },
            {
                note: { label: "Texas saw a substantial increase in COVID-19 deaths in 2021, with the total surpassing 60,000. The state faced waves of infections driven by variants, impacting both urban and rural areas significantly​ ", title: "Texas" },
                x: x(getTotalDeaths(data.find(d => d.state === "Texas"), currentYear)) + 5,
                y: y("Texas") + y.bandwidth() / 2,
                dy: -20,
                dx: -50
            },
            {
                note: { label: "​ Florida's COVID-19 death toll rose dramatically in 2021, exceeding 55,000. Despite vaccination efforts, the state faced high mortality rates during the Delta variant surge in the summer months", title: "Florida" },
                x: x(getTotalDeaths(data.find(d => d.state === "Florida"), currentYear)) + 5,
                y: y("Florida") + y.bandwidth() / 2,
                dy: 20,
                dx: -50
            }
        ];
    } else if (currentYear === '2022') {
        annotationData = [
            {
                note: { label: "By 2022, California's COVID-19 death toll had reached a cumulative total of over 95,000. The state continued to deal with new variants and vaccination campaigns, focusing on booster shots to mitigate further spread", title: "California" },
                x: x(getTotalDeaths(data.find(d => d.state === "California"), currentYear)) + 5,
                y: y("California") + y.bandwidth() / 2,
                dy: 20,
                dx: -50
            },
            {
                note: { label: "In 2022, Florida's cumulative death toll from COVID-19 reached over 75,000. The state faced challenges with new variants and ongoing public health efforts to increase vaccination coverage", title: "Florida" },
                x: x(getTotalDeaths(data.find(d => d.state === "Florida"), currentYear)) + 5,
                y: y("Florida") + y.bandwidth() / 2,
                dy: 20,
                dx: -50
            },
            {
                note: { label: "Texas recorded over 85,000 cumulative COVID-19 deaths by 2022. The state struggled with vaccine hesitancy in certain regions, leading to continued high transmission rates and fatalities​", title: "Texas" },
                x: x(getTotalDeaths(data.find(d => d.state === "Texas"), currentYear)) + 5,
                y: y("Texas") + y.bandwidth() / 2,
                dy: -20,
                dx: -50
            }
        ];
    }

    createAnnotation(svg, annotationData);

    // Update overview text
    let overviewText = "";
    if (currentYear === '2020') {
        overviewText = "In 2020, New York recorded the highest number of COVID-19 related deaths, significantly surpassing other states. This spike was driven by the early and severe impact of the pandemic on the state. States like New Jersey and California also experienced high death tolls.";
    } else if (currentYear === '2021') {
        overviewText = "In 2021, COVID-19 deaths spread more evenly across the United States, with states like California, Texas, and Florida recording the highest numbers. The distribution indicates a shift from the concentrated outbreak in New York in 2020 to a more widespread impact.";
    } else if (currentYear === '2022') {
        overviewText = "In 2022, the trend of high COVID-19 deaths continued in states such as California, Texas, and Florida. These states consistently reported high death tolls, reflecting ongoing struggles with the pandemic despite vaccination efforts and other mitigation measures.";
    }
    document.querySelector("#scene1 .overview").textContent = overviewText;
}

function createLineChart(data) {
    console.log("Start createLineChart"); // Debugging
    d3.select("#lineChart").html(""); // Clear existing chart

    const margin = { top: 20, right: 150, bottom: 40, left: 90 };
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


        // // Add annotation data
        // let annotationData = [];
        // if (currentYear === '2020') {
        //     annotationData = [
        //         {
        //             note: { label: "New York had the highest deaths in April", title: "New York" },
        //             x: x(new Date('2020-04-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "New York" && d.month === '2020-04-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         },
        //         {
        //             note: { label: "New Jersey also saw a significant peak", title: "New Jersey" },
        //             x: x(new Date('2020-04-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "New Jersey" && d.month === '2020-04-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         }
        //     ];
        // } else if (currentYear === '2021') {
        //     annotationData = [
        //         {
        //             note: { label: "California had the highest deaths in January", title: "California" },
        //             x: x(new Date('2021-01-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "California" && d.month === '2021-01-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         },
        //         {
        //             note: { label: "Texas saw a significant peak in February", title: "Texas" },
        //             x: x(new Date('2021-02-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "Texas" && d.month === '2021-02-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         }
        //     ];
        // } else if (currentYear === '2022') {
        //     annotationData = [
        //         {
        //             note: { label: "California continued to have high deaths in January", title: "California" },
        //             x: x(new Date('2022-01-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "California" && d.month === '2022-01-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         },
        //         {
        //             note: { label: "Florida saw a peak in July", title: "Florida" },
        //             x: x(new Date('2022-07-01')),
        //             y: y(getMonthlyDeaths(filteredData.find(d => d.state === "Florida" && d.month === '2022-07-01'), currentYear)),
        //             dy: -20,
        //             dx: 100
        //         }
        //     ];
        // }

        // createAnnotation(svg, annotationData);


    }

    // Initialize with all states
    updateChart("All");
    // Update overview text
    let overviewText = "";
    if (currentYear === '2020') {
        overviewText = "In 2020, the monthly deaths due to COVID-19 saw dramatic increases, especially in the early months of the pandemic. New York experienced the highest peak in April, reflecting the initial surge. Other states like New Jersey and Michigan also recorded significant spikes. The trend highlighted the severe impact of the virus in the initial stages, with the death toll rising sharply before stabilizing later in the year.";
    } else if (currentYear === '2021') {
        overviewText = "In 2021, the monthly deaths due to COVID-19 showed a more distributed pattern across the United States. While the overall death toll remained high, states such as California, Texas, and Florida recorded significant peaks throughout the year. The trends indicate multiple waves of the virus affecting different regions at different times, with periodic surges reflecting ongoing outbreaks and the emergence of new variants.";
    } else if (currentYear === '2022') {
        overviewText = "In 2022, the monthly deaths due to COVID-19 continued to reflect the persistent impact of the pandemic. States like California, Texas, and Florida consistently recorded high death tolls. The trends indicate that while some progress was made with vaccinations, the virus continued to affect large populations, with periodic increases in deaths corresponding to new outbreaks and variants.";
    }
    document.querySelector("#scene2 .overview").textContent = overviewText;
}

function createStateComparison(data) {

    console.log("Start createStateComparison"); // Debugging

    d3.select("#comparisonChart").html(""); // Clear existing chart

    const margin = { top: 20, right: 120, bottom: 40, left: 90 };
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
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")))
            .style("font-size", "15px");;

        svg.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", "18px");;

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
            .attr("transform", `translate(${width},${y(getMonthlyDeaths(stateData1[stateData1.length - 1], currentYear))})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "steelblue")
            .text(state1);

        svg.append("text")
            .attr("transform", `translate(${width},${y(getMonthlyDeaths(stateData2[stateData2.length - 1], currentYear))})`)
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("fill", "orange")
            .text(state2);

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    // Update guidance text
    document.querySelector("#scene3 .overview").textContent = "The State Comparison scene allows users to select any two states and compare their monthly COVID-19 death trends. Use the dropdown menus to choose the states you want to compare and click the 'Compare' button to update the chart. This interactive feature helps identify differences and similarities in how the pandemic impacted various states over time. Annotations highlight key trends and notable data points, providing a clearer understanding of the comparative impact.";

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
