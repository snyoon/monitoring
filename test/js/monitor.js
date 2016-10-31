processWidth = document.body.clientWidth
var testOut;
var fileTest;
var inputData;
var ganttData;
var chart;
var sortedTimes = [];
var clickedElement;
var productInfo = {};
var decisionInfo = {};
var boolSelected;

var openFile = function (event) {
    d3.selectAll('svg').remove();
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;
        var node = document.getElementById('output');
        testOut = reader.result;
        inputData = JSON.parse(testOut)
        var index = 0;
        ganttData = inputData['Gantt']
        productInfo = inputData['Product']
        decisionInfo = inputData['Decision']      
        timelineHover(traveledTime);
        for (var i = 0; i < ganttData.length; i++) {
            var tempLabel = ganttData[i]['label'];
            var tempTimes = ganttData[i]['times']
            for (var j = 0; j < tempTimes.length; j++) {
                sortedTimes.push(tempTimes[j])
            }
        }
        sortedTimes.sort(function (a, b) {
            return a.starting_time < b.starting_time ? -1 : a.starting_time > b.starting_time ? 1 : 0;
        })
    };
    reader.readAsText(input.files[0]);
};

var xScale;
var yScale;
var colorCycle = {};

var testSvg;

var margin = {
        left: 80
        , right: 30
        , top: 10
        , bottom: 70
    }
    , itemHeight = 20
    , itemMargin = 5
    , itemWidth = 80
    , timeHorizon = 90000;
var statusColorMap = {
        'proc': '4FB81C'
        , 'idle': 'F0AB00'
        , 'setup': 'C2C2C2'
        , 'down': 'FF0000'
    }

var traveledTime = timeHorizon;
var moveToX;
var moveToY;


// Right side expand and Bottom expand
var menuRight = document.getElementById( 'right' ),
    menuBottom = document.getElementById( 'attribute' ),
    showRightPush = document.getElementById( 'showRight' ),
    body = document.body;
var showBottom;


 showRightPush.onclick = function() {
				classie.toggle( this, 'active' );
				classie.toggle( menuRight, 'cbp-spmenu-open' );
//				disableOther( 'showRight' );
			};
 function disableOther( button ) {
				if( button !== 'showRight' ) {
//                    d3.selectAll('#showRight')
//					classie.toggle( showRightPush, 'disabled' );
				}
                if( button !== 'showBottom' ) {
//					classie.toggle( showBottom, 'disabled' );
				}
			}

function timelineHover(traveledTime) {
    chart = d3.timeline().width(processWidth).stack().margin(margin)
        .traveledTime(traveledTime).showTimeAxisTick().hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            if (d.starting_time > traveledTime) return;
        }).click(function (d, i, datum) {
            var selectedLotId = d.lotId;
            if(d.lotId.indexOf(clickedElement) > -1 && boolSelected == true){
                 var rects = d3.selectAll('.operationRect')
                 rects.style("fill", function (d, i) { return colorCycle[d.productId];})   
                 d3.selectAll('#attribute').classed('cbp-spmenu-open', false)
                 boolSelected = false;
             }
             else if(d.lotId != clickedElement && boolSelected == true){

             }
             else{
                d3.selectAll('#'+selectedLotId)
                classie.toggle( menuBottom, 'cbp-spmenu-open' );
                displayAttribute(d, datum)
                selectLots(selectedLotId)
                clickedElement = d.lotId.substring(0, d.lotId.indexOf('_'))
                boolSelected = true;
                displayDecisions(d)                
            }
        })
    var svg = d3.select("#process").append("svg").attr("width", processWidth);
    svg.datum(ganttData).call(chart);
    
    xScale = chart.exportXScale();
    yScale = chart.exportYScale();
    colorCycle = chart.exportColorCycle();
    d3.select('.operations').data([ganttData]).exit().remove();
    
}


// Time Travel
d3.select('#timeButton').on('click', function(){
    time = document.getElementById("traveledTime").value;
    
    var index = 0;
    for(var i = 0; i < sortedTimes.length; i++){
        var tempObject = sortedTimes[i]
        if(time > tempObject.starting_time) index = i;
        else break;
    }
    
    var element = d3.select('#event_'+index);
    var x = element.attr('x')
    var y = element.attr('y')
    
    console.log(d3.select('svg'))
    var svg = d3.select('svg')
    svg.call()
    
    svg.attr('transform', 'translate(' +x+','+y +')')
    //reDraw(time);
    
});

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}


// ------------------------------------- Attribute View ------------------------------------------------
function displayAttribute(d, datum){    
    $('#lotViewer')
        .html('<strong style="font-family:Sans-serif;">' +'Lot Id: '+ d.lotId + '<br>' + '</strong>' 
             +'<strong style="font-family:Sans-serif;">' +'Quantity: '+ d.quantity + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Processing Time: '+ (d.ending_time-d.starting_time) + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Operation: '+ d.degree + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Flow: '+ d.flow + '<br>' + '</strong>'
             );
    $('#productViewer')
        .html('<strong style="font-family:Sans-serif;">' +'Product Id: '+ d.productId + '<br>' + '</strong>' 
             +'<strong style="font-family:Sans-serif;">' +'Product Group: '+ productInfo[d.productId]['productGroup'] + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Flow Id: '+ productInfo[d.productId]['flowId'] + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Operation Seq.: '+ productInfo[d.productId]['operationSequence'] + '<br>' + '</strong>'
             );    
    $('#resourceViewer')
        .html('<strong style="font-family:Sans-serif;">' +'Resource: '+ datum.label + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Resource Model: '+ datum.resourceModel + '<br>' + '</strong>'
             );    
}

// ------------------------------------- Decision View ------------------------------------------------
var columns = [
        { head: 'Decision', cl: 'tableTitle', html: ƒ('decision') },
        { head: 'DecisionType', cl: 'num', html: ƒ('decisionType') },
        { head: 'ProductType', cl: 'center', html: ƒ('productType') },
        { head: 'LotQuantiy', cl: 'center', html: ƒ('lotSize') },
        { head: 'Reward', cl: 'num', html: ƒ('reward', d3.format('.5f')) }
    ];


function displayDecisions(d, datum){
    d3.selectAll('table').remove();
    var lotId = d.lotId;
    if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'))
    var decisionKey = d.degree + '_' + lotId
    var decisionsArray = decisionInfo[decisionKey]
    
    var DASelection = 5;
    var WBSelection = 5;
    var WBSplit = 5;
    
    var DASelDecisions = [];
    var WBSelDecisions = [];
    var boorder = [
        {'decision' : '---------', 'decisionType' : '---------', 'productType' : '---------', 'lotSize': '-----------', 'reward': ''}
    ];
    var WBSplitDecisions = [];
    
    if(d.degree.indexOf('WB')>-1){
        for(var i = 0; i < decisionsArray.length; i++){
            var tempDecision = decisionsArray[i];
            if(tempDecision.decisionType == 'WB_SELECTION'){
                if(WBSelDecisions.length == WBSelection) continue;
                WBSelDecisions.push(tempDecision)
            }
            else if(tempDecision.decisionType == 'SPLIT'){
                if(WBSplitDecisions.length == WBSplit) continue;
                WBSplitDecisions.push(tempDecision)
            }
        }
    }
    else{
        DASelection = Math.min(DASelection, decisionsArray.length)
        for(var i = 0; i < DASelection; i++){
            DASelDecisions.push(decisionsArray[i])
        }
    }
    var table = d3.select('#decisionViewer')
                  .append('table');
    
    
    if(d.degree.indexOf('WB')>-1){
     // create table header
    table.append('thead').append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .attr('class', ƒ('cl'))
            .text(ƒ('head'));
    
     table.append('tbody')
        .selectAll('tr')
        .data(WBSelDecisions).enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));
        
     table.append('tbody')
        .selectAll('tr')
        .data(boorder).enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));    
        
    // create table body
    table.append('tbody')
        .selectAll('tr')
        .data(WBSplitDecisions).enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));
    }
    else{
        table.append('thead').append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .attr('class', ƒ('cl'))
            .text(ƒ('head'));
     
     table.append('tbody')
        .selectAll('tr')
        .data(DASelDecisions).enter()
        .append('tr')
        .selectAll('td')
        .data(function(row, i) {
            return columns.map(function(c) {
                // compute cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function(k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
                });
                return cell;
            });
        }).enter()
        .append('td')
        .html(ƒ('html'))
        .attr('class', ƒ('cl'));
    }
}


function selectLots(lotId){
    var rects = d3.selectAll('.operationRect')
    if (lotId.indexOf('_' ) >0){
        lotId = lotId.substring(0, lotId.indexOf('_'))
    } 
    rects.style("fill", function (d, i) {
        if(d.lotId.indexOf(lotId)>-1) return colorCycle[d.productId];
        else return 'white'
    })
}

// Tab View
d3.select('#wipView').on('click', function(){
	d3.select('#resourceView')
		.classed('active', false)
		.classed('de-active', true)
	d3.select('#wipView')
		.classed('de-active', false)
		.classed('active', true)
	d3.select('#wipLevel')
		.classed('myHidden', false)
	d3.select('#process')
		.classed('myHidden', true)
	d3.event.preventDefault();
	return false;
	});

d3.select('#resourceView').on('click', function(){
	d3.select('#wipView')
		.classed('active', false)
		.classed('de-active', true)
	d3.select('#resourceView')
		.classed('de-active', false)
		.classed('active', true)
	d3.select('#process')
		.classed('myHidden', false)
	d3.select('#wipLevel')
		.classed('myHidden', true)
	d3.event.preventDefault();
	return false;
	});



function reDraw(traveledTime) {
    var svg = d3.select("#process").selectAll('.operations')
    var newLabelData = [];   
    console.log(svg)
    for(var i = 0; i < ganttData.length; i++){
        var tempLabel = ganttData[i]['label'];
        var tempTimes = ganttData[i]['times']
        var newTimes = [];
        for(var j = 0; j < tempTimes.length; j++){
            var startTime = tempTimes[j]['starting_time'];
            if(startTime < traveledTime) newTimes.push(tempTimes[j])
            else break;
        }
        var tempObject = {};
        tempObject['label'] = tempLabel;
        tempObject['times'] = newTimes;
        newLabelData[i] = tempObject;
    }
    console.log(ganttData);
    console.log(newLabelData);

    svg.datum(newLabelData);
    console.log(svg);
    svg.each(function (d, i) {        
         d.forEach(function (datum, index) {
                var data = datum.times;
                var hasLabel = (typeof (datum.label) != "undefined");
                // issue warning about using id per data set. Ids should be individual to data elements
                // FIX
                var operations = svg.selectAll("svg").data(data);
                var operationsEnter = operations.enter().append('g');
                operationsEnter.append(function (d, i) {
                    d.label = datum.label;
                    return document.createElementNS(d3.ns.prefix.svg, 'rect');
                })
                .attr("x", function(d){
                    return xScale(d.starting_time*1000)
                   })
                  .attr("y", function(d){
                    return yScale(index)  
                  })
                  .attr("width", function (d, i) {
                    return xScale(d.ending_time *1000) - xScale(d.starting_time*1000) ;
                })
//                    .attr("cy", function (d, i) {
//                        return getStackPosition(d, i) + itemHeight / 2;
//                    }).attr("cx", getXPos).attr("r", itemHeight / 2)
                 .attr("height", function(d){
                    return (yScale(index+1) - yScale(index))
                })
                 .style("fill", function (d, i) {
                    if(d.starting_time < traveledTime) return colorCycle[d.productId];
                    else return 'white';
                    
                })
                .attr("clip-path", "url(#clip)")
                .attr("class", function (d, i) {
                    return 'operationRect ' + d.productId;
                    // return datum.class ? "timelineSeries_" + datum.class : d.productId;
                    // return datum.class ? "timelineSeries_"+datum.class : "timelineSeries_"+index;
                })
                .attr("id", function (d, i) {
                    // use deprecated id field
                    if (datum.id && !d.id) {
                        return 'timelineItem_' + datum.id;
                    }
                    return d.id ? d.id : d.lotId;
                    // return d.id ? d.id : "timelineItem_"+index+"_"+i;
                });
                // FIX
                operationsEnter
                    .append("text")
                    .attr('class','operationText')
                    .attr("clip-path", "url(#clip)")
                    .attr("x", function(d){
                      return xScale((d.starting_time*1000 + d.ending_time*1000)/2)
                    })
                    .attr("y", function(d){
                    return yScale(index) + 0.7*(yScale(index+1) - yScale(index))
                    })
                    .style('text-anchor', 'middle')
                    .style('vertical-align', 'middle')
                    .style('font-weight', 'bold')
                    .style('fill', 'white')
                    .style('font-size', function(d){
                        return 0.2*((yScale(index+1) - yScale(index))) + 'px'})
                    .text(function (d) {
                    return d.lotId;
                });
                
                operations.exit().remove();
               
            });
        });
    
}


