define([
    CURRENT_DOMAIN + "js/libs/knockout.js",
    CURRENT_DOMAIN + "js/charts/d3Charts/RangeChart.js"],
    function (ko, D3RangeChart) {
        function SiteAnalysisTile(id, name) {
            var self = this;
            self.Id = ko.observable(id);
            self.width = ko.observable(0);
            self.height = ko.observable(0);
            self.template = 'template-sa-tile';
            self.IsSettingsOpened = ko.observable(false);

            self.Name = ko.observable(name);

            self.Title = ko.observable('');
            self.SubTitle = ko.observable('');

            self.chart = null;
            self.chartHeight = ko.observable(0);
            self.hasChartDivision = ko.observable(false);
            self.series = [];

            self.onOpenSettings = function () {
                self.IsSettingsOpened(!self.IsSettingsOpened());
            };

            self.openSettings = function () {
                self.IsSettingsOpened(true);
            };

            self.closeSettings = function () {
                self.IsSettingsOpened(false);
            };

            function getLineChartSettings(data) {
                var containerId = self.Id() + '_tile-chart';
                var container = $('#' + self.Id() + ' .tile-content');
                return {
                    "width": container.outerWidth(),
                    "height": container.outerHeight() - 25,
                    "margin_top": 0,
                    "margin_bottom": 5,
                    "margin_left": 10,
                    "container": containerId,
                    "data": data,
                    exploded: true,
                    tooltipContainer: 'site-analysis-chart-tooltip',
                    hoverDateFormat: "ddd mmm dd, yyyy"
                };
            };

            function Random(min, max) {
                return parseInt((Math.random() * (max - min) + min).toString());
            };

            self.render = function () {
                if (self.renderTimer) clearTimeout(self.renderTimer);
                self.renderTimer = setTimeout(function () {
                    self.series = [];
                    self.series.push(new SerieData('Test 1', 100));
                    self.series.push(new SerieData('Test 2', 50));
                    self.series.push(new SerieData('Test 3', 250));
                    self.series.push(new SerieData('Test 4', 632.2));
                    self.series.push(new SerieData('Test 5', 125.9));
                    getLineChartSettings([]);
                    self.chart = new D3RangeChart();
                    self.chart.init(getLineChartSettings([]));
                    var lineDataSerie1 = [];
                    var lineDataSerie2 = [];
                    var lineDataSerie3 = [];
                    var lineDataSerie4 = [];
                    var lineDataSerie5 = [];
                    var lineDataSerie6 = [];
                    for (var j = 0; j < 10; j++) {
                        lineDataSerie1.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                        lineDataSerie2.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                        lineDataSerie3.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                        lineDataSerie4.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                        lineDataSerie5.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                        lineDataSerie6.push({ v: Random(0, 1000), dt: new Date(2015, 1, j + 1) });
                    }
                    self.chart.addSerie({
                        id: ('tempid1'),
                        data: lineDataSerie1,
                        color: '#ff2266',
                        name: 'test1',
                        type: 'spline',
                        yAxis: {
                            id: 'yaxis1',
                            unit: 'unit1'
                        },
                        xAxis: {//importent when chart should have two x Axis
                            id: 'selectedperiod',
                            format: '%d %b, %Y'
                        }
                    });
                    self.chart.addSerie({
                        id: ('tempid1'),
                        data: lineDataSerie2,
                        color: '#8855ee',
                        name: 'test1',
                        type: 'areaspline',
                        yAxis: {
                            id: 'yaxis1',
                            unit: 'unit1'
                        },
                        xAxis: {//importent when chart should have two x Axis
                            id: 'selectedperiod',
                            format: '%d %b, %Y'
                        }
                    });

                    self.renderTimer = null;
                }, 300);

            };

            self.resize = function () {
                if (self.chart != null) {
                    var container = $('#' + self.Id() + ' .tile-content');
                    var newHeight = container.outerHeight();
                    if (self.colCount <= self.rowCount && (self.colCount != 1 || self.rowCount != 1)) {
                        newHeight = newHeight / 2;
                        self.hasChartDivision(true);
                    }
                    else {
                        self.hasChartDivision(false);
                    }
                    self.chartHeight(newHeight);
                    console.log('height=' + newHeight);
                    self.chart.resize({
                        "width": container.outerWidth(),
                        "height": newHeight - 25
                    });
                }
            };

            function SerieData(name, value) {
                var self = this;
                self.Name = name;
                self.Value = value;
            }
        };
        return (SiteAnalysisTile);
    });