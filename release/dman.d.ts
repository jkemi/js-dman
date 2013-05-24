/**
* @license
* DMan - Javascript dependency manager.
* Copyright (C) 2011-2013 Jakob Kemi <jakob.kemi@gmail.com>
* Code licensed under the BSD License, see COPYING.
*/
class DM {
    private fin;
    private pen;
    private wai;
    private tim;
    private count;
    constructor();
    public debug(): void;
    /**
    * Enqueue a future callback that will be run once all deps are fullfilled.
    * @param name - debug name for task
    * @param deps - an array of strings containing dependencies needed
    * @param cb - callback to run
    */
    public onDone(name: string, deps: string[], cb: () => any): void;
    /**
    * Registers a task by name and a method to detect when it's finished
    * @param name - name of task (that other tasks can depend on)
    * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
    */
    public task(name: string, detect: () => bool): void;
    /**
    * Mark a task as finished.
    * This might trigger a reschedule.
    * @param name - name of task to mark as finished
    */
    public markDone(name: string): void;
    /**
    * Enqueue a future async load of js that will be run once all deps are fullfilled.
    * @param name - name of task
    * @param deps - an array of strings containing dependencies needed
    * @param url - url of external script to load
    * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
    */
    public onDoneJS(name: string, deps: string[], url: string, detect: () => bool): void;
    public taskCSS(name: string, url: string): void;
    /**
    * Interal schedule function
    */
    private chk();
}
