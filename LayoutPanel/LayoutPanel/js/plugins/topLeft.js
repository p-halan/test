//LeftTop behaviour

self.currentLayoutUpdateId = null;
self.updateLeftTopLayout = function (id) {
    //return;
    //console.log('update layout 2');
    self.currentLayoutUpdateId = id;
    if (self.updateLayoutTimer) clearTimeout(self.updateLayoutTimer);
    self.updateLayoutTimer = setTimeout(function () {
        var id = self.currentLayoutUpdateId;
        console.log('start ' + id);
        if (id == undefined)
            id = '';
        var columns = [];
        var sceneContainer = $("#" + self.panelId);
        if (sceneContainer.length > 0) {
            var height = 0;
            var width = sceneContainer.width();
            var colCount = self.getInt(width / minWidth);
            for (var i = 0; i < colCount; i++) {
                columns.push({ row: 0, col: i });
            }
            self.targets.sort(function (a, b) {
                if (a.initIndex > b.initIndex)
                    return 1;
                else if (a.initIndex < b.initIndex)
                    return -1;
                return 0;
            });
            for (var i = 0; i < self.targets.length; i++) {
                var col = self.getInt(self.targets[i].posLeft / minWidth);
                var row = self.getInt(self.targets[i].posTop / minWidth);
                var colCount = self.getInt(self.targets[i].width() / minWidth);
                var rowCount = self.getInt(self.targets[i].height() / minHeight);

                var pos = self.getLeftTopPos(columns, col, row, colCount, rowCount);
                console.log(self.targets[i].Id() + ' pos=' + JSON.stringify(pos));

                self.targets[i].col = pos.col;
                self.targets[i].row = pos.row;
                self.targets[i].colCount = colCount;
                self.targets[i].rowCount = rowCount;

                var container = $('#' + self.targets[i].Id());
                if (container.length > 0) {
                    var top = pos.row * (minHeight + margin);
                    var h = top + self.targets[i].initHeight;
                    if (h > height)
                        height = h;
                    if (self.targets[i].Id() != id) {
                        d3.select('#' + self.targets[i].Id()).transition().duration(50)
                            .style('top', top + 'px')
                            .style('left', (pos.col * (minWidth + margin)) + 'px');
                        //container.css('top', top + 'px');
                        //container.css('left', (pos.col * (minWidth + margin)) + 'px');
                    }
                }
            }
            sceneContainer.height(height + 'px');
        }
        console.log('columns=' + JSON.stringify(columns));
        console.log('end');
    }, 50);
};

self.getLeftTopPos = function (columns, col, row, colCount, rowCount) {
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

self.onLeftTopChartPositionChange = function (data) {
    var currDimension = data.item;
    var index = currDimension.initIndex;
    var left = data.left;
    var top = data.top;

    var col = self.getInt(left / minWidth);
    var row = self.getInt(top / minWidth);

    if (currDimension.col == col && currDimension.row == row)
        return;

    var colCount = self.getInt(currDimension.initWidth / minWidth);
    var rowCount = self.getInt(currDimension.initHeight / minHeight);

    console.log('col=' + col + ' row=' + row);

    self.targets.sort(function (a, b) {
        if (a.initIndex > b.initIndex)
            return 1;
        else if (a.initIndex < b.initIndex)
            return -1;
        return 0;
    });
    var moveIndex = -1;
    for (var i = 0; i < self.targets.length; i++) {
        if (self.targets[i].col <= col && col < self.targets[i].col + self.targets[i].colCount && self.targets[i].row <= row && row < self.targets[i].row + self.targets[i].rowCount) {
            moveIndex = self.targets[i].initIndex;
            console.log(self.targets[i].Id() + ' item colcount=' + self.targets[i].colCount + '  rowcount=' + self.targets[i].rowCount);
            break;
        }
    }
    if (moveIndex < 0)
        moveIndex = self.targets.length - 1;
    if (moveIndex < index) {
        for (var i = 0; i < self.targets.length - 1; i++) {
            if (self.targets[i].initIndex >= moveIndex && self.targets[i].initIndex <= index) {
                self.targets[i].initIndex = self.targets[i + 1].initIndex;
            }
        }
    }
    else {
        for (var i = self.targets.length - 1; i > 0; i--) {
            if (self.targets[i].initIndex >= index && self.targets[i].initIndex <= moveIndex) {
                self.targets[i].initIndex = self.targets[i - 1].initIndex;
            }
        }
    }
    console.log('moveIndex=' + moveIndex);
    currDimension.initIndex = moveIndex;
    self.updateLeftTopLayout(data.id);
};

self.LeftTopInitPositioning = function (target) {
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
                        console.log(target.Id() + ' left=' + target.posLeft + ' top=' + target.posTop);
                        self.onLeftTopChartPositionChange({ id: target.Id(), item: target, left: target.posLeft, top: target.posTop });
                    }
                }
            })
            .on("dragstart", function () {
                var container = $('#' + target.Id());
                if (container.length > 0) {
                    target.startLeft = parseFloat(container.css('left').replace('px', ''));
                    target.startTop = parseFloat(container.css('top').replace('px', ''));
                }
                target.startX = d3.event.sourceEvent.pageX;
                target.startY = d3.event.sourceEvent.pageY;
                d3.event.sourceEvent.stopPropagation();
            })
            .on("dragend", function () {
                var container = $('#' + target.Id());
                if (container.length > 0) {
                    target.posLeft = Math.round(target.posLeft / minWidth) * (minWidth + margin);
                    target.posTop = Math.round(target.posTop / minHeight) * (minHeight + margin);
                    if (target.posTop >= 0 && target.posLeft >= 0) {
                        container.css('top', target.posTop + 'px');
                        container.css('left', target.posLeft + 'px');
                        //console.log('dragend ' + target.Id() + ' left=' + target.posLeft + ' top=' + target.posTop);
                    }
                    self.onLeftTopChartPositionChange({ id: target.Id(), item: target, left: target.posLeft, top: target.posTop });
                }
            });
        draggable.call(drag)
    }
    if (self.LeftTopInitResizeCorner != undefined)
        self.LeftTopInitResizeCorner(target);
};

self.LeftTopInitResizeCorner = function (target) {
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
                    heightBorder.height(newHeight + 'px');
                    heightBorder.css('left', newWidth + 'px');
                    target.resizeWidth = newWidth;
                    target.resizeHeight = newHeight - 100;
                }
            })
            .on("dragstart", function () {
                d3.event.sourceEvent.stopPropagation();
            })
            .on("dragend", function () {
                var wCount = Math.round(target.resizeWidth / minWidth);
                var hCount = Math.round(target.resizeHeight / minHeight);
                target.resizeWidth = wCount * minWidth + (wCount - 1) * margin;
                target.resizeHeight = hCount * minHeight + (hCount - 1) * margin;
                if (target.resizeWidth > 0 && target.resizeHeight > 0) {
                    target.initWidth = target.resizeWidth;
                    target.initHeight = target.resizeHeight;
                    target.width(target.initWidth * scale);
                    target.height(target.initHeight * scale);
                    console.log('resize colcount=' + target.colCount + '  rowcount=' + target.rowCount);
                    target.colCount = wCount;
                    target.rowCount = hCount;

                    console.log('resize colcount=' + target.colCount + '  rowcount=' + target.rowCount);

                    var widthBorder = $('#' + target.Id() + ' .tile-resize-width');
                    var heightBorder = $('#' + target.Id() + ' .tile-resize-height');
                    widthBorder.width('0px');
                    heightBorder.height('0px');
                    self.updateLeftTopLayout(target.Id());
                }
            });
        draggable.call(drag)
    }
};
