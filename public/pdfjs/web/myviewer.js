/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2021-02-18 10:33:39
 * @LastEditors: Mao 
 * @LastEditTime: 2022-01-25 10:57:58
 */

var  initX = 0,initY = 0,lastX = 0,lastY = 0;var wId = "w";
var index = 0;

function onmousedown(e,id) {
    initX = e.pageX - $('#'+id).offset().left;
    initY = e.pageY - $('#'+id).offset().top;
    index++;
   var div = document.createElement("dragdiv");
   div.id = wId + index;
   div.className = "dragdiv";
   div.style.marginLeft = initX + "px";
   div.style.marginTop = initY + "px";
   $("#"+id).append(div);
}

function onmousemove(e,id){
    lastX = e.pageX - $('#'+id).offset().left;
    lastY = e.pageY - $('#'+id).offset().top;
    var width = lastX - initX;
    var height = lastY - initY;
    $("#"+wId + index).css('marginLeft',initX); 
   $("#"+wId + index).css('marginTop',initY)
   $("#"+wId + index).width(width) ;
   $("#"+wId + index).height(height);
}

function onmouseup(e,id){
    $(wId + index).remove();
    lastX = e.pageX - $('#'+id).offset().left;
    lastY = e.pageY - $('#'+id).offset().top;

    var width = lastX - initX;
    var height = lastY - initY;
    var div = "<div class='dv' style=\"border:1px solid #000;position:absolute;left:"+initX+"px;top:"+initY+"px;width:"+width+"px;height:"+height+"px\"></div>";

    $("#"+id).append(div);

    var divW =  $("#"+id).width();
    var divH = $("#"+id).height();

    var coorB = divH - height - initY; // 计算 左下角的 Y 坐标

    var xPropo = initX/divW;  //左下角的 x 坐标  的比例
    var yPropo = coorB/divH;   //左下角的 Y 坐标  的比例

    var wPropo = width/divW;  //画的框的 宽度  的比例
    var hPropo = height/divH; //画的框的 高度  的比例
    var pageNum = id.substring(9,id.length);
    if(window.localStorage.getItem('shelter')){
        // let shelter = [pageNum,xPropo,yPropo,wPropo,hPropo]
        let shelter = {'pageNum':pageNum,'xPropo':xPropo,'yPropo':yPropo,'wPropo':wPropo,'hPropo':hPropo}

        let  shelterList = window.localStorage.getItem('shelter')
        // shelterList = eval(shelterList)
        shelterList = JSON.parse(shelterList)

        shelterList.push(shelter)
        shelterList = JSON.stringify(shelterList)
        window.localStorage.setItem('shelter',shelterList)
    }else{
        // let shelter = [pageNum,xPropo,yPropo,wPropo,hPropo]
        let shelter = {'pageNum':pageNum,'xPropo':xPropo,'yPropo':yPropo,'wPropo':wPropo,'hPropo':hPropo}

        let shelterList = []
        shelterList.push(shelter)
        shelterList = JSON.stringify(shelterList)
        window.localStorage.setItem('shelter',shelterList)
    }
    
}

let interval  = setInterval(()=>{
  
    if(!window.localStorage.getItem('shelter')){
        $('dragdiv').remove()
        $('.dv').remove()
    }
},2000)
