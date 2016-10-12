processWidth = document.body.clientWidth
//processWidth = d3.select('#process').style('width').replace("px", "");
//machineWidth = d3.select('#machine').style('width').replace('px', '');
var testOut;
var fileTest;
var inputData;
var ganttData;
var chart;
var sortedTimes = [];
var clickedElement;

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
        left: 100
        , right: 30
        , top: 30
        , bottom: 30
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
// 추후에 txt 파일에서 읽어오게 해야함

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
				disableOther( 'showRight' );
			};
 function disableOther( button ) {
				if( button !== 'showRight' ) {
					classie.toggle( showRightPush, 'disabled' );
				}
                if( button !== 'showBottom' ) {
					classie.toggle( showBottom, 'disabled' );
				}
			}



function timelineHover(traveledTime) {
    chart = d3.timeline().width(processWidth).stack().margin({
            left: 80
            , right: 30
            , top: 10
            , bottom: 20
        }).traveledTime(traveledTime).showTimeAxisTick().hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            if (d.starting_time > traveledTime) return;
        }).click(function (d, i, datum) {
        
        if(d == clickedElement){
         var rects = d3.selectAll('.operationRect')
         rects.style("fill", function (d, i) {
            return colorCycle[d.productId];
            })   
            
            d3.selectAll('#attribute')
              .classed('cbp-spmenu-open', false)
         }
         else{
            var selectedLotId = d.lotId;
            d3.selectAll('#'+selectedLotId)
            classie.toggle( menuBottom, 'cbp-spmenu-open' );
            displayAttribute(d, datum)
            selectLots(selectedLotId)
            clickedElement = d
         }  
           
        })
    var svg = d3.select("#process").append("svg").attr("width", processWidth);
    svg.datum(ganttData).call(chart);
    
    xScale = chart.exportXScale();
    yScale = chart.exportYScale();
    colorCycle = chart.exportColorCycle();
    d3.select('.operations').data([ganttData]).exit().remove();
    
}

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



// Attribute View
function displayAttribute(d, datum){    
    $('#lotViewer')
        .html('<strong style="font-family:Sans-serif;">' +'Lot Id: '+ d.lotId + '<br>' + '</strong>' 
             +'<strong style="font-family:Sans-serif;">' +'Product Id: '+ d.productId + '<br>' + '</strong>' 
             +'<strong style="font-family:Sans-serif;">' +'Quantity: '+ d.quantity + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Processing Time: '+ (d.ending_time-d.starting_time) + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Operation: '+ d.degree + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Flow: '+ d.flow + '<br>' + '</strong>'
             );
    $('#resourceViewer')
        .html('<strong style="font-family:Sans-serif;">' +'Resource: '+ datum.label + '<br>' + '</strong>'
             +'<strong style="font-family:Sans-serif;">' +'Resource Model: '+ datum.resourceModel + '<br>' + '</strong>'
             );    
}

function selectLots(lotId){
    var rects = d3.selectAll('.operationRect')
    if (lotId.indexOf('_' ) >0){
        lotId = lotId.substring(0, lotId.indexOf('_'))
    } 
    rects.style("fill", function (d, i) {
        if(d.lotId.indexOf(lotId)>-1){
            return colorCycle[d.productId];
        }
        else{
            return 'white'
        }
    })
}