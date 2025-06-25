var init = false;
window.addEventListener("mousemove", function(e){
  document.documentElement.style.cursor = "none";
  var coords = {
    x :e.clientX,
    y : e.clientY
  };
  var config = {
    color : "#0F0",
    thickness : "1px",
    pos : "fixed",
    targetLock : true,
    visibleCoords : true,
    invert : false
  };
  while(document.getElementsByClassName("gridMouseSect")[0]){
    var gridMouseSect = document.getElementsByClassName("gridMouseSect")[0];
    gridMouseSect.parentElement.removeChild(gridMouseSect);
  }
  var style = document.createElement("STYLE");
    style.innerHTML = "*:hover {outline: solid 1px #F00 !important;}";
    if(config.invert){
      style.innerHTML += "html { filter: invert(100%); }";
    }
  var top = document.createElement("DIV");
    top.className = "gridMouseSect gridMouseSectTop";
    top.style.width = config.thickness;
    top.style.height = coords.y + "px";
    top.style.position = config.pos;
    top.style.top = "0";
    top.style.left = coords.x + "px";
    top.style.pointerEvents = "none";
    top.style.zIndex = 500;
    top.style.backgroundColor = config.color ? config.color : "#F00";
    
  var left = document.createElement("DIV");
    left.className = "gridMouseSect gridMouseSectLeft";
    left.style.height = config.thickness;
    left.style.width = coords.x + "px";
    left.style.position = config.pos;
    left.style.left = "0";
    left.style.top = coords.y + "px";
    left.style.pointerEvents = "none";
    left.style.zIndex = 501;
    left.style.backgroundColor = config.color ? config.color : "#3F3";
    
  var right = document.createElement("DIV");
    right.className = "gridMouseSect gridMouseSectRight";
    right.style.height = config.thickness;
    right.style.width = (window.innerWidth - coords.x) + "px";
    right.style.position = config.pos;
    right.style.left = coords.x + "px";
    right.style.top = coords.y + "px";
    right.style.zIndex = 502;
    right.style.pointerEvents = "none";
    right.style.backgroundColor = config.color ? config.color : "#03F";
    
  var bottom = document.createElement("DIV");
    bottom.className = "gridMouseSect gridMouseSectBottom";
    bottom.style.width = config.thickness;
    bottom.style.height = (window.innerHeight - coords.y) + "px";
    bottom.style.position = config.pos;
    bottom.style.left = coords.x + "px";
    bottom.style.top = coords.y + "px";
    bottom.style.zIndex = 503;
    bottom.style.pointerEvents = "none";
    bottom.style.backgroundColor = config.color ? config.color : "#AF0";
  
  document.body.appendChild(top);
  document.body.appendChild(left);
  document.body.appendChild(right);
  document.body.appendChild(bottom);
  if(config.targetLock){
    var lock = document.createElement("DIV");
    lock.className = "gridMouseSect gridMouseSectLock";
    lock.style.width = "25px";
    lock.style.height = "25px";
    lock.style.position = config.pos;
    lock.style.left = (coords.x - 12.5) + "px";
    lock.style.top = (coords.y - 12.5) + "px";
    lock.style.zIndex = 504;
    lock.style.border = "solid 1px transparent";
    lock.style.borderColor = config.color ? config.color : "#0F0";
    lock.style.borderWidth = config.thickness;
    lock.style.pointerEvents = "none";
    document.body.appendChild(lock);
  }
  if(config.visibleCoords){
    var stats = document.createElement("DIV");
    stats.className = "gridMouseSect gridMouseSectCoords";
    stats.style.color = config.color ? config.color : "#000";
    stats.style.fontFamily = "monospace";
    stats.style.position = config.pos;
    stats.style.left = (coords.x + 12.5) + "px";
    stats.style.top = (coords.y + 12.5) + "px";
    stats.style.zIndex = 505;
    stats.innerText = "x: " + coords.x + ", y: " + coords.y;
    document.body.appendChild(stats);
  }
  if(!init){
    document.body.appendChild(style);
  }
  init = true;
  
});