//This template is a demonstration of structure for blob storage hosted projects
//which should have the same structure: css, js, js/viewmodels, pages folders
//entry point is "js/viewmodels/mainModel.js" (think is main model for whole project) in "render" method
//and "pages/mainModel.html" which is HTML content for main page.
//
//1) Method "render" contains samples of loading css, js and html files.
//
//2) CURRENT_DOMAIN + "js/libs/knockout.js" -- loading file from project located in blob storage
//
//3) "/js/libs/knockout.js" -- loading file from project located in Hub3
//
//4) loadCss - method for loading css files
//
//5) loadHtml - method for loading HTML files
//
//6) dataFetcher.dalGet - method for loading data from DAL
//
//7) User can run project locally by setting index.html as StartPage,
//but there will be need to set all public variables which he is using from Hub3, like I did with CURRENT_DOMAIN.
//
//8) CURRENT_DOMAIN = ""; -- always in index.html for running locally.
//
//9) How to deploy to blob storage:
//there is need to use DeployHubContainer app for uploading all project into blob storage(just run it, select folder from your computer and press Deploy button).


define([
    CURRENT_DOMAIN + "js/libs/knockout.js",
    CURRENT_DOMAIN + "js/data/dataFetcher.js", 
    CURRENT_DOMAIN + "js/plugins/layoutpanel.js",
    CURRENT_DOMAIN + 'js/viewmodels/tiles/siteAnalysisTile.js',
    CURRENT_DOMAIN + 'js/map/mapComponent.js',
    CURRENT_DOMAIN + 'js/charts/d3CHarts/simpleLineChart.js',
    CURRENT_DOMAIN + 'js/plugins/dragMaster.js'],
function (ko, dataFetcher, LayoutPanel, SiteAnalysisTile, mapComponent, simpleLineChart) {

    var viewModel = {
        leftSideItems: ko.observableArray([]),
        tiles: ko.observableArray([]),
        layoutPanel: null,
        userName: ko.observable(''),
        pageName: ko.observable(''),
        welcomeTemplate: ko.observable(''),

    };

    const vmFactory = {
        "MapSection" : function(data, params){
            return new MapItem(data, params);
        },
        "KpiSection" : function(data, params){
            return new KpiItem(data, params);
        },
        "RankingSection" : function(data, params){
            return new RankedItem(data, params);
        }
    };

    const contentNameMap = {
        'MapSection' : 'MapItems',
        'KpiSection' : 'Kpis',
        'RankingSection' : 'RankedItems'
    };

    viewModel.welcomeMessage = ko.computed(function() {
        return viewModel.welcomeTemplate().replace('{UserName}', viewModel.userName());
    });


    function onResizeEvent() {
        var _hash = window.location.hash.toString();
        viewModel.resize();
        if ($('#pivotSplitter').length > 0)
            $('#pivotSplitter').jqxSplitter({ height: getBuilderHeight() });
    };

    $(window).resize(function () {
        viewModel.updateWindowHeight();
        viewModel.updateLayout();
    });

    viewModel.updateWindowHeight = function () {
        var $w = $(window);
        var newHeight = $w.height();
        $('#mainmodel-container').css({
            height: newHeight
        });
        $('#left-side-menu').css({
            height: newHeight
        });
    };

    viewModel.render = function () {
        require(["D3JS"], function () {
            var menuItems = [];
            //for (var i = 1; i < 100; i++) {
            //    menuItems.push(new MenuItem(i, 'Tile ' + i.toString()));
            //}
            menuItems.push(new MenuItem(0, 'Test tile', 'template-tile'));
            menuItems.push(new MenuItem(1, 'SITE ANALYSIS', 'template-sa-tile'));
            viewModel.leftSideItems(menuItems);
            viewModel.updateDropItems();

            loadCss(CURRENT_DOMAIN + 'css/test.css');
            loadCss(CURRENT_DOMAIN + 'css/common-tile.css');
            viewModel.updateWindowHeight();

            viewModel.layoutPanel = new LayoutPanel();
            viewModel.layoutPanel.init({
                id: 'tiles-panel',
                minHeight: 220,
                minWidth: 340,
                margin: 20,
                initRowCount: 1,
                initColCount: 1
            });

            dataFetcher.dalGet('layout', null, (data) => {
                const json = viewModel.transformData(data);
                viewModel.buildPanel(json);
            });
        });
    };

    viewModel.transformData = (data) => {
        if (!data || !data.Sections){
            console.error('JSON is empty or does not contain the Sections part');
        }

        viewModel.userName(data.UserName);
        viewModel.pageName(data.PageName);
        viewModel.welcomeTemplate(data.WelcomeMessageTemplate);

        return data.Sections.map((item, index) => {
            return {
                ...item,
                c: item.LayoutColumn,
                r: item.LayoutRow,
                cc: item.LayoutColSpan,
                rc: item.LayoutRowSpan,
                id: `tile_${index}`
            };
        });
    };

    viewModel.buildPanel = (layoutTiles) => {
        layoutTiles = layoutTiles || [];

        for (var i = 0; i < layoutTiles.length; i++) {
            var tile = new TileItem(layoutTiles[i]);
            viewModel.tiles.push(tile);
            viewModel.layoutPanel.subscribe(tile);
        }
        viewModel.layoutPanel.loadLayout(layoutTiles);
    };

    viewModel.getTemplateFunc = function (tile) {
        return tile.template;
    };

    viewModel.afterTargetRenderEvent = function (element, target) {
        if (target != undefined && target != null && target.render != undefined)
            target.render();
    };

    viewModel.menuItemMouseDown = function (target) {
        viewModel.initMenuDragDrop([target]);
    };

    viewModel.initMenuDragDrop = function (dataList) {
        if (dataList.length == 0)
            return;
        var targetKeys = ['TilesGrid'];
        var selectedObjects = [];
        var dragObjects = document.getElementById('mainmodel-container').getElementsByTagName('div');
        var template = '';
        for (var i = 0; i < dragObjects.length; i++) {
            for (var j = 0; j < dataList.length; j++) {
                if (dragObjects[i].id == dataList[j].Id()) {
                    selectedObjects.push(dragObjects[i]);
                }
            }
        }
        var popupHeight = 100;
        template = '<div style="height:' + popupHeight + 'px" class="drag-box-border">' + dataList[0].Name() + '</div>';
        for (var i = 0; i < selectedObjects.length; i++) {
            new DragObject(selectedObjects[i], 'mainmodel-container', dataList, template, targetKeys);
        }

    };

    viewModel.updateDropItems = function () {
        var dropObjectsList = [];
        var dropNameObject = document.getElementById('tiles-panel-container');
        dropObjectsList.push([dropNameObject]);
        for (var i = 0; i < dropObjectsList.length; i++) {
            new DropTarget(dropObjectsList[i], 'TilesGrid', 'drop-enter-Class', 'pivotstream-drop-leave-Class', viewModel.tileDrop);
        }
    };

    viewModel.tileDrop = function (arg) {
        if (arg != null && arg.dragItem != null) {
            for (var i = 0; i < arg.dragItem.data.length; i++) {
                var dataItem = arg.dragItem.data[i];
                var tile = null;
                switch (dataItem.Template) {
                    case 'template-sa-tile':
                        tile = new SiteAnalysisTile('tile_' + viewModel.getRandomIndex(), dataItem.Name());
                        tile.Title(dataItem.Name());
                        tile.SubTitle('Installation Name');
                        break;
                    default:
                        tile = new TileItem('tile_' + viewModel.getRandomIndex(), dataItem.Name());
                        tile.Title(dataItem.Name());
                        break;
                }
                viewModel.tiles.push(tile);
                viewModel.layoutPanel.subscribe(tile, arg.dragItem.x, arg.dragItem.y);
            }
        }
    };

    viewModel.getRandomIndex = function() {
        var res = Math.floor((Math.random() * 1000) + 1) + Math.floor((Math.random() * 100) + 1) + Math.floor((Math.random() * 10) + 1);
        console.log('id=' + res);
        return res;
    };

    viewModel.updateLayout = function (id) {
        if (viewModel.layoutPanel != null)
            viewModel.layoutPanel.updateLayout(id);
    };

    viewModel.saveLayout = function () {
        if (viewModel.layoutPanel != null) {
            var layout = viewModel.layoutPanel.saveLayout();
            alert(layout);
        }
    };

    viewModel.removeTile = function (tile) {
        if (viewModel.layoutPanel != null) {
            viewModel.layoutPanel.unscribe(tile);
            viewModel.tiles.remove(tile);
        }
    };

    function MenuItem(id, name, template) {
        var self = this;
        self.Id = ko.observable('menu_' + id);
        self.Name = ko.observable(name);
        self.Template = template;
    }

    function TileItem(data) {
        var self = this;
        self.Id = ko.observable(data.id);
        self.width = ko.observable(0);
        self.height = ko.observable(0);
        self.template = 'template-tile';
        self.IsSettingsOpened = ko.observable(false);

        self.Name = ko.observable(data.Name || '');
        self.SectionType = data.SectionType;
        self.contentData = data[contentNameMap[self.SectionType]];
        self.contentItems = ko.observableArray([]);
        self.Title = ko.observable(data.Name || '');

        self.onOpenSettings = function () {
            self.IsSettingsOpened(!self.IsSettingsOpened());
        };

        self.openSettings = function () {
            self.IsSettingsOpened(true);
        };

        self.closeSettings = function () {
            self.IsSettingsOpened(false);
        };

        self.getTemplateFunc = function(sectionItem){
            return sectionItem.template;
        };

        self.render = function () {
            console.log(`render tile ${self.SectionType}`);
            let contentViewModel = vmFactory[self.SectionType](
                self.contentData,
                {
                    name: data.Name,
                    title: data.TitleHtml,
                    id: data.id
                } );

            self.contentItems.push(contentViewModel);
        };

        self.resize = function () {
            console.log('resize tile');
        };
        self.afterTileRenderEvent = (elements, sectionItem) => {
            sectionItem.afterTileRenderEvent && sectionItem.afterTileRenderEvent();
        };
    }

    function KpiItem(data) {
        const self = this;
        const GRAPH_WIDTH = 220;
        const GRAPH_HEIGHT = 100;
        const increments = {};
        data.forEach((item) => {
            const trendsLength = item.TrendPoints.length;
            const trendBeginValue = item.TrendPoints[0].Value;
            const trendEndValue = item.TrendPoints[trendsLength - 1].Value;
            const diff = trendEndValue - trendBeginValue;
            increments[item.Name] = Math.round(diff * 100 / trendBeginValue);
        });

        self.getBackgroundImage = (kpiType) => {
            return `url("../assets/${kpiType.toLowerCase()}.png")`;
        };

        self.getIncrement = (kpiType) => {

            const sign  = increments[kpiType] > 0 ? "&uarr;" : "&darr;";
            return `${Math.abs(increments[kpiType])}% ${sign}`;
        };

        self.getIncrementColor = (kpiType) => {
            return increments[kpiType] > 0 ? "43A1A2" : "#BB2644";
        };

        self.getColor = (kpiType) => {
            const colors = {
                "Maintenance": "#b01e6b",
                "Comfort": "#7424b5",
                "Energy" : "#31a18c"
            };
            return colors[kpiType];
        };

        loadCss(CURRENT_DOMAIN + 'css/kpi.css');
        self.template = 'kpi-item-template';
        self.afterTileRenderEvent = () => {
            data.forEach((item) => {
                const trendsLength = item.TrendPoints.length;
                if (trendsLength){
                    const lineData = item.TrendPoints.map((item, index) => {return {x: item.Timestamp, y: item.Value};});
                    const chartParams = {
                        width: GRAPH_WIDTH,
                        height: GRAPH_HEIGHT,
                        margin: 5,
                        color: self.getColor(item.Name)
                    };

                    simpleLineChart.draw(item.Name, chartParams, lineData);
                }
            });

        };

        self.data = ko.observableArray(data);
    }

    function MapItem(data, params) {
        var self = this;
        self.template = 'map-item-template';
        self.data = ko.observableArray(data);
        mapComponent.init(params.id, data);
    }

    function RankedItem(data, params) {
        var self = this;
        loadCss(CURRENT_DOMAIN + 'css/ranked-item.css');

        switch(params.name){
            case 'Most Active Users on CBA':
                self.template = 'ranked-item-users-template';

                const max = data[0].Value || 1;
                data = data.map((item) => {
                    return {...item, width: `${Math.round(150 * item.Value / max)}px` };
                });

                self.getColor = (index) => {
                    const colors = ['#279d99', '#27787c', '#26546f', '#d4536f'];
                    return colors[index]
                };
                break;
            case 'Event Activities This Month':
                self.getColor = (index) => {
                    const colors = ['#04a698', '#06c0a2', '#814255'];
                    return colors[index]
                };
                self.template = 'ranked-item-events-template';
                break;
            case 'Most Visited Workspaces':
                self.template = 'ranked-item-workspaces-template';
                break;
            default:
                break;

        }
        self.data = ko.observableArray(data);
        self.name = ko.observable(params.name);
        self.title = ko.observable(params.title);
    }

    return viewModel;
});