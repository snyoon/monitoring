processWidth = document.body.clientWidth
var testOut;
var fileTest;
var inputData;
var ganttData;
var chart;
var sortedTimes = [];

var clickedElement = '';
var boolSelected = false;
var candidatedElement = 'can';
var canBoolSelected = false;

var productInfo = {};
var decisionInfo = {};
var denominator = {};

var buttonOn = false;
// ProductionStatus Info
var maxTime;
var productionStatus = {}
var graphMargin = {
        left: 30
        , right: 30
        , top: 30
        , bottom: 30
    }
var tickFormat = { 
          format: d3.time.format("%e-%H"),
          tickTime: d3.time.hour,
          tickInterval: 3,
          tickSize: 6,
          tickValues: null
        }

// KPI Info
var KPI = {};
var KPIs = [];

var openFile = function (event) {
    KPIs = [];
    d3.select('.remove').remove()
    d3.select('#chart').selectAll('svg').remove();
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
        denominator = inputData['DENOMINATOR']
        KPI = inputData['KPI']
        for(var key in KPI){
            var tempObject = {};
            tempObject['key'] = key
            tempObject['value'] = KPI[key]
            KPIs.push(tempObject)
        }
        maxTime = inputData['KPIMaxTime']
        for(var i = 0; i < inputData['ProductionStatus'].length; i++){
            var tempProduction = inputData['ProductionStatus'][i];
            productionStatus[tempProduction.id] = tempProduction.values;
        }
        timelineHover(traveledTime);
        ProductionStatus();
        for (var i = 0; i < ganttData.length; i++) {
            var tempLabel = ganttData[i]['label'];
            var tempTimes = ganttData[i]['times']
            for (var j = 0; j < tempTimes.length; j++) {
                sortedTimes.push(tempTimes[j])
            }
        }
        displayKPI();
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
    showRightPush = document.getElementById( 'showRight' )
    showBottom = document.getElementById( 'showBottom' ),
    body = document.body;
var showBottom;


showRightPush.onclick = function() {
				classie.toggle( this, 'active' );
				classie.toggle( menuRight, 'cbp-spmenu-open' );
//				disableOther( 'showRight' );
			};
showBottom.onclick = function(){
                classie.toggle( this, 'active' );
                classie.toggle( menuBottom, 'cbp-spmenu-open' );
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
            var eventId = d.eventId;
            if(d.lotId.indexOf(clickedElement) > -1 && boolSelected == true){
                 var rects = d3.selectAll('.operationRect')
                 rects.style("fill", function (d, i) {
                  if(d.lotId  == 'RESERVED') return 'url(#diagonal-stripe-1)'  
                  else return colorCycle[d.productId];
                })   
                 // d3.selectAll('#attribute').classed('cbp-spmenu-open', false)
                 boolSelected = false;
                 clickedElement = '';
             }
             else if(d.lotId != clickedElement && boolSelected == true){

             }
             else{
                d3.selectAll('#'+selectedLotId)
                displayAttribute(d, datum)
                selectLots(selectedLotId, eventId)
                if (d.lotId.indexOf('_' ) >0){
                    clickedElement = d.lotId.substring(0, d.lotId.indexOf('_'))
                }
                else clickedElement = d.lotId
                boolSelected = true;
                buttonOn = false;
                displayDecisions(d);
                
            }
        })
    var svg = d3.select("#process").append("svg").attr("width", processWidth);
    svg.datum(ganttData).call(chart);
    
    xScale = chart.exportXScale();
    yScale = chart.exportYScale();
    colorCycle = chart.exportColorCycle();
    d3.select('.operations').data([ganttData]).exit().remove();
      
}


// ------------------------------------------- Lot Search ------------------------------------------------
// Decision Viewr에서 선택하는 Interface로 

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
        { head: 'OperationId', cl: 'num', html: ƒ('operationId') },
        { head: 'ProductType', cl: 'center', html: ƒ('productType') },
        { head: 'LotQuantiy', cl: 'center', html: ƒ('lotSize') },
        { head: 'Reward', cl: 'num', html: ƒ('reward', d3.format('.5f')) }
    ];


function displayDecisions(d, datum){
    d3.selectAll('table').remove();
    d3.selectAll('#decisionLine').remove();
    var lotId = d.lotId;
    if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'))
    var decisionKey = d.degree + '_' + lotId
    var decisionsArray = decisionInfo[decisionKey]
    if(decisionsArray != undefined){
        var DASelection = 5;
        var WBSelection = 5;
        var WBSplit = 5;

        var DASelDecisions = [];
        var DASelDecisionsDict = {};

        var WBSelDecisions = [];
        var boorder = [
            {'decision' : '---------', 'operationId' : '---------', 'productType' : '---------', 'lotSize': '-----------', 'reward': ''}
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
    //        DASelection = Math.min(DASelection, decisionsArray.length)
            DASelection = decisionsArray.length
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
            .on("mouseover", function(d) {
                d3.select(this).style("cursor", "pointer")
            })
            .on("mouseout", function(d) {
                d3.select(this).style("cursor", "default")
            })
            .on("click", function (d, i) {
                if(boolSelected == true){
                    var decisionLotId = d.html.substring(d.html.indexOf('-')+1, d.html.length)
                    var rects = d3.selectAll('.operationRect')
                    // 같은 랏을 두 번 선택했을 때는 다시 원래대로 돌아가게 함
                    if(decisionLotId.indexOf(candidatedElement) > -1){
                        rects.style('fill', function (d,i){
                            if(d.lotId.indexOf(clickedElement)>-1){
                                if(d.lotId.indexOf('WIP')>-1){
                                    if(clickedElement.indexOf('WIP')>-1) return colorCycle[d.productId];
                                    else return 'white';
                                }
                                else return colorCycle[d.productId];
                            }
                            else return 'white'
                        })
                        candidatedElement = 'can'
                    }
                    else{
                        // 최초 선택의 경우 
                        rects.style("fill", function (d, i){
                            // 선택된 lot을 색칠하기 위함
                            if(d.lotId.indexOf(decisionLotId)>-1){
                                // 지금 색칠해야 하는 lot이 WIP이라면 lot 이름을 공유하기 때문에
                                // 만약, 선택된 lot이 WIP이 아니었으면 lot 이름을 공유하는 WIP들은 색칠하지 않는다
                                // 만약, 선택된 lot이 WIP이면 원래대로 색칠을 해준다                            
                                if(d.lotId.indexOf('WIP')>-1){
                                    if(decisionLotId.indexOf('WIP')>-1) return colorCycle[d.productId];
                                    else return 'white';
                                }
                                else return colorCycle[d.productId];
                            } 
                            else{
                                if(d.lotId.indexOf(clickedElement) > -1) {
                                    if(d.lotId.indexOf('WIP')>-1){
                                        if(clickedElement.indexOf('WIP')>-1) return colorCycle[d.productId];
                                        else return 'white';
                                    }
                                    else return colorCycle[d.productId];
                                }
                                else return 'white';
                            } 
                        }) 
                        candidatedElement = decisionLotId;       
                    }
                }
            })
            .html(ƒ('html'))
            .attr('class', ƒ('cl'))
        }
        
        var currentStatus =  decisionsArray[0];
        $('#currentStatus')
        .html('<strong style="font-family:Sans-serif;font-size:20px;">' +'WIP Level: '+ currentStatus['wipLevel'] + ' / ' + denominator['Stocker_size']
             + '<br>' + '</strong>' 
             +'<strong style="font-family:Sans-serif;font-size:20px;">' +'Working DA: '+ currentStatus['workingDA'] + ' / ' + denominator['DA_resource']
             + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;font-size:20px;">' +'Working WB: '+ currentStatus['workingWB'] + ' / ' + denominator['WB_resource']
             + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;font-size:20px;">' +'투입량: '+ currentStatus['inputCount'] + ' / ' + denominator['MAX_inputcount']
             + '<br>' + '</strong>'
             );
    }
    else{
        $('#currentStatus')
            .html(' ');
    }
    lineHeight = chart.getHeight();
    gantt = d3.select('#process').select('svg')
    gantt.append("line")
        .attr('id', 'decisionLine')    
        .attr("x1", xScale(decisionsArray[0].decisionTime*1000))  //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", xScale(decisionsArray[0].decisionTime*1000))  //<<== and here
        .attr("y2", lineHeight - margin.bottom)
        .style("stroke-width", 2)
        .style("stroke", "red")
        .style("fill", "none");
    
}


function selectLots(lotId, eventId){
    var rects = d3.selectAll('.operationRect')
    var motherLotId = lotId;
    if (lotId.indexOf('_' ) >0){
        motherLotId = lotId.substring(0, lotId.indexOf('_'))
    } 
    rects.style("fill", function (d, i) {
        if(d.lotId.indexOf(motherLotId)>-1){
            if(d.lotId.indexOf('WIP')>-1){
                if(motherLotId.indexOf('WIP')>-1) return colorCycle[d.productId];
                else return 'white'
            }
            else return colorCycle[d.productId];
        } 
        else return 'white'
    })
    rects.style('stroke', function(d){
        if(d.eventId == eventId) return 'red'
    })
    rects.style('stroke-width', function(d){
        if(d.eventId == eventId) return 6;
    })
    
//    var operText = d3.selectAll('.operationText')
//    operText.text(function(d){
//        if(d.lotId.indexOf(motherLotId)>-1) {
//            console.log('ddd')
//            return d.lotId;
//        }
//    })
}

// ---------------------------------- Tab View ---------------------------------------
d3.select('#statusView').on('click', function(){
	d3.select('#resourceView')
		.classed('active', false)
		.classed('de-active', true)
	d3.select('#statusView')
		.classed('de-active', false)
		.classed('active', true)
	d3.select('#status')
		.classed('myHidden', false)
	d3.select('#process')
		.classed('myHidden', true)
	d3.event.preventDefault();
	return false;
	});

d3.select('#resourceView').on('click', function(){
	d3.select('#statusView')
		.classed('active', false)
		.classed('de-active', true)
	d3.select('#resourceView')
		.classed('de-active', false)
		.classed('active', true)
	d3.select('#process')
		.classed('myHidden', false)
	d3.select('#status')
		.classed('myHidden', true)
	d3.event.preventDefault();
	return false;
	});


//------------------------------- Production Status Graphs ----------------------------------
function ProductionStatus(){
    var canvasWidth = processWidth/3.3;
    var graphWidth = canvasWidth - graphMargin.left - graphMargin.right;
    var graphHeight = 400 - graphMargin.top - graphMargin.bottom;
    
   
    
     // KPI
    var svg1 = d3.select("#status_1").append('svg').attr('id', 'KPIText').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
    
    var fontSize = 18; 
    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("KPI");
    
    var kpis = svg1.selectAll('.KPIs')
        .data(KPIs)
        
    kpis.enter()
        .append('g')
        .attr('class', 'KPIs')
        .attr("transform", function(d, i) { return "translate(0," + (i * (fontSize*2) +30)+ ")"; })
        .append('text')
        .attr('x', 12)
        .attr('y', 3)
        .text(function(d){
            if(d.key == 'Stocker_size') return d.key + ": " + d.value;
            if(d.key == 'Makespan') return d.key + ": " + (d.value/60).toFixed(1) + " (min)";
            if(d.key == 'Total_Wiplevel') return d.key + ": " + d.value;
            if(d.key == 'AVG_Wiplevel') return d.key + ": " + d.value.toFixed(2);
            else return d.key + ": " + d.value.toFixed(3);
        })
        .style('font-size', fontSize)
    
    kpis.exit().remove();

    // WIP Level
    svg1 = d3.select("#status_1").append('svg').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    var xScale = d3.time.scale()
        .domain([0, d3.max(productionStatus['WIPLevel'], function(d){return d.time * 1000})])
        .range([0, graphWidth]); // FIX
    
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(8)
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
    
    var yScale = d3.scale.linear()
         .domain([0, KPI['Stocker_size']+1])
         .range([graphHeight, 0]);
        
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
    
    var line = d3.svg.line()
            .x(function(d) { return xScale(d.time*1000); })
            .y(function(d) { return yScale(+d.number); })
//            .inperpolate('linear') ;
    
    var horizontalLine = svg1
                 .append('line')
                 .attr("x1", xScale(0))
                 .attr("y1", yScale(KPI['Stocker_size']))
                 .attr("x2", xScale(d3.max(productionStatus['WIPLevel'], function(d){return d.time * 1000})))
                 .attr("y2", yScale(KPI['Stocker_size']))
                 .style("stroke-width", 1)
                 .style("stroke", "red")

    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("WIP Level");
    
    svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(productionStatus['WIPLevel']))
    
	svg1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphHeight + ")")
		.call(xAxis);

	svg1.append("g")
		.attr("class", "y axis")
		.call(yAxis);
    
     // Input Count
    svg1 = d3.select("#status_1").append('svg').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    var xScale = d3.time.scale()
        .domain([0, d3.max(productionStatus['InputCount'], function(d){return d.time*1000})])
        .range([0, graphWidth]); // FIX
    
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
    
    var yScale = d3.scale.linear()
         .domain([0, d3.max(productionStatus['InputCount'], function(d){return d.number})])
         .range([graphHeight, 0]);
        
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
    
    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("투입량");
    
    svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(productionStatus['InputCount']))
    
	svg1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphHeight + ")")
		.call(xAxis);

	svg1.append("g")
		.attr("class", "y axis")
		.call(yAxis);
    
    
    // Ship Count
    svg1 = d3.select("#status_2").append('svg').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    var xScale = d3.time.scale()
        .domain([0, d3.max(productionStatus['ShipCount'], function(d){return d.time*1000})])
        .range([0, graphWidth]); // FIX
    
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
    
     
    var yScale = d3.scale.linear()
         .domain([0, d3.max(productionStatus['ShipCount'], function(d){return d.number})])
         .range([graphHeight, 0]);
        
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
    
    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("산출물");
    
    svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(productionStatus['ShipCount']))
    
	svg1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphHeight + ")")
		.call(xAxis);

	svg1.append("g")
		.attr("class", "y axis")
		.call(yAxis);
    
    
    // Split Count
    svg1 = d3.select("#status_2").append('svg').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
    
    
    var xScale = d3.time.scale()
        .domain([0, d3.max(productionStatus['SplitCount'], function(d){return d.time*1000})])
        .range([0, graphWidth]); // FIX
    
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
    
    var yScale = d3.scale.linear()
         .domain([0, d3.max(productionStatus['SplitCount'], function(d){return d.number})])
         .range([graphHeight, 0]);
        
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
    
    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("Split Count");
    
    svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(productionStatus['SplitCount']))
    
	svg1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphHeight + ")")
		.call(xAxis);

	svg1.append("g")
		.attr("class", "y axis")
		.call(yAxis);
    
     // Merge Count
    svg1 = d3.select("#status_2").append('svg').attr('width', canvasWidth).attr('height', 400)
               .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
    
    var xScale = d3.time.scale()
        .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.time*1000})])
        .range([0, graphWidth]); // FIX
    
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize); 
    
    var yScale = d3.scale.linear()
         .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.number})])
         .range([graphHeight, 0]);
        
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
    
    svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("Merge Count");
    
    svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(productionStatus['MergeCount']))
    
	svg1.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graphHeight + ")")
		.call(xAxis);

	svg1.append("g")
		.attr("class", "y axis")
		.call(yAxis);
    
   
}

//-------------------------------------- KPI Status -----------------------------------------
function displayKPI(lotId){
      
    
}

