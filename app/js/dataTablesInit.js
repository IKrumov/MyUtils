var myTable;

$.fn.dataTable.ext.search.push(
	function(settings, data, dataIndex ) {
		var day = parseFloat(data[1]) || 0;
		return day == $("#daySelector").val();
	}
);

$('#daySelector').on('change', function() { myTable.draw(); });

$(document).ready(function() {
	var date = new Date();
	var today = date.getDay();
	var hour = date.getHours();
	var min = date.getMinutes();
	
	var startHour = 6;
	var startMin = 30;
	
	$("#daySelector").val(today);
	
	myTable = $('#example').DataTable({
		"columns": [{ title: "Id", visible: false, type: "hidden" }, { title: "Day", visible: false, type: "hidden" }, { title: "Sort", type: "hidden" }, { title: "Food", type: "textarea" }],
		"scrollX": true,
		"dom": 'Bfrtip',
		"ajax": '/app/data/food.json',
		"select": 'single',
		"bInfo" : false,
		"searching": true,
		"responsive": true,
		"altEditor": true,
		"ordering": false,
		"paging": false,
		"buttons": [{extend: 'selected',text: 'Edit',name: 'edit'}],
		"initComplete": function(settings, json) {
			var counter = 0;
			var currentRow;

			myTable.rows({filter: 'applied'}).every(function (index) {
				var row = this.data();
				var rowHour = 3 * counter + startHour;
				counter++;
				
				if(!currentRow && (rowHour > hour || (rowHour == hour && startMin >= min)))
				{
					myTable.rows(this).select();
					currentRow = this.data();
				}
			});
		},
		onEditRow: function(datatable, rowdata, success, error) {
			$.ajax({
				url: "/updateFoodItem",
				type: 'POST',
				data: rowdata,
				success: success,
				error: error
			});
		}
	});
	
	myTable.on('dblclick','tr',function(e){
		myTable.rows(this).select();
		myTable.button('edit:name')[0].node.click();
	});
});

// Trigger action when the contexmenu is about to be shown
$("#example").contextmenu(function(event) {
  myTable.rows(event.target.parentElement).select();
	// Avoid the real one
	event.preventDefault();
	// Show contextmenu
	$(".custom-menu").finish().toggle(100).
	// In the right position (the mouse)
	css({
		top: event.pageY + "px",
		left: event.pageX + "px"
	});
});

// If the document is clicked somewhere
$(document).bind("mousedown", function (e) {
	// If the clicked element is not the menu
	if (!$(e.target).parents(".custom-menu").length > 0) {
		// Hide it
		$(".custom-menu").hide(100);
	}
});

// If the menu element is clicked
$(".custom-menu li").click(function(){
	// This is the triggered action name
	switch($(this).attr("data-action")) {
		// A case for each action. Your actions here
		case "edit": myTable.button('edit:name')[0].node.click(); break;
	}
	// Hide it AFTER the action was triggered
	$(".custom-menu").hide(100);
  });