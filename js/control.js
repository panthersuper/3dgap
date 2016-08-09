$(document).ready(function () {

	$("#zoomall>img").click(function (event) {

		var relaX = event.offsetX;
		var relaY = event.offsetY;
		var thisW = $(this).width();
		var thisH = $(this).height()

		var ratioX = relaX / thisW;
		var ratioY = relaY / thisH;

		if (ratioX > 0.33 && ratioX < 0.66 && ratioY > 0.33 && ratioY < 0.66) {
			zoomExtents(VA3C.maincanvas);
			//zoomExtents(VA3C.subcanvas);
            //settarget(VA3C.maincanvas);
		}

	});

	var rightID = 0;
	var leftID = 0;
	var upID = 0;
	var downID = 0;
	$("#zoomall>img").mousedown(function (event) {

		var relaX = event.offsetX;
		var relaY = event.offsetY;
		var thisW = $(this).width();
		var thisH = $(this).height()

		var ratioX = relaX / thisW;
		var ratioY = relaY / thisH;

		if (ratioX < 0.33 && ratioY > 0.33 && ratioY < 0.66) {//move left
			console.log("left");
			var thisfunc = function () {
				rotateLeft(VA3C.maincanvas, 0.05);
			}
			leftID = setInterval(thisfunc, 100);
		}
		else if (ratioX > 0.33 && ratioX < 0.66 && ratioY < 0.33) {//move up
			console.log("up");
			var thisfunc = function () {
				rotateUp(VA3C.maincanvas, 0.05);
			}
			upID = setInterval(thisfunc, 100);
		}
		else if (ratioX > 0.66 && ratioY > 0.33 && ratioY < 0.66) {//move right
			console.log("right");
			var thisfunc = function () {
				rotateLeft(VA3C.maincanvas, -0.05);
			}
			rightID = setInterval(thisfunc, 100);
		}
		else if (ratioX > 0.33 && ratioX < 0.66 && ratioY > 0.66) {//move down
			console.log("down");
			var thisfunc = function () {
				rotateUp(VA3C.maincanvas, -0.05);
			}
			downID = setInterval(thisfunc, 100);

		}

	}).bind('mouseup mouseleave', function () {
		clearTimeout(rightID);
		clearTimeout(leftID);
		clearTimeout(upID);
		clearTimeout(downID);


	});
	
	




	//press zoomin function
	var zoominID = 0;
	var zoominFunction = function () {
		var thiscam = VA3C.maincanvas.camera;
		var camerapos = thiscam.position;
		var diff = new THREE.Vector3(0, 0, -1);
		diff.applyQuaternion(thiscam.quaternion);

		var dist = camerapos.length();

		console.log(diff, dist);
		var newPos = new THREE.Vector3(camerapos.x + diff.x * dist * 0.01, camerapos.y + diff.y * dist * 0.01, camerapos.z + diff.z * dist * 0.01);
        camerapos.set(newPos.x, newPos.y, newPos.z);
	}

	$('#zoomin').mousedown(function () {
		zoominID = setInterval(zoominFunction, 100);
	}).bind('mouseup mouseleave', function () {
		clearTimeout(zoominID);
	});

	//press zoomout function
	var zoomoutID = 0;
	var zoomoutFunction = function () {
		var thiscam = VA3C.maincanvas.camera;
		var camerapos = thiscam.position;
		var diff = new THREE.Vector3(0, 0, -1);
		diff.applyQuaternion(thiscam.quaternion);

		var dist = camerapos.length();

		//console.log(diff,dist);
		var newPos = new THREE.Vector3(camerapos.x - diff.x * dist * 0.01, camerapos.y - diff.y * dist * 0.01, camerapos.z - diff.z * dist * 0.01);
        camerapos.set(newPos.x, newPos.y, newPos.z);
	}

	$('#zoomout').mousedown(function () {
		zoomoutID = setInterval(zoomoutFunction, 100);
	}).bind('mouseup mouseleave', function () {
		clearTimeout(zoomoutID);
	});

	$("#selector").click(function(){
		$("#selector_lst").toggleClass("tohide");
	});
	

});

function selectDataItem(data) {

	d3.selectAll(".dataitem p").on("click", function () {

		var thislevel = d3.select(this).attr("level");

		var thistoggle = d3.selectAll(this.parentNode.childNodes);
		thistoggle.classed("tohide", function (d, i) {
			return !d3.select(this).classed("tohide");
		});
		d3.select(this).classed("tohide", false);

	});

	d3.selectAll(".dataitem").on("click", function () {
		d3.selectAll(".dataitem").classed("selected_item", false);
		d3.select(this).classed("selected_item", true);

		updateAttributes(d3.select(this).attr("name"), data);

	});
}



function setLoading_bar(ratio, id) {
	//console.log(ratio);
	var wholeW = window.loadingwidth;
	d3.select("#" + id).style("width", wholeW * ratio + "px");

}

function set_select_btn() {

	$(".spects_btn").click(
		function () {
			$(".spects_btn").removeClass("selected");
			$(this).addClass("selected");

			if ($(this).attr("id") == "general") {
				$(".typegeneral").show();
				$(".typedimensions").hide();
			} else if ($(this).attr("id") == "dimensions") {
				$(".typegeneral").hide();
				$(".typedimensions").show();
			}



		});


}