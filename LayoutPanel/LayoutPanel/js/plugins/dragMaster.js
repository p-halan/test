function DragObject(element, containerId, data, dragContent, targetKeys) {
    element.dragObject = this
    this.containerId = containerId;
    this.data = data;
    this.targetKeys = targetKeys;
    this.x = 0;
    this.y = 0;

    dragMaster.makeDraggable(element)

    var clone
    var rememberPosition
    var mouseOffset

    this.onDragStart = function (offset) {
        var s = element.style
        rememberPosition = { top: s.top, left: s.left, position: s.position }

        clone = document.createElement('div')
        clone.className = 'dragdropclone'
        clone.id = element.id + '-clone';
        clone.innerHTML = dragContent;

        var cloneS = clone.style;
        cloneS.position = 'absolute';
        cloneS.zIndex = 10000;
        document.getElementById(this.containerId).appendChild(clone);
        mouseOffset = offset
    }

    this.hide = function () {
        clone.style.display = 'none'
    }

    this.show = function () {
        clone.style.display = ''
    }

    this.setCursor = function (cursorType) {
        if (clone && clone != null)
            clone.style.cursor = cursorType;
    }

    this.onDragMove = function (x, y) {
        this.x = x - clone.clientWidth / 2;
        this.y = y - clone.clientHeight / 2;
        clone.style.top = this.y + 'px'
        clone.style.left = this.x + 'px'
    }

    this.onDragSuccess = function (dropTarget) {
        document.getElementById(this.containerId).removeChild(clone);
    }


    this.onDragFail = function () {
        document.getElementById(this.containerId).removeChild(clone);
    }

    this.toString = function () {
        return element.id
    }
}

function DropTarget(elements, targetKey, dropenterClass, dropleaveClass, _dropCallback) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].dropTarget = this;
        elements[i].className = dropleaveClass;
    }
    this.targetKey = targetKey;
    this.dropCallback = _dropCallback;

    this.canAccept = function (dragObject) {
        if (dragObject && dragObject.targetKeys) {
            for (var i = 0; i < dragObject.targetKeys.length; i++) {
                if (dragObject.targetKeys[i] == this.targetKey) {
                    dragObject.setCursor('pointer');
                    return true;
                }
            }
            dragObject.setCursor('not-allowed');
        }
        return false;
    }

    this.accept = function (dragObject) {
        this.onLeave()

        dragObject.hide()
        if (this.dropCallback && elements != null && elements.length > 0)
            this.dropCallback({ dropItem: elements[0], dragItem: dragObject, targetKey: this.targetKey });
    }

    this.onLeave = function () {
        if (elements != null) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].className = dropleaveClass;
            }
        }
    }

    this.onEnter = function () {
        if (elements != null) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].className = dropenterClass;
            }
        }
    }

    this.toString = function () {
        if (elements != null && elements.length > 0)
            return elements[0].id
        return '';
    }
}

var dragMaster = (function () {
    var parentOffset = 0;
    var dragObject
    var mouseDownAt

    var currentDropTarget


    function mouseDown(e) {
        e = fixEvent(e)
        if (e.which != 1) return

        mouseDownAt = { x: e.pageX, y: e.pageY, element: this }

        addDocumentEventHandlers()

        return false
    }


    function mouseMove(e) {
        e = fixEvent(e)
        if (mouseDownAt) {
            if (Math.abs(mouseDownAt.x - e.pageX) < 5 && Math.abs(mouseDownAt.y - e.pageY) < 5) {
                return false
            }
            var elem = mouseDownAt.element
            dragObject = elem.dragObject

            var mouseOffset = getMouseOffset(elem, mouseDownAt.x, mouseDownAt.y)
            mouseDownAt = null

            dragObject.onDragStart(mouseOffset)
            parentOffset = e.pageY - $(elem).offset().top;
        }
        dragObject.onDragMove(e.pageX, e.pageY - parentOffset)

        var newTarget = getCurrentTarget(e)

        if (currentDropTarget != newTarget) {
            if (currentDropTarget) {
                currentDropTarget.onLeave()
            }
            if (newTarget) {
                newTarget.onEnter()
            }
            currentDropTarget = newTarget

        }

        return false
    }


    function mouseUp() {
        if (!dragObject) {
            mouseDownAt = null
        } else {
            if (currentDropTarget) {
                currentDropTarget.accept(dragObject)
                dragObject.onDragSuccess(currentDropTarget)
            } else {
                dragObject.onDragFail()
            }

            dragObject = null
        }
        removeDocumentEventHandlers()
    }


    function getMouseOffset(target, x, y) {
        var docPos = getOffset(target)
        return { x: x - docPos.left, y: y - docPos.top }
    }


    function getCurrentTarget(e) {

        if (navigator.userAgent.match('MSIE') || navigator.userAgent.match('Gecko')) {
            var x = e.clientX, y = e.clientY
        } else {
            var x = e.pageX, y = e.pageY
        }
        dragObject.hide()
        var elem = document.elementFromPoint(x, y)
        dragObject.show()

        while (elem) {
            if (elem.dropTarget && elem.dropTarget.canAccept(dragObject)) {

                return elem.dropTarget
            }
            elem = elem.parentNode

        }
        return null
    }


    function addDocumentEventHandlers() {
        document.onmousemove = mouseMove
        document.onmouseup = mouseUp
        document.ondragstart = document.body.onselectstart = function () { return false }
    }
    function removeDocumentEventHandlers() {
        document.onmousemove = document.onmouseup = document.ondragstart = document.body.onselectstart = null
    }
    return {
        makeDraggable: function (element) {
            element.onmousedown = mouseDown
        }
    }
}());

function fixEvent(e) {
    e = e || window.event
    if (e.pageX == null && e.clientX != null) {
        var html = document.documentElement
        var body = document.body
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0)
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0)
    }
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0))
    }
    return e
}

function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        return getOffsetRect(elem)
    } else {
        return getOffsetSum(elem)
    }
}

function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect()
    var body = document.body
    var docElem = document.documentElement

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0
    var top = box.top + scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft
    return { top: Math.round(top), left: Math.round(left) }
}

function getOffsetSum(elem) {
    var top = 0, left = 0
    while (elem) {
        top = top + parseInt(elem.offsetTop)
        left = left + parseInt(elem.offsetLeft)
        elem = elem.offsetParent
    }

    return { top: top, left: left }
}