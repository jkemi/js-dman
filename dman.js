/**
 * Javascript dependency manager.
 * Copyright (C) 2011 Jakob Kemi <jakob.kemi@gmail.com>
 */
function DM() {
	// queues for waiting for jQuery
	this.fin	= {};	// name -> true
	this.pen	= {};	// name -> detect
#ifdef DEBUG
	this.wai	= [];	// [[dep],callback,name]
#else
	this.wai	= [];	// [[dep],callback]
#endif

	this.tim=null;
#ifdef DEBUG
	this.count=0;
#endif
};

#ifdef DEBUG
DM.prototype.debug = function() {
		var fini=[];
		for (var k in this.fin) {
			fini.push(k);
		}

		console.log("- finished: " + fini.join(","));

		var pend=[];
		for (var k in this.pen) {
			pend.push(k);
		}

		console.log("- pending: " + pend.join(","));

		for (var i=0;i<this.wai.length;i++) {
			var deps = [];
			for (var j=0;j<this.wai[i][0].length;j++) {
				if (!(this.wai[i][0][j] in this.fin)) {
					deps.push(this.wai[i][0][j]);
				}
			}
			console.log("- waiting with deps: " + deps.join(",") + " name: " + this.wai[i][2]);
		}
}
#endif

/**
 * Enqueue a future callback that will be run once all deps are fullfilled.
 * @param name - debug name for task
 * @param deps - an array of strings containing dependencies needed
 * @param cb - callback to run
 */
DM.prototype.onDone = function(name, deps, cb) {
	var alldeps=true;
	for (var i=0; alldeps && i<deps.length; i++) {
		if (!this.fin[deps[i]]) {
			alldeps=false;
		}
	}
	if (alldeps) {
#ifdef DEBUG
		console.log("immediate " + name);
#endif
		// Perform immediately if all deps are fullfilled
		cb();
	} else {
#ifdef DEBUG
		console.log("delayed " + name);
		this.wai.push( [deps,cb,name]);
#else
		this.wai.push( [deps,cb]);
#endif
		if (!this.timer) this.chk();
	}
};

/**
 * Registers a task by name and a method to detect when it's finished
 * @param name - name of task (that other tasks can depend on)
 * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
 */
DM.prototype.task = function(name, detect) {
	this.pen[name] = detect;
};

/**
 * Mark a task as finished.
 * This might trigger a reschedule.
 * @param name - name of task
 */
DM.prototype.markDone = function(name) {
	// check for finished dependencies
	if (name in this.pen) {
#ifdef DEBUG
		console.log("explicit finish of " + name + " recheck");
#endif
		delete this.pen[name];
		this.fin[name] = true;
		this.chk();
	} else {
		this.fin[name] = true;
	}

};

/**
 * Enqueue a future async load of js that will be run once all deps are fullfilled.
 * @param name - name of task
 * @param deps - an array of strings containing dependencies needed
 * @param url - url of external script to load
 * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
 */
DM.prototype.onDoneJS = function(name, deps, url, detect) {
	if ((detect != null) && detect()) {
#ifdef DEBUG
		console.log("detect found " + name + ", not loading script");
#endif
		this.fin[name] = true;
	} else {

#ifdef DEBUG
		console.log("async. loading " + name);
#endif
		var that=this;
		this.onDone(name, deps, function(){
			that.task(name, null);
			var script = document.createElement('script');
			script.src = url;
			script.type = "text/javascript";
			script.onreadystatechange=function(){if(this.readyState=='complete') that.markDone(name);};
			script.onload=function(){that.markDone(name);};
			document.getElementsByTagName('head')[0].appendChild(script);
		});
	}
};


/**
 * Interal schedule function
 */
DM.prototype.chk = function(){

#ifdef DEBUG
	console.log("-- count is "+ this.count + " --");
	this.count++;
	this.debug();
#endif

	var resched=false;

	// check for finished dependencies
	for (var name in this.pen) {
		if (this.pen[name] != null) {
			var res = this.pen[name]();
	#ifdef DEBUG
			console.log("checking " + name + " res: " + res);
	#endif
			if (res) {
				delete this.pen[name];
				this.fin[name] = true;
			} else {
				resched=true;
			}
		}
	}

	// remove finished dependencies from targets
	// run any callbacks without dependencies
	var newwait = [];
	var wait;
	while (wait = this.wai.pop()) {
		var alldeps = true;

		var deps = wait[0];

		for (var j=0;alldeps && j<deps.length; j++) {
			var dep = deps[j];
			if (!this.fin[dep]) {
				alldeps=false;
			}
		}

		if (alldeps) {
			var cb = wait[1];
#ifdef DEBUG
			var name = wait[2];
			console.log("performing " + name);
#endif
			cb();
		} else {
			newwait.push(wait);
		}
	}
	while (wait = newwait.pop()) {
		this.wai.push(wait);
	}

	// Schedule new run if needed
	if (resched) {
		if (!this.tim) {
#ifdef DEBUG
			console.log("sched started");
#endif
			var that=this;
			this.tim = setInterval( function(){that.chk();}, 15 );
		}
		return;
	}
	if (this.tim) {
		clearInterval(this.tim);
		this.tim=null;
#ifdef DEBUG
		console.log("sched stopped");
#endif
	}
};

