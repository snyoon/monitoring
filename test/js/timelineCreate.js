var timelineCreate = function(schedule, div){
	var container = document.getElementById("div");

	var tlINFO = schedule.ganttData;
	var idnum= 1;
	//CREATE STYLES FOR ALL THE DIFFERENT PRODUCT GROUPS

	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn({type: 'string', id: 'Label'});
	dataTable.addColumn({type: 'string', id: 'Product ID'});
	dataTable.addColumn({type: 'string', id: 'Product Group'})
	dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    var data = new vis.DataSet();

    for (var i = 0; i < tlINFO.length; i++) {
    	tlINFO[i]
    }
}

function indivObjectHandler(object, data){
	var times = object.times;
	for(var i = 0; i < times.length; i++){
		//FORMAT TIME 

		var STARTDATE = FOLKJLRKJLJK
		var ENDDATE = LKJSDLGJSLDG
		data.add({id: idnum, text: times[i].productId, start: STARTDATE, end: ENDDATE,
			group: object.label, className: times[i].productGroup});
		idnum++;
	}

}