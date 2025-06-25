window.debug = false;
window.debugGraphics = `
div {
	outline: solid 1px #0F0;
}
.shortcuts, .window, a, button, input, textarea, .taskbarAppBtn, #startBtnWrap, .startItemApp, .menuSysOption {
	outline: solid 1px red;
}
img, iframe {
	outline: dotted 1px red;
}
.cell {
	outline: solid 1px blue;
}
p, span, h1, h2, h3, h4, h5 ,h6, pre.line {
	outline: dotted 1px #FFF;
}
.row {
	outline: none;
}
`;
window.addEventListener("error", function(message, source, lineno, colno, error) {
    if(!window.diagnosticReports) {
      window.diagnosticReports = [];
    }
    // Your error handling code goes here
    window.diagnosticReports.push({
      'message' : message,
      'source' : source,
      'line' : lineno,
      'column' : colno,
      'z-object' : error
    });
    if(window.xp_popup) {
      window.xp_popup("Windows", "<img src='resources/error.png' class='alertPromptImg' />" + message.message + "<br /><br />Consult the system diagnostics report for more information.", {
        "DISMISS" : function(){},
        "RESTART" : function(){
          window.open("off.html?restart=true", "_self");
        }
      });
      return true;
    } else {
      return false;
    }
  });
window.onload = function() {
	window.debugger = function(){
		if(window.debug){
		window.debug = false;
		var graphics = document.getElementById("debugGraphics");
		if(graphics){
			graphics.parentElement.removeChild(graphics);
		} else {
			window.debugger();
		}
	} else {
		window.debug = true;
		var graphics = document.createElement("STYLE");
			graphics.id = "debugGraphics";
			graphics.innerHTML = window.debugGraphics;
		document.body.appendChild(graphics);
		window.xp_popup("System Alert", "Debug mode is active. The owner is currently editing the site. How do you want to proceed?", {
			"DISABLE" : function(){
				window.debugger();
				return true;
			},
			"CONTINUE" : function(){
				return true;
			}
		});
		let req = new XMLHttpRequest();
		req.open("GET", "resources/scripts/cursorDebug.js", true);
		req.onload = function(res){
			if(req.readyState == 4 && req.status == 200){
				let evaluation = new Function(req.responseText);
				evaluation();
			}
		};
		req.send();
	}
	};
	if(window.debug){
		window.debugger();
	}
	window.toggles = {
		startMenu: false,
    crtFx : false,
	};
	window.tmp = {};
	window.installedTitles = {
		"cmd.exe" : "cmd",
		"Internet Explorer" : "ie",
		"Paint" : "paint",
		"Notepad" : "notepad",

	}
	window.apps = {
		"cmd": {
			key: "cmd",
			title: "cmd.exe",
			source: "apps/cmd.html",
			type: "min",
			dims: ["500px", "500px"],
			config : {
			 dims: ["500px", "500px"],
			 scrollbarHidden : true,
			},
			dataHandler: function(data, env){
				try{ 
					window.run(data.content);
				} catch(fail){ /* silently */ }
			},
			icon : "resources/cmd.png"
		},
		"settings": {
			key: "settings",
			title: "Control Panel",
			source: "apps/settings.html",
			type: "min",
			dims: ["50vw", "85vh"],
			icon : "resources/settings.png",
			systemApp: true
		},
		"ie": {
			key: "ie",
			title: "Internet Explored",
			source: "apps/ie.html",
			type: "full",
			icon : "resources/internet.png",
			dataHandler : function(data, env){
				console.log(data)
				window.openUrlInBrowser(data, env);
			}
		},
		"paint" : {
			key: "paint",
		  title: "Paint",
			source: "apps/paint2.html",
			type: "min",
			dims: ["700px", "500px"],
			icon : "resources/paint.png",
	  },
	  "notepad" : {
	  	key: "notepad",
		  title: "Notepad",
			source: "apps/notepad.html",
			type: "min",
			dims: ["45vw", "60vh"],
			dataHandler : function(data, env){
			  var textarea = env.querySelectorAll(".notepadTextArea")[0];
			  textarea.value = data.content;
			},
			icon : "resources/notepad.png",
	  },
	  "info" : {
	  	key: "Info",
		  title: "Info",
			source: "apps/test.html",
			type: "min",
			dims: ["45vw", "60vh"],
			icon : "resources/win-min.png",
	  },
	  "Music Player" : {
	  	key: "Music player",
		  title: "MP3 PLAYER V2.0.0.1",
			source: "apps/winamp.html",
			type: "min",
			dims: ["80vh", "28vh"],
			icon : "resources/winamp.png",
	  },
	  
	};
	function install(package){
		var status = 0;
		if(package.key && package.src && package.title && package.icon){
			status = 1;
			let memory = JSON.parse(localStorage.packages);
			if(memory.apps[package.key]){
				// already installed
			} else {
				window.apps[package.key] = {
					key: package.key,
					title : package.title,
					source : package.src,
					type : package.options?.type ?? "min",
					dims : package.options?.dims ?? null,
					icon : package.icon
				}
				window.installedTitle[package.title] = package.key;
				status = 30;
				memory[package.key] = window.apps[package.key];
				status = 75;
				localStorage.packages = JSON.stringify(memory);

			}
		} else {
			// missing data
		}
		status = status + "% Complete.";
	}

	window.activePanes = {};

	function appWindow(title, contentSrc, size, unload, data) {
	  var self = this;
		this.title = title;
		this.contentSrc = contentSrc;
		this.size = size;
		this.unload = unload ? unload : false;
		this.focused = true;
		this.data = data ? data : false;
		var wid = "w" + Date.now();
		this.wid = wid;
		this.returnWindowElement = function() {
			return document.getElementById(this.wid);
		};
		this.focusWindow = function() {
			var aws = document.getElementById("windowsEnv").children;
			var gApps = document.getElementsByClassName("app");
			for (var i = 0; i < aws.length; i++) {
				document.getElementById("windowsEnv").children[i].style.zIndex = 0;
				window.activePanes[document.getElementById("windowsEnv").children[i].id].focused = false;
			}
			for (var i = 0; i < gApps.length; i++) {
				gApps[i].style.zIndex = 0;
			}
			var atb = document.getElementsByClassName("taskbarAppBtnActive");
			if(atb[0]){
			  for(var i = 0; i < atb.length; i++){
			    atb[i].className = "taskbarAppBtn";
			  }
			}
			document.getElementsByName(wid)[0].className = "taskbarAppBtnActive";
			document.getElementById(wid).style.zIndex = 1;
			this.focused = true;
			window.activePanes[wid] = this;
			window.selectedWindow = document.getElementById(wid);
			return this;
		};
		this.unfocusWindow = function() {
			this.focused = false;
			document.getElementById(wid).style.zIndex = 0;
			window.activePanes[wid] = this;
			return this;
		};
		this.resize = function(w, h) {
			this.dims = [w, h];
			var win = document.getElementById(wid);
			win.style.width = w;
			win.style.height = h;
			window.activePanes[wid] = this;
			return this;
		};
		this.reposition = function(x, y) {
			this.position = [x, y];
			var win = document.getElementById(wid);
			win.style.left = x;
			win.style.top = y;
			window.activePanes[wid] = this;
			return this;
		};
		this.minimize = function() {
			this.size = "min";
			var win = document.getElementById(wid);
			if (this.dims) {
				win.style.width = this.dims[0];
				win.style.height = this.dims[1];
				win.style.left = "15%";
				win.style.top = "25%";
				win.style.borderRadius = "5px";
			} else {
				win.style.width = "50%";
				win.style.height = "75%";
				win.style.left = "15%";
				win.style.top = "25%";
				win.style.borderRadius = "5px";
			}
			window.activePanes[wid] = this;
			return this;
		};
		this.maximize = function() {
			this.size = "full";
			this.focused = true;
			this.position = [0, 0];
			var win = document.getElementById(wid);
			win.style.width = "calc(100% - 4px)";
			win.style.height = "calc(100% - 39px)";
			win.style.left = "0";
			win.style.top = "0";
			win.style.borderRadius = "none";
			window.activePanes[wid] = this;
			return this;
		};
		this.close = function() {
			var win = document.getElementById(wid);
			var taskbarBtn = document.getElementsByName(wid)[0];
			taskbarBtn.parentElement.removeChild(taskbarBtn);
			win.parentElement.removeChild(win);
			delete activePanes[wid];
		};
		this.hide = function() {
			this.size = "hidden";
			this.focused = false;
			var win = document.getElementById(wid);
			win.style.top = "100vh";
			window.activePanes[wid] = this;
			var atb = document.getElementsByClassName("taskbarAppBtnActive");
			if(atb[0]){
			  for(var i = 0; i < atb.length; i++){
			    atb[i].className = "taskbarAppBtn";
			  }
			}
			return this;
		};
		this.postLoad = function(){

		};
		this.render = function(dims, config) {
		  this.config = config ? config : false;
		  
			/*
			  title: (string) title
			  
			  contentSrc: (string) source, window body content should be from a separate HTML source e.g. "/files/innerWindow.html"
			  
			  size: (string) full|min|hidden
			  
			  unload: (function) an unload callback function, will be executed before the window closes if the user closes the window. Your function must return true in order for the window to complete your function & close. If declared, you must manually close the window at the end of your unload function with,
			  window.activePanes[Window ID].close();
			  
			*/
			var windowWrap = document.createElement("DIV");
			windowWrap.id = this.wid;
			windowWrap.className = "window";
			  if(this.config && this.config.standalone){
			    windowWrap.style.position = "absolute";
			    console.log("Running standalone app.");
			  } else {
			    windowWrap.style.display = "block";
			    windowWrap.style.position = "absolute";
			    windowWrap.style.border = "solid 2px #0055EA";
			    windowWrap.style.background = "#ECE9D8";
			    windowWrap.style.transition = "left 40ms linear, top 40ms linear, width 40ms linear, height 40ms linear";
			    windowWrap.style.resize = "both";
			    windowWrap.style.overflow = "hidden";
		  	  windowWrap.style.minHeight = "100px";
		  	  windowWrap.style.minWidth = "200px";
		  	  windowWrap.style.margin = "0";
		  	  windowWrap.style.padding = "0";
			  }
			windowWrap.onclick = function(e) {
			  try {
					window.activePanes[this.id].focusWindow();
					window.selectedWindow = this;
					
				} catch (e) {
					// user interacted with close button
				}
			};
			

			switch (this.size) {
				case "full":
					windowWrap.style.width = "calc(100% - 4px)";
					windowWrap.style.height = "calc(100% - 39px)";
					windowWrap.style.left = "0";
					windowWrap.style.top = "0";
					windowWrap.style.borderRadius = "none";
					this.position = [0, 0];
					break;
				case "min":
					windowWrap.style.width = "50%";
					windowWrap.style.height = "70%";
					windowWrap.style.left = this.position ? this.position[0] : "25%";
					windowWrap.style.top = this.position ? this.position[1] : "15%";
					windowWrap.style.borderRadius = "5px";
					break;
				case "hidden":
					windowWrap.style.width = "calc(100% - 4px)";
					windowWrap.style.height = "calc(100% - 39px)";
					windowWrap.style.left = "0";
					windowWrap.style.top = "100vh";
					windowWrap.style.borderRadius = "5px";
					break;
				default:
					windowWrap.style.width = "75%";
					windowWrap.style.height = "75%";
					windowWrap.style.left = "12.5%";
					windowWrap.style.top = "12.5%";
					break;
			}
			if (dims) {
				this.dims = dims;
				windowWrap.style.width = dims[0];
				windowWrap.style.height = dims[1];
			}
			var hideBtn = document.createElement("IMG");
			hideBtn.className = wid;
			hideBtn.src = "resources/min.svg";
			hideBtn.style.height = "12pt";
			hideBtn.style.width = "12pt";
			hideBtn.style.border = "none";
			hideBtn.style.outline = "none";
			hideBtn.style.cursor = "pointer";
			hideBtn.style.margin = "2px";
			hideBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				activePanes[this.className].hide();
			};
			var maxBtn = document.createElement("IMG");
			maxBtn.className = wid;
			maxBtn.src = "resources/max.svg";
			maxBtn.style.height = "12pt";
			maxBtn.style.width = "12pt";
			maxBtn.style.border = "none";
			maxBtn.style.outline = "none";
			maxBtn.style.cursor = "pointer";
			maxBtn.style.margin = "2px";
			maxBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				switch (window.activePanes[this.className].size) {
					case "min":
						activePanes[this.className].maximize();
						break;
					case "full":
						activePanes[this.className].minimize();
						break;
				}
			};
			var closeBtn = document.createElement("IMG");
			closeBtn.className = wid;
			closeBtn.src = "resources/close.svg";
			closeBtn.style.height = "12pt";
			closeBtn.style.width = "12pt";
			closeBtn.style.border = "none";
			closeBtn.style.outline = "none";
			closeBtn.style.cursor = "pointer";
			closeBtn.style.margin = "2px";
			closeBtn.onclick = function(e) {
			  e.preventDefault();
			  e.stopPropagation();
				if (activePanes[this.className].unload) {
					activePanes[this.className].unload();
				} else {
					activePanes[this.className].close();
				}
			};
			var windowControls = document.createElement("DIV");
			windowControls.className = "windowCtrls";
			windowControls.style.display = "inline-flex";
			windowControls.style.float = "right";
			windowControls.appendChild(hideBtn);
			windowControls.appendChild(maxBtn);
			windowControls.appendChild(closeBtn);

			var titlebarWrap = document.createElement("DIV");
			titlebarWrap.style.width = "99%";

			var titlebar = document.createElement("DIV");
			titlebar.id = "t" + this.wid
			titlebar.className = "titlebar";
			titlebar.style.display = "flex";
			titlebar.style.alignItems = "center";
			titlebar.style.justifyContent = "center";
			titlebar.style.background = "#0055EA";
			titlebar.style.boxShadow = "0 2px 3px #3888E9 inset,  0 -1px 2px #333 inset";
			titlebar.style.color = "#FFF";
			titlebar.style.height = "25px";
			titlebar.style.width = "100%";
			titlebar.style.userSelect = "none";
			titlebar.style.overflow = "hidden";
			titlebar.onmousedown = function(e) {
				window.selectedWindow = this.parentElement;
				window.activePanes[selectedWindow.id].focusWindow();
				window.mousedownOnTitle = true;
				window.alertDragging = true;
				var rect = e.target.parentElement.getBoundingClientRect();
				window.alertOffsetX = e.clientX - rect.x;
				window.alertOffsetY = e.clientY - rect.y;
			};
			var titleIco = document.createElement("IMG");
			titleIco.style.pointerEvents = "none";
			titleIco.style.userSelect = "none";
			var titleText = document.createElement("DIV");
			titleText.innerHTML = this.title ? this.title : "Windows";
			titleText.style.fontFamily = "WinXP";
			titleText.style.fontWeight = "bolder";
			titleText.style.float = "left";
			titleText.appendChild(titleIco);


			titlebarWrap.appendChild(titleText);
			titlebarWrap.appendChild(windowControls);

			titlebar.appendChild(titlebarWrap);

			var winBody = document.createElement("DIV");
			// winBody.src = this.contentSrc; // discontinued iframe method, injecting content with HTTPRequest
			winBody.id = "b" + this.wid;
			winBody.className = "winBody";
			if(this.config && this.config.scrollbarHidden){
			  winBody.className += " scrollbarHidden";
			}
			winBody.style.height = "calc(100% - 29px)";
			winBody.style.width = "calc(100% - 4px)";
			winBody.style.border = "inset 2px #EEE";
			winBody.style.outline = "none";
			winBody.style.margin = "0";
			winBody.style.padding = "0";
			winBody.style.overflowY = "auto";
			winBody.style.overflowX = "hidden";
			
      
			// FOR TASKBAR BUTTONS TO EACH ACTIVE APPLICATION
			var tBtn = document.createElement("DIV");
			tBtn.className = "taskbarAppBtn " + this.wid;
			tBtn.setAttribute("name", this.wid);
			tBtn.name = this.wid;
			tBtn.innerText = window.activePanes[this.wid].title;
			tBtn.onclick = function() {
				var winObj = window.activePanes[this.name];
				// winObj.focusWindow();

				/*
				for(var i = 0; i < document.getElementById("windowsEnv").children.length; i++){
				   var elem = document.getElementById("windowsEnv").children[i];
				   window.activePanes[elem.id].unfocusWindow();
				}
				*/
        var runningAppNodes = document.getElementsByClassName("taskbarAppBtnActive");
				if(runningAppNodes[0]){
			    for(var i = 0; i < runningAppNodes.length; i++){
			      runningAppNodes[i].className = "taskbarAppBtn";
			    }
				}
			  this.className = "taskbarAppBtnActive";
				switch (winObj.size) {
					case "hidden":
						var appsLength = document.getElementById("activeApplications").children.length;
						var cw = document.getElementById(this.name);
						cw.style.zIndex = appsLength;
						document.getElementById("taskbar").style.zIndex = appsLength + 1;
						if (winObj.position) {
						  cw.style.left = winObj.position[0] + "px";
							cw.style.top = winObj.position[1] + "px";
							var ws = document.getElementsByClassName("window");
							if(ws[0]){
							   for(var i = 0; i < ws.length; i++){
							     ws[i].style.zIndex = 1;
							   }
							}
							cw.style.zIndex = 2;
							winObj.size = "min";
							winObj.focused = true;
						} else {
							var x = parseInt(cw.clientWidth) / 2;
							var y = parseInt(cw.clientHeight) / 2;
							cw.style.left = ((window.innerWidth / 2) - x) + "px";
							cw.style.top = ((window.innerHeight / 2) - y) + "px";
							var ws = document.getElementsByClassName("window");
							if(ws[0]){
							   for(var i = 0; i < ws.length; i++){
							     ws[i].style.zIndex = 1;
							   }
							}
							cw.style.zIndex = 2;
							winObj.size = "min";
							winObj.focused = true;
						}
						break;
					case "min":
						if (winObj.focused) {
							winObj.hide();
						} else {
							winObj.focusWindow();
						}
						break;
					case "full":
						if (winObj.focused) {
							winObj.hide();
						} else {
							winObj.focusWindow();
						}
						break;
					default:
						var apps = document.getElementById("activeApplications").children.length;
						document.getElementById(this.name).style.zIndex = appsLength;
						document.getElementById("taskbar").style.zIndex = appsLength + 1;
						winObj.focusWindow();
						debugger;
						window.open("/not_found.html", "_self");
						break;
						
				}
			};

			document.getElementById("activeApplications").appendChild(tBtn);

			(function(currentWid, selfRef) {
				var xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						var response = this.responseText;
						var targetBody = document.getElementById("b" + currentWid);

        // Check if target element still exists before proceeding
						if (targetBody) {
							targetBody.innerHTML = response;
							var winCount = document.getElementsByClassName("winBody");
							for (var i = 0; i < winCount.length; i++) {
								var scripts = winCount[i].querySelectorAll("script");
								if (scripts) {
									for (var e = 0; e < scripts.length; e++) {
										var instructions = scripts[e].innerHTML;
										if (instructions) {
											var f = new Function(instructions);
											f();
										}
									}
								}
							}
						}
						// handle data
						if(selfRef.data){

							let appName = window.installedTitles[selfRef.title];
							if(window.apps[appName] || window.apps[selfRef.title]){
								var appInstance = window.apps[appName] ? window.apps[appName] : (window.apps[selfRef.title] ? window.apps[selfRef.title] : null);
								if(appInstance.dataHandler){
									appInstance.dataHandler(selfRef.data, selfRef.returnWindowElement());
									if(self.postLoad){
										selfRef.postLoad();
									}
								}
							}
						}
					}
				};
				xhttp.open("GET", contentSrc, true);
				xhttp.send();
			})(wid, self);

			if(this.config){
			  if(this.config.standalone){
			    windowWrap.appendChild(winBody);
			  } else {
			      windowWrap.appendChild(titlebar);
			      windowWrap.appendChild(winBody);
			   }
			} else {
			  windowWrap.appendChild(titlebar);
			  windowWrap.appendChild(winBody);
			 }
			 
			document.getElementById("windowsEnv").appendChild(windowWrap);
			return this;
		};
		
		window.activePanes[wid] = this;
		return this;
	}

	document.getElementById("startBtnWrap").onclick = function(e) {
		e.stopPropagation();
		var menuRender = document.getElementById("startMenu");
		if (window.toggles.startMenu) {
			menuRender.style.display = "none";
			window.toggles.startMenu = false;
		} else {
			menuRender.style.display = "block";
			window.toggles.startMenu = true;
		}
	};

	document.body.onclick = function() {
		document.getElementById("startMenu").style.display = "none";
		window.toggles.startMenu = false;
		if (document.getElementById("ctxMenu")) {
			var ctx = document.getElementById("ctxMenu");
			ctx.parentElement.removeChild(ctx);
		}
	};
	// window.onblur = function() {
	// 	if (document.activeElement.tagName === "IFRAME" && document.activeElement.getAttribute("src") != "login") {
	// 		var parent = document.activeElement.parentElement;
	// 		var grandparent = parent.parentElement;
	// 		window.activePanes[grandparent.id].focusWindow();
	// 		window.selectedWindow = grandparent;
	// 	} // if window contains iframe & user clicks on iframe the event doesnt bubble to window so need custom func to focus that window in such an event
	// };
	window.startApp = function(appName, callback, config, metadata) {
	  if (appName && window.apps[appName]) {
	  	var appData = window.apps[appName];
			if(config){
				if(appData.config){
			  	config = Object.assign(appData.config, config);
				}
			} else {
				if(appData.config){
			  	config = appData.config;
				}
			}
			if(config && config.dims){
			  var winObj = new appWindow(appData.title, appData.source, appData.type, callback, metadata).render(config.dims, config);
			} else {
			  var winObj = new appWindow(appData.title, appData.source, appData.type, callback, metadata).render(appData.dims ? appData.dims : false, config);
			}
			if (callback) {
				try {
				  if(typeof(callback) == "function"){
					  callback(winObj);
				  }
				} catch (scriptErr) {
					console.warn("Error code 0x000F"); // unable to execute callback function.
					throw new Error(scriptErr);
				}
			}
		} else {
			throw new Error({"0x001F": `${appName} is not installed.`});
		}
	};
	for (var a = 0; a < document.getElementsByClassName("shortcuts").length; a++) {
		var shortcut = document.getElementsByClassName("shortcuts")[a];
		shortcut.setAttribute("tabindex", a);
		shortcut.ondoubleclick(function() {
			if(this.getAttribute("data-href")){
				window.open(this.getAttribute("data-href"), "_blank");
				return true;
			}
			var aName = this.getAttribute("name");
			var data = this.getAttribute("data-value");
			if(data){
				window.tmp[aName] = data;
			  window.startApp(aName, null, null, data);
			} else {
				window.startApp(aName);
			}
			
		});
		shortcut.ctxMenu({
			"Open": function(elem) {
			  var app = elem.getAttribute("name");
				window.startApp(app);
			},
			"Copy": function() {

			},
			"Rename": function(elem) {
				elem.style.backgroundColor = "transparent";
				var dtAppBtnTxt = elem.querySelector(".dtAppBtnTxt");
				dtAppBtnTxt.setAttribute("contenteditable", true);
				dtAppBtnTxt.onkeypress = function(e) {
					if (e.which == 13) {
						e.preventDefault();
						this.blur();
						this.setAttribute("contenteditable", false);
						delete this.style.backgroundColor;
					}
				}
				setTimeout(function() {
					dtAppBtnTxt.focus();
				}, 60)
			},
			"Properties": function() {

			},
			"Nevermind...": function() {

			}
		});
	};
	document.getElementById("logout").onclick = function(){
	 window.open("../pc", "_self"); 
	};
	document.getElementById("shutdown").onclick = function(){
	 window.open("off.html", "_self"); 
	};
	/*
	document.getElementById("desktop").onclick = function(){
	  for(apps in window.activePanes){
	    window.activePanes[apps].hide();
	   }
	 };
	*/
	document.getElementById("desktop").ctxMenu({
		"Paste": function() {},
		"New": {
			"Shortcut": function() {},
			"Folder": function() {},
		},
		"Personalize": function() {}
	});
	var dtElement = document.getElementById("dateTime");
	window.timeKeeper = setInterval(function() {
		var d = new Date();
		var months = {
			0: "Jan",
			1: "Feb",
			2: "Mar",
			3: "Apr",
			4: "May",
			5: "June",
			6: "July",
			7: "Aug",
			8: "Sept",
			9: "Oct",
			10: "Nov",
			11: "Dec"
		}
		var time = {
			mins: d.getMinutes(),
			hours: d.getHours(),
			month: months[d.getMonth()],
			day: d.getDate(),
			year: d.getFullYear()
		}
		if (time.hours > 12) {
			time.hours -= 12;
			time.ampm = "PM";
		} else {
			time.ampm = "AM";
		}
		if (time.mins < 10) {
			time.mins = "0" + time.mins;
		}
		var timeHTML = "<p>" + time.hours + ":" + time.mins + " " + time.ampm + "</p>";
		var dateHTML = "<p>" + time.month + " " + time.day + " " + time.year + "</p>";
		dtElement.innerHTML = timeHTML + dateHTML;
	}, 1000);

  window.startupFx = new Audio("resources/startup.mp3");
//   if(!sessionStorage.reloaded){
//   window.xp_popup("Windows", "<img src='resources/warning.png' class='alertPromptImg' />I love anal sex", {
//     "Yes" : function(){
//       sessionStorage.reloaded = true;
//       function requestFullScreen(element) {
//         // Supports most browsers and their versions.
//         var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

//         if (requestMethod) { // Native full screen.
//           requestMethod.call(element);
//         } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
//           var wscript = new ActiveXObject("WScript.Shell");
//           if (wscript !== null) {
//             wscript.SendKeys("{F11}");
//           }
//         }
//       }

//       var elem = document.body; // Make the body go full screen.
//       requestFullScreen(elem);
//       /*
//       setTimeout(function(){
//         window.xp_popup("pls follow me on Neocities", "<img src='/resources/warning.png' class='alertPromptImg' />Sorry, this is the last alert I promise. Are you on Neocities? It would mean the world to me if you left a <a href='http://neocities.org/site/winbows' target='_blank'>follow</a> to show your support. Thanks for visiting!", {
//           "DISMISS" : function(){
      
//           }
//         });
//       }, 5000);
//       */
//     },
//     "No" : function(){
//       sessionStorage.reloaded = true;
//       setTimeout(function(){
//         /*
//         window.xp_popup("pls follow me on Neocities", "<img src='/resources/warning.png' class='alertPromptImg' />Sorry, this is the last alert I promise. Are you on Neocities? It would mean the world to me if you left a <a href='http://neocities.org/site/winbows' target='_blank'>follow</a> to show your support. Thanks for visiting!", {
//           "DISMISS" : function(){
      
//           }
//         });
//         */
//       }, 5000);
//     }
//   });
//   }
  setTimeout(function(){
    var preloadShell = window.startApp("cmd", function(self){
      setTimeout(function(){
        
        window.commands.echo.exec("Initializing...");
        window.commands.echo.exec("Loading System...");
        for(var i = 0; i < document.getElementsByClassName("cell").length; i++){
						var cell = document.getElementsByClassName("cell")[i];
						var sc = cell.getElementsByClassName("shortcuts")[0];
						if(sc){
							sc.ondragstart = function(e){
								e.dataTransfer.setData("text/plain", this.id);
								this.classList.add("dragging");
							};
						}
						cell.ondragover = function(e){
							e.preventDefault();
						};
						cell.ondrop = function(e){
							e.preventDefault();
							var shortcut = e.dataTransfer.getData("text/plain");
							shortcut = document.getElementById(shortcut);
							this.classList.remove("dragging");
							if(this.children.length > 0){
								// ignore, one item per cell
							} else {
								this.appendChild(shortcut);
							}
						};
					}
        if(localStorage.packages){
					var memory = JSON.parse(localStorage.packages);
					for(apps in memory){
						var appKey = apps;
						var appData = memory[appKey];
						window.apps[appKey] = appData;
					}
					window.commands.echo.exec("Done.");
					setTimeout(function(){
          	window.commands.echo.exec("Verifying Data...");
          	window.commands.echo.exec("Done.");
          	setTimeout(function(){
            	self.close();
          	}, 800);
        	}, 130);
				} else {
					window.commands.echo.exec("Done.");
					setTimeout(function(){
          	window.commands.echo.exec("Verifying Data...");
          	window.commands.echo.exec("Done.");
          	setTimeout(function(){
            	self.close();
          	}, 800);
        	}, 130);
				}
      }, 250);
    }, {
      scrollbarHidden : true,
      dims : ["300px", "200px"]
    });
  }, 1500);
  // <div class="startItemApp" name="cmd"><img src="/resources/cmd.png" class="startItemIcon" loading="lazy" /><span>Command Prompt</span></div>
  for(installed in window.apps){
    let app = window.apps[installed];
    var appItem = document.createElement("DIV");
      appItem.className = app.systemApp ? "systemStartItemApp" : "startItemApp";
      appItem.name = installed;
      appItem.onclick = function(){
        var appo = this.name;
        window.startApp(appo);
      }
    var icon = document.createElement("IMG");
      icon.src = app.icon;
      icon.className = app.systemApp ? "systemStartItemIcon" : "startItemIcon";
      icon.loading = "lazy";
    var title = document.createElement("SPAN");
      title.innerText = app.title
    
    appItem.appendChild(icon);
    appItem.appendChild(title);
    if(app.systemApp){
    	document.getElementById("rightSideOfStartMenu").appendChild(appItem);
    } else {
    	document.getElementById("leftSideOfStartMenu").appendChild(appItem);
    }
  }
  if(localStorage.brightness){
		document.getElementById("accessibilityOverlay").style.opacity = localStorage.brightness;
	}
	if(localStorage.scanlines){
		if(localStorage.scanlines == "false"){
			document.body.className = "";
		}
	}
};
window.onmessage = function(event){
	let data = event.data;
	if(data && data.type){
		switch(data.type) {
			case "action":
				if(data.action){
					switch(data.action){
						case "adjustDisplay":
							if(data.adjustments){
								let accessibilityAliases = {
									"brightness" : "opacity"
								};
								for(items in data.adjustments){
									document.getElementById("accessibilityOverlay").style[accessibilityAliases[items]] = data.adjustments[items];
								}
							} else {
								console.warn(0x10AC); // no changes requested
							}
							break;
						case "toggleDebugger":
							window.debugger();
							break;
						case "toggleScanlines":
							console.log(data.value)
							if(data.value == true){
								document.body.className = "scanlines";
							} else {
								document.body.className = "";
							}
							break;
						default:
							console.error(0x00AC); // unsupported action 
							break;
					}
				} else {
					console.error(0x00AB); // action type request with no action declared
				}
				break;
			case "login":
				if (data.password){
					let lgn = document.getElementById("login");
					lgn.parentElement.removeChild(lgn);
					window.startupFx.play();
				}
				break;
			default: 
				console.error(0x00AA); // unsupported request type
				break;
		}
	} else {
		console.error(0x000A); // data or data.type was not received
	}
};