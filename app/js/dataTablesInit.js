var myTable;

$('#daySelector').on('change', function() { myTable.draw(); });
if($('#optionSelector'))
{
	$('#optionSelector').on('change', function() { myTable.draw(); });
}

function Initialize(url, updateUrl, columns, initComplete, search)
{
	$.fn.dataTable.ext.search.push(search);

	var date = new Date();
	var today = date.getDay();
	
	$("#daySelector").val(today);
	
	myTable = $('#example').DataTable({
		"columns": columns,
		"scrollX": true,
		"dom": 'Bfrtip',
		"ajax": url,
		"select": 'single',
		"bInfo" : false,
		"searching": true,
		"responsive": true,
		"altEditor": true,
		"ordering": false,
		"paging": false,
		"buttons": [{extend: 'selected',text: 'Edit',name: 'edit'}],
		"initComplete": initComplete,
		onEditRow: function(datatable, rowdata, success, error) {
			$.ajax({
				url: updateUrl,
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
}

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