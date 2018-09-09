var HUB_VERSION = "350.42"; // match with backend (Constants.cs)

require.config({

    paths: {
        // basics
        jquery: 'libs/jquery',
        jqueryui: 'libs/jqSliders/jquery-ui',
        knockout: 'libs/knockout',
        sammy: 'libs/sammy',
        modernizr: 'libs/modernizr',

        jqueryCookie: 'libs/jquery.cookie',
        easeljs: 'libs/easeljs-0.7.1.min',
        tweenjs: 'libs/tweenjs-0.5.1.min',
        movieclip: 'libs/movieclip-0.7.1.min',

        // utils
        dataFetcher: 'data/dataFetcher',
        dataStore: 'data/dataStore',
        cookieFetcher: 'data/cookieFetcher',
        dataStoreSyncher: 'data/dataStoreSyncher',
        normalizer: 'data/normalizer',
        accessManager: 'data/accessManager',
        websocketManager: 'data/websocketManager',

        wsWrapper: 'data/ws',
        dataLocalizer: 'data/dataLocalizer',
        utils: 'plugins/utils',
        ajaxWait: 'plugins/ajaxWait',
        fullScreen: 'plugins/fullScreen',
        pdfViewer: 'data/pdfViewer',
        pngViewer: 'data/pngViewer',
        auditLogger: 'data/auditLogger',
        colorManager: 'data/colorManager',
        iconManager: 'data/iconManager',
        unitManager: 'data/unitManager',
        hubRefreshManager: 'plugins/hubRefreshManager',
        switchPopup: 'plugins/switchpopup',
        validator: 'data/validator',

        //routes
        routes: 'routes/routes',

        // charts
        highchartGauge: "charts/HighchartsGauge",
        require: "libs/require",
        highcharts: "libs/highcharts/highcharts",
        highchartsmore: "libs/highcharts/highcharts-more",
        highstock: "libs/highstock/highstock",
        highstockmore: "libs/highcharts/highcharts-more",

        //bootstrap
        bootstrap: "libs/bootstrap/bootstrap.min",
        bootstrapCarouselIE: "libs/bootstrap/bootstrap-carousel-ie",
        bootstrapDatepicker: "libs/bootstrap/bootstrap-datepicker",
        bootstrapDateragepicker: "libs/bootstrap/bootstrap-daterangepicker",
        bootstrapDateTimepicker: "libs/bootstrap/bootstrap-datetimepicker",

        async: "libs/async",
        google: "libs/google",
        googleEarth: "libs/googleEarth",
        domReady: 'plugins/domReady',  // you need to add it on your own; download it from: http://requirejs.org/docs/download.html#domReady

        D3JS: "libs/d3js/d3.v3.min",
        gojsdebug: "libs/gojs/go-debug",
        gojs: "libs/gojs/go",
        gojsdebugv14: "libs/gojs/v1.4/go-debug",

        jqxcore: "libs/jqwidgets/jqxcore",
        jqxdata: "libs/jqwidgets/jqxdata",
        jqxbuttons: "libs/jqwidgets/jqxbuttons",
        jqxscrollbar: "libs/jqwidgets/jqxscrollbar",
        jqxmenu: "libs/jqwidgets/jqxmenu",
        jqxcheckbox: "libs/jqwidgets/jqxcheckbox",
        jqxlistbox: "libs/jqwidgets/jqxlistbox",
        jqxdropdownlist: "libs/jqwidgets/jqxdropdownlist",
        jqxgrid: "libs/jqwidgets/jqxgrid",
        jqxgridfilter: "libs/jqwidgets/jqxgrid.filter",
        jqxgridsort: "libs/jqwidgets/jqxgrid.sort",
        jqxgridselection: "libs/jqwidgets/jqxgrid.selection",
        jqxgridgrouping: "libs/jqwidgets/jqxgrid.grouping",
        jqxgridaggregates: "libs/jqwidgets/jqxgrid.aggregates",
        jqxgridcolumnsresize: "libs/jqwidgets/jqxgrid.columnsresize",
        jqxgridpager: "libs/jqwidgets/jqxgrid.pager",
        jqxgridedit: "libs/jqwidgets/jqxgrid.edit",
        jqxdragdrop: "libs/jqwidgets/jqxdragdrop",
        jqxnumberinput: "libs/jqwidgets/jqxnumberinput",
        jqxdropdownbutton: "libs/jqwidgets/jqxdropdownbutton",
        jqxcolorpicker: "libs/jqwidgets/jqxcolorpicker",
        jqxresponse: "libs/jqwidgets/jqxresponse",

        jqxpanel: "libs/jqwidgets/jqxpanel",
        jqxtabs: "libs/jqwidgets/jqxtabs",
        jqxsplitter: "libs/jqwidgets/jqxsplitter",
        jqxexpander: "libs/jqwidgets/jqxexpander",
        jqxgettheme: "libs/jqwidgets/scripts/gettheme",

        jqxdatatable: "libs/jqwidgets/jqxdatatable",
        jqxtree: "libs/jqwidgets/jqxtree",
        jqxtreegrid: "libs/jqwidgets/jqxtreegrid",
        jqxknockout: "libs/jqwidgets/jqxknockout",
        jqxinput: "libs/jqwidgets/jqxinput",
        jqxcalendar: "libs/jqwidgets/jqxcalendar",
        jqxdatetimeinput: "libs/jqwidgets/jqxdatetimeinput",

        //jqslider
        jqslider: "libs/jqSliders/jQAllRangeSliders-min",
        gridster: "libs/jquery.gridster.min"

    },
    shim: {
        'bootstrap': ['jquery'],
        'bootstrapCarouselIE': ['jquery'],
        'bootstrapDatepicker': ['jquery', 'jqueryui'],
        'bootstrapDateragepicker': ['jquery', 'jqueryui', 'js/libs/moment.js'],
        'bootstrapDateTimepicker': ['jquery', 'jqueryui'],
        'bootstrapTour': ['jquery', 'bootstrap', 'jqueryCookie'],

        'jqueryCookie': ['jquery'],
        'fullScreen': ['jquery'],
        'utils': ['jquery'],
        'sammy': ['jquery'],

        'tweenjs': ['easeljs'],
        'movieclip': ['tweenjs'],

        "highcharts": {
            "exports": "Highcharts",
            "deps": ["jquery"]
        },

        "highstock": {
            "exports": "Highcharts",
            "deps": ["jquery"]
        },

        "highstockmore": {
            "exports": "Highcharts",
            "deps": ["jquery", "highstock"]
        },

        "jqxcore": ['jquery'],
        "jqxdata": ['jqxcore'],
        "jqxinput": ['jqxcore'],
        "jqxdatatable": ['jqxcore'],
        "jqxbuttons": ['jqxdata'],
        "jqxscrollbar": ['jqxbuttons'],
        "jqxnumberinput": ['jqxscrollbar'],
        "jqxmenu": ['jqxnumberinput'],
        "jqxcheckbox": ['jqxmenu'],
        "jqxlistbox": ['jqxcheckbox'],
        "jqxdropdownlist": ['jqxlistbox'],
        "jqxgrid": ['jqxcore', 'jqxdropdownlist'],

        "jqxgridfilter": ['jqxgrid'],
        "jqxgridsort": ['jqxgrid'],
        "jqxgridselection": ['jqxgrid'],
        "jqxgridgrouping": ['jqxgrid'],
        "jqxgridaggregates": ['jqxgrid'],
        "jqxgridcolumnsresize": ['jqxgrid'],
        "jqxgridedit": ['jqxgrid'],
        "jqxgridpager": ['jqxgrid'],
        "jqxtabs": ['jqxcore'],
        "jqxdropdownbutton": ['jqxgrid'],
        "jqxresponse": ['jqxgrid'],

        "jqxcolorpicker": ['jqxgrid'],
        "jqxdragdrop": ['jqxcore'],
        "jqxpanel": ['jqxcore'],
        "jqxexpander": ['jqxcore'],
        "jqxsplitter": ['jqxcore'],
        "jqslider": ['jqueryui'],
        "jqxtree": ['jqxcheckbox'],
        "jqxtreegrid": ['jqxdatatable'],
        "jqxknockout": ['jqxdata'],
        "jqxcalendar": ['jquery'],
        "jqxdatetimeinput": ['jqxcalendar']
    },
    waitSeconds: 0,
    urlArgs: "bust=" + HUB_VERSION
});

var _mainInitialize = function (dataFetcher, dataStore) {

    applyFeatureControl(dataStore);

    require([CURRENT_DOMAIN + 'knockout', CURRENT_DOMAIN + 'unitManager'], function (ko, unitManager) {

        unitManager.loadUnitsData(function () {
            var _hash = window.location.hash.toString();
            if (dataStore.getFromLocalStorage('_huburl') != null || _hash.indexOf('#gbd/') > -1 || _hash.indexOf('#3dhome') > -1)
                return; // if its the shared hub, no need to proceed further down

            setupSideBar(dataStore);

            if (window.location.hash.indexOf('analysisexport') == -1)
                $('#workspaces-and-messages').css({ display: 'block' });

            require([CURRENT_DOMAIN + "viewmodels/sitesdropdown", "text!/" + CURRENT_DOMAIN + "pages/sitesdropdown.html?v=231"], function (sitesDropdown, htmlContent) {
                $('#hubsites-container').html(htmlContent);
                ko.applyBindings(sitesDropdown, $("#hubsites-container")[0]);

                sitesDropdown.hardReset(function () {
                    var iid = dataStore.getFromLocalStorage('switch_i');
                    if (iid != null) {
                        require([CURRENT_DOMAIN + "viewmodels/huboptions", "text!/" + CURRENT_DOMAIN + "pages/huboptions.html?v=231"], function (hubOption, htmlContent) {
                            if ($('#huboptions-container').length > 0) {
                                $('#huboptions-container').html(htmlContent);
                                ko.applyBindings(hubOption, $("#huboptions-container")[0]);
                            }
                            hubOption.render();
                        });
                    } else {
                        window.location.hash = '#hub';
                    }

                }); // sitesDropdown.hardReset

            }); // require(["viewmodels/sitesdropdown"
        });
    });
}
