/**
 * @license
 * DMan - Javascript dependency manager.
 * Copyright (C) 2011-2016 Jakob Kemi <jakob.kemi@gmail.com>
 * Code licensed under the BSD License, see COPYING.
 */
/**
 * Internal wait entry
 */
interface DMItem {
    d: string[];
    c: () => boolean;
    n?: string;
}
/**
 * Dependency manager
 */
declare class DM {
    private fin;
    private pen;
    private wai;
    private tim;
    private count;
    constructor();
    debug(): void;
    /**
     * Enqueue a future callback that will be run once all deps are fulfilled.
     * @param name - debug name for task
     * @param deps - an array of strings containing dependencies needed
     * @param cb - callback to run
     */
    onDone(name: string, deps: string[], cb: () => any): void;
    /**
     * Registers a task by name and a method to detect when it's finished
     * @param name - name of task (that other tasks can depend on)
     * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
     */
    task(name: string, detect?: () => boolean): void;
    /**
     * Mark a task as finished.
     * This might trigger a reschedule.
     * @param name - name of task to mark as finished
     */
    markDone(name: string): void;
    /**
     * Enqueue a future async load of js that will be run once all deps are fulfilled.
     * @param name - name of task
     * @param deps - an array of strings containing dependencies needed
     * @param url - url of external script to load
     * @param detect - a callback returning true once the task is finished (may be null if markDone() is used)
     */
    onDoneJS(name: string, deps: string[], url: string, detect: () => boolean): void;
    /**
     * Enqueue a future async load of css that will be started immediately
     * @param name - name of task
     * @param url - url of external script to load
     */
    taskCSS(name: string, url: string): void;
    /**
     * Internal schedule function
     */
    private chk();
}
