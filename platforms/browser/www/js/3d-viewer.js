var VA3C = {};
//	var info, stats, renderer, scene, camera, controls;

var latlon, latlong = [42.3482, -75.189];
var pi = Math.PI, pi05 = pi * 0.5, pi2 = pi + pi;
var d2r = pi / 180, r2d = 180 / pi;  // degrees / radians
window.loadingratio = 0.1;
window.loadingwidth = 200;

function initObj(obj, data) {
    var geometry, material, mesh;

    VA3C.maincanvas = new canvasObj([window.innerWidth, window.innerHeight], "maincanvas", document.body);
    VA3C.subcanvas = new canvasObj([250, 200], "subcanvas", document.getElementById("smcanvas"));

    //loadObj_Multi(obj,data,[VA3C.maincanvas,VA3C.subcanvas]);
    loadObj(obj, data, VA3C.maincanvas);
    loadObj(obj, data, VA3C.subcanvas);

    setLoading_bar(1, "main_loading");

    $("#maincanvas").click(function () {
        clickHandler_sync(event, VA3C.maincanvas, VA3C.subcanvas, [window.innerWidth, window.innerHeight], document.body);
    });
    /*        $("#subcanvas").click(function(){
                clickHandler(event,VA3C.subcanvas,[250,200],document.getElementById("smcanvas"));
            });*/
}

var canvasObj = function (size, id, parent) {
    this.renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });
    this.renderer = new THREE.WebGLRenderer({ alpha: 1, antialias: true, clearColor: 0xffffff });

    this.renderer.setSize(size[0], size[1]);
    this.renderer.shadowMap.enabled = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, size[0] / size[1], 10, 500000);
    this.canvas = this.renderer.domElement;
    this.canvas.id = id;
    this.scene = new THREE.Scene();
    this.controls = new THREE.OrbitControls(this.camera, this.canvas, this.canvas);
    this.obj;
    this.light;
    this.lastMeshMaterial = -1, this.lastMeshID = -1, this.lastObjectMaterial = -1, this.lastObjectID = -1;
    this.selMaterial;
    this.targetList;
    this.defaultMaterial = null;
    this.aabbCenter;

    parent.appendChild(this.canvas);


}

function loadObj_Multi(obj, data, canvasLst) {//function to load obj to multi canvas with just one loading

    /*
            var loader = new THREE.ObjectLoader();
            loader.parse( obj, function( result ){
    
                for(k in canvasLst){
                    var thiscanvas = canvasLst[k];
                    if ( thiscanvas.scene ) thiscanvas.scene.remove( obj );
                    thiscanvas.targetList = [];
    
                    thiscanvas.scene = result;
                    // lights
                    thiscanvas.scene.add( new THREE.AmbientLight( 0x444444 ) );
    
                    updateLight(thiscanvas);
    
                    // axes
                    thiscanvas.scene.add( new THREE.ArrowHelper( v(1, 0, 0), v(0, 0, 0), 3000, 0xcc0000) );
                    thiscanvas.scene.add( new THREE.ArrowHelper( v(0, 1, 0), v(0, 0, 0), 3000, 0x00cc00) );
                    thiscanvas.scene.add( new THREE.ArrowHelper( v(0, 0, 1), v(0, 0, 0), 3000, 0x0000cc) );
    
                    //call compute function
                    computeNormalsAndFaces(thiscanvas);
                    zoomExtents(thiscanvas);
                    thiscanvas.data = data;
                }
            });
    
            console.log("loaded");*/


    //$(".loading").fadeOut(1000);

}

function loadObj(obj, data, canvas) {
    if (canvas.scene) canvas.scene.remove(obj);
    canvas.targetList = [];

    var loader = new THREE.ObjectLoader();

    window.loadingratio += 0.2;
    setLoading_bar(window.loadingratio, "main_loading");


    loader.parse(obj, function (result) {
        canvas.scene = result;
        // lights
        canvas.scene.add(new THREE.AmbientLight(0x999999));

        updateLight(canvas);

        /*            // axes
                    canvas.scene.add( new THREE.ArrowHelper( v(1, 0, 0), v(0, 0, 0), 3000, 0xcc0000) );
                    canvas.scene.add( new THREE.ArrowHelper( v(0, 1, 0), v(0, 0, 0), 3000, 0x00cc00) );
                    canvas.scene.add( new THREE.ArrowHelper( v(0, 0, 1), v(0, 0, 0), 3000, 0x0000cc) );
        */
        
        

        
        
        //call compute function
        computeNormalsAndFaces(canvas);
        resetCamera(canvas);
        zoomExtents(canvas);
    });

    canvas.data = data;
    window.loadingratio += 0.2;
    setLoading_bar(window.loadingratio, "main_loading");

    $(".loading").fadeOut(1000);

};

function updateLight(canvas) {
    if (canvas.light) { canvas.scene.remove(canvas.light); }

    canvas.light = new THREE.DirectionalLight(0xffffff, 1);
    // (year, month, day, hour, minutes, sec, lat, long)
    latlon = sunPosition(2014, month, day, hour, 60, 0, latlong[0], latlong[1]);
    // console.log ( latlon );
    var pos = convertPosition(latlon[0], latlon[1], 10000);
    // var pos = convertPosition(  43, -75, 10000 );

    canvas.light.position = pos;
    canvas.light.castShadow = true;
    canvas.light.shadowMapWidth = 2048;
    canvas.light.shadowMapHeight = 2048;
    var d = 10000;
    canvas.light.shadowCameraLeft = -d;
    canvas.light.shadowCameraRight = d;
    canvas.light.shadowCameraTop = d * 2;
    canvas.light.shadowCameraBottom = -d * 2;

    canvas.light.shadowCameraNear = 1000;
    canvas.light.shadowCameraFar = 200000;
    //canvas.light.shadowCameraVisible = true;
    canvas.scene.add(canvas.light);
}

function convertPosition(lat, lon, radius) {
    var rc = radius * Math.cos(lat * d2r);
    return v(rc * Math.cos(lon * d2r), radius * Math.sin(lat * d2r), rc * Math.sin(lon * d2r));
}


function resetCamera(canvas) {
    canvas.camera.lookAt(0, 0, 0);
    canvas.camera.position.set(150000, 550000, 150000);
    canvas.camera.up = v(0, 1, 0);
}


function zoomExtends_AABB(canvas, geo) {
    //zoomextend based on geo's aabb

    resetCamera(canvas);

    var aabbMin = new THREE.Vector3();
    var aabbMax = new THREE.Vector3();
    var radius = 0;

    geo = geo.geometry;
    geo.computeBoundingBox();

    aabbMin.x = Math.min(aabbMin.x, geo.boundingBox.min.x);
    aabbMin.y = Math.min(aabbMin.y, geo.boundingBox.min.y);
    aabbMin.z = Math.min(aabbMin.z, geo.boundingBox.min.z);
    aabbMax.x = Math.max(aabbMax.x, geo.boundingBox.max.x);
    aabbMax.y = Math.max(aabbMax.y, geo.boundingBox.max.y);
    aabbMax.z = Math.max(aabbMax.z, geo.boundingBox.max.z);

    // Compute world AABB center
    var aabbCenter = new THREE.Vector3();
    aabbCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
    aabbCenter.y = (aabbMax.y + aabbMin.y) * 0.5;
    aabbCenter.z = (aabbMax.z + aabbMin.z) * 0.5;

    canvas.controls.target = aabbCenter;

    // Compute world AABB "radius" (approx: better if BB height)
    var diag = new THREE.Vector3();
    diag = diag.subVectors(aabbMax, aabbMin);
    radius = diag.length() * 0.5;

    // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
    var offset = radius / Math.tan(Math.PI / 180.0 * canvas.camera.fov * 0.5);

    var thiscam = canvas.camera;
    var nowpos = thiscam.position;
    var dist = new THREE.Vector3().subVectors(nowpos, aabbCenter).length();
    var dir = new THREE.Vector3().subVectors(nowpos, aabbCenter).normalize();
    var newPos = new THREE.Vector3(nowpos.x + dir.x * (offset - dist), nowpos.y + dir.y * (offset - dist), nowpos.z + dir.z * (offset - dist));

    //set camera position and target
    console.log(aabbCenter);
    nowpos.set(newPos.x, newPos.y, newPos.z);
}

function zoomExtents(canvas) {
    // Compute world AABB and radius (approx: better compute BB be in camera space)
    var aabbMin = new THREE.Vector3();
    var aabbMax = new THREE.Vector3();
    var radius = 0;
    //loop over the meshes in the platypus scene
    for (var m = 0; m < canvas.targetList.length; m++) {
        //if mesh,
        if (canvas.targetList[m].hasOwnProperty("geometry")) {
            var geo = canvas.targetList[m].geometry;
            geo.computeBoundingBox();

            aabbMin.x = Math.min(aabbMin.x, geo.boundingBox.min.x);
            aabbMin.y = Math.min(aabbMin.y, geo.boundingBox.min.y);
            aabbMin.z = Math.min(aabbMin.z, geo.boundingBox.min.z);
            aabbMax.x = Math.max(aabbMax.x, geo.boundingBox.max.x);
            aabbMax.y = Math.max(aabbMax.y, geo.boundingBox.max.y);
            aabbMax.z = Math.max(aabbMax.z, geo.boundingBox.max.z);
        }

        /*                //if object3d or whatever, figure out how to get a bounding box
                        else{
                            var obj = VA3C.scene.children[m].children[0].geometry;
                            obj.computeBoundingBox();
        
                            aabbMin.x = Math.min(aabbMin.x, obj.boundingBox.min.x);
                            aabbMin.y = Math.min(aabbMin.y, obj.boundingBox.min.y);
                            aabbMin.z = Math.min(aabbMin.z, obj.boundingBox.min.z);
                            aabbMax.x = Math.max(aabbMax.x, obj.boundingBox.max.x);
                            aabbMax.y = Math.max(aabbMax.y, obj.boundingBox.max.y);
                            aabbMax.z = Math.max(aabbMax.z, obj.boundingBox.max.z);
        
                        }*/
    }

    // Compute world AABB center
    canvas.aabbCenter = new THREE.Vector3();
    canvas.aabbCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
    canvas.aabbCenter.y = (aabbMax.y + aabbMin.y) * 0.5;
    canvas.aabbCenter.z = (aabbMax.z + aabbMin.z) * 0.5;

    canvas.controls.target = canvas.aabbCenter;

    // Compute world AABB "radius" (approx: better if BB height)
    var diag = new THREE.Vector3();
    diag = diag.subVectors(aabbMax, aabbMin);
    radius = diag.length() * 0.5;

    // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
    var offset = radius / Math.tan(Math.PI / 180.0 * canvas.camera.fov * 0.5);

    var thiscam = canvas.camera;
    var nowpos = thiscam.position;
    var dist = new THREE.Vector3().subVectors(nowpos, canvas.aabbCenter).length();
    var dir = new THREE.Vector3().subVectors(nowpos, canvas.aabbCenter).normalize();
    var newPos = new THREE.Vector3(nowpos.x + dir.x * (offset - dist), nowpos.y + dir.y * (offset - dist), nowpos.z + dir.z * (offset - dist));

    //set camera position and target
    nowpos.set(newPos.x, newPos.y, newPos.z);
}

function moveCameraByVector(canvas, vec) {

    var nowpos = canvas.controls.object.position;
    var newPos = new THREE.Vector3(nowpos.x + vec.x, nowpos.y + vec.y, nowpos.z + vec.z);
    canvas.controls.target = canvas.aabbCenter;
    canvas.controls.object.position = newPos;

    console.log(canvas.controls);

    //nowpos.set(newPos.x,newPos.y,newPos.z);
}

function rotateUp(canvas, angle) {
    canvas.controls.rotateUp(angle);
}

function rotateLeft(canvas, angle) {
    canvas.controls.rotateLeft(angle);
}

function v(x, y, z) { return new THREE.Vector3(x, y, z); }

function animate() {
    requestAnimationFrame(animate);
    VA3C.maincanvas.renderer.render(VA3C.maincanvas.scene, VA3C.maincanvas.camera);
    VA3C.maincanvas.controls.update();
}

function animate_sub() {
    requestAnimationFrame(animate_sub);
    VA3C.subcanvas.renderer.render(VA3C.subcanvas.scene, VA3C.subcanvas.camera);
    VA3C.subcanvas.controls.update();
}

function computeNormalsAndFaces(canvas) {
    
    
    for (var i = 0; i < canvas.scene.children.length; i++) {
        if (canvas.scene.children[i].hasOwnProperty("geometry")) {
            canvas.scene.children[i].geometry.mergeVertices();
            canvas.scene.children[i].castShadow = true;
            canvas.scene.children[i].geometry.computeFaceNormals();
            canvas.targetList.push(canvas.scene.children[i]);
            //canvas.scene.children[i].material = new THREE.MeshBasicMaterial(),
            canvas.scene.children[i].material.map = THREE.ImageUtils.loadTexture( 'texture/concrete.jpg');

            //canvas.scene.children[i].material.map = THREE.ImageUtils.loadTexture( 'texture/Polygonal_Textures_2.jpg');
            canvas.scene.children[i].material.map.minFilter = THREE.LinearFilter;
            canvas.scene.children[i].material.needsUpdate = true;
            
        }
        if (canvas.scene.children[i].children.length > 0) {
            for (var k = 0; k < canvas.scene.children[i].children.length; k++) {
                if (canvas.scene.children[i].children[k].hasOwnProperty("geometry")) {
                    canvas.targetList.push(canvas.scene.children[i].children[k]);
                }
            }
        }
    }
    
}


function addDetail(parent, mykey, myvalue, type) {//add stat detail to selected_spects
    var item = parent.append("div").attr("class", "spec_item");
    item.append("a").html(mykey).attr("title", mykey).attr("class", "itemkey itemfield hoverpop type" + type);
    item.append("a").html(myvalue).attr("title", myvalue).attr("class", "itemvalue itemfield hoverpop type" + type);
}

function clickHandler_sync(event, from_canvas, to_canvas, size, parent) {
    var top = $(parent).position().top;
    var left = $(parent).position().left;
    var realx = event.clientX - left;
    var realy = event.clientY - top;

    //console.log("clicked",realx,realy);

    from_canvas.selMaterial = new THREE.MeshBasicMaterial({ color: '#22bef7', side: '2' });   //color for selected mesh element
    to_canvas.defaultMaterial = new THREE.MeshBasicMaterial({ visible: "false" });
    this.selMaterial = new THREE.MeshPhongMaterial({ color: '#e3e3e3', side: '2' });   //color for selected mesh element


    $("#selected_item_type").text("None");
    $("#selected_item_id").text("");
    displayAttributes(null, from_canvas);


    //When clicking without selecting object, replace temp material for meshes and object3D
    if (from_canvas.lastMeshMaterial != -1) {
        //reset last material for last lastMeshID
        for (var i = 0; i < from_canvas.scene.children.length; i++) {
            if (from_canvas.scene.children[i].name == from_canvas.lastMeshID) {
                from_canvas.scene.children[i].material = from_canvas.lastMeshMaterial;
            }
        }
        for (var i = 0; i < to_canvas.scene.children.length; i++) {
            to_canvas.scene.children[i].material = to_canvas.defaultMaterial;
        }

    }


    if (from_canvas.lastObjectMaterial != -1) {
        //reset last material for last lastObjectID
        for (var i = 0; i < from_canvas.scene.children.length; i++) {
            if (from_canvas.scene.children[i].name == from_canvas.lastObjectID) {
                for (var ii = 0; ii < from_canvas.scene.children[i].children.length; ii++) {
                    from_canvas.scene.children[i].children[ii].material = from_canvas.lastObjectMaterial;
                }

            }
        }
    }


    var vector = new THREE.Vector3((realx / size[0]) * 2 - 1, - (realy / size[1]) * 2 + 1, 0.5);
    vector.unproject(from_canvas.camera);

    var raycaster = new THREE.Raycaster(from_canvas.camera.position, vector.sub(from_canvas.camera.position).normalize());
    //var raycaster = new THREE.Raycaster( VA3C.camera.position, vector.sub( ).normalize() );

    var intersects = raycaster.intersectObjects(from_canvas.targetList);
    //var intersects = raycaster.intersectObjects( VA3C.scene.children.geometry );

    if (intersects.length > 0) {

        //   intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //console.log(intersects[0].object.userData);


        var j = 0;
        while (j < intersects.length) {
            var count = 0;

            //FOR MESHES:
            if (!$.isEmptyObject(intersects[j].object.userData)) {
                count++;


                if (from_canvas.lastMeshMaterial != -1) {
                    //reset last material for last lastMeshID
                    for (var i = 0; i < from_canvas.scene.children.length; i++) {
                        if (from_canvas.scene.children[i].name == from_canvas.lastMeshID) {
                            from_canvas.scene.children[i].material = from_canvas.lastMeshMaterial;
                        }
                    }
                }

                //set lastMaterial
                from_canvas.lastMeshMaterial = intersects[j].object.material;

                //set lastMeshID
                from_canvas.lastMeshID = intersects[j].object.name;

                //apply SelMaterial
                intersects[j].object.material = from_canvas.selMaterial;

                displayAttributes(intersects[j].object.userData, from_canvas);

                break;
            }

            //FOR OBJECT3D
            if (!$.isEmptyObject(intersects[j].object.parent.userData)) {
                //console.log(intersects[j].object.parent.userData);
                count++;

                if (from_canvas.lastObjectMaterial != -1) {
                    //reset last material for last lastObjectID
                    for (var i = 0; i < from_canvas.scene.children.length; i++) {
                        if (from_canvas.scene.children[i].name == from_canvas.lastObjectID) {
                            for (var ii = 0; ii < from_canvas.scene.children[i].children.length; ii++) {
                                from_canvas.scene.children[i].children[ii].material = from_canvas.lastObjectMaterial;
                            }

                        }
                    }
                }

                //set lastMaterial
                from_canvas.lastObjectMaterial = intersects[j].object.material;

                //set lastObjectID
                from_canvas.lastObjectID = intersects[j].object.parent.name;

                //apply SelMaterial
                intersects[j].object.material = from_canvas.selMaterial;

                displayAttributes(intersects[j].object.parent.userData, from_canvas);
                break;
            }

            if (count == 0) {
                if (!$.isEmptyObject(intersects[j].object)) {

                    if (from_canvas.lastMeshMaterial != -1) {
                        //reset last material for last lastMeshID
                        for (var i = 0; i < from_canvas.scene.children.length; i++) {
                            if (from_canvas.scene.children[i].name == from_canvas.lastMeshID) {
                                from_canvas.scene.children[i].material = from_canvas.lastMeshMaterial;
                            }
                        }
                    }

                    //set lastMaterial
                    from_canvas.lastMeshMaterial = intersects[j].object.material;

                    //set lastMeshID
                    from_canvas.lastMeshID = intersects[j].object.name;

                    console.log(from_canvas.lastMeshID);

                    //apply SelMaterial
                    intersects[j].object.material = from_canvas.selMaterial;

                    for (var i = 0; i < to_canvas.targetList.length; i++) {
                        if (to_canvas.targetList[i].name == from_canvas.lastMeshID) {
                            to_canvas.targetList[i].material = this.selMaterial;
                            zoomExtends_AABB(to_canvas, to_canvas.targetList[i]);


                        }
                        else {

                            to_canvas.targetList[i].material = to_canvas.defaultMaterial;
                        }
                    }



                    displayAttributes(intersects[j].object, from_canvas);

                    break;
                }
            }
            j++;
        }

    } else {
        //msg.innerHTML = '';
    }
}

function clickHandler(event, canvas, size, parent) {
    var top = $(parent).position().top;
    var left = $(parent).position().left;
    var realx = event.clientX - left;
    var realy = event.clientY - top;

    //console.log("clicked",realx,realy);

    canvas.selMaterial = new THREE.MeshBasicMaterial({ color: '#22bef7', side: '2' });   //color for selected mesh element

    $("#selected_item_type").text("None");
    $("#selected_item_id").text("");

    //When clicking without selecting object, replace temp material for meshes and object3D
    if (canvas.lastMeshMaterial != -1) {
        //reset last material for last lastMeshID
        for (var i = 0; i < canvas.scene.children.length; i++) {
            if (canvas.scene.children[i].name == canvas.lastMeshID) {
                canvas.scene.children[i].material = canvas.lastMeshMaterial;
            }
        }
    }

    if (canvas.lastObjectMaterial != -1) {
        //reset last material for last lastObjectID
        for (var i = 0; i < canvas.scene.children.length; i++) {
            if (canvas.scene.children[i].id == canvas.lastObjectID) {
                for (var ii = 0; ii < canvas.scene.children[i].children.length; ii++) {
                    canvas.scene.children[i].children[ii].material = canvas.lastObjectMaterial;
                }

            }
        }
    }


    var vector = new THREE.Vector3((realx / size[0]) * 2 - 1, - (realy / size[1]) * 2 + 1, 0.5);
    vector.unproject(canvas.camera);

    var raycaster = new THREE.Raycaster(canvas.camera.position, vector.sub(canvas.camera.position).normalize());
    //var raycaster = new THREE.Raycaster( VA3C.camera.position, vector.sub( ).normalize() );

    var intersects = raycaster.intersectObjects(canvas.targetList);
    //var intersects = raycaster.intersectObjects( VA3C.scene.children.geometry );

    if (intersects.length > 0) {

        //   intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        //console.log(intersects[0].object.userData);


        var j = 0;
        while (j < intersects.length) {
            var count = 0;

            //FOR MESHES:
            if (!$.isEmptyObject(intersects[j].object.userData)) {
                count++;


                if (canvas.lastMeshMaterial != -1) {
                    //reset last material for last lastMeshID
                    for (var i = 0; i < canvas.scene.children.length; i++) {
                        if (canvas.scene.children[i].name == canvas.lastMeshID) {
                            canvas.scene.children[i].material = canvas.lastMeshMaterial;
                        }
                    }
                }

                //set lastMaterial
                canvas.lastMeshMaterial = intersects[j].object.material;

                //set lastMeshID
                canvas.lastMeshID = intersects[j].object.name;

                //apply SelMaterial
                intersects[j].object.material = canvas.selMaterial;



                displayAttributes(intersects[j].object.userData, canvas);

                break;
            }

            //FOR OBJECT3D
            if (!$.isEmptyObject(intersects[j].object.parent.userData)) {
                //console.log(intersects[j].object.parent.userData);
                count++;

                if (canvas.lastObjectMaterial != -1) {
                    //reset last material for last lastObjectID
                    for (var i = 0; i < canvas.scene.children.length; i++) {
                        if (canvas.scene.children[i].name == canvas.lastObjectID) {
                            for (var ii = 0; ii < canvas.scene.children[i].children.length; ii++) {
                                canvas.scene.children[i].children[ii].material = canvas.lastObjectMaterial;
                            }

                        }
                    }
                }

                //set lastMaterial
                canvas.lastObjectMaterial = intersects[j].object.material;

                //set lastObjectID
                canvas.lastObjectID = intersects[j].object.parent.name;

                //apply SelMaterial
                intersects[j].object.material = canvas.selMaterial;

                displayAttributes(intersects[j].object.parent.userData, canvas);
                break;
            }

            if (count == 0) {
                if (!$.isEmptyObject(intersects[j].object)) {

                    if (canvas.lastMeshMaterial != -1) {
                        //reset last material for last lastMeshID
                        for (var i = 0; i < canvas.scene.children.length; i++) {
                            if (canvas.scene.children[i].name == canvas.lastMeshID) {
                                canvas.scene.children[i].material = canvas.lastMeshMaterial;
                            }
                        }
                    }

                    //set lastMaterial
                    canvas.lastMeshMaterial = intersects[j].object.material;

                    //set lastMeshID
                    canvas.lastMeshID = intersects[j].object.name;

                    console.log(canvas.lastMeshID);

                    //apply SelMaterial
                    intersects[j].object.material = canvas.selMaterial;

                    displayAttributes(intersects[j].object, canvas);

                    break;
                }
            }
            j++;
        }

    } else {
        //msg.innerHTML = '';
    }
}
