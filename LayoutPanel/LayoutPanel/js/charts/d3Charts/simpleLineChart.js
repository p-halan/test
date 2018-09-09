/**
 * Created by pavlo.halan on 9/12/2018.
 */

define([],
    function () {

        function formatDate(date) {
            const monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
            ];

            const monthIndex = date.getMonth();
            const year = date.getFullYear();

            return `${monthNames[monthIndex]} ${year}`;
        }

        function drawLineChart(svgEl, chartData, lineData){
            const xScale = d3.time.scale()
                .rangeRound([0, chartData.width]);

            const yScale = d3.scale.linear()
                .rangeRound([chartData.height, 0]);

            const lineFunction = d3.svg.line()
                .x(function(d) { return xScale(new Date(d.x)); })
                .y(function(d) { return yScale(d.y); })
                .interpolate("basis");

            const svgContainer = d3.select(`#${svgEl}`)
                .attr("width", chartData.width + chartData.margin *2)
                .attr("height", chartData.height + chartData.margin *2 )
                .append("g")
                .attr("transform",
                    "translate(" + chartData.margin + "," + chartData.margin  + ")");

            xScale.domain(d3.extent(lineData, function(d) { return (new Date(d.x)); }));
            yScale.domain([0, chartData.height]);

            svgContainer.append("path")
                .attr("d", lineFunction(lineData))
                .attr("stroke", chartData.color)
                .attr("stroke-width", 2)
                .attr("fill", "none");

            svgContainer
                .append("text")
                .attr("x", 0)
                .attr("y", chartData.margin * 2)
                .text( function (d) { return formatDate(new Date(lineData[0].x)); })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "#445557");

            svgContainer
                .append("text")
                .attr("x", chartData.width + chartData.margin)
                .attr("y", chartData.margin * 2)
                .attr("text-anchor", "end")
                .text( function (d) { return "Today"})
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", "#329970");

            svgContainer.selectAll("dot")
                .data([lineData[0], lineData[lineData.length -1]])
                .enter().append("circle")
                .attr("r", 3.5)
                .style("fill", chartData.color)
                .attr("cx", function(d) { return xScale(new Date(d.x)); })
                .attr("cy", function(d) { return yScale(d.y); });

        }

        return {
            draw: drawLineChart
        };
    }
);
