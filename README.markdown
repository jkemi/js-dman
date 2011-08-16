DMan - a Javascript dependency manager
======================================

Purpose:
--------
 DMan handles asynchronous dependencies for javascript projects.
 Typical usage might be to create a function (action) that depends on one or more javascript files to
 be loaded into browser and perhaps some additional data to arrive before execution.
 DMan handles this by internally building a small dependency chain that propagates and executes
 the defined actions as soon as dependencies gets fulfilled.
 A dependency is fulfilled either by:

  * explicit marking (via markDone() )
  * script is loaded (via onDoneJS() )
  * polling (automatically if required and poll function is supplied)

Usage:
------
 Include release/dman-min.js in your html, head-section.
 Or catenate into top of your .js-files to reduce network requests.
 For examples see: examples/example.js.


API:
----

 * task(name, detect) - add task that we can add dependencies to.

	- name - name of task
	- detect - callback returning true when task is finished (might get polled if needed)

 * markDone(name) - explicitly mark task as finished

	- name - name of task

 * onDone(name, deps, cb) - perform action cb when deps is fulfilled

	- name - name of action (only used when debugging)
	- deps - a list of tasks that cb depends on
	- cb - function to execute once all dependecies are fulfilled

 * onDoneJS(name, deps, url, detect) - load JS-file when deps is fulfilled

	- name - name of task that others can depend on
	- deps - a list of tasks that script depends on
	- url - url to javascript to load
	- detect - function that can detect if script is already loaded


Compatiblity:
-------------
 Should be compatible with all modern browsers (and probably ie6 as well)

Build instructions:
-------------------

DMan is built in two configurations
 release/dman-min.js minimized release build (1.3 kb, 0.6 kb gzip)
 debug/dman-dbg.js full debug build (use for development)


Build dependencies:

 * cpp (c preprocessor)
 * GNU Make
 * yui-compressor

Build instructions (using GNU make):

 * make -f Makefile
