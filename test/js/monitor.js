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
                "starting_time": 1355752800000
                , "ending_time": 1355759900000
                , "operationId": "L00001"
            }
            , {
                "starting_time": 1355767900000
                , "ending_time": 1355774400000
                , "operationId": "L00002"
            }]
    }
    , {
        label: "DA002"
        , times: [{
            "starting_time": 1355759910000
            , "ending_time": 1355761900000
            , "operationId": "L00003"
        }, ]
    }
    , {
        label: "DA003"
        , times: [{
            "starting_time": 1355762910000
            , "ending_time": 1355769010000
            , "operationId": "L00004"
        }]
    }
    , {
        label: "DA004"
        , times: [{
            "starting_time": 1355761910000
            , "ending_time": 1355763910000
            , "operationId": "L00005"
        }]
    }
    , {
        label: "DA005"
        , times: [{
            "starting_time": 1355756000000
            , "ending_time": 1355762010000
            , "operationId": "L00007"
        }]
    }
      ];
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

function timelineHover() {
    var chart = d3.timeline().width(processWidth).stack().margin({
            left: 0
            , right: 30
            , top: 0
            , bottom: 0
        }).showTimeAxisTick().hover(function (d, i, datum) {
            // d is the current rendering object
            // i is the index during d3 rendering
            // datum is the id object
            var div = $('#hoverRes');
            var colors = chart.colors();
            div.find('.coloredDiv').css('background-color', colors(i))
            div.find('#name').text(datum.label);
        }).click(function (d, i, datum) {
            alert(datum.label);
        })
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