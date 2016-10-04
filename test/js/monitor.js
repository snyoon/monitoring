processWidth = document.body.clientWidth
//processWidth = d3.select('#process').style('width').replace("px", "");
//machineWidth = d3.select('#machine').style('width').replace('px', '');
var testOut;
var fileTest;
var labelTestData;
var openFile = function (event) {
     var input = event.target;
     var reader = new FileReader();
     reader.onload = function () {
         var text = reader.result;
         var node = document.getElementById('output');
//         console.log(reader.result)
         testOut = reader.result;
         labelTestData = JSON.parse(testOut)
         timelineHover(traveledTime);
     };
     reader.readAsText(input.files[0]);
 };


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

var machineStatusTestData = [
    {
        label: "DA001"
        , status: 'proc'
}

, {
        label: "DA002"
        , status: 'idle'
}

, {
        label: "DA003"
        , status: 'idle'
}

, {
        label: "DA004"
        , status: 'down'
}
    , {
        label: "DA005"
        , status: 'proc'
}
      , {
        label: "DA006"
        , status: 'proc'
}
          , {
        label: "DA007"
        , status: 'proc'
}
];
var traveledTime = timeHorizon;


var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

function zoomed() {
  container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}


function timelineHover(traveledTime) {
    var chart = d3.timeline().width(processWidth).stack().margin({
            left: 80
            , right: 30
            , top: 10
            , bottom: 20
        }).traveledTime(traveledTime).showTimeAxisTick().hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            if (d.starting_time > traveledTime) return;
//            var div = $('#hoverRes');
//            var colors = chart.colors();
//            div.find('.coloredDiv').css('background-color', colors[d.productId])
//            div.find('#name').text(d.lotId);
        }).click(function (d, i, datum) {
//            alert(d.lotId);
            var selectedLotId = d.lotId;
            d3.selectAll('#'+selectedLotId)
               
        })
        //          .scroll(function (x, scale) {
        //            $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x+width));
        //          });
    var svg = d3.select("#process").append("svg").attr("width", processWidth);
     svg.datum(labelTestData).call(chart);
}

function getStackPosition(d, i) {
    return margin.top + (itemHeight + itemMargin) * (i) - 5;
}

function getStackTextPosition(d, i) {
    return margin.top + (itemHeight + itemMargin) * (i) + itemHeight * 0.75 - 5;
}

function displayMachine() {
    var chartSvg = d3.select('#process');
    var height = chartSvg.style('height')
    var svg = d3.select('#machine').append('svg').attr('width', machineWidth).attr('height', height);
    var machines = svg.selectAll('.machineName').data(labelTestData).enter();
    // Machine Names
    machines.append('rect').attr('x', 0).attr('y', getStackPosition).attr("width", itemWidth).attr("height", itemHeight).style('fill', 'none').style('stroke', 'black')
    machines.append('text').attr('x', itemWidth / 2).attr('y', getStackTextPosition).style('text-anchor', 'middle').style('font-weight', 'bold').style('fill', 'black').text(function (d) {
            return d.label;
        })
        // Machine Status
    var status = svg.selectAll('.machineStatus').data(machineStatusTestData).enter();
    status.append('rect').attr('x', itemWidth + 10).attr('y', getStackPosition).
    attr('rx', 6).attr('ry', 6).attr("width", itemWidth).attr("height", itemHeight).style('fill', function (d) {
        return statusColorMap[d.status]
    })
    status.append('text').attr('x', itemWidth + 10 + itemWidth / 2).attr('y', getStackTextPosition).style('text-anchor', 'middle').style('font-weight', 'bold').style('fill', 'black').text(function (d) {
        return d.status;
    })
}

// Time Travel
d3.select('#timeButton').on('click', function(){
    time = document.getElementById("traveledTime").value;
    d3.select('#process').selectAll('*').remove()
    timelineHover(time);
    
});

// right side expand
var menuRight = document.getElementById( 'right' ),
    showRightPush = document.getElementById( 'showRight' ),
    body = document.body;

 showRightPush.onclick = function() {
				classie.toggle( this, 'active' );
				classie.toggle( menuRight, 'cbp-spmenu-open' );
				disableOther( 'showRight' );
			};
 function disableOther( button ) {
				if( button !== 'showRight' ) {
					classie.toggle( showRightPush, 'disabled' );
				}
			}

//timelineHover(traveledTime);
//displayMachine();