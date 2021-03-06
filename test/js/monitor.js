processWidth = document.body.clientWidth;
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
 
var currentTab;
// List of products that are actually being worked on. 
var activeProducts=[];
 
var openFile = function (event) {
    activeProducts = [];
    //Deletes the Charts if there were antyhing there..
    // OG CODE REMOVED 
    //d3.select('.remove').remove()
    //d3.select('#chart').selectAll('svg').remove();
    //Makes the bars hidden.
 
    var input = event.target;
    var reader = new FileReader();
    // NEW CODE
    // Stops you from opening multiples of the same file by comparing the file names. 
    reader.onload = function () {
     if(listofnames.indexOf(document.getElementById("myFiles").files[0].name) != -1) {
        window.alert("This file is already in use.");
        return;
    }
    dataCount++;
    var text = reader.result;
    var node = document.getElementById('output');
    testOut = reader.result;
    inputData = JSON.parse(testOut);
    inputCorrectCheck(inputData);
    var index = 0;
    // ~~~~~~~~~~~~~~~~~~scheduleOBJ CREATION~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //Creates the scheduleObj for the read schedule
    // parases through the file input
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

        var temptarget = inputData.LoadAnalysis.TargetInfo;
        var tempproductarray = inputData.LoadAnalysis.ProductInfo;

        //This pushes product IDs that are active into global variable 
        //activeProducts. List is used later to go through json objects.
        for (var i = tempproductarray.length - 1; i >= 0; i--) {
            if (temptarget[tempproductarray[i].productId]) {
                activeProducts.push(tempproductarray[i].productId);
                };
            };
        //~~~~~~~~~~~~END OF SCHEDULEOBJ CREATION~~~~~~~~~~~~~~~~~~~~~~~~~~

        activeSchedule = newSchedule;
        //adds the newly read file onto the list of schedules. 
        schedules.push(newSchedule);
        //adding a tab and tab-content for the chart to the DOC
        if(schedules.length >1){
            //this is making non active tabs 
            var graphTabs = document.getElementById("listOfCharts");
            // var li = document.createElement("li");
            // li.setAttribute("class", "nav");
            // var arbID = divID+"123123";
            // li.setAttribute("id",arbID);
            // var tabA = document.createElement("a");
             var divID = "chartdiv" + schedules.length;
            // var tabhref = "#" + divID;
            // tabA.setAttribute("data-toggle", "tab");
            // tabA.setAttribute("href", tabhref);
            // tabA.appendChild(document.createTextNode(TscheduleName));
 
            // var buttonClose = document.createElement("button");
            // buttonClose.setAttribute("class", "close closeTab");
            // buttonClose.setAttribute("type", "button");
            // buttonClose.appendChild(document.createTextNode("   x"));
            // buttonClose.setAttribute("onclick", "chartRemoveFunction(arbID)");
 
            $("#listOfCharts").append('<li class="nav"><a data-toggle="tab" href="#' + divID + '"><button class="close closeTab" type="button" >×</button>'+TscheduleName+'</a></li>');
            // tabA.appendChild(buttonClose);
            // li.appendChild(tabA);
            // graphTabs.appendChild(li)
            

            // NEW CODE
            // Below sets up the different tabs for each of the uploaded files.
            // (basically sets up the HTML document)

            //creates the tabcontent divs for the loaded files. 
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
 
            // vis timeline
            var chartNavTimeline = document.createElement("li");
            chartNavTimeline.setAttribute("class", "nav");
            var chartNavTimelineA = document.createElement("a");
            chartNavTimelineA.setAttribute("data-toggle", "tab");
            var hrefTL = "tl" +divID;
            newSchedule.divID = hrefTL;
            chartNavTimelineA.setAttribute("href", "#" + hrefTL);
            chartNavTimelineA.appendChild(document.createTextNode("Timeline"));
            chartNavTimeline.appendChild(chartNavTimelineA);
            chartNav.appendChild(chartNavTimeline);

            var chartNavStat = document.createElement("li");
            chartNavStat.setAttribute("class", "nav");
            var chartNavStatA = document.createElement("a");
            chartNavStatA.setAttribute("data-toggle", "tab");
            var href22 = "stat" +divID;
            chartNavStatA.setAttribute("href", "#" + href22);
            chartNavStatA.appendChild(document.createTextNode("Statistics View"));
            chartNavStat.appendChild(chartNavStatA);
            chartNav.appendChild(chartNavStat);
            // KPI TAB
            var chartNavKpi = document.createElement("li");
            chartNavKpi.setAttribute("class", "nav");
            var chartNavKpiA = document.createElement("a");
            chartNavKpiA.setAttribute("data-toggle", "tab");
            var hrefKPI = "kpi" +divID;
            chartNavKpiA.setAttribute("href", "#" + hrefKPI);
            chartNavKpiA.appendChild(document.createTextNode("KPI"));
            chartNavKpi.appendChild(chartNavKpiA);
            chartNav.appendChild(chartNavKpi);
            //Load Analysis Tab
            var chartNavLoad = document.createElement("li");
            chartNavLoad.setAttribute("class", "nav");
            var chartNavLoadA = document.createElement("a");
            chartNavLoadA.setAttribute("data-toggle", "tab");
            var href33 = "load" +divID;
            chartNavLoadA.setAttribute("href", "#" + href33);
            chartNavLoadA.appendChild(document.createTextNode("Load Analysis"));
            chartNavLoad.appendChild(chartNavLoadA);
            chartNav.appendChild(chartNavLoad);

            //WIP Analysis Tab
            var chartNavWip = document.createElement("li");
            chartNavWip.setAttribute("class", "nav");
            var chartNavWipA = document.createElement("a");
            chartNavWipA.setAttribute("data-toggle", "tab");
            var href44 = "wip" +divID;
            chartNavWipA.setAttribute("href", "#" + href44);
            chartNavWipA.appendChild(document.createTextNode("WIP Charts"));
            chartNavWip.appendChild(chartNavWipA);
            chartNav.appendChild(chartNavWip);

            //best EQP  Tab
            var chartNavEQP = document.createElement("li");
            chartNavEQP.setAttribute("class", "nav");
            var chartNavEQPA = document.createElement("a");
            chartNavEQPA.setAttribute("data-toggle", "tab");
            var href55 = "eqp" +divID;
            chartNavEQPA.setAttribute("href", "#" + href55);
            chartNavEQPA.appendChild(document.createTextNode("Best EQP"));
            chartNavEQP.appendChild(chartNavEQPA);
            chartNav.appendChild(chartNavEQP);
 
            //making the different chart content html
            var chartTypesContent = document.createElement("div");
            chartTypesContent.setAttribute("id", "chartTypesContent");
            chartTypesContent.setAttribute("class", "tab-content");
 
            chartNav.appendChild(chartTypesContent);
 
            var scheduleChartDive = document.createElement("div");
            scheduleChartDive.setAttribute("id", href11);
            scheduleChartDive.setAttribute("class","tab-pane fade in active");
            
            var tlChartDive = document.createElement("div");
            tlChartDive.setAttribute("id", hrefTL);
            tlChartDive.setAttribute("class","tab-pane fade in active");

            var statChartDive = document.createElement("div");
            statChartDive.setAttribute("id", href22);
            statChartDive.setAttribute("class","tab-pane fade");
 
            var loadChartDive = document.createElement("div");
            loadChartDive.setAttribute("id", href33);
            loadChartDive.setAttribute("class","tab-pane fade");  

            var wipChartDive = document.createElement("div");
            wipChartDive.setAttribute("id", href44);
            wipChartDive.setAttribute("class","tab-pane fade");  

            var EQPChartDive = document.createElement("div");
            EQPChartDive.setAttribute("id", href55);
            EQPChartDive.setAttribute("class","tab-pane fade"); 

            var KPIChartDive = document.createElement("div");
            KPIChartDive.setAttribute("id", hrefKPI);
            KPIChartDive.setAttribute("class","tab-pane fade");        
 
            chartTypesContent.appendChild(scheduleChartDive);
            chartTypesContent.appendChild(tlChartDive);
            chartTypesContent.appendChild(KPIChartDive);
            chartTypesContent.appendChild(statChartDive);
            chartTypesContent.appendChild(loadChartDive);
            chartTypesContent.appendChild(wipChartDive);
            chartTypesContent.appendChild(EQPChartDive);
 
 
        }else{
            var graphTabs = document.getElementById("listOfCharts");
            // var li = document.createElement("li");
            // //makes this the active tab
            // li.setAttribute("class", "nav active");
 
            // var tabA = document.createElement("a");
            // //id of the tab is the file name
            // tabA.setAttribute("data-toggle", "tab");
             var divID = "chartdiv" + schedules.length;
            // newSchedule.divID = divID;
            // var tabhref = "#" +divID;
            // tabA.setAttribute("href", tabhref);
            // tabA.appendChild(document.createTextNode(TscheduleName));
 
            $("#listOfCharts").append('<li class="nav active"><a data-toggle="tab" href="#' + divID + '"><button class="close closeTab" type="button" >×</button>'+TscheduleName+'</a></li>');
             
 
            // li.appendChild(tabA);
            // graphTabs.appendChild(li);
 
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

            // vis timeline
            var chartNavTimeline = document.createElement("li");
            chartNavTimeline.setAttribute("class", "nav");
            var chartNavTimelineA = document.createElement("a");
            chartNavTimelineA.setAttribute("data-toggle", "tab");
            var hrefTL = "tl" +divID;
            newSchedule.divID = hrefTL;
            chartNavTimelineA.setAttribute("href", "#" + hrefTL);
            chartNavTimelineA.appendChild(document.createTextNode("Timeline"));
            chartNavTimeline.appendChild(chartNavTimelineA);
            chartNav.appendChild(chartNavTimeline);
 
            var chartNavStat = document.createElement("li");
            chartNavStat.setAttribute("class", "nav");
            var chartNavStatA = document.createElement("a");
            chartNavStatA.setAttribute("data-toggle", "tab");
            var href22 = "stat" +divID;
            chartNavStatA.setAttribute("href", "#" + href22);
            chartNavStatA.appendChild(document.createTextNode("Statistics View"));
            chartNavStat.appendChild(chartNavStatA);
            chartNav.appendChild(chartNavStat);
            // KPI TAB
            var chartNavKpi = document.createElement("li");
            chartNavKpi.setAttribute("class", "nav");
            var chartNavKpiA = document.createElement("a");
            chartNavKpiA.setAttribute("data-toggle", "tab");
            var hrefKPI = "kpi" +divID;
            chartNavKpiA.setAttribute("href", "#" + hrefKPI);
            chartNavKpiA.appendChild(document.createTextNode("KPI"));
            chartNavKpi.appendChild(chartNavKpiA);
            chartNav.appendChild(chartNavKpi);
            //Load Analysis Tab
            var chartNavLoad = document.createElement("li");
            chartNavLoad.setAttribute("class", "nav");
            var chartNavLoadA = document.createElement("a");
            chartNavLoadA.setAttribute("data-toggle", "tab");
            var href33 = "load" +divID;
            chartNavLoadA.setAttribute("href", "#" + href33);
            chartNavLoadA.appendChild(document.createTextNode("Load Analysis"));
            chartNavLoad.appendChild(chartNavLoadA);
            chartNav.appendChild(chartNavLoad);

            //WIP Analysis Tab
            var chartNavWip = document.createElement("li");
            chartNavWip.setAttribute("class", "nav");
            var chartNavWipA = document.createElement("a");
            chartNavWipA.setAttribute("data-toggle", "tab");
            var href44 = "wip" +divID;
            chartNavWipA.setAttribute("href", "#" + href44);
            chartNavWipA.appendChild(document.createTextNode("WIP Charts"));
            chartNavWip.appendChild(chartNavWipA);
            chartNav.appendChild(chartNavWip);

            //best EQP  Tab
            var chartNavEQP = document.createElement("li");
            chartNavEQP.setAttribute("class", "nav");
            var chartNavEQPA = document.createElement("a");
            chartNavEQPA.setAttribute("data-toggle", "tab");
            var href55 = "eqp" +divID;
            chartNavEQPA.setAttribute("href", "#" + href55);
            chartNavEQPA.appendChild(document.createTextNode("Best EQP"));
            chartNavEQP.appendChild(chartNavEQPA);
            chartNav.appendChild(chartNavEQP);
 
            //making the different chart content html
            var chartTypesContent = document.createElement("div");
            chartTypesContent.setAttribute("id", "chartTypesContent");
            chartTypesContent.setAttribute("class", "tab-content");
 
            chartNav.appendChild(chartTypesContent);
 
            var scheduleChartDive = document.createElement("div");
            scheduleChartDive.setAttribute("id", href11);
            scheduleChartDive.setAttribute("class","tab-pane fade in active");
 
            var tlChartDive = document.createElement("div");
            tlChartDive.setAttribute("id", hrefTL);
            tlChartDive.setAttribute("class","tab-pane fade in active");

            var statChartDive = document.createElement("div");
            statChartDive.setAttribute("id", href22);
            statChartDive.setAttribute("class","tab-pane fade");
 
            var loadChartDive = document.createElement("div");
            loadChartDive.setAttribute("id", href33);
            loadChartDive.setAttribute("class","tab-pane fade");

            var wipChartDive = document.createElement("div");
            wipChartDive.setAttribute("id", href44);
            wipChartDive.setAttribute("class","tab-pane fade"); 

            var EQPChartDive = document.createElement("div");
            EQPChartDive.setAttribute("id", href55);
            EQPChartDive.setAttribute("class","tab-pane fade");

            var KPIChartDive = document.createElement("div");
            KPIChartDive.setAttribute("id", hrefKPI);
            KPIChartDive.setAttribute("class","tab-pane fade");  
 
            chartTypesContent.appendChild(scheduleChartDive);
            chartTypesContent.appendChild(tlChartDive);
            chartTypesContent.appendChild(KPIChartDive);
            chartTypesContent.appendChild(statChartDive);
            chartTypesContent.appendChild(loadChartDive);
            chartTypesContent.appendChild(wipChartDive);
            chartTypesContent.appendChild(EQPChartDive);
 
        }
        //NEW CODE chartRemoveFunction, production status and load tabe create,
        // compare pages have explanaintiosn at definition
        chartRemoveFunction(TscheduleName);
        timelineHover(traveledTime, href11, TscheduleName);
        timelineCreate(activeSchedule, hrefTL);
        kpiCreate(TKPIs, hrefKPI);
        statViewPage(TproductionStat, href22);
        loadTabCreate(href33,inputData.LoadAnalysis);
        wipTabCreate(href44,TproductionStat["WIP_level_per_product"]);
        eqpTabCreate(href55,TproductionStat["best_EQP"], activeProducts);
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
     
 
    // $("#listOfCharts").on("click", "a", function (e) {
    //     e.preventDefault();
 
    //     $(this).tab('show');
    //     $currentTab = $(this);
    // });
};
 
//NEW CODE
//Gets rid of the selected file from the list of files that have been uploaded
//Just used in case you add a file, delete the file, but the nyou want to reupload the file. 
function chartRemoveFunction(link){
    listofnames.splice(listofnames.indexOf(link));
    $(".closeTab").click(function () {
        var tabContentId = $(this).parent().attr("href");
        $(this).parent().parent().remove(); //remove li of tab
        $('#listOfCharts a:last').tab('show'); // Select first tab
        $(tabContentId).remove(); //remove respective tab content
 
    });
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
 
 
function timelineHover(traveledTime, divID, scheduleName) {
    var boolSelected = false;
    var clickedElement = "";
     
    chart = d3.timeline(divID).width(processWidth).stack().margin(margin)
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
                          else return colorCycle[d.productId];
                  })   
                 // d3.selectAll('#attribute').classed('cbp-spmenu-open', false)
                 boolSelected = false;
                 clickedElement = '';
             }
             else if(d.lotId != clickedElement && boolSelected == true){

 
             }
             else{
                //console.log("This is the selected eventId  " + eventId)
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

    // ---------- Vertical Line ------------
    // TO DO
    console.log(document.getElementById("listOfCharts").offsetHeight);
    heightGraph = document.getElementById(divID).offsetHeight - 50 - (document.getElementById("listOfCharts").offsetHeight * 2);
    var vertical = d3.select("#" + divID)
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "2px")
        .style("height", heightGraph+"px")
        .style("top", (document.getElementById("listOfCharts").offsetHeight *2 +document.getElementById("myFiles").offsetHeight + 18) +"px")
        .style("bottom", "10px")
        .style("left", "0px")
        .style("background", "red");

    d3.select("#" + divID)
        .on("mousemove", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")});

     
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
    
    var lotId = d.lotId;
    if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'))
        var decisionKey = d.degree + '_' + lotId;
    var decisionsArray = decisionInfo[decisionKey];

    if(decisionsArray == null){
        return;
    }else{
        var currentStatus = decisionsArray[0];
    }
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
            // decisionCell.outerHTML = "<th>" + dobj.decision +"</th>"
            decisionCell.innerHTML = dobj.decision;
             
 
            if(i  == decisionsArray.length - 1){
                //UPDATE THIS PLEASE
                decisionCell.innerHTML = "Proto Action"
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
            if(Math.abs(dobj.reward) > 9000){
                rewardCell.innerHTML = "";
            }
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
               width: "auto",
               resize: "auto",
               collision: "none",
               title: lotId,
               position:{my:"right bottom", at: "right bottom"}
 
            });
 });
 
}
 
 
 
function selectLots(lotId, eventId, idofchart){
    var rects = d3.select("#"+idofchart).selectAll('.operationRect')
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
 
 
//---------------------------- Compare Page Stuff ------------------------------------------------
 
 
// at each load it deletes the previous compare contents and creates new ones.
function comparePage(){
    $("#comparepage").html("<br><br>");
     
    var numOfSchedules = schedules.length;
    var widthDivision = window.innerWidth / numOfSchedules;
    widthDivision = widthDivision-20;
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
    var object = TproductionStat;
 
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
    
    var cotainergraphs = document.getElementById(conatinerName);
    var wipObjectDA = object["WIPLevel"].DA;
    var wipObjectWB = object["WIPLevel"].WB;
    var wipDataSet = new vis.DataSet();
    for(var k = 0; k < wipObjectDA.length; k++){
        var time = new Date(wipObjectDA[k].time);
        wipDataSet.add({x:time, y:wipObjectDA[k].number, group:"DA"});
    }
    for(var k = 0; k < wipObjectWB.length; k++){
        var time = new Date(wipObjectWB[k].time);
        wipDataSet.add({x:time, y:wipObjectWB[k].number, group:"WB"})
    }
    var wipGroupData = new vis.DataSet();
    wipGroupData.add({
        id: "DA",
        content: "DA",
        options:{
            drawPoints: false
        },
        style:"stroke:green"
    });
    wipGroupData.add({
        id: "WB",
        content: "WB",
        options:{
            drawPoints: false
        },
        style:"stroke:red"
    });
    var wipGraph = new vis.Graph2d(cotainergraphs,wipDataSet,wipGroupData);
    var minaxWip = wipGraph.getDataRange();
    var wipOption = {
            width: "100%",
            zoomMax: minaxWip.max.getTime() - minaxWip.min.getTime(),
            legend: true,
            dataAxis:{
                left:{
                    title:{
                        text: "WIPLevel"
                    }
                }
            }};
    wipGraph.setOptions(wipOption);

    //~~~~~~~~~~~ END OF WIP GRAPH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~ start of 투입량 Graph~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var inTarObj = object["InTargetCount"];
    var inTarDataSet = new vis.DataSet();
    var inTarGroups = new vis.DataSet();
    var tarHigh = 0;
    var tarLow = 0;
    for(key in inTarObj){
        inTarGroups.add({
            id:key,
            content:key,
            options:{
                drawPoints: false
            }
        });
        var to = inTarObj[key];
        visArrayDatasetAdd(to,inTarDataSet,key, tarHigh, tarLow);
    }

    var inTarGraph = new vis.Graph2d(cotainergraphs, inTarDataSet, inTarGroups);
    var minmaxTar = inTarGraph.getDataRange();
    var intarOption = {
        width: "100%",
        zoomMax: minmaxTar.max.getTime() - minmaxTar.min.getTime(),
        legend: true,
        dataAxis:{
                left:{
                    title:{
                        text: "투입량"
                    }
                }

    }};
    inTarGraph.setOptions(intarOption);
    //~~~~~~~~~~ END~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~ START of 산출물~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var shipCountObj = object["ShipCount"];
    var shipCountData = new vis.DataSet();
    var shipCountGroup = new vis.DataSet();
    var scHigh = 0;
    var scLow =0;
    visArrayDatasetAdd(shipCountObj,shipCountData, "Ship_Count", scHigh, scLow);
    shipCountGroup.add({
            id:"Ship_Count",
            content:"Ship_Count",
            options:{
                drawPoints: false
            }
        });
    var shipCountGraph = new vis.Graph2d(cotainergraphs,shipCountData, shipCountGroup);
    var minmaxSC = shipCountGraph.getDataRange();
    var shipCountOption = {
        width: "100%",
        zoomMax: minmaxSC.max.getTime() - minmaxSC.min.getTime(),
        legend:false,
        dataAxis:{
            left:{
                title:{
                    text:"산출물"
                }
            }
        }
    };
    shipCountGraph.setOptions(shipCountOption);
    // ~~~~~~~~~~~~ END OF 산출물~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~ UTIL GRAPH START ~~~~~~~~~~~~~~~~~~~~~~~~
    var utilObjDA = object["util"].DA;
    var utilObjWB = object["util"].WB;
    var utilData = new vis.DataSet();
    var utilGroup = new vis.DataSet();
    var utilHigh = 0;
    var utilLow = 0;
    visArrayDatasetAdd(utilObjDA, utilData, "DA");
    visArrayDatasetAdd(utilObjWB, utilData, "WB");
    
    utilGroup.add({
        id:"DA",
        content:"DA",
        options:{
            drawPoints: false
        },
        style:"stroke:green"
    });
    utilGroup.add({
        id:"WB",
        content:"WB",
        options:{
            drawPoints: false
        },
        style:"stroke:red"
    });

    var utilGraph = new vis.Graph2d(cotainergraphs, utilData, utilGroup);
    var minmaxutil = utilGraph.getDataRange();
    var utilOption = {
        width: "100%",
        zoomMax: minmaxutil.max.getTime() - minmaxutil.min.getTime(),
        legend: true,
        dataAxis:{
                left:{
                    title:{
                        text: "Util"
                    }
                }

    }};
    utilGraph.setOptions(utilOption);
    //~~~~~~~~~~~~ END OF UTIL GRAPH~~~~~~~~~~~~~~~~~~~~~~~~

 
}
  
function inputCorrectCheck( inputD ){
    if (typeof inputD === 'object' && inputD !== null){
        Object.keys(inputD).forEach(function(key,index){
 
            if(typeof inputD[key]==='object'){
                inputCorrectCheck(inputD[key]);
            }
            if(Array.isArray(inputD[key]) && inputD[key].length == 0){
                console.log("Fix the array in ");
                console.log(inputD);
            }
            if(Object.keys(inputD[key]).length === 0 && inputD[key].constructor === Object){
                console.log("fix the key "+ key +" in ");
                console.log(inputD);
            }
        })
    }
}
 

 //NEW CODE
// creates the statistics table and links it to the statistics tab
// divID: id of the div that it should be under in HTML DOC
// LAjsonobj is the  id the loadanylisys portion of the input file
// so since the data is seperated by products, we put all the data into productOBJ's 
// and then take those objects and go through them and add each one to a table that we create. 
function loadTabCreate(divID, LAjsonobj){
 //~~~~~~~~~~~~~~~~~~~~~~~ Parsing the file~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var TargetObject = LAjsonobj.TargetInfo;
    var Productarray = LAjsonobj.ProductInfo;
    var filteredProductarray = [];
    for (var i = Productarray.length - 1; i >= 0; i--) {
        if (TargetObject[Productarray[i].productId]) {
            filteredProductarray.push(Productarray[i]);
        };
    };
     
    var LoadObject = LAjsonobj.LoadInfo;
    var div = document.getElementById(divID);
    var listofProducts = [];

    //~~~~~~~~~~~~~~~~~~~~~~~~ making the productobjs~~~~~~~~~~~~~~~~~~~~~~~~~~~
    for(var i =0; i<filteredProductarray.length; i++){
        var tempid = filteredProductarray[i].productId;
        var tempPO = new productOBJ(tempid, filteredProductarray[i].processingTime.DA, Productarray[i].processingTime.WB, TargetObject[tempid], LoadObject[tempid]);
        listofProducts.push(tempPO);
    }
    listofProducts.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);} ); 
    var table = document.createElement("table");
    //~~~~~~~~~~~~~Creating the table~~~~~~~~~~~~~~~~~~~~~~

    var header = table.createTHead();
    var rowHeader = header.insertRow(0);
    var header1cell = rowHeader.insertCell(0);
    header1cell.setAttribute("colspan", 4);
    header1cell.innerHTML= "Product Info";
    var numbOfDays = listofProducts[0].target.length;
    var numbOfDaysLoad = listofProducts[0].load.DA.length;
 
    var header2cell = rowHeader.insertCell(1);
    header2cell.setAttribute("colspan", 2*numbOfDays);
    header2cell.innerHTML= "Production Target";
 
    var header3cell = rowHeader.insertCell(2);
    header3cell.setAttribute("colspan", 2*numbOfDaysLoad);
    header3cell.innerHTML= "M/C required";
 
    var row2Header = header.insertRow(1);
    var row2c0 = row2Header.insertCell(0);
    row2c0.setAttribute("rowspan",2);
    row2c0.innerHTML="Product Group";
    var row2c1 = row2Header.insertCell(1);
    row2c1.setAttribute("rowspan",2);
    row2c1.innerHTML="Product";
    var row2c2 = row2Header.insertCell(2);
    row2c2.setAttribute("rowspan",2);
    row2c2.innerHTML="Resource";
    var row2c3 = row2Header.insertCell(3);
    row2c3.setAttribute("rowspan",2);
    row2c3.innerHTML="Process Time(sum)";
    //these just make the nice day headings under the 
    // target and laod 
    topDayCells(row2Header,4,numbOfDays);
    topDayCells(row2Header, 4+ numbOfDays, numbOfDaysLoad);
 
    var row3header = header.insertRow(2);
    dayCells(row3header,0, numbOfDays);
    dayCells(row3header, 0 + (numbOfDays *2), numbOfDaysLoad);
    //goes and fil lthe table
    for(var ii = 0; ii < listofProducts.length; ii++){
        var tempProduct = listofProducts[ii];
        tableLoadFiller(0,tempProduct,(numbOfDays*2), table,(numbOfDaysLoad*2));
    }
    table.style.textAlign ="center";
    table.style.position ="relative";
    table.style.top = "10px";
    table.style.fontSize = "140%";
    div.appendChild(table);
}

function topDayCells(row,startIndex, nOD){
    var daytracker=1;
    for(var i = startIndex; i<startIndex + (nOD); i++){
        var tempCell = row.insertCell(i);
        tempCell.setAttribute("colspan", 2);
        tempCell.innerHTML = "Day " + daytracker;
        daytracker++;
    }
 
}
 
function tableLoadFiller(index, product,days,table,daysload){
    var tracker =0;
    var temprow = table.insertRow(-1);
    var temprow2 = table.insertRow(-1);
    temprow2.style.background = "#ffcc99";
 
    if(!tableCheckForPG(table, product.group)){
        var c10 = temprow.insertCell(0);
        c10.innerHTML = product.group;
        var c11 = temprow.insertCell(1);
        c11.innerHTML = product.productid;
        var c12 = temprow.insertCell(2);
        c12.innerHTML = "DA";
        var c13 = temprow.insertCell(3);
        c13.innerHTML = product.processTimeDA;
        tracker = 0;
        for(var i = 0; i<days;i++){
           var tempcell = temprow.insertCell(4+i);
           tempcell.style.padding="5px"
           if(i%2 == 0){
                tempcell.innerHTML = product.target[tracker].target;
            }else{
                tempcell.innerHTML = product.target[tracker].actual;
                tracker++
            }
        }
        tracker = 0;
        for(var i = 0; i<daysload;i++){
           var tempcell = temprow.insertCell(4+(days)+i);
           tempcell.style.padding="5px"
            if(i%2 == 0){
                tempcell.innerHTML = Math.round(product.load.DA[tracker].expected * 10000)/10000;
            }else{
                tempcell.innerHTML = Math.round(product.load.DA[tracker].actual * 10000)/10000;
                tracker++;
            }
        }
 
        var c20 = temprow2.insertCell(0);
        c20.innerHTML = "";
        var c21 = temprow2.insertCell(1);
        c21.innerHTML = product.productid;
        var c22 = temprow2.insertCell(2);
        c22.innerHTML = "WB";
        var c23 = temprow2.insertCell(3);
        c23.innerHTML = product.processTimeWB;
        tracker = 0;
        for(var i = 0; i<days;i++){
           var tempcell = temprow2.insertCell(4+i);
           tempcell.style.padding="5px"
           if(i%2 == 0){
                //tempcell.innerHTML = product.target[i].target;
            }else{
                //tempcell.innerHTML = product.target[i].actual;
            }
        }
        tracker = 0;
        for(var i = 0; i<daysload;i++){
           var tempcell = temprow2.insertCell(4+(days)+i);
           tempcell.style.padding="5px"
            if(i%2 == 0){
                tempcell.innerHTML = Math.round(product.load.WB[tracker].expected * 10000)/10000;
            }else{
                tempcell.innerHTML = Math.round(product.load.WB[tracker].actual * 10000)/10000;
                tracker++;
            }
        }
    }else{
        var c10 = temprow.insertCell(0);
        c10.innerHTML = "";
        var c11 = temprow.insertCell(1);
        c11.innerHTML = product.productid;
        var c12 = temprow.insertCell(2);
        c12.innerHTML = "DA";
        var c13 = temprow.insertCell(3);
        c13.innerHTML = product.processTimeDA;
        tracker = 0;
        for(var i = 0; i<days;i++){
           var tempcell = temprow.insertCell(4+i);
           tempcell.style.padding="5px"
           if(i%2 == 0){
                tempcell.innerHTML = product.target[tracker].target;
            }else{
                tempcell.innerHTML = product.target[tracker].actual;
                tracker++;
            }
        }
        tracker =0;
        for(var i = 0; i<daysload;i++){
           var tempcell = temprow.insertCell(4+(days)+i);
           tempcell.style.padding="5px"
            if(i%2 == 0){
                tempcell.innerHTML = Math.round(product.load.DA[tracker].expected * 10000)/10000;
            }else{
                tempcell.innerHTML = Math.round(product.load.DA[tracker].actual * 10000)/10000;
                tracker++;
            }
        }
        var c20 = temprow2.insertCell(0);
        c20.innerHTML = "";
        var c21 = temprow2.insertCell(1);
        c21.innerHTML = product.productid;
        var c22 = temprow2.insertCell(2);
        c22.innerHTML = "WB";
        var c23 = temprow2.insertCell(3);
        c23.innerHTML = product.processTimeWB;
        for(var i = 0; i<days;i++){
           var tempcell = temprow2.insertCell(4+i);
           tempcell.style.padding="5px"
           if(i%2 == 0){
                //tempcell.innerHTML = product.target[i].target;
            }else{
                //tempcell.innerHTML = product.target[i].actual;
            }
        }
        tracker =0;
        for(var i = 0; i<daysload;i++){
           var tempcell = temprow2.insertCell(4+(days)+i);
           tempcell.style.padding="5px"
            if(i%2 == 0){
                tempcell.innerHTML = Math.round(product.load.WB[tracker].expected * 10000)/10000;
            }else{
                tempcell.innerHTML = Math.round(product.load.WB[tracker].actual * 10000)/10000;
                tracker++;
            }
        }
    }
 
}
 
function tableCheckForPG(table, toInsert){
    var filter = toInsert.toUpperCase();
    var tr = table.getElementsByTagName("tr");
    var td;
    for(var i = 0; i<tr.length; i++){
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                return true;
            }else {
                 
            }
        } 
    }
    return false;   
}
 
function dayCells(row, startIndex, nOD){
    var tracker = 0;
    var daytracker=1;
    for(var i = startIndex; i<startIndex + (2*nOD); i++){
        var tempCell = row.insertCell(i);
        if(tracker%2==0){
            tempCell.innerHTML = "Target";
            tempCell.setAttribute("font-size", "75%");
            daytracker++;
        }else{
            tempCell.innerHTML = "Actual";
            tempCell.setAttribute("font-size", "75%");
        }
        tracker++;
    }
}

function productOBJ(id, datime, wbtime, target, load){
    this.id = id;
 
    this.group = id.split("_")[0];
    this.productid= id.split("_")[1]
 	
    this.processTimeWB = wbtime.toFixed(2);
    this.processTimeDA = datime.toFixed(2);
    this.target= target;
    this.load = load;
}

function wipTabCreate(divID, jSon){
    $("#"+divID).html("<br><br><br>");
    var numberOfCharts = jSon.length;
    var values = jSon.values;
    var container = document.getElementById(divID);
    
    var table = document.createElement("table");
    var tablebody = document.createElement("tbody");
    table.appendChild(tablebody);
    container.appendChild(table);
    table.setAttribute("border", "0");

    for (var i = 0; i < numberOfCharts; i++) {
        //Table row + cell cration
        var row = document.createElement("tr");
        var totalcell = document.createElement("td");
        var percell = document.createElement("td");
        row.appendChild(totalcell);
        row.appendChild(percell)
        tablebody.appendChild(row);

        var listofgroups = [];
        var dataset = new vis.DataSet();
        var datasetSums = new vis.DataSet();
        var currentValue = jSon[i];
        var productValue;
        var keysss;
        for(key in currentValue){
            productValue = currentValue[key];
            keysss= key
        }
        for (var x = 0; x < productValue.WB.length; x++) {
            wipDataAdd(productValue.WB[x], dataset, listofgroups, datasetSums, "WB_Total");
        }
        for (var x = 0; x < productValue.DA.length; x++) {
            wipDataAdd(productValue.DA[x], dataset, listofgroups, datasetSums, "DA_Total");
        }
        var options = {
            width: "100%",
            legend: true,
            dataAxis:{
                left:{
                    title:{
                        text: keysss
                    }
                }
            }};

        var groupDataSet = new vis.DataSet();
        for(var s = 0; s <listofgroups.length; s++){
            var groupTemp={
                id: listofgroups[s],
                content: listofgroups[s],
                options:{
                    drawPoints: false
                }
            }
            groupDataSet.add(groupTemp);
        }
        var groupDataSetSums = new vis.DataSet();

        var tempgbtotal = {
                id: "WB_Total",
                content: "WB_Total",
                style:"stroke:red",
                options:{
                    interpolation: false,
                    drawPoints: false
                }
            }
        var tempgwtotal = {
                id: "DA_Total",
                content: "DA_Total",
                style:"stroke:green",
                options:{
                    interpolation: false,
                    drawPoints: false
                }
            } 
        groupDataSetSums.add(tempgbtotal);
        groupDataSetSums.add(tempgwtotal);
        var options2 = {
            width: "100%",
            legend: true,
            dataAxis:{
                left:{
                    title:{
                        text: keysss + " TOTAL"
                    }
                }
            }};
        //~~~~~~~~~~~ Summnation data ~~~~~~~~~~~~~~~~

        var graph2d = new vis.Graph2d(totalcell, datasetSums, groupDataSetSums,options2);
        var graph2d = new vis.Graph2d(percell, dataset, groupDataSet, options);   
    }

}

function wipDataAdd(object, dataset, listofgroups, datasetsum, sumgroup){
    var group = object.id;
    if(group == "all"){
        var plots = object.plots;
        for(var i = 0; i < plots.length; i++){
            var time = new Date(plots[i].time);
            datasetsum.add({x: time, y:plots[i].number, group: sumgroup});
        }
    }else{
        if(!(listofgroups.includes(group))){
            listofgroups.push(group);
        }
        var plots = object.plots;
        for(var i = 0; i < plots.length; i++){
            var time = new Date(plots[i].time);
            dataset.add({x: time, y:plots[i].number, group: group});
        }
    }
}



function eqpTabCreate(divID, object, listofProducts){
    $("#"+divID).html("<br><br><br>");
    var container = document.getElementById(divID);
    var values = object;

    //~~~~~~~~~~~~~~~~~~~~~~ COLOR OF THE LINES~~~~~~~~~~~~~~~~~~~~~~~
    // match this wit hwhat you have in d3-timeline
    var c10 = d3.scale.category10();
    var colorDomain = ["2MCP_01", "2MCP_02", "2MCP_03"]
    c10.domain(colorDomain);
    var colorCycle = {
        "2MCP_01" : c10("2MCP_01"), 
        "2MCP_02" : c10("2MCP_02"),
        "2MCP_03" : c10("2MCP_03"),
        // 'SDP_01': '#2A75A6',
        // 'SDP_02': '#AEC6EB',
        // 'SDP_03': '#FD7E12',
        // 'DDP_01': '#FCB972',
        // 'DDP_02': '#2AA12D',
        // 'DDP_03': '#A0D993',
        // 'DDP_04': '#8BC432',
        // 'QDP_01': '#FF9894',
        // 'QDP_02': '#9663C3',
        // '2MCP_01': '#C8ADDB',
        // '2MCP_02': '#8B5844',
        // '3MCP_01': '#C19992',
        // '3MCP_02': '#D87CC6',
        // '4MCP_01': '#F9B8D3',
        // '4MCP_02': '#7E7E7E'
        };
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    for( var i = 0; i < values.length; i++){
        var dawb;
        var dataset = new vis.DataSet();
        var groupDataSetEQP = new vis.DataSet();
        var keysss;
        for(key in values[i]){
            dawb = values[i][key];
            keysss = key;
        }
        for(var x = 0; x < listofProducts.length; x++){
            var temppro = dawb[listofProducts[x]];
            for(var k = 0; k< temppro.length; k++){
                eqpDataAdd(temppro[k], dataset, listofProducts[x]);
            }
            var groupTemp={
                id: listofProducts[x],
                content: listofProducts[x],
                options:{
                    interpolation: false,
                    drawPoints: false
                },
            }
            groupTemp.style = "stroke:" +c10(listofProducts[x]);
            groupDataSetEQP.add(groupTemp);
 
        }

        groupDataSetEQP.add({
                id:"to",
                content: "To",
                options:{
                    interpolation: false,
                    style:"points",
                    drawPoints:{
                        style:"circle"
                    }
                }
        });
        groupDataSetEQP.add({
                id:"from",
                content: "From",
                options:{
                    interpolation: false,
                    style:"points",
                    drawPoints:{
                        style:"square"
                    }
                }
        });
        //this loop to get the setup plot points and make a scatter plot
        var setupPlots = dawb.setup;
        for(var x=0; x<setupPlots.length;x++){
            var tempSetup = setupPlots[x];
            var items = dataset.get({
                filter: function (item) {
                    var timetemp = Date.parse(item.x);
                    return (timetemp == tempSetup.time);
                }
            });
            var toitem = items.filter(  
                function (value) {  
                    return (value.group === tempSetup.to);  
                }  
            );
            var fromitem = items.filter(  
                function (value) {  
                    return (value.group === tempSetup.from);  
                }  
            );
            dataset.add({x:toitem[0].x, y:toitem[0].y, group:"to"});
            dataset.add({x:fromitem[0].x, y:fromitem[0].y, group:"from"})
        }

        var options = {
            width: "100%",
            legend: true,
            dataAxis:{
                left:{
                    title:{
                        text: keysss
                    }
                }
            }};
        var graph2d = new vis.Graph2d(container, dataset, groupDataSetEQP, options)  
    }

}

function eqpDataAdd(object, dataset, group){
    var time = new Date(object.time);
    dataset.add({x:time, y: object.number, group: group});
}

function statViewPage(object, divID){
    $("#"+divID).html("<br><br><br>");
    var container = document.getElementById(divID);
    // gonna make a table for the layout
    var table = document.createElement("table");
    var tablebody = document.createElement("tbody");

    var row1 = document.createElement("tr");
    var wipcell = document.createElement("td");
    var intarcell = document.createElement("td");
    row1.appendChild(wipcell);
    row1.appendChild(intarcell);
    var row2 = document.createElement("tr");
    var shipcountcell = document.createElement("td");
    var utilcell = document.createElement("td");
    row2.appendChild(shipcountcell);
    row2.appendChild(utilcell);
    tablebody.appendChild(row1);
    tablebody.appendChild(row2);

    table.appendChild(tablebody);
    container.appendChild(table);
    table.setAttribute("border", "0");
    //container.setAttribute("class", "statcontainer");
    //~~~~~~~~~~~~~~~ WIP GRAPH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var wipObjectDA = object["WIPLevel"].DA;
    var wipObjectWB = object["WIPLevel"].WB;
    var wipDataSet = new vis.DataSet();
    for(var k = 0; k < wipObjectDA.length; k++){
        var time = new Date(wipObjectDA[k].time);
        wipDataSet.add({x:time, y:wipObjectDA[k].number, group:"DA"});
    }
    for(var k = 0; k < wipObjectWB.length; k++){
        var time = new Date(wipObjectWB[k].time);
        wipDataSet.add({x:time, y:wipObjectWB[k].number, group:"WB"})
    }
    var wipGroupData = new vis.DataSet();
    wipGroupData.add({
        id: "DA",
        content: "DA",
        options:{
            interpolation: false,
            drawPoints: false
        },
        style:"stroke:green"
    });
    wipGroupData.add({
        id: "WB",
        content: "WB",
        options:{
            interpolation: false,
            drawPoints: false
        },
        style:"stroke:red"
    });
    var wipGraph = new vis.Graph2d(wipcell,wipDataSet,wipGroupData);
    var minaxWip = wipGraph.getDataRange();
    var wipOption = {
            zoomMax: minaxWip.max.getTime() - minaxWip.min.getTime(),
            legend: true,
            dataAxis:{
                left:{
                    title:{
                        text: "WIPLevel"
                    }
                }
            }};
    wipGraph.setOptions(wipOption);


    //~~~~~~~~~~~ END OF WIP GRAPH~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //~~~~~~~~~~~~~ start of 투입량 Graph~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var inTarObj = object["InTargetCount"];
    var inTarDataSet = new vis.DataSet();
    var inTarGroups = new vis.DataSet();
    var tarHigh = 0;
    var tarLow = 0;
    for(key in inTarObj){
        inTarGroups.add({
            id:key,
            content:key,
            options:{
                interpolation: false,
                drawPoints: false
            }
        });
        var to = inTarObj[key];
        visArrayDatasetAdd(to,inTarDataSet,key, tarHigh, tarLow);
    }

    var inTarGraph = new vis.Graph2d(intarcell, inTarDataSet, inTarGroups);
    var minmaxTar = inTarGraph.getDataRange();
    var intarOption = {
        zoomMax: minmaxTar.max.getTime() - minmaxTar.min.getTime(),
        legend: true,
        dataAxis:{
                left:{
                    title:{
                        text: "투입량"
                    }
                }

    }};
    inTarGraph.setOptions(intarOption);
    //~~~~~~~~~~ END~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~ START of 산출물~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    var shipCountObj = object["ShipCount"];
    var shipCountData = new vis.DataSet();
    var shipCountGroup = new vis.DataSet();
    var scHigh = 0;
    var scLow =0;
    visArrayDatasetAdd(shipCountObj,shipCountData, "Ship_Count", scHigh, scLow);
    shipCountGroup.add({
            id:"Ship_Count",
            content:"Ship_Count",
            options:{
                interpolation: false,
                drawPoints: false
            }
        });
    var shipCountGraph = new vis.Graph2d(shipcountcell,shipCountData, shipCountGroup);
    var minmaxSC = shipCountGraph.getDataRange();
    var shipCountOption = {
        zoomMax: minmaxSC.max.getTime() - minmaxSC.min.getTime(),
        legend:false,
        dataAxis:{
            left:{
                title:{
                    text:"산출물"
                }
            }
        }
    };
    shipCountGraph.setOptions(shipCountOption);
    // ~~~~~~~~~~~~ END OF 산출물~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~ UTIL GRAPH START ~~~~~~~~~~~~~~~~~~~~~~~~
    var utilObjDA = object["util"].DA;
    var utilObjWB = object["util"].WB;
    var utilData = new vis.DataSet();
    var utilGroup = new vis.DataSet();
    var utilHigh = 0;
    var utilLow = 0;
    visArrayDatasetAdd(utilObjDA, utilData, "DA");
    visArrayDatasetAdd(utilObjWB, utilData, "WB");
    
    utilGroup.add({
        id:"DA",
        content:"DA",
        options:{
            interpolation: false,
            drawPoints: false
        },
        style:"stroke:green"
    });
    utilGroup.add({
        id:"WB",
        content:"WB",
        options:{
            interpolation: false,
            drawPoints: false
        },
        style:"stroke:red"
    });

    var utilGraph = new vis.Graph2d(utilcell, utilData, utilGroup);
    var minmaxutil = utilGraph.getDataRange();
    var utilOption = {
        zoomMax: minmaxutil.max.getTime() - minmaxutil.min.getTime(),
        legend: true,
        dataAxis:{
                left:{
                    title:{
                        text: "Util"
                    }
                }

    }};
    utilGraph.setOptions(utilOption);
    //~~~~~~~~~~~~ END OF UTIL GRAPH~~~~~~~~~~~~~~~~~~~~~~~~
}


function visArrayDatasetAdd(array,dataset,group, high, low){
    for(var k = 0; k < array.length; k++){
        var time = new Date(array[k].time);
        dataset.add({x:time, y:array[k].number, group:group});
    }
}

function kpiCreate(array, divID){
    $("#"+divID).html("<br><br><br>");
    var canvasWidth = processWidth/3.3;
    graphWidth = canvasWidth - graphMargin.left - graphMargin.right;
    graphHeight = 400 - graphMargin.top - graphMargin.bottom;
    
 
     // KPI
     var svg1 = d3.select("#"+divID).append('svg').attr('id', 'KPIText').attr('width', canvasWidth).attr('height', 400)
     .append('g').attr("transform", "translate(" + graphMargin.left + "," + (graphMargin.top)+ ")");
      
     var fontSize = 18; 
     svg1.append("text")
     .attr('class', 'statusTitle')
     .attr("x", (graphWidth / 2))             
     .attr("y", 0 - (margin.top / 2))
     .text("KPI");
     var kpis = svg1.selectAll('.KPIs')
     .data(array)
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
 
}

function timelineCreate(schedule, div){
    var container = document.getElementById(div);

    var tlINFO = schedule.ganttData;
    var scheduleName = schedule.name;
    var idnum= 1;
    var listofClasses = [];
    //CREATE STYLES FOR ALL THE DIFFERENT PRODUCT GROUPS

    var data = new vis.DataSet();
    var listOfGroups = []
    var groups = new vis.DataSet();
    for (var i = 0; i < tlINFO.length; i++) {
        indivObjectHandler(tlINFO[i], data, schedule.Decision, scheduleName, listOfGroups, listofClasses);
    }
    for(var i =0; i < listOfGroups.length; i++){
        groups.add({id: listOfGroups[i], content: listOfGroups[i]})
    }

    var options = {
        width:'100%',
        //height: window.innerHeight - document.getElementById("myFiles").offsetHeight - (document.getElementById("listOfCharts").offsetHeight * 2),
        //maxHeight: window.innerHeight - document.getElementById("myFiles").offsetHeight - (document.getElementById("listOfCharts").offsetHeight * 2),
        zoomMax: 31556952000,
        stackSubgroups: false,
        groupOrder: "id",
        stack: false,
        orientation: {
            axis: "both"},
        margin: {
            item : {
                horizontal : 0
            }
        }
    };

    // Create CSS Style Sheet for the timeline 
    var sheet = (function() {
        // Create the <style> tag
        var style = document.createElement("style");

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
    })();

    cssStyleCreate(sheet, listofClasses);
    //var timeline = new vis.Timeline(container, data, groups, options);
    var timeline = new vis.Timeline(container);
    timeline.setOptions(options);
    timeline.setGroups(groups);
    timeline.setItems(data);
    timeline.on('select', function(properties){
        var temp = data.get(properties.items[0]);
        multiSelectClick(timeline, temp, data);
    })
    // timeline.on('doubleClick', function(properties){
    //     var decisionInfo = alldecisionInfo[scheduleName];
    //     var productInfo = allProductInfo[scheduleName];
    //     var denominator = allDenominator[scheduleName];

        
    // })
}

function multiSelectClick(timeline, clicked, list){
    var look = clicked.content;
    var group11 =[];
    var group2 = list.get({
        filter: function(item){
            if(item.content == look){
                        group11.push(item.id);
                        return(item.id);
                    }}
    })

   timeline.setSelection(group11);
    
}


function indivObjectHandler(object, data, decision, schedulename, listofGroups, listofClasses){
    var times = object.times;
    var idnum = 1;
    var objectlabel = object.label;
    for(var i = 0; i < times.length; i++){

        var idididid = times[i].lotId;
        if(idididid.indexOf('_')>0) idididid = idididid.substring(0, idididid.indexOf('_'))
        var decisionKey = times[i].degree + '_' + idididid;
        //FORMAT TIME 
        var STARTDATE = times[i].new_start_time;
        STARTDATE = STARTDATE.replace(" ", "T");
        STARTDATE = STARTDATE + "Z";
        var sd = new Date(times[i].starting_time);
        var ENDDATE = times[i].new_end_time;
        ENDDATE = ENDDATE.replace(" ", "T");
        ENDDATE = ENDDATE + "Z";
        var ed = new Date(times[i].ending_time);
        var idid = objectlabel + idnum;
        var lotId = times[i].lotId;
        if(lotId.indexOf('_')>0) lotId = lotId.substring(0, lotId.indexOf('_'));
        if(lotId.includes("Setup")){
           var lotIdID = '\u200b';
           var classID = "setup";

        }else if(lotId.includes("RESERVED")){
            var classID = "reserve";
            var lotIdID ='\u200b';
        }else{
            var lotIdID = lotId.substr(lotId.length - 4);
            var classID = times[i].productId;
            //classID= classID.replace('_', "");
            if(listofClasses.indexOf(classID)<0){
                listofClasses.push(classID);
            }
        }

        var decisionKey = times[i].degree + '_' + lotId;
        if(decisionKey.indexOf("Setup")>0){
            //decisionKey = decisionKey + idnum;
            decisionKey = times[i].eventId;
        }else if(decisionKey.indexOf("RESEREVD")){
            //decisionKey = decisionKey + idnum;
            decisionKey = times[i].eventId;
        }
        if((ed + sd ) != (2 * ed)){
         data.add({id: decisionKey, text: times[i].productId, start: sd, end: ed,
             group: objectlabel, subgroup: objectlabel, className: numberToString(classID), content: lotIdID});
        }

        if(listofGroups.indexOf(objectlabel)<0){
            listofGroups.push(objectlabel);
        }

        idnum++;
    }

}

function addCSSRule(sheet, selector, rules, index) {
    if("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
    }
}

function cssStyleCreate(sheet, list){
    //~~~~~~~~~~~~~~~~~~~~~~ COLOR OF THE BOXES~~~~~~~~~~~~~~~~~~~~~~~
    // match this wit hwhat you have in d3-timeline
    var c10 = d3.scale.category10();
    var colorDomain = ["2MCP_01", "2MCP_02", "2MCP_03"]
    c10.domain(colorDomain);
    var colorCycle = {
        "2MCP_01" : c10("2MCP_01"), 
        "2MCP_02" : c10("2MCP_02"),
        "2MCP_03" : c10("2MCP_03"),
        // 'SDP_01': '#2A75A6',
        // 'SDP_02': '#AEC6EB',
        // 'SDP_03': '#FD7E12',
        // 'DDP_01': '#FCB972',
        // 'DDP_02': '#2AA12D',
        // 'DDP_03': '#A0D993',
        // 'DDP_04': '#8BC432',
        // 'QDP_01': '#FF9894',
        // 'QDP_02': '#9663C3',
        // '2MCP_01': '#C8ADDB',
        // '2MCP_02': '#8B5844',
        // '3MCP_01': '#C19992',
        // '3MCP_02': '#D87CC6',
        // '4MCP_01': '#F9B8D3',
        // '4MCP_02': '#7E7E7E'
        };

    for (var i = 0; i < list.length; i++) {
        var rule = "border-color: " + c10(list[i]) +"; background-color: "+ c10(list[i]) +";";
        var strinadjust = "."+ numberToString(list[i]);
        addCSSRule(sheet, strinadjust, rule);     
    }

    var diagonal = "color: white; background: repeating-linear-gradient(45deg,#FFFFFF,#FFFFFF 2px,#000000 2px,#000000 4px);"
    addCSSRule(sheet, ".reserve", diagonal);
    
    addCSSRule(sheet, ".setup", "border-color: #000000; background-color: #000000;")   
}

function numberToString(string){
    string = string.replace("1", "one");
    string = string.replace("3", "three");
    string = string.replace("2", "two");
    string = string.replace("4", "four");
    string = string.replace("5", "five");
    string = string.replace("6", "six");
    string = string.replace("7", "seven");
    string = string.replace("8", "eight");
    string = string.replace("9", "nine");
    string = string.replace("0", "zero");
    return string;
}

