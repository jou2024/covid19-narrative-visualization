// Load the data
d3.csv('data/us_state.csv').then(data => {
    // Scene 1: Total Deaths by State
    createBarChart(data);

    // Scene 2: Monthly Death Trends
    createLineChart(data);

    // Scene 3: State Comparison
    createStateComparison(data);
});

function createBarChart(data) {
    // D3 code to create bar chart
    const svg = d3.select("#scene1").append("svg")
        .attr("width", 800)
        .attr("height", 600);
    // Add your D3 code here to create the bar chart
}

function createLineChart(data) {
    // D3 code to create line chart
    const svg = d3.select("#scene2").append("svg")
        .attr("width", 800)
        .attr("height", 600);
    // Add your D3 code here to create the line chart
}

function createStateComparison(data) {
    // D3 code to create side-by-side line charts
    const svg1 = d3.select("#scene3").append("svg")
        .attr("width", 400)
        .attr("height", 600);
    const svg2 = d3.select("#scene3").append("svg")
        .attr("width", 400)
        .attr("height", 600);
    // Add your D3 code here to create the side-by-side line charts
}
