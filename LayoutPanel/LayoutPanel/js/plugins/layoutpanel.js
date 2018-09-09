define([CURRENT_DOMAIN + "js/libs/knockout.js"],
    function (ko) {
        function LayoutPanel() {
            var self = this;
            self.panelId = '';
            self.targets = [];
            self.behaviourType = 'Normal';
            self.behaviour = null;

            self.minWidth = 300;
            self.minHeight = 300;
            self.margin = 5;
            self.scale = 1;

            self.initRowCount = 1;
            self.initColCount = 1;

            self.init = function (data) {
                if (data.id != undefined && data.id != null && data.id != '')
                    self.panelId = data.id;

                if (data.minWidth != undefined && data.minWidth != null && data.minWidth != '')
                    self.minWidth = data.minWidth;
                if (data.minHeight != undefined && data.minHeight != null && data.minHeight != '')
                    self.minHeight = data.minHeight;

                if (data.margin != undefined && data.margin != null && data.margin != '')
                    self.margin = data.margin;

                if (data.initRowCount != undefined && data.initRowCount != null && data.initRowCount != '')
                    self.initRowCount = data.initRowCount;

                if (data.initColCount != undefined && data.initColCount != null && data.initColCount != '')
                    self.initColCount = data.initColCount;


                if (data.behaviour != undefined && data.behaviour != null && data.behaviour != '')
                    self.behaviourType = data.behaviour;
                switch (self.behaviourType) {
                    case 'Normal':
                        self.behaviour = new NormalBehaviour(self);
                        break;
                    case 'LeftTop':
                        //self.updateLayout = self.updateLeftTopLayout;
                        //self.initPositioning = self.LeftTopInitPositioning;
                        break;
                }
            };

            self.subscribe = function (obj, x, y) {
                //obj.Id()
                //obj.width()
                //obj.height()
                if (obj != undefined && obj != null) {
                    var canUpdateLayout = false;
                    if (obj.layout == undefined) {
                        obj.layout = {
                            col: 0,
                            row: 0,
                            colCount: self.initColCount,
                            rowCount: self.initRowCount
                        };
                        obj.posLeft = 0;
                        obj.posTop = 0;
                        if (x != undefined && x != null) {
                            obj.posLeft = x;
                            canUpdateLayout = true;
                        }
                        if (y != undefined && y != null) {
                            obj.posTop = y;
                            canUpdateLayout = true;
                        }
                        var col = self.getInt(obj.posLeft / self.minWidth);
                        var row = self.getInt(obj.posTop / self.minWidth);
                        obj.col = col;
                        obj.row = row;
                        obj.colCount = self.initColCount;
                        obj.rowCount = self.initRowCount;

                        obj.width(self.getWidth(obj.colCount, self.scale));
                        obj.height(self.getHeight(obj.rowCount, self.scale));

                        obj.isFloatItem = false;
                    }
                    obj.initIndex = self.targets.length;
                    if (self.initPositioning != undefined)
                        self.initPositioning(obj);
                    self.targets.push(obj);
                    if (canUpdateLayout)
                        self.updateLayout(obj);
                }
            };

            self.unscribe = function (obj) {
                for (var i = 0; i < self.targets.length; i++) {
                    if (self.targets[i].Id() == obj.Id()) {
                        self.targets[i].layout = null;
                        self.targets.splice(i, 1);
                        break;
                    }
                }
            };

            self.unscribeAll = function () {
                for (var i = 0; i < self.targets.length; i++) {
                    self.targets[i].layout = null;
                }
                self.targets = [];
            };

            self.saveLayout = function () {
                var layoutList = [];
                for (var i = 0; i < self.targets.length; i++) {
                    layoutList.push({
                        id: self.targets[i].Id(),
                        //x: self.targets[i].posLeft,
                        //y: self.targets[i].posTop,
                        //w: self.targets[i].width(),
                        //h: self.targets[i].height(),
                        c: self.targets[i].col,
                        r: self.targets[i].row,
                        cc: self.targets[i].colCount,
                        rc: self.targets[i].rowCount
                    });
                }
                return JSON.stringify(layoutList);
            };

            self.loadLayout = function (layoutString) {
                if (layoutString != undefined && layoutString != null) {
                    var layoutItems = JSON.parse(layoutString);
                    for (var i = 0; i < layoutItems.length; i++) {
                        var target = null;
                        for (var j = 0; j < self.targets.length; j++) {
                            if (self.targets[j].Id() == layoutItems[i].id) {
                                target = self.targets[j];
                                break;
                            }
                        }
                        if (target != null) {
                            target.col = layoutItems[i].c;
                            target.row = layoutItems[i].r;
                            target.colCount = layoutItems[i].cc;
                            target.rowCount = layoutItems[i].rc;

                            target.width(self.getWidth(target.colCount, self.scale));
                            target.height(self.getHeight(target.rowCount, self.scale));
                        }
                    }
                    self.updateLayout();
                }
            };

            self.initPositioning = function (target) {
                if (self.behaviour != undefined && self.behaviour != null)
                    self.behaviour.initPositioning(target);
            };

            self.updateLayout = function (target) {
                if (self.behaviour != undefined && self.behaviour != null)
                    self.behaviour.updateLayout(target);
            };

            self.getWidth = function (cols, scale) {
                return (cols * self.minWidth + (cols - 1) * self.margin) * scale;
            };

            self.getHeight = function (rows, scale) {
                return (rows * self.minHeight + (rows - 1) * self.margin) * scale;
            };

            self.getInt = function (v) {
                return parseInt(v.toString());
            };
        };

        //Normal behaviour
        function NormalBehaviour(panel) {
            var self = this;
            self.panel = panel;

            self.getNormalPos = function (columns, col, row, colCount, rowCount) {
                var resCol = 0;
                var resRow = 0;
                var sortedColumns = JSON.parse(JSON.stringify(columns)).sort(function (a, b) { return a.row - b.row; });
                for (var i = 0; i < sortedColumns.length; i++) {
                    var colIndex = sortedColumns[i].col;
                    if (colCount == 1) {
                        resCol = colIndex;
                        resRow = columns[colIndex].row;
                        columns[colIndex].row = columns[colIndex].row + rowCount;
                        break;
                    }
                    else if (colCount > 1) {
                        if (columns.length - colIndex >= colCount) {
                            var canAdd = true;
                            resRow = columns[colIndex].row;
                            for (var j = colIndex; j < colIndex + colCount; j++) {
                                if (columns[j].row > resRow) {
                                    canAdd = false;
                                    resRow = columns[j].row;
                                }
                            }
                            if (canAdd == false)
                                colIndex = 0;
                            resCol = colIndex;
                            for (var j = colIndex; j < colIndex + colCount; j++) {
                                columns[j].row = resRow + rowCount;
                            }
                            break;
                        }
                        else {
                            colIndex = 0;
                            resCol = colIndex;
                            resRow = columns[colIndex].row;
                            if (columns.length < colCount)
                                colCount = columns.length;
                            for (var j = colIndex; j < colCount; j++) {
                                if (columns[j].row > resRow) {
                                    resRow = columns[j].row;
                                }
                            }
                            for (var j = colIndex; j < colCount; j++) {
                                columns[j].row = resRow + rowCount;
                            }
                            break;
                        }
                    }
                }
                return { col: resCol, row: resRow };
            }

            self.updateLayout = function (target) {
                var sceneWidth = 0;
                var sceneHeight = 0;
                var sceneContainer = $("#" + self.panel.panelId);
                if (sceneContainer.length > 0) {
                    var sceneWidth = sceneContainer.width();
                    var sceneHeight = sceneContainer.height();
                    var newSceneWidth = 0;
                    var newSceneHeight = 0;
                    if (target == undefined) {
                        for (var i = 0; i < self.panel.targets.length; i++) {
                            d3.select('#' + self.panel.targets[i].Id())
                                .style('top', top + 'px')
                                .style('left', (self.panel.targets[i].col * (self.panel.minWidth + self.panel.margin)) + 'px');
                            var container = $('#' + self.panel.targets[i].Id());
                            if (container.length > 0) {
                                var top = self.panel.targets[i].row * (self.panel.minHeight + self.panel.margin);
                                d3.select('#' + self.panel.targets[i].Id()).transition().duration(50)
                                    .style('top', top + 'px')
                                    .style('left', (self.panel.targets[i].col * (self.panel.minWidth + self.panel.margin)) + 'px');
                            }
                            var h = (self.panel.targets[i].row + self.panel.targets[i].rowCount) * (self.panel.minHeight + self.panel.margin);
                            if (h > newSceneHeight)
                                newSceneHeight = h;
                            var w = (self.panel.targets[i].col + self.panel.targets[i].colCount) * (self.panel.minWidth + self.panel.margin);
                            if (w > newSceneWidth)
                                newSceneWidth = w;
                        }
                    }
                    else {
                        var matrix = {};
                        for (var i = 0; i < self.panel.targets.length; i++) {
                            if (self.panel.targets[i].Id() != target.Id()) {
                                self.fillMatrixCell(matrix, self.panel.targets[i], 1);
                            }
                        }
                        if (!self.checkMatrixCellRange(matrix, target.col, target.colCount, target.row, target.rowCount)) {
                            var floatTargets = [];
                            for (var i = 0; i < self.panel.targets.length; i++) {
                                if (self.panel.targets[i].Id() != target.Id() && (
                                    (self.panel.targets[i].col <= target.col && target.col < self.panel.targets[i].col + self.panel.targets[i].colCount || target.col <= self.panel.targets[i].col && self.panel.targets[i].col < target.col + target.colCount ||
                                    self.panel.targets[i].col < target.col + target.colCount && target.col + target.colCount < self.panel.targets[i].col + self.panel.targets[i].colCount || target.col < self.panel.targets[i].col + self.panel.targets[i].colCount && self.panel.targets[i].col + self.panel.targets[i].colCount < target.col + target.colCount)
                                    &&
                                    (self.panel.targets[i].row <= target.row && target.row < self.panel.targets[i].row + self.panel.targets[i].rowCount || target.row <= self.panel.targets[i].row && self.panel.targets[i].row < target.row + target.rowCount ||
                                    self.panel.targets[i].row < target.row + target.rowCount && target.row + target.rowCount < self.panel.targets[i].row + self.panel.targets[i].rowCount || target.row < self.panel.targets[i].row + self.panel.targets[i].rowCount && self.panel.targets[i].row + self.panel.targets[i].rowCount < target.row + target.rowCount)
                                    )) {
                                    self.panel.targets[i].isFloatItem = true;
                                    floatTargets.push(self.panel.targets[i]);
                                }
                                else {
                                    self.panel.targets[i].isFloatItem = false;
                                }
                            }
                            matrix = {};
                            for (var i = 0; i < self.panel.targets.length; i++) {
                                if (self.panel.targets[i].isFloatItem == false) {
                                    self.fillMatrixCell(matrix, self.panel.targets[i], 1);
                                }
                            }
                            for (var i = 0; i < floatTargets.length; i++) {
                                var direction = 'down';
                                var downRow = self.moveItemDown(matrix, floatTargets[i], floatTargets[i].row + 1);
                                var dif = Math.abs(downRow - floatTargets[i].row);
                                var leftCol = self.moveItemLeft(matrix, floatTargets[i], floatTargets[i].col - 1);
                                var colDiff = Math.abs(leftCol - floatTargets[i].col);
                                if (dif > colDiff && leftCol >= 0) {
                                    dif = colDiff;
                                    direction = 'left';
                                }
                                var rightCol = self.moveItemRight(matrix, floatTargets[i], floatTargets[i].col + 1);
                                colDiff = Math.abs(rightCol - floatTargets[i].col);
                                if (dif > colDiff) {
                                    dif = colDiff;
                                    direction = 'right';
                                }
                                var topRow = self.moveItemTop(matrix, floatTargets[i], floatTargets[i].row - 1);
                                colDiff = Math.abs(topRow - floatTargets[i].row);
                                if (dif > colDiff && topRow >= 0) {
                                    dif = colDiff;
                                    direction = 'top';
                                }
                                floatTargets[i].isFloatItem = false;
                                self.fillMatrixCell(matrix, floatTargets[i], 0);
                                switch (direction) {
                                    case 'down':
                                        floatTargets[i].row = downRow;
                                        break;
                                    case 'left':
                                        floatTargets[i].col = leftCol;
                                        break;
                                    case 'right':
                                        floatTargets[i].col = rightCol;
                                        break;
                                    case 'top':
                                        floatTargets[i].row = topRow;
                                        break;
                                }
                                self.fillMatrixCell(matrix, floatTargets[i], 1);
                                var top = floatTargets[i].row * (self.panel.minHeight + self.panel.margin);
                                d3.select('#' + floatTargets[i].Id()).transition().duration(50)
                                    .style('top', top + 'px')
                                    .style('left', (floatTargets[i].col * (self.panel.minWidth + self.panel.margin)) + 'px');
                            }
                        }
                        var top = target.row * (self.panel.minHeight + self.panel.margin);
                        d3.select('#' + target.Id())
                            .style('top', top + 'px')
                            .style('left', (target.col * (self.panel.minWidth + self.panel.margin)) + 'px');
                        for (var i = 0; i < self.panel.targets.length; i++) {
                            var h = (self.panel.targets[i].row + self.panel.targets[i].rowCount) * (self.panel.minHeight + self.panel.margin);
                            if (h > newSceneHeight)
                                newSceneHeight = h;
                            var w = (self.panel.targets[i].col + self.panel.targets[i].colCount) * (self.panel.minWidth + self.panel.margin);
                            if (w > newSceneWidth)
                                newSceneWidth = w;
                        }
                    }
                    if (sceneHeight < newSceneHeight)
                        sceneContainer.height(newSceneHeight + 'px');
                    if (sceneWidth < newSceneWidth)
                        sceneContainer.width(newSceneWidth + 'px');
                }
            };

            self.moveItemDown = function (matrix, target, newRow) {
                if (!self.checkMatrixCellRange(matrix, target.col, target.colCount, newRow, target.rowCount)) {
                    newRow = newRow + 1;
                    return self.moveItemDown(matrix, target, newRow);
                }
                else {
                    return newRow;
                }
            };

            self.moveItemTop = function (matrix, target, newRow) {
                if (!self.checkMatrixCellRange(matrix, target.col, target.colCount, newRow, target.rowCount)) {
                    newRow = newRow - 1;
                    if (newRow < 0)
                        return newRow;
                    return self.moveItemTop(matrix, target, newRow);
                }
                else {
                    return newRow;
                }
            };

            self.moveItemLeft = function (matrix, target, newCol) {
                if (!self.checkMatrixCellRange(matrix, newCol, target.colCount, target.row, target.rowCount)) {
                    newCol = newCol - 1;
                    if (newCol < 0)
                        return newCol;
                    return self.moveItemLeft(matrix, target, newCol);
                }
                else {
                    return newCol;
                }
            };

            self.moveItemRight = function (matrix, target, newCol) {
                if (!self.checkMatrixCellRange(matrix, newCol, target.colCount, target.row, target.rowCount)) {
                    newCol = newCol + 1;
                    return self.moveItemRight(matrix, target, newCol);
                }
                else {
                    return newCol;
                }
            };

            self.fillMatrixCell = function (matrix, target, value) {
                if (target.col != undefined && target.row != undefined && target.colCount != undefined && target.rowCount != undefined) {
                    for (var i = target.col; i < target.col + target.colCount; i++) {
                        var column = matrix[i];
                        if (column == undefined) {
                            column = {};
                            matrix[i] = column;
                        }
                        for (var j = target.row; j < target.row + target.rowCount; j++) {
                            column[j] = value;
                        }
                    }
                }
            };

            self.checkMatrixCellRange = function (matrix, col, colCount, row, rowCount) {
                if (col < 0 || row < 0 || colCount < 1 || rowCount < 1)
                    return false;
                var res = true;
                for (var i = col; i < col + colCount; i++) {
                    var column = matrix[i];
                    if (column != undefined) {
                        for (var j = row; j < row + rowCount; j++) {
                            if (column[j] != undefined) {
                                res = false;
                                break;
                            }
                        }
                    }
                    if (res == false)
                        break;
                }
                return res;
            };

            self.initPositioning = function (target) {
                var draggable = d3.select('#' + target.Id() + ' .tile-header');
                if (draggable.length > 0) {
                    var drag = d3.behavior.drag()
                        .on("drag", function () {
                            var container = $('#' + target.Id());
                            if (container.length > 0) {
                                target.posLeft = target.startLeft - target.startX + d3.event.sourceEvent.pageX;
                                target.posTop = target.startTop - target.startY + d3.event.sourceEvent.pageY;
                                if (target.posTop >= 0 && target.posLeft >= 0) {
                                    container.css('top', target.posTop + 'px');
                                    container.css('left', target.posLeft + 'px');
                                }
                            }
                        })
                        .on("dragstart", function () {
                            var container = $('#' + target.Id());
                            if (container.length > 0) {
                                target.startLeft = parseFloat(container.css('left').replace('px', ''));
                                target.startTop = parseFloat(container.css('top').replace('px', ''));
                                container.css('z-index', 1000);
                            }
                            target.startX = d3.event.sourceEvent.pageX;
                            target.startY = d3.event.sourceEvent.pageY;
                            d3.event.sourceEvent.stopPropagation();
                        })
                        .on("dragend", function () {
                            var container = $('#' + target.Id());
                            if (container.length > 0) {
                                target.posLeft = Math.round(target.posLeft / self.panel.minWidth) * (self.panel.minWidth + self.panel.margin);
                                target.posTop = Math.round(target.posTop / self.panel.minHeight) * (self.panel.minHeight + self.panel.margin);
                                if (target.posTop >= 0 && target.posLeft >= 0) {
                                    container.css('top', target.posTop + 'px');
                                    container.css('left', target.posLeft + 'px');
                                    container.css('z-index', 1);
                                }
                                var col = self.panel.getInt(target.posLeft / self.panel.minWidth);
                                var row = self.panel.getInt(target.posTop / self.panel.minHeight);
                                if (target.col != col || target.row != row) {
                                    target.col = col;
                                    target.row = row;
                                    self.updateLayout(target);
                                }
                            }
                        });
                    draggable.call(drag)
                }
                if (self.NormalInitResizeCorner != undefined)
                    self.NormalInitResizeCorner(target);
            };

            self.NormalInitResizeCorner = function (target) {
                var draggable = d3.select('#' + target.Id() + ' .tile-resize-corner');
                if (draggable.length > 0) {
                    var drag = d3.behavior.drag()
                        .on("drag", function (d) {
                            var container = $('#' + target.Id());
                            if (container.length > 0) {
                                var draggableWidth = container[0].offsetWidth;
                                var draggableLeft = container[0].offsetLeft;
                                var offset = container.offset();
                                var containerLeft = offset.left;
                                var newWidth = d3.event.sourceEvent.pageX - containerLeft;
                                var containerTop = offset.top;
                                var newHeight = d3.event.sourceEvent.pageY - containerTop;

                                var widthBorder = $('#' + target.Id() + ' .tile-resize-width');
                                var heightBorder = $('#' + target.Id() + ' .tile-resize-height');
                                widthBorder.width(newWidth + 'px');
                                widthBorder.css('top', newHeight + 'px');
                                widthBorder.css('z-index', 1001);
                                heightBorder.height(newHeight + 'px');
                                heightBorder.css('left', newWidth + 'px');
                                heightBorder.css('z-index', 1001);
                                target.resizeWidth = newWidth;
                                target.resizeHeight = newHeight - 100;
                            }
                        })
                        .on("dragstart", function () {
                            d3.event.sourceEvent.stopPropagation();
                        })
                        .on("dragend", function () {
                            var wCount = Math.round(target.resizeWidth / self.panel.minWidth);
                            var hCount = Math.round(target.resizeHeight / self.panel.minHeight);
                            target.resizeWidth = self.panel.getWidth(wCount, 1);
                            target.resizeHeight = self.panel.getHeight(hCount, 1);
                            if (target.resizeWidth > 0 && target.resizeHeight > 0) {
                                target.width(target.resizeWidth * self.panel.scale);
                                target.height(target.resizeHeight * self.panel.scale);
                                target.colCount = wCount;
                                target.rowCount = hCount;
                                self.updateLayout(target);
                                if (target.resize != undefined && target.resize != null)
                                    target.resize();
                            }
                            var widthBorder = $('#' + target.Id() + ' .tile-resize-width');
                            var heightBorder = $('#' + target.Id() + ' .tile-resize-height');
                            widthBorder.width('0px');
                            heightBorder.height('0px');
                        });
                    draggable.call(drag)
                }
            };
        };

        return (LayoutPanel);
    });