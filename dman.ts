declare var RELEASE:boolean;

/**
 * @license
 * DMan - Javascript dependency manager.
 * Copyright (C) 2011-2016 Jakob Kemi <jakob.kemi@gmail.com>
 * Code licensed under the BSD License, see COPYING.
 */
class DM {

	private fin:{[id:string] : boolean; };
	private pen:{[id:string] : ()=>boolean; };
	private wai:any[][];
	private tim:number;	// timer object
	private count:number;

	constructor() {
		// queues
		this.fin = {};	// name -> true		finished actions
		this.pen = {};	// name -> detect	ongoing actions
		this.tim = null;


		if (!RELEASE) {
			this.wai = [];	// [[dep],callback,name]
			this.count = 0;
		} else {
			this.wai = [];	// [[dep],callback]
		}
	}


	debug():void {
		if (!RELEASE) {
			var fini = [];
			for (var k in this.fin) {
				fini.push(k);
			}

			console.log("- finished: " + fini.join(","));

			var pend = [];
			for (var k in this.pen) {
				pend.push(k);
			}

			console.log("- pending: " + pend.join(","));

			for (var i = 0; i < this.wai.length; i++) {
				var deps = [];
				for (var j = 0; j < this.wai[i][0].length; j++) {
					if (!(this.wai[i][0][j] in this.fin)) {
						deps.push(this.wai[i][0][j]);
					}
				}
				console.log("- waiting with deps: " + deps.join(",") + " ;name: " + this.wai[i][2]);
			}
		}
	}


	/**
	 * Enqueue a future callback that will be run once all deps are fulfilled.
	 * @param name - debug name for task
	 * @param deps - an array of strings containing dependencies needed
	 * @param cb - callback to run
	 */
	onDone(name:string, deps:string[], cb:()=>any):void {
		var alldeps = true;
		for (var i = 0; alldeps && i < deps.length; i++) {
			if (!this.fin[deps[i]]) {
				alldeps = false;
			}
		}
		if (alldeps) {
			if (!RELEASE) {
				console.log("immediate " + name);
			}
			// Perform immediately if all deps are fullfilled
			cb();
		} else {
			if (!RELEASE) {
				console.log("delayed " + name);
				this.wai.push([deps, cb, name]);
			} else {
				this.wai.push([deps, cb]);
			}
			if (!this.tim) this.chk();
		}
	}

	/**
	 * Registers a task by name and a method to detect when it's finished
	 * @param name - name of task (that other tasks can depend on)
	 * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
	 */
	task(name:string, detect?:()=>boolean):void {
		this.pen[name] = (typeof(detect) === 'undefined') ? null : detect;
	}

	/**
	 * Mark a task as finished.
	 * This might trigger a reschedule.
	 * @param name - name of task to mark as finished
	 */
	markDone(name:string) {
		// check for finished dependencies
		if (name in this.pen) {
			if (!RELEASE) {
				console.log("explicit finish of " + name + " recheck");
			}
			delete this.pen[name];
			this.fin[name] = true;
			this.chk();
		} else {
			this.fin[name] = true;
		}
	}

	/**
	 * Enqueue a future async load of js that will be run once all deps are fulfilled.
	 * @param name - name of task
	 * @param deps - an array of strings containing dependencies needed
	 * @param url - url of external script to load
	 * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
	 */
	onDoneJS(name:string, deps:string[], url:string, detect:()=>boolean):void {

		if (this.fin[name] || (detect != null && detect())) {
			if (!RELEASE) {
				console.log("task finished or detect() found " + name + ", not loading script");
			}
			this.fin[name] = true;
		} else {

			if (!RELEASE) {
				console.log("async. loading js " + name);
			}
			var that = this;
			this.onDone(name, deps, function () {
				if (!(name in that.pen)) {
					if (!RELEASE) {
						console.log("js-load task with name '" + name + "' is not finished or pending, do actual load");
					}
					that.task(name, detect);
					var script:HTMLScriptElement = <HTMLScriptElement>document.createElement('script');
					script.src = url;
					script.type = "text/javascript";
					if (typeof(script['onreadystatechange']) !== 'undefined') {
						script['onreadystatechange'] = function () {
							if (this.readyState == 'complete' || this.readyState == 'loaded') {
// FIXME: rumoured ie mem leak
//							this.onload = this.onreadystatechange = null;
//							document.getElementsByTagName('head')[0].removeChild(this);
								that.markDone(name);
							}
							;
						};
					}
//				script.onload=function() {this.onload=null; that.markDone(name); };
					script.onload = function () {
						that.markDone(name);
					};
					document.getElementsByTagName('head')[0].appendChild(script);
				} else if (!RELEASE) {
					console.log("js-load task with name '" + name + "' is already finished or pending, ignoring");
				}
			});
		}
	}

	/**
	 * Enqueue a future async load of css that will be started immediately
	 * @param name - name of task
	 * @param url - url of external script to load
	 */
// FIXME: needs polling to check when loaded
	taskCSS(name:string, url:string):void {
		if (!RELEASE) {
			console.log("async. loading css " + name);
		}
		var that = this;
		this.onDone(name, [], function () {
			if (!(that.fin[name] || name in that.pen)) {
				that.task(name, null);
				var link = <HTMLLinkElement>document.createElement('link');
				link.href = url;
				link.type = "text/css";
				link.rel = "stylesheet";
				document.getElementsByTagName('head')[0].appendChild(link);
				that.markDone(name);
			} else if (!RELEASE) {
				console.log("css-load task with name '" + name + "' is already finished or pending, ignoring");
			}
		});
	}

	/**
	 * Internal schedule function
	 */
	private chk():void {

		if (!RELEASE) {
			console.log("-- count is " + this.count + " --");
			this.count++;
			this.debug();
		}

		var resched = false;

		// check for finished dependencies
		for (var name in this.pen) {
			if (this.pen[name] != null) {
				var res = this.pen[name]();
				if (!RELEASE) {
					console.log("checking " + name + " res: " + res);
				}
				if (res) {
					delete this.pen[name];
					this.fin[name] = true;
				} else {
					resched = true;
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

			for (var j = 0; alldeps && j < deps.length; j++) {
				var dep = deps[j];
				if (!this.fin[dep]) {
					alldeps = false;
				}
			}

			if (alldeps) {
				var cb = wait[1];
				if (!RELEASE) {
					var name = wait[2];
					console.log("performing " + name);
				}
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
				if (!RELEASE) {
					console.log("sched started");
				}
				var that = this;
				this.tim = setInterval(function () {
					that.chk();
				}, 15);
			}
			return;
		}
		if (this.tim) {
			clearInterval(this.tim);
			this.tim = null;
			if (!RELEASE) {
				console.log("sched stopped");
			}
		}
	}

}