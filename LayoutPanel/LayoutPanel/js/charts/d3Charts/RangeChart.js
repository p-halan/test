define([],
function () {
    function D3RangeChart() {
        var self = this;
        self.containerID = null;
        self.margin = { top: 19, right: 0, bottom: 0, left: 12 };
        self.width = null;
        self.height = null;
        self.groupHeight = null;
        self.explodeGroupHeight = null;
        self.exploded = false;

        self.lines = [];
        self.columnSerie = new ColumnSerie(self);
        self.stackedColumnSerie = new StackedColumnSerie(self);

        self.dateStep = 0;
        self.dateRange = 0;
        self.getValWidth = function () {
            var stepCount = 1;
            if (self.dateRange != 0)
                stepCount = (self.dateRange) / self.dateStep;
            var oneValWidth = (self.width) / (stepCount);
            return oneValWidth;
        };

        self.svg = null;
        self.grid = null; // background grid
        self.area = null;
        self.defs = null;

        self.defultGroupName = "";
        self.groups = [];
        self.defaultXFormat = null;
        self.axes = null;
        self.xAxisArr = [];
        self.yAxisArr = [];

        self.onclick = null;
        self.clickSelectedValue = null;
        self.clickSelected = null;

        self.focus = null;
        self.tooltip = null;
        self.hoverDateFormat = "mmm dd, yyyy";
        self.tooltipDateFormat = "mmm dd, yyyy";

        self.init = function (_settings) {
            if (!_settings || _settings == null && _settings.container == null) return;

            self.containerID = "#" + _settings.container;
            $(self.containerID).hide();

            if (_settings.margin_top) {
                self.margin.top = _settings.margin_top;
            }
            if (_settings.margin_bottom) {
                self.margin.bottom = _settings.margin_bottom;
            }
            if (_settings.margin_left) {
                self.margin.left = _settings.margin_left;
            }
            if (_settings.margin_right) {
                self.margin.right = _settings.margin_right;
            }
            if (_settings.exploded)
                self.exploded = _settings.exploded;
            if (_settings.defaultXFormat)
                self.defaultXFormat = _settings.defaultXFormat;
            if (_settings.hoverDateFormat)
                self.hoverDateFormat = _settings.hoverDateFormat;
            if (_settings.tooltipDateFormat)
                self.tooltipDateFormat = _settings.tooltipDateFormat;

            self.width = _settings.width - self.margin.left - self.margin.right - 20;
            //self.height = _settings.height - margin.top - margin.bottom;
            self.height = 20;
            self.groupHeight = _settings.height - self.margin.top - self.margin.bottom;
            if (_settings.explodeGroupHeight)
                self.explodeGroupHeight = _settings.explodeGroupHeight - self.margin.top - self.margin.bottom;
            else
                self.explodeGroupHeight = self.groupHeight;

            self.svg = d3.select("#" + _settings.container).append("div").style("background-color", "white").append("svg")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + self.margin.left + "," + 6 + ")");
            self.svg.on('click', getClickDates);

            self.grid = self.svg.append("g");
            self.area = self.svg.append("g").attr("id", "areas");
            self.columnSerie.g = self.svg.append("g").attr("id", "columnSeries");
            self.stackedColumnSerie.g = self.svg.append("g").attr("id", "stackedColumnSeries");
            self.lineSeries = self.svg.append("g").attr("id", "series");
            self.points = self.svg.append("g").attr("id", "points");
            self.groupareas = self.svg.append("g").attr("id", "groupareas");
            self.axes = self.svg.append("g").attr("id", "axes");
            self.highlightRegion = self.svg.append("g").attr("id", "highlightRegion");
            self.highlightRegion.append("rect").style("display", "none");

            self.focus = self.svg.append("g")
                  .attr("class", "focus")
                  .style("display", "none");

            var widthText = 120;
            self.focus.append("line").attr('class', 'tooltipFrame line1').attr('x1', widthText / -2).attr('y1', 0).attr('x2', widthText / -2).attr('y2', -5);
            self.focus.append("line").attr('class', 'tooltipFrame line2').attr('x1', widthText / -2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', -5);
            self.focus.append("line").attr('class', 'tooltipFrame line3').attr('x1', widthText / 2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', 0);
            self.focus.append("text").attr('class', 'focusTooltipText').attr("transform", "translate(-0,10)").attr("text-anchor", "middle");
            self.focus.append("line").attr('class', 'tooltipFrame line4').attr('x1', widthText / -2).attr('y1', 10).attr('x2', widthText / -2).attr('y2', 15);
            self.focus.append("line").attr('class', 'tooltipFrame line5').attr('x1', widthText / -2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 15);
            self.focus.append("line").attr('class', 'tooltipFrame line6').attr('x1', widthText / 2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 10);
            self.focus.append("circle").attr("r", 6).attr("fill", "#394656").attr("transform", "translate(0,15)");

            self.focus.append("rect")
                .attr("id", 'verticalRectToolTip')
                .style("fill", "#ffffff")
                .attr("x", 8.5).attr("width", 3)
                .attr("y", 20).attr("height", "100%")
                .attr("transform", "translate(-10,0)");
            self.focus.append("line")
                .attr("id", 'verticalLineToolTip')
                .attr("x1", 10).attr("x2", 10)
                .attr("y1", 20).attr("y2", "100%")
                .attr("transform", "translate(-10,0)");

            self.clickSelected = self.svg.append("g")
                              .attr("class", "click-selected")
                              .style("display", "none");

            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line1').attr('x1', widthText / -2).attr('y1', 0).attr('x2', widthText / -2).attr('y2', -5);
            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line2').attr('x1', widthText / -2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', -5);
            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line3').attr('x1', widthText / 2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', 0);
            self.clickSelected.append("text").attr('class', 'clickSelectedTooltipText').attr("transform", "translate(-0,10)").attr("text-anchor", "middle");
            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line4').attr('x1', widthText / -2).attr('y1', 10).attr('x2', widthText / -2).attr('y2', 15);
            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line5').attr('x1', widthText / -2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 15);
            self.clickSelected.append("line").attr('class', 'tooltipFrameClickSelected line6').attr('x1', widthText / 2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 10);
            self.clickSelected.append("circle").attr("r", 6).attr("fill", "#E74C3C").attr("transform", "translate(0,15)");

            self.clickSelected.append("rect")
                .attr("id", 'verticalRectToolTipClickSelected')
                .style("fill", "#ffffff")
                .attr("x", 8.5).attr("width", 3)
                .attr("y", 20).attr("height", "100%")
                .attr("transform", "translate(-10,0)");
            self.clickSelected.append("line")
                .attr("id", 'verticalLineToolTipClickSelected')
                .attr("x1", 10).attr("x2", 10)
                .attr("y1", 20).attr("y2", "100%")
                .attr("stroke", "#E74C3C")
                .attr("transform", "translate(-10,0)");

            self.tooltip = new Tooltip(_settings.tooltipContainer);
            if (_settings.tooltipRenderHTML)
                self.tooltip.renderHTML = _settings.tooltipRenderHTML;

            self.tooltip.mousemove = function (coords) {
                if ($(self.containerID).length > 0) {
                    var svgOffset = $(self.containerID).offset();
                    coords.x -= svgOffset.left + 12; // left-margin:12
                    coords.y = svgOffset.top;
                    mousemove(coords);
                };
            }
            self.tooltip.mouseover = function () {
                self.focus.style("display", null);
            };
            self.tooltip.mouseout = function () {
                self.focus.style("display", "none");
                self.tooltip.hide();
            };
            self.svg.append("rect")
                .attr("class", "overlay")
                .attr("fill", "none")
                .attr("width", '100%')
                .attr("height", '100%')
                .on("mouseover", function () { /*self.focus.style("display", null);*/ })
                .on("mouseout", function () {
                    var coords = { x: d3.mouse(this)[0], y: d3.mouse(this)[1] };
                    self.focus.style("display", "none");
                    self.tooltip.hide();

                })
                .on("mousemove", function () {
                    var coords = { x: d3.mouse(this)[0], y: d3.mouse(this)[1] }; mousemove(coords);
                });
            var defultGroupName = "";
            if (_settings.defultGroupName)
                self.defultGroupName = _settings.defultGroupName

            self.defs = self.svg.append("defs");
            var pattern = self.defs.append('pattern').attr('id', 'patternhighlightRegion')
                                       .attr('patternUnits', 'userSpaceOnUse')
                                       .attr('width', 4)
                                       .attr('height', 4);

            pattern.append('svg:line')
                 .attr("x1", 0)
                 .attr("y1", 0)
                 .attr("x2", 4)
                 .attr("y2", 4)
                 .attr('stroke', "#67d6ff")
                 .attr('stroke-width', 1);

            pattern.append('svg:line')
                 .attr("x1", -2)
                 .attr("y1", -2)
                 .attr("x2", 2)
                 .attr("y2", 2)
                 .attr('stroke', "#67d6ff")
                 .attr('stroke-width', 1);

            pattern.append('svg:line')
                .attr("x1", 2)
                .attr("y1", 2)
                .attr("x2", 6)
                .attr("y2", 6)
                .attr('stroke', "#67d6ff")
                .attr('stroke-width', 1);
            self.highlightRegion.select("rect").attr("fill", "url(#patternhighlightRegion)");
        }

        function getDataByCoord(coords, isClick) {
            var res = [];
            var seriesArr = [];
            var xCoord = null;
            var xCoordIndex = null;
            var date = null;
            for (var i = 0; i < self.lines.length; i++) {
                var x0 = self.lines[i].xAxis.x.invert(coords.x);
                var item = null;
                if (self.lines[i].data.length > 1) {
                    for (var j = 0; j < self.lines[i].data.length - 1 ; j++) {
                        if (self.lines[i].data[j].dt.valueOf() <= x0.valueOf() && x0.valueOf() < self.lines[i].data[j + 1].dt.valueOf()) {
                            //if (xCoordIndex == null) {
                            var dateStep = self.lines[i].data[j + 1].dt.valueOf() - self.lines[i].data[j].dt.valueOf();
                            if (self.dateStep > dateStep || self.dateStep >= 24 * 60 * 60 * 1000) {
                                dateStep = self.dateStep;
                            }
                            if ((x0.valueOf() - self.lines[i].data[j].dt.valueOf()) <= dateStep / 2) {
                                item = { dt: self.lines[i].data[j].dt, v: self.lines[i].data[j].v };
                            }
                            else if ((self.lines[i].data[j + 1].dt.valueOf() - x0.valueOf()) <= dateStep / 2) {
                                item = { dt: self.lines[i].data[j + 1].dt, v: self.lines[i].data[j + 1].v };
                            }

                            //}
                            //else if (self.lines[i].data[j].v != null && self.lines[i].data[j + 1].v != null) {
                            //    var dt = self.lines[i].xAxis.x.invert(xCoord);
                            //    var val = linearInterpolation(dt, self.lines[i].data[j].dt.valueOf(), self.lines[i].data[j + 1].dt.valueOf(), self.lines[i].data[j].v, self.lines[i].data[j + 1].v);
                            //    item = { dt: dt, v: val };
                            //}
                        }
                    }
                    if (item == null) {
                        if (x0.valueOf() <= self.lines[i].data[0].dt.valueOf() && self.lines[i].data[0].dt.valueOf() - x0.valueOf() < self.dateStep / 2) {
                            item = { dt: self.lines[i].data[0].dt, v: self.lines[i].data[0].v };
                        }
                        else if (self.lines[i].data[self.lines[i].data.length - 1].dt.valueOf() <= x0.valueOf() && x0.valueOf() - self.lines[i].data[self.lines[i].data.length - 1].dt.valueOf() < self.dateStep / 2) {
                            var endIndex = self.lines[i].data.length - 1;
                            item = { dt: self.lines[i].data[endIndex].dt, v: self.lines[i].data[endIndex].v };
                        }
                    }
                }
                else if (self.lines[i].data.length == 1)
                    item = { dt: self.lines[i].data[0].dt, v: self.lines[i].data[0].v };

                if (item != null) {
                    if (isClick) {
                        seriesArr.push({
                            dt: item.dt,
                            xAxisId: self.lines[i].xAxis.id,
                            xAxisIndex: self.lines[i].xAxis.index,
                            distance: Math.abs(coords.x - self.lines[i].xAxis.x(item.dt)),
                            xCoord: self.lines[i].xAxis.x(item.dt),
                            serie: self.lines[i]
                        });
                    }
                    else if (item.v != null) {
                        seriesArr.push({
                            name: self.lines[i].name,
                            v: item.v,
                            dt: item.dt,
                            type: self.lines[i].type,
                            color: self.lines[i].color,
                            xAxisId: self.lines[i].xAxis.id,
                            y: self.lines[i].yAxis.y,
                            unit: self.lines[i].yAxis.unit,
                            index: self.lines[i].group.index,
                            groupName: self.lines[i].group.name,
                            xAxisIndex: self.lines[i].xAxis.index,
                            distance: Math.abs(coords.x - self.lines[i].xAxis.x(item.dt)),
                            xCoord: self.lines[i].xAxis.x(item.dt),
                            serie: self.lines[i]
                        });
                    }
                    /*if (xCoordIndex == null || xCoordIndex > self.lines[i].xAxis.index) {
                        xCoordIndex = self.lines[i].xAxis.index;
                        xCoord = self.lines[i].xAxis.x(item.dt);
                        date = item.dt;
                    }*/
                }
            }
            if (seriesArr.length > 0) {
                seriesArr.sort(function (a, b) { return a.distance > b.distance; });
                xCoord = seriesArr[0].xCoord;
                delete seriesArr[0].distance;
                delete seriesArr[0].xCoord;
                delete seriesArr[0].serie;
                res.push(seriesArr[0]);
                seriesArr.splice(0, 1);
                for (var i = 0; i < seriesArr.length; i++) {
                    for (var j = 0; j < seriesArr[i].serie.data.length - 1; j++) {
                        var dt = seriesArr[i].serie.xAxis.x.invert(xCoord);
                        if (seriesArr[i].serie.data[j].dt.valueOf() <= dt.valueOf() && dt.valueOf() <= seriesArr[i].serie.data[j + 1].dt.valueOf()) {
                            if (seriesArr[i].serie.data[j].v != null && seriesArr[i].serie.data[j + 1].v != null) {
                                var val = linearInterpolation(dt, seriesArr[i].serie.data[j].dt.valueOf(), seriesArr[i].serie.data[j + 1].dt.valueOf(), seriesArr[i].serie.data[j].v, seriesArr[i].serie.data[j + 1].v);
                                item = { dt: dt, v: val };
                                seriesArr[i].dt = dt;
                                if (!isClick)
                                    seriesArr[i].v = val;
                                delete seriesArr[i].distance;
                                delete seriesArr[i].xCoord;
                                delete seriesArr[i].serie;
                                res.push(seriesArr[i]);
                                break;
                            }
                        }
                    }
                }
                res.sort(function (a, b) { return a.xAxisIndex > b.xAxisIndex; });
                date = res[0].dt
            }
            return {
                date: date, xCoord: xCoord, data: res
            };

            function linearInterpolation(x, x0, x1, y0, y1) {
                if (x1 == x0)
                    return (y0 + y1) / 2;

                return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
            };
        };

        function getClickDates() {
            if (self.onclick) {
                var coords = { x: d3.mouse(this)[0], y: d3.mouse(this)[1] };
                var dataByCoord = getDataByCoord(coords, true);
                if (dataByCoord.data.length > 0) {
                    if (dataByCoord.xCoord != null) {
                        self.clickSelectedValue = dataByCoord.data[0].dt;
                        showClickSelected(dataByCoord.data[0].dt, dataByCoord.xCoord);
                    }
                    self.onclick(dataByCoord.data);
                }
                self.onclick(null);
            }
        };

        function mousemove(coords) {
            var dataByCoord = getDataByCoord(coords, false);
            var seriesArr = dataByCoord.data;
            self.focus.selectAll("circle.current").remove();
            if (seriesArr.length > 0) {
                for (var i = 0; i < seriesArr.length; i++) {
                    if (seriesArr[i].type == "line" || seriesArr[i].type == "spline" || seriesArr[i].type == "area" || seriesArr[i].type == "areaspline") {
                        self.focus.append("circle")
                            .attr("class", "current")
                            .attr("r", 4)
                            .attr("fill", seriesArr[i].color)
                            .attr("transform", "translate(0, " + seriesArr[i].y(seriesArr[i].v) + ")");
                    }
                }
                if (dataByCoord.xCoord != null) {
                    var text = new Date(dataByCoord.date).format(self.hoverDateFormat);
                    var positionText = getTextAnchorForHover(dataByCoord.xCoord, text.length);
                    self.focus.selectAll("text").attr("text-anchor", positionText).text(text);

                    var idChartContainer = self.containerID.replace('#', '');
                    var widthText = getD3TextInputWidth(idChartContainer + ' .focusTooltipText') + 20;

                    if (positionText == 'middle') {
                        self.focus.select(self.containerID + ' .tooltipFrame.line1').attr('x1', widthText / -2).attr('y1', 0).attr('x2', widthText / -2).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line2').attr('x1', widthText / -2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line3').attr('x1', widthText / 2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', 0);
                        self.focus.select(self.containerID + ' .tooltipFrame.line4').attr('x1', widthText / -2).attr('y1', 10).attr('x2', widthText / -2).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line5').attr('x1', widthText / -2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line6').attr('x1', widthText / 2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 10);
                    }
                    else if (positionText == 'start') {
                        self.focus.select(self.containerID + ' .tooltipFrame.line1').attr('x1', -10).attr('y1', 0).attr('x2', -10).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line2').attr('x1', -10).attr('y1', -5).attr('x2', widthText - 10).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line3').attr('x1', widthText - 10).attr('y1', -5).attr('x2', widthText - 10).attr('y2', 0);
                        self.focus.select(self.containerID + ' .tooltipFrame.line4').attr('x1', -10).attr('y1', 10).attr('x2', -10).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line5').attr('x1', -10).attr('y1', 15).attr('x2', widthText - 10).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line6').attr('x1', widthText - 10).attr('y1', 15).attr('x2', widthText - 10).attr('y2', 10);
                    }
                    else if (positionText == 'end') {
                        self.focus.select(self.containerID + ' .tooltipFrame.line1').attr('x1', 10 - widthText).attr('y1', 0).attr('x2', 10 - widthText).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line2').attr('x1', 10 - widthText).attr('y1', -5).attr('x2', 10).attr('y2', -5);
                        self.focus.select(self.containerID + ' .tooltipFrame.line3').attr('x1', 10).attr('y1', -5).attr('x2', 10).attr('y2', 10);
                        self.focus.select(self.containerID + ' .tooltipFrame.line4').attr('x1', 10 - widthText).attr('y1', 10).attr('x2', 10 - widthText).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line5').attr('x1', 10 - widthText).attr('y1', 15).attr('x2', 10).attr('y2', 15);
                        self.focus.select(self.containerID + ' .tooltipFrame.line6').attr('x1', 10).attr('y1', 15).attr('x2', 10).attr('y2', 10);
                    }

                    self.focus.selectAll("#verticalRectToolTip").attr("height", self.height - getBottomPadding());
                    self.focus.selectAll("#verticalLineToolTip").attr("y2", self.height - getBottomPadding());
                    self.focus.attr("transform", "translate(" + dataByCoord.xCoord + ", 0)");
                    var svgOffset = $(self.containerID).offset();
                    var orient = "right";
                    if (coords.x > self.width / 2) {
                        orient = "left";
                    }

                    seriesArr.sort(function (a, b) {
                        if (a.index == b.index)
                            return 0;
                            //if (a.index == b.index) {
                            //    if (a.name == b.name)
                            //        return 0;
                            //    else
                            //        return a.name > b.name ? 1 : -1;
                            //}
                        else
                            return a.index < b.index ? 1 : -1;
                    });

                    var buf = seriesArr;
                    seriesArr = {};
                    if (buf.length > 0) {
                        var index = buf[0].index;
                        for (var i = 0; i < buf.length; i++) {
                            if (buf[i].index != index)
                                index = buf[i].index;
                            if (seriesArr[index] == undefined)
                                seriesArr[index] = [];
                            var date = new Date(buf[i].dt).format(self.tooltipDateFormat);
                            if (seriesArr[index][date] == undefined)
                                seriesArr[index][date] = [];
                            seriesArr[index][date].push(buf[i]);
                        }
                    }

                    //for (item in seriesArr) {
                    //    seriesArr[item].sort(function (a, b) {
                    //        if (a.index == b.index) {
                    //            if (a.name == b.name)
                    //                return 0;
                    //            else
                    //                return a.name < b.name ? 1 : -1;
                    //        }
                    //        else
                    //            return a.index < b.index ? 1 : -1;
                    //    });
                    //}
                    var yCoord = -$(document).scrollTop() + svgOffset.top + 25;
                    /*if (yCoord < 70)
                        yCoord = 70;*/
                    self.focus.style("display", null);
                    self.tooltip.show(dataByCoord.xCoord + svgOffset.left, yCoord, seriesArr, self.tooltipDateFormat, orient, self.explodeGroupHeight);
                }
            }
            else {
                self.focus.style("display", "none");
                self.tooltip.hide();
            }
        }

        self.refreshMinMax = function () {
            self.dateRange = 0;
            var dateStep = 2000;
            for (var i = 0; i < self.lines.length; i++) {
                for (var j = 0; j < self.lines[i].data.length - 1; j++) {
                    var curStep = Math.abs(self.lines[i].data[j + 1].dt.valueOf() - self.lines[i].data[j].dt.valueOf());
                    if ((i == 0 && j == 0 || dateStep > curStep) && curStep != 0) {
                        dateStep = curStep;
                    }
                }
            }
            self.dateStep = dateStep;

            var containsColumn = false;
            var allDataAxis = [];
            for (var i = 0; i < self.lines.length; i++) {
                if (allDataAxis[self.lines[i].xAxis.id] == undefined)
                    allDataAxis[self.lines[i].xAxis.id] = [];
                for (var j = 0; j < self.lines[i].data.length; j++) {
                    allDataAxis[self.lines[i].xAxis.id].push(self.lines[i].data[j].dt);
                }
                if (self.lines[i].type == "column" || self.lines[i].type == "stackedcolumn")
                    containsColumn = true;
            }
            for (data in allDataAxis) {
                if (allDataAxis[data].length > 0) {
                    var xtend = d3.extent(allDataAxis[data], function (d) { return d; });
                    var range = xtend[1].valueOf() - xtend[0].valueOf();
                    //if (containsColumn)
                    range += dateStep;
                    if (self.dateRange < range)
                        self.dateRange = range;
                }
            }
        };



        self.reDrawAxis = function () {
            for (var item in self.groups) {
                self.groups[item].refresh();
            }
            for (var item in self.xAxisArr) {
                //if (self.xAxisArr[item].id == serie.xAxis.id) {
                self.xAxisArr[item].reDraw();
                //}
            }
            for (var item in self.yAxisArr) {
                //if (self.yAxisArr[item].id == serie.yAxis.id) {
                self.yAxisArr[item].reDraw();
            }
        }

        self.reDraw = function (serie) {

            if (self.tooltip)
                self.tooltip.hide();
            self.refreshMinMax();
            self.reDrawAxis();

            for (var i = 0; i < self.lines.length; i++) {
                //if (self.lines[i].yAxis.id == serie.yAxis.id) {
                if (self.lines[i].type == "line" || self.lines[i].type == "spline") {
                    //removeLineAreaFromChart(self.lines[i].id, self.lines[i].type);
                    drawLine(self.lines[i]);
                }
                else if (self.lines[i].type == "area" || self.lines[i].type == "areaspline" || self.lines[i].type == "arearange" || self.lines[i].type == "arearangespline") {
                    //removeLineAreaFromChart(self.lines[i].id, self.lines[i].type);
                    drawArea(self.lines[i]);
                }
                else if (self.lines[i].type == "points") {
                    drawPoints(self.lines[i]);
                }
                else if (self.lines[i].type == "column" || self.lines[i].type == "stackedcolumn") {
                }
                else if (self.lines[i].type == "grouparea" || self.lines[i].type == "groupareaspline") {
                    removeLineAreaFromChart(self.lines[i].id, self.lines[i].type);
                    drawGroupArea(self.lines[i]);
                }
                //}
            }
            self.columnSerie.draw();
            self.stackedColumnSerie.draw();
        };

        self.addSerie = function (serie) {
            addSerie(serie);
            self.reDraw();
        };

        self.addSeries = function (series, reDraw) {
            for (var i = 0; i < series.length; i++) {
                addSerie(series[i]);
            }
            if (reDraw) {
                self.reDraw();
            }
        };

        function addSerie(serie) {
            var _serie = JSON.parse(JSON.stringify(serie));
            _serie.data = serie.data;
            if (_serie.colors)
                _serie.colors = serie.colors;
            $(self.containerID).show();
            _serie.sourceId = _serie.id;
            _serie.id = getRandomIndex();
            self.lines.push(_serie);
            addGroup(_serie);
            addXAxis(_serie);
            if (_serie.yAxis) {
                if (self.exploded)
                    _serie.yAxis.id = _serie.yAxis.id + _serie.group.id;
                addYAxis(_serie);
            }

            if (_serie.type == "area" || _serie.type == "areaspline" || _serie.type == "arearange" || _serie.type == "arearangespline"
                || _serie.type == "grouparea" || _serie.type == "groupareaspline"
                || _serie.type == "column" || _serie.type == "stackedcolumn") {
                createPattern(_serie);
            }
        };

        function addGroup(serie) {
            if (self.exploded && serie.group) {
                if (self.groups[serie.group.id] == undefined) {
                    var group = new Group(self, serie.group.id, serie.group.name);
                    var groupsSize = 0;
                    for (i in self.groups) groupsSize++;
                    group.index = groupsSize;
                    self.groups[group.id] = group;
                    for (var el in self.groups)
                        self.groups[el].refresh();
                }
                serie.group = self.groups[serie.group.id];
            }
            else {
                if (self.groups["default"] == undefined) {
                    createDefaultGroup();
                }
                serie.group = self.groups["default"];
            }
        };

        function addXAxis(serie) {
            if (serie.xAxis) {
                if (self.xAxisArr[serie.xAxis.id] == undefined) {
                    var newXAxis = new XAxis(self, serie.xAxis.id);
                    if (serie.xAxis.format)
                        newXAxis.format = serie.xAxis.format;
                    else if (self.defaultXFormat != null)
                        newXAxis.format = self.defaultXFormat;
                    if (serie.xAxis.visible != undefined)
                        newXAxis.visible = serie.xAxis.visible;
                    var allData = [];
                    for (var i = 0; i < self.lines.length; i++) {
                        for (var j = 0; j < self.lines[i].data.length; j++) {
                            allData.push(self.lines[i].data[j]);
                        }
                    }
                    var xtend = d3.extent(allData, function (d) { return d.dt; });
                    newXAxis.min = xtend[0];
                    newXAxis.max = xtend[1];

                    var xAxisSize = 0;
                    for (var i in self.xAxisArr) {
                        if (self.xAxisArr[i].visible)
                            xAxisSize++;
                    }
                    newXAxis.index = xAxisSize;
                    newXAxis.orient == "bottom"
                    newXAxis.draw();
                    self.xAxisArr[serie.xAxis.id] = newXAxis;
                }
                serie.xAxis = self.xAxisArr[serie.xAxis.id];
            }
            else {
                if (self.xAxisArr["default"] == undefined) {
                    createDefaultXAxis();
                }
                serie.xAxis = self.xAxisArr["default"];
            }
        };

        function addYAxis(serie) {
            if (self.yAxisArr[serie.yAxis.id] == undefined) {
                var newYAxis = new YAxis(self, serie.yAxis.id, serie.yAxis.unit);
                newYAxis.min = d3.min(serie.data, function (d) { return d.v; });
                newYAxis.max = d3.max(serie.data, function (d) { return d.v; });
                var yAxisSize = 1;
                for (var i in self.yAxisArr) {
                    if (self.yAxisArr[i].group.id == serie.group.id)
                        yAxisSize++;
                }
                newYAxis.orient = yAxisSize % 2 != 0 ? "right" : "left";
                if (newYAxis.orient == "right") {
                    newYAxis.index = parseInt(yAxisSize / 2);
                }
                else {
                    newYAxis.index = yAxisSize / 2 - 1;
                }
                newYAxis.group = self.groups[serie.group.id];

                newYAxis.draw();

                self.yAxisArr[serie.yAxis.id] = newYAxis;
                serie.yAxis = newYAxis;
            }
            else {
                serie.yAxis = self.yAxisArr[serie.yAxis.id];
            }
        }

        function getInterpolateMethodForSerie(serie) {
            if (undefined == serie) {
                return;
            };

            if (serie.type == "line" || serie.type == "spline") {
                return d3.svg.line().interpolate(getInterpolateType(serie.type))
                                .defined(function (d) { return d.v != null; })
                                .x(function (d) { return serie.xAxis.x(new Date(d.dt)); })
                                .y(function (d) { return serie.yAxis.y(d.v); });
            };

            if (serie.type == "area" || serie.type == "areaspline") {
                return d3.svg.area().interpolate(getInterpolateType(serie.type))
                                .defined(function (d) { return d.v != null; })
                                .x(function (d) { return serie.xAxis.x(new Date(d.dt)); })
                                .y0(function (d) { return (serie.type == "area" || serie.type == "areaspline") ? serie.yAxis.group.yCoord : serie.yAxis.y(d.v1); })
                                .y1(function (d) { return serie.yAxis.y(d.v); });

            };

            if (serie.type == "column") {

                var tMax = d3.max(self.lines, function (d) {
                    return d3.max(d.data, function (v) {
                        return v.dt;
                    })
                }) * 1;

                var tMin = d3.min(self.lines, function (d) {
                    return d3.min(d.data, function (v) {
                        return v.dt;
                    })
                }) * 1;

                var yMin = d3.min(self.lines, function (d) {
                    return d3.min(d.data, function (v) {
                        return v.v;
                    })
                });
                var yMax = d3.max(self.lines, function (d) {
                    return d3.max(d.data, function (v) {
                        return v.v;
                    })
                });

                var timestampScale = d3.scale.linear().domain([tMin, tMax]).range([0, self.width]);
                var ySc = d3.scale.linear().domain([yMin, yMax]).range([Math.round(serie.yAxis.group.yCoord * 0.9), Math.round((serie.yAxis.group.yCoord - self.explodeGroupHeight + 40))]);

                return d3.svg.area().interpolate("linear")
                    .x(function (d) { return timestampScale(d.x); })
                    .y0(function (d) { return serie.yAxis.group.yCoord; })
                    .y1(function (d) { return (d.y == 0 ? serie.yAxis.group.yCoord : serie.yAxis.y(d.y)); });

            };
        }


        function drawLine(serie, animating) {
            if (undefined == serie || 0 == serie.data.length) { return; }

            var line = d3.svg.line()
                             .defined(function (d) { return d.v != null; })
                             .x(function (d) { return serie.xAxis.x(d.dt); })
                             .y(function (d) { return serie.yAxis.y(d.v); }).interpolate(getInterpolateType(serie.type));


            if (1 == serie.data.length) {
                var p = [];
                p.push({ dt: serie.data[0].dt, v: serie.data[0].v });
                p.push({ dt: serie.data[0].dt, v: serie.data[0].v });
                serie.data = p;
            }

            var points = [];
            for (var i = 0; i < serie.data.length; i++) {
                points.push({ dt: serie.data[i].dt, v: serie.data[i].v, isNew: serie.data[i].isNew });
            };

            if (serie.isDataChanged) {
                for (var i = 0; i < points.length; i++) {
                    if (points[i].isNew) {
                        points[i].v = points[i - 1].v;
                        points[i].isNew = false;
                        serie.data[i].isNew = false;
                    };
                };
            };

            var path = d3.selectAll("#path-serie-id-" + serie.id);

            if (0 == path[0].length) {
                path = self.lineSeries.append("path").datum(points)
                .attr("stroke", serie.color)
                .attr("id", "path-serie-id-" + serie.id)
                .attr("class", "line")
                .attr("opacity", serie.strokeDasharray ? "1" : "0.6")
                .attr('d', line)
                .style("stroke-dasharray", serie.strokeDasharray ? serie.strokeDasharray : '')
                .attr('stroke-width', "2px")
                .attr("fill", 'none')
                .attr("transform", "translate(0,0)");
            };

            path.datum(points)
                .attr("opacity", serie.strokeDasharray ? "1" : "0.6")
                .style("stroke-dasharray", serie.strokeDasharray ? serie.strokeDasharray : '')
                .attr('stroke-width', "2px")
                .attr("fill", 'none')
                .transition()
                .duration(300)
                .delay(300)
                .attr('d', line);
        };

        //--------------------------------------------------------------------------------------

        self.getSerieBySourceID = function (serieId) {
            for (var i = 0; i < self.lines.length; i++) {
                if (self.lines[i].sourceId == serieId) {
                    return self.lines[i];
                }
            }
        };

        self.updateSerieDataBySourceId = function (serieId, data) {
            var serie = null;
            for (var i = 0; i < self.lines.length; i++) {
                if (self.lines[i].sourceId == serieId) {
                    self.lines[i].data = data
                    break;
                }
            }
        };

        self.getDataBySerieId = function (serieId) {
            for (var i = 0; i < self.lines.length; i++) {
                if (self.lines[i].sourceId == serieId) {
                    return self.lines[i].data;
                }
            }
        };

        function appendSerieData(serie, points) {
            if (undefined == serie || undefined == points || 0 == points.length) {
                return;
            };

            var p = [];
            for (var i = 0; i < points.length; i++) {
                p.push({ dt: points[i].dt, v: points[i].v, isNew: true });
            };

            var dataPoints = serie.data.concat(p);
            serie.isDataChanged = true;
            dataPoints.sort(comparePoints);
            serie.data = dataPoints;
            return dataPoints;
        }

        //redraw serie with new data. (serie.data have new data)
        self.reDrawData = function (dataArray) {
            if (undefined == dataArray) {
                return;
            };

            /// 1. Update all data in series

            for (var i = 0; i < self.lines.length; i++) {
                for (var j = 0; j < dataArray.length; j++) {
                    if (self.lines[i].sourceId == dataArray[j].sourceId) {
                        appendSerieData(self.lines[i], dataArray[j].points)
                    };
                };
            }

            self.reDraw();
            self.reDraw();

        };

        function comparePoints(a, b) {
            if (a.dt >= b.dt) return 1;
            if (a.dt < b.dt) return -1;
        }

        function drawLinePoints(serie) {
            self.points.selectAll("#serieID" + serie.id + ".linePoint").remove();
            self.points.selectAll("#serieID" + serie.id + ".linePoint")
                    .data(serie.data)
                    .enter().append("svg:circle")
                    .attr("id", "serieID" + serie.id)
                    .attr("class", "linePoint")
                    .attr("fill", function (d, i) { return serie.color; })
                    .attr("cx", function (d, i) { return serie.xAxis.x(d.dt) })
                    .attr("cy", function (d, i) { return serie.yAxis.y(d.v) })
                    .attr("r", function (d, i) { return 3 });

        };

        function drawPoints(serie) {
            self.points.selectAll("#serieID" + serie.id + ".point").remove();
            var radius = 3;
            if (serie.pointOptions && serie.pointOptions.r)
                radius = serie.pointOptions.r;
            if (serie.pointOptions && serie.pointOptions.type && (serie.pointOptions.type == "rect" || serie.pointOptions.type == "rhomb")) {
                self.points.selectAll("#serieID" + serie.id + ".point")
                                    .data(serie.data)
                                    .enter().append("svg:rect")
                                    .attr("id", "serieID" + serie.id)
                                    .attr("class", "point")
                                    .attr("fill", function (d, i) { return serie.color; })
                                    .attr("x", function (d, i) { return serie.xAxis.x(d.dt) - radius; })
                                    .attr("y", function (d, i) { return serie.yAxis.y(d.v) - radius; })
                                    .attr("width", function (d, i) { return radius * 2; })
                                    .attr("height", function (d, i) { return radius * 2; })
                                    .attr("transform", function (d, i) { return serie.pointOptions.type == "rhomb" ? "rotate(45," + serie.xAxis.x(d.dt) + "," + serie.yAxis.y(d.v) + ")" : "" });
            }
            else {
                self.points.selectAll("#serieID" + serie.id + ".point")
                                    .data(serie.data)
                                    .enter().append("svg:circle")
                                    .attr("id", "serieID" + serie.id)
                                    .attr("class", "point")
                                    .attr("fill", function (d, i) { return serie.color; })
                                    .attr("cx", function (d, i) { return serie.xAxis.x(d.dt) })
                                    .attr("cy", function (d, i) { return serie.yAxis.y(d.v) })
                                    .attr("r", function (d, i) { return radius; });
            }
        };

        function drawArea(serie) {
            if (undefined == serie || 0 == serie.data.length) { return; };
            var suma = 0;
            for (i = 0; i < serie.data.length; i++) {
                suma += serie.data[i].v;
            }
            var area = d3.svg.area().interpolate(getInterpolateType(serie.type))
                             .defined(function (d) { return d.v != null; })
                             .x(function (d) { return serie.xAxis.x(d.dt); })
                             .y0(function (d) { return (serie.type == "area" || serie.type == "areaspline") ? serie.yAxis.group.yCoord : serie.yAxis.y(d.v1); })
                             .y1(function (d) {
                                 return serie.yAxis.y(d.v);
                             });

            if (1 == serie.data.length) {
                var points = [];
                points.push({ dt: serie.data[0].dt, v: serie.data[0].v });
                points.push({ dt: serie.data[0].dt, v: serie.data[0].v });
                serie.data = points;
            }

            var points = [];

            for (var i = 0; i < serie.data.length; i++) {
                points.push({ dt: serie.data[i].dt, v: serie.data[i].v, isNew: serie.data[i].isNew });
            };

            if (serie.isDataChanged) {
                for (var i = 0; i < points.length; i++) {
                    if (points[i].isNew) {
                        points[i].v = points[i - 1].v;
                        points[i].isNew = false;
                        serie.data[i].isNew = false;
                    };
                };
            };

            var g = self.area.selectAll("#serieID" + serie.id)

            if (0 == g[0].length) {
                g = self.area.append("g").attr("id", "serieID" + serie.id)
                                         .attr("average", suma / serie.data.length);
                g.append("path").datum(points)
                    .attr("id", "path-serie-id-" + serie.id)
                    .attr("stroke", "transparent")
                    .attr("class", "area")
                    .attr("d", area)
                    .attr("average", suma / serie.data.length)
                    .attr('stroke-width', "1px")
                    .attr("opacity", serie.strokeDasharray ? "1" : "0.3")
                    .attr("fill", serie.strokeDasharray ? "url(#pattern" + serie.id + ")" : serie.color)
                    .attr("transform", "translate(0,0)");
            };

            var path = d3.selectAll("#path-serie-id-" + serie.id);

            path.datum(points)
                .attr("stroke", "transparent")
                .attr("class", "area")
                .attr("average", suma / serie.data.length)
                .attr('stroke-width', "1px")
                .attr("opacity", serie.strokeDasharray ? "1" : "0.3")
                .attr("fill", serie.strokeDasharray ? "url(#pattern" + serie.id + ")" : serie.color)
                .transition()
                .duration(300)
                .ease("cubic")
                .attr('d', area);

        };

        function drawGroupArea(serie) {
            if (serie.data.length > 1 && serie.colors) {
                var area = d3.svg.area().interpolate(getInterpolateType(serie.type))
                                     .defined(function (d) { return d.v != null; })
                                     .x(function (d) { return serie.xAxis.x(d.dt); })
                                     .y0(function (d) { return serie.yAxis.group.yCoord; })
                                     .y1(function (d) { return serie.yAxis.y(d.v); });
                var line = d3.svg.line()
                                     .defined(function (d) { return d.v != null; })
                                     .x(function (d) { return serie.xAxis.x(d.dt); })
                                     .y(function (d) { return serie.yAxis.y(d.v); }).interpolate(getInterpolateType(serie.type));

                var colors = serie.colors;
                for (var i = 0; i < colors.length; i++) {
                    var clip = self.defs.append("clipPath")
                                        .attr("id", "clip" + serie.id + colors[i].color.replace("#", ""));
                    for (var j = 0; j < colors[i].ranges.length; j++) {
                        var startCoord = serie.xAxis.x(colors[i].ranges[j].startDt);
                        var endCoord = serie.xAxis.x(colors[i].ranges[j].endDt);
                        clip.append("rect")
                            .attr("y", serie.yAxis.group.yCoord - serie.yAxis.group.height)
                            .attr("x", startCoord)
                            .attr("width", endCoord - startCoord)
                            .attr("height", serie.yAxis.group.height);
                    }
                }

                for (var i = 0; i < colors.length; i++) {
                    var id = serie.id + colors[i].color.replace("#", "");
                    var g = self.groupareas.append("g").attr("clip-path", "url(#clip" + id + ")")
                                                            .attr("id", "serieID" + serie.id);

                    g.append("path").datum(serie.data)
                    .attr("stroke", "transparent")
                    .attr("class", "area")
                    .attr("d", area)
                    .attr('stroke-width', "1px")
                    .attr("opacity", serie.strokeDasharray ? "1" : "0.3")
                    .attr("fill", serie.strokeDasharray ? "url(#pattern" + (colors.length > 1 ? (serie.id + colors[i].color.replace("#", "")) : serie.id) + ")" : colors[i].color)
                    .attr("transform", "translate(0,0)");

                    g.append("path").datum(serie.data)
                    .attr("stroke", colors[i].color)
                    .attr("class", "line")
                    .attr("d", line)
                    .attr('stroke-width', "2px")
                    .attr("fill", 'none')
                    .attr("transform", "translate(0,0)");
                }
            }
        }

        self.changeSerieType = function (serieId, newType) {
            var serie = self.getSerieBySourceID(serieId);
            if (serie != null) {

                /// draw to down

                if ("column" == serie.type) {
                    self.columnSerie.drawDown(serie, newType);
                }
                else if ("stackedcolumn" == serie.type) {
                    self.stackedColumnSerie.drawDown(serie, newType);
                }
                else if ("line" == serie.type || "spline" == serie.type) {
                    if (serie.strokeDasharray) {
                        removePattern(serie.id);
                    }
                    drawDown(serie, newType);
                }
                else if ("area" == serie.type || "areaspline" == serie.type || "arearange" == serie.type || "arearangespline" == serie.type) {
                    createPattern(serie);
                    drawDown(serie, newType);
                }

                else if (newType == "points") {
                    drawPoints(serie);
                }
                // else if (newType == "column") {
                //     createPattern(serie);
                //     serie.type = newType;
                //     self.reDraw();
                // }
                // else if (newType == "stackedcolumn") {
                //     createPattern(serie);
                //     serie.type = newType;
                //     self.reDraw();
                // }
            }
        };

        // draw line with new points
        function transformTo(serie, newType) {
            if (undefined == serie || undefined == newType) {
                console.log('Empty serie or newType');
                return;
            };

            var dataPoints = serie.data;
            var path = d3.selectAll('#path-serie-id-' + serie.id);
            var oldType = serie.type;
            var min = d3.min(dataPoints, function (d) { return d.v })
            var points = [];
            for (var j = 0; j < dataPoints.length; j++) {
                points.push({ dt: new Date(dataPoints[j].dt), v: min });
            }

            if ("line" == newType || "spline" == newType) {
                if (serie.strokeDasharray) {
                    removePattern(serie.id);
                }

                serie.type = newType;
                var interpolate = getInterpolateMethodForSerie(serie);
                /// draw line by min value    
                path.datum(points).attr("fill", 'none')
                    .attr("stroke", serie.color)
                    .attr('stroke-width', "2px")
                    .attr("opacity", serie.strokeDasharray ? "1" : "0.3")
                    .attr('d', interpolate);
                /// draw line to real value
                path.datum(serie.data).transition()
                    .duration(300)
                    .attr('d', interpolate);
            }
            else if ("area" == newType || "areaspline" == newType || "arearange" == newType || "arearangespline" == newType) {
                createPattern(serie);
                serie.type = newType;
                var interpolate = getInterpolateMethodForSerie(serie);

                path.datum(points)
                    .attr("stroke", "transparent")
                    .attr("opacity", serie.strokeDasharray ? "1" : "0.3")
                    .attr("fill", serie.strokeDasharray ? "url(#pattern" + serie.id + ")" : serie.color)
                    .attr('d', interpolate)
                    .attr("transform", "translate(0, 0)");

                path.datum(dataPoints)
                    .transition()
                    .duration(300)
                    .attr('d', interpolate)
            }
            else if (newType == "column") {
                createPattern(serie);
                serie.type = newType;
                serie.isTransform = true;
                self.reDrawAxis();
                self.columnSerie.draw();
            }
            else if (newType == "stackedcolumn") {
                createPattern(serie);
                serie.type = newType;
                serie.isTransform = true;
                self.reDrawAxis();
                self.stackedColumnSerie.draw();
            }
        };

        function drawDown(serie, newType) {
            if (undefined == serie || undefined == newType) {
                return;
            };

            if (!("line" == serie.type || "spline" == serie.type || "area" == serie.type ||
                    "areaspline" == serie.type || "arearange" == serie.type || "arearangespline" == serie.type)) {
                return;
            };

            var dataPoints = serie.data;
            var path = d3.selectAll('#path-serie-id-' + serie.id);
            var oldType = serie.type;

            var points = [];

            var min = d3.min(dataPoints, function (d) { return d.v })
            for (var j = 0; j < dataPoints.length; j++) {
                points.push({ dt: new Date(dataPoints[j].dt), v: min });
            }
            var interpolate = getInterpolateMethodForSerie(serie);
            path.datum(points)
                .transition()
                .duration(300)
                .attr('d', interpolate(points))
                .each('end', function () {
                    transformTo(serie, newType);
                })
        };

        self.changeStroke = function (serieId, newStroke) {
            for (var i = 0; i < self.lines.length; i++) {
                if (self.lines[i].sourceId == serieId) {
                    if (self.lines[i].strokeDasharray)
                        removePattern(self.lines[i].id);
                    self.lines[i].strokeDasharray = newStroke;
                    if (newStroke != null)
                        createPattern(self.lines[i]);
                    var type = self.lines[i].type;
                    removeSerieFromChart(self.lines[i].id, type);
                    if (type == "line" || type == "spline")
                        drawLine(self.lines[i]);
                    else if (type == "area" || type == "areaspline" || type == "arearange" || type == "arearangespline")
                        drawArea(self.lines[i]);
                    else if (type == "points")
                        drawPoints(self.lines[i]);
                    break;
                }
            }
        };

        self.changeXAxisVisibility = function (id, visible) {
            var isChange = false;
            for (axis in self.xAxisArr) {
                if (self.xAxisArr[axis].id == id) {
                    self.xAxisArr[axis].visible = visible;
                    isChange = true;
                }
            }
            if (isChange) {
                var i = 0;
                for (axis in self.xAxisArr) {
                    if (self.xAxisArr[axis].visible) {
                        self.xAxisArr[axis].index = i;
                        self.xAxisArr[axis].reDraw();
                        i++;
                    }
                }
            }
        };

        self.setClickSelectedDate = function (date, xAxisId, click) {
            if (self.onclick) {
                var xAxis = null;
                if (xAxisId && self.xAxisArr[xAxisId] != undefined) {
                    xAxis = self.xAxisArr[xAxisId];
                }
                else {
                    for (axis in self.xAxisArr) {
                        if (self.xAxisArr[axis].index == 0) {
                            xAxis = self.xAxisArr[axis];
                            break;
                        }
                    }
                }
                if (xAxis != null) {
                    var coords = { x: xAxis.x(date), y: 0 };
                    var dataByCoord = getDataByCoord(coords, true);
                    if (dataByCoord.data.length > 0) {
                        if (dataByCoord.xCoord != null) {
                            self.clickSelectedValue = dataByCoord.data[0].dt;
                            showClickSelected(dataByCoord.data[0].dt, dataByCoord.xCoord);
                        }
                        if (click)
                            self.onclick(dataByCoord.data);
                    }
                    if (click)
                        self.onclick(null);
                }
            }
        };

        self.setHighlightRegion = function (startDate, endDate, show) {
            if (show) {
                var xAxis = null;
                for (var axis in self.xAxisArr) {
                    xAxis = self.xAxisArr[axis];
                    break;
                }
                if (xAxis != null) {
                    var startCoord = xAxis.x(startDate);
                    var endCoord = xAxis.x(endDate);
                    self.highlightRegion.select("rect")
                        .attr("x", startCoord)
                        .attr("y", 40)
                        .attr("width", endCoord - startCoord)
                        .attr("height", self.height - getBottomPadding() - 40)
                        .style("display", null);
                }
            }
            else {
                self.highlightRegion.select("rect").style("display", "none");
            }
        };

        function getInterpolateType(serieType) {
            switch (serieType) {
                case 'line':
                case 'area':
                case "arearange":
                case "grouparearange":
                    return 'linear';
                case 'spline':
                case 'areaspline':
                case "arearangespline":
                case 'groupareaspline':
                    return 'cardinal';
                default:
                    return 'linear';
            }
        }

        self.removeSerie = function (id) {
            removeSerie(id);
            self.reDraw();
            if (self.lines.length == 0)
                $(self.containerID).hide();
        };

        self.removeSeries = function (seriesID, reDraw) {
            for (var i = 0; i < seriesID.length; i++) {
                removeSerie(seriesID[i]);
            }
            if (seriesID.length > 0 && reDraw)
                self.reDraw();
            else if (self.lines.length == 0)
                $(self.containerID).hide();
        };

        function removeSerie(id) {
            var removeLine = null;
            for (var i = 0; i < self.lines.length; i++) {
                if (self.lines[i].sourceId == id) {
                    removeLine = self.lines[i];
                    removeSerieFromChart(self.lines[i].id, removeLine.type);
                    if (self.lines[i].strokeDasharray)
                        removePattern(self.lines[i].id);
                    self.lines.splice(i, 1);
                    break;
                }
            }
            if (removeLine != null) {
                if (removeLine.yAxis != null) {
                    var containsYAxis = false;
                    for (var i = 0; i < self.lines.length; i++) {
                        if (self.lines[i].yAxis.id == removeLine.yAxis.id) {
                            containsYAxis = true;
                            break;
                        }
                    }
                    if (!containsYAxis)
                        removeLine.yAxis.destroy();
                    //else
                    //    removeLine.yAxis.reDraw();
                }
                if (removeLine.xAxis != null) {
                    var containsXAxis = false;
                    for (var i = 0; i < self.lines.length; i++) {
                        if (self.lines[i].xAxis.id == removeLine.xAxis.id) {
                            containsXAxis = true;
                            break;
                        }
                    }
                    if (!containsXAxis)
                        removeLine.xAxis.destroy();
                    //else
                    //    removeLine.xAxis.reDraw();
                }
                if (removeLine.group != null) {
                    var contaionsGroup = false;
                    for (var i = 0; i < self.lines.length; i++) {
                        if (self.lines[i].group == removeLine.group) {
                            contaionsGroup = true;
                            break;
                        }
                    }
                    if (!contaionsGroup)
                        removeLine.group.destroy();
                }
            }
        };

        function removeSerieFromChart(serieId, type) {
            if (type == "line" || type == "spline" || type == "area" || type == "areaspline" || type == "points" || type == "grouparea" || type == "groupareaspline") {
                removeLineAreaFromChart(serieId, type);
            }
            else if (type == "column") {
                self.columnSerie.draw();
            }
            else if (type == "stackedcolumn") {
                self.stackedColumnSerie.draw();
            }
        };

        function removeLineAreaFromChart(id, type) {
            var serieClass = null;
            if (type == "line" || type == "spline") {
                serieClass = ".line";
            }
            else if (type == "area" || type == "areaspline") {
                //serieClass = ".area";
                serieClass = "";
            }
            else if (type == "points") {
                serieClass = ".point";
            }
            else if (type == "grouparea" || type == "groupareaspline") {
                serieClass = "";
                self.defs.selectAll('[id^=clip' + id + ']').remove();
            }
            self.svg.selectAll("#serieID" + id + serieClass).remove();
            self.svg.selectAll("#serieID" + id + ".linePoint").remove();
        };

        self.clearAll = function () {
            if (self.svg != null) {
                self.grid.selectAll("*").remove();
                self.area.selectAll("*").remove();
                self.columnSerie.g.selectAll("*").remove();
                self.stackedColumnSerie.g.selectAll("*").remove();
                self.lineSeries.selectAll("*").remove();
                self.points.selectAll("*").remove();
                self.axes.selectAll("*").remove();
                self.svg.selectAll(".group-lable").remove();
                self.lines = [];
                self.yAxisArr = [];
                self.xAxisArr = [];
                self.groups = [];
            }
        };

        self.destroy = function () {
            $(self.containerID).children().remove();
            $(self.containerID).show();
            if (self.tooltip)
                self.tooltip.hide();
            self.lines = [];
            self.yAxisArr = [];
            self.xAxisArr = [];
            self.groups = [];
            self.svg = null;
        };

        /* Axis start  */

        function XAxis(chart, id) {
            var self = this;
            self.id = id;
            self.chart = chart;
            self.visible = true;
            self.format = "%e %b";

            self.min = 0;
            self.max = 0;

            self.orient = "bottom";
            self.index = 0;
            self.x = null;
            self.xAxis = null;

            self.axis = null;

            self.refreshMinMax = function () {
                var allData = [];
                for (var i = 0; i < self.chart.lines.length; i++) {
                    if (self.chart.lines[i].xAxis.id == self.id) {
                        for (var j = 0; j < self.chart.lines[i].data.length; j++) {
                            allData.push(self.chart.lines[i].data[j]);
                        }
                    }
                }
                if (allData.length > 0) {
                    var containsColumn = false;
                    for (var i = 0; i < self.chart.lines.length; i++) {
                        if (self.chart.lines[i].type == "column" || self.chart.lines[i].type == "stackedcolumn") {
                            containsColumn = true;
                            break;
                        }
                    }
                    var xtend = d3.extent(allData, function (d) {
                        return d.dt;
                    });
                    if (containsColumn) {
                        self.min = new Date(xtend[0].valueOf() - self.chart.dateStep / 2);
                        self.max = new Date(xtend[1].valueOf() + self.chart.dateStep / 2);
                    }
                    else {
                        self.min = xtend[0];
                        self.max = xtend[1];
                    }
                    if (self.max.valueOf() == self.min.valueOf()) {
                        self.min = new Date(xtend[0].valueOf() - self.chart.dateStep / 2);
                        self.max = new Date(xtend[1].valueOf() + self.chart.dateStep / 2);
                    }
                }
            };

            self.draw = function () {
                self.x = d3.time.scale().range([0, self.chart.width]);//.domain([self.min, self.max]);
                var date_format = d3.time.format(self.format);
                self.xAxis = d3.svg.axis()
                               .scale(self.x)
                                .orient("bottom").tickFormat(date_format).ticks(getTicksCount());
                self.axis = self.chart.axes.append("g")
                                .attr("id", "axis" + id)
                                .attr("class", "x axis")
                                .attr("transform", "translate(0, " + (self.chart.height - 20 * (self.index + 1)) + ")")
                                .style("fill", "#7488A1")
                                .style("opacity", self.visible ? 1 : 0)
                                .call(self.xAxis);
            };

            self.reDraw = function () {
                var ticksCount = getTicksCount();
                self.refreshMinMax();
                self.x.range([0, self.chart.width]).domain([self.min, self.max]);
                self.xAxis.orient(self.orient).ticks(ticksCount);
                var bottomPadding = getBottomPadding();
                self.axis.transition().duration(0).ease("sin-in-out")
                    .attr("transform", "translate(0, " + (self.chart.height - bottomPadding + 20 * (self.index)) + ")")
                    .style("opacity", self.visible ? 1 : 0)
                    .call(self.xAxis);

                self.axis.selectAll("path, line").style("display", self.index == 0 ? null : "none");

                self.chart.grid.selectAll("#grid" + self.id).remove();
                if (self.index == 0) {
                    for (gr in self.chart.groups) {
                        var group = self.chart.groups[gr];
                        self.chart.grid.append("g")
                                  .attr("id", "grid" + self.id)
                                  .attr("class", "grid")
                                  .attr("transform", "translate(0," + (self.chart.height - group.height * group.index - bottomPadding) + ")")
                                  .call(make_x_axis(ticksCount)
                                      .tickSize(-group.height + group.labelHeight, 0, 0)
                    .tickFormat(""));
                        setGridStyles("#grid" + self.id);
                    }
                }

                setAxisStyles(self.axis);
            };

            self.destroy = function () {
                var isDeleted = false;
                for (var el in self.chart.xAxisArr) {
                    if (!isDeleted && self.chart.xAxisArr[el].id == self.id) {
                        isDeleted = true;
                        delete self.chart.xAxisArr[el];
                    }
                    else if (isDeleted) {
                        self.chart.xAxisArr[el].index--;
                    }
                }
                for (var el in self.chart.xAxisArr) {
                    self.chart.xAxisArr[el].reDraw();
                }

                self.chart.grid.selectAll("#grid" + self.id).remove();
                self.chart.axes.selectAll("#axis" + self.id + ".x.axis").remove();
            }

            function make_x_axis(ticksCount) {
                return d3.svg.axis()
                    .scale(self.x)
                     .orient("bottom")
                 .ticks(ticksCount)
            };

            function getTicksCount() {
                var stepCount = 1;
                var count = parseInt(self.chart.width / 170);
                if (self.chart.dateRange != 0)
                    stepCount = parseInt(self.chart.dateRange / self.chart.dateStep);
                return stepCount <= count ? stepCount : count;
            };

        };

        function YAxis(chart, id, unit, group) {
            var self = this;
            self.id = id;
            self.elemId = getRandomIndex();
            self.unit = unit;
            self.chart = chart;
            self.group = group;

            self.min = 0;
            self.max = 0;

            self.orient = "right";
            self.index = 0;
            self.y = null;
            self.yAxis = null;

            self.axis = null;

            self.refreshMinMax = function () {
                var allData = [];
                for (var i = 0; i < self.chart.lines.length; i++) {
                    for (var j = 0; j < self.chart.lines[i].data.length; j++) {
                        if (self.chart.lines[i].yAxis.id == self.id)
                            allData.push(self.chart.lines[i].data[j]);
                    }
                }

                self.min = d3.min(allData, function (d) {
                    return d.v;
                });
                self.max = d3.max(allData, function (d) {
                    return d.v;
                });
                if (self.max - self.min < 0.1) {
                    self.min = self.max - 0.1;
                }
                var maxStackedColumn = self.chart.stackedColumnSerie.max(self.group.id, self.id);
                if (self.max < maxStackedColumn)
                    self.max = maxStackedColumn;
            };

            self.draw = function () {
                self.y = d3.scale.linear().range([self.chart.height - 20, 0]).domain([self.min, self.max]);
                self.yAxis = d3.svg.axis().scale(self.y).tickFormat(yFormat).orient(self.orient).ticks(5);
                self.axis = self.chart.axes.append("g")
                                   .attr("id", "axis" + self.elemId)
                                   .attr("class", "y axis")
                                   .attr("transform", "translate(" + getTransformX() + " ,0)")
                                   .style("fill", "#7488A1")
                                   .call(self.yAxis);
            };

            self.reDraw = function () {
                self.refreshMinMax();
                var deviation = 0;
                var isColumnType = false;
                for (var i = 0; i < self.chart.lines.length; i++) {
                    if (self.chart.lines[i].yAxis.id == self.id && (self.chart.lines[i].type == "column" || self.chart.lines[i].type == "stackedcolumn")) {
                        isColumnType = true;
                        break;
                    }
                }
                if (!isColumnType) {
                    deviation = (self.max - self.min) * 0.1;
                    if (deviation == 0)
                        deviation = 1;
                }
                self.group.refresh();
                var fromCoord = self.group.yCoord;
                self.y.range([fromCoord, fromCoord - self.group.height + self.group.labelHeight]);
                self.y.domain([self.min - deviation, self.max + deviation]);
                self.yAxis.orient(self.orient).ticks(5);

                self.axis.transition().duration(0).ease("sin-in-out")
                    .attr("transform", "translate(" + getTransformX() + " ,0)")
                    .call(self.yAxis);

                self.chart.grid.selectAll("#grid" + self.elemId).remove();
                if (self.index == 0 && self.orient == "right") {
                    self.chart.grid.append("g")
                            .attr("id", "grid" + self.elemId)
                            .attr("class", "grid")
                            .call(make_y_axis()
                                .tickSize(-self.chart.width, 0, 0)
                                .tickFormat("")
                            );
                    setGridStyles("#grid" + self.elemId);
                }

                setAxisStyles(self.axis);
            };

            self.destroy = function () {
                for (var el in self.chart.yAxisArr) {
                    if (self.chart.yAxisArr[el].id == self.id) {
                        delete self.chart.yAxisArr[el];
                    }
                }
                //var index = 1;
                var indexDictionary = {
                };
                for (var el in self.chart.yAxisArr) {
                    if (indexDictionary[self.chart.yAxisArr[el].group.id] == undefined) {
                        indexDictionary[self.chart.yAxisArr[el].group.id] = 1;
                    }
                    var index = indexDictionary[self.chart.yAxisArr[el].group.id];
                    self.chart.yAxisArr[el].orient = index % 2 != 0 ? "right" : "left";
                    if (self.chart.yAxisArr[el].orient == "right") {
                        self.chart.yAxisArr[el].index = parseInt(index / 2);
                    }
                    else {
                        self.chart.yAxisArr[el].index = index / 2 - 1;
                    }
                    self.chart.yAxisArr[el].reDraw();
                    index++;
                    indexDictionary[self.chart.yAxisArr[el].group.id] = index;
                }

                self.chart.grid.selectAll("#grid" + self.elemId).remove();
                self.chart.axes.selectAll("#axis" + self.elemId + ".y.axis").remove();
            };

            function make_y_axis() {
                return d3.svg.axis()
                    .scale(self.y)
                    .orient("left")
                    .ticks(5)
            }

            function getTransformX() {
                var transX = 0;
                if (self.orient == "right") {
                    transX = 80 * self.index;
                }
                else {
                    transX = self.chart.width - 2 - 80 * self.index;
                }
                return transX;
            };

            function yFormat(d) {
                return abbrNum(d, 2) + " " + self.unit;
            };

            function abbrNum(number, decPlaces) {
                var decimalPointIndex = (number + '').indexOf('.');
                if (decimalPointIndex > -1 && self.max - self.min > 0.01) {
                    var dec = (number + '').length - decimalPointIndex - 1;
                    if (dec > 2) {
                        dec = 2;
                    }
                    number = number_format(number, dec, '.') / 1;
                }

                var negative = false;
                if (number < 0) {
                    negative = true;
                    number = -number;
                }

                var orig = number;
                var dec = decPlaces;
                // 2 decimal places => 100, 3 => 1000, etc
                decPlaces = Math.pow(10, decPlaces);

                // Enumerate number abbreviations
                var abbrev = ["k", "m", "b", "t"];

                // Go through the array backwards, so we do the largest first
                for (var i = abbrev.length - 1; i >= 0; i--) {

                    // Convert array index to "1000", "1000000", etc
                    var size = Math.pow(10, (i + 1) * 3);

                    // If the number is bigger or equal do the abbreviation
                    if (size <= number) {
                        // Here, we multiply by decPlaces, round, and then divide by decPlaces.
                        // This gives us nice rounding to a particular decimal place.
                        var number = Math.round(number * decPlaces / size) / decPlaces;

                        // Handle special case where we round up to the next abbreviation
                        if ((number == 1000) && (i < abbrev.length - 1)) {
                            number = 1;
                            i++;
                        }

                        // console.log(number);
                        // Add the letter for the abbreviation
                        number += abbrev[i];

                        // We are done... stop
                        break;
                    }
                }
                if (negative)
                    number = "-" + number;

                return number;
            }
        };

        function createDefaultXAxis() {
            var newXAxis = new XAxis(self, "default", "");
            if (self.defaultXFormat != null)
                newXAxis.format = self.defaultXFormat;
            var axisSize = 0;
            for (var i in self.xAxisArr) {
                if (self.xAxisArr[i].visible)
                    axisSize++;
            }
            newXAxis.index = axisSize;
            newXAxis.orient == "bottom"
            newXAxis.draw();
            self.xAxisArr[newXAxis.id] = newXAxis;
        };

        function setAxisStyles(axis) {
            axis.selectAll("path, line")
                .attr("fill", "none")
                .attr("stroke", "#C6CDD5")
                .attr("shape-rendering", "crispEdges")
                .attr("font-size", "11px");
        };

        function setGridStyles(id) {
            self.svg.selectAll(id + " .tick")
                .attr("stroke", "lightgrey")
                .attr("opacity", "0.7");
        };

        /* Axis end  */
        function ColumnSerie(parent) {
            var self = this;
            self.parent = parent;
            self.g = null;
            self.series = [];

            self.draw = function () {
                self.series = [];
                // if (self.g)
                //     self.g.selectAll("rect").remove();
                var groupSeries = [];

                for (var i = 0; i < self.parent.lines.length; i++) {
                    if (self.parent.lines[i].type == "column") {
                        if (groupSeries[self.parent.lines[i].group.id] == undefined)
                            groupSeries[self.parent.lines[i].group.id] = [];
                        groupSeries[self.parent.lines[i].group.id].push(self.parent.lines[i]);
                    }
                }
                var groupSeriesLength = 0;
                for (var i in groupSeries) groupSeriesLength++;
                if (groupSeriesLength == 0)
                    return;
                self.parent.refreshMinMax();

                var oneValWidth = self.parent.getValWidth();
                oneValWidth -= oneValWidth / 8;
                for (var gr in groupSeries) {
                    var columnSeries = groupSeries[gr];
                    var oneColumnWidth = oneValWidth / columnSeries.length;
                    for (var i = 0; i < columnSeries.length; i++) {
                        var d = "";
                        columnSeries[i].oneColumnWidth = oneColumnWidth;
                        columnSeries[i].columnNumber = i;

                        if (columnSeries[i].isTransform) {
                            for (var j = 0; j < columnSeries[i].data.length; j++) {
                                var columnCenter = columnSeries[i].xAxis.x(new Date(columnSeries[i].data[j].dt));
                                var xCoord = columnCenter - oneValWidth / 2;
                                var yCoord = columnSeries[i].yAxis.y(columnSeries[i].data[j].v);
                                var curHeight = columnSeries[i].yAxis.group.yCoord - yCoord;
                                if (curHeight < 1) {
                                    curHeight = 2;
                                    yCoord -= curHeight;
                                }

                                d += "M" + (xCoord + oneColumnWidth * i + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                                    "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                                    "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                            }

                            var path = d3.selectAll("#path-serie-id-" + columnSeries[i].id);

                            path.attr('d', d);
                            columnSeries[i].isTransform = false;
                            // continue;
                        };


                        for (var j = 0; j < columnSeries[i].data.length; j++) {
                            var columnCenter = columnSeries[i].xAxis.x(new Date(columnSeries[i].data[j].dt));
                            var xCoord = columnCenter - oneValWidth / 2;
                            var yCoord = columnSeries[i].yAxis.y(columnSeries[i].data[j].v);
                            var curHeight = columnSeries[i].yAxis.group.yCoord - yCoord;
                            if (curHeight < 1) {
                                curHeight = 2;
                                yCoord -= curHeight;
                            }

                            if (columnSeries[i].data[j].isNew) {
                                d += "M" + (xCoord + oneColumnWidth * i + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                                "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                                    "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                                columnSeries[i].data[j].isNew = false;
                            }
                            else {
                                d += "M" + (xCoord + oneColumnWidth * i + oneColumnWidth / 8) + "," + yCoord +
                                    "h" + (oneColumnWidth - oneColumnWidth / 4) + "v" + curHeight +
                                    "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                            }
                        }

                        var path = d3.selectAll("#path-serie-id-" + columnSeries[i].id);

                        if (0 == path[0].length) {
                            path = self.g.append("path")
                                .attr("id", "path-serie-id-" + columnSeries[i].id)
                                .attr("stroke", "none")
                                .attr("fill", columnSeries[i].strokeDasharray ? "url(#pattern" + columnSeries[i].id + ")" : columnSeries[i].color)
                                .style("opacity", .6)
                                .attr("d", d);
                        }

                        path.attr("stroke", "none")
                            .attr("fill", columnSeries[i].strokeDasharray ? "url(#pattern" + columnSeries[i].id + ")" : columnSeries[i].color)
                            .style("opacity", .6)
                            .transition()
                            .duration(300)
                            .delay(300)
                            .attr('d', d);
                    }
                }
            };


            self.drawDown = function (serie, newType) {
                if ("column" != serie.type) {
                    return;
                };

                if (undefined == newType) { var newType = 'spline' };

                var oneValWidth = self.parent.getValWidth();
                oneValWidth -= oneValWidth / 8;

                var oneColumnWidth = serie.oneColumnWidth;
                var columnNumber = serie.columnNumber;

                var d = "";

                for (var j = 0; j < serie.data.length; j++) {
                    var columnCenter = serie.xAxis.x(new Date(serie.data[j].dt));
                    var xCoord = columnCenter - oneValWidth / 2;
                    var yCoord = serie.yAxis.y(serie.data[j].v);
                    var curHeight = serie.yAxis.group.yCoord - yCoord;
                    if (curHeight < 1) {
                        curHeight = 2;
                        yCoord -= curHeight;
                    }

                    d += "M" + (xCoord + oneColumnWidth * columnNumber + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                        "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                        "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                }

                var path = d3.selectAll("#path-serie-id-" + serie.id);

                path.transition()
                    .duration(300)
                    .attr('d', d)
                    .each('end', function () {
                        serie.type = newType;
                        self.parent.reDraw();
                        transformTo(serie, newType);
                    });
            };
        };


        function StackedColumnSerie(parent) {
            var self = this;
            self.parent = parent;
            self.g = null;
            self.series = {};
            self.min = 0;
            self.max = function (groupId, yAxisId) {
                var maxStacked = 0;
                var columnSeries = [];
                for (var i = 0; i < self.parent.lines.length; i++) {
                    if (self.parent.lines[i].type == "stackedcolumn" && self.parent.lines[i].group.id == groupId && self.parent.lines[i].yAxis.id == yAxisId) {
                        if (columnSeries[self.parent.lines[i].group.id] == undefined)
                            columnSeries[self.parent.lines[i].group.id] = [];
                        if (columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack] == undefined)
                            columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack] = [];
                        columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack].push(self.parent.lines[i]);
                    }
                }
                var columnSeriesLength = 0;
                for (var i in columnSeries) columnSeriesLength++;
                if (columnSeriesLength == 0)
                    return maxStacked;
                self.parent.refreshMinMax();
                var oneValWidth = self.parent.getValWidth();
                oneValWidth -= oneValWidth / 8;
                for (var gr in columnSeries) {
                    var stackLength = 0;
                    for (var i in columnSeries[gr]) stackLength++;
                    var stackIndex = 0;
                    for (var st in columnSeries[gr]) {
                        var series = columnSeries[gr][st];
                        var oneColumnWidth = oneValWidth / stackLength; /// series.length;
                        var columnHeights = [];
                        for (var i = 0; i < series.length; i++) {
                            for (var j = 0; j < series[i].data.length; j++) {
                                var columnCenter = series[i].xAxis.x(new Date(series[i].data[j].dt));
                                var xCoord = columnCenter - oneValWidth / 2;
                                if (columnHeights[xCoord + series[i].xAxis.id] == undefined)
                                    columnHeights[xCoord + series[i].xAxis.id] = 0;
                                var yCoord = series[i].yAxis.y(series[i].data[j].v);
                                columnHeights[xCoord + series[i].xAxis.id] += series[i].data[j].v;
                            }
                        }
                        for (var h in columnHeights) {
                            if (columnHeights[h] > maxStacked)
                                maxStacked = columnHeights[h];
                        }
                    }
                }
                return maxStacked;
            };

            self.draw = function () {
                if (self.g)
                    self.g.selectAll("rect").remove();
                var columnSeries = [];
                for (var i = 0; i < self.parent.lines.length; i++) {
                    if (self.parent.lines[i].type == "stackedcolumn") {
                        if (columnSeries[self.parent.lines[i].group.id] == undefined)
                            columnSeries[self.parent.lines[i].group.id] = [];
                        if (columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack] == undefined)
                            columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack] = [];
                        columnSeries[self.parent.lines[i].group.id][self.parent.lines[i].stack].push(self.parent.lines[i]);
                    }
                }
                var columnSeriesLength = 0;
                for (var i in columnSeries) columnSeriesLength++;
                if (columnSeriesLength == 0)
                    return;
                self.parent.refreshMinMax();
                var oneValWidth = self.parent.getValWidth();
                oneValWidth -= oneValWidth / 8;
                for (var gr in columnSeries) {
                    var stackLength = 0;
                    for (var i in columnSeries[gr]) stackLength++;
                    var stackIndex = 0;
                    for (var st in columnSeries[gr]) {
                        var series = columnSeries[gr][st];
                        var oneColumnWidth = oneValWidth / stackLength; /// series.length;
                        var columnValues = [];
                        for (var i = 0; i < series.length; i++) {
                            series[i].stackIndex = stackIndex;
                            var d = "";

                            /// draw zero height columns
                            if (series[i].isTransform) {
                                for (var j = 0; j < series[i].data.length; j++) {

                                    var columnCenter = series[i].xAxis.x(new Date(series[i].data[j].dt));
                                    var xCoord = columnCenter - oneValWidth / 2;
                                    if (columnValues[xCoord + series[i].xAxis.id] == undefined) {
                                        columnValues[xCoord + series[i].xAxis.id] = 0;
                                    }
                                    var yCoord = series[i].yAxis.y(series[i].data[j].v + columnValues[xCoord + series[i].xAxis.id]);
                                    var prevVal = columnValues[xCoord + series[i].xAxis.id];
                                    if (prevVal == 0)
                                        prevVal = series[i].yAxis.y.domain()[0];
                                    var curHeight = series[i].yAxis.y(prevVal) - yCoord;

                                    d += "M" + (xCoord + oneColumnWidth * stackIndex + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                                        "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                                        "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                                }

                                var path = d3.selectAll("#path-serie-id-" + series[i].id);
                                path.attr('d', d);
                                series[i].isTransform = false;
                                // continue;
                            };

                            for (var j = 0; j < series[i].data.length; j++) {
                                var columnCenter = series[i].xAxis.x(new Date(series[i].data[j].dt));
                                var xCoord = columnCenter - oneValWidth / 2;
                                if (columnValues[xCoord + series[i].xAxis.id] == undefined) {
                                    columnValues[xCoord + series[i].xAxis.id] = 0;
                                }
                                var yCoord = series[i].yAxis.y(series[i].data[j].v + columnValues[xCoord + series[i].xAxis.id]);
                                var prevVal = columnValues[xCoord + series[i].xAxis.id];
                                if (prevVal == 0)
                                    prevVal = series[i].yAxis.y.domain()[0];
                                var curHeight = series[i].yAxis.y(prevVal) - yCoord;

                                if (series[i].data[j].isNew) {
                                    d += "M" + (xCoord + oneColumnWidth * stackIndex + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                                        "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                                        "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                                    series[i].data[j].isNew = false;
                                }
                                else {
                                    d += "M" + (xCoord + oneColumnWidth * stackIndex + oneColumnWidth / 8) + "," + yCoord +
                                        "h" + (oneColumnWidth - oneColumnWidth / 4) + "v" + curHeight +
                                        "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";
                                }

                                columnValues[xCoord + series[i].xAxis.id] += series[i].data[j].v;
                            }

                            var path = d3.selectAll("#path-serie-id-" + series[i].id);

                            if (0 == path[0].length) {
                                path = self.g.append("path")
                                    .attr("id", "path-serie-id-" + series[i].id)
                                    .attr("stroke", "none")
                                    .attr("fill", series[i].strokeDasharray ? "url(#pattern" + series[i].id + ")" : series[i].color)
                                    .style("opacity", .6)
                                    .attr("d", d);
                            }

                            path.attr("stroke", "none")
                                .attr("fill", series[i].strokeDasharray ? "url(#pattern" + series[i].id + ")" : series[i].color)
                                .style("opacity", .6)
                                .transition()
                                .duration(300)
                                .delay(300)
                                .attr('d', d);

                        }
                        stackIndex++;
                    }
                }
            };

            self.drawDown = function (serie, newType) {
                if ("stackedcolumn" != serie.type) {
                    return;
                };
                if (undefined == newType) { var newType = 'spline' };

                var oneValWidth = self.parent.getValWidth();
                oneValWidth -= oneValWidth / 8;

                var oneColumnWidth = serie.oneColumnWidth;
                var stackIndex = serie.stackIndex;

                var columnValues = [];
                var d = "";
                for (var j = 0; j < serie.data.length; j++) {
                    var columnCenter = serie.xAxis.x(new Date(serie.data[j].dt));
                    var xCoord = columnCenter - oneValWidth / 2;
                    if (columnValues[xCoord + serie.xAxis.id] == undefined) {
                        columnValues[xCoord + serie.xAxis.id] = 0;
                    }
                    var yCoord = serie.yAxis.y(serie.data[j].v + columnValues[xCoord + serie.xAxis.id]);
                    var prevVal = columnValues[xCoord + serie.xAxis.id];
                    if (prevVal == 0)
                        prevVal = serie.yAxis.y.domain()[0];
                    var curHeight = serie.yAxis.y(prevVal) - yCoord;


                    d += "M" + (xCoord + oneColumnWidth * stackIndex + oneColumnWidth / 8) + "," + (yCoord + curHeight) +
                        "h" + (oneColumnWidth - oneColumnWidth / 4) + "v0" +
                        "h-" + (oneColumnWidth - oneColumnWidth / 4) + "z ";

                    columnValues[xCoord + serie.xAxis.id] += serie.data[j].v;
                }

                var path = d3.selectAll("#path-serie-id-" + serie.id);

                path.transition()
                    .duration(300)
                    .attr('d', d)
                    .each('end', function () {
                        serie.type = newType;
                        self.parent.reDraw();
                        transformTo(serie, newType);
                    });
            };
        };

        function Group(chart, id, name) {
            var self = this;
            self.id = id;
            self.elemId = "group" + getRandomIndex();
            self.chart = chart;
            self.name = name;
            self.index = 0;
            self.height = self.chart.groupHeight;
            self.chart.height += self.height;
            self.yCoord = 0;
            self.labelHeight = 20;
            self.label = self.chart.svg.append("text")
                             .attr("id", self.elemId)
                             .attr("class", "group-lable")
                             .attr("x", 9)
                             .attr("dy", ".35em");
            self.chart.refreshSize();

            self.refresh = function () {
                if (self.chart.exploded) {
                    var groupsSize = 0;
                    for (i in self.chart.groups) groupsSize++;
                    var newHeight = 0;
                    if (groupsSize > 1) {
                        self.labelHeight = 50;
                        newHeight = self.chart.explodeGroupHeight;
                    }
                    else if (groupsSize == 1 && self.chart.groups["default"] == undefined) {
                        self.labelHeight = 50;
                        newHeight = self.chart.groupHeight;
                    }
                    else {
                        self.labelHeight = 20;
                        newHeight = self.chart.groupHeight;
                    }
                    //if (newHeight != self.height) {
                    self.chart.height -= self.height;
                    self.height = newHeight;
                    self.chart.height += self.height;
                    self.chart.refreshSize();
                    //}
                }
                self.yCoord = self.chart.height - getBottomPadding() - self.index * self.height;
                self.label.attr("transform", "translate(-10," + (self.yCoord - self.height + self.labelHeight - 20) + ")").text(self.name);
            };

            self.destroy = function () {
                var isDeleted = false;
                for (var el in self.chart.groups) {
                    if (!isDeleted && self.chart.groups[el].id == self.id) {
                        delete self.chart.groups[el];
                        self.chart.height -= self.height;
                        self.chart.refreshSize();
                        isDeleted = true;
                    }
                    else if (isDeleted) {
                        self.chart.groups[el].index--;
                    }
                }
                self.chart.svg.selectAll("#" + self.elemId).remove();
                for (var el in self.chart.groups) {
                    self.chart.groups[el].refresh();
                }
            };
        };

        function createDefaultGroup() {
            var group = new Group(self, "default", self.defultGroupName);
            var groupsSize = 0;
            for (var i in self.groups) groupsSize++;
            group.index = groupsSize;
            self.groups[group.id] = group;
            for (var el in self.groups)
                self.groups[el].refresh();

        };

        function showClickSelected(date, xCoord) {
            var text = (date).format(self.hoverDateFormat);
            var positionText = getTextAnchorForHover(xCoord, text.length);
            self.clickSelected.selectAll("text").attr("text-anchor", positionText).text(text);

            var idChartContainer = self.containerID.replace('#', '');
            var widthText = getD3TextInputWidth(idChartContainer + ' .clickSelectedTooltipText') + 20;

            if (positionText == 'middle') {
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line1').attr('x1', widthText / -2).attr('y1', 0).attr('x2', widthText / -2).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line2').attr('x1', widthText / -2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line3').attr('x1', widthText / 2).attr('y1', -5).attr('x2', widthText / 2).attr('y2', 0);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line4').attr('x1', widthText / -2).attr('y1', 10).attr('x2', widthText / -2).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line5').attr('x1', widthText / -2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line6').attr('x1', widthText / 2).attr('y1', 15).attr('x2', widthText / 2).attr('y2', 10);
            }
            else if (positionText == 'start') {
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line1').attr('x1', -10).attr('y1', 0).attr('x2', -10).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line2').attr('x1', -10).attr('y1', -5).attr('x2', widthText - 10).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line3').attr('x1', widthText - 10).attr('y1', -5).attr('x2', widthText - 10).attr('y2', 0);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line4').attr('x1', -10).attr('y1', 10).attr('x2', -10).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line5').attr('x1', -10).attr('y1', 15).attr('x2', widthText - 10).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line6').attr('x1', widthText - 10).attr('y1', 15).attr('x2', widthText - 10).attr('y2', 10);
            }
            else if (positionText == 'end') {
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line1').attr('x1', 10 - widthText).attr('y1', 0).attr('x2', 10 - widthText).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line2').attr('x1', 10 - widthText).attr('y1', -5).attr('x2', 10).attr('y2', -5);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line3').attr('x1', 10).attr('y1', -5).attr('x2', 10).attr('y2', 10);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line4').attr('x1', 10 - widthText).attr('y1', 10).attr('x2', 10 - widthText).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line5').attr('x1', 10 - widthText).attr('y1', 15).attr('x2', 10).attr('y2', 15);
                self.clickSelected.select(self.containerID + ' .tooltipFrameClickSelected.line6').attr('x1', 10).attr('y1', 15).attr('x2', 10).attr('y2', 10);
            }

            self.clickSelected.selectAll("#verticalRectToolTipClickSelected").attr("height", self.height - getBottomPadding());
            self.clickSelected.selectAll("#verticalLineToolTipClickSelected").attr("y2", self.height - getBottomPadding());
            self.clickSelected.attr("transform", "translate(" + xCoord + ", 0)");
            self.clickSelected.style("display", null);
        };

        function getTextAnchorForHover(xCoord, textLength) {
            var textAnchor = "middle";
            textLength *= 7 / 2;//7 - chart length
            if (xCoord < textLength)
                textAnchor = "start";
            else if (xCoord > self.width - textLength)
                textAnchor = "end";
            return textAnchor;
        };

        function Tooltip(id) {
            var self = this;
            self.id = "#" + id;
            self.tooltip = $(self.id);
            self.mouseover = null;
            self.mousemove = null;
            self.mouseout = null;
            self.tooltip.mouseover(
                function (e, t) {
                    self.mouseover();
                    if (self.mousemove)
                        self.mousemove({
                            x: e.clientX, y: e.clientY
                        });
                });
            self.tooltip.mouseleave(
            function () {
                self.hide();
                if (self.mouseout)
                    self.mouseout();
            });

            self.renderHTML = function (data, dateFormat) {
                var itemTemplate = $(self.id + '-item').html();//<div style="width:100%; height:1px; background-color:#57666C;"></div>
                var items = "";
                for (var dt in data) {
                    var dateItems = data[dt];
                    var dateText = /*(new Date(*/dt/*)).format(dateFormat)*/;
                    items += itemTemplate.format(dateText, "", "#fff", "title");
                    for (var i = 0; i < dateItems.length; i++) {
                        var numbersAfterPoint = 2;
                        if (dateItems[i].v > -1 && dateItems[i].v < 1) {
                            var valueStr = parseInt(dateItems[i].v * 1000).toString();
                            if (valueStr.lastIndexOf('0') != valueStr.length - 1)
                                numbersAfterPoint = 3;
                        }
                        items += itemTemplate.format(dateItems[i].name + ":", number_format(dateItems[i].v, numbersAfterPoint, '.', ',')/*addCommas(dateItems[i].v)*/ + " " + dateItems[i].unit, dateItems[i].color, "");
                        //if (i < dateItems.length - 1)
                        //    items += "<div style='width:100%; height:1px; background-color:#57666C;'></div>";
                    }
                }
                var html = $('<ul />');
                html.append(items);
                return html;
            };

            self.show = function (x, y, data, dateFormat, orient, groupHeight) {
                var count = 0;
                for (var item in data)
                    count++;
                if (count == 1 && y < 70)
                    y = 70;
                var html = '';
                var index = count - 1;
                var tempArr = []
                self.tooltip.html('');
                self.tooltip.show();
                for (var item in data) {
                    var elem = self.renderHTML(data[item]);
                    var div = $('<div />');
                    div.append(elem[0].outerHTML);
                    div[0].className = "site-analysis-tooltip";
                    self.tooltip.append(div[0].outerHTML);
                    var width = $(self.id + '>div:last-child').width();
                    if (orient == "left") {
                        $(self.id + '>div:last-child').attr("style", "top:" + (y + index * groupHeight) + "px;left:" + parseInt(x - width - 5) + "px");
                    }
                    else {
                        $(self.id + '>div:last-child').attr("style", "top:" + (y + index * groupHeight) + "px;left:" + (x + 29) + "px");
                    }
                    index--;
                }
                $(self.id + '>div').mouseover(function (e, t) {
                    self.mouseover();
                    if (self.mousemove)
                        self.mousemove({
                            x: e.clientX, y: e.clientY
                        });
                });
                $(self.id + '>div').mouseleave(
                    function () {
                        self.hide();
                        if (self.mouseout)
                            self.mouseout();
                    });
            };

            self.hide = function () {
                self.tooltip.hide();
            };

            String.prototype.format = function () {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                      ? args[number]
                  : match
                    ;
                });
            };

            function addCommas(nStr) {
                nStr += '';
                x = nStr.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? '.' + x[1] : '';
                var rgx = /(\d+)(\d{3})/;
                while (rgx.test(x1)) {
                    x1 = x1.replace(rgx, '$1' + ',' + '$2');
                }
                return x1 + x2;
            }
        };

        function createPattern(serie) {
            if (serie.strokeDasharray) {
                var colors = [];
                if (serie.colors && serie.colors.length > 0 && (serie.type == "grouparea" || serie.type == "groupareaspline")) {
                    for (var i = 0; i < serie.colors.length; i++) {
                        colors.push(serie.colors[i].color);
                    }
                }
                else if (serie.color) {
                    colors.push(serie.color)
                }
                for (var i = 0; i < colors.length; i++) {
                    var pattern = self.defs.append('pattern')
                                          .attr('id', 'pattern' + (colors.length > 1 ? (serie.id + colors[i].replace("#", "")) : serie.id))
                                          .attr('patternUnits', 'userSpaceOnUse')
                                          .attr('width', 4)
                                  .attr('height', 4);

                    pattern.append('svg:line')
                         .attr("x1", 0)
                         .attr("y1", 4)
                         .attr("x2", 4)
                         .attr("y2", 0)
                         .attr('stroke', colors[i])
                         .attr('stroke-width', 1);

                    pattern.append('svg:line')
                         .attr("x1", -2)
                         .attr("y1", 2)
                         .attr("x2", 2)
                         .attr("y2", -2)
                         .attr('stroke', colors[i])
                         .attr('stroke-width', 1);

                    pattern.append('svg:line')
                        .attr("x1", 2)
                        .attr("y1", 6)
                        .attr("x2", 6)
                        .attr("y2", 2)
                        .attr('stroke', colors[i])
                        .attr('stroke-width', 1);
                }
            }
        };

        function removePattern(id) {
            self.defs.selectAll('[id^=pattern' + id + ']').remove();
        };

        //return height(bottom axis place)
        function getBottomPadding() {
            var height = 20;
            var count = 0;
            for (var i in self.xAxisArr)
                count++;
            //if (count > 0)
            height = count * 20;
            return height;
        };

        self.resize = function (_settings) {
            if (self.svg != null) {
                //var margin = { top: 19, right: 0, bottom: 0, left: 12 };
                if (_settings.margin_top) {
                    self.margin.top = _settings.margin_top;
                }
                if (_settings.margin_bottom) {
                    self.margin.bottom = _settings.margin_bottom;
                }
                if (_settings.margin_left) {
                    self.margin.left = _settings.margin_left;
                }
                if (_settings.margin_right) {
                    self.margin.right = _settings.margin_right;
                }
                if (_settings.exploded)
                    self.exploded = _settings.exploded;
                if (_settings.width != undefined && _settings.width != null) {
                    var width = _settings.width - self.margin.left - self.margin.right - 20;
                    if (width > 0) {
                        self.width = width;
                        if (_settings.height != undefined && _settings.height != null) {
                            self.height = _settings.height - self.margin.top - self.margin.bottom;
                            self.height = 0;
                            self.groupHeight = _settings.height - self.margin.top - self.margin.bottom;
                            d3.select(self.containerID).attr("width", self.width + self.margin.left + self.margin.right)
                                .attr("height", self.height + self.margin.top + self.margin.bottom);
                        }
                        d3.select(self.containerID + ' svg').attr("width", self.width + self.margin.left + self.margin.right);
                        self.refreshSize();
                        self.reDraw();
                        if (self.clickSelectedValue)
                            self.setClickSelectedDate(self.clickSelectedValue);
                    }
                }
            }

        };

        self.refreshSize = function () {
            if (self.exploded) {
                var groupsSize = 0;
                for (i in self.groups) groupsSize++;
                var groupHeight = 0;
                if (groupsSize == 1)
                    groupHeight = self.groupHeight;
                else
                    groupHeight = self.explodeGroupHeight;
                var xAxisCount = 0;
                for (var i in self.xAxisArr)
                    xAxisCount++;
                self.height = groupHeight * groupsSize + xAxisCount * 20;
            }
            d3.select(self.containerID + ' svg').attr("height", self.height + self.margin.top + self.margin.bottom);
        };

        function timeFormat(formats) {
            return function (date) {
                var i = formats.length - 1, f = formats[i];
                while (!f[1](date)) f = formats[--i];
                return f[0](date);
            };
        }

        function getRandomIndex() {
            var res = Math.floor((Math.random() * 100000) + 1) + Math.floor((Math.random() * 10000) + 1) + Math.floor((Math.random() * 1000) + 1) + Math.floor((Math.random() * 100) + 1) + Math.floor((Math.random() * 10) + 1);
            return res;
        };
    };
    return (D3RangeChart);
});