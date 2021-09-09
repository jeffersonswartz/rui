var devMode = false;
var sortableArray = [];
var viewList = ['1'];
var noOfViews = 1;
var currentView = 1;
var viewJson = {};
var previewFlag = false;
var categories = {
    'Native Basic': "_COMPONENT"
};
var incval = 0;
var ruiJson = {};
var allComponentsList = [];
var defaultviewJson = {
    "panels": [],
    "order": [],
    "defaultHeight": 300,
    "defaultWidth": 350,
    "height": [],
    "width": [],
    "panelVisibility": [],
    "direction": [],
    "scroll": [],
    "tempComponents": []
};
var dashBoardJSON = { 
    'new': {
        name: 'New Dashboard',
        nameResolution: 'NEW',
        file: 'RUI.zip',
        views: 0
    }
};
var allComponents = {
    '': {
        name: 'None',
        value: '',
        nameResolution: '',
        count: 0
    } 
};
if (!devMode) {
    allComponents = {
        '': {
            name: 'None',
            value: '',
            nameResolution: '',
            count: 0
        } 
    };
}
var cell1 = 50;
var cell2 = 50;
var selectOptions = '';
for (var key in allComponents) {
    selectOptions += '<option value="' + key + '">' + allComponents[key].name + '</option>';
    if (key == "com_visualbi_utilities_advancedlabel") key = "com_visualbi_utilities_CustomLabel";
    sortableArray.push(key);
}
sortableArray.sort();
var option = "<div class='option'><div id='vertical' class='button' title='Add cell vertically'><span class='mif-chevron-thin-right'></span></div><div id='horizontal' class='button' title='Add cell horizontally'><span class='mif-chevron-thin-down'></span></div><div id='close' class='button' title='Delete Cell'><span class='mif-cancel'></span></div><div><select>" + selectOptions + "</select></div></div>";
var cellJSON = {
    "horizontal": "<div style='width:100%;height:$cell1%;'class='cell horizontal'><div  class='cellsort'></div><div class='dimensions'>H:50%,W:50%</div>" +
        option + "<div class='split-cell horizontal'></div>" +
        "</div><div style='width:100%;height:$cell1-%;'class='cell horizontal'><div  class='cellsort'></div><div class='dimensions'>H:50%,W:50%</div>" +
        option + "</div>",
    "vertical": "<div class='cell vertical' style='width:$cell2%;height:100%;float:left'><div  class='cellsort'></div><div class='dimensions'>H:50%,W:50%</div>" +
        option + "<div class='split-cell vertical'></div>" +
        "</div><div class='cell vertical' style='width:$cell2-%;height:100%;float:left'><div  class='cellsort'></div><div class='dimensions'>H:50%,W:50%</div>" +
        option + "</div>"
};

function createCell(option, element) {
    if (option === "" || option === undefined)
        return "";
    else if (option == "close") {
        var parent = $(element).parent().closest('.cell');

        var sibiling;

        parent.children('.cell').addClass('remove');
        $(element).find('>.split-cell').remove();
        if (!parent.hasClass('root')) {
            if (element.previousElementSibling) {
                sibiling = $(element.previousElementSibling);
            } else {
                sibiling = $(element.nextElementSibling);
            }
            sibiling.find('>.split-cell').remove();
            sibiling.children().prependTo(parent);

        } else {
            $(element).find('.option').appendTo(parent);
        }

        parent.children('.cell.remove').remove();
        setDimension();
        checkSroll(currentView);
        if ($('.option').length < 2) {
            $('#close').hide();
        } else {
            $('#close').show();
        }
    } else {

        var g = $(element).find(".option");
        if (g.length === 0) {
            $(element).html(cellJSON[option].replace('$cell1-', 100 - cell2).replace('$cell2-', 100 - cell1).replace('$cell1', cell2).replace('$cell2', cell1));


        } else {
            $(element).find('.cellsort').remove();
            $(element).find('.dimensions').remove();

            g.after(cellJSON[option].replace('$cell1-', 100 - cell2).replace('$cell2-', 100 - cell1).replace('$cell1', cell2).replace('$cell2', cell1));

            g.remove();
        }

        $(".cellsort").sortable({
            connectWith: ".cellsort",
            receive: function(event, ui) {
                initializeList();


                type = $(this).parent().find('.listValue').attr('value');
                $(this).parent().find('.option').find('select').val(type);
                $(this).find('.listValue').remove();
                $(this).html('<h4>' + allComponents[type].name + '</h4>');
                $(this).addClass('cellactive');
            },
            over: function(event, ui) {
                $(this).addClass('cellhover');
            },
            out: function(event, ui) {
                $(this).removeClass('cellhover');
            }
        });

        $(element).find('.option').find('div').click(
            function() {
                createCell(this.id, this.parentNode.parentNode);
            });
        setDimension();
        checkSroll(currentView);
    }

}

/*
 * Algorithm to parse the structure to Responsive UI
 */
var componentCountRef = 0,
    componentsList = [];
var createRuiJson = function(viewName, element, parentHeight, parentWidth) {
    if (parentHeight === undefined)
        parentHeight = 100;
    if (parentWidth === undefined)
        parentWidth = 100;

    var children;
    if (element !== undefined) {
        children = element.children('.cell');
        for (var i = 0, iLimit = children.length; i < iLimit; ++i) {
            var tempWidth = parseFloat(children[i].style.width.replace('%', '')) * (parentWidth / 100);
            var tempHeight = parseFloat(children[i].style.height.replace('%', '')) * (parentHeight / 100);
            if ($(children[i]).children('.cell').length !== 0) {
                createRuiJson(viewName, $(children[i]), tempHeight, tempWidth);
            } else {
                var placeComponent = $(children[i]).find('>.option select').val();
                if (placeComponent.length !== 0) {
                    ++allComponents[placeComponent].count;
                    if ('extension' in allComponents[placeComponent]) {
                        viewJson[viewName].panels.push([allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + allComponents[placeComponent].extension]);
                        viewJson[viewName].tempComponents.push(allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + allComponents[placeComponent].extension);
                        allComponentsList.push(allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + allComponents[placeComponent].extension);
                    } else {
                        viewJson[viewName].panels.push([allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + '_control']);

                        viewJson[viewName].tempComponents.push(allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + '_control');
                        allComponentsList.push(allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count + '_control');
                    }
                    viewJson[viewName].width.push(Math.round(tempWidth * 10) / 10 + "%");
                    viewJson[viewName].height.push(Math.round(tempHeight * 10) / 10 + "%");
                    viewJson[viewName].panelVisibility.push(null);
                    componentsList.push({
                        name: allComponents[placeComponent].nameResolution + '_' + allComponents[placeComponent].count,
                        type: placeComponent
                    });

                }
            }
        }

    }
    return;
};
 
function createPreview(viewName, element, parentHeight, parentWidth) {
    if (parentHeight === undefined)
        parentHeight = 100;
    if (parentWidth === undefined)
        parentWidth = 100;
    var children;
    if (element !== undefined) {
        children = element.children('.cell');

        for (var i = 0, iLimit = children.length; i < iLimit; ++i) {
            var tempWidth = parseFloat(children[i].style.width.replace('%', '')) * (parentWidth / 100);
            var tempHeight = parseFloat(children[i].style.height.replace('%', '')) * (parentHeight / 100);
            if ($(children[i]).children('.cell').length !== 0) {
                createPreview(viewName, $(children[i]), tempHeight, tempWidth);
            } else {

                var compName = allComponents[$(children[i]).find('>.option select').val()].name;
                var chartType = allComponents[$(children[i]).find('>.option select').val()].nameResolution.toLowerCase();
                var chartDrawMethod = "NA";
                $("#view_" + viewName + '_contentpreview .prop-kpilayout-preview').css("width", "100%");
                $("#view_" + viewName + '_contentpreview .prop-kpilayout-preview').append("<div class='previewcell cellactive' id='document" + incval + "' style='height:" + (Math.floor(tempHeight)) + "%;width:" + (Math.floor(tempWidth)) + "%'><h4>" + compName + "</h4><div>");
                if (chartType === "areachart") {
                    chartType = "area";
                    chartDrawMethod = "common";
                } else if (chartType === "chartcontainer" || chartType === "linechart") {
                    chartType = "line";
                    chartDrawMethod = "common";
                } else if (chartType === "columnbarchart" || chartType === "columnbarchartnew" || chartType == "columnbardrilldownchart") {
                    chartType = "column";
                    chartDrawMethod = "common";
                } else if (chartType === "funnelpyramidchart" || chartType === "funnelpyramiddrilldownchart") {
                    chartType = "funnel";
                    chartDrawMethod = "common";
                } else if (chartType === "piechart" || chartType === "piedrilldownchart") {
                    chartType = "pie";
                    chartDrawMethod = "common";
                } else if (chartType === "scatterchart") {
                    chartType = "scatter";
                    chartDrawMethod = "common";
                } else if (chartType === "waterfallchart") {
                    chartType = "waterfall";
                    chartDrawMethod = "common";
                }
                var currentPath = $("#view_" + viewName + '_contentpreview .prop-kpilayout-preview');
                //              $("#document"+incval).css('width',(Math.floor((currentPath.actual('width')/100)*tempWidth))-10);
                //   $("#document"+incval).css('height',(Math.floor((currentPath.actual('height')/100)*tempHeight))-10);
                incval = incval + 1;
            }
        }

    }

    return;
}

function setDimension(element, parentHeight, parentWidth) {
    if (element === undefined)
        element = $('#view_' + currentView + '_content .prop-kpilayout');
    if (parentHeight === undefined)
        parentHeight = 100;
    if (parentWidth === undefined)
        parentWidth = 100;


    var children;
    if (element !== undefined) {
        children = element.children('.cell');
        if (children.length === 0) {
            element.find('#close').hide();
            element.find('.dimensions').html("W:100%<br>H:100%");
        }
        for (var i = 0, iLimit = children.length; i < iLimit; ++i) {
            var tempWidth = parseFloat(children[i].style.width.replace('%', '')) * (parentWidth / 100);
            var tempHeight = parseFloat(children[i].style.height.replace('%', '')) * (parentHeight / 100);
            if ($(children[i]).children('.cell').length !== 0) {
                setDimension($(children[i]), tempHeight, tempWidth);
            } else {
                $(children[i]).find('.dimensions').html('W:' + Math.round(tempWidth * 10) / 10 + '%<br>H:' + Math.round(tempHeight * 10000) / 10000 + '%');
            }

        }

        return;
    }
}
 

function bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
        // standard way
        el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
        // old IE
        el.attachEvent('on' + eventName, eventHandler);
    }
} 


/*
 * Algorithms to create splitting of panels
 */
var currentX,
    currentY;

var mouseDownHandler = function(e, isHorizontal) {
    e.preventDefault();
    e.stopPropagation();

    currentX = e.pageX;
    currentY = e.pageY;

    $(document).on('mousemove', createMouseMoveHandler(this, isHorizontal));
    $(document).on('mouseup', function(e) {
        $(document).unbind('mousemove');

    });

};

var createMouseMoveHandler = function(element, isHorizontal) {
    if (isHorizontal) {
        return function(e) {
            e.preventDefault();
            mouseMoveHorizontalHandler.call(element, e, element.parentNode.nextElementSibling, $(element.parentNode.parentNode).height());
        };
    } else {
        return function(e) {
            e.preventDefault();
            mouseMoveVerticalHandler.call(element, e, element.parentNode.nextElementSibling, $(element.parentNode.parentNode).width());
        };
    }

};

var mouseMoveHorizontalHandler = function(e, sibilingElement, totalBound) {

    var offset = e.pageY - currentY;
    var boundValue;
    var percentage;

    boundValue = $(this.parentNode).outerHeight();

    boundValue += offset;
    boundValue = (boundValue * 100) / totalBound;

    boundValue > 100 ? boundValue = 100 : false;

    sibilingBoundValue = 100 - boundValue;

    this.parentNode.style.height = boundValue + '%';
    sibilingElement.style.height = sibilingBoundValue + '%';

    setDimension();
    currentX = e.pageX;
    currentY = e.pageY;

};

var mouseMoveVerticalHandler = function(e, sibilingElement, totalBound) {

    var offset = e.pageX - currentX;
    var boundValue;

    boundValue = $(this.parentNode).outerWidth();

    boundValue += offset;
    boundValue = (boundValue * 100) / totalBound;

    boundValue > 100 ? boundValue = 100 : false;

    sibilingBoundValue = 100 - boundValue;

    this.parentNode.style.width = boundValue + '%';
    sibilingElement.style.width = sibilingBoundValue + '%';

    setDimension();
    currentX = e.pageX;
    currentY = e.pageY;

};

$('#view_1_content .prop-kpilayout').on('mousedown', '.split-cell.horizontal', function(e) {
    mouseDownHandler.call(this, e, true);


});
$('#view_1_content .prop-kpilayout').on('mousedown', '.split-cell.vertical', function(e) {
    mouseDownHandler.call(this, e, false);



});

$('#new_tab').click(function(event) {
    noOfViews++;
    viewList.push("" + noOfViews);
    viewId = 'view_' + noOfViews + '_content';
    $('<li id="view_' + noOfViews + '" tabnumber="' + noOfViews + '"><a href="#' + viewId + '">VIEW_' + noOfViews + '</a><span class="mif-cancel" onclick="deleteTab(\'' + noOfViews + '\')" ></span></li>').insertBefore('#new_tab');
    $('#editview .tabs-content').append('<div class="tab-panel" id="' + viewId + '"><div class="prop-kpilayout" class="cell"></div></div>');

    $('<li id="view_' + noOfViews + 'preview" ><a href="#' + viewId + 'preview">VIEW_' + noOfViews + '</a><span class="mif-cancel" style="opacity:0"></span></li>').insertBefore('#new_tab_preview');
    $('#preview .tabs-content').append('<div class="tab-panel" id="' + viewId + 'preview"><div class="prop-kpilayout-preview"></div></div>');


    createCell('horizontal', $("#" + viewId + " .prop-kpilayout"));
    $('#' + viewId + ' .prop-kpilayout').on('mousedown', '.split-cell.horizontal', function(e) {
        mouseDownHandler.call(this, e, true);
    });
    $('#' + viewId + ' .prop-kpilayout').on('mousedown', '.split-cell.vertical', function(e) {
        mouseDownHandler.call(this, e, false);
    });
    $('#' + viewId + ' .prop-kpilayout').addClass('cell');
    $('#view_' + noOfViews).click(function() {
        currentView = $(this).attr('tabnumber');
        $('.previewText').removeClass('red');
        checkSroll(currentView);
    });
    $('#view_' + noOfViews + ' a').click();

    return false;
});

function deleteTab(tabNumber) {

    var index = viewList.indexOf(tabNumber);
    if (index > -1 && viewList.length > 1) {
        viewList.splice(index, 1);
        if (currentView == tabNumber) {
            if ((index + 1) <= viewList.length) {
                $('#view_' + viewList[index] + ' a').click();
            } else {
                $('#view_' + viewList[index - 1] + ' a').click();
            }
        }

        var viewId = '#view_' + tabNumber;
        $(viewId).remove();
        $(viewId + '_content').remove();
        $(viewId + 'preview').remove();
        $(viewId + '_contentpreview').remove();
    }
}

function initializeList() { 
    $('.listview').empty();
    jQuery.each(categories, function(chartcat, catval) {
        var listGroup = $('<div class="list-group"><span class="list-group-toggle">' + chartcat + '</span><div class="list-group-content"><ul class="cellsort cell"></ul></div></div>');
        jQuery.each(sortableArray, function(index, key) {
            if (key == "com_visualbi_utilities_CustomLabel") key = "com_visualbi_utilities_advancedlabel";
            var val = allComponents[key];

            if (key.indexOf(catval) > -1 && val.name.replace(/ /g, '').toLowerCase().indexOf(searchtxt) > -1) {

                listGroup.find('ul').append('<li class="listValue" value="' + key + '"><img src="icons/' + val.name.replace(/ /g, '') + '_16.png"></img> ' + val.name + '</li>');
            }
        });
        $('.listview').append(listGroup);

    });
    $(".listview ul").sortable({
        connectWith: ".cellsort"
    });
}

initializeList();
$('#view_1').click(function() {

    currentView = 1;
    $('.previewText').removeClass('red');
    checkSroll(1);
});
(function($) {
    $.fn.hasScrollBar = function() {
        var temp;
        if (this.is(':visible')) {
            temp = this.get(0).scrollHeight > this.height();
        } else {
            this.parent().show();
            if(this.get(0)) temp = this.get(0).scrollHeight > this.height();
            this.parent().hide();
        }

        return temp;

    };
})(jQuery);

function checkSroll(view) {
    $("#preview").show();
    $("#view_" + view + '_contentpreview .prop-kpilayout-preview').empty();
    createPreview(view, $('#view_' + view + '_content .prop-kpilayout'));
    if ($('#view_' + view + '_contentpreview .prop-kpilayout-preview').hasScrollBar()) {
        if (!$('.previewText').hasClass('red')) {
            $('.previewText').addClass('red');
            $.Notify({
                caption: 'Complex Arrangement !',
                content: 'This arrangement cannot be reproduced in RUI. Please check the preview.',
                type: 'warning',
                timeout: 5000
            });
        }
    } else {
        $('.previewText').removeClass('red');
    }
    $("#preview").hide();
}

function createDashboard(name) {
    for (i = 2; i <= dashBoardJSON[name].views; i++) {
        $('#new_tab').click();
    }
    $('#view_1 a').click();
    noOfViews = dashBoardJSON[name].views;
    if (name == "capex") {
        cell1 = 66.6;
        cell2 = 33.2;
        $(".mif-chevron-thin-right").click();
        cell1 = 50;
        cell2 = 50;
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 2) {
                obj.click()
            }
        });
        $('.mif-cancel').each(function(i, obj) {
            if (i == 10 || i == 11 || i == 12 || i == 14 || i == 15 || i == 16 || i == 18 || i == 19 || i == 20) {
                obj.click()
            }
        });
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 6) {
                obj.click()
            }
        });
        $('.cell.vertical>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4 || i == 5 || i == 6 || i == 7) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_ColumnBarChartNew");
                $(obj).append('<h4>Column Bar Chart New</h4>');
                $(obj).addClass('cellactive');
            }
        });
        $('.prop-kpilayout.cell>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_utilities_Table");
                $(obj).append('<h4>Table</h4>');
                $(obj).addClass('cellactive');
            }
            if (i == 1) {
                $(obj).parent().find('.option').find('select').val("PANEL_COMPONENT");
                $(obj).append('<h4>Panel</h4>');
                $(obj).addClass('cellactive');
            }
        });
    } else if (name == "rigfleet") {
        $('.mif-cancel').each(function(i, obj) {
            if (i == 3) {
                obj.click();
            }
        });
        cell1 = 33.4;
        cell2 = 66.6;
        $('.mif-chevron-thin-down').click();
        cell1 = 50;
        cell2 = 50;
        $(".mif-chevron-thin-right").click();
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 2 || i == 3) {
                obj.click()
            }
        });
        $('.mif-cancel').each(function(i, obj) {
            if (i == 9 || i == 10 || i == 11 || i == 12 || i == 13 || i == 14 || i == 15) {
                obj.click()
            }
        });
        $('.cell.vertical>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0 || i == 1) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_maps_LocationAnalyzer");
                $(obj).append('<h4>Location Analyzer</h4>');
                $(obj).addClass('cellactive');
            }
            if (i == 2 || i == 3 || i == 4 || i == 5) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_ColumnBarChartNew");
                $(obj).append('<h4>Column Bar Chart New</h4>');
                $(obj).addClass('cellactive');
            }
        });
        $('.prop-kpilayout.cell>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0) {
                $(obj).parent().find('.option').find('select').val("PANEL_COMPONENT");
                $(obj).append('<h4>Panel</h4>');
                $(obj).addClass('cellactive');
            }
        });
    } else if (name == "netsales") {
        cell1 = 66.6;
        cell2 = 33.4;
        $(".mif-chevron-thin-right").click();
        cell1 = 50;
        cell2 = 50;
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 0 || i == 2) {
                obj.click()
            }
        });
        $('.cell.vertical>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0 || i == 1 || i == 2) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_CircularCounter");
                $(obj).append('<h4>Circular Counter</h4>');
                $(obj).addClass('cellactive');
            }
            if (i == 3 || i == 4 || i == 5) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_BulletChart");
                $(obj).append('<h4>Bullet Chart</h4>');
                $(obj).addClass('cellactive');
            }
        });
    } else if (name == "labour") {
        $('.mif-cancel').each(function(i, obj) {
            if (i == 1) {
                obj.click();
            }
        });
        cell1 = 25;
        cell2 = 75;
        $('.mif-chevron-thin-down').click();
        cell1 = 60;
        cell2 = 40;
        $('.mif-chevron-thin-down').each(function(i, obj) {
            if (i == 0) {
                obj.click();
            }
        });
        cell1 = 25;
        cell2 = 75;
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 0) {
                obj.click()
            }
        });
        cell1 = 50;
        cell2 = 50;
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 1) {
                obj.click()
            }
        });
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 1) {
                obj.click()
            }
        });
        $('.mif-chevron-thin-right').each(function(i, obj) {
            if (i == 3) {
                obj.click()
            }
        });
        $('.cell.vertical>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_selectors_PeriodSelectorYQM");
                $(obj).append('<h4>Period Selector YQM</h4>');
                $(obj).addClass('cellactive');
            }
            if (i == 1 || i == 2 || i == 3 || i == 4) {
                $(obj).parent().find('.option').find('select').val("LISTBOX_COMPONENT");
                $(obj).append('<h4>List Box</h4>');
                $(obj).addClass('cellactive');
            }
            if (i == 5 || i == 6) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_GroupStackedColumnBarChart");
                $(obj).append('<h4>Stacked Column Bar Chart</h4>');
                $(obj).addClass('cellactive');
            }
        });
        $('.cell.horizontal>.cellsort.ui-sortable').each(function(i, obj) {
            if (i == 0 || i == 1) {
                $(obj).parent().find('.option').find('select').val("com_visualbi_charts_GroupStackedColumnBarChart");
                $(obj).append('<h4>Stacked Column Bar Chart</h4>');
                $(obj).addClass('cellactive');
            }
        });
    }
}
