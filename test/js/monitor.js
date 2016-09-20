processWidth = d3.select('#process').style('width').replace("px", "");
machineWidth = d3.select('#machine').style('width').replace('px', '');
var margin = {
        left: 30
        , right: 30
        , top: 30
        , bottom: 30
    }
    , itemHeight = 20
    , itemMargin = 5
    , itemWidth = 80;
var statusColorMap = {
        'proc': '4FB81C'
        , 'idle': 'F0AB00'
        , 'setup': 'C2C2C2'
        , 'down': 'FF0000'
    }
    // 추후에 txt 파일에서 읽어오게 해야함
var labelTestData = [
    {
        label: "DA001"
        , times: [{
                "starting_time": 0
                , "ending_time": 7200
                , "lotId": "L00001"
                , 'productId': 'SDP_01'
            }
            , {
                "starting_time": 10000
                , "ending_time": 30000
                , "lotId": "L00002"
                , 'productId': 'SDP_03'
            }]
    }
    , {
        label: "DA002"
        , times: [{
            "starting_time": 4000
            , "ending_time": 10000
            , "lotId": "L00003"
            , 'productId': 'DDP_01'
        }, ]
    }
    , {
        label: "DA003"
        , times: [{
            "starting_time": 200
            , "ending_time": 8570
            , "lotId": "L00004"
            , 'productId': 'DDP_02'
        }]
    }
    , {
        label: "DA004"
        , times: [{
            "starting_time": 2000
            , "ending_time": 7900
            , "lotId": "L00005"
            , 'productId': 'SDP_01'
        }]
    }
    , {
        label: "DA005"
        , times: [{
            "starting_time": 8000
            , "ending_time": 41000
            , "lotId": "L00007"
            , 'productId': 'SDP_03'
        },
                 {
            "starting_time": 60000
            , "ending_time": 90000
            , "lotId": "L00008"
            , 'productId': 'SDP_03'
        }]
    }
      ];

//var labelTestData = [
//    {
//        label: "DA001"
//        , times: [{
//                "starting_time": 1355752800000
//                , "ending_time": 1355759900000
//                , "lotId": "L00001"
//                , 'productId': 'SDP_01'
//            }
//            , {
//                "starting_time": 1355767900000
//                , "ending_time": 1355774400000
//                , "lotId": "L00002"
//                , 'productId': 'SDP_03'
//            }]
//    }
//    , {
//        label: "DA002"
//        , times: [{
//            "starting_time": 1355759910000
//            , "ending_time": 1355761900000
//            , "lotId": "L00003"
//            , 'productId': 'DDP_01'
//        }, ]
//    }
//    , {
//        label: "DA003"
//        , times: [{
//            "starting_time": 1355762910000
//            , "ending_time": 1355769010000
//            , "lotId": "L00004"
//            , 'productId': 'DDP_02'
//        }]
//    }
//    , {
//        label: "DA004"
//        , times: [{
//            "starting_time": 1355761910000
//            , "ending_time": 1355763910000
//            , "lotId": "L00005"
//            , 'productId': 'SDP_01'
//        }]
//    }
//    , {
//        label: "DA005"
//        , times: [{
//            "starting_time": 1355756000000
//            , "ending_time": 1355762010000
//            , "lotId": "L00007"
//            , 'productId': 'SDP_03'
//        }]
//    }
//      ];
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
    label: "DA002"
    , status: 'idle'
}
    
, {
    label: "DA002"
    , status: 'down'
}
    , {
    label: "DA002"
    , status: 'proc'
}
];

var traveledTime = 10000;
function timelineHover() {
    var chart = d3.timeline().width(processWidth*2).stack().margin({
            left: 0
            , right: 30
            , top: 0
            , bottom: 0
        })
        .traveledTime(traveledTime)
        .showTimeAxisTick()
        .hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            if(d.starting_time > traveledTime) return;
            var div = $('#hoverRes');
            var colors = chart.colors();
            div.find('.coloredDiv').css('background-color', colors[d.productId])
            div.find('#name').text(d.lotId);
        })
//        .click(function (d, i, datum) {
//            alert(datum.label);
//        })
        //          .scroll(function (x, scale) {
        //            $("#scrolled_date").text(scale.invert(x) + " to " + scale.invert(x+width));
        //          });
    var svg = d3.select("#process").append("svg").attr("width", processWidth).datum(labelTestData).call(chart);
}

function getStackPosition(d, i) {
    return margin.top + (itemHeight + itemMargin) * (i);
}

function getStackTextPosition(d, i) {
    return margin.top + (itemHeight + itemMargin) * (i) + itemHeight * 0.75;
}

function displayMachine() {
    var svg = d3.select('#machine').append('svg').attr('width', machineWidth);
    var machines = svg.selectAll('.machineName').data(labelTestData).enter();
    // Machine Names
    machines.append('rect').attr('x', 0).attr('y', getStackPosition).attr("width", itemWidth).attr("height", itemHeight).style('fill', 'none').style('stroke', 'black')
    machines.append('text').attr('x', itemWidth / 2).attr('y', getStackTextPosition).style('text-anchor', 'middle').style('font-weight', 'bold').style('fill', 'black').text(function (d) {
            return d.label;
        })
    // Machine Status
    var status = svg.selectAll('.machineStatus').data(machineStatusTestData).enter();
    status.append('rect').attr('x', itemWidth + 10).attr('y', getStackPosition).
    attr('rx', 6).attr('ry', 6).attr("width", itemWidth).attr("height", itemHeight).style('fill', function(d){return statusColorMap[d.status]})
    status.append('text').attr('x', itemWidth + 10 + itemWidth / 2).attr('y', getStackTextPosition).style('text-anchor', 'middle').style('font-weight', 'bold').style('fill', 'black').text(function (d) {
        return d.status;
    })
}
timelineHover();
displayMachine();