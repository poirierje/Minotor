// const delayBaseMS   =  60000;
const maxDurationMS =    500;

function rgb ( max, val ) {
	if (val > max )
		val = max;
	var r = 0; 
	var g = Math.floor ( 255 * (1 - val/max) );
	var b = Math.floor ( 255 * (val/max) ); 
	return "rgb(" + r + "," + g + "," + b + ")";
}

var genericMonitor = {
	id    : -1,
	name  : "generic",
	addr  : "http://www.google.com",
	key   : "",
	ping : function () {
		var monDiv = $("#mon" + this.id);
		var duration;
		var that = this;
		var start = new Date().getTime();
		$.ajax({
			url      : that.addr,
			data     : {},
			type     : 'GET',
			dataType : 'html',
			success: function( data ) {
				monDiv.removeClass("error");
				if (that.key != '') {
					if ( data.indexOf(that.key) > -1) 
						monDiv.removeClass("errorKey");
					else {
						monDiv.addClass("errorKey");
						console.log(data);
					}
				}
			},
			error: function( jqXHR, textStatus, errorThrown ) {
				if (jqXHR.status == 403)
					monDiv.addClass("status403");
				else {
					monDiv.addClass("error");
					console.log("----- " + that.name + " -----");
					console.log("readyState: "  + jqXHR.readyState);
					console.log("responseText: "+ jqXHR.responseText);
					console.log("status: "      + jqXHR.status);
					console.log("text status: " + textStatus);
					console.log("error: "       + errorThrown);
				}
		   	},
			complete: function ( jqXHR, textStatus ) {
				// Setting duration info
				duration = (new Date().getTime() - start);
//				monDiv.css("background-color", rgb ( maxDurationMS , duration ));

				// Setting status info
				var monDivStatus = monDiv.find(".monStatus");
				monDivStatus.text( jqXHR.status + " - " + textStatus + " (" + duration + " ms)");

				// Setting history info
				var children = monDiv.find(".history").children();
				for (let i = 0; i < children.length - 1 ; i++) {
					children.eq(i).css("background-color", children.eq(i+1).css("background-color"));
					children.eq(i).attr('title', children.eq(i+1).attr('title'));
				}

				if ( textStatus == "error" && jqXHR.status != 403 )
					children.eq(children.length - 1).css("background-color", "darkgreen");
				else
					children.eq(children.length - 1).css("background-color", rgb ( maxDurationMS , duration ));
				children.eq(children.length - 1).attr('title', duration+" ms");
			}
		});
	},
	debug : function () {
		console.log(this.name + " - " + this.addr);
	}
}

var monitors = [];

var monitorsDesc = [
	{ name : 'Google FR'      , addr : 'https://www.google.fr'                                                      , key : 'Recherche Google'      , delayBaseMS : 30000 }
];

monitorsDesc.forEach(
	function ( elem, index ) {
		var monitor = Object.create(genericMonitor);
		monitor.id          = index; 
		monitor.name        = elem.name; 
		monitor.addr        = elem.addr;
		monitor.key         = elem.key;
		monitor.delayBaseMS = elem.delayBaseMS;
		monitors.push(monitor); 
	}
)

monitors.forEach(
	function ( monitor ) {

		// Creating monitor HTML tags 
		var histoCase = "<div class='histoCase'></div>";
		for(i=0; i < 6; i++) 
			histoCase = histoCase + histoCase;
		var txtDiv = "<div id='mon" + monitor.id + "' class='monitor'><div class='monName'><a href='" + monitor.addr + "' target='_blank'>"+ monitor.name + "</a></div><div class='monStatus'>pingin'...</div><div class='history'>" + histoCase + "</div></div>";
		$("#dashboard").append(txtDiv);

		// Launching pinging process
		monitor.ping();
		setInterval(
			function () {
				monitor.ping();
			},
			monitor.delayBaseMS + (Math.random() * monitor.delayBaseMS) // Not firing requests at the same time
		);
	}
);
