// vim: ts=2 sw=2
(function () {
  d3.timeline = function() {
    var DISPLAY_TYPES = ["circle", "rect"];

    var hover = function () {},
        mouseover = function () {},
        mouseout = function () {},
        click = function () {},
        scroll = function () {},
        labelFunction = function(label) { return label; },
        navigateLeft = function () {},
        navigateRight = function () {},
        orient = "bottom",
        width = null,
        height = 900,
        rowSeparatorsColor = null,
        backgroundColor = null,
        // http://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/
        tickFormat = { format: d3.time.format("%H %M"),
          tickTime: d3.time.hour,
          tickInterval: 2,
          tickSize: 6,
          tickValues: null
        },
        // FIX
        // colorCycle = d3.scale.category20(),
        colorCycle = {
            'SDP_01': '#2A75A6',
            'SDP_02': '#AEC6EB',
            'SDP_03': '#FD7E12',
            'DDP_01': '#FCB972',
            'DDP_02': '#2AA12D',
            'DDP_03': '#A0D993',
            'DDP_04': '#8BC432',
            'QDP_01': '#FF9894',
            'QDP_02': '#9663C3',
            '2MCP_01': '#C8ADDB',
            '2MCP_02': '#8B5844',
            '3MCP_01': '#C19992',
            '3MCP_02': '#D87CC6',
            '4MCP_01': '#F9B8D3',
            '4MCP_02': '#7E7E7E'
        },
        colorPropertyName = null,
        display = "rect",
        beginning = 0,
        labelMargin = 0,
        ending = 0,
        margin = {left: 30, right:30, top: 30, bottom:30},
        stacked = false,
        rotateTicks = false,
        timeIsRelative = false,
        fullLengthBackgrounds = false,
        itemHeight = 20,
        itemMargin = 0,
        navMargin = 60,
        showTimeAxis = true,
        showAxisTop = false,
        showTodayLine = false,
        timeAxisTick = false,
        timeAxisTickFormat = {stroke: "stroke-dasharray", spacing: "4 10"},
        showTodayFormat = {marginTop: 25, marginBottom: 0, width: 1, color: colorCycle},
        showBorderLine = false,
        showBorderFormat = {marginTop: 25, marginBottom: 0, width: 1, color: colorCycle},
        showAxisHeaderBackground = false,
        showAxisNav = false,
        showAxisCalendarYear = false,
        axisBgColor = "white",
        chartData = {},
        traveledTime = 0,
        labelArr = [],
        timeAxis,
        labelAxis,
        labelMap = {},
        xScale,
        yScale
      
      
      ;
      
    height = $(window).height();  
    
    var appendLabelAxis = function(g, yAxis) {

      if(showAxisHeaderBackground){ appendAxisHeaderBackground(g, 0, 0); }

      if(showAxisNav){ appendTimeAxisNav(g) };
      labelAxis = g.append("g")
        .attr("class", "Yaxis")
        .attr("transform", "translate(" + (margin.left )+ "," + (margin.top) + ")")
        .call(yAxis);
    };
      
    var appendTimeAxis = function(g, xAxis, yPosition) {

      if(showAxisHeaderBackground){ appendAxisHeaderBackground(g, 0, 0); }

      if(showAxisNav){ appendTimeAxisNav(g) };

      timeAxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 0 + "," + (height - margin.bottom) + ")")
        //.attr("transform", "translate(" + 0 + "," + (20) + ")")
        .call(xAxis);
    };

   
  
    function timeline (gParent) {
      var g = gParent.append("g");
      var gParentSize = gParent[0][0].getBoundingClientRect();
      var gParentItem = d3.select(gParent[0][0]);
      
      g.append("defs").append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom)
          .attr("transform", "translate(" + margin.left + "," +0 + ")");
        
      var yAxisMapping = {},
        maxStack = 1,
        minTime = 0,
        maxTime = 0;

       setWidth();
    
      // check how many stacks we're gonna need
      // do this here so that we can draw the axis before the graph
      if (stacked || ending === 0 || beginning === 0) {
        g.each(function (d, i) {
          d.forEach(function (datum, index) {          
            // create y mapping for stacked graph
              labelArr.push(datum.label)
            if (stacked && Object.keys(yAxisMapping).indexOf(index) == -1) {
              yAxisMapping[index] = maxStack;
              maxStack++;
            }

            // figure out beginning and ending times if they are unspecified
            datum.times.forEach(function (time, i) {
              if(beginning === 0)
                if (time.starting_time * 1000 < minTime || (minTime === 0 && timeIsRelative === false))
                  minTime = time.starting_time * 1000;
              if(ending === 0)
                if (time.ending_time * 1000 > maxTime)
                  maxTime = time.ending_time * 1000;
            });
          });
        });

        if (ending === 0) {
          ending = maxTime;
        }
        if (beginning === 0) {
          beginning = minTime;
        }
      }

      // draw the axis
      xScale = d3.time.scale()
        .domain([0, ending])
        .range([margin.left, width - margin.right]); // FIX
        
      var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient(orient)
        .tickFormat(tickFormat.format)
        .tickSize(tickFormat.tickSize);
        
      yScale = d3.scale.linear()
         .domain([0, labelArr.length])
         .range([(itemHeight + itemMargin), (height-margin.bottom) ]);
        
      var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(labelArr.length)
        .tickFormat(function(d){
            return labelArr[d]
        })
        .tickSize(2);    
    

      if (tickFormat.tickValues != null) {
        xAxis.tickValues(tickFormat.tickValues);
      } else {
        xAxis.ticks(tickFormat.numTicks || tickFormat.tickTime, tickFormat.tickInterval);
      }
        
      // draw the chart
      drawChart(g);
      
      
        
      var belowLastItem = (margin.top + (itemHeight + itemMargin) * maxStack);
      var aboveFirstItem = margin.top;
      var timeAxisYPosition = showAxisTop ? aboveFirstItem : belowLastItem;
      
        // FIX

      if (showTimeAxis) {appendTimeAxis(g, xAxis, timeAxisYPosition);}
       appendLabelAxis(g, yAxis);  

        
      var gSize = g[0][0].getBoundingClientRect();
      setHeight();
        
     // Display Label at yAxis
     
     
      // FIX: Zoom In & Out
      function zoomed() {
            gParent.select('.axis').call(xAxis);
            gParent.select('.Yaxis').call(yAxis);
      }  
        
      var xyzoom = d3.behavior.zoom()
                .x(xScale)
                .y(yScale)
                .on("zoom", draw);
      var xzoom = d3.behavior.zoom()
                .x(xScale)
                .on("zoom", draw);
      var yzoom = d3.behavior.zoom()
                .y(yScale)
                .on("zoom", draw);
        
        
     gParent.call(xyzoom);   
      
      
      function zoom_update(){
          xyzoom = d3.behavior.zoom()
                .x(xScale)
                .y(yScale)
                .on("zoom", draw);
          xzoom = d3.behavior.zoom()
                .x(xScale)
                .on("zoom", draw);
          yzoom = d3.behavior.zoom()
                .y(yScale)
                .on("zoom", draw);
      
          gParent.call(xyzoom);    
          
      }    
    var nodeFontSize = 12;
      function draw(){
        gParent.select('.axis').call(xAxis);
        gParent.select('.Yaxis').call(yAxis);
          
        var rects = gParent.selectAll('.operationRect')       
        var texts = gParent.selectAll('.operationText')
        
        rects
            .attr("x", function (d) {
                return xScale(d.starting_time * 1000)})
            .attr("y", function(d){
                return yScale(labelMap[d.label]) })
            .attr("width", function (d, i) {
                return xScale(d.ending_time * 1000) - xScale(d.starting_time * 1000);})
            .attr("height", function(d){
                return (yScale(labelMap[d.label]+1) - yScale(labelMap[d.label]) -itemMargin*3)});
        
        texts  
            .attr("x", function(d){
                return xScale((d.starting_time*1000 + d.ending_time*1000)/2) })
            .attr("y", function(d){
                return yScale(labelMap[d.label]) + 0.5*(yScale(labelMap[d.label]+1)-yScale(labelMap[d.label])) })
            .style('text-anchor', 'middle')
            .style('vertical-align', 'middle')
            .style('font-weight', 'bold')
            .style('font-size', function(d){
                return 0.2*(yScale(labelMap[d.label]+1) - yScale(labelMap[d.label])) + 'px'})
            .style('fill', 'white')
            .text(function (d) {
                if(d.lotId != 'OVERFLOW') return d.lotId;
            });
          
//        zoom_update();
      }  
    

      function setHeight() {
        if (!height && !gParentItem.attr("height")) {
          if (itemHeight) {
            // set height based off of item height
            height = gSize.height + gSize.top - gParentSize.top;
            // set bounding rectangle height
            d3.select(gParent[0][0]).attr("height", height);
          } else {
            throw "height of the timeline is not set";
          }
        } else {
          if (!height) {
            height = gParentItem.attr("height");
          } else {
            gParentItem.attr("height", height);
          }
        }
      }

      function setWidth() {
        if (!width && !gParentSize.width) {
          try {
            width = gParentItem.attr("width");
            if (!width) {
              throw "width of the timeline is not set. As of Firefox 27, timeline().with(x) needs to be explicitly set in order to render";
            }
          } catch (err) {
            console.log( err );
          }
        } else if (!(width && gParentSize.width)) {
          try {
            width = gParentItem.attr("width");
          } catch (err) {
            console.log( err );
          }
        }
        // if both are set, do nothing
      }

      function appendLine(lineScale, lineFormat) {
        gParent.append("svg:line")
          .attr("x1", lineScale)
          .attr("y1", lineFormat.marginTop)
          .attr("x2", lineScale)
          .attr("y2", height - lineFormat.marginBottom)
          .style("stroke", lineFormat.color)//"rgb(6,120,155)")
          .style("stroke-width", lineFormat.width);
      }
        
     function drawChart(g) {
       
        g.attr('class', 'operations')
        g.each(function (d, i) {
            chartData = d;
                d.forEach(function (datum, index) {
                    var data = datum.times;
                    var hasLabel = (typeof (datum.label) != "undefined");
                    // issue warning about using id per data set. Ids should be individual to data elements
                    if (typeof (datum.id) != "undefined") {
                        console.warn("d3Timeline Warning: Ids per dataset is deprecated in favor of a 'class' key. Ids are now per data element.");
                    }
                    if (backgroundColor) {
                        appendBackgroundBar(yAxisMapping, index, g, data, datum);
                    }
                    // FIX
                    var operations = g.selectAll(".operations")
                                       .data(data);
                    var operationsEnter = operations.enter().append('g');
//                    var operationsEnter = operations.enter().append('g');
                    operationsEnter.append(function (d, i) {
                        d.label = datum.label;
                        labelMap[d.label] = index;
                         return document.createElementNS(d3.ns.prefix.svg, "display" in d ? d.display : display);
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
                        return (yScale(index+1) - yScale(index) -itemMargin*3)
                    })
                     .style("fill", function (d, i) {
                        var dColorPropName;
                        if (d.color) return d.color;
                        if (colorPropertyName) {
                            dColorPropName = d[colorPropertyName];
                            if (dColorPropName) {
                                return colorCycle(dColorPropName);
                            }
                            else {
                                return colorCycle(datum[colorPropertyName]);
                            }
                        }
                        return colorCycle[d.productId];
                    }).on("mousemove", function (d, i) {
                        hover(d, index, datum);
                    }).on("mouseover", function (d, i) {
                        mouseover(d, i, datum);
                    }).on("mouseout", function (d, i) {
                        mouseout(d, i, datum);
                    }).on("click", function (d, i) {
                        click(d, index, datum);
                    })
//                    .attr('class', 'operationRect')
                    .attr("clip-path", "url(#clip)")
                    .attr("class", function (d, i) {
                        return 'operationRect ' + d.productId +' ' + d.lotId;
                    })
                    .attr("id", function (d, i) {
                        // use deprecated id field
                        if (datum.id && !d.id) {
                            return 'timelineItem_' + datum.id;
                        }
                        // return d.id ? d.id : d.lotId;
                        return 'event_' + d.eventId;
                        // return d.id ? d.id : "timelineItem_"+index+"_"+i;
                    });
                    // FIX
                    operationsEnter
                        .append("text")
                        //.attr('class','operationText')
                        .attr('class',function(d, i){
                         return 'operationText ' + d.lotId;
                        })
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
                            if(d.lotId != 'OVERFLOW') return d.lotId;
                        })
                        .on("click", function (d, i) {
                        click(d, index, datum);
                        });
                    operations.exit().remove();
                    // add the label
                    // FIX Label Represent
                    // if (hasLabel) { appendLabel(gParent, yAxisMapping, index, hasLabel, datum); }
                  
                });
            });
         
         
        }
        
        
// ---------- Vertical Line ------------
    var vertical = d3.select("#process")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "2px")
        .style("height", (height-margin.bottom-10)+"px")
        .style("top", "50px")
        .style("bottom", "10px")
        .style("left", "0px")
        .style("background", "red");

    d3.select("#process")
        .on("mousemove", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){  
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px")});
      
    }
// ---------0----------------------
    // SETTINGS
    timeline.margin = function (p) {
      if (!arguments.length) return margin;
      margin = p;
      return timeline;
    };

    timeline.orient = function (orientation) {
      if (!arguments.length) return orient;
      orient = orientation;
      return timeline;
    };

    timeline.itemHeight = function (h) {
      if (!arguments.length) return itemHeight;
      itemHeight = h;
      return timeline;
    };

    timeline.itemMargin = function (h) {
      if (!arguments.length) return itemMargin;
      itemMargin = h;
      return timeline;
    };

    timeline.navMargin = function (h) {
      if (!arguments.length) return navMargin;
      navMargin = h;
      return timeline;
    };

    timeline.height = function (h) {
      if (!arguments.length) return height;
      height = h;
      return timeline;
    };

    timeline.width = function (w) {
      if (!arguments.length) return width;
      width = w;
      return timeline;
    };

    timeline.display = function (displayType) {
      if (!arguments.length || (DISPLAY_TYPES.indexOf(displayType) == -1)) return display;
      display = displayType;
      return timeline;
    };

    timeline.labelFormat = function(f) {
      if (!arguments.length) return labelFunction;
      labelFunction = f;
      return timeline;
    };

    timeline.tickFormat = function (format) {
      if (!arguments.length) return tickFormat;
      tickFormat = format;
      return timeline;
    };

    timeline.hover = function (hoverFunc) {
      if (!arguments.length) return hover;
      hover = hoverFunc;
      return timeline;
    };

    timeline.mouseover = function (mouseoverFunc) {
      if (!arguments.length) return mouseover;
      mouseover = mouseoverFunc;
      return timeline;
    };

    timeline.mouseout = function (mouseoutFunc) {
      if (!arguments.length) return mouseout;
      mouseout = mouseoutFunc;
      return timeline;
    };

    timeline.click = function (clickFunc) {
      if (!arguments.length) return click;
      click = clickFunc;
      return timeline;
    };

    timeline.scroll = function (scrollFunc) {
      if (!arguments.length) return scroll;
      scroll = scrollFunc;
      return timeline;
    };

    timeline.colors = function (colorFormat) {
      if (!arguments.length) return colorCycle;
      colorCycle = colorFormat;
      return timeline;
    };

    timeline.beginning = function (b) {
      if (!arguments.length) return beginning;
      beginning = b;
      return timeline;
    };

    timeline.ending = function (e) {
      if (!arguments.length) return ending;
      ending = e;
      return timeline;
    };

    timeline.labelMargin = function (m) {
      if (!arguments.length) return labelMargin;
      labelMargin = m;
      return timeline;
    };

    timeline.rotateTicks = function (degrees) {
      if (!arguments.length) return rotateTicks;
      rotateTicks = degrees;
      return timeline;
    };

    timeline.stack = function () {
      stacked = !stacked;
      return timeline;
    };

    timeline.relativeTime = function() {
      timeIsRelative = !timeIsRelative;
      return timeline;
    };

    timeline.showBorderLine = function () {
      showBorderLine = !showBorderLine;
      return timeline;
    };

    timeline.showBorderFormat = function(borderFormat) {
      if (!arguments.length) return showBorderFormat;
      showBorderFormat = borderFormat;
      return timeline;
    };

    timeline.showToday = function () {
      showTodayLine = !showTodayLine;
      return timeline;
    };

    timeline.showTodayFormat = function(todayFormat) {
      if (!arguments.length) return showTodayFormat;
      showTodayFormat = todayFormat;
      return timeline;
    };

    timeline.colorProperty = function(colorProp) {
      if (!arguments.length) return colorPropertyName;
      colorPropertyName = colorProp;
      return timeline;
    };

    timeline.rowSeparators = function (color) {
      if (!arguments.length) return rowSeparatorsColor;
      rowSeparatorsColor = color;
      return timeline;

    };

    timeline.background = function (color) {
      if (!arguments.length) return backgroundColor;
      backgroundColor = color;
      return timeline;
    };

    timeline.showTimeAxis = function () {
      showTimeAxis = !showTimeAxis;
      return timeline;
    };

    timeline.showAxisTop = function () {
      showAxisTop = !showAxisTop;
      return timeline;
    };

    timeline.showAxisCalendarYear = function () {
      showAxisCalendarYear = !showAxisCalendarYear;
      return timeline;
    };

    timeline.showTimeAxisTick = function () {
      timeAxisTick = !timeAxisTick;
      return timeline;
    };

    timeline.fullLengthBackgrounds = function () {
      fullLengthBackgrounds = !fullLengthBackgrounds;
      return timeline;
    };

    timeline.showTimeAxisTickFormat = function(format) {
      if (!arguments.length) return timeAxisTickFormat;
      timeAxisTickFormat = format;
      return timeline;
    };

    timeline.showAxisHeaderBackground = function(bgColor) {
      showAxisHeaderBackground = !showAxisHeaderBackground;
      if(bgColor) { (axisBgColor = bgColor) };
      return timeline;
    };

    timeline.navigate = function (navigateBackwards, navigateForwards) {
      if (!arguments.length) return [navigateLeft, navigateRight];
      navigateLeft = navigateBackwards;
      navigateRight = navigateForwards;
      showAxisNav = !showAxisNav;
      return timeline;
    };
   
    timeline.traveledTime = function(t){
      traveledTime = t;
      return timeline;
    };
    
    timeline.exportXScale = function(){
        return xScale;
    }
    
    timeline.exportYScale = function(){
        return yScale;
    }
    
    timeline.exportColorCycle = function(){
        return colorCycle;
    }

    return timeline;
  };
})();
