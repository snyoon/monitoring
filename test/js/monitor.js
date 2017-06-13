    processWidth = document.body.clientWidth
    //None of the original code was deleted. just commented out with OG tag. 
    var testOut;
    var fileTest;
    var inputData;
    var ganttData;
    var chart;
    var sortedTimes = [];

    //var clickedElement = '';
    //var boolSelected = false;
    var candidatedElement = 'can';
    var canBoolSelected = false;

var actionAttribute=[];

var allProductInfo={};
var alldecisionInfo={};
var allDenominator ={};


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
  tickInterval: 2,
  tickSize: 6,
  tickValues: null
}
//OG CODE
// KPI Info
//var KPI = {};
//var KPIs = [];

//For Reading Multiple Files
var schedules = [];
var scheduleName;
var activeSchedule;
var listofnames =[];

var dataCount = 0; 

// For Ship Count
var shipSvg;
var shipXScale
var shipYScale
var shipXAxis
var shipYAxis
var shipLine

var graphWidth
var graphHeight



var openFile = function (event) {

    //Deletes the Charts if there were antyhing there..
    // OG CODE REMOVED 
    //d3.select('.remove').remove()
    //d3.select('#chart').selectAll('svg').remove();
    //Makes the bars hidden.

    var input = event.target;
    var reader = new FileReader();

    reader.onload = function () {
     if(listofnames.indexOf(document.getElementById("myFiles").files[0].name) != -1) {
        window.alert("This file is already in use.");
        return;
    }
    dataCount++;
    var text = reader.result;
    var node = document.getElementById('output');
    testOut = reader.result;
    inputData = JSON.parse(testOut)
    var index = 0;
        //Creates the scheduleObj for the read schedule
        var TscheduleName = document.getElementById("myFiles").files[0].name;
        listofnames.push(TscheduleName);
        actionAttribute = inputData['actionAttribute'];
        var TganttData = inputData['Gantt'];
        var TproductInfo = inputData['Product'];
        //productInfo = TproductInfo;
        allProductInfo[TscheduleName] = TproductInfo;
        var TdecisionInfo = inputData['Decision'];
        //decisionInfo = TdecisionInfo;
        alldecisionInfo[TscheduleName] = TdecisionInfo;
        var Tdenominator = inputData['DENOMINATOR'];
        //denominator = Tdenominator;
        allDenominator[TscheduleName] = Tdenominator;
        var TKPI = inputData['KPI'];
        var TKPIs = [];
        for(var key in TKPI){
            var tempObject = {};
            tempObject['key'] = key
            tempObject['value'] = TKPI[key]
            TKPIs.push(tempObject)
        }
        TKPIs.sort(function(a,b){
        	if(a.key < b.key)
        		return -1;
        	if(a.key > b.key)	
        		return 1
        	return 0;
        });
        var TmaxTime = inputData['KPIMaxTime']
        var TproductionStat = {};
        for(var i = 0; i < inputData['ProductionStatus'].length; i++){
            var tempProduction = inputData['ProductionStatus'][i];
            TproductionStat[tempProduction.id] = tempProduction.values;
        }
        var newSchedule = new scheduleObj(TscheduleName, 
            TganttData, 
            TproductInfo, 
            TdecisionInfo, 
            Tdenominator, 
            TKPI,
            TmaxTime,
            TproductionStat,
            TKPIs);

        activeSchedule = newSchedule;
        //adds the newly read file onto the list of schedules. 
        schedules.push(newSchedule);
        //adding a tab and tab-content for the chart to the DOC
        if(schedules.length >1){
            //this is making non active tabs 
            var graphTabs = document.getElementById("listOfCharts");
            var li = document.createElement("li");
            li.setAttribute("class", "nav");
            var tabA = document.createElement("a");
            var divID = "chartdiv" + schedules.length;
            var tabhref = "#" + divID;
            tabA.setAttribute("data-toggle", "tab");
            tabA.setAttribute("href", tabhref);
            tabA.appendChild(document.createTextNode(TscheduleName));

            li.appendChild(tabA);
            graphTabs.appendChild(li)
            
            //creates the tabcontent divs for the loaded files.
            //havent added charts 
            var tabContentDiv = document.getElementById("tabcontentsChart");
            var div = document.createElement("div");
            //var divID = "chartdiv" + schedules.length;
            div.setAttribute("id", divID);
            div.setAttribute("class", "tab-pane fade");
            tabContentDiv.appendChild(div);

            //make the place to put the individual charts in
            var chartNav = document.createElement("ul");
            chartNav.setAttribute("id", "chartTypes");
            chartNav.setAttribute("class", "nav nav-tabs");
            div.appendChild(chartNav);

            //makes the tabs for schedule and statistics view
            var chartNavProc = document.createElement("li");
            chartNavProc.setAttribute("class", "nav active");
            var chartNavProcA = document.createElement("a");
            chartNavProcA.setAttribute("data-toggle", "tab");
            var href11 = "proc" +divID;
            newSchedule.divID = href11;
            chartNavProcA.setAttribute("href", "#" + href11);
            chartNavProcA.appendChild(document.createTextNode("Schedule View"));
            chartNavProc.appendChild(chartNavProcA);
            chartNav.appendChild(chartNavProc);

            var chartNavStat = document.createElement("li");
            chartNavStat.setAttribute("class", "nav");
            var chartNavStatA = document.createElement("a");
            chartNavStatA.setAttribute("data-toggle", "tab");
            var href22 = "stat" +divID;
            chartNavStatA.setAttribute("href", "#" + href22);
            chartNavStatA.appendChild(document.createTextNode("Statistics View"));
            chartNavStat.appendChild(chartNavStatA);
            chartNav.appendChild(chartNavStat);
            //making the different chart content html
            var chartTypesContent = document.createElement("div");
            chartTypesContent.setAttribute("id", "chartTypesContent");
            chartTypesContent.setAttribute("class", "tab-content");

            chartNav.appendChild(chartTypesContent);

            var scheduleChartDive = document.createElement("div");
            scheduleChartDive.setAttribute("id", href11);
            scheduleChartDive.setAttribute("class","tab-pane fade in active");

            var statChartDive = document.createElement("div");
            statChartDive.setAttribute("id", href22);
            statChartDive.setAttribute("class","tab-pane fade");

            chartTypesContent.appendChild(scheduleChartDive);
            chartTypesContent.appendChild(statChartDive);



        }else{
            var graphTabs = document.getElementById("listOfCharts");
            var li = document.createElement("li");
            //makes this the active tab
            li.setAttribute("class", "nav active");

            var tabA = document.createElement("a");
            //id of the tab is the file name
            tabA.setAttribute("data-toggle", "tab");
            var divID = "chartdiv" + schedules.length;
            newSchedule.divID = divID;
            var tabhref = "#" +divID;
            tabA.setAttribute("href", tabhref);
            tabA.appendChild(document.createTextNode(TscheduleName));

            li.appendChild(tabA);
            graphTabs.appendChild(li);

            //creates the tabcontent divs for the loaded files.
            //havent added charts 
            var tabContentDiv = document.getElementById("tabcontentsChart");
            var div = document.createElement("div");
            //var divID = "chartdiv" + schedules.length;
            div.setAttribute("id", divID);
            div.setAttribute("class", "tab-pane fade in active");
            tabContentDiv.appendChild(div);

            //make the place to put the individual charts in
            var chartNav = document.createElement("ul");
            chartNav.setAttribute("id", "chartTypes");
            chartNav.setAttribute("class", "nav nav-tabs");
            div.appendChild(chartNav);

            //makes the tabs for scheudle and statistics view
            var chartNavProc = document.createElement("li");
            chartNavProc.setAttribute("class", "nav active");
            var chartNavProcA = document.createElement("a");
            chartNavProcA.setAttribute("data-toggle", "tab");
            var href11 = "proc" +divID;
            newSchedule.divID = href11;
            chartNavProcA.setAttribute("href", "#" + href11);
            chartNavProcA.appendChild(document.createTextNode("Schedule View"));
            chartNavProc.appendChild(chartNavProcA);
            chartNav.appendChild(chartNavProc);

            var chartNavStat = document.createElement("li");
            chartNavStat.setAttribute("class", "nav");
            var chartNavStatA = document.createElement("a");
            chartNavStatA.setAttribute("data-toggle", "tab");
            var href22 = "stat" +divID;
            chartNavStatA.setAttribute("href", "#" + href22);
            chartNavStatA.appendChild(document.createTextNode("Statistics View"));
            chartNavStat.appendChild(chartNavStatA);
            chartNav.appendChild(chartNavStat);
            //making the different chart content html
            var chartTypesContent = document.createElement("div");
            chartTypesContent.setAttribute("id", "chartTypesContent");
            chartTypesContent.setAttribute("class", "tab-content");

            chartNav.appendChild(chartTypesContent);

            var scheduleChartDive = document.createElement("div");
            scheduleChartDive.setAttribute("id", href11);
            scheduleChartDive.setAttribute("class","tab-pane fade in active");

            var statChartDive = document.createElement("div");
            statChartDive.setAttribute("id", href22);
            statChartDive.setAttribute("class","tab-pane fade");

            chartTypesContent.appendChild(scheduleChartDive);
            chartTypesContent.appendChild(statChartDive);

        }
        
      	timelineHover(traveledTime, href11, TscheduleName);
        ProductionStatus(TKPIs, TproductionStat, href22, TKPI);
        comparePage();
        for (var i = 0; i < TganttData.length; i++) {
            var tempLabel = TganttData[i]['label'];
            var tempTimes = TganttData[i]['times']
            for (var j = 0; j < tempTimes.length; j++) {
                sortedTimes.push(tempTimes[j])
            }
        }
        displayKPI();
        sortedTimes.sort(function (a, b) {
            return a.starting_time < b.starting_time ? -1 : a.starting_time > b.starting_time ? 1 : 0;
        })
    };


    // For when you cancel file selection
    try{
        reader.readAsText(input.files[0]);
    }catch(err){
        window.alert("No File Selected");
    }
    
<<<<<<< HEAD
    
=======

>>>>>>> 54c8261363ad42950dec2a52bee62543ab5097fc
};

var openCompareFile = function (event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        var text = reader.result;

        var node = document.getElementById('output');
        var compareTestOut = reader.result;
        var compareInputData = JSON.parse(compareTestOut)
        var index = 0;
        var compareShipCount = []
        for(var i = 0; i < compareInputData['ProductionStatus'].length; i++){
            var tempProduction = compareInputData['ProductionStatus'][i];
            if(tempProduction.id == 'ShipCount') compareShipCount = tempProduction.values;
        }

        d3.select('#defaultShipLine').remove()
        d3.selectAll('.dateDividerShip').remove()
        var defaultTimeMax = d3.max(productionStatus['ShipCount'], function(d){return d.time});
        var compareTimeMax = d3.max(compareShipCount, function(d){return d.time});
        var totalMax;

        if(defaultTimeMax > compareTimeMax) totalMax = defaultTimeMax
            else totalMax = compareTimeMax
                shipXScale.domain([d3.min(compareShipCount, function(d){return d.time}), totalMax])
            shipXAxis.scale(shipXScale)
            d3.select('#shipXAxis').remove()
            shipSvg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graphHeight + ")")
            .call(shipXAxis);
            shipLine = d3.svg.line()
            .x(function(d) { return shipXScale(d.time); })
            .y(function(d) { return shipYScale(+d.number); })

            shipSvg.append('path')
            .attr('id', 'defaultShipLine')
            .attr('class', 'statusLine')
            .attr("d", shipLine(productionStatus['ShipCount']))

            shipSvg.append('path')
            .attr('class', 'statusLine2')
            .attr("d", shipLine(compareShipCount))
            drawVerticalLine(shipSvg, shipXScale, shipYScale, d3.max(productionStatus['ShipCount'], function(d){return d.number}))

            shipSvg.append('text')
            .attr("transform", function(d) { return "translate(" + shipXScale(compareTimeMax) + "," + shipYScale(d3.max(productionStatus['ShipCount'], function(d){return d.number})-10) + ")"; })
            .attr("x", -20)
            .attr("dy", "0.35em")
            .style("font", "20px sans-serif")
            .text(function(d) { return compareInputData['KPI']['Target'].toFixed(3); });

        // shipSvg.append('text')
        //         .attr("transform", function(d) { return "translate(" + shipXScale(defaultTimeMax) + "," + shipYScale(d3.max(productionStatus['ShipCount'], function(d){return d.number})) + ")"; })
        //         .attr("x", -20)
        //         .attr("dy", "0.35em")
        //         .style("font", "20px sans-serif")
        //         .text(function(d) { return KPI['Target'].toFixed(3); });

    };
    reader.readAsText(input.files[0]);
}


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


// showRightPush.onclick = function() {
//     classie.toggle( this, 'active' );
//     classie.toggle( menuRight, 'cbp-spmenu-open' );
// //				disableOther( 'showRight' );
// };
// showBottom.onclick = function(){
//     classie.toggle( this, 'active' );
//     classie.toggle( menuBottom, 'cbp-spmenu-open' );
// };




function disableOther( button ) {
    if( button !== 'showRight' ) {
//                    d3.selectAll('#showRight')
//					classie.toggle( showRightPush, 'disabled' );
}
if( button !== 'showBottom' ) {
//					classie.toggle( showBottom, 'disabled' );
}
}

function timelineHover(traveledTime, divID, scheduleName) {
    var boolSelected = false;
    var clickedElement = "";
    
    chart = d3.timeline().width(processWidth).stack().margin(margin)
    .traveledTime(traveledTime).showTimeAxisTick().hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            if (d.starting_time > traveledTime) return;
            //this is the clicking on a single thing. 
        }).click(function (d, i, datum) {

            var selectedLotId = d.lotId;
            var eventId = d.eventId;
            if(d.lotId.indexOf(clickedElement) > -1 && boolSelected == true){
             var rects = d3.select("#"+divID).selectAll('.operationRect')
             rects.style("fill", function (d, i) {
              if(d.lotId  == 'RESERVED') return 'url(#diagonal-stripe-1)'  
                  else if(d.lotId =='HeteroSetup') return '000000'
                      else if (d.lotId =='HomoSetup') return '545454'  
                          else return colorCycle[d.productGroup];
                  })   
                 // d3.selectAll('#attribute').classed('cbp-spmenu-open', false)
                 boolSelected = false;
                 clickedElement = '';
             }
             else if(d.lotId != clickedElement && boolSelected == true){

             }
             else{
                d3.selectAll('#'+selectedLotId)
                displayAttribute(d, datum,divID, scheduleName)
                selectLots(selectedLotId, eventId,divID)
                if (d.lotId.indexOf('_' ) >0){
                    clickedElement = d.lotId.substring(0, d.lotId.indexOf('_'))
                }
                else clickedElement = d.lotId
                    boolSelected = true;
                buttonOn = false;
            }
        })

        var svg = d3.select("#" + divID).append("svg").attr("width", processWidth);

        svg.datum(activeSchedule.ganttData).call(chart);
        
        xScale = chart.exportXScale();
        yScale = chart.exportYScale();
        colorCycle = chart.exportColorCycle();
        d3.select('.operations').data([ganttData]).exit().remove();



    //Disables the doubleclick zoom function on the graph.    
    d3.selectAll("svg").on("dblclick.zoom", null);
    
}


// ------------------------------------- Attribute View ------------------------------------------------
// ---------------------------------- OnClick have Popup -----------------------------------------------
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}


function displayAttribute(d, datum, divID, scheduleName){
    var decisionInfo = alldecisionInfo[scheduleName];
    var productInfo = allProductInfo[scheduleName];
    var denominator = allDenominator[scheduleName];

	console.log(divID);    
    var lotId = d.lotId;
    if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'))
        var decisionKey = d.degree + '_' + lotId;
    var decisionsArray = decisionInfo[decisionKey];
    var currentStatus = decisionsArray[0];
    // create a new popup windowsssss
    var newWindow = document.createElement("div");
    newWindow.setAttribute("id", "dialogbox");

    var statDiv =document.createElement("div");
    statDiv.setAttribute("id", "attViewss");
    statDiv.setAttribute("class", "atributedisplay")

    var descionDiv = document.createElement("div");
    descionDiv.setAttribute("id", "Decision");

    var tbl = document.createElement("table");
    tbl.setAttribute("id", "dtable");

    newWindow.appendChild(statDiv);
    descionDiv.appendChild(tbl);
    newWindow.appendChild(descionDiv);
    
	var ssss =  document.getElementById("graphTabs");
	ssss.appendChild(newWindow);
	
    //If Decision stuff is there it will display 
    if(typeof decisionsArray!== "undefined"){
       	

       	//ported in doesnt work ._. doesnt work in old version eiteher lol.  
        // lineHeight = chart.getHeight();
        // gantt = d3.select('#'+ divID).select('svg')
        // gantt.append("line")
        // .attr('id', 'decisionLine')    
        // .attr("x1", xScale(decisionsArray[0].decisionTime))  //<<== change your code here
        // .attr("y1", margin.top*2)
        // .attr("x2", xScale(decisionsArray[0].decisionTime))  //<<== and here
        // .attr("y2", lineHeight - margin.bottom)
        // .style("stroke-width", 2)
        // .style("stroke", "red")
        // .style("fill", "none");


        descionDiv.style.visibility ="visible";
        var avLabelRow = tbl.insertRow(0);
        var decisionID = avLabelRow.insertCell(0);
        decisionID.innerHTML = "Decision Id";
        var opID = avLabelRow.insertCell(1);
        opID.innerHTML = "Operation ID";
        var proType = avLabelRow.insertCell(2);
        proType.innerHTML = "Product Type";
        var currentLocation = avLabelRow.insertCell(3);
        currentLocation.innerHTML = "Current Location";
        var  fID = avLabelRow.insertCell(4);
        fID.innerHTML = "Flow ID"
        var avchartlabel = avLabelRow.insertCell(5);
        var actionvectorsize = decisionsArray[0].actionvector.split(",").length;
        avchartlabel.setAttribute("colspan", actionvectorsize);
        var labelss = "Action Vector <div style= 'font-size:75%; column-count: " + actionvectorsize + "'>";
        for (var i = 0; i <= actionvectorsize -1; i++) {
            labelss+= " <br>" +actionAttribute[i] + "<br>";
        }
        labelss += "</div>"
        avchartlabel.innerHTML =labelss;
        var rewardLabel = avLabelRow.insertCell(6);
        rewardLabel.innerHTML = "Reward";

        var lablelsOfVectors = tbl.insertRow(1);
        

        //------------------------ To display action vector things -----------------------------
        for (var i = 0; i <= decisionsArray.length-1; i++) {

            var row = tbl.insertRow(i + 2);
            var dobj =decisionsArray[i];
            var decisionCell = row.insertCell(0);
            decisionCell.innerHTML = dobj.decision;
            if(i  == decisionsArray.length - 1){
                //UPDATE THIS PLEASE
                decisionCell.innerHTML = "proto??"
            }
            var operationCell = row.insertCell(1);
            operationCell.innerHTML = dobj.operationId;
            var productCell = row.insertCell(2);
            productCell.innerHTML = dobj.productType;
            var currentLocationCell = row.insertCell(3);
            currentLocationCell.innerHTML = dobj.currentLocation;
            var flowIdCell = row.insertCell(4);
            flowIdCell.innerHTML = dobj.flowId;
            var avCell = row.insertCell(5);
            var av = dobj.actionvector.replace("[", "").replace("]","");
            var avArray =av.split(",");

            for(var ii = 0; ii <= avArray.length - 1; ii++) {
                var cell = row.insertCell(5 + ii);
                cell.innerHTML = avArray[ii];
            }
            var rewardCell =row.insertCell(avArray.length + 5);
            //rewardCell.innerHTML = Math.round(dobj.reward * 100)/100;
            rewardCell.innerHTML = dobj.reward.toFixed(3);
        }
    }
    var attviewDiv = document.getElementById("attViewss");

    var startingTime = new Date(d.starting_time);
    var endingTime = new Date(d.ending_time);    
    var decisionTime = 0;
    if(decisionsArray != null)decisionTime = decisionsArray[0].decisionTime;
    decisionTime = new Date(decisionTime);

    var fblocktext = document.createElement("strong");
    fblocktext.innerHTML = 'Lot Id: '+ d.lotId + '<br>'
        +'Starting Time: '+ startingTime.getDate() + '일 ' + addZero(startingTime.getHours()) + ':' + addZero(startingTime.getMinutes()) + '<br>'
        +'Ending Time: '+ endingTime.getDate() + '일 ' + addZero(endingTime.getHours()) + ':' + addZero(endingTime.getMinutes()) 
        + '<br>'
        +'Decision Time: '+ decisionTime.getDate() + '일 ' + addZero(decisionTime.getHours()) + ':' + addZero(decisionTime.getMinutes()) 
        + '<br>'
        +'Operation: '+ d.degree + '<br>'
        +'Quantity: '+ d.quantity + '<br> <br>'
        +'Product Id: '+ d.productId + '<br>' 
        +'Product Group: '+ productInfo[d.productId]['productGroup'] + '<br>'
        +'Flow Id: '+ productInfo[d.productId]['flowId'] + '<br>' 
        +'Operation Seq.: '+ productInfo[d.productId]['operationSequence'] + '<br>'
        +'Resource: '+ datum.label + '<br>'
        +'Resource Model: '+ datum.resourceModel + '<br> <br>'
        + 'DA WIP Level: '+ currentStatus['dawipLevel'] + ' / ' + denominator['Stocker_size']+ '<br>'
        +'WB WIP Level: '+ currentStatus['wbwipLevel'] + ' / ' + denominator['Stocker_size']
       + '<br>' 
       +'Working DA: '+ currentStatus['workingDA'] + ' / ' + denominator['DA_resource']
       + '<br>'
       +'Working WB: '+ currentStatus['workingWB'] + ' / ' + denominator['WB_resource']
       + '<br>'
       +'투입량: '+ currentStatus['inputCount'] + ' / ' + denominator['MAX_inputcount']
       + '<br>'
       +'생산량: '+ currentStatus['outputCount'] + ' / ' + denominator['MAX_outputcount']
       + '<br>'
       +'투입 가능량: '+ currentStatus['currentCSTQuantity'] 
        + '<br>';
 attviewDiv.appendChild(fblocktext);

 $(function(){
    $( "#dialogbox" ).dialog({
               autoOpen: true,
               width: 1350,
               collision: "none",
               
               title: lotId,
               position:{my:"center bottom", at: "center bottom"}

            });
 });

}

//------------------------------------------------------------------------------------------------------------

// ------------------------------------- Decision View ------------------------------------------------
// var columns = [
// { head: 'Decision', cl: 'tableTitle', html: ƒ('decision') },
// { head: 'OperationId', cl: 'num', html: ƒ('operationId') },
// { head: 'ProductType', cl: 'center', html: ƒ('productType') },
//         // { head: 'LotQuantiy', cl: 'center', html: ƒ('lotSize') },
//         { head: 'actionVector', cl: 'center', html: ƒ('actionvector') },
//         { head: 'Score', cl: 'num', html: ƒ('reward', d3.format('.5f')) }
//         ];


//         function displayDecisions(d, datum){
//             d3.selectAll('table').remove();
//             d3.selectAll('#decisionLine').remove();
//             var lotId = d.lotId;
//             if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'))
//                 var decisionKey = d.degree + '_' + lotId
//             var decisionsArray = decisionInfo[decisionKey]
//             if(decisionsArray != undefined) {
//                 var DASelection = 5;
//                 var WBSelection = 5;
//                 var WBSplit = 5;

//                 var DASelDecisions = [];
//                 var DASelDecisionsDict = {};

//                 var WBSelDecisions = [];
//                 var boorder = [
//                 {'decision' : '---------', 'operationId' : '---------', 'productType' : '---------', 'lotSize': '-----------', 'score': ''}
//                 ];
//                 var WBSplitDecisions = [];

//                 if(d.degree.indexOf('WB')>-1){
//                     for(var i = 0; i < decisionsArray.length; i++){
//                         var tempDecision = decisionsArray[i];
//                         if(tempDecision.decisionType == 'WB_SELECTION'){
//                             if(WBSelDecisions.length == WBSelection) continue;
//                             WBSelDecisions.push(tempDecision)
//                         }
//                         else if(tempDecision.decisionType == 'SPLIT'){
//                             if(WBSplitDecisions.length == WBSplit) continue;
//                             WBSplitDecisions.push(tempDecision)
//                         }
//                     }
//                 }
//                 else{
//     //        DASelection = Math.min(DASelection, decisionsArray.length)
//     DASelection = decisionsArray.length
//     for(var i = 0; i < DASelection; i++){
//         DASelDecisions.push(decisionsArray[i])
//     }
// }
// var table = d3.select('#decisionViewer')
// .append('table');


// if(d.degree.indexOf('WB')>-1){
//          // create table header
//          table.append('thead').append('tr')
//          .selectAll('th')
//          .data(columns).enter()
//          .append('th')
//          .attr('class', ƒ('cl'))
//          .text(ƒ('head'));

//          table.append('tbody')
//          .selectAll('tr')
//          .data(WBSelDecisions).enter()
//          .append('tr')
//          .selectAll('td')
//          .data(function(row, i) {
//             return columns.map(function(c) {
//                     // compute cell values for this specific row
//                     var cell = {};
//                     d3.keys(c).forEach(function(k) {
//                         cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
//                     });
//                     return cell;
//                 });
//         }).enter()
//          .append('td')
//          .html(ƒ('html'))
//          .attr('class', ƒ('cl'));

//          table.append('tbody')
//          .selectAll('tr')
//          .data(boorder).enter()
//          .append('tr')
//          .selectAll('td')
//          .data(function(row, i) {
//             return columns.map(function(c) {
//                     // compute cell values for this specific row
//                     var cell = {};
//                     d3.keys(c).forEach(function(k) {
//                         cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
//                     });
//                     return cell;
//                 });
//         }).enter()
//          .append('td')
//          .html(ƒ('html'))
//          .attr('class', ƒ('cl'));    

//         // create table body
//         table.append('tbody')
//         .selectAll('tr')
//         .data(WBSplitDecisions).enter()
//         .append('tr')
//         .selectAll('td')
//         .data(function(row, i) {
//             return columns.map(function(c) {
//                     // compute cell values for this specific row
//                     var cell = {};
//                     d3.keys(c).forEach(function(k) {
//                         cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
//                     });
//                     return cell;
//                 });
//         }).enter()
//         .append('td')
//         .html(ƒ('html'))
//         .attr('class', ƒ('cl'));
//     }
//     else{
//         table.append('thead').append('tr')
//         .selectAll('th')
//         .data(columns).enter()
//         .append('th')
//         .attr('class', ƒ('cl'))
//         .text(ƒ('head'));

//         table.append('tbody')
//         .selectAll('tr')
//         .data(DASelDecisions).enter()
//         .append('tr')
//         .selectAll('td')
//         .data(function(row, i) {
//             return columns.map(function(c) {
//                     // compute cell values for this specific row
//                     var cell = {};
//                     d3.keys(c).forEach(function(k) {
//                         cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
//                     });
//                     return cell;
//                 });
//         }).enter()
//         .append('td')
//         .on("mouseover", function(d) {
//             d3.select(this).style("cursor", "pointer")
//         })
//         .on("mouseout", function(d) {
//             d3.select(this).style("cursor", "default")
//         })
////////////////////THIS SIS THE HTING CONTRONLLLING THE FILL WHEN CLICKED DSKLFJSDL
//         .on("click", function (d, i) {
//             if(boolSelected == true){
//                 var decisionLotId = d.html.substring(d.html.indexOf('-')+1, d.html.length)
//                 var rects = d3.selectAll('.operationRect')
//                     // 같은 랏을 두 번 선택했을 때는 다시 원래대로 돌아가게 함
//                     if(decisionLotId.indexOf(candidatedElement) > -1){
//                         rects.style('fill', function (d,i){
//                             if(d.lotId.indexOf(clickedElement)>-1){
//                                 if(d.lotId.indexOf('WIP')>-1){
//                                     if(clickedElement.indexOf('WIP')>-1) return colorCycle[d.productGroup];
//                                     else return 'white';
//                                 }
//                                 else return colorCycle[d.productGroup];
//                             }
//                             else return 'white'
//                         })
//                         candidatedElement = 'can'
//                     }
//                     else{
//                         // 최초 선택의 경우 
//                         rects.style("fill", function (d, i){
//                             // 선택된 lot을 색칠하기 위함
//                             if(d.lotId.indexOf(decisionLotId)>-1){
//                                 // 지금 색칠해야 하는 lot이 WIP이라면 lot 이름을 공유하기 때문에
//                                 // 만약, 선택된 lot이 WIP이 아니었으면 lot 이름을 공유하는 WIP들은 색칠하지 않는다
//                                 // 만약, 선택된 lot이 WIP이면 원래대로 색칠을 해준다                            
//                                 if(d.lotId.indexOf('WIP')>-1){
//                                     if(decisionLotId.indexOf('WIP')>-1) return colorCycle[d.productGroup];
//                                     else return 'white';
//                                 }
//                                 else return colorCycle[d.productGroup];
//                             } 
//                             else{
//                                 if(d.lotId.indexOf(clickedElement) > -1) {
//                                     if(d.lotId.indexOf('WIP')>-1){
//                                         if(clickedElement.indexOf('WIP')>-1) return colorCycle[d.productGroup];
//                                         else return 'white';
//                                     }
//                                     else return colorCycle[d.productGroup];
//                                 }
//                                 else return 'white';
//                             } 
//                         }) 
//                         candidatedElement = decisionLotId;       
//                     }
//                 }
//             })
//         .html(ƒ('html'))
//         .attr('class', ƒ('cl'))
//     }

    
//     var currentStatus =  decisionsArray[0];
//     $('#currentStatus')
//     .html('<strong style="font-family:Sans-serif;font-size:20px;">' +'DA WIP Level: '+ currentStatus['dawipLevel'] + ' / ' + denominator['Stocker_size']
//        + '<br>' + '</strong>'
//        +'<strong style="font-family:Sans-serif;font-size:20px;">' +'WB WIP Level: '+ currentStatus['wbwipLevel'] + ' / ' + denominator['Stocker_size']
//        + '<br>' + '</strong>' 
//        +'<strong style="font-family:Sans-serif;font-size:20px;">' +'Working DA: '+ currentStatus['workingDA'] + ' / ' + denominator['DA_resource']
//        + '<br>' + '</strong>'
//        +'<strong style="font-family:Sans-serif;font-size:20px;">' +'Working WB: '+ currentStatus['workingWB'] + ' / ' + denominator['WB_resource']
//        + '<br>' + '</strong>'
//        +'<strong style="font-family:Sans-serif;font-size:20px;">' +'투입량: '+ currentStatus['inputCount'] + ' / ' + denominator['MAX_inputcount']
//        + '<br>' + '</strong>'
//        +'<strong style="font-family:Sans-serif;font-size:20px;">' +'생산량: '+ currentStatus['outputCount'] + ' / ' + denominator['MAX_outputcount']
//        + '<br>' + '</strong>'
//        );
//     lineHeight = chart.getHeight();
//     gantt = d3.select('#process').select('svg')
//     gantt.append("line")
//     .attr('id', 'decisionLine')    
//         .attr("x1", xScale(decisionsArray[0].decisionTime))  //<<== change your code here
//         .attr("y1", margin.top*2)
//         .attr("x2", xScale(decisionsArray[0].decisionTime))  //<<== and here
//         .attr("y2", lineHeight - margin.bottom)
//         .style("stroke-width", 2)
//         .style("stroke", "red")
//         .style("fill", "none");
//     }
//     else{
//         $('#currentStatus')
//         .html(' ');
//     }
    
    
// }


function selectLots(lotId, eventId, idofchart){
    var rects = d3.select("#"+idofchart).selectAll('.operationRect')
    var motherLotId = lotId;
    if (lotId.indexOf('_' ) >0){
        motherLotId = lotId.substring(0, lotId.indexOf('_'))
    } 
    rects.style("fill", function (d, i) {
        if(d.lotId.indexOf(motherLotId)>-1){
            if(d.lotId.indexOf('WIP')>-1){
                if(motherLotId.indexOf('WIP')>-1) return colorCycle[d.productGroup];
                else return 'white'
            }
        else return colorCycle[d.productGroup];
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
function ProductionStatus(TKPIs, TproductionStat, href22, TKPI){
    var canvasWidth = processWidth/3.3;
    graphWidth = canvasWidth - graphMargin.left - graphMargin.right;
    graphHeight = 400 - graphMargin.top - graphMargin.bottom;
    

     // KPI
     var svg1 = d3.select("#"+href22).append('svg').attr('id', 'KPIText').attr('width', canvasWidth).attr('height', 400)
     .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
     
     var fontSize = 18; 
     svg1.append("text")
     .attr('class', 'statusTitle')
     .attr("x", (graphWidth / 2))             
     .attr("y", 0 - (margin.top / 2))
     .text("KPI");
     var kpis = svg1.selectAll('.KPIs')
     .data(TKPIs)
     kpis.enter()
     .append('g')
     .attr('class', 'KPIs')
     .attr("transform", function(d, i) { return "translate(0," + (i * (fontSize*1.7) +30)+ ")"; })
     .append('text')
     .attr('x', 12)
     .attr('y', 3)
     .text(function(d){
        if(d.key == 'Stocker_size') return d.key + ": " + d.value;
        if(d.key == 'Makespan') return d.key + ": " + (d.value/60).toFixed(1) + " (min)";
        if(d.key == 'Total_Wiplevel') return d.key + ": " + d.value;
        if(d.key == 'AVG_Wiplevel') return d.key + ": " + d.value.toFixed(2);
        if(d.key == 'Waiting_Time') return 'Waiting Time / TAT : ' + d.value.toFixed(3);
        else return d.key + ": " + d.value.toFixed(3);
    })
     .style('font-size', fontSize)
     
     kpis.exit().remove();

     

    // WIP Level
    svg1 = d3.select("#" + href22).append('svg').attr('width', canvasWidth).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    var xScale = d3.time.scale()
    .domain([d3.min(TproductionStat['WIPLevel'], function(d){return d.time}), d3.max(TproductionStat['WIPLevel'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(8)
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, TKPI['Stocker_size']+1])
        .range([graphHeight, 0]);
        
        var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
        
        var line = d3.svg.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(+d.number); })
//            .inperpolate('linear') ;


var horizontalLine = svg1
.append('line')
.attr("x1", xScale(d3.min(TproductionStat['WIPLevel'], function(d){return d.time})))
.attr("y1", yScale(TKPI['Stocker_size']))
.attr("x2", xScale(d3.max(TproductionStat['WIPLevel'], function(d){return d.time})))
.attr("y2", yScale(TKPI['Stocker_size']))
.style("stroke-width", 1)
.style("stroke", "red")

drawVerticalLine(svg1, xScale, yScale, TKPI['Stocker_size'])

svg1.append("text")
.attr('class', 'statusTitle')
.attr("x", (graphWidth / 2))             
.attr("y", 0 - (margin.top / 2))
.text("WIP Level");

svg1.append('path')
.attr('class', 'statusLine')
.attr("d", line(TproductionStat['WIPLevel']))

svg1.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + graphHeight + ")")
.call(xAxis);

svg1.append("g")
.attr("class", "y axis")
.call(yAxis);

     // Input Count
     svg1 = d3.select("#" + href22).append('svg').attr('width', canvasWidth).attr('height', 400)
     .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
     
     var xScale = d3.time.scale()
     .domain([d3.min(TproductionStat['InputCount'], function(d){return d.time}), d3.max(TproductionStat['InputCount'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['InputCount'], function(d){return d.number})])
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
        .attr("d", line(TproductionStat['InputCount']))

        svg1.append('path')
        .attr('class', 'statusLine2')
        .attr("d", line(TproductionStat['InTargetCount']))
        
        svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(xAxis);

        svg1.append("g")
        .attr("class", "y axis")
        .call(yAxis);

        var dataLabel = []
        dataLabel.push('In Target')
        dataLabel.push('투입량')
        
        var legend = svg1.selectAll(".legend")
        .data(dataLabel)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + ((i * 20))+ ")"; });          
        legend.append("rect")
        .attr("x", graphWidth - graphWidth*0.98)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i){
            if (d.indexOf('In') > -1){
                return 'tomato'
            }else{
                return '#3366cc'
            }
            
        });

      // draw legend text
      legend.append("text")
      .attr("x", graphWidth - graphWidth*0.98 + 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "front")
      .text(function(d) { return d;})
      
      drawVerticalLine(svg1, xScale, yScale, d3.max(TproductionStat['InputCount'], function(d){return d.number}))
    // Ship Count
    //THIS ONE USED TO BE STATUS_2
    shipSvg = d3.select("#"+ href22).append('svg').attr('width', canvasWidth).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    shipXScale = d3.time.scale()
    .domain([d3.min(TproductionStat['ShipCount'], function(d){return (d.time)}), d3.max(TproductionStat['ShipCount'], function(d){return (d.time)})])
        .range([0, graphWidth]); // FIX
        
        shipXAxis = d3.svg.axis()
        .scale(shipXScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        
        shipYScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['ShipCount'], function(d){return d.number})])
        .range([graphHeight, 0]);
        
        shipYAxis = d3.svg.axis()
        .scale(shipYScale)
        .orient('left')
        .tickSize(2);    
        
        shipSvg.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("산출물");
        
        shipLine = d3.svg.line()
        .x(function(d) { return shipXScale(d.time); })
        .y(function(d) { return shipYScale(+d.number); })

        shipSvg.append('path')
        .attr('id', 'defaultShipLine')
        .attr('class', 'statusLine')
        .attr("d", shipLine(TproductionStat['ShipCount']))
        
        shipSvg.append("g")
        .attr("class", "x axis")
        .attr('id', 'shipXAxis')
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(shipXAxis);

        shipSvg.append("g")
        .attr("class", "y axis")
        .call(shipYAxis);
   // drawVerticalLine(shipSvg, shipXScale, shipYScale, d3.max(productionStatus['ShipCount'], function(d){return d.number}))
   
   var verticalLine = shipSvg
   .append('line')
   .attr("x1", shipXScale(86399*1000-32400000))
   .attr("y1", shipYScale(0))
   .attr("x2", shipXScale(86399*1000-32400000))
   .attr("y2", shipYScale(d3.max(TproductionStat['ShipCount'], function(d){return d.number})))
   .attr('class','dateDividerShip')
   .style("stroke-width", 1)
   .style("stroke", "gray")
   var verticalLine2 = shipSvg
   .append('line')
   .attr("x1", shipXScale(86399*2*1000-32400000))
   .attr("y1", shipYScale(0))
   .attr("x2", shipXScale(86399*2*1000-32400000))
   .attr("y2", shipYScale(d3.max(TproductionStat['ShipCount'], function(d){return d.number})))
   .attr('class','dateDividerShip')
   .style("stroke-width", 1)
   .style("stroke", "gray")
    // Util Graph 
    svg1 = d3.select("#" + href22).append('svg').attr('width', canvasWidth).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
    
    
    var xScale = d3.time.scale()
    .domain([d3.min(TproductionStat['WB_Util'], function(d){return d.time}), d3.max(TproductionStat['WB_Util'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['WB_Util'], function(d){return d.number+0.02})])
        .range([graphHeight, 0]);
        
        var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
        
        svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("Util Graph");
        
        svg1.append('path')
        .attr('class', 'statusLine2')
        .attr("d", line(TproductionStat['DA_Util']))

        svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(TproductionStat['WB_Util']))

        svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(xAxis);

        svg1.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        
        var dataLabel = []
        dataLabel.push('DA Util')
        dataLabel.push('WB Util')
        
        legend = svg1.selectAll(".legend")
        .data(dataLabel)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + ((i * 20) + graphHeight*0.87)+ ")"; });          
        legend.append("rect")
        .attr("x", graphWidth - graphWidth*0.98)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i){
            if (d.indexOf('DA') > -1){
                return 'tomato'
            }else{
                return '#3366cc'
            }
            
        });

      // draw legend text
      legend.append("text")
      .attr("x", graphWidth - graphWidth*0.98 + 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "front")
      .text(function(d) { return d;})
      

     // Merge Count
 //    svg1 = d3.select("#status_2").append('svg').attr('width', canvasWidth).attr('height', 400)
 //               .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
 
 //    var xScale = d3.time.scale()
 //        .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.time*1000})])
 //        .range([0, graphWidth]); // FIX
 
 //    var xAxis = d3.svg.axis()
 //        .scale(xScale)
 //        .orient('bottom')
 //        .tickFormat(tickFormat.format)
 //        .tickSize(tickFormat.tickSize); 
 
 //    var yScale = d3.scale.linear()
 //         .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.number})])
 //         .range([graphHeight, 0]);
 
 //    var yAxis = d3.svg.axis()
 //        .scale(yScale)
 //        .orient('left')
 //        .tickSize(2);    
 
 //    svg1.append("text")
 //        .attr('class', 'statusTitle')
 //        .attr("x", (graphWidth / 2))             
 //        .attr("y", 0 - (margin.top / 2))
 //        .text("Merge Count");
 
 //    svg1.append('path')
 //        .attr('class', 'statusLine')
 //        .attr("d", line(productionStatus['MergeCount']))
 
	// svg1.append("g")
	// 	.attr("class", "x axis")
	// 	.attr("transform", "translate(0," + graphHeight + ")")
	// 	.call(xAxis);

	// svg1.append("g")
	// 	.attr("class", "y axis")
	// 	.call(yAxis);


}

//-------------------------------------- KPI Status -----------------------------------------
function displayKPI(lotId){


}

function drawVerticalLine(inputSvg, scaleX, scaleY, max){
 var verticalLine = inputSvg
 .append('line')
 .attr("x1", scaleX((86399)*1000-32400000))
 .attr("y1", scaleY(0))
 .attr("x2", scaleX((86399)*1000-32400000))
 .attr("y2", scaleY(max))
 .style('class','dateDivider')
 .style("stroke-width", 1)
 .style("stroke", "gray")
 var verticalLine2 = inputSvg
 .append('line')
 .attr("x1", scaleX(86399*2*1000-32400000))
 .attr("y1", scaleY(0))
 .attr("x2", scaleX(86399*2*1000-32400000))
 .attr("y2", scaleY(max))
 .style('class','dateDivider')
 .style("stroke-width", 1)
 .style("stroke", "gray")
}


//-------------------------------------- Schedule Object -----------------------------------------

// Creates new scheduleObj with the given properties. 
function scheduleObj(name, ganttData, productInfo, decisionInfo, denominator, KPI, maxTime,
    productionStatus, kpis) {
    this.name = name;
    this.ganttData = ganttData;
    this.productInfo = productInfo;
    this.decisionInfo = decisionInfo;
    this.denominator = denominator;
    this.KPI = KPI;
    this.maxTime = maxTime;
    this.productionStatus = productionStatus;
    this.divID ="";
    this.KPIs = kpis;
}


//-------------------------------- Changing active tab when tabbing------------------------------
// $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
//     activeSchedule = 
// })

//---------------------------- Compare Page Stuff ------------------------------------------------


// at each load it deletes the previous compare contents and creates new ones.
function comparePage(){
	$("#comparepage").html("<br><br>");
	
	var numOfSchedules = schedules.length;
	var widthDivision = window.innerWidth / numOfSchedules;
	widthDivision = widthDivision-15;
	for (var i = 0; i<schedules.length; i ++){
		var s = schedules[i];
		var comparepagediv = document.getElementById("comparepage");
		var newcontainer = document.createElement("div");
		newcontainer.setAttribute("class", "cpagecontainer");
		newcontainer.setAttribute("id","comparepage"+i);
		comparepagediv.appendChild(newcontainer);
		compareHelper(s.KPIs, s.productionStatus,s.KPI, "comparepage" + i, widthDivision, s.name)
	}

}

function compareHelper(TKPIs, TproductionStat, TKPI, conatinerName, dividedW, name){
    
    var canvasWidth = processWidth/3.3;
    graphWidth = dividedW - graphMargin.left - graphMargin.right;
    graphHeight = 400 - graphMargin.top - graphMargin.bottom;
    

     // KPI
     var svg1 = d3.select("#"+conatinerName).append('svg').attr('id', 'KPIText').attr('width', dividedW).attr('height', 400)
     .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
     
     var fontSize = 18; 


     svg1.append("text")
     .attr('class', 'statusTitle')
     .attr("x", (graphWidth / 3))             
     .attr("y", 0 - (margin.top / 2))
     .text(name);
     
     svg1.append("text")
     .attr('class', 'statusTitle')
     .attr("x", 14)             
     .attr("y", 18 - (margin.top / 2))
     .text("KPI");

     var kpis = svg1.selectAll('.KPIs')
     .data(TKPIs)
     kpis.enter()
     .append('g')
     .attr('class', 'KPIs')
     .attr("transform", function(d, i) { return "translate(0," + (i * (fontSize*1.7) +30)+ ")"; })
     .append('text')
     .attr('x', 12)
     .attr('y', 3)
     .text(function(d){
        if(d.key == 'Stocker_size') return d.key + ": " + d.value;
        if(d.key == 'Makespan') return d.key + ": " + (d.value/60).toFixed(1) + " (min)";
        if(d.key == 'Total_Wiplevel') return d.key + ": " + d.value;
        if(d.key == 'AVG_Wiplevel') return d.key + ": " + d.value.toFixed(2);
        if(d.key == 'Waiting_Time') return 'Waiting Time / TAT : ' + d.value.toFixed(3);
        else return d.key + ": " + d.value.toFixed(3);
    })
     .style('font-size', fontSize)
     
     kpis.exit().remove();

     
     svg1 = d3.select("#" + conatinerName).append('br')
    // WIP Level
    svg1 = d3.select("#" + conatinerName).append('svg').attr('width', dividedW).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    var xScale = d3.time.scale()
    .domain([d3.min(TproductionStat['WIPLevel'], function(d){return d.time}), d3.max(TproductionStat['WIPLevel'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(8)
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, TKPI['Stocker_size']+1])
        .range([graphHeight, 0]);
        
        var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
        
        var line = d3.svg.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(+d.number); })
//            .inperpolate('linear') ;


var horizontalLine = svg1
.append('line')
.attr("x1", xScale(d3.min(TproductionStat['WIPLevel'], function(d){return d.time})))
.attr("y1", yScale(TKPI['Stocker_size']))
.attr("x2", xScale(d3.max(TproductionStat['WIPLevel'], function(d){return d.time})))
.attr("y2", yScale(TKPI['Stocker_size']))
.style("stroke-width", 1)
.style("stroke", "red")

drawVerticalLine(svg1, xScale, yScale, TKPI['Stocker_size'])

svg1.append("text")
.attr('class', 'statusTitle')
.attr("x", (graphWidth / 2))             
.attr("y", 0 - (margin.top / 2))
.text("WIP Level");

svg1.append('path')
.attr('class', 'statusLine')
.attr("d", line(TproductionStat['WIPLevel']))

svg1.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + graphHeight + ")")
.call(xAxis);

svg1.append("g")
.attr("class", "y axis")
.call(yAxis);
	
	svg1 = d3.select("#" + conatinerName).append('br')
     // Input Count
     svg1 = d3.select("#" + conatinerName).append('svg').attr('width', dividedW).attr('height', 400)
     .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
     
     var xScale = d3.time.scale()
     .domain([d3.min(TproductionStat['InputCount'], function(d){return d.time}), d3.max(TproductionStat['InputCount'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['InputCount'], function(d){return d.number})])
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
        .attr("d", line(TproductionStat['InputCount']))

        svg1.append('path')
        .attr('class', 'statusLine2')
        .attr("d", line(TproductionStat['InTargetCount']))
        
        svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(xAxis);

        svg1.append("g")
        .attr("class", "y axis")
        .call(yAxis);

        var dataLabel = []
        dataLabel.push('In Target')
        dataLabel.push('투입량')
        
        var legend = svg1.selectAll(".legend")
        .data(dataLabel)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + ((i * 20))+ ")"; });          
        legend.append("rect")
        .attr("x", graphWidth - graphWidth*0.98)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i){ 
            if (d.indexOf('In') > -1){
                return 'tomato'
            }else{
                return '#3366cc'
            }
            
        });

      // draw legend text
      legend.append("text")
      .attr("x", graphWidth - graphWidth*0.98 + 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "front")
      .text(function(d) { return d;})
      
      drawVerticalLine(svg1, xScale, yScale, d3.max(TproductionStat['InputCount'], function(d){return d.number}))
    // Ship Count
    //THIS ONE USED TO BE STATUS_2
    svg1 = d3.select("#" + conatinerName).append('br')
    shipSvg = d3.select("#"+ conatinerName).append('svg').attr('width', dividedW).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + graphMargin.top+ ")");
    
    shipXScale = d3.time.scale()
    .domain([d3.min(TproductionStat['ShipCount'], function(d){return (d.time)}), d3.max(TproductionStat['ShipCount'], function(d){return (d.time)})])
        .range([0, graphWidth]); // FIX
        
        shipXAxis = d3.svg.axis()
        .scale(shipXScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        
        shipYScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['ShipCount'], function(d){return d.number})])
        .range([graphHeight, 0]);
        
        shipYAxis = d3.svg.axis()
        .scale(shipYScale)
        .orient('left')
        .tickSize(2);    
        
        shipSvg.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("산출물");
        
        shipLine = d3.svg.line()
        .x(function(d) { return shipXScale(d.time); })
        .y(function(d) { return shipYScale(+d.number); })

        shipSvg.append('path')
        .attr('id', 'defaultShipLine')
        .attr('class', 'statusLine')
        .attr("d", shipLine(TproductionStat['ShipCount']))
        
        shipSvg.append("g")
        .attr("class", "x axis")
        .attr('id', 'shipXAxis')
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(shipXAxis);

        shipSvg.append("g")
        .attr("class", "y axis")
        .call(shipYAxis);
   // drawVerticalLine(shipSvg, shipXScale, shipYScale, d3.max(productionStatus['ShipCount'], function(d){return d.number}))
   
   var verticalLine = shipSvg
   .append('line')
   .attr("x1", shipXScale(86399*1000-32400000))
   .attr("y1", shipYScale(0))
   .attr("x2", shipXScale(86399*1000-32400000))
   .attr("y2", shipYScale(d3.max(TproductionStat['ShipCount'], function(d){return d.number})))
   .attr('class','dateDividerShip')
   .style("stroke-width", 1)
   .style("stroke", "gray")
   var verticalLine2 = shipSvg
   .append('line')
   .attr("x1", shipXScale(86399*2*1000-32400000))
   .attr("y1", shipYScale(0))
   .attr("x2", shipXScale(86399*2*1000-32400000))
   .attr("y2", shipYScale(d3.max(TproductionStat['ShipCount'], function(d){return d.number})))
   .attr('class','dateDividerShip')
   .style("stroke-width", 1)
   .style("stroke", "gray")
    // Util Graph 
    svg1 = d3.select("#" + conatinerName).append('br')
    svg1 = d3.select("#" + conatinerName).append('svg').attr('width', dividedW).attr('height', 400)
    .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
    
    
    var xScale = d3.time.scale()
    .domain([d3.min(TproductionStat['WB_Util'], function(d){return d.time}), d3.max(TproductionStat['WB_Util'], function(d){return d.time})])
        .range([0, graphWidth]); // FIX
        
        var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
        var yScale = d3.scale.linear()
        .domain([0, d3.max(TproductionStat['WB_Util'], function(d){return d.number+0.02})])
        .range([graphHeight, 0]);
        
        var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .tickSize(2);    
        
        svg1.append("text")
        .attr('class', 'statusTitle')
        .attr("x", (graphWidth / 2))             
        .attr("y", 0 - (margin.top / 2))
        .text("Util Graph");
        
        svg1.append('path')
        .attr('class', 'statusLine2')
        .attr("d", line(TproductionStat['DA_Util']))

        svg1.append('path')
        .attr('class', 'statusLine')
        .attr("d", line(TproductionStat['WB_Util']))

        svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + graphHeight + ")")
        .call(xAxis);

        svg1.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        
        var dataLabel = []
        dataLabel.push('DA Util')
        dataLabel.push('WB Util')
        
        legend = svg1.selectAll(".legend")
        .data(dataLabel)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + ((i * 20) + graphHeight*0.87)+ ")"; });          
        legend.append("rect")
        .attr("x", graphWidth - graphWidth*0.98)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i){
            if (d.indexOf('DA') > -1){
                return 'tomato'
            }else{
                return '#3366cc'
            }
            
        });

      // draw legend text
      legend.append("text")
      .attr("x", graphWidth - graphWidth*0.98 + 20)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "front")
      .text(function(d) { return d;})
      

     // Merge Count
 //    svg1 = d3.select("#status_2").append('svg').attr('width', canvasWidth).attr('height', 400)
 //               .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
 
 //    var xScale = d3.time.scale()
 //        .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.time*1000})])
 //        .range([0, graphWidth]); // FIX
 
 //    var xAxis = d3.svg.axis()
 //        .scale(xScale)
 //        .orient('bottom')
 //        .tickFormat(tickFormat.format)
 //        .tickSize(tickFormat.tickSize); 
 
 //    var yScale = d3.scale.linear()
 //         .domain([0, d3.max(productionStatus['MergeCount'], function(d){return d.number})])
 //         .range([graphHeight, 0]);
 
 //    var yAxis = d3.svg.axis()
 //        .scale(yScale)
 //        .orient('left')
 //        .tickSize(2);    
 
 //    svg1.append("text")
 //        .attr('class', 'statusTitle')
 //        .attr("x", (graphWidth / 2))             
 //        .attr("y", 0 - (margin.top / 2))
 //        .text("Merge Count");
 
 //    svg1.append('path')
 //        .attr('class', 'statusLine')
 //        .attr("d", line(productionStatus['MergeCount']))
 
	// svg1.append("g")
	// 	.attr("class", "x axis")
	// 	.attr("transform", "translate(0," + graphHeight + ")")
	// 	.call(xAxis);

	// svg1.append("g")
	// 	.attr("class", "y axis")
	// 	.call(yAxis);


}