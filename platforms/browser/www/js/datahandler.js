


//handle data file and visualize on the control panel
function datahandler(data) {

    var overall_place = d3.select(".data_nav");

    //iterate(overall_place,restructure(data),0);
    nonIterate(overall_place, restructure(data));
    tagbtn(overall_place,restructure(data));
    selectDataItem(restructure(data));
}

//iterate data until all level explored
function iterate(placeholder, data, level) {

    for (k in data) {
        var appended = "";
        if (level > 0) appended = " tohide";
        var thisplace = placeholder.append("div").attr("class", "dataitem" + appended);
        thisplace.append("p").attr("level", level).text(k);

        var thisdata = data[k];

        if (lengthOf(thisdata) > 0) {

            iterate(thisplace, thisdata, level + 1);
        } else {
            thisplace.append("div").attr("class", "dataitem tohide").append("p").attr("level", (level + 1)).text(thisdata);
        }
    }
}

function loc_it(placeholder,data){
    if(window.tag_selected.length)
    for (k in data) {
        var thissub = placeholder.append("div").attr("class","dataitem");
        thissub.text(k);//add the name

        if(data[k].Source != "rvt" && Object.keys(data[k]).length)//make sure not geom
        for(kk in data[k]){
            (function(k,kk){
                var item = data[k][kk];
                var thisplace = thissub.append("div");
                
                //var lstlength = item.length? item.length:0;
                var lstlength = geomlength(item)? geomlength(item):0;

                var appendix = lstlength? "<i>x"+lstlength+"</i>":"";
                thisplace.append("p").html("<img src='img/triangle-arrow-bottom-down-vector-ui-128_white.png' class = 'downarrow'>"+kk+appendix)//add the value list
                    .on("click",function(){
                    
                    if(thisplace.select(".dataitem")[0][0])//fold
                        thisplace.selectAll(".dataitem").remove();
                    else{//unfold
                        loc_it(thisplace,item);
                    }
                });

            })(k,kk);

        }
    }

}

function geomlength(data){
    
    return flatten_geom(data).length;
}

function flatten_geom(data){
    var newdata = [];
    var mydata = jQuery.extend(true, {}, data);

    Object.keys(data).forEach(function(key) {
        var myk = key;
        var item = mydata[myk];
        if(item.Source != "rvt"){//not geom
            newdata.push.apply(newdata, flatten_geom(mydata[myk]))
        }else{
            newdata.push(item);
        }
        
    });
 
    
    console.log(newdata);
    
    return newdata;
    
}


function display_data(placeholder, data, level){
    for (k in data) {
        for(kk in data[k]){
            (function(k,kk){
                var appended = "";
                if (level > 0) appended = " tohide";
                var thisplace = placeholder.append("div").attr("class", "dataitem" + appended);
                var lstlength = data[k][kk].length? data[k][kk].length:0;
                var appendix = lstlength? "<i>x"+lstlength+"</i>":"";
                
                thisplace.append("p").attr("level", level).html(kk+appendix)
                    .on("click",function(){
                        console.log(thisplace.select(".thissub")[0][0]);
                        if(thisplace.select(".thissub")[0][0])
                            thisplace.select(".thissub").remove();
                        else{
                            var thissub = thisplace.append("div").attr("class","thissub");
                            for(m in data[k][kk]){//current data
                                var item = data[k][kk][m];
                                console.log(item);
                                thissub.append("ul").text(m);
                            }
                        }
                    });
            })(k,kk)

        }

/*        
        var thisdata = data[k];

        if (lengthOf(thisdata) > 0) {

            iterate(thisplace, thisdata, level + 1);
        } else {
            thisplace.append("div").attr("class", "dataitem tohide").append("p").attr("level", (level + 1)).text(thisdata);
        }*/
    }
}

function nonIterate(placeholder, data) {
    
    
    var addedtag = [];
    for (k in data) {
        //var thisplace = placeholder.append("div").attr("class", "dataitem");
        for (m in data[k][0]) {

                //thisplace.attr(cleanTag(m), data[k][0][m]);

                if (addedtag.indexOf(m) == -1) {
                    d3.select("#selector_lst").append("ul").text(m);
                    addedtag.push(m);
                }
            

        }

        d3.selectAll("#selector_lst ul")
            .on("click", function () {
                var index = d3.select(this).text();
                d3.selectAll(".dataitem i")
                    .text(function () {
                        return d3.select(this.parentNode).attr(cleanTag(index));
                    });

                setvalueLst(placeholder,index,data);
                
                

            });

/*        thisplace.append("p").text(k + " | " + data[k][0].Name);
        thisplace.append("i");
*/
    }
    initClickSelector();


}

function setvalueLst(placeholder,index,data) {
    
    if(window.tag_selected.indexOf(index)==-1){//add tag to the list
        window.tag_selected.push(index);
        d3.select("#selected").append("ul").text(index);
        resetLst(placeholder,data,valuelst);
    }

    
    tagbtn(placeholder,data);
}


function tagbtn(placeholder,data){//remove tag from list
	d3.selectAll("#selected ul").on("click",function(){
		d3.select(this).remove();
        window.tag_selected.splice(window.tag_selected.indexOf(d3.select(this).text()), 1);
        resetLst(placeholder,data);
	});
}

function resetLst(placeholder,data){
    //reset whole data list, regroup list based on selected category
    
    window.tempdata = jQuery.extend(true, {}, data);
    
    var testthis = function(lst,level,name,valuelst){
        
    }
    var itlevel = function(lst,level,name,valuelst){
        if(level == 0){
            var tree = {};
            tree[name] = {};
            
            for(kk in valuelst){
                var value = valuelst[kk];
                tree[name][value] = [];
                
                for(i in lst){
                    if(Array.isArray(lst[i])){
                        for(ii in lst[i]){
                            if(lst[i][ii][name] == value)
                                tree[name][value].push(lst[i][ii]);
                        }                    
                    }else{
                        if(lst[i][name] == value)
                            tree[name][value].push(lst[i]);
                    }
                }
                if(tree[name][value].length == 0){
                    delete tree[name][value];
                }
                
            }
            
            return tree;
        }else{
            for(i in lst){
                var myi = i;
                for(ii in lst[myi]){
                    lst[myi][ii] = itlevel(lst[myi][ii],level-1,name,valuelst);
                }
            }
            return lst;
        }

        
        
    }
    
    var regroup = function(lstori,lst,tag,level){
        var thisvaluelst = valuelst(lstori,tag);
        return itlevel(lst,level,tag,thisvaluelst);
    }
    
    d3.selectAll(".dataitem").remove();
    
    //tempdata = regroup(tempdata,window.tag_selected[0]);
    
    for(k in window.tag_selected){
        window.tempdata = regroup(data,window.tempdata,window.tag_selected[k],+k);
    }
    
    var overall_place = d3.select(".data_nav");
    loc_it(overall_place,window.tempdata);
    //selectDataItem(restructure(data));

}

function valuelst(data,name) {
    var valuelst = [];
    for (k in data) {
        for(m in data[k][0]){
            if(m == cleanTag(name) ){
                var thisvalue = data[k][0][m];//d3.select(allitem[0][k]).attr(cleanTag(index));
                if (valuelst.indexOf(thisvalue) == -1 && thisvalue) {
                    valuelst.push(thisvalue);
                }
            }            
            
        }

    }
    return valuelst;
    
}

function cleanTag(input) {

    return input.split("(")[0].replace("/", "_");

}

function initClickSelector() {
    $("#selector_lst ul").click(function () {
        $("#selector_lst").toggleClass("tohide");
        $("#selector i").text($(this).text());
    });
}

//calculate the item length of anything, list or object
function lengthOf(obj) {
    if (typeof obj == "string"
        || typeof obj == "number"
        || typeof obj == "boolean") return 0;

    else {
        return Object.keys(obj).length;
    }

}

//restructure data based on input hierarchy
function restructure(data, hierarchy) {

    var geoms = data.BEs;
    var outdata = lst_subflatten(geoms);

    return outdata;
}

function lst_subflatten(lst){
    var outlst = [];
    for(k in lst){
        var item = lst[k];
        var newitem = {};
        flatten(item,newitem);
        outlst.push([newitem]);
    }
    return outlst;
    
}

function flatten(obj,newobj){//flatten obj to newobj

    for(k in obj){
        if(lengthOf(obj[k])){
            flatten(obj[k],newobj);
        }else{
            newobj[k]=obj[k];
        }

    }
    
}


function displayAttributes(obj, canvas) {//user data

    d3.selectAll(".spec_item").remove();
    d3.selectAll(".spects_btn").remove();

    if (obj) {
        var bes = canvas.data["BEs"];
        $("#selected_item_id").text(obj["name"]);

        d3.select("#selected_spects").append("div").attr("class", "spects_btn selected").attr("id", "general").text("General");
        d3.select("#selected_spects").append("div").attr("class", "spects_btn").attr("id", "dimensions").text("Dimensions");

        addDetail(d3.select("#selected_spects"), "<strong>NAME</strong>", "<strong>VALUE</strong>", "title");

        var thisparent = d3.select("#selected_spects");

        for (k in bes) {
            if (bes[k]["Name"] == obj["name"]) {
                $("#selected_item_type").text(bes[k].componentType);

                /*                for(kk in bes[k]){
                                    if(kk!="General" && kk!="Dimensions")
                                        addDetail(thisparent,kk,bes[k][kk]);
                                }*/

                for (kk in bes[k].General) {
                    addDetail(thisparent, kk, bes[k].General[kk], "general");
                }

                for (kk in bes[k].Dimensions) {
                    addDetail(thisparent, kk, bes[k].Dimensions[kk], "dimensions");
                }

                break;
            }
        }

        $(".typedimensions").hide();
        set_select_btn();
    }
}

function updateAttributes(name, data) {
    //update selected object form
    d3.selectAll(".spec_item").remove();
    d3.selectAll(".spects_btn").remove();

    var bes = data["BEs"];
    $("#selected_item_id").text(name);

    d3.select("#selected_spects").append("div").attr("class", "spects_btn selected").attr("id", "general").text("General");
    d3.select("#selected_spects").append("div").attr("class", "spects_btn").attr("id", "dimensions").text("Dimensions");

    addDetail(d3.select("#selected_spects"), "<strong>NAME</strong>", "<strong>VALUE</strong>", "title");
    var thisparent = d3.select("#selected_spects");

    for (k in bes) {
        if (bes[k]["Name"] == name) {
            $("#selected_item_type").text(bes[k].componentType);

            /*            for(kk in bes[k]){
                            if(kk!="General" && kk!="Dimensions")
                                addDetail(thisparent,kk,bes[k][kk]);
                        }*/

            for (kk in bes[k].General) {
                addDetail(thisparent, kk, bes[k].General[kk], "general");
            }

            for (kk in bes[k].Dimensions) {
                addDetail(thisparent, kk, bes[k].Dimensions[kk], "dimensions");
            }

            break;
        }
    }

    $(".typedimensions").hide();
    set_select_btn();


    //update selection for sub canvas
    //console.log(VA3C.maincanvas.targetList);
    this.selMaterial = new THREE.MeshPhongMaterial({ color: '#e3e3e3', side: '2' });   //color for selected mesh element
    this.defaultMaterial = new THREE.MeshBasicMaterial({ visible: "false" });

    for (k in VA3C.subcanvas.targetList) {
        if (VA3C.subcanvas.targetList[k].name == name) {
            console.log(VA3C.subcanvas.targetList[k]);
            VA3C.subcanvas.targetList[k].material = this.selMaterial;
            zoomExtends_AABB(VA3C.subcanvas, VA3C.subcanvas.targetList[k]);

        } else {
            VA3C.subcanvas.targetList[k].material = this.defaultMaterial;
        }

    }

}