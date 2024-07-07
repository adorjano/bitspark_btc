
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    function construct_svelte_component(component, props) {
        return new component(props);
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier} [start]
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let started = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (started) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            started = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
                // We need to set this to false because callbacks can still happen despite having unsubscribed:
                // Callbacks might already be placed in the queue which doesn't know it should no longer
                // invoke this derived store.
                started = false;
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};
    const HISTORY = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const PARAM = /^:(.+)/;
    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Split up the URI into segments delimited by `/`
     * Strip starting/ending `/`
     * @param {string} uri
     * @return {string[]}
     */
    const segmentize = (uri) => uri.replace(/(^\/+|\/+$)/g, "").split("/");
    /**
     * Strip `str` of potential start and end `/`
     * @param {string} string
     * @return {string}
     */
    const stripSlashes = (string) => string.replace(/(^\/+|\/+$)/g, "");
    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    const rankRoute = (route, index) => {
        const score = route.default
            ? 0
            : segmentize(route.path).reduce((score, segment) => {
                  score += SEGMENT_POINTS;

                  if (segment === "") {
                      score += ROOT_POINTS;
                  } else if (PARAM.test(segment)) {
                      score += DYNAMIC_POINTS;
                  } else if (segment[0] === "*") {
                      score -= SEGMENT_POINTS + SPLAT_PENALTY;
                  } else {
                      score += STATIC_POINTS;
                  }

                  return score;
              }, 0);

        return { route, score, index };
    };
    /**
     * Give a score to all routes and sort them on that
     * If two routes have the exact same score, we go by index instead
     * @param {object[]} routes
     * @return {object[]}
     */
    const rankRoutes = (routes) =>
        routes
            .map(rankRoute)
            .sort((a, b) =>
                a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
            );
    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    const pick = (routes, uri) => {
        let match;
        let default_;

        const [uriPathname] = uri.split("?");
        const uriSegments = segmentize(uriPathname);
        const isRootUri = uriSegments[0] === "";
        const ranked = rankRoutes(routes);

        for (let i = 0, l = ranked.length; i < l; i++) {
            const route = ranked[i].route;
            let missed = false;

            if (route.default) {
                default_ = {
                    route,
                    params: {},
                    uri,
                };
                continue;
            }

            const routeSegments = segmentize(route.path);
            const params = {};
            const max = Math.max(uriSegments.length, routeSegments.length);
            let index = 0;

            for (; index < max; index++) {
                const routeSegment = routeSegments[index];
                const uriSegment = uriSegments[index];

                if (routeSegment && routeSegment[0] === "*") {
                    // Hit a splat, just grab the rest, and return a match
                    // uri:   /files/documents/work
                    // route: /files/* or /files/*splatname
                    const splatName =
                        routeSegment === "*" ? "*" : routeSegment.slice(1);

                    params[splatName] = uriSegments
                        .slice(index)
                        .map(decodeURIComponent)
                        .join("/");
                    break;
                }

                if (typeof uriSegment === "undefined") {
                    // URI is shorter than the route, no match
                    // uri:   /users
                    // route: /users/:userId
                    missed = true;
                    break;
                }

                const dynamicMatch = PARAM.exec(routeSegment);

                if (dynamicMatch && !isRootUri) {
                    const value = decodeURIComponent(uriSegment);
                    params[dynamicMatch[1]] = value;
                } else if (routeSegment !== uriSegment) {
                    // Current segments don't match, not dynamic, not splat, so no match
                    // uri:   /users/123/settings
                    // route: /users/:id/profile
                    missed = true;
                    break;
                }
            }

            if (!missed) {
                match = {
                    route,
                    params,
                    uri: "/" + uriSegments.slice(0, index).join("/"),
                };
                break;
            }
        }

        return match || default_ || null;
    };
    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    const addQuery = (pathname, query) => pathname + (query ? `?${query}` : "");
    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    const resolve = (to, base) => {
        // /foo/bar, /baz/qux => /foo/bar
        if (to.startsWith("/")) return to;

        const [toPathname, toQuery] = to.split("?");
        const [basePathname] = base.split("?");
        const toSegments = segmentize(toPathname);
        const baseSegments = segmentize(basePathname);

        // ?a=b, /users?b=c => /users?a=b
        if (toSegments[0] === "") return addQuery(basePathname, toQuery);

        // profile, /users/789 => /users/789/profile

        if (!toSegments[0].startsWith(".")) {
            const pathname = baseSegments.concat(toSegments).join("/");
            return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
        }

        // ./       , /users/123 => /users/123
        // ../      , /users/123 => /users
        // ../..    , /users/123 => /
        // ../../one, /a/b/c/d   => /a/b/one
        // .././one , /a/b/c/d   => /a/b/c/one
        const allSegments = baseSegments.concat(toSegments);
        const segments = [];

        allSegments.forEach((segment) => {
            if (segment === "..") segments.pop();
            else if (segment !== ".") segments.push(segment);
        });

        return addQuery("/" + segments.join("/"), toQuery);
    };
    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    const combinePaths = (basepath, path) =>
        `${stripSlashes(
        path === "/"
            ? basepath
            : `${stripSlashes(basepath)}/${stripSlashes(path)}`
    )}/`;
    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    const shouldNavigate = (event) =>
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

    const canUseDOM = typeof window !== "undefined" && "document" in window;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     * https://github.com/reach/router/blob/master/LICENSE
     */

    const getLocation = (source) => {
        return {
            ...source.location,
            state: source.history.state,
            key: (source.history.state && source.history.state.key) || "initial",
        };
    };
    const createHistory = (source) => {
        const listeners = [];
        let location = getLocation(source);

        return {
            get location() {
                return location;
            },

            listen(listener) {
                listeners.push(listener);

                const popstateListener = () => {
                    location = getLocation(source);
                    listener({ location, action: "POP" });
                };

                source.addEventListener("popstate", popstateListener);

                return () => {
                    source.removeEventListener("popstate", popstateListener);
                    const index = listeners.indexOf(listener);
                    listeners.splice(index, 1);
                };
            },

            navigate(to, { state, replace = false } = {}) {
                state = { ...state, key: Date.now() + "" };
                // try...catch iOS Safari limits to 100 pushState calls
                try {
                    if (replace) source.history.replaceState(state, "", to);
                    else source.history.pushState(state, "", to);
                } catch (e) {
                    source.location[replace ? "replace" : "assign"](to);
                }
                location = getLocation(source);
                listeners.forEach((listener) =>
                    listener({ location, action: "PUSH" })
                );
                document.activeElement.blur();
            },
        };
    };
    // Stores history entries in memory for testing or other platforms like Native
    const createMemorySource = (initialPathname = "/") => {
        let index = 0;
        const stack = [{ pathname: initialPathname, search: "" }];
        const states = [];

        return {
            get location() {
                return stack[index];
            },
            addEventListener(name, fn) {},
            removeEventListener(name, fn) {},
            history: {
                get entries() {
                    return stack;
                },
                get index() {
                    return index;
                },
                get state() {
                    return states[index];
                },
                pushState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    index++;
                    stack.push({ pathname, search });
                    states.push(state);
                },
                replaceState(state, _, uri) {
                    const [pathname, search = ""] = uri.split("?");
                    stack[index] = { pathname, search };
                    states[index] = state;
                },
            },
        };
    };
    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.59.1 */

    const get_default_slot_changes$2 = dirty => ({
    	route: dirty & /*$activeRoute*/ 2,
    	location: dirty & /*$location*/ 1
    });

    const get_default_slot_context$2 = ctx => ({
    	route: /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].uri,
    	location: /*$location*/ ctx[0]
    });

    function create_fragment$Z(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], get_default_slot_context$2);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $activeRoute, $location*/ 2051)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$Y($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	let { history = globalHistory } = $$props;
    	setContext(HISTORY, history);
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	component_subscribe($$self, routes, value => $$invalidate(9, $routes = value));
    	const activeRoute = writable(null);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : history.location);

    	component_subscribe($$self, location, value => $$invalidate(0, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	component_subscribe($$self, base, value => $$invalidate(10, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (!activeRoute) return base;

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	const registerRoute = route => {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) return;

    			const matchingRoute = pick([route], $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => [...rs, route]);
    		}
    	};

    	const unregisterRoute = route => {
    		routes.update(rs => rs.filter(r => r !== route));
    	};

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = history.listen(event => {
    				location.set(event.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(6, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(7, url = $$props.url);
    		if ('history' in $$props) $$invalidate(8, history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 1024) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => rs.map(r => ({
    					...r,
    					path: combinePaths(basepath, r._path)
    				})));
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 513) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		$location,
    		$activeRoute,
    		routes,
    		activeRoute,
    		location,
    		base,
    		basepath,
    		url,
    		history,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$Y, create_fragment$Z, safe_not_equal, { basepath: 6, url: 7, history: 8 });
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes$1 = dirty => ({ params: dirty & /*routeParams*/ 4 });
    const get_default_slot_context$1 = ctx => ({ params: /*routeParams*/ ctx[2] });

    // (44:0) {#if $activeRoute && $activeRoute.route === route}
    function create_if_block$p(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$8, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (53:4) {:else}
    function create_else_block$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	return {
    		c() {
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams*/ 132)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (45:4) {#if component}
    function create_if_block_1$8(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 12,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*component*/ ctx[0], info);

    	return {
    		c() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*component*/ 1 && promise !== (promise = /*component*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_catch_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    // (46:49)              <svelte:component                 this={resolvedComponent?.default || resolvedComponent}
    function create_then_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*routeParams*/ ctx[2], /*routeProps*/ ctx[3]];
    	var switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*routeParams, routeProps*/ 12)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*component*/ 1 && switch_value !== (switch_value = /*resolvedComponent*/ ctx[12]?.default || /*resolvedComponent*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    // (1:0) <script>     import { getContext, onDestroy }
    function create_pending_block(ctx) {
    	return {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    function create_fragment$Y(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5] && create_if_block$p(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$p(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$X($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	let routeParams = {};
    	let routeProps = {};
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	registerRoute(route);

    	onDestroy(() => {
    		unregisterRoute(route);
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(6, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		{
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}

    			const { component: c, path, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    			canUseDOM && window?.scrollTo(0, 0);

    			if (c) {
    				if (c.toString().startsWith("class ")) $$invalidate(0, component = c); else $$invalidate(0, component = c());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		activeRoute,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$X, create_fragment$Y, safe_not_equal, { path: 6, component: 0 });
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.59.1 */
    const get_default_slot_changes = dirty => ({ active: dirty & /*ariaCurrent*/ 4 });
    const get_default_slot_context = ctx => ({ active: !!/*ariaCurrent*/ ctx[2] });

    function create_fragment$X(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], get_default_slot_context);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(a, "click", /*onClick*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, ariaCurrent*/ 32772)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$W($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const location = getContext(LOCATION);
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const { base } = getContext(ROUTER);
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const { navigate } = getContext(HISTORY);
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	const onClick = event => {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	};

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = $location.pathname.startsWith(href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		$$invalidate(1, props = getProps({
    			location: $location,
    			href,
    			isPartiallyCurrent,
    			isCurrent,
    			existingProps: $$restProps
    		}));
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		location,
    		base,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$W, create_fragment$X, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var node = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.is_node = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================
    var is_node_ = null;
    /**
     * Test whether the code is running on NodeJS.
     *
     * @return Whether NodeJS or not.
     */
    function is_node() {
        if (is_node_ === null)
            is_node_ =
                typeof commonjsGlobal === "object" &&
                    typeof commonjsGlobal.process === "object" &&
                    typeof commonjsGlobal.process.versions === "object" &&
                    typeof commonjsGlobal.process.versions.node !== "undefined";
        return is_node_;
    }
    exports.is_node = is_node;
    //# sourceMappingURL=node.js.map
    });

    var naiveFallback = function () {
    	if (typeof self === "object" && self) return self;
    	if (typeof window === "object" && window) return window;
    	throw new Error("Unable to resolve global `this`");
    };

    var global$2 = (function () {
    	if (this) return this;

    	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    	// Fallback to standard globalThis if available
    	if (typeof globalThis === "object" && globalThis) return globalThis;

    	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    	// In all ES5+ engines global object inherits from Object.prototype
    	// (if you approached one that doesn't please report)
    	try {
    		Object.defineProperty(Object.prototype, "__global__", {
    			get: function () { return this; },
    			configurable: true
    		});
    	} catch (error) {
    		// Unfortunate case of updates to Object.prototype being restricted
    		// via preventExtensions, seal or freeze
    		return naiveFallback();
    	}
    	try {
    		// Safari case (window.__global__ works, but __global__ does not)
    		if (!__global__) return naiveFallback();
    		return __global__;
    	} finally {
    		delete Object.prototype.__global__;
    	}
    })();

    var name = "websocket";
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
    var contributors = [
    	"Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
    ];
    var version$1 = "1.0.34";
    var repository = {
    	type: "git",
    	url: "https://github.com/theturtle32/WebSocket-Node.git"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var engines = {
    	node: ">=4.0.0"
    };
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	"jshint-stylish": "^2.2.1",
    	jshint: "^2.0.0",
    	tape: "^4.9.1"
    };
    var config = {
    	verbose: false
    };
    var scripts = {
    	test: "tape test/unit/*.js",
    	gulp: "gulp"
    };
    var main = "index";
    var directories = {
    	lib: "./lib"
    };
    var browser$1 = "lib/browser.js";
    var license = "Apache-2.0";
    var require$$0 = {
    	name: name,
    	description: description,
    	keywords: keywords,
    	author: author,
    	contributors: contributors,
    	version: version$1,
    	repository: repository,
    	homepage: homepage,
    	engines: engines,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	config: config,
    	scripts: scripts,
    	main: main,
    	directories: directories,
    	browser: browser$1,
    	license: license
    };

    var version = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = global$2;
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : version
    };

    var ForOfAdaptor_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ForOfAdaptor = void 0;
    /**
     * Adaptor for `for ... of` iteration.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ForOfAdaptor = /** @class */ (function () {
        /**
         * Initializer Constructor.
         *
         * @param first Input iteartor of the first position.
         * @param last Input iterator of the last position.
         */
        function ForOfAdaptor(first, last) {
            this.it_ = first;
            this.last_ = last;
        }
        /**
         * @inheritDoc
         */
        ForOfAdaptor.prototype.next = function () {
            if (this.it_.equals(this.last_))
                return {
                    done: true,
                    value: undefined,
                };
            else {
                var it = this.it_;
                this.it_ = this.it_.next();
                return {
                    done: false,
                    value: it.value,
                };
            }
        };
        /**
         * @inheritDoc
         */
        ForOfAdaptor.prototype[Symbol.iterator] = function () {
            return this;
        };
        return ForOfAdaptor;
    }());
    exports.ForOfAdaptor = ForOfAdaptor;
    //# sourceMappingURL=ForOfAdaptor.js.map
    });

    var Container_1 = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Container = void 0;

    /**
     * Basic container.
     *
     * @template T Stored elements' type
     * @template SourceT Derived type extending this {@link Container}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     * @template PElem Parent type of *T*, used for inserting elements through {@link assign} and {@link insert}.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Container = /** @class */ (function () {
        function Container() {
        }
        /**
         * @inheritDoc
         */
        Container.prototype.empty = function () {
            return this.size() === 0;
        };
        /**
         * @inheritDoc
         */
        Container.prototype.rbegin = function () {
            return this.end().reverse();
        };
        /**
         * @inheritDoc
         */
        Container.prototype.rend = function () {
            return this.begin().reverse();
        };
        /**
         * @inheritDoc
         */
        Container.prototype[Symbol.iterator] = function () {
            return new ForOfAdaptor_1.ForOfAdaptor(this.begin(), this.end());
        };
        /**
         * @inheritDoc
         */
        Container.prototype.toJSON = function () {
            var e_1, _a;
            var ret = [];
            try {
                for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var elem = _c.value;
                    ret.push(elem);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return ret;
        };
        return Container;
    }());
    exports.Container = Container;
    //# sourceMappingURL=Container.js.map
    });

    var NativeArrayIterator_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeArrayIterator = void 0;
    var NativeArrayIterator = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function NativeArrayIterator(data, index) {
            this.data_ = data;
            this.index_ = index;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.index = function () {
            return this.index_;
        };
        Object.defineProperty(NativeArrayIterator.prototype, "value", {
            get: function () {
                return this.data_[this.index_];
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.prev = function () {
            --this.index_;
            return this;
        };
        NativeArrayIterator.prototype.next = function () {
            ++this.index_;
            return this;
        };
        NativeArrayIterator.prototype.advance = function (n) {
            this.index_ += n;
            return this;
        };
        /* ---------------------------------------------------------
            COMPARES
        --------------------------------------------------------- */
        NativeArrayIterator.prototype.equals = function (obj) {
            return this.data_ === obj.data_ && this.index_ === obj.index_;
        };
        NativeArrayIterator.prototype.swap = function (obj) {
            var _a, _b;
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            _b = __read([obj.index_, this.index_], 2), this.index_ = _b[0], obj.index_ = _b[1];
        };
        return NativeArrayIterator;
    }());
    exports.NativeArrayIterator = NativeArrayIterator;
    //# sourceMappingURL=NativeArrayIterator.js.map
    });

    var SetContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetContainer = void 0;


    /**
     * Basic set container.
     *
     * @template Key Key type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Derived type extending this {@link SetContainer}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetContainer = /** @class */ (function (_super) {
        __extends(SetContainer, _super);
        /* ---------------------------------------------------------
            CONSTURCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function SetContainer(factory) {
            var _this = _super.call(this) || this;
            _this.data_ = factory(_this);
            return _this;
        }
        /**
         * @inheritDoc
         */
        SetContainer.prototype.assign = function (first, last) {
            // INSERT
            this.clear();
            this.insert(first, last);
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.clear = function () {
            // TO BE ABSTRACT
            this.data_.clear();
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.begin = function () {
            return this.data_.begin();
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.end = function () {
            return this.data_.end();
        };
        /* ---------------------------------------------------------
            ELEMENTS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        SetContainer.prototype.has = function (key) {
            return !this.find(key).equals(this.end());
        };
        /**
         * @inheritDoc
         */
        SetContainer.prototype.size = function () {
            return this.data_.size();
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - ERASE
                - UTILITY
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        SetContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            if (items.length === 0)
                return this.size();
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this._Insert_by_range(first, last);
            // RETURN SIZE
            return this.size();
        };
        SetContainer.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1)
                return this._Insert_by_key(args[0]);
            else if (args[0].next instanceof Function &&
                args[1].next instanceof Function)
                return this._Insert_by_range(args[0], args[1]);
            else
                return this._Insert_by_hint(args[0], args[1]);
        };
        SetContainer.prototype.erase = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1 &&
                !(args[0] instanceof this.end().constructor &&
                    args[0].source() === this))
                return this._Erase_by_val(args[0]);
            else if (args.length === 1)
                return this._Erase_by_range(args[0]);
            else
                return this._Erase_by_range(args[0], args[1]);
        };
        SetContainer.prototype._Erase_by_range = function (first, last) {
            if (last === void 0) { last = first.next(); }
            // ERASE
            var it = this.data_.erase(first, last);
            // POST-PROCESS
            this._Handle_erase(first, last);
            return it;
        };
        return SetContainer;
    }(Container_1.Container));
    exports.SetContainer = SetContainer;
    //# sourceMappingURL=SetContainer.js.map
    });

    var Exception_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Exception = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================
    /**
     * Base Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Exception = /** @class */ (function (_super) {
        __extends(Exception, _super);
        /* ---------------------------------------------------------
            CONSTRUCTOR
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function Exception(message) {
            var _newTarget = this.constructor;
            var _this = _super.call(this, message) || this;
            // INHERITANCE POLYFILL
            var proto = _newTarget.prototype;
            if (Object.setPrototypeOf)
                Object.setPrototypeOf(_this, proto);
            else
                _this.__proto__ = proto;
            return _this;
        }
        Object.defineProperty(Exception.prototype, "name", {
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * The error name.
             */
            get: function () {
                return this.constructor.name;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Get error message.
         *
         * @return The error message.
         */
        Exception.prototype.what = function () {
            return this.message;
        };
        /**
         * Native function for `JSON.stringify()`.
         *
         * The {@link Exception.toJSON} function returns only three properties; ({@link name}, {@link message} and {@link stack}). If you want to define a new sub-class extending the {@link Exception} and const the class to export additional props (or remove some props), override this {@link Exception.toJSON} method.
         *
         * @return An object for `JSON.stringify()`.
         */
        Exception.prototype.toJSON = function () {
            return {
                name: this.name,
                message: this.message,
                stack: this.stack,
            };
        };
        return Exception;
    }(Error));
    exports.Exception = Exception;
    //# sourceMappingURL=Exception.js.map
    });

    var LogicError_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogicError = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Logic Error.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var LogicError = /** @class */ (function (_super) {
        __extends(LogicError, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function LogicError(message) {
            return _super.call(this, message) || this;
        }
        return LogicError;
    }(Exception_1.Exception));
    exports.LogicError = LogicError;
    //# sourceMappingURL=LogicError.js.map
    });

    var InvalidArgument_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InvalidArgument = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Invalid Argument Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var InvalidArgument = /** @class */ (function (_super) {
        __extends(InvalidArgument, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function InvalidArgument(message) {
            return _super.call(this, message) || this;
        }
        return InvalidArgument;
    }(LogicError_1.LogicError));
    exports.InvalidArgument = InvalidArgument;
    //# sourceMappingURL=InvalidArgument.js.map
    });

    var OutOfRange_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutOfRange = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Out-of-range Exception.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var OutOfRange = /** @class */ (function (_super) {
        __extends(OutOfRange, _super);
        /**
         * Initializer Constructor.
         *
         * @param message The error messgae.
         */
        function OutOfRange(message) {
            return _super.call(this, message) || this;
        }
        return OutOfRange;
    }(LogicError_1.LogicError));
    exports.OutOfRange = OutOfRange;
    //# sourceMappingURL=OutOfRange.js.map
    });

    var ErrorGenerator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ErrorGenerator = void 0;
    (function (ErrorGenerator) {
        /* ---------------------------------------------------------
            COMMON
        --------------------------------------------------------- */
        function get_class_name(instance) {
            if (typeof instance === "string")
                return instance;
            var ret = instance.constructor.name;
            if (instance.constructor.__MODULE)
                ret = "".concat(instance.constructor.__MODULE, ".").concat(ret);
            return "std.".concat(ret);
        }
        ErrorGenerator.get_class_name = get_class_name;
        /* ---------------------------------------------------------
            CONTAINERS
        --------------------------------------------------------- */
        function empty(instance, method) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): it's empty container."));
        }
        ErrorGenerator.empty = empty;
        function negative_index(instance, method, index) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric index is negative -> (index = ").concat(index, ")."));
        }
        ErrorGenerator.negative_index = negative_index;
        function excessive_index(instance, method, index, size) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric index is equal or greater than size -> (index = ").concat(index, ", size: ").concat(size, ")."));
        }
        ErrorGenerator.excessive_index = excessive_index;
        function not_my_iterator(instance, method) {
            return new InvalidArgument_1.InvalidArgument("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator is not this container's own."));
        }
        ErrorGenerator.not_my_iterator = not_my_iterator;
        function erased_iterator(instance, method) {
            return new InvalidArgument_1.InvalidArgument("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator, it already has been erased."));
        }
        ErrorGenerator.erased_iterator = erased_iterator;
        function negative_iterator(instance, method, index) {
            return new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): parametric iterator is directing negative position -> (index = ").concat(index, ")."));
        }
        ErrorGenerator.negative_iterator = negative_iterator;
        function iterator_end_value(instance, method) {
            if (method === void 0) { method = "end"; }
            var className = get_class_name(instance);
            return new OutOfRange_1.OutOfRange("Error on ".concat(className, ".Iterator.value: cannot access to the ").concat(className, ".").concat(method, "().value."));
        }
        ErrorGenerator.iterator_end_value = iterator_end_value;
        function key_nout_found(instance, method, key) {
            throw new OutOfRange_1.OutOfRange("Error on ".concat(get_class_name(instance), ".").concat(method, "(): unable to find the matched key -> ").concat(key));
        }
        ErrorGenerator.key_nout_found = key_nout_found;
    })(exports.ErrorGenerator || (exports.ErrorGenerator = {}));
    //# sourceMappingURL=ErrorGenerator.js.map
    });

    var UniqueSet_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniqueSet = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.base
     */
    //================================================================


    /**
     * Basic set container blocking duplicated key.
     *
     * @template Key Key type
     * @template Source Derived type extending this {@link UniqueSet}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var UniqueSet = /** @class */ (function (_super) {
        __extends(UniqueSet, _super);
        function UniqueSet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /* ---------------------------------------------------------
            ACCESSOR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueSet.prototype.count = function (key) {
            return this.find(key).equals(this.end()) ? 0 : 1;
        };
        UniqueSet.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _super.prototype.insert.apply(this, __spreadArray([], __read(args), false));
        };
        UniqueSet.prototype._Insert_by_range = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this._Insert_by_key(first.value);
        };
        UniqueSet.prototype.extract = function (param) {
            if (param instanceof this.end().constructor)
                return this._Extract_by_iterator(param);
            else
                return this._Extract_by_val(param);
        };
        UniqueSet.prototype._Extract_by_val = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "extract", key);
            this._Erase_by_range(it);
            return key;
        };
        UniqueSet.prototype._Extract_by_iterator = function (it) {
            if (it.equals(this.end()) === true || this.has(it.value) === false)
                return this.end();
            this._Erase_by_range(it);
            return it;
        };
        UniqueSet.prototype._Erase_by_val = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                return 0;
            this._Erase_by_range(it);
            return 1;
        };
        /* ---------------------------------------------------------
            UTILITY
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueSet.prototype.merge = function (source) {
            for (var it = source.begin(); !it.equals(source.end());) {
                if (this.has(it.value) === false) {
                    this.insert(it.value);
                    it = source.erase(it);
                }
                else
                    it = it.next();
            }
        };
        return UniqueSet;
    }(SetContainer_1.SetContainer));
    exports.UniqueSet = UniqueSet;
    //# sourceMappingURL=UniqueSet.js.map
    });

    var IAssociativeContainer_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IAssociativeContainer = void 0;
    (function (IAssociativeContainer) {
        /**
         * @internal
         */
        function construct(source) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var ramda;
            var tail;
            if (args.length >= 1 && args[0] instanceof Array) {
                // INITIALIZER LIST CONSTRUCTOR
                ramda = function () {
                    var items = args[0];
                    source.push.apply(source, __spreadArray([], __read(items), false));
                };
                tail = args.slice(1);
            }
            else if (args.length >= 2 &&
                args[0].next instanceof Function &&
                args[1].next instanceof Function) {
                // RANGE CONSTRUCTOR
                ramda = function () {
                    var first = args[0];
                    var last = args[1];
                    source.assign(first, last);
                };
                tail = args.slice(2);
            }
            else {
                // DEFAULT CONSTRUCTOR
                ramda = null;
                tail = args;
            }
            return { ramda: ramda, tail: tail };
        }
        IAssociativeContainer.construct = construct;
    })(exports.IAssociativeContainer || (exports.IAssociativeContainer = {}));
    //# sourceMappingURL=IAssociativeContainer.js.map
    });

    var Global = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._Get_root = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * @internal
     */
    function _Get_root() {
        if (__s_pRoot === null) {
            __s_pRoot = ((0, node.is_node)() ? commonjsGlobal : self);
            if (__s_pRoot.__s_iUID === undefined)
                __s_pRoot.__s_iUID = 0;
        }
        return __s_pRoot;
    }
    exports._Get_root = _Get_root;
    /**
     * @internal
     */
    var __s_pRoot = null;
    //# sourceMappingURL=Global.js.map
    });

    var uid = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.get_uid = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================

    /**
     * Get unique identifier.
     *
     * @param obj Target object.
     * @return The identifier number.
     */
    function get_uid(obj) {
        // NO UID EXISTS, THEN ISSUE ONE.
        if (obj instanceof Object) {
            if (obj.hasOwnProperty("__get_m_iUID") === false) {
                var uid_1 = ++(0, Global._Get_root)().__s_iUID;
                Object.defineProperty(obj, "__get_m_iUID", {
                    value: function () {
                        return uid_1;
                    },
                });
            }
            // RETURNS
            return obj.__get_m_iUID();
        }
        else if (obj === undefined)
            return -1;
        // is null
        else
            return 0;
    }
    exports.get_uid = get_uid;
    //# sourceMappingURL=uid.js.map
    });

    var hash_1 = createCommonjsModule(function (module, exports) {
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hash = void 0;

    /**
     * Hash function.
     *
     * @param itemList The items to be hashed.
     * @return The hash code.
     */
    function hash() {
        var e_1, _a;
        var itemList = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            itemList[_i] = arguments[_i];
        }
        var ret = INIT_VALUE;
        try {
            for (var itemList_1 = __values(itemList), itemList_1_1 = itemList_1.next(); !itemList_1_1.done; itemList_1_1 = itemList_1.next()) {
                var item = itemList_1_1.value;
                item = item ? item.valueOf() : item;
                var type = typeof item;
                if (type === "boolean")
                    // BOOLEAN -> 1 BYTE
                    ret = _Hash_boolean(item, ret);
                else if (type === "number" || type === "bigint")
                    // NUMBER -> 8 BYTES
                    ret = _Hash_number(item, ret);
                else if (type === "string")
                    // STRING -> {LENGTH} BYTES
                    ret = _Hash_string(item, ret);
                else if (item instanceof Object &&
                    item.hashCode instanceof Function) {
                    var hashed = item.hashCode();
                    if (itemList.length === 1)
                        return hashed;
                    else {
                        ret = ret ^ hashed;
                        ret *= MULTIPLIER;
                    }
                } // object | null | undefined
                else
                    ret = _Hash_number((0, uid.get_uid)(item), ret);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (itemList_1_1 && !itemList_1_1.done && (_a = itemList_1.return)) _a.call(itemList_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Math.abs(ret);
    }
    exports.hash = hash;
    function _Hash_boolean(val, ret) {
        ret ^= val ? 1 : 0;
        ret *= MULTIPLIER;
        return ret;
    }
    function _Hash_number(val, ret) {
        return _Hash_string(val.toString(), ret);
        // // ------------------------------------------
        // //    IN C++
        // //        CONSIDER A NUMBER AS A STRING
        // //        HASH<STRING>((CHAR*)&VAL, 8)
        // // ------------------------------------------
        // // CONSTRUCT BUFFER AND BYTE_ARRAY
        // const buffer: ArrayBuffer = new ArrayBuffer(8);
        // const byteArray: Int8Array = new Int8Array(buffer);
        // const valueArray: Float64Array = new Float64Array(buffer);
        // valueArray[0] = val;
        // for (let i: number = 0; i < byteArray.length; ++i)
        // {
        //     const byte = (byteArray[i] < 0) ? byteArray[i] + 256 : byteArray[i];
        //     ret ^= byte;
        //     ret *= _HASH_MULTIPLIER;
        // }
        // return Math.abs(ret);
    }
    function _Hash_string(str, ret) {
        for (var i = 0; i < str.length; ++i) {
            ret ^= str.charCodeAt(i);
            ret *= MULTIPLIER;
        }
        return Math.abs(ret);
    }
    /* ---------------------------------------------------------
        RESERVED ITEMS
    --------------------------------------------------------- */
    var INIT_VALUE = 2166136261;
    var MULTIPLIER = 16777619;
    //# sourceMappingURL=hash.js.map
    });

    var comparators = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.greater_equal = exports.greater = exports.less_equal = exports.less = exports.not_equal_to = exports.equal_to = void 0;

    /**
     * Test whether two arguments are equal.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether two arguments are equal or not.
     */
    function equal_to(x, y) {
        // CONVERT TO PRIMITIVE TYPE
        x = x ? x.valueOf() : x;
        y = y ? y.valueOf() : y;
        // DO COMPARE
        if (x instanceof Object &&
            x.equals instanceof Function)
            return x.equals(y);
        else
            return x === y;
    }
    exports.equal_to = equal_to;
    /**
     * Test whether two arguments are not equal.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Returns `true`, if two arguments are not equal, otherwise `false`.
     */
    function not_equal_to(x, y) {
        return !equal_to(x, y);
    }
    exports.not_equal_to = not_equal_to;
    /**
     * Test whether *x* is less than *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is less than *y*.
     */
    function less(x, y) {
        // CONVERT TO PRIMITIVE TYPE
        x = x.valueOf();
        y = y.valueOf();
        // DO COMPARE
        if (x instanceof Object)
            if (x.less instanceof Function)
                // has less()
                return x.less(y);
            else
                return (0, uid.get_uid)(x) < (0, uid.get_uid)(y);
        else
            return x < y;
    }
    exports.less = less;
    /**
     * Test whether *x* is less than or equal to *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is less than or equal to *y*.
     */
    function less_equal(x, y) {
        return less(x, y) || equal_to(x, y);
    }
    exports.less_equal = less_equal;
    /**
     * Test whether *x* is greater than *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is greater than *y*.
     */
    function greater(x, y) {
        return !less_equal(x, y);
    }
    exports.greater = greater;
    /**
     * Test whether *x* is greater than or equal to *y*.
     *
     * @param x The first argument to compare.
     * @param y The second argument to compare.
     * @return Whether *x* is greater than or equal to *y*.
     */
    function greater_equal(x, y) {
        return !less(x, y);
    }
    exports.greater_equal = greater_equal;
    //# sourceMappingURL=comparators.js.map
    });

    var IHashContainer_1 = createCommonjsModule(function (module, exports) {
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IHashContainer = void 0;
    (function (IHashContainer) {
        /**
         * @internal
         */
        function construct(source, Source, bucketFactory) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            // DECLARE MEMBERS
            var post_process = null;
            var hash_function = hash_1.hash;
            var key_eq = comparators.equal_to;
            //----
            // INITIALIZE MEMBERS AND POST-PROCESS
            //----
            // BRANCH - METHOD OVERLOADINGS
            if (args.length === 1 && args[0] instanceof Source) {
                // PARAMETERS
                var container_1 = args[0];
                hash_function = container_1.hash_function();
                key_eq = container_1.key_eq();
                // COPY CONSTRUCTOR
                post_process = function () {
                    var first = container_1.begin();
                    var last = container_1.end();
                    source.assign(first, last);
                };
            }
            else {
                var tuple = IAssociativeContainer_1.IAssociativeContainer.construct.apply(IAssociativeContainer_1.IAssociativeContainer, __spreadArray([source], __read(args), false));
                post_process = tuple.ramda;
                if (tuple.tail.length >= 1)
                    hash_function = tuple.tail[0];
                if (tuple.tail.length >= 2)
                    key_eq = tuple.tail[1];
            }
            //----
            // DO PROCESS
            //----
            // CONSTRUCT BUCKET
            bucketFactory(hash_function, key_eq);
            // ACT POST-PROCESS
            if (post_process !== null)
                post_process();
        }
        IHashContainer.construct = construct;
    })(exports.IHashContainer || (exports.IHashContainer = {}));
    //# sourceMappingURL=IHashContainer.js.map
    });

    var ListIterator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListIterator = void 0;

    /**
     * Basic List Iterator.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ListIterator = /** @class */ (function () {
        /* ---------------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------------- */
        function ListIterator(prev, next, value) {
            this.prev_ = prev;
            this.next_ = next;
            this.value_ = value;
        }
        /**
         * @internal
         */
        ListIterator._Set_prev = function (it, prev) {
            it.prev_ = prev;
        };
        /**
         * @internal
         */
        ListIterator._Set_next = function (it, next) {
            it.next_ = next;
        };
        /**
         * @inheritDoc
         */
        ListIterator.prototype.prev = function () {
            return this.prev_;
        };
        /**
         * @inheritDoc
         */
        ListIterator.prototype.next = function () {
            return this.next_;
        };
        Object.defineProperty(ListIterator.prototype, "value", {
            /**
             * @inheritDoc
             */
            get: function () {
                this._Try_value();
                return this.value_;
            },
            enumerable: false,
            configurable: true
        });
        ListIterator.prototype._Try_value = function () {
            if (this.value_ === undefined &&
                this.equals(this.source().end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.iterator_end_value(this.source());
        };
        /* ---------------------------------------------------------------
            COMPARISON
        --------------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListIterator.prototype.equals = function (obj) {
            return this === obj;
        };
        return ListIterator;
    }());
    exports.ListIterator = ListIterator;
    //# sourceMappingURL=ListIterator.js.map
    });

    var Repeater_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Repeater = void 0;
    var Repeater = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function Repeater(index, value) {
            this.index_ = index;
            this.value_ = value;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        Repeater.prototype.index = function () {
            return this.index_;
        };
        Object.defineProperty(Repeater.prototype, "value", {
            get: function () {
                return this.value_;
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS & COMPARE
        --------------------------------------------------------- */
        Repeater.prototype.next = function () {
            ++this.index_;
            return this;
        };
        Repeater.prototype.equals = function (obj) {
            return this.index_ === obj.index_;
        };
        return Repeater;
    }());
    exports.Repeater = Repeater;
    //# sourceMappingURL=Repeater.js.map
    });

    var global$1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.next = exports.prev = exports.advance = exports.distance = exports.size = exports.empty = void 0;

    /* =========================================================
        GLOBAL FUNCTIONS
            - ACCESSORS
            - MOVERS
            - FACTORIES
    ============================================================
        ACCESSORS
    --------------------------------------------------------- */
    /**
     * Test whether a container is empty.
     *
     * @param source Target container.
     * @return Whether empty or not.
     */
    function empty(source) {
        if (source instanceof Array)
            return source.length !== 0;
        else
            return source.empty();
    }
    exports.empty = empty;
    /**
     * Get number of elements of a container.
     *
     * @param source Target container.
     * @return The number of elements in the container.
     */
    function size(source) {
        if (source instanceof Array)
            return source.length;
        else
            return source.size();
    }
    exports.size = size;
    function distance(first, last) {
        if (first.index instanceof Function)
            return _Distance_via_index(first, last);
        var ret = 0;
        for (; !first.equals(last); first = first.next())
            ++ret;
        return ret;
    }
    exports.distance = distance;
    function _Distance_via_index(first, last) {
        var x = first.index();
        var y = last.index();
        if (first.base instanceof Function)
            return x - y;
        else
            return y - x;
    }
    function advance(it, n) {
        if (n === 0)
            return it;
        else if (it.advance instanceof Function)
            return it.advance(n);
        var stepper;
        if (n < 0) {
            if (!(it.prev instanceof Function))
                throw new InvalidArgument_1.InvalidArgument("Error on std.advance(): parametric iterator is not a bi-directional iterator, thus advancing to negative direction is not possible.");
            stepper = function (it) { return it.prev(); };
            n = -n;
        }
        else
            stepper = function (it) { return it.next(); };
        while (n-- > 0)
            it = stepper(it);
        return it;
    }
    exports.advance = advance;
    /**
     * Get previous iterator.
     *
     * @param it Iterator to move.
     * @param n Step to move prev.
     * @return An iterator moved to prev *n* steps.
     */
    function prev(it, n) {
        if (n === void 0) { n = 1; }
        if (n === 1)
            return it.prev();
        else
            return advance(it, -n);
    }
    exports.prev = prev;
    /**
     * Get next iterator.
     *
     * @param it Iterator to move.
     * @param n Step to move next.
     * @return Iterator moved to next *n* steps.
     */
    function next(it, n) {
        if (n === void 0) { n = 1; }
        if (n === 1)
            return it.next();
        else
            return advance(it, n);
    }
    exports.next = next;
    //# sourceMappingURL=global.js.map
    });

    var ListContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListContainer = void 0;






    /**
     * Basic List Container.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ListContainer = /** @class */ (function (_super) {
        __extends(ListContainer, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function ListContainer() {
            var _this = _super.call(this) || this;
            // INIT MEMBERS
            _this.end_ = _this._Create_iterator(null, null);
            _this.clear();
            return _this;
        }
        ListContainer.prototype.assign = function (par1, par2) {
            this.clear();
            this.insert(this.end(), par1, par2);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.clear = function () {
            // DISCONNECT NODES
            ListIterator_1.ListIterator._Set_prev(this.end_, this.end_);
            ListIterator_1.ListIterator._Set_next(this.end_, this.end_);
            // RE-SIZE -> 0
            this.begin_ = this.end_;
            this.size_ = 0;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.resize = function (n) {
            var expansion = n - this.size();
            if (expansion > 0)
                this.insert(this.end(), expansion, undefined);
            else if (expansion < 0)
                this.erase((0, global$1.advance)(this.end(), -expansion), this.end());
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.begin = function () {
            return this.begin_;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.end = function () {
            return this.end_;
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.size = function () {
            return this.size_;
        };
        /* =========================================================
            ELEMENTS I/O
                - PUSH & POP
                - INSERT
                - ERASE
                - POST-PROCESS
        ============================================================
            PUSH & POP
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push_front = function (val) {
            this.insert(this.begin_, val);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push_back = function (val) {
            this.insert(this.end_, val);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.pop_front = function () {
            if (this.empty() === true)
                throw ErrorGenerator_1.ErrorGenerator.empty(this.end_.source().constructor.name, "pop_front");
            this.erase(this.begin_);
        };
        /**
         * @inheritDoc
         */
        ListContainer.prototype.pop_back = function () {
            if (this.empty() === true)
                throw ErrorGenerator_1.ErrorGenerator.empty(this.end_.source().constructor.name, "pop_back");
            this.erase(this.end_.prev());
        };
        /* ---------------------------------------------------------
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            if (items.length === 0)
                return this.size();
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this._Insert_by_range(this.end(), first, last);
            // RETURN SIZE
            return this.size();
        };
        ListContainer.prototype.insert = function (pos) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            // VALIDATION
            if (pos.source() !== this.end_.source())
                throw ErrorGenerator_1.ErrorGenerator.not_my_iterator(this.end_.source(), "insert");
            else if (pos.erased_ === true)
                throw ErrorGenerator_1.ErrorGenerator.erased_iterator(this.end_.source(), "insert");
            // BRANCHES
            if (args.length === 1)
                return this._Insert_by_repeating_val(pos, 1, args[0]);
            else if (args.length === 2 && typeof args[0] === "number")
                return this._Insert_by_repeating_val(pos, args[0], args[1]);
            else
                return this._Insert_by_range(pos, args[0], args[1]);
        };
        ListContainer.prototype._Insert_by_repeating_val = function (position, n, val) {
            var first = new Repeater_1.Repeater(0, val);
            var last = new Repeater_1.Repeater(n);
            return this._Insert_by_range(position, first, last);
        };
        ListContainer.prototype._Insert_by_range = function (position, begin, end) {
            var prev = position.prev();
            var first = null;
            var size = 0;
            for (var it = begin; it.equals(end) === false; it = it.next()) {
                // CONSTRUCT ITEM, THE NEW ELEMENT
                var item = this._Create_iterator(prev, null, it.value);
                if (size === 0)
                    first = item;
                // PLACE ITEM ON THE NEXT OF "PREV"
                ListIterator_1.ListIterator._Set_next(prev, item);
                // SHIFT CURRENT ITEM TO PREVIOUS
                prev = item;
                ++size;
            }
            // WILL FIRST BE THE BEGIN?
            if (position.equals(this.begin()) === true)
                this.begin_ = first;
            // CONNECT BETWEEN LAST AND POSITION
            ListIterator_1.ListIterator._Set_next(prev, position);
            ListIterator_1.ListIterator._Set_prev(position, prev);
            this.size_ += size;
            return first;
        };
        ListContainer.prototype.erase = function (first, last) {
            if (last === void 0) { last = first.next(); }
            return this._Erase_by_range(first, last);
        };
        ListContainer.prototype._Erase_by_range = function (first, last) {
            // VALIDATION
            if (first.source() !== this.end_.source())
                throw ErrorGenerator_1.ErrorGenerator.not_my_iterator(this.end_.source(), "insert");
            else if (first.erased_ === true)
                throw ErrorGenerator_1.ErrorGenerator.erased_iterator(this.end_.source(), "insert");
            else if (first.equals(this.end_))
                return this.end_;
            // FIND PREV AND NEXT
            var prev = first.prev();
            // SHRINK
            ListIterator_1.ListIterator._Set_next(prev, last);
            ListIterator_1.ListIterator._Set_prev(last, prev);
            for (var it = first; !it.equals(last); it = it.next()) {
                it.erased_ = true;
                --this.size_;
            }
            if (first.equals(this.begin_))
                this.begin_ = last;
            return last;
        };
        /* ---------------------------------------------------------
            SWAP
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ListContainer.prototype.swap = function (obj) {
            var _a, _b, _c;
            _a = __read([obj.begin_, this.begin_], 2), this.begin_ = _a[0], obj.begin_ = _a[1];
            _b = __read([obj.end_, this.end_], 2), this.end_ = _b[0], obj.end_ = _b[1];
            _c = __read([obj.size_, this.size_], 2), this.size_ = _c[0], obj.size_ = _c[1];
        };
        return ListContainer;
    }(Container_1.Container));
    exports.ListContainer = ListContainer;
    //# sourceMappingURL=ListContainer.js.map
    });

    var ReverseIterator_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReverseIterator = void 0;
    /**
     * Basic reverse iterator.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var ReverseIterator = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param base The base iterator.
         */
        function ReverseIterator(base) {
            this.base_ = base.prev();
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * Get source container.
         *
         * @return The source container.
         */
        ReverseIterator.prototype.source = function () {
            return this.base_.source();
        };
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.base = function () {
            return this.base_.next();
        };
        Object.defineProperty(ReverseIterator.prototype, "value", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this.base_.value;
            },
            enumerable: false,
            configurable: true
        });
        /* ---------------------------------------------------------
            MOVERS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.prev = function () {
            // this.base().next()
            return this._Create_neighbor(this.base().next());
        };
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.next = function () {
            // this.base().prev()
            return this._Create_neighbor(this.base_);
        };
        /* ---------------------------------------------------------
            COMPARES
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        ReverseIterator.prototype.equals = function (obj) {
            return this.base_.equals(obj.base_);
        };
        return ReverseIterator;
    }());
    exports.ReverseIterator = ReverseIterator;
    //# sourceMappingURL=ReverseIterator.js.map
    });

    var SetElementList_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetElementList = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================



    /**
     * Doubly Linked List storing set elements.
     *
     * @template Key Key type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Source container type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetElementList = /** @class */ (function (_super) {
        __extends(SetElementList, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function SetElementList(associative) {
            var _this = _super.call(this) || this;
            _this.associative_ = associative;
            return _this;
        }
        SetElementList.prototype._Create_iterator = function (prev, next, val) {
            return SetElementList.Iterator.create(this, prev, next, val);
        };
        /**
         * @internal
         */
        SetElementList._Swap_associative = function (x, y) {
            var _a;
            _a = __read([y.associative_, x.associative_], 2), x.associative_ = _a[0], y.associative_ = _a[1];
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        SetElementList.prototype.associative = function () {
            return this.associative_;
        };
        return SetElementList;
    }(ListContainer_1.ListContainer));
    exports.SetElementList = SetElementList;
    /**
     *
     */
    (function (SetElementList) {
        /**
         * Iterator of set container storing elements in a list.
         *
         * @template Key Key type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var Iterator = /** @class */ (function (_super) {
            __extends(Iterator, _super);
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            function Iterator(list, prev, next, val) {
                var _this = _super.call(this, prev, next, val) || this;
                _this.source_ = list;
                return _this;
            }
            /**
             * @internal
             */
            Iterator.create = function (list, prev, next, val) {
                return new Iterator(list, prev, next, val);
            };
            /**
             * @inheritDoc
             */
            Iterator.prototype.reverse = function () {
                return new ReverseIterator(this);
            };
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * @inheritDoc
             */
            Iterator.prototype.source = function () {
                return this.source_.associative();
            };
            return Iterator;
        }(ListIterator_1.ListIterator));
        SetElementList.Iterator = Iterator;
        /**
         * Reverser iterator of set container storing elements in a list.
         *
         * @template Key Key type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var ReverseIterator = /** @class */ (function (_super) {
            __extends(ReverseIterator, _super);
            function ReverseIterator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ReverseIterator.prototype._Create_neighbor = function (base) {
                return new ReverseIterator(base);
            };
            return ReverseIterator;
        }(ReverseIterator_1.ReverseIterator));
        SetElementList.ReverseIterator = ReverseIterator;
    })(SetElementList = exports.SetElementList || (exports.SetElementList = {}));
    exports.SetElementList = SetElementList;
    //# sourceMappingURL=SetElementList.js.map
    });

    var HashBuckets_1 = createCommonjsModule(function (module, exports) {
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashBuckets = void 0;
    /**
     * Hash buckets
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashBuckets = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function HashBuckets(fetcher, hasher) {
            this.fetcher_ = fetcher;
            this.hasher_ = hasher;
            this.max_load_factor_ = DEFAULT_MAX_FACTOR;
            this.data_ = [];
            this.size_ = 0;
            this.initialize();
        }
        HashBuckets.prototype.clear = function () {
            this.data_ = [];
            this.size_ = 0;
            this.initialize();
        };
        HashBuckets.prototype.rehash = function (length) {
            var e_1, _a, e_2, _b;
            length = Math.max(length, MIN_BUCKET_COUNT);
            var data = [];
            for (var i = 0; i < length; ++i)
                data.push([]);
            try {
                for (var _c = __values(this.data_), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var row = _d.value;
                    try {
                        for (var row_1 = (e_2 = void 0, __values(row)), row_1_1 = row_1.next(); !row_1_1.done; row_1_1 = row_1.next()) {
                            var elem = row_1_1.value;
                            var index = this.hasher_(this.fetcher_(elem)) % data.length;
                            data[index].push(elem);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (row_1_1 && !row_1_1.done && (_b = row_1.return)) _b.call(row_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.data_ = data;
        };
        HashBuckets.prototype.reserve = function (length) {
            if (length > this.capacity()) {
                length = Math.floor(length / this.max_load_factor_);
                this.rehash(length);
            }
        };
        HashBuckets.prototype.initialize = function () {
            for (var i = 0; i < MIN_BUCKET_COUNT; ++i)
                this.data_.push([]);
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        HashBuckets.prototype.length = function () {
            return this.data_.length;
        };
        HashBuckets.prototype.capacity = function () {
            return this.data_.length * this.max_load_factor_;
        };
        HashBuckets.prototype.at = function (index) {
            return this.data_[index];
        };
        HashBuckets.prototype.load_factor = function () {
            return this.size_ / this.length();
        };
        HashBuckets.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            if (z === null)
                return this.max_load_factor_;
            else
                this.max_load_factor_ = z;
        };
        HashBuckets.prototype.hash_function = function () {
            return this.hasher_;
        };
        /* ---------------------------------------------------------
            ELEMENTS I/O
        --------------------------------------------------------- */
        HashBuckets.prototype.index = function (elem) {
            return this.hasher_(this.fetcher_(elem)) % this.length();
        };
        HashBuckets.prototype.insert = function (val) {
            var capacity = this.capacity();
            if (++this.size_ > capacity)
                this.reserve(capacity * 2);
            var index = this.index(val);
            this.data_[index].push(val);
        };
        HashBuckets.prototype.erase = function (val) {
            var index = this.index(val);
            var bucket = this.data_[index];
            for (var i = 0; i < bucket.length; ++i)
                if (bucket[i] === val) {
                    bucket.splice(i, 1);
                    --this.size_;
                    break;
                }
        };
        return HashBuckets;
    }());
    exports.HashBuckets = HashBuckets;
    var MIN_BUCKET_COUNT = 10;
    var DEFAULT_MAX_FACTOR = 1.0;
    //# sourceMappingURL=HashBuckets.js.map
    });

    var SetHashBuckets_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetHashBuckets = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * Hash buckets for set containers
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var SetHashBuckets = /** @class */ (function (_super) {
        __extends(SetHashBuckets, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor
         *
         * @param source Source set container
         * @param hasher Hash function
         * @param pred Equality function
         */
        function SetHashBuckets(source, hasher, pred) {
            var _this = _super.call(this, fetcher, hasher) || this;
            _this.source_ = source;
            _this.key_eq_ = pred;
            return _this;
        }
        /**
         * @internal
         */
        SetHashBuckets._Swap_source = function (x, y) {
            var _a;
            _a = __read([y.source_, x.source_], 2), x.source_ = _a[0], y.source_ = _a[1];
        };
        /* ---------------------------------------------------------
            FINDERS
        --------------------------------------------------------- */
        SetHashBuckets.prototype.key_eq = function () {
            return this.key_eq_;
        };
        SetHashBuckets.prototype.find = function (val) {
            var e_1, _a;
            var index = this.hash_function()(val) % this.length();
            var bucket = this.at(index);
            try {
                for (var bucket_1 = __values(bucket), bucket_1_1 = bucket_1.next(); !bucket_1_1.done; bucket_1_1 = bucket_1.next()) {
                    var it = bucket_1_1.value;
                    if (this.key_eq_(it.value, val))
                        return it;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (bucket_1_1 && !bucket_1_1.done && (_a = bucket_1.return)) _a.call(bucket_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.source_.end();
        };
        return SetHashBuckets;
    }(HashBuckets_1.HashBuckets));
    exports.SetHashBuckets = SetHashBuckets;
    function fetcher(elem) {
        return elem.value;
    }
    //# sourceMappingURL=SetHashBuckets.js.map
    });

    var Pair_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.make_pair = exports.Pair = void 0;


    /**
     * Pair of two elements.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Pair = /** @class */ (function () {
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor.
         *
         * @param first The first element.
         * @param second The second element.
         */
        function Pair(first, second) {
            this.first = first;
            this.second = second;
        }
        /* ---------------------------------------------------------
            COMPARISON
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        Pair.prototype.equals = function (pair) {
            return ((0, comparators.equal_to)(this.first, pair.first) &&
                (0, comparators.equal_to)(this.second, pair.second));
        };
        /**
         * @inheritDoc
         */
        Pair.prototype.less = function (pair) {
            if ((0, comparators.equal_to)(this.first, pair.first) === false)
                return (0, comparators.less)(this.first, pair.first);
            else
                return (0, comparators.less)(this.second, pair.second);
        };
        /**
         * @inheritDoc
         */
        Pair.prototype.hashCode = function () {
            return (0, hash_1.hash)(this.first, this.second);
        };
        return Pair;
    }());
    exports.Pair = Pair;
    /**
     * Create a {@link Pair}.
     *
     * @param first The 1st element.
     * @param second The 2nd element.
     *
     * @return A {@link Pair} object.
     */
    function make_pair(first, second) {
        return new Pair(first, second);
    }
    exports.make_pair = make_pair;
    //# sourceMappingURL=Pair.js.map
    });

    var HashSet_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashSet = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================





    /**
     * Unique-key Set based on Hash buckets.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashSet = /** @class */ (function (_super) {
        __extends(HashSet, _super);
        function HashSet() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, function (thisArg) { return new SetElementList_1.SetElementList(thisArg); }) || this;
            IHashContainer_1.IHashContainer.construct.apply(IHashContainer_1.IHashContainer, __spreadArray([_this,
                HashSet,
                function (hash, pred) {
                    _this.buckets_ = new SetHashBuckets_1.SetHashBuckets(_this, hash, pred);
                }], __read(args), false));
            return _this;
        }
        /* ---------------------------------------------------------
            ASSIGN & CLEAR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.clear = function () {
            this.buckets_.clear();
            _super.prototype.clear.call(this);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.swap = function (obj) {
            var _a, _b;
            // SWAP CONTENTS
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            SetElementList_1.SetElementList._Swap_associative(this.data_, obj.data_);
            // SWAP BUCKETS
            SetHashBuckets_1.SetHashBuckets._Swap_source(this.buckets_, obj.buckets_);
            _b = __read([obj.buckets_, this.buckets_], 2), this.buckets_ = _b[0], obj.buckets_ = _b[1];
        };
        /* =========================================================
            ACCESSORS
                - MEMBER
                - HASH
        ============================================================
            MEMBER
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.find = function (key) {
            return this.buckets_.find(key);
        };
        HashSet.prototype.begin = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.begin.call(this);
            else
                return this.buckets_.at(index)[0];
        };
        HashSet.prototype.end = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.end.call(this);
            else {
                var bucket = this.buckets_.at(index);
                return bucket[bucket.length - 1].next();
            }
        };
        HashSet.prototype.rbegin = function (index) {
            if (index === void 0) { index = null; }
            return this.end(index).reverse();
        };
        HashSet.prototype.rend = function (index) {
            if (index === void 0) { index = null; }
            return this.begin(index).reverse();
        };
        /* ---------------------------------------------------------
            HASH
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket_count = function () {
            return this.buckets_.length();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket_size = function (n) {
            return this.buckets_.at(n).length;
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.load_factor = function () {
            return this.buckets_.load_factor();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.hash_function = function () {
            return this.buckets_.hash_function();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.key_eq = function () {
            return this.buckets_.key_eq();
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.bucket = function (key) {
            return this.hash_function()(key) % this.buckets_.length();
        };
        HashSet.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            return this.buckets_.max_load_factor(z);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.reserve = function (n) {
            this.buckets_.reserve(n);
        };
        /**
         * @inheritDoc
         */
        HashSet.prototype.rehash = function (n) {
            this.buckets_.rehash(n);
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - POST-PROCESS
                - SWAP
        ============================================================
            INSERT
        --------------------------------------------------------- */
        HashSet.prototype._Insert_by_key = function (key) {
            // TEST WHETHER EXIST
            var it = this.find(key);
            if (it.equals(this.end()) === false)
                return new Pair_1.Pair(it, false);
            // INSERT
            this.data_.push(key);
            it = it.prev();
            // POST-PROCESS
            this._Handle_insert(it, it.next());
            return new Pair_1.Pair(it, true);
        };
        HashSet.prototype._Insert_by_hint = function (hint, key) {
            // FIND DUPLICATED KEY
            var it = this.find(key);
            if (it.equals(this.end()) === true) {
                // INSERT
                it = this.data_.insert(hint, key);
                // POST-PROCESS
                this._Handle_insert(it, it.next());
            }
            return it;
        };
        /* ---------------------------------------------------------
            POST-PROCESS
        --------------------------------------------------------- */
        HashSet.prototype._Handle_insert = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.insert(first);
        };
        HashSet.prototype._Handle_erase = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.erase(first);
        };
        return HashSet;
    }(UniqueSet_1.UniqueSet));
    exports.HashSet = HashSet;
    /**
     *
     */
    (function (HashSet) {
        // BODY
        HashSet.Iterator = SetElementList_1.SetElementList.Iterator;
        HashSet.ReverseIterator = SetElementList_1.SetElementList.ReverseIterator;
    })(HashSet = exports.HashSet || (exports.HashSet = {}));
    exports.HashSet = HashSet;
    //# sourceMappingURL=HashSet.js.map
    });

    var MapContainer_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapContainer = void 0;


    /**
     * Basic map container.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Derived type extending this {@link MapContainer}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapContainer = /** @class */ (function (_super) {
        __extends(MapContainer, _super);
        /* ---------------------------------------------------------
            CONSTURCTORS
        --------------------------------------------------------- */
        /**
         * Default Constructor.
         */
        function MapContainer(factory) {
            var _this = _super.call(this) || this;
            _this.data_ = factory(_this);
            return _this;
        }
        /**
         * @inheritDoc
         */
        MapContainer.prototype.assign = function (first, last) {
            // INSERT
            this.clear();
            this.insert(first, last);
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.clear = function () {
            // TO BE ABSTRACT
            this.data_.clear();
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.begin = function () {
            return this.data_.begin();
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.end = function () {
            return this.data_.end();
        };
        /* ---------------------------------------------------------
            ELEMENTS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        MapContainer.prototype.has = function (key) {
            return !this.find(key).equals(this.end());
        };
        /**
         * @inheritDoc
         */
        MapContainer.prototype.size = function () {
            return this.data_.size();
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - ERASE
                - UTILITY
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        MapContainer.prototype.push = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            // INSERT BY RANGE
            var first = new NativeArrayIterator_1.NativeArrayIterator(items, 0);
            var last = new NativeArrayIterator_1.NativeArrayIterator(items, items.length);
            this.insert(first, last);
            // RETURN SIZE
            return this.size();
        };
        MapContainer.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1)
                return this.emplace(args[0].first, args[0].second);
            else if (args[0].next instanceof Function &&
                args[1].next instanceof Function)
                return this._Insert_by_range(args[0], args[1]);
            else
                return this.emplace_hint(args[0], args[1].first, args[1].second);
        };
        MapContainer.prototype.erase = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 1 &&
                (args[0] instanceof this.end().constructor === false ||
                    args[0].source() !== this))
                return this._Erase_by_key(args[0]);
            else if (args.length === 1)
                return this._Erase_by_range(args[0]);
            else
                return this._Erase_by_range(args[0], args[1]);
        };
        MapContainer.prototype._Erase_by_range = function (first, last) {
            if (last === void 0) { last = first.next(); }
            // ERASE
            var it = this.data_.erase(first, last);
            // POST-PROCESS
            this._Handle_erase(first, last);
            return it;
        };
        return MapContainer;
    }(Container_1.Container));
    exports.MapContainer = MapContainer;
    //# sourceMappingURL=MapContainer.js.map
    });

    var UniqueMap_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UniqueMap = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.base
     */
    //================================================================


    /**
     * Basic map container blocking duplicated key.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Source Derived type extending this {@link UniqueMap}
     * @template IteratorT Iterator type
     * @template ReverseT Reverse iterator type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var UniqueMap = /** @class */ (function (_super) {
        __extends(UniqueMap, _super);
        function UniqueMap() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueMap.prototype.count = function (key) {
            return this.find(key).equals(this.end()) ? 0 : 1;
        };
        /**
         * Get a value.
         *
         * @param key Key to search for.
         * @return The value mapped by the key.
         */
        UniqueMap.prototype.get = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "get", key);
            return it.second;
        };
        /**
         * Take a value.
         *
         * Get a value, or set the value and returns it.
         *
         * @param key Key to search for.
         * @param generator Value generator when the matched key not found
         * @returns Value, anyway
         */
        UniqueMap.prototype.take = function (key, generator) {
            var it = this.find(key);
            return it.equals(this.end())
                ? this.emplace(key, generator()).first.second
                : it.second;
        };
        /**
         * Set a value with key.
         *
         * @param key Key to be mapped or search for.
         * @param val Value to insert or assign.
         */
        UniqueMap.prototype.set = function (key, val) {
            this.insert_or_assign(key, val);
        };
        UniqueMap.prototype.insert = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return _super.prototype.insert.apply(this, __spreadArray([], __read(args), false));
        };
        UniqueMap.prototype._Insert_by_range = function (first, last) {
            for (var it = first; !it.equals(last); it = it.next())
                this.emplace(it.value.first, it.value.second);
        };
        UniqueMap.prototype.insert_or_assign = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (args.length === 2) {
                return this._Insert_or_assign_with_key_value(args[0], args[1]);
            }
            else if (args.length === 3) {
                // INSERT OR ASSIGN AN ELEMENT
                return this._Insert_or_assign_with_hint(args[0], args[1], args[2]);
            }
        };
        UniqueMap.prototype._Insert_or_assign_with_key_value = function (key, value) {
            var ret = this.emplace(key, value);
            if (ret.second === false)
                ret.first.second = value;
            return ret;
        };
        UniqueMap.prototype._Insert_or_assign_with_hint = function (hint, key, value) {
            var ret = this.emplace_hint(hint, key, value);
            if (ret.second !== value)
                ret.second = value;
            return ret;
        };
        UniqueMap.prototype.extract = function (param) {
            if (param instanceof this.end().constructor)
                return this._Extract_by_iterator(param);
            else
                return this._Extract_by_key(param);
        };
        UniqueMap.prototype._Extract_by_key = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                throw ErrorGenerator_1.ErrorGenerator.key_nout_found(this, "extract", key);
            var ret = it.value;
            this._Erase_by_range(it);
            return ret;
        };
        UniqueMap.prototype._Extract_by_iterator = function (it) {
            if (it.equals(this.end()) === true)
                return this.end();
            this._Erase_by_range(it);
            return it;
        };
        UniqueMap.prototype._Erase_by_key = function (key) {
            var it = this.find(key);
            if (it.equals(this.end()) === true)
                return 0;
            this._Erase_by_range(it);
            return 1;
        };
        /* ---------------------------------------------------------
            UTILITY
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        UniqueMap.prototype.merge = function (source) {
            for (var it = source.begin(); !it.equals(source.end());)
                if (this.has(it.first) === false) {
                    this.insert(it.value);
                    it = source.erase(it);
                }
                else
                    it = it.next();
        };
        return UniqueMap;
    }(MapContainer_1.MapContainer));
    exports.UniqueMap = UniqueMap;
    //# sourceMappingURL=UniqueMap.js.map
    });

    var MapElementList_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapElementList = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================



    /**
     * Doubly Linked List storing map elements.
     *
     * @template Key Key type
     * @template T Mapped type
     * @template Unique Whether duplicated key is blocked or not
     * @template Source Source type
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapElementList = /** @class */ (function (_super) {
        __extends(MapElementList, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        function MapElementList(associative) {
            var _this = _super.call(this) || this;
            _this.associative_ = associative;
            return _this;
        }
        MapElementList.prototype._Create_iterator = function (prev, next, val) {
            return MapElementList.Iterator.create(this, prev, next, val);
        };
        /**
         * @internal
         */
        MapElementList._Swap_associative = function (x, y) {
            var _a;
            _a = __read([y.associative_, x.associative_], 2), x.associative_ = _a[0], y.associative_ = _a[1];
        };
        /* ---------------------------------------------------------
            ACCESSORS
        --------------------------------------------------------- */
        MapElementList.prototype.associative = function () {
            return this.associative_;
        };
        return MapElementList;
    }(ListContainer_1.ListContainer));
    exports.MapElementList = MapElementList;
    /**
     *
     */
    (function (MapElementList) {
        /**
         * Iterator of map container storing elements in a list.
         *
         * @template Key Key type
         * @template T Mapped type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var Iterator = /** @class */ (function (_super) {
            __extends(Iterator, _super);
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            function Iterator(list, prev, next, val) {
                var _this = _super.call(this, prev, next, val) || this;
                _this.list_ = list;
                return _this;
            }
            /**
             * @internal
             */
            Iterator.create = function (list, prev, next, val) {
                return new Iterator(list, prev, next, val);
            };
            /**
             * @inheritDoc
             */
            Iterator.prototype.reverse = function () {
                return new ReverseIterator(this);
            };
            /* ---------------------------------------------------------
                ACCESSORS
            --------------------------------------------------------- */
            /**
             * @inheritDoc
             */
            Iterator.prototype.source = function () {
                return this.list_.associative();
            };
            Object.defineProperty(Iterator.prototype, "first", {
                /**
                 * @inheritDoc
                 */
                get: function () {
                    return this.value.first;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Iterator.prototype, "second", {
                /**
                 * @inheritDoc
                 */
                get: function () {
                    return this.value.second;
                },
                /**
                 * @inheritDoc
                 */
                set: function (val) {
                    this.value.second = val;
                },
                enumerable: false,
                configurable: true
            });
            return Iterator;
        }(ListIterator_1.ListIterator));
        MapElementList.Iterator = Iterator;
        /**
         * Reverse iterator of map container storing elements a list.
         *
         * @template Key Key type
         * @template T Mapped type
         * @template Unique Whether duplicated key is blocked or not
         * @template Source Source container type
         *
         * @author Jeongho Nam - https://github.com/samchon
         */
        var ReverseIterator = /** @class */ (function (_super) {
            __extends(ReverseIterator, _super);
            function ReverseIterator() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /* ---------------------------------------------------------
                CONSTRUCTORS
            --------------------------------------------------------- */
            ReverseIterator.prototype._Create_neighbor = function (base) {
                return new ReverseIterator(base);
            };
            Object.defineProperty(ReverseIterator.prototype, "first", {
                /* ---------------------------------------------------------
                    ACCESSORS
                --------------------------------------------------------- */
                /**
                 * Get the first, key element.
                 *
                 * @return The first element.
                 */
                get: function () {
                    return this.base_.first;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ReverseIterator.prototype, "second", {
                /**
                 * Get the second, stored element.
                 *
                 * @return The second element.
                 */
                get: function () {
                    return this.base_.second;
                },
                /**
                 * Set the second, stored element.
                 *
                 * @param val The value to set.
                 */
                set: function (val) {
                    this.base_.second = val;
                },
                enumerable: false,
                configurable: true
            });
            return ReverseIterator;
        }(ReverseIterator_1.ReverseIterator));
        MapElementList.ReverseIterator = ReverseIterator;
    })(MapElementList = exports.MapElementList || (exports.MapElementList = {}));
    exports.MapElementList = MapElementList;
    //# sourceMappingURL=MapElementList.js.map
    });

    var MapHashBuckets_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __values = (commonjsGlobal && commonjsGlobal.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapHashBuckets = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std.internal
     */
    //================================================================

    /**
     * Hash buckets for map containers.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var MapHashBuckets = /** @class */ (function (_super) {
        __extends(MapHashBuckets, _super);
        /* ---------------------------------------------------------
            CONSTRUCTORS
        --------------------------------------------------------- */
        /**
         * Initializer Constructor
         *
         * @param source Source map container
         * @param hasher Hash function
         * @param pred Equality function
         */
        function MapHashBuckets(source, hasher, pred) {
            var _this = _super.call(this, fetcher, hasher) || this;
            _this.source_ = source;
            _this.key_eq_ = pred;
            return _this;
        }
        /**
         * @internal
         */
        MapHashBuckets._Swap_source = function (x, y) {
            var _a;
            _a = __read([y.source_, x.source_], 2), x.source_ = _a[0], y.source_ = _a[1];
        };
        /* ---------------------------------------------------------
            FINDERS
        --------------------------------------------------------- */
        MapHashBuckets.prototype.key_eq = function () {
            return this.key_eq_;
        };
        MapHashBuckets.prototype.find = function (key) {
            var e_1, _a;
            var index = this.hash_function()(key) % this.length();
            var bucket = this.at(index);
            try {
                for (var bucket_1 = __values(bucket), bucket_1_1 = bucket_1.next(); !bucket_1_1.done; bucket_1_1 = bucket_1.next()) {
                    var it = bucket_1_1.value;
                    if (this.key_eq_(it.first, key))
                        return it;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (bucket_1_1 && !bucket_1_1.done && (_a = bucket_1.return)) _a.call(bucket_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.source_.end();
        };
        return MapHashBuckets;
    }(HashBuckets_1.HashBuckets));
    exports.MapHashBuckets = MapHashBuckets;
    function fetcher(elem) {
        return elem.first;
    }
    //# sourceMappingURL=MapHashBuckets.js.map
    });

    var Entry_1 = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Entry = void 0;


    /**
     * Entry for mapping.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var Entry = /** @class */ (function () {
        /**
         * Intializer Constructor.
         *
         * @param first The first, key element.
         * @param second The second, mapped element.
         */
        function Entry(first, second) {
            this.first = first;
            this.second = second;
        }
        /**
         * @inheritDoc
         */
        Entry.prototype.equals = function (obj) {
            return (0, comparators.equal_to)(this.first, obj.first);
        };
        /**
         * @inheritDoc
         */
        Entry.prototype.less = function (obj) {
            return (0, comparators.less)(this.first, obj.first);
        };
        /**
         * @inheritDoc
         */
        Entry.prototype.hashCode = function () {
            return (0, hash_1.hash)(this.first);
        };
        return Entry;
    }());
    exports.Entry = Entry;
    //# sourceMappingURL=Entry.js.map
    });

    var HashMap_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };
    var __spreadArray = (commonjsGlobal && commonjsGlobal.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HashMap = void 0;
    //================================================================
    /**
     * @packageDocumentation
     * @module std
     */
    //================================================================






    /**
     * Unique-key Map based on Hash buckets.
     *
     * @author Jeongho Nam - https://github.com/samchon
     */
    var HashMap = /** @class */ (function (_super) {
        __extends(HashMap, _super);
        function HashMap() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, function (thisArg) { return new MapElementList_1.MapElementList(thisArg); }) || this;
            IHashContainer_1.IHashContainer.construct.apply(IHashContainer_1.IHashContainer, __spreadArray([_this,
                HashMap,
                function (hash, pred) {
                    _this.buckets_ = new MapHashBuckets_1.MapHashBuckets(_this, hash, pred);
                }], __read(args), false));
            return _this;
        }
        /* ---------------------------------------------------------
            ASSIGN & CLEAR
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.clear = function () {
            this.buckets_.clear();
            _super.prototype.clear.call(this);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.swap = function (obj) {
            var _a, _b;
            // SWAP CONTENTS
            _a = __read([obj.data_, this.data_], 2), this.data_ = _a[0], obj.data_ = _a[1];
            MapElementList_1.MapElementList._Swap_associative(this.data_, obj.data_);
            // SWAP BUCKETS
            MapHashBuckets_1.MapHashBuckets._Swap_source(this.buckets_, obj.buckets_);
            _b = __read([obj.buckets_, this.buckets_], 2), this.buckets_ = _b[0], obj.buckets_ = _b[1];
        };
        /* =========================================================
            ACCESSORS
                - MEMBER
                - HASH
        ============================================================
            MEMBER
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.find = function (key) {
            return this.buckets_.find(key);
        };
        HashMap.prototype.begin = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.begin.call(this);
            else
                return this.buckets_.at(index)[0];
        };
        HashMap.prototype.end = function (index) {
            if (index === void 0) { index = null; }
            if (index === null)
                return _super.prototype.end.call(this);
            else {
                var bucket = this.buckets_.at(index);
                return bucket[bucket.length - 1].next();
            }
        };
        HashMap.prototype.rbegin = function (index) {
            if (index === void 0) { index = null; }
            return this.end(index).reverse();
        };
        HashMap.prototype.rend = function (index) {
            if (index === void 0) { index = null; }
            return this.begin(index).reverse();
        };
        /* ---------------------------------------------------------
            HASH
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket_count = function () {
            return this.buckets_.length();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket_size = function (index) {
            return this.buckets_.at(index).length;
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.load_factor = function () {
            return this.buckets_.load_factor();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.hash_function = function () {
            return this.buckets_.hash_function();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.key_eq = function () {
            return this.buckets_.key_eq();
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.bucket = function (key) {
            return this.hash_function()(key) % this.buckets_.length();
        };
        HashMap.prototype.max_load_factor = function (z) {
            if (z === void 0) { z = null; }
            return this.buckets_.max_load_factor(z);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.reserve = function (n) {
            this.buckets_.reserve(n);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.rehash = function (n) {
            this.buckets_.rehash(n);
        };
        /* =========================================================
            ELEMENTS I/O
                - INSERT
                - POST-PROCESS
        ============================================================
            INSERT
        --------------------------------------------------------- */
        /**
         * @inheritDoc
         */
        HashMap.prototype.emplace = function (key, val) {
            // TEST WHETHER EXIST
            var it = this.find(key);
            if (it.equals(this.end()) === false)
                return new Pair_1.Pair(it, false);
            // INSERT
            this.data_.push(new Entry_1.Entry(key, val));
            it = it.prev();
            // POST-PROCESS
            this._Handle_insert(it, it.next());
            return new Pair_1.Pair(it, true);
        };
        /**
         * @inheritDoc
         */
        HashMap.prototype.emplace_hint = function (hint, key, val) {
            // FIND DUPLICATED KEY
            var it = this.find(key);
            if (it.equals(this.end()) === true) {
                // INSERT
                it = this.data_.insert(hint, new Entry_1.Entry(key, val));
                // POST-PROCESS
                this._Handle_insert(it, it.next());
            }
            return it;
        };
        /* ---------------------------------------------------------
            POST-PROCESS
        --------------------------------------------------------- */
        HashMap.prototype._Handle_insert = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.insert(first);
        };
        HashMap.prototype._Handle_erase = function (first, last) {
            for (; !first.equals(last); first = first.next())
                this.buckets_.erase(first);
        };
        return HashMap;
    }(UniqueMap_1.UniqueMap));
    exports.HashMap = HashMap;
    /**
     *
     */
    (function (HashMap) {
        // BODY
        HashMap.Iterator = MapElementList_1.MapElementList.Iterator;
        HashMap.ReverseIterator = MapElementList_1.MapElementList.ReverseIterator;
    })(HashMap = exports.HashMap || (exports.HashMap = {}));
    exports.HashMap = HashMap;
    //# sourceMappingURL=HashMap.js.map
    });

    var __values = (commonjsGlobal && commonjsGlobal.__values) || function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };



    var EventTarget = /** @class */ (function () {
        function EventTarget() {
            this.listeners_ = new HashMap_1.HashMap();
            this.created_at_ = new Date();
        }
        EventTarget.prototype.dispatchEvent = function (event) {
            var e_1, _a;
            // FIND LISTENERS
            var it = this.listeners_.find(event.type);
            if (it.equals(this.listeners_.end()))
                return;
            // SET DEFAULT ARGUMENTS
            event.target = this;
            event.timeStamp = new Date().getTime() - this.created_at_.getTime();
            try {
                // CALL THE LISTENERS
                for (var _b = __values(it.second), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var listener = _c.value;
                    listener(event);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        EventTarget.prototype.addEventListener = function (type, listener) {
            var it = this.listeners_.find(type);
            if (it.equals(this.listeners_.end()))
                it = this.listeners_.emplace(type, new HashSet_1.HashSet()).first;
            it.second.insert(listener);
        };
        EventTarget.prototype.removeEventListener = function (type, listener) {
            var it = this.listeners_.find(type);
            if (it.equals(this.listeners_.end()))
                return;
            it.second.erase(listener);
            if (it.second.empty())
                this.listeners_.erase(it);
        };
        return EventTarget;
    }());
    var EventTarget_2 = EventTarget;


    var EventTarget_1 = /*#__PURE__*/Object.defineProperty({
    	EventTarget: EventTarget_2
    }, '__esModule', {value: true});

    var Event = /** @class */ (function () {
        function Event(type, init) {
            this.type = type;
            if (init)
                Object.assign(this, init);
        }
        return Event;
    }());
    var Event_2 = Event;


    var Event_1 = /*#__PURE__*/Object.defineProperty({
    	Event: Event_2
    }, '__esModule', {value: true});

    var __extends$2 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var CloseEvent = /** @class */ (function (_super) {
        __extends$2(CloseEvent, _super);
        function CloseEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return CloseEvent;
    }(Event_1.Event));
    var CloseEvent_2 = CloseEvent;


    var CloseEvent_1 = /*#__PURE__*/Object.defineProperty({
    	CloseEvent: CloseEvent_2
    }, '__esModule', {value: true});

    var __extends$1 = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var MessageEvent = /** @class */ (function (_super) {
        __extends$1(MessageEvent, _super);
        function MessageEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return MessageEvent;
    }(Event_1.Event));
    var MessageEvent_2 = MessageEvent;


    var MessageEvent_1 = /*#__PURE__*/Object.defineProperty({
    	MessageEvent: MessageEvent_2
    }, '__esModule', {value: true});

    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();


    var ErrorEvent = /** @class */ (function (_super) {
        __extends(ErrorEvent, _super);
        function ErrorEvent(type, init) {
            return _super.call(this, type, init) || this;
        }
        return ErrorEvent;
    }(Event_1.Event));
    var ErrorEvent_2 = ErrorEvent;


    var ErrorEvent_1 = /*#__PURE__*/Object.defineProperty({
    	ErrorEvent: ErrorEvent_2
    }, '__esModule', {value: true});

    var WebSocket_1 = createCommonjsModule(function (module, exports) {
    var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
        __assign = Object.assign || function(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    Object.defineProperty(exports, "__esModule", { value: true });






    var WebSocket = /** @class */ (function (_super) {
        __extends(WebSocket, _super);
        /* ----------------------------------------------------------------
            CONSTRUCTORS
        ---------------------------------------------------------------- */
        function WebSocket(url, protocols) {
            var _this = _super.call(this) || this;
            _this.on_ = {};
            _this.state_ = WebSocket.CONNECTING;
            //----
            // CLIENT
            //----
            // PREPARE SOCKET
            _this.client_ = new browser.client();
            _this.client_.on("connect", _this._Handle_connect.bind(_this));
            _this.client_.on("connectFailed", _this._Handle_error.bind(_this));
            if (typeof protocols === "string")
                protocols = [protocols];
            // DO CONNECT
            _this.client_.connect(url, protocols);
            return _this;
        }
        WebSocket.prototype.close = function (code, reason) {
            this.state_ = WebSocket.CLOSING;
            if (code === undefined)
                this.connection_.sendCloseFrame();
            else
                this.connection_.sendCloseFrame(code, reason, true);
        };
        /* ================================================================
            ACCESSORS
                - SENDER
                - PROPERTIES
                - LISTENERS
        ===================================================================
            SENDER
        ---------------------------------------------------------------- */
        WebSocket.prototype.send = function (data) {
            if (typeof data.valueOf() === "string")
                this.connection_.sendUTF(data);
            else {
                var buffer = void 0;
                if (data instanceof Buffer)
                    buffer = data;
                else if (data instanceof Blob)
                    buffer = new Buffer(data, "blob");
                else if (data.buffer)
                    buffer = new Buffer(data.buffer);
                else
                    buffer = new Buffer(data);
                this.connection_.sendBytes(buffer);
            }
        };
        Object.defineProperty(WebSocket.prototype, "url", {
            /* ----------------------------------------------------------------
                PROPERTIES
            ---------------------------------------------------------------- */
            get: function () {
                return this.client_.url.href;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "protocol", {
            get: function () {
                return this.client_.protocols
                    ? this.client_.protocols[0]
                    : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "extensions", {
            get: function () {
                return this.connection_ && this.connection_.extensions
                    ? this.connection_.extensions[0].name
                    : "";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "readyState", {
            get: function () {
                return this.state_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "bufferedAmount", {
            get: function () {
                return this.connection_.bytesWaitingToFlush;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "binaryType", {
            get: function () {
                return "arraybuffer";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onopen", {
            /* ----------------------------------------------------------------
                LISTENERS
            ---------------------------------------------------------------- */
            get: function () {
                return this.on_.open;
            },
            set: function (listener) {
                this._Set_on("open", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onclose", {
            get: function () {
                return this.on_.close;
            },
            set: function (listener) {
                this._Set_on("close", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onmessage", {
            get: function () {
                return this.on_.message;
            },
            set: function (listener) {
                this._Set_on("message", listener);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocket.prototype, "onerror", {
            get: function () {
                return this.on_.error;
            },
            set: function (listener) {
                this._Set_on("error", listener);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @hidden
         */
        WebSocket.prototype._Set_on = function (type, listener) {
            if (this.on_[type])
                this.removeEventListener(type, this.on_[type]);
            this.addEventListener(type, listener);
            this.on_[type] = listener;
        };
        /* ----------------------------------------------------------------
            SOCKET HANDLERS
        ---------------------------------------------------------------- */
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_connect = function (connection) {
            this.connection_ = connection;
            this.state_ = WebSocket.OPEN;
            this.connection_.on("message", this._Handle_message.bind(this));
            this.connection_.on("error", this._Handle_error.bind(this));
            this.connection_.on("close", this._Handle_close.bind(this));
            var event = new Event_1.Event("open", EVENT_INIT);
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_close = function (code, reason) {
            var event = new CloseEvent_1.CloseEvent("close", __assign({}, EVENT_INIT, { code: code, reason: reason }));
            this.state_ = WebSocket.CLOSED;
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_message = function (message) {
            var event = new MessageEvent_1.MessageEvent("message", __assign({}, EVENT_INIT, { data: message.binaryData
                    ? message.binaryData
                    : message.utf8Data }));
            this.dispatchEvent(event);
        };
        /**
         * @hidden
         */
        WebSocket.prototype._Handle_error = function (error) {
            var event = new ErrorEvent_1.ErrorEvent("error", __assign({}, EVENT_INIT, { error: error, message: error.message }));
            if (this.state_ === WebSocket.CONNECTING)
                this.state_ = WebSocket.CLOSED;
            this.dispatchEvent(event);
        };
        return WebSocket;
    }(EventTarget_1.EventTarget));
    exports.WebSocket = WebSocket;
    (function (WebSocket) {
        WebSocket.CONNECTING = 0;
        WebSocket.OPEN = 1;
        WebSocket.CLOSING = 2;
        WebSocket.CLOSED = 3;
    })(WebSocket = exports.WebSocket || (exports.WebSocket = {}));
    exports.WebSocket = WebSocket;
    var EVENT_INIT = {
        bubbles: false,
        cancelable: false
    };
    //# sourceMappingURL=WebSocket.js.map
    });

    if (node.is_node())
        commonjsGlobal.WebSocket = WebSocket_1.WebSocket;

    // helperStore.js
    const sidebarOpen = writable(false);


    const contentContainerClass = derived(sidebarOpen, $sidebarOpen =>
        $sidebarOpen ? "combined-content-container sidebar-open" : "combined-content-container"
    );

    const tutorials = [
        {
            bannerImage: "../../img/tutorial/nostr_banner.png",
            title: "What is Nostr?",
            subtitle: "Nostr - The decentralized State",
            content: `
        <div style="font-family: Arial, sans-serif; padding-top: 20px;">
            <h1>Welcome to the world of Nostr!</h1>
            <p>Perhaps you've heard about Nostr, the protocol that's sparking conversations and stretching imaginations all across the digital world. Well, we're here to guide you through it and make understanding and using Nostr as easy as possible. Let's dive in!</p>
    
            <h2>So, what is Nostr?</h2>
            <p>Nostr is a decentralized messaging protocol. But don't worry if this sounds too technical! Simply put, Nostr allows you to send messages on the internet in a whole new way - free from central control.</p>
    
            <h2>What makes Nostr unique?</h2>
            <p>Every user in Nostr has a public key, which is like your address that everyone can see, and a private key, which acts like your secret password. Be sure to keep your private key safe because just like a house key, it cannot be replaced if lost!</p>
            <p>What's even more exciting is that with Nostr, your account can act as a universal key! Imagine being able to log in to multiple platforms and websites with just a single account. Want to post on a social media platform? Check. Need to log in to your online workspace? Done. Want to comment on your favorite blog? Easy peasy! All these and many more are possible with your Nostr account.</p>
    
            <h2>But, how does it work?</h2>
            <p>You can access Nostr through an app on your computer, your smartphone, or directly in your web browser. These apps allow you to send and receive messages. And the best part? Each message you send is signed with your private key, assuring everyone that the message is genuinely yours. It's like your personal signature on every message you send.</p>
    
            <h2>The magic of Nostr</h2>
            <p>Now, you might wonder why Nostr seems to be stirring up so much buzz. The magic of Nostr lies in its decentralization. Unlike traditional systems where there's a central authority, Nostr is spread out. This means there's no single entity controlling your messages. You're in control of your own communication. And that's truly magical.</p>
    
            <h2>Let's get started!</h2>
            <p>Now that you've gotten a glimpse of the amazing world of Nostr, you're probably eager to jump in. And we're here to guide you every step of the way. Stay tuned for our next tutorial, where we'll walk you through setting up your first Nostr app. The future of communication awaits!</p>
        </div>`
        },
        {
            bannerImage: "../../img/Banner1u.png",
            title: "How can I use Nostr with GetAlby?",
            subtitle: "Embrace the Future of Communication with GetAlby",
            content: `
        <div style="font-family: Arial, sans-serif; padding-top: 20px;">
            <h1>Welcome, future Nostronaut!</h1>
            <p>Welcome to a revolutionary change in communication! We're here to guide you through the world of Nostr, a vast decentralized network. And the best part? You can navigate this new world with GetAlby - your trusty companion on this journey. Let's dive in!</p>
            <img src="../../img/tutorial/alby_0.png" alt="Introduction">
    
            <h2>Step 1: Meet GetAlby, your New Ally</h2>
            <p>GetAlby is a browser extension for Chrome or Firefox, designed to make your journey through Nostr simple and effortless. Go to <a href="https://getalby.com/">https://getalby.com/</a>, click "add browser extension" and set the pace for your Nostr adventure.</p>
            <img src="../../img/tutorial/alby_1.png" alt="GetAlby">
    
            <h2>Step 2: Set Up Your Account</h2>
            <p>After you've added GetAlby to your browser, it's time to create your account. Click the "Create Account" button. Follow the prompts in GetAlby to create your account. Remember, one account can have multiple identities - each for a different adventure!</p>
            <img src="../../img/tutorial/alby_2.png" alt="Create Account">
    
            <h2>Step 3: Crafting Your Unique Identity</h2>
            <p>Now that your account is set up, it's time to create your unique identity in Nostr. Click on the GetAlby icon in your browser to open the extension. From there, click on the menu button and select "settings". Scroll down to the Nostr section and click "go to accounts". Select your account and click on "generate new key". Congratulations! You've just created your unique identity on Nostr.</p>
            <img src="../../img/tutorial/alby_3.png" alt="Craft Identity">
    
            <h2>Step 4: Discover, Engage, and Express Freely</h2>
            <p>With your unique identity and GetAlby at your fingertips, you're ready to explore the limitless possibilities of Nostr. Engage with the community, publish your thoughts, subscribe to other explorers, and carve out your unique space in this decentralized network.</p>
            <img src="../../img/tutorial/alby_4.png" alt="Discover, Engage, Express">
    
            <h2>Step 5: Navigate the Ocean of Opportunities</h2>
            <p>Nostr is an ocean of diverse events and experiences. Using GetAlby's intuitive interface, you can chart your course and navigate to the areas that interest you most. Set your filters, find your points of interest, and tailor your journey to your liking.</p>
            <img src="../../img/tutorial/alby_5.png" alt="Navigate">
    
            <h2>The GetAlby Experience</h2>
            <p>GetAlby is more than just a Nostr client - it's a gateway to a world where you're in control. With Nostr and GetAlby, you have the freedom and the tools to shape your communication in a way that suits you best. Embrace the thrill, the pace, and the unbound possibilities of Nostr with GetAlby.</p>
            <img src="../../img/tutorial/alby_6.png" alt="Experience">
    
            <h2>Ready to take the Leap?</h2>
            <p>The future of communication is here, and it's exciting, fast, and liberating. With Nostr and GetAlby, you're embarking on a journey that puts you at the helm. So, what are you waiting for, future Nostronaut? Let's dive into the ocean of possibilities!</p>
            <img src="../../img/tutorial/alby_7.png" alt="Ready">
        </div>
        `
        },
        {
            bannerImage: "../../img/Banner1u.png",
            title: "How can I verify my Account?",
            subtitle: "This is a subtitle for tutorial 3",
            content: "This is the content for tutorial 3."
        },
        {
            bannerImage: "../../img/Banner1u.png",
            title: "How can I use Nostr??!?!?!?!",
            subtitle: "This is a subtitle for tutorial 4",
            content: `
        <html>
        <body>
            <h1>Willkommen zum vierten Tutorial!</h1>
            <p>In diesem Kapitel werden wir tiefer in die spannenden Aspekte unserer Anwendung eintauchen. Sie werden lernen, wie Sie die <span class="highlight">erweiterten Funktionen</span> nutzen können, um das Beste aus Ihrer Erfahrung herauszuholen.</p>
            <p>Sind Sie bereit, loszulegen? Lassen Sie uns zusammen die nächste Stufe der <span class="highlight">Digitalen Revolution</span> erreichen!</p>
        </body>
        </html>
        `
        }
    ];

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$D = ".color-for-bg {\n    color: rgb(71 85 105)\n}\n\n.text-color-df {\n    color: #4a5568;\n}\n\n/* Layout */\n.overview-page {\n    position: relative;\n    display: flex;\n    flex-direction: column;\n    background-color: rgb(71 85 105)\n        /* background-color: #E2E8F0; Assuming you have this variable defined */\n}\n\nfooter {\n    z-index: 10;\n    background-color: rgb(12, 12, 12);\n}\n\n.move-up {\n    transform: translateY(-2px);\n}\n\n.content-overlay {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 50%;\n    /* Equivalent to top-1/2 */\n    transform: translateY(-50%);\n    /* Equivalent to -translate-y-1/2 */\n    padding: 0 1rem;\n    /* Equivalent to px-4 */\n    display: flex;\n    flex-direction: column;\n    /* Equivalent to flex-col */\n    align-items: flex-start;\n    /* Equivalent to items-start */\n    justify-content: center;\n    /* Equivalent to justify-center */\n    height: 100%;\n    /* Equivalent to h-full */\n}\n\n.content-icons {\n    position: absolute;\n    top: 1rem;\n    /* Equivalent to top-4 */\n    right: 1rem;\n    /* Equivalent to right-4 */\n    font-size: 1.875rem;\n    /* Equivalent to text-3xl */\n    color: white;\n    /* Equivalent to text-white */\n    display: flex;\n    justify-content: flex-end;\n    /* Equivalent to justify-end */\n    align-items: center;\n    /* Equivalent to items-center */\n    gap: 1.5rem;\n    /* Equivalent to gap-6 */\n}\n\n.support-button {\n    padding: 0;\n    display: flex;\n    align-items: center;\n    background: none;\n    border: none;\n    cursor: pointer;\n}\n\n.support-button img {\n    height: 2.5rem;\n    width: 2.5rem;\n}\n\n\n.bg-card {\n    background-color: white;\n    width: 100%;\n    margin-bottom: 6rem;\n    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),\n        0 2px 4px -1px rgba(0, 0, 0, 0.06);\n    border-radius: 1.25rem;\n}\n\n/* Base class for h2 */\n.base-h2 {\n    font-size: 4rem;\n    font-weight: 700;\n    /* blueGray-700 */\n    margin-bottom: 1rem;\n    margin-top: 1.5rem;\n    /* Equivalent to mt-6 */\n}\n\n/* Base class for h3 */\n.base-h3 {\n    font-size: 3rem;\n    font-weight: 600;\n    /* blueGray-700 */\n    margin-bottom: 0.75rem;\n    margin-top: 1.25rem;\n}\n\n/* Base class for h4 */\n.base-h4 {\n    font-size: 2rem;\n    font-weight: 500;\n    /* blueGray-700 */\n    margin-bottom: 0.5rem;\n    margin-top: 1rem;\n}\n\n.flex-grow {\n    /* Other styles */\n    z-index: 0;\n    /* This will keep the div behind the button */\n}\n\n.content-section {\n    display: flex;\n    /* background-color: #e2e8f0 !important;*/\n}\n\n.content-container {\n    margin-left: 0;\n    /* This is the starting state */\n    transition: margin-left 0.3s ease-in-out;\n    flex-grow: 1;\n    z-index: 0;\n    /* This will keep the div behind the button */\n}\n\n.content-container.sidebar-open {\n    margin-left: 200px;\n    /* This should be equal to the width of the sidebar */\n}\n\n.combined-content-container {\n    /* From .content-container */\n    margin-left: 0;\n    transition: margin-left 0.3s ease-in-out;\n    flex-grow: 1;\n    z-index: 0;\n\n    /* From .relative (assuming it sets position: relative) */\n    position: relative;\n\n    /* From .py-16 (assuming it sets padding-top and padding-bottom to 4rem) */\n    padding-top: 32px;\n\n    /* From .bg-blueGray-200 */\n    /* background-color: #e2e8f0; */\n    /* This is a guess based on the name. Replace with the actual color if different. */\n\n    /* From .container (assuming it centers content with max-width and auto margins) */\n    max-width: 100%;\n    /* Adjust this value based on your design */\n    /* margin-right: auto;\n    margin-left: auto; */\n\n    /* From .mx-auto */\n    /* Already covered by the .container styles above */\n\n    /* From .px-4 (assuming it sets padding-left and padding-right to 1rem) */\n    padding-left: 1rem;\n    padding-right: 1rem;\n}\n\n.combined-content-container.sidebar-open {\n    margin-left: 200px;\n}\n\n\n.title-class {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 1/2;\n    transition: left 0.3s ease-in-out;\n    left: 55px;\n}\n\n.title-class.sidebar-open {\n    left: 215px;\n}\n\n.html-content {\n    width: 70%;\n    margin: 0 auto;\n    text-align: justify;\n}\n\n.github-icon-size {\n    font-size: 2.5rem;\n    /* This is equivalent to 40px for most browsers */\n    width: 40px;\n    height: 40px;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.single-card {\n    background-color: white;\n    width: 100%;\n    margin-bottom: 4rem;\n    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),\n        0 2px 4px -1px rgba(0, 0, 0, 0.06);\n    border-radius: 1.25rem;\n    position: relative;\n    display: flex;\n    flex-direction: column;\n}\n\n\n.single-card-profile-img {\n    width: 150px;\n    height: 150px;\n    border-radius: 50%;\n    overflow: hidden;\n    position: relative;\n    top: -75px;\n}\n\n.single-card-content {\n    width: 70%;\n    margin: 0 auto;\n    text-align: justify;\n    margin-bottom: 90px;\n    font-size: 1.2em;\n}\n\n.abstract-text {\n    width: 50%;\n    margin: 2rem auto;\n    text-align: justify;\n    font-size: 1.1em;\n    line-height: 1.6em;\n}\n\n.single-card-content h2,\n.single-card-content h3,\n.single-card-content h4,\n.single-card-content h5,\n.single-card-content h6 {\n    margin-top: 1.5em;\n    /* Adjust as needed */\n}\n\n.diagonal-cut {\n    bottom: -1px;\n    width: 100%;\n    position: inherit;\n}\n\n.input-style {\n    font-size: 19.2px;\n    line-height: 28.8px;\n    height: 45px;\n    width: 100%;\n    display: flex;\n    justify-content: center;\n    border: 1px solid #D1D5DB;\n    /* border-gray-300 */\n    border-radius: 0.375rem;\n    /* rounded-md */\n    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);\n    /* shadow-sm */\n    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n}\n\n.input-style:focus {\n    border-color: #93C5FD;\n    /* focus:border-indigo-300 */\n    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.5);\n    /* focus:ring-indigo-200 with focus:ring-opacity-50 */\n}\n\n.input-style-resize {\n    resize: none;\n    overflow: hidden;\n}\n\n.bs-orange {\n    background-color: rgb(249 115 22);\n}\n\n.bs-orange:active {\n    background-color: rgb(234 88 12);\n}\n\n.bs-blue {\n    background-color: #223d6d;\n}\n\n.bs-blue:active {\n    background-color: #1a2f53;\n}\n\n.modal-button {\n    font-size: 1.0rem;\n}\n\n.remove-button {\n    /* Remove the flex-grow property if you don't want the buttons to grow */\n    padding: 2px 8px;\n    /* Adjust padding to fit the text */\n    background-color: rgb(238, 238, 238);\n    border: none;\n    /* Remove border if you don't need it */\n    cursor: pointer;\n    /* Makes it clear the element is clickable */\n    white-space: nowrap;\n    /* Prevent text inside the button from wrapping */\n    /* You can remove min-width if you want the button to only be as wide as its content plus padding */\n    /* min-width: 120px; */\n    margin: 2px;\n    /* Provide some space around the buttons */\n    border-radius: 4px;\n    /* If you want rounded corners */\n    /* Add text alignment and other styles as needed */\n    text-align: center;\n    font-size: 1rem;\n    /* Adjust font size as needed */\n}\n\n.remove-button:hover {\n    background-color: #223d6d;\n    position: relative;\n    color: #adadad;\n}\n\n.remove-button:focus {\n    outline: none;\n}\n\n.add-button {\n    /* Remove the flex-grow property if you don't want the buttons to grow */\n    padding: 2px 8px;\n    /* Adjust padding to fit the text */\n    background-color: rgb(238, 238, 238);\n    border: none;\n    /* Remove border if you don't need it */\n    cursor: pointer;\n    /* Makes it clear the element is clickable */\n    white-space: nowrap;\n    /* Prevent text inside the button from wrapping */\n    /* You can remove min-width if you want the button to only be as wide as its content plus padding */\n    /* min-width: 120px; */\n    margin: 2px;\n    /* Provide some space around the buttons */\n    border-radius: 4px;\n    /* If you want rounded corners */\n    /* Add text alignment and other styles as needed */\n    text-align: center;\n    font-size: 1rem;\n    /* Adjust font size as needed */\n}\n\n.add-button:hover {\n    background-color: rgb(249 115 22);\n    position: relative;\n    color: #fff;\n}\n\n.add-button:focus {\n    outline: none;\n}\n\n\n/* .card {\n    background: #ffffff;\n    overflow: hidden;\n    border-radius: 8px;\n    overflow: hidden;\n    display: flex;\n    flex-direction: column;\n    border: 4px solid #ffffff;\n    box-shadow: 0 5px 10px #0000008c;\n}\n\n.card:hover {\n    transform: scale(1.03);\n    background: #ffffff;\n    box-shadow: 0 10px 20px #0000008c;\n} */\n\n.banner-image {\n    width: 100%;\n    height: 200px;\n    object-fit: cover;\n}\n\n.content,\n.actions {\n    padding: 15px;\n}\n\n.actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: #f4f4f4;\n}";
    styleInject(css_248z$D);

    // NostrCacheStore.js
    const { nip19 } = window.NostrTools;

    // Definiert die Struktur des Cache-Objekts
    class NostrEventCache {
      constructor() {
        this.events = new Map();
        this.kindIndex = new Map();
        this.authorIndex = new Map();
      }

      // Methode zum Löschen eines Events
      deleteEvent(eventId) {
        const event = this.events.get(eventId);
        if (!event) {
          console.error("Event to delete not found:", eventId);
          return false;
        }

        // Entfernen des Events aus der Haupt-Map
        this.events.delete(eventId);

        // Entfernen des Events aus dem kindIndex
        if (event.kind && this.kindIndex.has(event.kind)) {
          const kindSet = this.kindIndex.get(event.kind);
          if (kindSet.has(event)) {
            kindSet.delete(event);
            // Wenn das Set leer ist, entferne den Eintrag aus der Map
            if (kindSet.size === 0) {
              this.kindIndex.delete(event.kind);
            }
          }
        }

        // Entfernen des Events aus dem authorIndex
        if (event.pubkey && this.authorIndex.has(event.pubkey)) {
          const authorSet = this.authorIndex.get(event.pubkey);
          if (authorSet.has(event)) {
            authorSet.delete(event);
            // Wenn das Set leer ist, entferne den Eintrag aus der Map
            if (authorSet.size === 0) {
              this.authorIndex.delete(event.pubkey);
            }
          }
        }

        console.log("Event deleted successfully:", eventId);
        return true;
      }


      // Methode in der NostrEventCache-Klasse
      // Methode in der NostrEventCache-Klasse
      updateEventAfterAsyncProcessing(eventId, updateFunction) {
        nostrCache.update(cache => {
          const event = cache.events.get(eventId);
          if (event) {
            // Hier führen wir die übergebene Update-Funktion aus, die das Event modifiziert
            updateFunction(event);

            // Setze das aktualisierte Event zurück in den Cache
            cache.events.set(eventId, event);
          }
          return cache;
        });
      }

      async fetchProfile(pubkey) {
        if (!pubkey) return;
        const profileEvents = this.getEventsByCriteria({
          kinds: [0],
          authors: [pubkey],
        });

        if (profileEvents.length > 0) {
          profileEvents.sort((a, b) => b.created_at - a.created_at);
          return profileEvents[0].profileData;
        }

      }

      async validateGithubIdent(username, pubkey, proof) {
        try {
          const gistUrl = `https://api.github.com/gists/${proof}`;

          const response = await fetch(gistUrl, { mode: 'cors' });
          const data = await response.json();

          const nPubKey = nip19.npubEncode(pubkey);

          const expectedText = `${nPubKey}`;

          for (const file in data.files) {
            if (data.files[file].content.includes(expectedText) &&
              data.files[file].raw_url.includes(username)) {
              console.log(username, "verified!");
              return true;
            }
          }

          return false;
        } catch (error) {
          console.error(`Error in validateGithubIdent: ${error}`);
          return false;
        }
      }

      // Hilfsmethode zur Verarbeitung von Profil-Events
      async processProfileEvent(event) {
        // Frühzeitige Rückkehr, wenn es sich nicht um ein Profil-Event handelt
        if (event.kind !== 0) {
          return;
        }

        // Versuchen, den Inhalt des Events zu parsen
        try {
          event.profileData = JSON.parse(event.content);
        } catch (e) {
          console.error("Fehler beim Parsen des Profil-Contents", e);
          event.profileData = {};
        }

        event.profileData.pubkey = event.pubkey;

        // Extrahieren der GitHub-Informationen aus den Tags
        event.verified = false;

        // GitHub-Verifikation ausführen, wenn vorhanden
        const githubTag = event.tags.find(tag => tag[0] === "i" && tag[1].startsWith("github:"));
        if (githubTag) {
          const githubParts = githubTag[1].split(":");
          event.profileData.githubUsername = githubParts[1];
          event.profileData.githubProof = githubTag[2];

          //helper function
          function updateProfileVerification(event, isValid) {
            event.profileData.verified = isValid;
          }

          // Rufe die validateGithubIdent-Funktion im Hintergrund auf
          this.validateGithubIdent(githubParts[1], event.pubkey, githubTag[2])
            .then(isValid => {
              this.updateEventAfterAsyncProcessing(event.id, event => updateProfileVerification(event, isValid));
            })
            .catch(error => {
              console.error("GitHub-Verifikation fehlgeschlagen", error);
            });
        }

        // Weitere spezifische Verarbeitung kann hier hinzugefügt werden
      }

      async processEncryptedMessage(event) {
        // Prüfen, ob es sich um eine verschlüsselte Nachricht handelt (kind 1059)
        if (event.kind !== 1059) {
          return;
        }

        try {
          // Zugriff auf den nostrManager Store
          let publicKey;
          nostrManager.subscribe(manager => {
            publicKey = manager.publicKey;
          })();

          if (!publicKey) {
            console.error("NostrManager public key is not available.");
            event.decryptedContent = null;
            return;
          }

          // Entschlüsseln der Nachricht
          let seal;
          let unsignedKind14;
          let decrypt;
          try
          {
            decrypt = await window.nostr.nip44.decrypt(event.pubkey, event.content);
            seal = await JSON.parse(decrypt);
            console.log("seal:", seal);
          } catch (error) {
            console.error("Error decrypting seal", event, error, decrypt);
          }

          try {
            unsignedKind14 = await JSON.parse(await window.nostr.nip44.decrypt(publicKey, seal.content));
            console.log("unsignedKind14:", unsignedKind14);
          } catch (error) {
            console.error("Error decrypting 14", seal, error);
          }

          // Speichern der entschlüsselten Nachricht im Event
          event.decryptedContent = unsignedKind14;
        } catch (error) {
          console.log("ErrorXL:", error, event);
          event = null;
        }
      }

      getDecryptedMessages() {
        let decryptedMessages = [];
        for (let event of this.events.values()) {
          if (event.decryptedContent) {
            decryptedMessages.push(event.decryptedContent);
          }
        }
        return decryptedMessages;
      }

      // Fügt ein Event hinzu oder aktualisiert es
      addOrUpdateEvent(event) {
        // Prüfen, ob das Event bereits existiert
        const existingEvent = this.events.get(event.id);

        if (!existingEvent) {
          this.processProfileEvent(event);
          this.processEncryptedMessage(event);

          // Add new event if it does not exist
          if (event) {
            this.events.set(event.id, event);
            console.log("Event Added:", event);
          }

          // Aktualisieren der kindIndex Map
          if (!this.kindIndex.has(event.kind)) {
            this.kindIndex.set(event.kind, new Set());
          }
          this.kindIndex.get(event.kind).add(event);

          // Aktualisieren der authorIndex Map
          if (!this.authorIndex.has(event.pubkey)) {
            this.authorIndex.set(event.pubkey, new Set());
          }
          this.authorIndex.get(event.pubkey).add(event);
        }
      }

      // Holt ein Event anhand seiner ID
      getEventById(eventId) {
        return this.events.get(eventId);
      }

      // Filtert Events basierend auf übergebenen Kriterien
      getEventsByCriteria(criteria) {
        let filteredEvents = new Set(this.events.values());

        // Nutzen der Indizes für 'kinds' und 'authors'
        if (criteria.kinds) {
          filteredEvents = new Set(
            criteria.kinds.flatMap(kind => Array.from(this.kindIndex.get(kind) || []))
          );
        }
        if (criteria.authors) {
          const authorFiltered = new Set(
            criteria.authors.flatMap(author => Array.from(this.authorIndex.get(author) || []))
          );
          filteredEvents = new Set([...filteredEvents].filter(event => authorFiltered.has(event)));
        }

        // Für Tags und weitere Filter den reduzierten Event-Satz durchsuchen
        if (criteria.tags) {
          filteredEvents = new Set([...filteredEvents].filter(event =>
            this.matchesCriteria(event, criteria)
          ));
        }

        return Array.from(filteredEvents);
      }

      // Hilfsmethode zur Überprüfung der Kriterienübereinstimmung
      matchesCriteria(event, criteria) {
        for (let key in criteria) {
          if (key === 'kinds' && !criteria.kinds.includes(event.kind)) {
            return false;
          }

          if (key === 'authors' && !criteria.authors.includes(event.pubkey)) {
            return false;
          }

          if (criteria.tags) {
            for (let tagKey in criteria.tags) {
              const tagValues = event.tags.filter(tag => tag[0] === tagKey).map(tag => tag[1]);
              // Überprüft, ob jeder Wert im Filter auch in der Tag-Liste ist
              if (!criteria.tags[tagKey].some(value => tagValues.includes(value))) {
                return false;
              }
            }
          }
        }

        return true;
      }
    }

    // Erstellt einen Svelte Store mit einer Instanz von NostrEventCache
    const cache = new NostrEventCache();
    const nostrCache = writable(cache);

    // Beispiel für eine Exportmethode, um ein Event hinzuzufügen oder zu aktualisieren
    const addOrUpdateEvent = (event) => {
      nostrCache.update(cache => {
        cache.addOrUpdateEvent(event);
        return cache;
      });
    };

    const deleteEventFromCache = (eventId) => {
      nostrCache.update(cache => {
        cache.deleteEvent(eventId);
        return cache;
      });
    };

    // RelayStore.js

    const relaysStore = writable([]);

    // NostrCacheManager.js
    const { SimplePool } = window.NostrTools;


    class NostrCacheManager {
        constructor(write_mode) {
            this.pool = new SimplePool();
            this.subscriptions = new Map();
            this.write_mode = write_mode;
            this.publicKey = null;
            this.relays = [];


            relaysStore.subscribe(value => {
                this.relays = value;
            });
        }

        async deleteEvent(event_id) {
            if (!event_id) {
                console.error("Event ID is required for deletion.");
                return;
            }

            if (!this.write_mode || !this.publicKey) {
                console.error("User must be logged in and in write mode to delete events.");
                return;
            }

            try {
                // Erzeugen des Lösch-Events für das angegebene Event
                const deleteTags = [["e", event_id]]; // Der Tag, der das zu löschende Event spezifiziert
                await this.sendEvent(5, "", deleteTags); // Senden des Lösch-Events
                console.log("Event deletion published:", event_id);

                // Aufruf der Methode aus dem NostrEventCache, um das Event aus dem Cache zu entfernen
                deleteEventFromCache(event_id);
                console.log("Event removed from cache:", event_id);
            } catch (error) {
                console.error("Error deleting the event:", error);
            }
        }

        updateRelays(new_relays) {
            relaysStore.set(new_relays);
            // console.log("new relays:", new_relays);
        }

        async getPublicRelaysString() {
            return ["wss://relay.damus.io",
                "wss://nostr-pub.wellorder.net"];
        }

        async initialize() {
            let useExtension = await this.extensionAvailable();
            console.log("useExtension2:", useExtension);
            console.log("writeMode:", this.write_mode);
            if (this.write_mode && useExtension) {
                this.publicKey = await window.nostr.getPublicKey();
                console.log("publicKey:", this.publicKey);
            }
            else {
                this.write_mode = false;
                this.publicKey = null;
            }
        }

        async extensionAvailable() {
            if ("nostr" in window) {
                return true;
            }
            return false;
        }

        uniqueTags(tags) {
            // Convert each tag array to a string and put it in a set.
            const tagSet = new Set(tags.map(tag => JSON.stringify(tag)));

            // Convert the set back to an array of arrays.
            const uniqueTags = Array.from(tagSet).map(tagStr => JSON.parse(tagStr));

            return uniqueTags;
        }

        async sendEvent(kind, content, tags) {
            if (!this.write_mode) return; // Do nothing in read-only mode
            if (!this.extensionAvailable()) return;

            let event = {
                pubkey: this.publicKey,
                created_at: Math.floor(Date.now() / 1000),
                kind,
                content,
                tags,
            };

            //event.tags.push(["s", "bitspark"]);
            event = await window.nostr.signEvent(event);

            event.tags = this.uniqueTags(event.tags);
            this.pool.publish(this.relays, event);
            // console.log("send event:", event);
            // console.log("used relays:", this.relays);
            return event.id;
        }

        async sendAnonEvent(kind, content, tags, anonPrivateKey, anonPublicKey) {
            // Generiere einen zufälligen privaten Schlüssel
            let event = {
                pubkey: anonPublicKey,
                created_at: Math.floor(Date.now() / 1000),
                kind,
                content,
                tags,
            };

            // Signiere das Event mit dem zufälligen privaten Schlüssel
            
            event.tags = this.uniqueTags(event.tags);
            event = window.NostrTools.finalizeEvent(event, anonPrivateKey);
            
            this.pool.publish(this.relays, event);
            console.log("send anon event:", event);
            // console.log("used relays:", this.relays);
            return event.id;
        }

        // Methode zum Abonnieren von Events mit Fehlerbehandlung
        subscribeToEvents(criteria) {
            const subscriptionKey = this.generateSubscriptionKey(criteria);

            if (this.subscriptions.has(subscriptionKey)) {
                //console.warn('Subscription for these criteria already exists.');
                return;
            } else {
                console.log('Subscription:', criteria);
            }

            try {
                const sub = this.pool.subscribeMany(
                    this.relays,
                    [criteria],
                    {
                        onevent: (event) => {
                            try {
                                addOrUpdateEvent(event);
                            } catch (error) {
                                console.error('Error updating event in store:', error);
                            }
                        },
                        onclose: () => {
                            console.log(`Sub ${subscriptionKey} closed.`);
                            this.subscriptions.delete(subscriptionKey);
                        }
                    }
                );
                this.subscriptions.set(subscriptionKey, sub);
            } catch (error) {
                console.error('Failed to subscribe to events:', error);
                return;
            }
        }

        unsubscribeEvent(criteria) {
            const subscriptionKey = this.generateSubscriptionKey(criteria);

            // Check if a subscription exists for these criteria.
            if (this.subscriptions.has(subscriptionKey)) {
                try {
                    // Close the subscription and remove it from the subscriptions map.
                    this.subscriptions.get(subscriptionKey).close();
                    this.subscriptions.delete(subscriptionKey);
                    console.log(`Unsubscribed successfully from criteria: ${subscriptionKey}`);
                } catch (error) {
                    console.error('Error unsubscribing:', error);
                }
            }
        }

        unsubscribeAll() {
            this.subscriptions.forEach(sub => {
                try {
                    sub.close();
                } catch (error) {
                    console.error('Error closing subscription:', error);
                }
            });
            this.subscriptions.clear();
        }

        // Generiert einen eindeutigen Schlüssel für die Subscription
        generateSubscriptionKey(criteria) {
            return JSON.stringify(criteria);
        }

        // Methode zum Beenden aller Abonnements

    }

    // NostrManagerStore.js

    // Erstellen des Svelte Stores
    const nostrManager = writable(null);

    // Asynchrone Initialisierung des NostrCacheManager
    async function initializeNostrManager(login, init) {
      let currentValue;
      nostrManager.subscribe(value => {
        currentValue = value;
      })(); // Abonnieren und sofort kündigen, um den aktuellen Wert zu erhalten
      
      if (!init || currentValue === null) {  // Überprüfe, ob der aktuelle Wert des Stores null ist
        const manager = new NostrCacheManager(login);
        manager.updateRelays(['wss://relay.damus.io', 'wss://relay.plebstr.com', 'wss://nostr.wine']);
        await manager.initialize();
        nostrManager.set(manager); // Setzen des Stores erst nach der Initialisierung
      }
    }

    // Aufruf der Initialisierungsfunktion
    //initializeNostrManager(true);

    // src/constants/nostrKinds.js

    const idea_categories = [
        "Art & Design",
        "Bitcoin & P2P",
        "Comics & Graphic Novels",
        "Crafts & DIY",
        "Fashion & Beauty",
        "Film, Video & Animation",
        "Food & Beverages",
        "Games & Gaming",
        "Health & Fitness",
        "Journalism & News",
        "Music & Audio",
        "Photography & Visual Arts",
        "Publishing & Writing",
        "Technology & Software",
        "Education & Learning",
        "Environment & Sustainability",
        "Sports & Outdoors",
        "Travel & Tourism",
        "Non-Profit & Social Causes",
        "Business & Entrepreneurship",
        "Science & Research",
        "Home & Lifestyle",
        "Automotive & Transportation",
        "Pets & Animals",
        "Parenting & Family",
    ];

    const job_categories = [
        "Frontend",
        "Backend",
    ];

    const coding_language = [
        "Python",
        "c++",
        "svelte",
        "css",
    ];

    var css_248z$C = ".toggle-button.svelte-ajm12u.svelte-ajm12u{display:flex;justify-content:center;align-items:center}.menu-card.svelte-ajm12u.svelte-ajm12u{width:200px;margin-top:80px;color:#000;position:relative}.menu-item.svelte-ajm12u.svelte-ajm12u{color:#103f70;font-size:1rem;padding:15px;padding-left:30px;cursor:pointer;transition:color 0.3s;display:block;text-decoration:none;outline:none;width:200px;text-align:left}.menu-item.svelte-ajm12u.svelte-ajm12u:hover{color:#eb6f1a;text-decoration:none;outline:none}.category-style.svelte-ajm12u.svelte-ajm12u{font-size:1rem;padding:15px;padding-left:15px;cursor:pointer;transition:color 0.3s;display:block;text-decoration:none;color:#494949;outline:none;width:200px;text-align:left}.category-style.svelte-ajm12u.svelte-ajm12u:hover{color:#60adff;text-decoration:none;outline:none}.categories-wrapper.svelte-ajm12u.svelte-ajm12u{position:fixed;left:180px;background:#d1d1d1;width:310px;max-height:100vh;height:100vh;padding:10px 0;box-shadow:0px 10px 30px -5px rgba(0, 0, 0, 0.3);border-radius:20px;transition:opacity 0.3s,\n            visibility 0.3s;opacity:1;visibility:visible;z-index:50;padding-top:14px;padding-bottom:14px}.categories-wrapper.hidden.svelte-ajm12u.svelte-ajm12u{opacity:0;visibility:hidden}.categories-outer.svelte-ajm12u.svelte-ajm12u{width:100%;max-height:100%;overflow-y:auto;border-radius:20px}.categories.svelte-ajm12u.svelte-ajm12u{width:100%}.categories.hidden.svelte-ajm12u.svelte-ajm12u{opacity:0;visibility:hidden}.category-item.svelte-ajm12u.svelte-ajm12u{color:#000;padding:10px 15px;cursor:pointer;transition:color 0.3s}.category-item.svelte-ajm12u.svelte-ajm12u:hover{color:#007bff}.hide.svelte-ajm12u.svelte-ajm12u{display:none}.button-container.svelte-ajm12u.svelte-ajm12u{position:fixed;top:0;left:0;z-index:11;background-color:#33333300;display:flex;justify-content:center;align-items:center;border-radius:10%;padding:5px;margin:10px}svg.svelte-ajm12u path.svelte-ajm12u{fill:#f97316}.menu-container.svelte-ajm12u.svelte-ajm12u{position:fixed;top:0;left:0;width:200px;min-width:200px;z-index:10;flex-basis:200px;background-color:rgba(255, 255, 255, 0.7);opacity:3.7;height:100vh;overflow-y:auto;transform:translateX(-100%);transition:transform 0.3s ease-in-out}.menu-container.show.svelte-ajm12u.svelte-ajm12u{transform:translateX(0)}button.svelte-ajm12u.svelte-ajm12u:focus{outline:none}.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar{width:10px;height:10px}.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-track{background:#f1f1f1;border-radius:20px}.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-thumb{background:#888;border-radius:20px}.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-thumb:hover{background:#555}.categories.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar{width:10px}.categories.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-track{background:#f1f1f1}.categories.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-thumb{background:#888;border-radius:20px}.categories.svelte-ajm12u.svelte-ajm12u::-webkit-scrollbar-thumb:hover{background:#555}.divider-line.svelte-ajm12u.svelte-ajm12u{margin-left:12%;border-top:1px solid #d1d1d1;padding:1px;width:76%}";
    styleInject(css_248z$C);

    /* src/components/Sidebar/Sidebar.svelte generated by Svelte v3.59.1 */

    function get_each_context$g(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[35] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    // (202:12) {#if $menuState.logged_in}
    function create_if_block_2$3(ctx) {
    	let hr;
    	let t0;
    	let li0;
    	let button0;
    	let i0;
    	let t1;
    	let t2;
    	let li1;
    	let button1;
    	let i1;
    	let t3;
    	let t4;
    	let li2;
    	let button2;
    	let i2;
    	let t5;
    	let t6;
    	let li3;
    	let button3;
    	let i3;
    	let t7;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			hr = element("hr");
    			t0 = space();
    			li0 = element("li");
    			button0 = element("button");
    			i0 = element("i");
    			t1 = text(" Profile");
    			t2 = space();
    			li1 = element("li");
    			button1 = element("button");
    			i1 = element("i");
    			t3 = text(" Messages");
    			t4 = space();
    			li2 = element("li");
    			button2 = element("button");
    			i2 = element("i");
    			t5 = text(" Edit Profile");
    			t6 = space();
    			li3 = element("li");
    			button3 = element("button");
    			i3 = element("i");
    			t7 = text("\n                        Job Manager");
    			attr(hr, "class", "divider-line svelte-ajm12u");
    			attr(i0, "class", "fas fa-user svelte-ajm12u");
    			set_style(i0, "color", "#223d6d");
    			set_style(i0, "margin-right", "10px");
    			attr(button0, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li0, "class", "svelte-ajm12u");
    			attr(i1, "class", "fas fa-envelope svelte-ajm12u");
    			set_style(i1, "color", "#223d6d");
    			set_style(i1, "margin-right", "10px");
    			attr(button1, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li1, "class", "svelte-ajm12u");
    			attr(i2, "class", "fas fa-cog svelte-ajm12u");
    			set_style(i2, "color", "#223d6d");
    			set_style(i2, "margin-right", "10px");
    			attr(button2, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li2, "class", "svelte-ajm12u");
    			attr(i3, "class", "fas fa-briefcase svelte-ajm12u");
    			set_style(i3, "color", "#223d6d");
    			set_style(i3, "margin-right", "10px");
    			attr(button3, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li3, "class", "svelte-ajm12u");
    		},
    		m(target, anchor) {
    			insert(target, hr, anchor);
    			insert(target, t0, anchor);
    			insert(target, li0, anchor);
    			append(li0, button0);
    			append(button0, i0);
    			append(button0, t1);
    			insert(target, t2, anchor);
    			insert(target, li1, anchor);
    			append(li1, button1);
    			append(button1, i1);
    			append(button1, t3);
    			insert(target, t4, anchor);
    			insert(target, li2, anchor);
    			append(li2, button2);
    			append(button2, i2);
    			append(button2, t5);
    			insert(target, t6, anchor);
    			insert(target, li3, anchor);
    			append(li3, button3);
    			append(button3, i3);
    			append(button3, t7);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler_3*/ ctx[22]),
    					listen(button1, "click", /*click_handler_4*/ ctx[23]),
    					listen(button2, "click", /*click_handler_5*/ ctx[24]),
    					listen(button3, "click", /*click_handler_6*/ ctx[25])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(hr);
    			if (detaching) detach(t0);
    			if (detaching) detach(li0);
    			if (detaching) detach(t2);
    			if (detaching) detach(li1);
    			if (detaching) detach(t4);
    			if (detaching) detach(li2);
    			if (detaching) detach(t6);
    			if (detaching) detach(li3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (281:16) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let i;
    	let t0;
    	let t1;
    	let style;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			i = element("i");
    			t0 = text(" Login");
    			t1 = space();
    			style = element("style");
    			style.textContent = "/* Füge den rechten Rand zum Pfeilsymbol hinzu */\n                        .arrow-right-border::after {\n                            content: \"\";\n                            display: block;\n                            width: 10px; /* Passe die Breite des Randes an */\n                            height: 24px; /* Passe die Höhe des Randes an */\n                            background-color: #223d6d; /* Passe die Farbe des Randes an */\n                            position: absolute;\n                            right: -10px; /* Ändere den Abstand zum Pfeilsymbol */\n                            top: 0;\n                        }";
    			attr(i, "class", "fas fa-arrow-right svelte-ajm12u");
    			set_style(i, "color", "#223d6d");
    			set_style(i, "margin-right", "10px");
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(style, "class", "svelte-ajm12u");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, i);
    			append(button, t0);
    			insert(target, t1, anchor);
    			insert(target, style, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*login*/ ctx[16]),
    					listen(button, "keydown", /*login*/ ctx[16])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			if (detaching) detach(t1);
    			if (detaching) detach(style);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (270:47) 
    function create_if_block_1$7(ctx) {
    	let button;
    	let i;
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			i = element("i");
    			t = text(" Logout");
    			attr(i, "class", "fas fa-arrow-left svelte-ajm12u");
    			set_style(i, "color", "#223d6d");
    			set_style(i, "margin-right", "10px");
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, i);
    			append(button, t);

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*logout*/ ctx[17]),
    					listen(button, "keydown", /*logout*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (259:16) {#if !$menuState.use_extension}
    function create_if_block$o(ctx) {
    	let button;
    	let i;
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			t1 = text(optionText);
    			attr(i, "class", "fas fa-puzzle-piece svelte-ajm12u");
    			set_style(i, "color", "#223d6d");
    			set_style(i, "margin-right", "10px");
    			attr(button, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, i);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_7*/ ctx[26]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (335:12) {#each idea_categories as category}
    function create_each_block_1$2(ctx) {
    	let button;
    	let t_value = /*category*/ ctx[36] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_8() {
    		return /*click_handler_8*/ ctx[27](/*category*/ ctx[36]);
    	}

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "" + (null_to_empty(categoryStyle) + " svelte-ajm12u"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler_8);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (355:12) {#each tutorial_titles as tutorial, index}
    function create_each_block$g(ctx) {
    	let button;
    	let t_value = /*tutorial*/ ctx[33] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_9() {
    		return /*click_handler_9*/ ctx[28](/*index*/ ctx[35]);
    	}

    	return {
    		c() {
    			button = element("button");
    			t = text(t_value);
    			attr(button, "class", "" + (null_to_empty(categoryStyle) + " svelte-ajm12u"));
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler_9);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$W(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let div4;
    	let div3;
    	let ul;
    	let li0;
    	let button1;
    	let i0;
    	let t1;
    	let t2;
    	let div1;
    	let button2;
    	let i1;
    	let t3;
    	let t4;
    	let hr0;
    	let t5;
    	let li1;
    	let button3;
    	let i2;
    	let t6;
    	let t7;
    	let li2;
    	let button4;
    	let i3;
    	let t8;
    	let t9;
    	let t10;
    	let li3;
    	let hr1;
    	let t11;
    	let t12;
    	let li4;
    	let hr2;
    	let t13;
    	let div2;
    	let span;
    	let i4;
    	let t14;
    	let t15;
    	let div7;
    	let div6;
    	let div5;
    	let div7_class_value;
    	let t16;
    	let div10;
    	let div9;
    	let div8;
    	let div10_class_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$menuState*/ ctx[0].logged_in && create_if_block_2$3(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*$menuState*/ ctx[0].use_extension) return create_if_block$o;
    		if (/*$menuState*/ ctx[0].logged_in) return create_if_block_1$7;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let each_value_1 = idea_categories;
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*tutorial_titles*/ ctx[7];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$g(get_each_context$g(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 2 16 14" class="svelte-ajm12u"><path d="M1 3h14a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2zm0 5h14a1 1 0 0 1 0 2H1a1 1 0 0 1 0-2z" class="svelte-ajm12u"></path></svg>`;
    			t0 = space();
    			div4 = element("div");
    			div3 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			button1 = element("button");
    			i0 = element("i");
    			t1 = text("\n                    Home");
    			t2 = space();
    			div1 = element("div");
    			button2 = element("button");
    			i1 = element("i");
    			t3 = text(" Categories");
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			li1 = element("li");
    			button3 = element("button");
    			i2 = element("i");
    			t6 = text(" Spark Idea");
    			t7 = space();
    			li2 = element("li");
    			button4 = element("button");
    			i3 = element("i");
    			t8 = text("\n                    Job Market");
    			t9 = space();
    			if (if_block0) if_block0.c();
    			t10 = space();
    			li3 = element("li");
    			hr1 = element("hr");
    			t11 = space();
    			if_block1.c();
    			t12 = space();
    			li4 = element("li");
    			hr2 = element("hr");
    			t13 = space();
    			div2 = element("div");
    			span = element("span");
    			i4 = element("i");
    			t14 = text(" Tutorials");
    			t15 = space();
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t16 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div8 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(button0, "class", "toggle-button svelte-ajm12u");
    			attr(div0, "class", "button-container svelte-ajm12u");
    			attr(i0, "class", "fas fa-home svelte-ajm12u");
    			set_style(i0, "color", "#223d6d");
    			set_style(i0, "margin-right", "10px");
    			attr(button1, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(i1, "class", "fas fa-list svelte-ajm12u");
    			set_style(i1, "color", "#223d6d");
    			set_style(i1, "margin-right", "11px");
    			attr(button2, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(div1, "class", "svelte-ajm12u");
    			attr(li0, "class", "svelte-ajm12u");
    			attr(hr0, "class", "divider-line svelte-ajm12u");
    			attr(i2, "class", "fas fa-fire svelte-ajm12u");
    			set_style(i2, "color", "#223d6d");
    			set_style(i2, "margin-right", "12px");
    			attr(button3, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li1, "class", "svelte-ajm12u");
    			attr(i3, "class", "fas fa-search svelte-ajm12u");
    			set_style(i3, "color", "#223d6d");
    			set_style(i3, "margin-right", "10px");
    			attr(button4, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(li2, "class", "svelte-ajm12u");
    			attr(hr1, "class", "divider-line svelte-ajm12u");
    			attr(li3, "class", "svelte-ajm12u");
    			attr(hr2, "class", "divider-line svelte-ajm12u");
    			attr(i4, "class", "fas fa-graduation-cap svelte-ajm12u");
    			set_style(i4, "color", "#223d6d");
    			set_style(i4, "margin-right", "8px");
    			attr(span, "class", "" + (null_to_empty(linkStyle) + " svelte-ajm12u"));
    			attr(div2, "class", "svelte-ajm12u");
    			attr(li4, "class", "svelte-ajm12u");
    			attr(ul, "class", "flex flex-col items-start svelte-ajm12u");
    			attr(div3, "class", "menu-card svelte-ajm12u");
    			attr(div4, "class", "menu-container svelte-ajm12u");
    			toggle_class(div4, "show", /*$sidebarOpen*/ ctx[4]);
    			attr(div5, "class", "categories svelte-ajm12u");
    			attr(div6, "class", "categories-outer svelte-ajm12u");

    			attr(div7, "class", div7_class_value = "" + (null_to_empty(/*showCategories*/ ctx[1]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-ajm12u"));

    			attr(div8, "class", "categories svelte-ajm12u");
    			attr(div9, "class", "categories-outer svelte-ajm12u");

    			attr(div10, "class", div10_class_value = "" + (null_to_empty(/*showTutorials*/ ctx[2]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-ajm12u"));
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, button0);
    			insert(target, t0, anchor);
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, ul);
    			append(ul, li0);
    			append(li0, button1);
    			append(button1, i0);
    			append(button1, t1);
    			append(li0, t2);
    			append(li0, div1);
    			append(div1, button2);
    			append(button2, i1);
    			append(button2, t3);
    			append(ul, t4);
    			append(ul, hr0);
    			append(ul, t5);
    			append(ul, li1);
    			append(li1, button3);
    			append(button3, i2);
    			append(button3, t6);
    			append(ul, t7);
    			append(ul, li2);
    			append(li2, button4);
    			append(button4, i3);
    			append(button4, t8);
    			append(ul, t9);
    			if (if_block0) if_block0.m(ul, null);
    			append(ul, t10);
    			append(ul, li3);
    			append(li3, hr1);
    			append(li3, t11);
    			if_block1.m(li3, null);
    			append(ul, t12);
    			append(ul, li4);
    			append(li4, hr2);
    			append(li4, t13);
    			append(li4, div2);
    			append(div2, span);
    			append(span, i4);
    			append(span, t14);
    			insert(target, t15, anchor);
    			insert(target, div7, anchor);
    			append(div7, div6);
    			append(div6, div5);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div5, null);
    				}
    			}

    			insert(target, t16, anchor);
    			insert(target, div10, anchor);
    			append(div10, div9);
    			append(div9, div8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div8, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*toggleSidebar*/ ctx[5]),
    					listen(button1, "click", /*click_handler*/ ctx[19]),
    					listen(div1, "mouseover", /*handleCatMouseOver*/ ctx[8]),
    					listen(div1, "mouseout", /*handleCatMouseOut*/ ctx[10]),
    					listen(div1, "focus", /*handleCatFocus*/ ctx[12]),
    					listen(div1, "blur", /*handleCatBlur*/ ctx[14]),
    					listen(button3, "click", /*click_handler_1*/ ctx[20]),
    					listen(button4, "click", /*click_handler_2*/ ctx[21]),
    					listen(div2, "mouseover", /*handleTutMouseOver*/ ctx[9]),
    					listen(div2, "mouseout", /*handleTutMouseOut*/ ctx[11]),
    					listen(div2, "focus", /*handleTutFocus*/ ctx[13]),
    					listen(div2, "blur", /*handleTutBlur*/ ctx[15]),
    					listen(div7, "mouseover", /*handleCatMouseOver*/ ctx[8]),
    					listen(div7, "mouseout", /*handleCatMouseOut*/ ctx[10]),
    					listen(div7, "focus", /*handleCatFocus*/ ctx[12]),
    					listen(div7, "blur", /*handleCatBlur*/ ctx[14]),
    					listen(div10, "mouseover", /*handleTutMouseOver*/ ctx[9]),
    					listen(div10, "mouseout", /*handleTutMouseOut*/ ctx[11]),
    					listen(div10, "focus", /*handleTutFocus*/ ctx[13]),
    					listen(div10, "blur", /*handleTutBlur*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*$menuState*/ ctx[0].logged_in) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					if_block0.m(ul, t10);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(li3, null);
    				}
    			}

    			if (dirty[0] & /*$sidebarOpen*/ 16) {
    				toggle_class(div4, "show", /*$sidebarOpen*/ ctx[4]);
    			}

    			if (dirty & /*categoryStyle, navigate, idea_categories*/ 0) {
    				each_value_1 = idea_categories;
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div5, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*showCategories*/ 2 && div7_class_value !== (div7_class_value = "" + (null_to_empty(/*showCategories*/ ctx[1]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-ajm12u"))) {
    				attr(div7, "class", div7_class_value);
    			}

    			if (dirty[0] & /*tutorial_titles*/ 128) {
    				each_value = /*tutorial_titles*/ ctx[7];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$g(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$g(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*showTutorials*/ 4 && div10_class_value !== (div10_class_value = "" + (null_to_empty(/*showTutorials*/ ctx[2]
    			? "categories-wrapper"
    			: "categories-wrapper hidden") + " svelte-ajm12u"))) {
    				attr(div10, "class", div10_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (detaching) detach(t0);
    			if (detaching) detach(div4);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (detaching) detach(t15);
    			if (detaching) detach(div7);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach(t16);
    			if (detaching) detach(div10);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    let optionText = "getAlby";
    let linkStyle = "block menu-item";
    let categoryStyle = "category-style";

    function instance$V($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $menuState;
    	let $nostrManager;
    	let $contentContainerClass;
    	let $sidebarOpen;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(18, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(3, $nostrManager = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(30, $contentContainerClass = $$value));
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(4, $sidebarOpen = $$value));

    	function toggleSidebar() {
    		sidebarOpen.update(value => !value);
    		console.log("Sidebar state:", $sidebarOpen);
    		console.log("contentContainerClass state:", $contentContainerClass);
    	}

    	const menuState = writable({ logged_in: false, use_extension: false });
    	component_subscribe($$self, menuState, value => $$invalidate(0, $menuState = value));
    	let tutorial_titles = tutorials.map(tutorial => tutorial.title);
    	let showCategories = false;
    	let showTutorials = false;
    	let timeoutId;

    	function handleCatMouseOver() {
    		clearTimeout(timeoutId);
    		$$invalidate(1, showCategories = true);
    	}

    	function handleTutMouseOver() {
    		clearTimeout(timeoutId);
    		$$invalidate(2, showTutorials = true);
    	}

    	function handleCatMouseOut() {
    		timeoutId = setTimeout(
    			() => {
    				$$invalidate(1, showCategories = false);
    			},
    			200
    		); // 200ms delay before hiding categories
    	}

    	function handleTutMouseOut() {
    		timeoutId = setTimeout(
    			() => {
    				$$invalidate(2, showTutorials = false);
    			},
    			200
    		); // 200ms delay before hiding categories
    	}

    	function handleCatFocus() {
    		$$invalidate(1, showCategories = true);
    	}

    	function handleTutFocus() {
    		$$invalidate(2, showTutorials = true);
    	}

    	function handleCatBlur() {
    		$$invalidate(1, showCategories = false);
    	}

    	function handleTutBlur() {
    		$$invalidate(2, showTutorials = false);
    	}

    	async function login() {
    		console.log("Logging in...");
    		await initializeNostrManager(true, false);
    		let login_success = $nostrManager.publicKey !== null;

    		if (login_success) {
    			$nostrManager.subscribeToEvents({
    				kinds: [10002],
    				authors: [$nostrManager.publicKey]
    			});

    			updateRelays();
    		}

    		menuState.update(state => ({ ...state, logged_in: login_success }));
    	}

    	function updateRelays() {
    		if ($nostrManager && $nostrManager.publicKey !== null) {
    			let relayEvents = $nostrCache.getEventsByCriteria({
    				kinds: [10002],
    				authors: [$nostrManager.publicKey]
    			});

    			if (relayEvents.length > 0) {
    				relayEvents.sort((a, b) => b.created_at - a.created_at);
    				let relay = relayEvents[0];
    				relay = relay.tags.filter(tag => tag[0] === "r").map(tag => tag[1]);
    				$nostrManager.updateRelays(relay);
    			}
    		}
    	}

    	async function logout() {
    		console.log("Logging out...");
    		await initializeNostrManager(false, false);
    		menuState.update(state => ({ ...state, logged_in: false }));
    	}

    	onMount(async () => {
    		await initializeNostrManager(false, true);
    		const loggedIn = $nostrManager.publicKey != null;
    		console.log("Logged in:", loggedIn);
    		const usingExtension = await $nostrManager.extensionAvailable();

    		menuState.set({
    			logged_in: loggedIn,
    			use_extension: usingExtension
    		});
    	});

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll();
    	});

    	function print_menu_state() {
    		console.log($menuState);
    	}

    	const click_handler = () => navigate("/");
    	const click_handler_1 = () => navigate("/postidea");
    	const click_handler_2 = () => navigate("/jobmarket");
    	const click_handler_3 = () => navigate(`/profile/${$nostrManager.publicKey}`);
    	const click_handler_4 = () => navigate(`/dm`);
    	const click_handler_5 = () => navigate(`/edit_profile/${$nostrManager.publicKey}`);
    	const click_handler_6 = () => navigate("/jobmanager");
    	const click_handler_7 = () => navigate("https://getalby.com/");
    	const click_handler_8 = category => navigate(`/overview/${category}`);
    	const click_handler_9 = index => navigate(`/tutorial/${index}`);

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$menuState*/ 1) ;

    		if ($$self.$$.dirty[0] & /*$menuState*/ 1) {
    			(print_menu_state(), $menuState);
    		}

    		if ($$self.$$.dirty[0] & /*$nostrCache*/ 262144) {
    			(updateRelays());
    		}
    	};

    	return [
    		$menuState,
    		showCategories,
    		showTutorials,
    		$nostrManager,
    		$sidebarOpen,
    		toggleSidebar,
    		menuState,
    		tutorial_titles,
    		handleCatMouseOver,
    		handleTutMouseOver,
    		handleCatMouseOut,
    		handleTutMouseOut,
    		handleCatFocus,
    		handleTutFocus,
    		handleCatBlur,
    		handleTutBlur,
    		login,
    		logout,
    		$nostrCache,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9
    	];
    }

    class Sidebar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$V, create_fragment$W, safe_not_equal, {}, null, [-1, -1]);
    	}
    }

    /* src/components/Banner.svelte generated by Svelte v3.59.1 */

    function create_if_block$n(ctx) {
    	let p0;
    	let t1;
    	let p1;

    	return {
    		c() {
    			p0 = element("p");
    			p0.textContent = "ignite ideas.";
    			t1 = space();
    			p1 = element("p");
    			p1.innerHTML = `ignite <span class="text-orange-500">change</span>.`;
    			attr(p0, "class", "text-5xl leading-tight");
    			set_style(p0, "opacity", "0.3");
    			set_style(p0, "margin-bottom", "-0.4rem");
    			attr(p1, "class", "text-5xl leading-tight");
    			set_style(p1, "opacity", "1");
    			set_style(p1, "margin-left", "-2.8rem");
    		},
    		m(target, anchor) {
    			insert(target, p0, anchor);
    			insert(target, t1, anchor);
    			insert(target, p1, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(p0);
    			if (detaching) detach(t1);
    			if (detaching) detach(p1);
    		}
    	};
    }

    function create_fragment$V(ctx) {
    	let section;
    	let div5;
    	let span0;
    	let t0;
    	let div4;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let t2;
    	let h2;
    	let span1;
    	let t3;
    	let t4;
    	let div3;
    	let div2;
    	let t5;
    	let svg;
    	let polygon;
    	let if_block = /*show_right_text*/ ctx[3] && create_if_block$n();

    	return {
    		c() {
    			section = element("section");
    			div5 = element("div");
    			span0 = element("span");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t1 = text(/*title*/ ctx[0]);
    			t2 = space();
    			h2 = element("h2");
    			span1 = element("span");
    			t3 = text(/*subtitle*/ ctx[2]);
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block) if_block.c();
    			t5 = space();
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			attr(span0, "id", "blackOverlay");
    			attr(span0, "class", "w-full h-full absolute opacity-50 bg-black");
    			attr(h1, "class", "text-8xl font-bold text-white mr-4 mb-0;");
    			attr(span1, "class", "ml-2");
    			attr(h2, "class", "text-4xl font-light text-white mt-0");
    			set_style(h2, "line-height", "0.9");
    			attr(div0, "class", /*titleClass*/ ctx[4]);
    			attr(div1, "class", "flex flex-col items-start");
    			set_style(div1, "margin-top", "10rem");
    			set_style(div1, "margin-left", "10rem");
    			attr(div2, "class", "text-4xl font-light text-white");
    			attr(div3, "class", "absolute right-4 flex justify-end");
    			set_style(div3, "top", "4rem");
    			attr(div4, "class", "absolute left-0 right-0 top-1/2 transform -translate-y-1/2 px-4 flex flex-col items-start justify-center h-full");
    			attr(polygon, "class", "color-for-bg fill-current diagonal-cut");
    			attr(polygon, "points", "2560 0 2560 80 0 80");
    			attr(svg, "class", "diagonal-cut");
    			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr(svg, "preserveAspectRatio", "xMinYMin meet");
    			attr(svg, "version", "1.1");
    			attr(svg, "viewBox", "0 0 2560 80");
    			attr(svg, "x", "0");
    			attr(svg, "y", "0");
    			attr(div5, "class", "absolute top-0 w-full h-full bg-center bg-cover");
    			set_style(div5, "background-image", "url(" + /*bannerImage*/ ctx[1] + ")");
    			attr(section, "class", "relative block h-500-px");
    		},
    		m(target, anchor) {
    			insert(target, section, anchor);
    			append(section, div5);
    			append(div5, span0);
    			append(div5, t0);
    			append(div5, div4);
    			append(div4, div1);
    			append(div1, div0);
    			append(div0, h1);
    			append(h1, t1);
    			append(div0, t2);
    			append(div0, h2);
    			append(h2, span1);
    			append(span1, t3);
    			append(div4, t4);
    			append(div4, div3);
    			append(div3, div2);
    			if (if_block) if_block.m(div2, null);
    			append(div5, t5);
    			append(div5, svg);
    			append(svg, polygon);
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data(t1, /*title*/ ctx[0]);
    			if (dirty & /*subtitle*/ 4) set_data(t3, /*subtitle*/ ctx[2]);

    			if (dirty & /*titleClass*/ 16) {
    				attr(div0, "class", /*titleClass*/ ctx[4]);
    			}

    			if (/*show_right_text*/ ctx[3]) {
    				if (if_block) ; else {
    					if_block = create_if_block$n();
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*bannerImage*/ 2) {
    				set_style(div5, "background-image", "url(" + /*bannerImage*/ ctx[1] + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(section);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$U($$self, $$props, $$invalidate) {
    	let $sidebarOpen;
    	component_subscribe($$self, sidebarOpen, $$value => $$invalidate(5, $sidebarOpen = $$value));
    	let { title } = $$props;
    	let { bannerImage } = $$props;
    	let { subtitle } = $$props;
    	let { show_right_text = false } = $$props;
    	let titleClass = "title-class";

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('bannerImage' in $$props) $$invalidate(1, bannerImage = $$props.bannerImage);
    		if ('subtitle' in $$props) $$invalidate(2, subtitle = $$props.subtitle);
    		if ('show_right_text' in $$props) $$invalidate(3, show_right_text = $$props.show_right_text);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$sidebarOpen*/ 32) {
    			{
    				if ($sidebarOpen) {
    					$$invalidate(4, titleClass = "title-class sidebar-open");
    				} else {
    					$$invalidate(4, titleClass = "title-class");
    				}
    			}
    		}
    	};

    	return [title, bannerImage, subtitle, show_right_text, titleClass, $sidebarOpen];
    }

    class Banner extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$U, create_fragment$V, safe_not_equal, {
    			title: 0,
    			bannerImage: 1,
    			subtitle: 2,
    			show_right_text: 3
    		});
    	}
    }

    /* src/components/Footers/Footer.svelte generated by Svelte v3.59.1 */

    function create_fragment$U(ctx) {
    	let footer;

    	return {
    		c() {
    			footer = element("footer");

    			footer.innerHTML = `<div class="container mx-auto px-4"><div class="flex flex-wrap items-center md:justify-between justify-center"><div class="w-full px-4"><ul class="flex flex-wrap list-none md:justify-center justify-center"><li><a href="https://lightning.network/lightning-network-paper.pdf" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Lightning</a></li> 
          <li><a href="https://nostr.com/" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Nostr</a></li> 
          <li><a href="https://getalby.com/" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Powered by Alby</a></li> 
          <li><a href="https://www.creative-tim.com?ref=ns-footer-admin" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">Creative Tim</a></li> 
          <li><a href="https://github.com/creativetimofficial/notus-svelte/blob/main/LICENSE.md?ref=ns-footer-admin" class="text-blueGray-600 hover:text-blueGray-800 text-sm font-semibold block py-1 px-3">MIT License</a></li></ul></div></div></div>`;

    			attr(footer, "class", "block py-4 footer");
    			attr(footer, "id", "myFooter");
    		},
    		m(target, anchor) {
    			insert(target, footer, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(footer);
    		}
    	};
    }

    function instance$T($$self) {
    	new Date().getFullYear();
    	return [];
    }

    class Footer extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$T, create_fragment$U, safe_not_equal, {});
    	}
    }

    var css_248z$B = ".profile-image.svelte-1281914{width:50px;height:50px;border-radius:50%;object-fit:cover;object-position:center}";
    styleInject(css_248z$B);

    /* src/components/ProfileImg.svelte generated by Svelte v3.59.1 */

    function create_default_slot$a(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", img_class_value = "profile-image object-cover " + (/*githubVerified*/ ctx[2] ? '' : 'grayscale') + " svelte-1281914");
    			if (!src_url_equal(img.src, img_src_value = /*picture*/ ctx[1])) attr(img, "src", img_src_value);
    			attr(img, "alt", "Profile Img");
    			attr(img, "style", /*styleString*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*githubVerified*/ 4 && img_class_value !== (img_class_value = "profile-image object-cover " + (/*githubVerified*/ ctx[2] ? '' : 'grayscale') + " svelte-1281914")) {
    				attr(img, "class", img_class_value);
    			}

    			if (dirty & /*picture*/ 2 && !src_url_equal(img.src, img_src_value = /*picture*/ ctx[1])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*styleString*/ 8) {
    				attr(img, "style", /*styleString*/ ctx[3]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    function create_fragment$T(ctx) {
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: `/profile/${/*pubkey*/ ctx[0]}`,
    				$$slots: { default: [create_default_slot$a] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(link.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const link_changes = {};
    			if (dirty & /*pubkey*/ 1) link_changes.to = `/profile/${/*pubkey*/ ctx[0]}`;

    			if (dirty & /*$$scope, githubVerified, picture, styleString*/ 142) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(link, detaching);
    		}
    	};
    }

    function instance$S($$self, $$props, $$invalidate) {
    	let styleString;
    	let { profile = {} } = $$props;
    	let { style = {} } = $$props;
    	let pubkey, picture, githubVerified; // initial declaration

    	// Converts style object to CSS string
    	const toStyleString = styleObj => Object.entries(styleObj).map(([prop, value]) => `${prop}: ${value}`).join('; ');

    	$$self.$$set = $$props => {
    		if ('profile' in $$props) $$invalidate(4, profile = $$props.profile);
    		if ('style' in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*profile*/ 16) {
    			// Reactive statements to update values when profile changes
    			{
    				$$invalidate(0, pubkey = profile.pubkey);
    				$$invalidate(1, picture = profile.picture);
    				$$invalidate(2, githubVerified = profile.verified);
    			}
    		}

    		if ($$self.$$.dirty & /*style*/ 32) {
    			$$invalidate(3, styleString = toStyleString({ ...style, 'border-radius': '50%' })); // added border-radius here
    		}
    	};

    	return [pubkey, picture, githubVerified, styleString, profile, style];
    }

    class ProfileImg extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$S, create_fragment$T, safe_not_equal, { profile: 4, style: 5 });
    	}
    }

    const a=async(e,t)=>{const{boost:r}=e;t||(t={});const n=t.webln||globalThis.webln;if(!n)throw new Error("WebLN not available");if(!n.keysend)throw new Error("Keysend not available in current WebLN provider");const o=e.amount||Math.floor(r.value_msat/1e3),a={destination:e.destination,amount:o,customRecords:{7629169:JSON.stringify(r)}};return e.customKey&&e.customValue&&(a.customRecords[e.customKey]=e.customValue),await n.enable(),await n.keysend(a)};function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n]);}return e},i.apply(this,arguments)}async function c(e){const t="string"==typeof e?(new TextEncoder).encode(e):e,r=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(r)).map(e=>e.toString(16).padStart(2,"0")).join("")}const l=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,h=e=>!!e&&l.test(e),u=({amount:e,min:t,max:r})=>e>0&&e>=t&&e<=r;var d,f,p=(d=function(e,t){function r(e){if(!Number.isSafeInteger(e))throw new Error(`Wrong integer: ${e}`)}function n(...e){const t=(e,t)=>r=>e(t(r));return {encode:Array.from(e).reverse().reduce((e,r)=>e?t(e,r.encode):r.encode,void 0),decode:e.reduce((e,r)=>e?t(e,r.decode):r.decode,void 0)}}function o(e){return {encode:t=>{if(!Array.isArray(t)||t.length&&"number"!=typeof t[0])throw new Error("alphabet.encode input should be an array of numbers");return t.map(t=>{if(r(t),t<0||t>=e.length)throw new Error(`Digit index outside alphabet: ${t} (alphabet: ${e.length})`);return e[t]})},decode:t=>{if(!Array.isArray(t)||t.length&&"string"!=typeof t[0])throw new Error("alphabet.decode input should be array of strings");return t.map(t=>{if("string"!=typeof t)throw new Error(`alphabet.decode: not string element=${t}`);const r=e.indexOf(t);if(-1===r)throw new Error(`Unknown letter: "${t}". Allowed: ${e}`);return r})}}}function a(e=""){if("string"!=typeof e)throw new Error("join separator should be string");return {encode:t=>{if(!Array.isArray(t)||t.length&&"string"!=typeof t[0])throw new Error("join.encode input should be array of strings");for(let e of t)if("string"!=typeof e)throw new Error(`join.encode: non-string input=${e}`);return t.join(e)},decode:t=>{if("string"!=typeof t)throw new Error("join.decode input should be string");return t.split(e)}}}function s(e,t="="){if(r(e),"string"!=typeof t)throw new Error("padding chr should be string");return {encode(r){if(!Array.isArray(r)||r.length&&"string"!=typeof r[0])throw new Error("padding.encode input should be array of strings");for(let e of r)if("string"!=typeof e)throw new Error(`padding.encode: non-string input=${e}`);for(;r.length*e%8;)r.push(t);return r},decode(r){if(!Array.isArray(r)||r.length&&"string"!=typeof r[0])throw new Error("padding.encode input should be array of strings");for(let e of r)if("string"!=typeof e)throw new Error(`padding.decode: non-string input=${e}`);let n=r.length;if(n*e%8)throw new Error("Invalid padding: string should have whole number of bytes");for(;n>0&&r[n-1]===t;n--)if(!((n-1)*e%8))throw new Error("Invalid padding: string has too much padding");return r.slice(0,n)}}}function i(e){if("function"!=typeof e)throw new Error("normalize fn should be function");return {encode:e=>e,decode:t=>e(t)}}function c(e,t,n){if(t<2)throw new Error(`convertRadix: wrong from=${t}, base cannot be less than 2`);if(n<2)throw new Error(`convertRadix: wrong to=${n}, base cannot be less than 2`);if(!Array.isArray(e))throw new Error("convertRadix: data should be array");if(!e.length)return [];let o=0;const a=[],s=Array.from(e);for(s.forEach(e=>{if(r(e),e<0||e>=t)throw new Error(`Wrong integer: ${e}`)});;){let e=0,r=!0;for(let a=o;a<s.length;a++){const i=s[a],c=t*e+i;if(!Number.isSafeInteger(c)||t*e/t!==e||c-i!=t*e)throw new Error("convertRadix: carry overflow");if(e=c%n,s[a]=Math.floor(c/n),!Number.isSafeInteger(s[a])||s[a]*n+e!==c)throw new Error("convertRadix: carry overflow");r&&(s[a]?r=!1:o=a);}if(a.push(e),r)break}for(let t=0;t<e.length-1&&0===e[t];t++)a.push(0);return a.reverse()}Object.defineProperty(t,"__esModule",{value:!0}),t.bytes=t.stringToBytes=t.str=t.bytesToString=t.hex=t.utf8=t.bech32m=t.bech32=t.base58check=t.base58xmr=t.base58xrp=t.base58flickr=t.base58=t.base64url=t.base64=t.base32crockford=t.base32hex=t.base32=t.base16=t.utils=t.assertNumber=void 0,t.assertNumber=r;const l=(e,t)=>t?l(t,e%t):e,h=(e,t)=>e+(t-l(e,t));function u(e,t,n,o){if(!Array.isArray(e))throw new Error("convertRadix2: data should be array");if(t<=0||t>32)throw new Error(`convertRadix2: wrong from=${t}`);if(n<=0||n>32)throw new Error(`convertRadix2: wrong to=${n}`);if(h(t,n)>32)throw new Error(`convertRadix2: carry overflow from=${t} to=${n} carryBits=${h(t,n)}`);let a=0,s=0;const i=2**n-1,c=[];for(const o of e){if(r(o),o>=2**t)throw new Error(`convertRadix2: invalid data word=${o} from=${t}`);if(a=a<<t|o,s+t>32)throw new Error(`convertRadix2: carry overflow pos=${s} from=${t}`);for(s+=t;s>=n;s-=n)c.push((a>>s-n&i)>>>0);a&=2**s-1;}if(a=a<<n-s&i,!o&&s>=t)throw new Error("Excess padding");if(!o&&a)throw new Error(`Non-zero padding: ${a}`);return o&&s>0&&c.push(a>>>0),c}function d(e){return r(e),{encode:t=>{if(!(t instanceof Uint8Array))throw new Error("radix.encode input should be Uint8Array");return c(Array.from(t),256,e)},decode:t=>{if(!Array.isArray(t)||t.length&&"number"!=typeof t[0])throw new Error("radix.decode input should be array of strings");return Uint8Array.from(c(t,e,256))}}}function f(e,t=!1){if(r(e),e<=0||e>32)throw new Error("radix2: bits should be in (0..32]");if(h(8,e)>32||h(e,8)>32)throw new Error("radix2: carry overflow");return {encode:r=>{if(!(r instanceof Uint8Array))throw new Error("radix2.encode input should be Uint8Array");return u(Array.from(r),8,e,!t)},decode:r=>{if(!Array.isArray(r)||r.length&&"number"!=typeof r[0])throw new Error("radix2.decode input should be array of strings");return Uint8Array.from(u(r,e,8,t))}}}function p(e){if("function"!=typeof e)throw new Error("unsafeWrapper fn should be function");return function(...t){try{return e.apply(null,t)}catch(e){}}}function w(e,t){if(r(e),"function"!=typeof t)throw new Error("checksum fn should be function");return {encode(r){if(!(r instanceof Uint8Array))throw new Error("checksum.encode: input should be Uint8Array");const n=t(r).slice(0,e),o=new Uint8Array(r.length+e);return o.set(r),o.set(n,r.length),o},decode(r){if(!(r instanceof Uint8Array))throw new Error("checksum.decode: input should be Uint8Array");const n=r.slice(0,-e),o=t(n).slice(0,e),a=r.slice(-e);for(let t=0;t<e;t++)if(o[t]!==a[t])throw new Error("Invalid checksum");return n}}}t.utils={alphabet:o,chain:n,checksum:w,radix:d,radix2:f,join:a,padding:s},t.base16=n(f(4),o("0123456789ABCDEF"),a("")),t.base32=n(f(5),o("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"),s(5),a("")),t.base32hex=n(f(5),o("0123456789ABCDEFGHIJKLMNOPQRSTUV"),s(5),a("")),t.base32crockford=n(f(5),o("0123456789ABCDEFGHJKMNPQRSTVWXYZ"),a(""),i(e=>e.toUpperCase().replace(/O/g,"0").replace(/[IL]/g,"1"))),t.base64=n(f(6),o("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"),s(6),a("")),t.base64url=n(f(6),o("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"),s(6),a(""));const m=e=>n(d(58),o(e),a(""));t.base58=m("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"),t.base58flickr=m("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"),t.base58xrp=m("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");const y=[0,2,3,5,6,7,9,10,11];t.base58xmr={encode(e){let r="";for(let n=0;n<e.length;n+=8){const o=e.subarray(n,n+8);r+=t.base58.encode(o).padStart(y[o.length],"1");}return r},decode(e){let r=[];for(let n=0;n<e.length;n+=11){const o=e.slice(n,n+11),a=y.indexOf(o.length),s=t.base58.decode(o);for(let e=0;e<s.length-a;e++)if(0!==s[e])throw new Error("base58xmr: wrong padding");r=r.concat(Array.from(s.slice(s.length-a)));}return Uint8Array.from(r)}},t.base58check=e=>n(w(4,t=>e(e(t))),t.base58);const g=n(o("qpzry9x8gf2tvdw0s3jn54khce6mua7l"),a("")),b=[996825010,642813549,513874426,1027748829,705979059];function v(e){const t=e>>25;let r=(33554431&e)<<5;for(let e=0;e<b.length;e++)1==(t>>e&1)&&(r^=b[e]);return r}function E(e,t,r=1){const n=e.length;let o=1;for(let t=0;t<n;t++){const r=e.charCodeAt(t);if(r<33||r>126)throw new Error(`Invalid prefix (${e})`);o=v(o)^r>>5;}o=v(o);for(let t=0;t<n;t++)o=v(o)^31&e.charCodeAt(t);for(let e of t)o=v(o)^e;for(let e=0;e<6;e++)o=v(o);return o^=r,g.encode(u([o%2**30],30,5,!1))}function x(e){const t="bech32"===e?1:734539939,r=f(5),n=r.decode,o=r.encode,a=p(n);function s(e,r=90){if("string"!=typeof e)throw new Error("bech32.decode input should be string, not "+typeof e);if(e.length<8||!1!==r&&e.length>r)throw new TypeError(`Wrong string length: ${e.length} (${e}). Expected (8..${r})`);const n=e.toLowerCase();if(e!==n&&e!==e.toUpperCase())throw new Error("String must be lowercase or uppercase");const o=(e=n).lastIndexOf("1");if(0===o||-1===o)throw new Error('Letter "1" must be present between prefix and data only');const a=e.slice(0,o),s=e.slice(o+1);if(s.length<6)throw new Error("Data must be at least 6 characters long");const i=g.decode(s).slice(0,-6),c=E(a,i,t);if(!s.endsWith(c))throw new Error(`Invalid checksum in ${e}: expected "${c}"`);return {prefix:a,words:i}}return {encode:function(e,r,n=90){if("string"!=typeof e)throw new Error("bech32.encode prefix should be string, not "+typeof e);if(!Array.isArray(r)||r.length&&"number"!=typeof r[0])throw new Error("bech32.encode words should be array of numbers, not "+typeof r);const o=e.length+7+r.length;if(!1!==n&&o>n)throw new TypeError(`Length ${o} exceeds limit ${n}`);return `${e=e.toLowerCase()}1${g.encode(r)}${E(e,r,t)}`},decode:s,decodeToBytes:function(e){const{prefix:t,words:r}=s(e,!1);return {prefix:t,words:r,bytes:n(r)}},decodeUnsafe:p(s),fromWords:n,fromWordsUnsafe:a,toWords:o}}t.bech32=x("bech32"),t.bech32m=x("bech32m"),t.utf8={encode:e=>(new TextDecoder).decode(e),decode:e=>(new TextEncoder).encode(e)},t.hex=n(f(4),o("0123456789abcdef"),a(""),i(e=>{if("string"!=typeof e||e.length%2)throw new TypeError(`hex.decode: expected string, got ${typeof e} with length ${e.length}`);return e.toLowerCase()}));const _={utf8:t.utf8,hex:t.hex,base16:t.base16,base32:t.base32,base64:t.base64,base64url:t.base64url,base58:t.base58,base58xmr:t.base58xmr},A=`Invalid encoding type. Available types: ${Object.keys(_).join(", ")}`;t.bytesToString=(e,t)=>{if("string"!=typeof e||!_.hasOwnProperty(e))throw new TypeError(A);if(!(t instanceof Uint8Array))throw new TypeError("bytesToString() expects Uint8Array");return _[e].encode(t)},t.str=t.bytesToString,t.stringToBytes=(e,t)=>{if(!_.hasOwnProperty(e))throw new TypeError(A);if("string"!=typeof t)throw new TypeError("stringToBytes() expects string");return _[e].decode(t)},t.bytes=t.stringToBytes;},d(f={exports:{}},f.exports),f.exports);const{bech32:w,hex:m,utf8:y}=p,g={bech32:"bc",pubKeyHash:0,scriptHash:5,validWitnessVersions:[0]},b={bech32:"tb",pubKeyHash:111,scriptHash:196,validWitnessVersions:[0]},v={bech32:"bcrt",pubKeyHash:111,scriptHash:196,validWitnessVersions:[0]},E={bech32:"sb",pubKeyHash:63,scriptHash:123,validWitnessVersions:[0]},x=["option_data_loss_protect","initial_routing_sync","option_upfront_shutdown_script","gossip_queries","var_onion_optin","gossip_queries_ex","option_static_remotekey","payment_secret","basic_mpp","option_support_large_channel"],_={m:BigInt(1e3),u:BigInt(1e6),n:BigInt(1e9),p:BigInt(1e12)},A=BigInt("2100000000000000000"),k=BigInt(1e11),$={payment_hash:1,payment_secret:16,description:13,payee:19,description_hash:23,expiry:6,min_final_cltv_expiry:24,fallback_address:9,route_hint:3,feature_bits:5,metadata:27},N={};for(let e=0,t=Object.keys($);e<t.length;e++){const r=t[e],n=$[t[e]].toString();N[n]=r;}const S={1:e=>m.encode(w.fromWordsUnsafe(e)),16:e=>m.encode(w.fromWordsUnsafe(e)),13:e=>y.encode(w.fromWordsUnsafe(e)),19:e=>m.encode(w.fromWordsUnsafe(e)),23:e=>m.encode(w.fromWordsUnsafe(e)),27:e=>m.encode(w.fromWordsUnsafe(e)),6:U,24:U,3:function(e){const t=[];let r,n,o,a,s,i=w.fromWordsUnsafe(e);for(;i.length>0;)r=m.encode(i.slice(0,33)),n=m.encode(i.slice(33,41)),o=parseInt(m.encode(i.slice(41,45)),16),a=parseInt(m.encode(i.slice(45,49)),16),s=parseInt(m.encode(i.slice(49,51)),16),i=i.slice(51),t.push({pubkey:r,short_channel_id:n,fee_base_msat:o,fee_proportional_millionths:a,cltv_expiry_delta:s});return t},5:function(e){const t=e.slice().reverse().map(e=>[!!(1&e),!!(2&e),!!(4&e),!!(8&e),!!(16&e)]).reduce((e,t)=>e.concat(t),[]);for(;t.length<2*x.length;)t.push(!1);const r={};x.forEach((e,n)=>{let o;o=t[2*n]?"required":t[2*n+1]?"supported":"unsupported",r[e]=o;});const n=t.slice(2*x.length);return r.extra_bits={start_bit:2*x.length,bits:n,has_required:n.reduce((e,t,r)=>r%2!=0?e||!1:e||t,!1)},r}};function I(e){return t=>({tagCode:parseInt(e),words:w.encode("unknown",t,Number.MAX_SAFE_INTEGER)})}function U(e){return e.reverse().reduce((e,t,r)=>e+t*Math.pow(32,r),0)}class D{constructor(e){var t,r,n;if(this.paymentRequest=void 0,this.paymentHash=void 0,this.preimage=void 0,this.verify=void 0,this.satoshi=void 0,this.expiry=void 0,this.timestamp=void 0,this.createdDate=void 0,this.expiryDate=void 0,this.description=void 0,this.paymentRequest=e.pr,!this.paymentRequest)throw new Error("Invalid payment request");const o=(e=>{if(!e)return null;try{const t=function(e,t){if("string"!=typeof e)throw new Error("Lightning Payment Request must be string");if("ln"!==e.slice(0,2).toLowerCase())throw new Error("Not a proper lightning payment request");const r=[],n=w.decode(e,Number.MAX_SAFE_INTEGER);e=e.toLowerCase();const o=n.prefix;let a=n.words,s=e.slice(o.length+1),i=a.slice(-104);a=a.slice(0,-104);let c=o.match(/^ln(\S+?)(\d*)([a-zA-Z]?)$/);if(c&&!c[2]&&(c=o.match(/^ln(\S+)$/)),!c)throw new Error("Not a proper lightning payment request");r.push({name:"lightning_network",letters:"ln"});const l=c[1];let h;switch(l){case g.bech32:h=g;break;case b.bech32:h=b;break;case v.bech32:h=v;break;case E.bech32:h=E;}if(!h||h.bech32!==l)throw new Error("Unknown coin bech32 prefix");r.push({name:"coin_network",letters:l,value:h});const u=c[2];let d;u?(d=function(e,t){let r,n;if(e.slice(-1).match(/^[munp]$/))r=e.slice(-1),n=e.slice(0,-1);else {if(e.slice(-1).match(/^[^munp0-9]$/))throw new Error("Not a valid multiplier for the amount");n=e;}if(!n.match(/^\d+$/))throw new Error("Not a valid human readable amount");const o=BigInt(n),a=r?o*k/_[r]:o*k;if("p"===r&&o%BigInt(10)!==BigInt(0)||a>A)throw new Error("Amount is outside of valid range");return a.toString()}(u+c[3]),r.push({name:"amount",letters:c[2]+c[3],value:d})):d=null,r.push({name:"separator",letters:"1"});const f=U(a.slice(0,7));let p,y,x,D;for(a=a.slice(7),r.push({name:"timestamp",letters:s.slice(0,7),value:f}),s=s.slice(7);a.length>0;){const e=a[0].toString();p=N[e]||"unknown_tag",y=S[e]||I(e),a=a.slice(1),x=U(a.slice(0,2)),a=a.slice(2),D=a.slice(0,x),a=a.slice(x),r.push({name:p,tag:s[0],letters:s.slice(0,3+x),value:y(D)}),s=s.slice(3+x);}r.push({name:"signature",letters:s.slice(0,104),value:m.encode(w.fromWordsUnsafe(i))}),s=s.slice(104),r.push({name:"checksum",letters:s});let R={paymentRequest:e,sections:r,get expiry(){let e=r.find(e=>"expiry"===e.name);if(e)return W("timestamp")+e.value},get route_hints(){return r.filter(e=>"route_hint"===e.name).map(e=>e.value)}};for(let e in $)"route_hint"!==e&&Object.defineProperty(R,e,{get:()=>W(e)});return R;function W(e){let t=r.find(t=>t.name===e);return t?t.value:void 0}}(e);if(!t||!t.sections)return null;const r=t.sections.find(e=>"payment_hash"===e.name);if("payment_hash"!==(null==r?void 0:r.name)||!r.value)return null;const n=r.value,o=t.sections.find(e=>"amount"===e.name);if("amount"!==(null==o?void 0:o.name)||void 0===o.value)return null;const a=parseInt(o.value)/1e3,s=t.sections.find(e=>"expiry"===e.name),i=t.sections.find(e=>"timestamp"===e.name);if("timestamp"!==(null==i?void 0:i.name)||!i.value)return null;const c=i.value;if("expiry"!==(null==s?void 0:s.name)||void 0===s.value)return null;const l=s.value,h=t.sections.find(e=>"description"===e.name);return {paymentHash:n,satoshi:a,timestamp:c,expiry:l,description:"description"===(null==h?void 0:h.name)?null==h?void 0:h.value:void 0}}catch(e){return null}})(this.paymentRequest);if(!o)throw new Error("Failed to decode payment request");this.paymentHash=o.paymentHash,this.satoshi=o.satoshi,this.timestamp=o.timestamp,this.expiry=o.expiry,this.createdDate=new Date(1e3*this.timestamp),this.expiryDate=new Date(1e3*(this.timestamp+this.expiry)),this.description=null!=(t=o.description)?t:null,this.verify=null!=(r=e.verify)?r:null,this.preimage=null!=(n=e.preimage)?n:null;}async isPaid(){if(this.preimage)return this.validatePreimage(this.preimage);if(this.verify)return await this.verifyPayment();throw new Error("Could not verify payment")}async validatePreimage(e){if(!e||!this.paymentHash)return !1;try{const r=await c((t=e,Uint8Array.from(t.match(/.{1,2}/g).map(e=>parseInt(e,16)))));return this.paymentHash===r}catch(e){return !1}var t;}async verifyPayment(){if(!this.verify)throw new Error("LNURL verify not available");const e=await fetch(this.verify),t=await e.json();return t.preimage&&(this.preimage=t.preimage),t.settled}}async function R({satoshi:e,comment:t,p:r,e:n,relays:o},a={}){const s=a.nostr||globalThis.nostr;if(!s)throw new Error("nostr option or window.nostr is not available");const i=[["relays",...o],["amount",e.toString()]];r&&i.push(["p",r]),n&&i.push(["e",n]);const c={pubkey:await s.getPublicKey(),created_at:Math.floor(Date.now()/1e3),kind:9734,tags:i,content:null!=t?t:""};return c.id=await L(c),await s.signEvent(c)}function W(e){if("string"!=typeof e.content)return !1;if("number"!=typeof e.created_at)return !1;if(!Array.isArray(e.tags))return !1;for(let t=0;t<e.tags.length;t++){const r=e.tags[t];if(!Array.isArray(r))return !1;for(let e=0;e<r.length;e++)if("object"==typeof r[e])return !1}return !0}function P(e){if(!W(e))throw new Error("can't serialize event with wrong or missing properties");return JSON.stringify([0,e.pubkey,e.created_at,e.kind,e.tags,e.content])}function L(e){return c(P(e))}function T(e,t){let r,n;var o,a;return t&&e&&(r=null==(o=e.names)?void 0:o[t],n=r?null==(a=e.relays)?void 0:a[r]:void 0),[e,r,n]}const O=/^((?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*)|(?:".+"))@((?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(?:(?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;class K{constructor(e,t){this.address=void 0,this.options=void 0,this.username=void 0,this.domain=void 0,this.pubkey=void 0,this.lnurlpData=void 0,this.keysendData=void 0,this.nostrData=void 0,this.nostrPubkey=void 0,this.nostrRelays=void 0,this.webln=void 0,this.address=e,this.options={proxy:"https://api.getalby.com/lnurl"},this.options=Object.assign(this.options,t),this.parse(),this.webln=this.options.webln;}parse(){const e=O.exec(this.address.toLowerCase());e&&(this.username=e[1],this.domain=e[2]);}getWebLN(){return this.webln||globalThis.webln}async fetch(){return this.options.proxy?this.fetchWithProxy():this.fetchWithoutProxy()}async fetchWithProxy(){const e=await fetch(`${this.options.proxy}/lightning-address-details?${new URLSearchParams({ln:this.address}).toString()}`),t=await e.json();await this.parseResponse(t.lnurlp,t.keysend,t.nostr);}async fetchWithoutProxy(){if(!this.domain||!this.username)return;const e=await fetch(this.lnurlpUrl()),t=await fetch(this.keysendUrl()),r=await fetch(this.nostrUrl());let n,o,a;e.ok&&(n=await e.json()),t.ok&&(o=await t.json()),r.ok&&(a=await r.json()),await this.parseResponse(n,o,a);}lnurlpUrl(){return `https://${this.domain}/.well-known/lnurlp/${this.username}`}keysendUrl(){return `https://${this.domain}/.well-known/keysend/${this.username}`}nostrUrl(){return `https://${this.domain}/.well-known/nostr.json?name=${this.username}`}async generateInvoice(e){let t;if(this.options.proxy){const r=await fetch(`${this.options.proxy}/generate-invoice?${new URLSearchParams(i({ln:this.address},e)).toString()}`);t=(await r.json()).invoice;}else {if(!this.lnurlpData)throw new Error("No lnurlpData available. Please call fetch() first.");if(!this.lnurlpData.callback||!h(this.lnurlpData.callback))throw new Error("Valid callback does not exist in lnurlpData");const r=new URL(this.lnurlpData.callback);r.search=new URLSearchParams(e).toString();const n=await fetch(r.toString());t=await n.json();}const r=t&&t.pr&&t.pr.toString();if(!r)throw new Error("Invalid pay service invoice");const n={pr:r};return t&&t.verify&&(n.verify=t.verify.toString()),new D(n)}async requestInvoice(e){if(!this.lnurlpData)throw new Error("No lnurlpData available. Please call fetch() first.");const t=1e3*e.satoshi,{commentAllowed:r,min:n,max:o}=this.lnurlpData;if(!u({amount:t,min:n,max:o}))throw new Error("Invalid amount");if(e.comment&&r&&r>0&&e.comment.length>r)throw new Error(`The comment length must be ${r} characters or fewer`);const a={amount:t.toString()};return e.comment&&(a.comment=e.comment),e.payerdata&&(a.payerdata=JSON.stringify(e.payerdata)),this.generateInvoice(a)}async boost(e,t=0){if(!this.keysendData)throw new Error("No keysendData available. Please call fetch() first.");const{destination:r,customKey:n,customValue:o}=this.keysendData,s=this.getWebLN();if(!s)throw new Error("WebLN not available");return a({destination:r,customKey:n,customValue:o,amount:t,boost:e},{webln:s})}async zapInvoice({satoshi:e,comment:t,relays:r,e:n},o={}){if(!this.lnurlpData)throw new Error("No lnurlpData available. Please call fetch() first.");if(!this.nostrPubkey)throw new Error("Nostr Pubkey is missing");const a=this.nostrPubkey,s=1e3*e,{allowsNostr:i,min:c,max:l}=this.lnurlpData;if(!u({amount:s,min:c,max:l}))throw new Error("Invalid amount");if(!i)throw new Error("Your provider does not support zaps");const h=await R({satoshi:s,comment:t,p:a,e:n,relays:r},o),d={amount:s.toString(),nostr:JSON.stringify(h)};return await this.generateInvoice(d)}async zap(e,t={}){const r=this.zapInvoice(e,t),n=this.getWebLN();if(!n)throw new Error("WebLN not available");return await n.enable(),n.sendPayment((await r).paymentRequest)}async parseResponse(e,t,r){e&&(this.lnurlpData=await(async e=>{if("payRequest"!==e.tag)throw new Error("Invalid pay service params");const t=(e.callback+"").trim();if(!h(t))throw new Error("Callback must be a valid url");const r=Math.ceil(Number(e.minSendable||0)),n=Math.floor(Number(e.maxSendable));if(!r||!n||r>n)throw new Error("Invalid pay service params");let o,a;try{o=JSON.parse(e.metadata+""),a=await c(e.metadata+"");}catch(e){o=[],a=await c("[]");}let s="",i="",l="";for(let e=0;e<o.length;e++){const[t,r]=o[e];switch(t){case"text/plain":i=r;break;case"text/identifier":l=r;break;case"image/png;base64":case"image/jpeg;base64":s="data:"+t+","+r;}}const u=e.payerData;let d;try{d=new URL(t).hostname;}catch(e){}return {callback:t,fixed:r===n,min:r,max:n,domain:d,metadata:o,metadataHash:a,identifier:l,description:i,image:s,payerData:u,commentAllowed:Number(e.commentAllowed)||0,rawData:e,allowsNostr:e.allowsNostr||!1}})(e)),t&&(this.keysendData=(e=>{if("keysend"!==e.tag)throw new Error("Invalid keysend params");if("OK"!==e.status)throw new Error("Keysend status not OK");if(!("customKey"in e.customData[0])||"696969"!=e.customData[0].customKey)throw new Error("Unable to find customKey");if(!("customValue"in e.customData[0])||!e.customData[0].customValue)throw new Error("Unable to find customValue");if(!e.pubkey)throw new Error("Pubkey does not exist");return {destination:e.pubkey,customKey:e.customData[0].customKey,customValue:e.customData[0].customValue}})(t)),r&&([this.nostrData,this.nostrPubkey,this.nostrRelays]=T(r,this.username));}}

    async function sendSatsLNurl(lnurl) {
      if (typeof window.webln !== "undefined") {
        await window.webln.enable();
        await webln.lnurl(lnurl);
      }
    }

    async function sendZap(lightningAddress, satoshi, comment, relays, eventId) {
      try {
        if (!lightningAddress) {
          throw new Error("No valid lightning address provided.");
        }

        const ln = new K(lightningAddress);
        await ln.fetch();

        if (!ln.nostrPubkey) {
          throw new Error("Nostr pubkey missing for the lightning address.", lightningAddress);
        }

        const zapArgs = {
          satoshi: satoshi,
          comment: comment,
          relays: relays,
          e: eventId,
        };

        if (window.webln) {
          const ret = await ln.zap(zapArgs);
          return ret;
        } else {
          // Alternative approach if WebLN is not available
          const invoice = await ln.zapInvoice(zapArgs);
          console.log("Zap invoice generated:", invoice.paymentRequest);
          // Further steps for payment processing
        }
      } catch (error) {
        console.error("Error sending the Zap:", error);
        throw error; // or throw custom error
      }
    }

    // BalanceStore.js

    const balance = writable(-1);

    // src/constants/nostrKinds.js

    const NOSTR_KIND_JOB = 1340;
    const NOSTR_KIND_IDEA = 1341;

    // SocialMediaManager.js

    class SocialMediaManager {
      constructor() {
        this.init();
      }

      async likeEvent(event_id) {
        if (!event_id) {
          console.error("Event ID is required to like an event.");
          return;
        }

        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to like events.");
          return;
        }

        if (await this.checkIfLiked(event_id)) {
          console.error("Must be unliked");
          return;
        }

        // Definition der Tags für das Like-Event
        const tags = [
          ["e", event_id],         // Event-ID, die geliked wird
        ];

        // Erstellen und Versenden des Like-Events
        try {
          await this.manager.sendEvent(7, "+", tags);  // Annahme: 7 ist der Event-Typ für Likes
          console.log("Like event created and sent successfully");
        } catch (error) {
          console.error("Error sending like event:", error);
        }
      }

      async unlikeEvent(event_id) {
        if (!event_id) {
          console.error("Event ID is required to unlike an event.");
          return;
        }

        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to unlike events.");
          return;
        }

        if (!await this.checkIfLiked(event_id)) {
          console.error("Must be liked!");
          return;
        }

        try {
          // Zuerst finden wir das Like-Event, das der Benutzer für die spezifische Event-ID erstellt hat.
          const likeEvents = await this.cache.getEventsByCriteria({
            kinds: [7], // Annahme, dass 7 der Typ für Like-Events ist
            authors: [this.manager.publicKey],
            tags: {
              e: [event_id],
            }
          });

          if (likeEvents.length > 0) {
            const likeEventId = likeEvents[0].id; // Nehmen das erste gefundene Like-Event
            await this.manager.deleteEvent(likeEventId);
            console.log("Event unliked successfully:", likeEventId);
          } else {
            console.log("No like event found to unlike.");
          }
        } catch (error) {
          console.error("Error unliking the event:", error);
        }
      }

      async checkIfLiked(event_id) {
        if (!event_id) {
          console.error("Event ID is required to check if liked.");
          return false;
        }

        if (!this.manager || !this.manager.publicKey) {
          return false;
        }

        const events = await this.cache.getEventsByCriteria({
          kinds: [7],
          authors: [this.manager.publicKey],
          tags: {
            e: [event_id],
          }
        });

        return events.length > 0;
      }

      async getLikes(event_id) {
        if (!event_id) {
          console.error("Event ID is required to get likes.");
          return;
        }

        if (!this.cache) {
          console.error("Cache is not initialized.");
          return;
        }

        try {
          const events = await this.cache.getEventsByCriteria({
            kinds: [7], // Annahme, dass 7 der Kind-Code für Like-Events ist
            tags: {
              e: [event_id]
            }
          });

          // Erstellen eines Sets, um eindeutige PublicKeys zu speichern
          const uniqueLikers = new Set();

          // Filtern der Events auf den Inhalt "+" und Überprüfung auf doppelte PublicKeys
          events.forEach(event => {
            if (event.content === "+") {
              uniqueLikers.add(event.pubkey);
            }
          });

          // Die Größe des Sets gibt die Anzahl der einzigartigen Likes zurück
          return uniqueLikers.size;
        } catch (error) {
          console.error("Error fetching likes:", error);
          return 0;
        }
      }

      subscribeLikes(event_id) {
        if (!event_id) {
          console.error("Event ID is required to subscribe for likes.");
          return;
        }

        if (!this.manager) {
          console.error("Manager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [7], // Likes-Event-Typ
          "#e": [event_id]
        });
      }

      unsubscribeLikes(event_id) {
        if (!event_id) {
          console.error("Event ID is required to unsubscribe from likes.");
          return;
        }

        if (!this.manager) {
          console.error("Manager is not initialized.");
          return;
        }

        this.manager.unsubscribeEvent({
          kinds: [7], // Likes-Event-Typ
          "#e": [event_id]
        });
      }

      init() {
        // Initialisiere die Store-Abonnements
        this.cacheSubscription = this.subscribeToStore(nostrCache, (value) => {
          this.cache = value;
        });

        this.managerSubscription = this.subscribeToStore(nostrManager, (value) => {
          this.manager = value;
        });
      }

      subscribeToStore(store, updateFunction) {
        const unsubscribe = store.subscribe(updateFunction);
        return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
      }

      async getProfile(pubkey) {
        if (!pubkey) {
          console.error("Public key is required to get a profile.", pubkey);
          return null;
        }

        // Stelle sicher, dass der Cache initialisiert ist
        if (!this.cache) {
          console.error("Cache is not initialized.");
          return null;
        }

        const profileEvents = this.cache.getEventsByCriteria({
          kinds: [0], // Annahme: Kind 0 steht für Profil-Events
          authors: [pubkey],
        });

        if (profileEvents.length > 0) {
          profileEvents.sort((a, b) => b.created_at - a.created_at);
          return profileEvents[0].profileData; // Gibt das neueste Profil-Event zurück
        } else {
          console.log("No profile found for the provided public key. Attempting to subscribe for updates.");
          this.subscribeProfile(pubkey);
          return null;
        }
      }

      subscribeProfile(pubkey) {
        if (!pubkey) {
          console.error("Public key is required to subscribe to a profile.");
          return;
        }

        // Stelle sicher, dass der Manager initialisiert ist
        if (!this.manager) {
          console.error("Manager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [0], // Profil-Event
          authors: [pubkey],
        });
      }

      subscribeProfiles(pubkeys) {
        if (!pubkeys) {
          console.error("Public key is required to subscribe to a profile.");
          return;
        }

        // Stelle sicher, dass der Manager initialisiert ist
        if (!this.manager) {
          console.error("Manager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [0], // Profil-Event
          authors: pubkeys,
        });
      }

      subscribeFollowList(pubkey) {
        if (!this.manager) {
          console.error("Manager is not initialized.");
          return;
        }

        try {
          this.manager.subscribeToEvents({
            kinds: [3],
            authors: [pubkey]
          });
        } catch (error) {
          console.error("Error subscribing to follow list updates:", error);
        }
      }

      async getFollowList(pubkey) {
        if (!this.manager) {
          console.error("Manager not ready");
          return [];
        }

        try {
          const followEvents = await this.cache.getEventsByCriteria({
            kinds: [3],
            authors: [pubkey]
          });

          // Nimm das neueste Follow-List-Event
          if (followEvents.length > 0) {
            return followEvents.sort((a, b) => b.created_at - a.created_at)[0].tags;
          }
          return [];
        } catch (error) {
          console.error("Error fetching follow list:", error);
          return [];
        }
      }

      async follow(pubkey) {
        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to follow.");
          return;
        }

        const currentList = await this.getFollowList(this.manager.publicKey);
        // Überprüfen, ob der PublicKey bereits gefolgt wird, um Duplikate zu vermeiden
        if (currentList.some(tag => tag[1] === pubkey)) {
          console.error("Already following this profile.");
          return;
        }

        // Hinzufügen des neuen Follows zur aktuellen Liste
        currentList.push(["p", pubkey, "", ""]); // Hier könnten auch Relay-URL und Petname hinzugefügt werden

        try {
          await this.manager.sendEvent(3, "", currentList);
          console.log("Updated follow list sent successfully");
        } catch (error) {
          console.error("Error updating follow list:", error);
        }
      }

      async unfollow(pubkey) {
        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to unfollow.");
          return;
        }

        const currentList = await this.getFollowList(this.manager.publicKey);

        // Entfernen des Unfollows aus der aktuellen Liste
        const updatedList = currentList.filter(tag => tag[1] !== pubkey);

        try {
          await this.manager.sendEvent(3, "", updatedList);
          console.log("Updated follow list sent successfully after unfollowing");
        } catch (error) {
          console.error("Error updating follow list after unfollowing:", error);
        }
      }

      async isFollowing(fromPubKey, toPubKey) {
        if (!this.manager) {
          console.error("Manager not initialized.");
          return false;
        }

        try {
          const followList = await this.getFollowList(fromPubKey);
          return followList.some(tag => tag[1] === toPubKey);
        } catch (error) {
          console.error("Error checking if following:", error);
          return false;
        }
      }

      async followsMe(otherPubKey) {
        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to check if being followed.");
          return false;
        }

        return await this.isFollowing(otherPubKey, this.manager.publicKey);
      }

      async iFollow(otherPubKey) {
        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to check if following someone.");
          return false;
        }

        return await this.isFollowing(this.manager.publicKey, otherPubKey);
      }

      async getFollowedPubKeys() {
        if (!this.manager || !this.manager.publicKey) {
          console.error("User must be logged in to retrieve followed list.");
          return [];
        }

        const followList = await this.getFollowList(this.manager.publicKey);
        return followList.map(tag => tag[1]); // Annahme, dass die Pubkeys an der zweiten Stelle des Tag Arrays stehen.
      }

      async fetchFollowedEvents() {
        const followedPubKeys = await this.getFollowedPubKeys();
        if (followedPubKeys.length === 0) {
          return [];
        }

        try {
          const events = await this.cache.getEventsByCriteria({
            kinds: [NOSTR_KIND_IDEA], // Oder andere relevante Event-Typen
            authors: followedPubKeys
          });
          return events;
        } catch (error) {
          console.error("Error fetching events for followed profiles:", error);
          return [];
        }
      }

      // Aufräumfunktion, um die Subscriptions zu beenden
      cleanup() {
        this.cacheSubscription();
        this.managerSubscription();
      }
    }

    const socialMediaManager = new SocialMediaManager();

    var css_248z$A = ".balance-display.svelte-1ny4mlp{font-size:2rem;margin-right:20px;color:white}.sat-symbol.svelte-1ny4mlp{height:40px;margin-left:5px}";
    styleInject(css_248z$A);

    /* src/components/Toolbar/Toolbar.svelte generated by Svelte v3.59.1 */

    function create_if_block_5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<img src="../../img/lightning.png" alt="Support via Bitcoin Lightning"/>`;
    			attr(button, "class", "support-button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (102:16) {#if creator_profile && creator_profile.picture}
    function create_if_block_4(ctx) {
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*creator_profile*/ ctx[2],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*creator_profile*/ 4) profileimg_changes.profile = /*creator_profile*/ ctx[2];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    		}
    	};
    }

    // (108:16) {#if githubRepo}
    function create_if_block_3(ctx) {
    	let a;
    	let i;

    	return {
    		c() {
    			a = element("a");
    			i = element("i");
    			attr(i, "class", "fab fa-github text-white github-icon-size");
    			attr(a, "href", /*formattedGithubRepo*/ ctx[4]);
    			attr(a, "target", "_blank");
    			set_style(a, "line-height", "30px");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, i);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*formattedGithubRepo*/ 16) {
    				attr(a, "href", /*formattedGithubRepo*/ ctx[4]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    // (118:16) {#if (lnAddress || (creator_profile && creator_profile.picture) || githubRepo) && profile && profile.picture}
    function create_if_block_2$2(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "vertical-separator");
    			set_style(span, "margin", "0px 0px");
    			set_style(span, "border-left", "2px solid white");
    			set_style(span, "height", "40px");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (124:16) {#if profile && profile.picture}
    function create_if_block_1$6(ctx) {
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[3],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 8) profileimg_changes.profile = /*profile*/ ctx[3];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    		}
    	};
    }

    // (133:20) {:else}
    function create_else_block$4(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*$balance*/ ctx[5]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$balance*/ 32) set_data(t, /*$balance*/ ctx[5]);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (131:20) {#if $balance == -1}
    function create_if_block$m(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("0");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment$S(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let t5;
    	let img;
    	let img_src_value;
    	let current;
    	let if_block0 = /*lnAddress*/ ctx[0] && create_if_block_5(ctx);
    	let if_block1 = /*creator_profile*/ ctx[2] && /*creator_profile*/ ctx[2].picture && create_if_block_4(ctx);
    	let if_block2 = /*githubRepo*/ ctx[1] && create_if_block_3(ctx);
    	let if_block3 = (/*lnAddress*/ ctx[0] || /*creator_profile*/ ctx[2] && /*creator_profile*/ ctx[2].picture || /*githubRepo*/ ctx[1]) && /*profile*/ ctx[3] && /*profile*/ ctx[3].picture && create_if_block_2$2();
    	let if_block4 = /*profile*/ ctx[3] && /*profile*/ ctx[3].picture && create_if_block_1$6(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$balance*/ ctx[5] == -1) return create_if_block$m;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block5 = current_block_type(ctx);

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			if (if_block4) if_block4.c();
    			t4 = space();
    			div0 = element("div");
    			if_block5.c();
    			t5 = space();
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "../../img/sat.svg")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Sat Symbol");
    			attr(img, "class", "sat-symbol svelte-1ny4mlp");
    			attr(div0, "class", "balance-display flex items-center svelte-1ny4mlp");
    			attr(div1, "class", "content-icons");
    			attr(div2, "class", "content-overlay");
    			attr(div3, "class", "text-3xl text-white flex items-center gap-6 px-4");
    			set_style(div4, "position", "fixed");
    			set_style(div4, "top", "0");
    			set_style(div4, "left", "0");
    			set_style(div4, "width", "100%");
    			set_style(div4, "background", "transparent");
    			set_style(div4, "z-index", "1000");
    			set_style(div4, "padding", "10px 0");
    			attr(div4, "class", "flex justify-between items-center");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t1);
    			if (if_block2) if_block2.m(div1, null);
    			append(div1, t2);
    			if (if_block3) if_block3.m(div1, null);
    			append(div1, t3);
    			if (if_block4) if_block4.m(div1, null);
    			append(div1, t4);
    			append(div1, div0);
    			if_block5.m(div0, null);
    			append(div0, t5);
    			append(div0, img);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*lnAddress*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*creator_profile*/ ctx[2] && /*creator_profile*/ ctx[2].picture) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*creator_profile*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*githubRepo*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(div1, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if ((/*lnAddress*/ ctx[0] || /*creator_profile*/ ctx[2] && /*creator_profile*/ ctx[2].picture || /*githubRepo*/ ctx[1]) && /*profile*/ ctx[3] && /*profile*/ ctx[3].picture) {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_2$2();
    					if_block3.c();
    					if_block3.m(div1, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*profile*/ ctx[3] && /*profile*/ ctx[3].picture) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*profile*/ 8) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_1$6(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(div1, t4);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block5) {
    				if_block5.p(ctx, dirty);
    			} else {
    				if_block5.d(1);
    				if_block5 = current_block_type(ctx);

    				if (if_block5) {
    					if_block5.c();
    					if_block5.m(div0, t5);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block4);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			transition_out(if_block4);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if_block5.d();
    		}
    	};
    }

    function ensureHttpScheme(url) {
    	if (!url) return url;

    	if (!url.startsWith("http://") && !url.startsWith("https://")) {
    		return "https://" + url;
    	}

    	return url;
    }

    function instance$R($$self, $$props, $$invalidate) {
    	let formattedGithubRepo;
    	let $nostrManager;
    	let $balance;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(7, $nostrManager = $$value));
    	component_subscribe($$self, balance, $$value => $$invalidate(5, $balance = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(8, $nostrCache = $$value));
    	let { lnAddress } = $$props;
    	let { pubkey } = $$props;
    	let { githubRepo } = $$props;
    	let creator_profile = null;
    	let profile = null;

    	onMount(async () => {
    		await getBalance();
    	});

    	async function getBalance() {
    		if ($balance == -1 && $nostrManager && $nostrManager.publicKey && $nostrManager.extensionAvailable()) {
    			await webln.enable();
    			const result = await webln.getBalance();
    			balance.set(result["balance"]);
    		}
    	}

    	async function fetchProfiles() {
    		if ($nostrManager) {
    			// Profile des Erstellers abrufen, wenn pubkey vorhanden ist
    			if (pubkey) {
    				fetchCreatorProfile();
    			}

    			// Eigenes Profil abrufen
    			fetchOwnProfile();
    		}
    	}

    	async function fetchCreatorProfile() {
    		try {
    			$$invalidate(2, creator_profile = await socialMediaManager.getProfile(pubkey));
    		} catch(error) {
    			console.error("Error fetching creator profile:", error);
    		}
    	}

    	async function fetchOwnProfile() {
    		if (!$nostrManager.publicKey) {
    			return;
    		}

    		try {
    			$$invalidate(3, profile = await socialMediaManager.getProfile($nostrManager.publicKey));
    		} catch(error) {
    			console.error("Error fetching own profile:", error);
    		}
    	}

    	const click_handler = () => sendSatsLNurl(lnAddress);

    	$$self.$$set = $$props => {
    		if ('lnAddress' in $$props) $$invalidate(0, lnAddress = $$props.lnAddress);
    		if ('pubkey' in $$props) $$invalidate(6, pubkey = $$props.pubkey);
    		if ('githubRepo' in $$props) $$invalidate(1, githubRepo = $$props.githubRepo);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*githubRepo*/ 2) {
    			$$invalidate(4, formattedGithubRepo = ensureHttpScheme(githubRepo));
    		}

    		if ($$self.$$.dirty & /*$nostrManager, $nostrCache*/ 384) {
    			// Reaktive Anweisung, die auf Änderungen im nostrManager und nostrCache hört
    			(fetchProfiles());
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 128) {
    			(getBalance());
    		}
    	};

    	return [
    		lnAddress,
    		githubRepo,
    		creator_profile,
    		profile,
    		formattedGithubRepo,
    		$balance,
    		pubkey,
    		$nostrManager,
    		$nostrCache,
    		click_handler
    	];
    }

    class Toolbar extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$R, create_fragment$S, safe_not_equal, { lnAddress: 0, pubkey: 6, githubRepo: 1 });
    	}
    }

    var css_248z$z = ".like-icon.svelte-168p8ba{cursor:pointer;color:var(--heart-color, #f7931a)}.like-icon.filled.svelte-168p8ba{color:#f7931a}.like-icon.svelte-168p8ba:hover{color:#b4690e}";
    styleInject(css_248z$z);

    /* src/components/LikeIcon.svelte generated by Svelte v3.59.1 */

    function create_fragment$R(ctx) {
    	let span1;
    	let i;
    	let i_class_value;
    	let t0;
    	let span0;
    	let t1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			span1 = element("span");
    			i = element("i");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*likesCount*/ ctx[0]);
    			attr(i, "class", i_class_value = "" + (null_to_empty(`like-icon fa${/*liked*/ ctx[1] ? "s" : "r"} fa-heart ${/*liked*/ ctx[1] ? "filled" : ""}`) + " svelte-168p8ba"));
    			attr(span1, "class", "like-container");
    		},
    		m(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, i);
    			append(span1, t0);
    			append(span1, span0);
    			append(span0, t1);

    			if (!mounted) {
    				dispose = listen(i, "click", function () {
    					if (is_function(/*userPublicKey*/ ctx[2]
    					? /*toggleLike*/ ctx[3]
    					: undefined)) (/*userPublicKey*/ ctx[2]
    					? /*toggleLike*/ ctx[3]
    					: undefined).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*liked*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(`like-icon fa${/*liked*/ ctx[1] ? "s" : "r"} fa-heart ${/*liked*/ ctx[1] ? "filled" : ""}`) + " svelte-168p8ba"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*likesCount*/ 1) set_data(t1, /*likesCount*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(span1);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$Q($$self, $$props, $$invalidate) {
    	let userPublicKey;
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(6, $nostrManager = $$value));
    	let { event_id } = $$props;
    	let likesCount = 0;
    	let liked = false;

    	const checkLikes = async () => {
    		$$invalidate(0, likesCount = await socialMediaManager.getLikes(event_id));
    		$$invalidate(1, liked = await socialMediaManager.checkIfLiked(event_id));
    	};

    	const toggleLike = async () => {
    		if (!userPublicKey) {
    			console.error("User must be logged in to toggle likes.");
    			return;
    		}

    		if (liked) {
    			await socialMediaManager.unlikeEvent(event_id);
    			$$invalidate(0, likesCount--, likesCount);
    		} else {
    			await socialMediaManager.likeEvent(event_id);
    			$$invalidate(0, likesCount++, likesCount);
    		}

    		$$invalidate(1, liked = !liked);
    	};

    	onMount(() => {
    		checkLikes();
    		socialMediaManager.subscribeLikes(event_id);

    		return () => {
    			socialMediaManager.unsubscribeLikes(event_id);
    		};
    	});

    	$$self.$$set = $$props => {
    		if ('event_id' in $$props) $$invalidate(4, event_id = $$props.event_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 64) {
    			// Verwende einen reaktiven Ausdruck, um auf Änderungen im NostrManager zu reagieren
    			$$invalidate(2, userPublicKey = $nostrManager ? $nostrManager.publicKey : null);
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 32) {
    			(checkLikes());
    		}
    	};

    	return [
    		likesCount,
    		liked,
    		userPublicKey,
    		toggleLike,
    		event_id,
    		$nostrCache,
    		$nostrManager
    	];
    }

    class LikeIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$Q, create_fragment$R, safe_not_equal, { event_id: 4 });
    	}
    }

    var css_248z$y = ".share-icon.svelte-99v011{color:#f7931a;cursor:pointer;font-size:24px;transition:color 0.3s}.share-icon.svelte-99v011:hover{color:#b4690e}";
    styleInject(css_248z$y);

    /* src/components/ShareIcon.svelte generated by Svelte v3.59.1 */

    function create_fragment$Q(ctx) {
    	let i;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			i = element("i");
    			attr(i, "class", "fas fa-retweet share-icon svelte-99v011");
    			attr(i, "title", "Share Idea");
    		},
    		m(target, anchor) {
    			insert(target, i, anchor);

    			if (!mounted) {
    				dispose = listen(i, "click", /*shareIdea*/ ctx[0]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(i);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$P($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(2, $nostrCache = $$value));
    	let { event_id } = $$props;
    	let ideaEvent = null;

    	async function fetchIdea() {
    		ideaEvent = await $nostrCache.getEventById(event_id);

    		if (!ideaEvent) {
    			console.error("Idea event not found");
    			return;
    		}
    	}

    	async function shareIdea() {
    		if (!ideaEvent) {
    			console.error("No idea event to share");
    			return;
    		}

    		// Erstellen des Inhalts für das Content Event
    		const content = `${ideaEvent.tags.find(tag => tag[0] === "iName")[1]} - ${ideaEvent.tags.find(tag => tag[0] === "iSub")[1]}\n\n${ideaEvent.tags.find(tag => tag[0] === "abstract")[1]}\n\nhttps://bitspark.bitsperity.dev/idea/${event_id}`;

    		const tags = [["s", "bitspark"]];

    		// Senden des Content Events
    		await $nostrManager.sendEvent(1, content, tags);
    	}

    	onMount(fetchIdea);

    	$$self.$$set = $$props => {
    		if ('event_id' in $$props) $$invalidate(1, event_id = $$props.event_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 4) {
    			(fetchIdea());
    		}
    	};

    	return [shareIdea, event_id, $nostrCache];
    }

    class ShareIcon extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$P, create_fragment$Q, safe_not_equal, { event_id: 1 });
    	}
    }

    /* src/components/Cards/IdeaCard.svelte generated by Svelte v3.59.1 */

    function create_fragment$P(ctx) {
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*card*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let h4;
    	let t3_value = /*card*/ ctx[0].subtitle + "";
    	let t3;
    	let t4;
    	let p;
    	let t5_value = truncateMessage$1(/*card*/ ctx[0].abstract, 500) + "";
    	let t5;
    	let t6;
    	let div2;
    	let likeicon;
    	let t7;
    	let shareicon;
    	let current;
    	let mounted;
    	let dispose;
    	likeicon = new LikeIcon({ props: { event_id: /*card*/ ctx[0].id } });
    	shareicon = new ShareIcon({ props: { event_id: /*card*/ ctx[0].id } });

    	return {
    		c() {
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			h4 = element("h4");
    			t3 = text(t3_value);
    			t4 = space();
    			p = element("p");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			create_component(likeicon.$$.fragment);
    			t7 = space();
    			create_component(shareicon.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) attr(img, "src", img_src_value);
    			attr(img, "alt", img_alt_value = "Banner of " + /*card*/ ctx[0].name);
    			attr(img, "class", "bitspark-card-banner-image");
    			attr(div0, "class", "content");
    			attr(div1, "class", "bitspark-card-content");
    			attr(div2, "class", "bitspark-card-actions");
    			attr(div3, "class", "bitspark-card");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, img);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, h3);
    			append(h3, t1);
    			append(div0, t2);
    			append(div0, h4);
    			append(h4, t3);
    			append(div0, t4);
    			append(div0, p);
    			append(p, t5);
    			append(div3, t6);
    			append(div3, div2);
    			mount_component(likeicon, div2, null);
    			append(div2, t7);
    			mount_component(shareicon, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div1, "click", /*goToIdea*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*card*/ 1 && !src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) {
    				attr(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*card*/ 1 && img_alt_value !== (img_alt_value = "Banner of " + /*card*/ ctx[0].name)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*card*/ 1) && t1_value !== (t1_value = /*card*/ ctx[0].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*card*/ 1) && t3_value !== (t3_value = /*card*/ ctx[0].subtitle + "")) set_data(t3, t3_value);
    			if ((!current || dirty & /*card*/ 1) && t5_value !== (t5_value = truncateMessage$1(/*card*/ ctx[0].abstract, 500) + "")) set_data(t5, t5_value);
    			const likeicon_changes = {};
    			if (dirty & /*card*/ 1) likeicon_changes.event_id = /*card*/ ctx[0].id;
    			likeicon.$set(likeicon_changes);
    			const shareicon_changes = {};
    			if (dirty & /*card*/ 1) shareicon_changes.event_id = /*card*/ ctx[0].id;
    			shareicon.$set(shareicon_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(likeicon.$$.fragment, local);
    			transition_in(shareicon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(likeicon.$$.fragment, local);
    			transition_out(shareicon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_component(likeicon);
    			destroy_component(shareicon);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function truncateMessage$1(message, maxLength) {
    	const strippedMessage = message.replace(/<[^>]+>/g, "");

    	return strippedMessage.length <= maxLength
    	? message
    	: message.slice(0, maxLength) + "...";
    }

    function instance$O($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(2, $nostrManager = $$value));
    	let { card } = $$props;

    	function goToIdea() {
    		navigate(`/idea/${card.id}`);
    	}

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (card) {
    			socialMediaManager.getProfile(card.pubkey);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 4) {
    			(initialize());
    		}
    	};

    	return [card, goToIdea, $nostrManager];
    }

    class IdeaCard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$O, create_fragment$P, safe_not_equal, { card: 0 });
    	}
    }

    // feedSelectionStore.js

    // Erstellen eines Svelte Stores mit dem initialen Wert 'verified'
    const selectedFeed = writable('hot');

    // Funktion, um den Feed-Typ zu setzen
    function setFeed(feedType) {
        selectedFeed.set(feedType);
    }

    var css_248z$x = ".feed-selector.svelte-11ro3cj.svelte-11ro3cj{display:flex;background-color:#f9f9f9;padding:8px 16px;border-radius:25px;box-shadow:0 4px 6px rgba(0, 0, 0, 0.1);margin-bottom:20px}.feed-selector.svelte-11ro3cj button.svelte-11ro3cj{flex:1;border:none;background:none;padding:10px 20px;margin-right:10px;border-radius:20px;font-size:16px;transition:background-color 0.3s,\n            color 0.3s;cursor:pointer;outline:none;display:flex;align-items:center;justify-content:center}.feed-selector.svelte-11ro3cj button.svelte-11ro3cj:last-child{margin-right:0}.feed-selector.svelte-11ro3cj button.svelte-11ro3cj:hover{background-color:#e2e8f0}.feed-selector.svelte-11ro3cj button.active.svelte-11ro3cj{background-color:#f7931a;color:white}.feed-selector.svelte-11ro3cj i.svelte-11ro3cj{margin-right:5px}";
    styleInject(css_248z$x);

    /* src/components/Feed/FeedSelector.svelte generated by Svelte v3.59.1 */

    function create_if_block$l(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-user-friends svelte-11ro3cj"></i> Followed`;
    			attr(button, "class", "svelte-11ro3cj");
    			toggle_class(button, "active", /*$selectedFeed*/ ctx[0] === "followed");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler_1*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selectedFeed*/ 1) {
    				toggle_class(button, "active", /*$selectedFeed*/ ctx[0] === "followed");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$O(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let t2;
    	let button1;
    	let t4;
    	let button2;
    	let mounted;
    	let dispose;
    	let if_block = /*$nostrManager*/ ctx[1] && /*$nostrManager*/ ctx[1].publicKey && create_if_block$l(ctx);

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			button0.innerHTML = `<i class="fas fa-fire svelte-11ro3cj"></i> Hot`;
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			button1 = element("button");
    			button1.innerHTML = `<i class="fas fa-check-circle svelte-11ro3cj"></i> Verified`;
    			t4 = space();
    			button2 = element("button");
    			button2.innerHTML = `<i class="fas fa-globe svelte-11ro3cj"></i> Global`;
    			attr(button0, "class", "svelte-11ro3cj");
    			toggle_class(button0, "active", /*$selectedFeed*/ ctx[0] === "hot");
    			attr(button1, "class", "svelte-11ro3cj");
    			toggle_class(button1, "active", /*$selectedFeed*/ ctx[0] === "verified");
    			attr(button2, "class", "svelte-11ro3cj");
    			toggle_class(button2, "active", /*$selectedFeed*/ ctx[0] === "unverified");
    			attr(div, "class", "feed-selector svelte-11ro3cj");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(div, t1);
    			if (if_block) if_block.m(div, null);
    			append(div, t2);
    			append(div, button1);
    			append(div, t4);
    			append(div, button2);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[3]),
    					listen(button1, "click", /*click_handler_2*/ ctx[5]),
    					listen(button2, "click", /*click_handler_3*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$selectedFeed*/ 1) {
    				toggle_class(button0, "active", /*$selectedFeed*/ ctx[0] === "hot");
    			}

    			if (/*$nostrManager*/ ctx[1] && /*$nostrManager*/ ctx[1].publicKey) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$l(ctx);
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$selectedFeed*/ 1) {
    				toggle_class(button1, "active", /*$selectedFeed*/ ctx[0] === "verified");
    			}

    			if (dirty & /*$selectedFeed*/ 1) {
    				toggle_class(button2, "active", /*$selectedFeed*/ ctx[0] === "unverified");
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$N($$self, $$props, $$invalidate) {
    	let $selectedFeed;
    	let $nostrManager;
    	component_subscribe($$self, selectedFeed, $$value => $$invalidate(0, $selectedFeed = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(1, $nostrManager = $$value));

    	const selectFeed = type => {
    		setFeed(type);
    	};

    	const click_handler = () => selectFeed("hot");
    	const click_handler_1 = () => selectFeed("followed");
    	const click_handler_2 = () => selectFeed("verified");
    	const click_handler_3 = () => selectFeed("unverified");

    	return [
    		$selectedFeed,
    		$nostrManager,
    		selectFeed,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class FeedSelector extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$N, create_fragment$O, safe_not_equal, {});
    	}
    }

    // ZapManager.js

    class ZapManager {

        // Abonniert Zaps für ein bestimmtes Event
        subscribeZaps(eventId) {
            const manager = get_store_value(nostrManager);
            if (manager) {
                manager.subscribeToEvents({
                    kinds: [9735], // Kind für Zap-Events
                    "#e": [eventId],
                });
            }
        }

        // Berechnet die Gesamtanzahl der Zaps für ein Event
        getTotalZaps(eventId) {
            const cache = get_store_value(nostrCache);
            const zaps = cache.getEventsByCriteria({
                kinds: [9735],
                tags: { e: [eventId] },
            });

            let totalReceivedSats = 0;
            zaps.forEach(zap => {
                const descriptionTag = zap.tags.find(tag => tag[0] === "description");
                if (descriptionTag) {
                    try {
                        const descriptionData = JSON.parse(descriptionTag[1]);
                        const amountMillisats = parseInt(
                            descriptionData.tags.find(tag => tag[0] === "amount")?.[1],
                            10,
                        );
                        totalReceivedSats += amountMillisats / 1000; // Umrechnung in Sats
                    } catch (error) {
                        console.error("Fehler beim Parsen der Zap-Description:", error);
                    }
                }
            });

            return totalReceivedSats;
        }
    }

    const zapManager = new ZapManager();

    var css_248z$w = ".feed-selector-container.svelte-10kpwlz{display:flex;justify-content:center;padding:20px}";
    styleInject(css_248z$w);

    /* src/components/Feed/Feed.svelte generated by Svelte v3.59.1 */

    function get_each_context$f(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (176:8) {#each ideas as idea (idea.id)}
    function create_each_block$f(key_1, ctx) {
    	let div;
    	let ideacard;
    	let t;
    	let current;
    	ideacard = new IdeaCard({ props: { card: /*idea*/ ctx[13] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			create_component(ideacard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(ideacard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const ideacard_changes = {};
    			if (dirty & /*ideas*/ 1) ideacard_changes.card = /*idea*/ ctx[13];
    			ideacard.$set(ideacard_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(ideacard.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(ideacard.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(ideacard);
    		}
    	};
    }

    function create_fragment$N(ctx) {
    	let div0;
    	let feedselector;
    	let t;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	feedselector = new FeedSelector({});
    	let each_value = /*ideas*/ ctx[0];
    	const get_key = ctx => /*idea*/ ctx[13].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$f(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$f(key, child_ctx));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			create_component(feedselector.$$.fragment);
    			t = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "feed-selector-container svelte-10kpwlz");
    			attr(div1, "class", "row");
    			attr(div2, "class", "container mx-auto px-4");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			mount_component(feedselector, div0, null);
    			insert(target, t, anchor);
    			insert(target, div2, anchor);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*ideas*/ 1) {
    				each_value = /*ideas*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$f, null, get_each_context$f);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(feedselector.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(feedselector.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			destroy_component(feedselector);
    			if (detaching) detach(t);
    			if (detaching) detach(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function transformIdeaToCard(idea) {
    	const tags = idea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    	return {
    		id: idea.id,
    		name: tags.iName,
    		subtitle: tags.iSub,
    		bannerImage: tags.ibUrl,
    		message: idea.content,
    		abstract: tags.abstract,
    		pubkey: idea.pubkey
    	};
    }

    function instance$M($$self, $$props, $$invalidate) {
    	let $selectedFeed;
    	let $nostrCache;
    	let $nostrManager;
    	let $relaysStore;
    	component_subscribe($$self, selectedFeed, $$value => $$invalidate(2, $selectedFeed = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(3, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, relaysStore, $$value => $$invalidate(5, $relaysStore = $$value));
    	let ideas = [];
    	let { category } = $$props;

    	const subscribeFollowList = async () => {
    		if ($nostrManager?.publicKey) {
    			socialMediaManager.subscribeFollowList($nostrManager.publicKey);
    		}
    	};

    	function initialize() {
    		if ($nostrManager) {
    			$nostrManager.subscribeToEvents({
    				kinds: [NOSTR_KIND_IDEA],
    				"#s": ["bitspark"]
    			});

    			updateFeed();
    		}
    	}

    	onMount(() => {
    		initialize();
    	});

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll(); // Diese Methode müsste in Ihrem nostrManager definiert sein
    	});

    	async function fetchVerified() {
    		let criteria = {
    			kinds: [NOSTR_KIND_IDEA],
    			tags: { s: ["bitspark"] }
    		};

    		if (category) {
    			criteria.tags.c = [category];
    		}

    		const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);
    		const tempVerifiedCards = [];

    		await Promise.all(fetchedEvents.map(async idea => {
    			const card = transformIdeaToCard(idea);
    			let profile = await socialMediaManager.getProfile(idea.pubkey);

    			if (profile) {
    				if (profile.verified) {
    					tempVerifiedCards.push(card);
    				}
    			}
    		}));

    		// Zuweisen der temporären Arrays zu den reaktiven Arrays für das UI-Rendering
    		return tempVerifiedCards;
    	}

    	async function fetchUnverified() {
    		let criteria = {
    			kinds: [NOSTR_KIND_IDEA],
    			tags: { s: ["bitspark"] }
    		};

    		if (category) {
    			criteria.tags.c = [category];
    		}

    		const fetchedEvents = await $nostrCache.getEventsByCriteria(criteria);
    		const tempUnverifiedCards = [];

    		await Promise.all(fetchedEvents.map(async idea => {
    			const card = transformIdeaToCard(idea);
    			let profile = await socialMediaManager.getProfile(idea.pubkey);

    			if (profile) {
    				if (!profile.verified) {
    					tempUnverifiedCards.push(card);
    				}
    			}
    		}));

    		return tempUnverifiedCards;
    	}

    	async function fetchHot() {
    		const allIdeas = await $nostrCache.getEventsByCriteria({
    			kinds: [NOSTR_KIND_IDEA], // Fetch all idea type events
    			
    		});

    		const ideaWithMetrics = await Promise.all(allIdeas.map(async idea => {
    			await zapManager.subscribeZaps(idea.id);
    			await socialMediaManager.subscribeLikes(idea.id);
    			const likes = await socialMediaManager.getLikes(idea.id);
    			const sats = await zapManager.getTotalZaps(idea.id);
    			return { ...idea, likes, sats };
    		}));

    		// Sort ideas by a combination of likes and sats, adjust the weighting as necessary
    		ideaWithMetrics.sort((a, b) => b.likes + b.sats - (a.likes + a.sats));

    		// Convert the sorted ideas to the card format and return the top N results
    		return ideaWithMetrics.slice(0, 10).map(transformIdeaToCard); // Top 10 hot ideas
    	}

    	async function fetchFollowed() {
    		const followedEvents = await socialMediaManager.fetchFollowedEvents();
    		return followedEvents.map(transformIdeaToCard);
    	}

    	async function updateFeed() {
    		switch ($selectedFeed) {
    			case "verified":
    				$$invalidate(0, ideas = await fetchVerified());
    				break;
    			case "unverified":
    				$$invalidate(0, ideas = await fetchUnverified());
    				break;
    			case "hot":
    				$$invalidate(0, ideas = await fetchHot());
    				break;
    			case "followed":
    				$$invalidate(0, ideas = await fetchFollowed());
    				break;
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('category' in $$props) $$invalidate(1, category = $$props.category);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*category*/ 2) {
    			(updateFeed(), category);
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			(initialize(), $nostrManager);
    		}

    		if ($$self.$$.dirty & /*$relaysStore*/ 32) {
    			(updateFeed(), $relaysStore);
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			(subscribeFollowList(), $nostrManager);
    		}

    		if ($$self.$$.dirty & /*$nostrManager, $nostrCache*/ 24) {
    			if ($nostrManager && $nostrCache) {
    				updateFeed();
    			}
    		}

    		if ($$self.$$.dirty & /*$selectedFeed*/ 4) {
    			// Abonniere den selectedFeed Store, um auf Änderungen zu reagieren.
    			(updateFeed());
    		}
    	};

    	return [ideas, category, $selectedFeed, $nostrCache, $nostrManager, $relaysStore];
    }

    class Feed extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$M, create_fragment$N, safe_not_equal, { category: 1 });
    	}
    }

    /* src/views/Home.svelte generated by Svelte v3.59.1 */

    function create_fragment$M(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let feed;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: bannerImage$5,
    				title: title$5,
    				subtitle: subtitle$5,
    				show_right_text: true
    			}
    		});

    	toolbar = new Toolbar({});
    	feed = new Feed({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(feed.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			attr(div1, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(banner, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(feed, div0, null);
    			append(div1, t3);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*$contentContainerClass*/ 1) {
    				attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(feed.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(feed.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(feed);
    			destroy_component(footer);
    		}
    	};
    }

    let bannerImage$5 = "../../img/Banner1u.png";
    let title$5 = "BitSpark";
    let subtitle$5 = "idea engine";

    function instance$L($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(0, $contentContainerClass = $$value));
    	return [$contentContainerClass];
    }

    class Home extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$L, create_fragment$M, safe_not_equal, {});
    	}
    }

    /* src/views/Tutorial.svelte generated by Svelte v3.59.1 */

    function create_else_block$3(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.textContent = "Loading...";
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (27:4) {#if tutorial}
    function create_if_block$k(ctx) {
    	let banner;
    	let t0;
    	let toolbar;
    	let t1;
    	let div3;
    	let div2;
    	let div1;
    	let h2;
    	let t2_value = /*tutorial*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let div0;
    	let raw_value = /*tutorial*/ ctx[0].content + "";
    	let current;

    	banner = new Banner({
    			props: {
    				bannerImage: /*tutorial*/ ctx[0].bannerImage,
    				title: /*tutorial*/ ctx[0].title,
    				subtitle: /*tutorial*/ ctx[0].subtitle,
    				show_right_text: false
    			}
    		});

    	toolbar = new Toolbar({});

    	return {
    		c() {
    			create_component(banner.$$.fragment);
    			t0 = space();
    			create_component(toolbar.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			attr(h2, "class", "base-h2 text-color-df");
    			attr(div0, "class", "single-card-content text-color-df");
    			attr(div1, "class", "text-center mt-6 px-6");
    			attr(div2, "class", "single-card container");
    			attr(div3, "class", /*$contentContainerClass*/ ctx[1]);
    		},
    		m(target, anchor) {
    			mount_component(banner, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(toolbar, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, h2);
    			append(h2, t2);
    			append(div1, t3);
    			append(div1, div0);
    			div0.innerHTML = raw_value;
    			current = true;
    		},
    		p(ctx, dirty) {
    			const banner_changes = {};
    			if (dirty & /*tutorial*/ 1) banner_changes.bannerImage = /*tutorial*/ ctx[0].bannerImage;
    			if (dirty & /*tutorial*/ 1) banner_changes.title = /*tutorial*/ ctx[0].title;
    			if (dirty & /*tutorial*/ 1) banner_changes.subtitle = /*tutorial*/ ctx[0].subtitle;
    			banner.$set(banner_changes);
    			if ((!current || dirty & /*tutorial*/ 1) && t2_value !== (t2_value = /*tutorial*/ ctx[0].title + "")) set_data(t2, t2_value);
    			if ((!current || dirty & /*tutorial*/ 1) && raw_value !== (raw_value = /*tutorial*/ ctx[0].content + "")) div0.innerHTML = raw_value;
    			if (!current || dirty & /*$contentContainerClass*/ 2) {
    				attr(div3, "class", /*$contentContainerClass*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(banner, detaching);
    			if (detaching) detach(t0);
    			destroy_component(toolbar, detaching);
    			if (detaching) detach(t1);
    			if (detaching) detach(div3);
    		}
    	};
    }

    function create_fragment$L(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let current;
    	menu = new Sidebar({});
    	const if_block_creators = [create_if_block$k, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tutorial*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div = element("div");
    			if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr(div, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div);
    			if_blocks[current_block_type_index].m(div, null);
    			append(main, t1);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			if_blocks[current_block_type_index].d();
    			destroy_component(footer);
    		}
    	};
    }

    function instance$K($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(1, $contentContainerClass = $$value));
    	let { id } = $$props;
    	let tutorial = null;

    	onMount(async () => {
    		$$invalidate(0, tutorial = tutorials[Number(id)]);
    		console.log("done");
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 4) {
    			{
    				$$invalidate(0, tutorial = tutorials[id]);
    			}
    		}
    	};

    	return [tutorial, $contentContainerClass, id];
    }

    class Tutorial extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$K, create_fragment$L, safe_not_equal, { id: 2 });
    	}
    }

    var css_248z$v = ".card.svelte-17539e2{background:transparent;overflow:hidden;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;border:4px solid #ffffff;box-shadow:0 5px 10px #0000008c;margin-right:15px;margin-left:15px;margin-bottom:15px}.card.svelte-17539e2:hover{transform:scale(1.03);background:#ffffff;box-shadow:0 10px 20px #0000008c}.card-content.svelte-17539e2{cursor:pointer;background:#ffffff}.banner-image.svelte-17539e2{width:100%;height:250px;object-fit:cover}.content.svelte-17539e2{text-align:center;padding:1rem}";
    styleInject(css_248z$v);

    /* src/components/Cards/IdeaCardSmall.svelte generated by Svelte v3.59.1 */

    function create_fragment$K(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div1;
    	let h4;
    	let t1_value = /*card*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let div0;
    	let t3_value = /*card*/ ctx[0].subtitle + "";
    	let t3;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h4 = element("h4");
    			t1 = text(t1_value);
    			t2 = space();
    			div0 = element("div");
    			t3 = text(t3_value);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) attr(img, "src", img_src_value);
    			attr(img, "alt", img_alt_value = "Banner of " + /*card*/ ctx[0].name);
    			attr(img, "class", "banner-image svelte-17539e2");
    			attr(h4, "class", "text-xl font-bold");
    			attr(div0, "class", "text-md font-light mt-2");
    			attr(div1, "class", "content svelte-17539e2");
    			attr(div2, "class", "card-content svelte-17539e2");
    			attr(div3, "class", "card svelte-17539e2");
    			attr(div4, "class", "md:w-6/12 lg:w-3/12");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, img);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, h4);
    			append(h4, t1);
    			append(div1, t2);
    			append(div1, div0);
    			append(div0, t3);

    			if (!mounted) {
    				dispose = listen(div2, "click", /*goToIdea*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*card*/ 1 && !src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*card*/ 1 && img_alt_value !== (img_alt_value = "Banner of " + /*card*/ ctx[0].name)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if (dirty & /*card*/ 1 && t1_value !== (t1_value = /*card*/ ctx[0].name + "")) set_data(t1, t1_value);
    			if (dirty & /*card*/ 1 && t3_value !== (t3_value = /*card*/ ctx[0].subtitle + "")) set_data(t3, t3_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div4);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$J($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(2, $nostrManager = $$value));
    	let { card } = $$props;

    	function goToIdea() {
    		navigate(`/idea/${card.id}`);
    	}

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		socialMediaManager.getProfile(card.pubkey);
    	}

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 4) {
    			(initialize());
    		}
    	};

    	return [card, goToIdea, $nostrManager];
    }

    class IdeaCardSmall extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$J, create_fragment$K, safe_not_equal, { card: 0 });
    	}
    }

    /* src/components/Widgets/UserIdeasWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$e(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (78:8) {#if profile}
    function create_if_block$j(ctx) {
    	let h4;
    	let t0_value = /*profile*/ ctx[1].name + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = text("'s Ideas");
    			attr(h4, "class", "base-h4 text-color-df");
    			set_style(h4, "margin-bottom", "1.5rem");
    		},
    		m(target, anchor) {
    			insert(target, h4, anchor);
    			append(h4, t0);
    			append(h4, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*profile*/ 2 && t0_value !== (t0_value = /*profile*/ ctx[1].name + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(h4);
    		}
    	};
    }

    // (84:12) {#each ideas as idea (idea.id)}
    function create_each_block$e(key_1, ctx) {
    	let first;
    	let ideacardsmall;
    	let current;
    	ideacardsmall = new IdeaCardSmall({ props: { card: /*idea*/ ctx[7] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(ideacardsmall.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(ideacardsmall, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const ideacardsmall_changes = {};
    			if (dirty & /*ideas*/ 1) ideacardsmall_changes.card = /*idea*/ ctx[7];
    			ideacardsmall.$set(ideacardsmall_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(ideacardsmall.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(ideacardsmall.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(ideacardsmall, detaching);
    		}
    	};
    }

    function create_fragment$J(ctx) {
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*profile*/ ctx[1] && create_if_block$j(ctx);
    	let each_value = /*ideas*/ ctx[0];
    	const get_key = ctx => /*idea*/ ctx[7].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$e(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$e(key, child_ctx));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "row");
    			attr(div1, "class", "px-6 py-6");
    			attr(div2, "class", "single-card container");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$j(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*ideas*/ 1) {
    				each_value = /*ideas*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$e, null, get_each_context$e);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$I($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(3, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	let { profile_id } = $$props;
    	let ideas = [];
    	let profile = null;

    	onMount(() => {
    		// Initialisierung, wenn der Manager bereits existiert
    		if ($nostrManager) {
    			initialize();
    		}
    	});

    	function initialize() {
    		// Abonnieren der Events für das Profil und die Ideen
    		$nostrManager.subscribeToEvents({
    			kinds: [0, NOSTR_KIND_IDEA], // Profil und Ideen
    			authors: [profile_id],
    			"#s": ["bitspark"]
    		});
    	}

    	onDestroy(() => {
    		// Beenden der Abonnements bei Zerstörung der Komponente
    		$nostrManager.unsubscribeAll();
    	});

    	async function fetchData() {
    		try {
    			// Abrufen des Profils aus dem Cache
    			$$invalidate(1, profile = await socialMediaManager.getProfile(profile_id));

    			// Abrufen der Ideen des Benutzers
    			const ideaEvents = $nostrCache.getEventsByCriteria({
    				kinds: [NOSTR_KIND_IDEA],
    				authors: [profile_id],
    				tags: { s: ["bitspark"] }
    			});

    			$$invalidate(0, ideas = ideaEvents.map(idea => {
    				const tags = idea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    				return {
    					id: idea.id,
    					name: tags.iName,
    					subtitle: tags.iSub,
    					bannerImage: tags.ibUrl,
    					message: idea.content,
    					abstract: tags.abstract
    				};
    			}));
    		} catch(error) {
    			console.error("Error fetching user ideas:", error);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(2, profile_id = $$props.profile_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			// Reaktive Anweisung, um bei Änderungen des Managers Daten zu aktualisieren
    			$nostrManager && fetchData();
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			$nostrManager && initialize();
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 8) {
    			// Reaktive Anweisung, um bei Änderungen des Caches Daten zu aktualisieren
    			$nostrCache && fetchData();
    		}
    	};

    	return [ideas, profile, profile_id, $nostrCache, $nostrManager];
    }

    class UserIdeasWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$I, create_fragment$J, safe_not_equal, { profile_id: 2 });
    	}
    }

    // NostrJobManager.js

    class NostrJobManager {
      constructor() {
        this.init();
      }

      init() {
        // Initialisiere die Store-Abonnements
        this.cacheSubscription = this.subscribeToStore(nostrCache, (value) => {
          this.cache = value;
        });

        this.managerSubscription = this.subscribeToStore(nostrManager, (value) => {
          this.manager = value;
        });
      }

      subscribeToStore(store, updateFunction) {
        if (!store) {
          return;
        }
        console.log(store);
        const unsubscribe = store.subscribe(updateFunction);
        return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
      }

      async subscribeJobRelatedEvents(jobId) {
        if (!jobId) return;

        if (!this.manager) {
          console.error("NostrManager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [NOSTR_KIND_JOB],
          "#e": [jobId],
          "#s": ["bitspark"],
        });
      }

      async subscribeUserRelatedJobs(publicKey) {
        if (!publicKey) {
          console.error("Public key is required to subscribe to jobs and offers.");
          return;
        }

        if (!this.manager) {
          console.error("NostrManager is not initialized.");
          return;
        }

        // Abonniere eigene Job-Postings und Angebote
        this.manager.subscribeToEvents({
          kinds: [NOSTR_KIND_JOB],
          authors: [publicKey],
          "#t": ["job"],
          "#t": ["offer"],
          "#s": ["bitspark"],
        });
      }

      async fetchUserRelatedJobs(publicKey) {
        if (!publicKey) {
          console.error("Public key is required to fetch jobs and offers.");
          return [];
        }
        let jobIdsFromOffers = new Set();
        let jobs = this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          authors: [publicKey],
          tags: { s: ["bitspark"], t: ["job"] },
        });

        // Offers abrufen und Job-IDs extrahieren
        const offers = this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          authors: [publicKey],
          tags: { s: ["bitspark"], t: ["offer"] },
        });

        offers.forEach((offer) => {
          const jobIdTag = offer.tags.find((tag) => tag[0] === "e");
          if (jobIdTag) {
            jobIdsFromOffers.add(jobIdTag[1]);
          }
        });

        // Jobs für extrahierte Job-IDs abonnieren
        jobIdsFromOffers.forEach((jobId) => {
          this.manager.subscribeToEvents({
            kinds: [NOSTR_KIND_JOB],
            ids: [jobId],
            "#s": ["bitspark"],
            "#t": ["job"],
          });
        });

        let uniqueJobsMap = new Map();

        // Jobs zu Map hinzufügen (Duplikate werden entfernt)
        jobs.forEach((job) => {
          uniqueJobsMap.set(job.id, job);
        });

        // Jobs aus Job-IDs von Offers hinzufügen
        jobIdsFromOffers.forEach((jobId) => {
          const job = this.cache.getEventById(jobId);
          if (job) {
            uniqueJobsMap.set(job.id, job);
          }
        });

        // Umwandeln der Map in Array und Sortierung
        jobs = Array.from(uniqueJobsMap.values());
        jobs.sort((a, b) => b.created_at - a.created_at);
        return jobs;
      }


      subscribeIdea(ideaId) {
        if (!ideaId) {
          console.error("Idea ID is required to subscribe to an idea.");
          return;
        }

        if (!this.manager) {
          console.error("NostrManager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [NOSTR_KIND_IDEA],
          ids: [ideaId],
          "#s": ["bitspark"],
        });

        console.log(`Subscribed to idea updates for ideaId: ${ideaId}`);
      }

      async loadJobEvent(jobId) {
        if (!jobId) {
          console.error("Job ID is required to load job event.");
          return null;
        }

        const jobEvent = await this.cache.getEventById(jobId);
        if (!jobEvent) {
          console.error("Job event not found.");
          return null;
        }

        return jobEvent;
      }


      async isCreator(eventId, userPubKey) {
        if (!eventId) {
          console.error("Idea ID is required to check if the user is the idea creator.");
          return false;
        }

        const creator = await this.getCreator(eventId);
        if (userPubKey === creator) {
          console.log("User is the idea creator.");
          return true;
        } else {
          console.log("User is not the idea creator.");
          return false;
        }
      }

      async getCreator(eventID) {
        if (!eventID) {
          console.error("Idea ID is required to check if the user is the idea creator.");
          return false;
        }

        const ideaEvent = await this.cache.getEventById(eventID);
        if (!ideaEvent) {
          // this.manager.subscribeIdea(ideaId);
          return;
        }
        return ideaEvent.pubkey;
      }

      async getJobApprovalStatus(jobId) {
        if (!jobId) {
          console.error("Job ID is required to check the job approval status.");
          return;
        }

        const creator = await this.getCreator(jobId);

        const responses = await this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          authors: [creator],
          tags: {
            e: [jobId],
            t: ["job_approved", "job_declined"],
            s: ["bitspark"],
          },
        });

        const sortedResponses = responses.sort((a, b) => a.created_at - b.created_at);
        if (sortedResponses.length > 0) {
          const latestResponse = sortedResponses[0];
          return latestResponse.tags.find((tag) => tag[0] === "t")[1];
        } else {
          console.log("No approval status found for the job.");
          return "pending";
        }
      }

      async setJobApprovalStatus(jobId, approval) {
        if (!jobId) {
          console.error("Job ID is required to change the approval status.");
          return;
        }

        if (!this.manager || !this.manager.write_mode) {
          console.error("NostrManager is not ready or write mode is not enabled.");
          return;
        }

        const event = await this.cache.getEventById(jobId);
        const witnessEventString = btoa(JSON.stringify(event));

        const tags = [
          ["e", jobId],
          ["t", approval ? "job_approved" : "job_declined"],
          ["witness", witnessEventString],
          ["s", "bitspark"],
        ];

        try {
          await this.manager.sendEvent(NOSTR_KIND_JOB, approval ? "JobApproval" : "JobDecline", tags);
          console.log(`Job approval status changed to ${approval ? "approved" : "declined"}.`);
        } catch (error) {
          console.error("Error changing job approval status:", error);
        }
      }

      async submitRating(event, rating, comment) {
        if (!this.manager || !this.manager.write_mode) {
          console.error("NostrManager is not ready or write mode is not enabled.");
          return;
        }

        const witnessTag = event.tags.find(tag => tag[0] === "witness");
        if (!witnessTag) {
          console.error("Witness tag missing in event");
          return;
        }
        const witnessedEventString = witnessTag[1];
        const witnessedEvent = JSON.parse(atob(witnessedEventString));
        const creatorPubkey = witnessedEvent.pubkey;

        const jobIdTag = event.tags.find(tag => tag[0] === "e");
        const offerIdTag = event.tags.find(tag => tag[0] === "o");

        const jobId = jobIdTag ? jobIdTag[1] : null;
        const offerId = offerIdTag ? offerIdTag[1] : null;

        const tags = [
          ["t", "review"],
          jobId ? ["e", jobId] : null,
          offerId ? ["o", offerId] : null,
          ["e", event.id],
          ["p", creatorPubkey],
          ["rating", rating.toString()],
          ["s", "bitspark"]
        ].filter(Boolean); // Removes any null values

        try {
          await this.manager.sendEvent(NOSTR_KIND_JOB, comment, tags);
          console.log("Rating submitted successfully");
        } catch (error) {
          console.error("Error submitting rating:", error);
        }
      }

      async checkOfferStatus(offerId) {
        if (!offerId) {
          console.error("Offer ID is required to check the offer status.");
          return "pending";
        }

        const responses = await this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          tags: {
            o: [offerId],
            t: ["ao", "do"],
            s: ["bitspark"],
          },
        });

        if (responses.length > 0) {
          const statusTag = responses[0].tags.find(tag => tag[0] === "t")[1];
          return statusTag === "ao" ? "accepted" : "declined";
        }

        return "pending";
      }

      async getJobId(offerId) {
        if (!offerId) {
          console.error("Offer ID is required to get the job ID.");
          return null;
        }

        const offerEvent = await this.cache.getEventById(offerId);
        if (!offerEvent) {
          console.error("Offer event not found.");
          return null;
        }

        const jobIdTag = offerEvent.tags.find(tag => tag[0] === "e");
        if (!jobIdTag) {
          console.error("Job ID tag not found in the offer event.");
          return null;
        }

        return jobIdTag[1];
      }

      async setOfferApprovalStatus(offerId, accept) {
        if (!this.manager || !this.manager.write_mode) {
          console.error("NostrManager is not ready or write mode is not enabled.");
          return;
        }

        const jobId = await this.getJobId(offerId);
        if (!jobId) {
          console.error("Unable to retrieve job ID from offer ID:", offerId);
          return;
        }
        const event = await this.cache.getEventById(offerId);
        const witnessEventString = btoa(JSON.stringify(event));

        
        const responseType = accept ? "ao" : "do";
        const content = accept ? "OfferApproval" : "OfferDecline";
        
        const tags = [
          ["t", responseType],
          ["e", jobId],
          ["o", offerId],
          ["witness", witnessEventString],
          ["s", "bitspark"],
          // Die Verwendung eines "witness" Tags könnte von der Logik und den Anforderungen der Anwendung abhängen
        ];

        try {
          await this.manager.sendEvent(NOSTR_KIND_JOB, content, tags);
          console.log(`Response ${content} sent successfully for offerId: ${offerId}`);
        } catch (error) {
          console.error("Error sending response:", error);
        }
      }

      async loadOffer(offerId) {
        if (!offerId) {
          console.error("Offer ID is required to load offer details.");
          return null;
        }

        const offerEvents = await this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          ids: [offerId],
        });

        if (offerEvents && offerEvents.length > 0) {
          return offerEvents[0];
        } else {
          console.error("Offer not found.");
          return null;
        }
      }

      async sendPR(offerId, prUrl) {
        if (!this.manager || !this.manager.write_mode) {
          console.error("NostrManager is not ready or write mode is not enabled.");
          return;
        }

        if (!offerId || !prUrl) {
          console.error("Offer ID and PR URL are required.");
          return;
        }

        // Holen des Events, das das Angebot genehmigt hat
        const approvalEvent = await this.getOfferApprovalEvent(offerId);
        if (!approvalEvent) {
          console.error("Approval event for the offer not found.");
          return;
        }

        const jobId = await this.getJobId(offerId);
        if (!jobId) {
          console.error("Unable to retrieve job ID from offer ID:", offerId);
          return;
        }

        const witnessEventString = btoa(JSON.stringify(approvalEvent));

        const tags = [
          ["s", "bitspark"],
          ["t", "pr"],
          ["e", jobId], // Job ID
          ["o", offerId], // Offer ID
          ["pr_url", prUrl], // URL des Pull Requests
          ["witness", witnessEventString], // Zeuge des genehmigten Angebots
        ];

        try {
          await this.manager.sendEvent(NOSTR_KIND_JOB, "PR", tags);
          console.log("Pull Request submitted successfully.");
        } catch (error) {
          console.error("Error sending Pull Request:", error);
        }
      }

      // Diese Hilfsmethode holt das Genehmigungsevent für ein Angebot
      async getOfferApprovalEvent(offerId) {
        const responses = await this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          tags: {
            o: [offerId],
            t: ["ao"], // Tag für Angebot genehmigt
            s: ["bitspark"],
          },
        });

        if (responses.length > 0) {
          // Rückgabe des neuesten Genehmigungsevents, wenn vorhanden
          return responses[responses.length - 1];
        } else {
          return null;
        }
      }

      async getPRStatus(prId) {
        if (!prId) {
          console.error("PR ID is required to check PR status.");
          return "pending";
        }

        // Lade das PR-Event, um die Job- und Offer-IDs zu extrahieren
        const prEvent = await this.cache.getEventById(prId);
        if (!prEvent) {
          console.error("PR event not found.");
          return "pending";
        }

        const jobIdTag = prEvent.tags.find(tag => tag[0] === "e");
        const offerIdTag = prEvent.tags.find(tag => tag[0] === "o");
        if (!jobIdTag || !offerIdTag) {
          console.error("Job ID or Offer ID tag missing in PR event.");
          return "pending";
        }

        const jobId = jobIdTag[1];
        const offerId = offerIdTag[1];

        // Suche nach Events, die den Status des PR festlegen
        const responses = await this.cache.getEventsByCriteria({
          kinds: [NOSTR_KIND_JOB],
          tags: {
            e: [jobId],
            pr: [prId],
            o: [offerId],
            t: ["apr", "dpr"],
          },
        });

        // Bestimme den Status basierend auf dem neuesten relevanten Event
        if (responses.length > 0) {
          const latestResponse = responses[responses.length - 1]; // Nehme das neueste Event
          const statusTag = latestResponse.tags.find(tag => tag[0] === "t")[1];
          return statusTag === "apr" ? "accepted" : "declined";
        }

        return "pending";
      }

      async handlePRResponse(prId, isAccepted) {
        if (!this.manager || !this.manager.write_mode) {
          console.error("NostrManager is not ready or write mode is not enabled.");
          return;
        }

        if (!prId) {
          console.error("PR ID is required to handle PR response.");
          return;
        }

        // Lade das PR-Event, um die Job- und Offer-IDs zu extrahieren
        const prEvent = await this.cache.getEventById(prId);
        if (!prEvent) {
          console.error("PR event not found.");
          return;
        }

        const jobIdTag = prEvent.tags.find(tag => tag[0] === "e");
        const offerIdTag = prEvent.tags.find(tag => tag[0] === "o");
        if (!jobIdTag || !offerIdTag) {
          console.error("Job ID or Offer ID tag missing in PR event.");
          return;
        }

        const jobId = jobIdTag[1];
        const offerId = offerIdTag[1];
        const responseType = isAccepted ? "apr" : "dpr"; // "apr" für Akzeptanz, "dpr" für Ablehnung
        const witnessEventString = btoa(JSON.stringify(prEvent)); // Kodiere das PR-Event als Witness-String

        const tags = [
          ["s", "bitspark"],
          ["t", responseType],
          ["o", offerId],
          ["e", jobId],
          ["pr", prId],
          ["witness", witnessEventString]
        ];

        try {
          await this.manager.sendEvent(NOSTR_KIND_JOB, isAccepted ? "PRApproval" : "PRDecline", tags);
          console.log(`PR response '${isAccepted ? "accepted" : "declined"}' sent successfully for PR ID:`, prId);
        } catch (error) {
          console.error(`Error sending PR response '${isAccepted ? "accepted" : "declined"}' for PR ID:`, prId, error);
        }
      }


      // Aufräumfunktion, um die Subscriptions zu beenden
      cleanup() {
        this.cacheSubscription();
        this.managerSubscription();
      }
    }

    const nostrJobManager = new NostrJobManager();

    var css_248z$u = ".profile-container.svelte-sz68iv.svelte-sz68iv{width:70px;height:70px;flex-shrink:0;border-radius:50%;overflow:hidden;margin:0 15px}.content.svelte-sz68iv.svelte-sz68iv{flex-grow:1;overflow:hidden;max-width:calc(\n            100% - 90px\n        )}.rating-popup-overlay.svelte-sz68iv.svelte-sz68iv{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.6);display:flex;justify-content:center;align-items:center;z-index:10}.rating-popup.svelte-sz68iv.svelte-sz68iv{background-color:white;padding:20px;border-radius:8px;box-shadow:0 0 15px rgba(0, 0, 0, 0.3);width:300px}.star-rating.svelte-sz68iv.svelte-sz68iv{display:flex;justify-content:center;margin-bottom:15px}.star.svelte-sz68iv.svelte-sz68iv{cursor:pointer;font-size:2em;color:#ffd700}.star.selected.svelte-sz68iv.svelte-sz68iv{color:#f39c12}textarea.svelte-sz68iv.svelte-sz68iv{width:100%;border:1px solid #ccc;border-radius:5px;padding:10px;margin-bottom:10px}.button-group.svelte-sz68iv.svelte-sz68iv{display:flex;justify-content:space-between}.button-group.svelte-sz68iv button.svelte-sz68iv{padding:8px 15px;border-radius:5px;border:none;cursor:pointer;background-color:#4caf50;color:white}.button-group.svelte-sz68iv button.svelte-sz68iv:last-child{background-color:#f44336}.blur.svelte-sz68iv.svelte-sz68iv{filter:blur(4px)}.rating-btn.svelte-sz68iv.svelte-sz68iv{border:none;background:none;cursor:pointer;color:#fcd535;position:absolute;top:10px;right:10px}textarea.svelte-sz68iv.svelte-sz68iv{width:100%;border:1px solid #ccc;border-radius:5px;padding:10px;margin-bottom:10px;resize:vertical}.bubble.svelte-sz68iv.svelte-sz68iv{width:80%;min-width:0;max-width:calc(100% - 20px);position:relative;display:flex;align-items:center;gap:15px;padding:10px;border-radius:8px;margin:10px auto;margin-bottom:10px}.own-message.svelte-sz68iv.svelte-sz68iv{flex-direction:row-reverse;justify-content:flex-end;margin-right:2%;margin-left:auto}.other-message.svelte-sz68iv.svelte-sz68iv{flex-direction:row;justify-content:flex-start;margin-left:2%;margin-right:auto}.content.svelte-sz68iv.svelte-sz68iv{margin-left:15px;flex-grow:1;overflow:hidden;padding:10px;order:1}.timestamp.svelte-sz68iv.svelte-sz68iv{color:#888;font-size:0.8em;text-align:right}.timestamp.left.svelte-sz68iv.svelte-sz68iv{text-align:left}.timestamp.right.svelte-sz68iv.svelte-sz68iv{text-align:right}";
    styleInject(css_248z$u);

    /* src/components/JobManager2/BaseBubble.svelte generated by Svelte v3.59.1 */

    function get_each_context$d(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (79:4) {#if profile && profile.picture}
    function create_if_block_2$1(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[7],
    				style: {
    					"object-fit": "cover",
    					"border-radius": "50%"
    				}
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			attr(div, "class", "profile-container svelte-sz68iv");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 128) profileimg_changes.profile = /*profile*/ ctx[7];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (97:4) {#if showRatingButton}
    function create_if_block_1$5(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-star"></i>`;
    			attr(button, "class", "rating-btn svelte-sz68iv");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*toggleRatingPopup*/ ctx[14]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (104:0) {#if showRatingPopup}
    function create_if_block$i(ctx) {
    	let div3;
    	let div2;
    	let h3;
    	let t1;
    	let div0;
    	let t2;
    	let textarea;
    	let t3;
    	let div1;
    	let button0;
    	let t5;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*stars*/ ctx[12];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$d(get_each_context$d(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div3 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Leave a Rating";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Submit";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			attr(div0, "class", "star-rating svelte-sz68iv");
    			attr(textarea, "placeholder", "Your comment...");
    			attr(textarea, "class", "svelte-sz68iv");
    			attr(button0, "class", "svelte-sz68iv");
    			attr(button1, "class", "svelte-sz68iv");
    			attr(div1, "class", "button-group svelte-sz68iv");
    			attr(div2, "class", "rating-popup svelte-sz68iv");
    			attr(div3, "class", "rating-popup-overlay svelte-sz68iv");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, h3);
    			append(div2, t1);
    			append(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append(div2, t2);
    			append(div2, textarea);
    			set_input_value(textarea, /*comment*/ ctx[11]);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, button0);
    			append(div1, t5);
    			append(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[22]),
    					listen(button0, "click", /*submitRating*/ ctx[15]),
    					listen(button1, "click", /*toggleRatingPopup*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*stars, rating, setRating*/ 13312) {
    				each_value = /*stars*/ ctx[12];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$d(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$d(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*comment*/ 2048) {
    				set_input_value(textarea, /*comment*/ ctx[11]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (109:16) {#each stars as star}
    function create_each_block$d(ctx) {
    	let span;
    	let t;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[21](/*star*/ ctx[25]);
    	}

    	return {
    		c() {
    			span = element("span");
    			t = text("★\n                    ");
    			attr(span, "class", span_class_value = "" + (null_to_empty(`star ${/*star*/ ctx[25] <= /*rating*/ ctx[10] ? "selected" : ""}`) + " svelte-sz68iv"));
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);

    			if (!mounted) {
    				dispose = listen(span, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*rating*/ 1024 && span_class_value !== (span_class_value = "" + (null_to_empty(`star ${/*star*/ ctx[25] <= /*rating*/ ctx[10] ? "selected" : ""}`) + " svelte-sz68iv"))) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$I(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let t2;
    	let div0_class_value;
    	let t3;
    	let div2_class_value;
    	let t4;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*profile*/ ctx[7] && /*profile*/ ctx[7].picture && create_if_block_2$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
    	let if_block1 = /*showRatingButton*/ ctx[0] && create_if_block_1$5(ctx);
    	let if_block2 = /*showRatingPopup*/ ctx[9] && create_if_block$i(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div0 = element("div");
    			t2 = text(/*formattedDate*/ ctx[8]);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr(div0, "class", div0_class_value = "timestamp " + (/*isOwnMessage*/ ctx[6] ? 'left' : 'right') + " svelte-sz68iv");
    			attr(div1, "class", "content svelte-sz68iv");

    			attr(div2, "class", div2_class_value = "" + (null_to_empty(`bubble ${/*isOwnMessage*/ ctx[6]
			? "own-message"
			: "other-message"} ${/*status*/ ctx[5]}`) + " svelte-sz68iv"));

    			set_style(div2, "background-color", /*backgroundColor*/ ctx[1]);
    			set_style(div2, "color", /*textColor*/ ctx[2]);
    			set_style(div2, "border-radius", /*borderRadius*/ ctx[4]);
    			set_style(div2, "border-color", /*borderColor*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append(div2, t0);
    			append(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append(div1, t1);
    			append(div1, div0);
    			append(div0, t2);
    			append(div2, t3);
    			if (if_block1) if_block1.m(div2, null);
    			insert(target, t4, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[7] && /*profile*/ ctx[7].picture) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*profile*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 524288)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*formattedDate*/ 256) set_data(t2, /*formattedDate*/ ctx[8]);

    			if (!current || dirty & /*isOwnMessage*/ 64 && div0_class_value !== (div0_class_value = "timestamp " + (/*isOwnMessage*/ ctx[6] ? 'left' : 'right') + " svelte-sz68iv")) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (/*showRatingButton*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty & /*isOwnMessage, status*/ 96 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`bubble ${/*isOwnMessage*/ ctx[6]
			? "own-message"
			: "other-message"} ${/*status*/ ctx[5]}`) + " svelte-sz68iv"))) {
    				attr(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*backgroundColor*/ 2) {
    				set_style(div2, "background-color", /*backgroundColor*/ ctx[1]);
    			}

    			if (!current || dirty & /*textColor*/ 4) {
    				set_style(div2, "color", /*textColor*/ ctx[2]);
    			}

    			if (!current || dirty & /*borderRadius*/ 16) {
    				set_style(div2, "border-radius", /*borderRadius*/ ctx[4]);
    			}

    			if (!current || dirty & /*borderColor*/ 8) {
    				set_style(div2, "border-color", /*borderColor*/ ctx[3]);
    			}

    			if (/*showRatingPopup*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$i(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			if (detaching) detach(t4);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach(if_block2_anchor);
    		}
    	};
    }

    function getFormattedDate(timestamp) {
    	return new Date(timestamp * 1000).toLocaleString();
    }

    function instance$H($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(17, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(18, $nostrManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { event } = $$props;
    	let { backgroundColor = "#f0f0f0" } = $$props;
    	let { textColor = "#333" } = $$props;
    	let { borderColor = "#ddd" } = $$props;
    	let { borderRadius = "8px" } = $$props;
    	let { status = "normal" } = $$props;
    	let { showRatingButton = true } = $$props;
    	let profile = {};
    	let formattedDate = "";
    	let isOwnMessage = false;
    	let showRatingPopup = false;
    	let rating = 0;
    	let comment = "";

    	// Funktionen für die Sternebewertung und das Kommentarfeld
    	let stars = [1, 2, 3, 4, 5]; // Für ein 5-Sterne-Bewertungssystem

    	function setRating(star) {
    		$$invalidate(10, rating = star);
    	}

    	function toggleRatingPopup() {
    		$$invalidate(9, showRatingPopup = !showRatingPopup);
    	}

    	async function submitRating() {
    		nostrJobManager.submitRating(event, rating.toString(), comment);
    	}

    	// Methode, um das Profil des Authors zu laden
    	async function fetchProfile() {
    		$$invalidate(7, profile = await socialMediaManager.getProfile(event.pubkey));
    	}

    	onMount(() => {
    		fetchProfile();
    		checkIfOwnMessage();
    	});

    	function checkIfOwnMessage() {
    		if (!event) {
    			return;
    		}

    		$$invalidate(6, isOwnMessage = event.pubkey === $nostrManager.publicKey);
    	}

    	const click_handler = star => setRating(star);

    	function textarea_input_handler() {
    		comment = this.value;
    		$$invalidate(11, comment);
    	}

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(16, event = $$props.event);
    		if ('backgroundColor' in $$props) $$invalidate(1, backgroundColor = $$props.backgroundColor);
    		if ('textColor' in $$props) $$invalidate(2, textColor = $$props.textColor);
    		if ('borderColor' in $$props) $$invalidate(3, borderColor = $$props.borderColor);
    		if ('borderRadius' in $$props) $$invalidate(4, borderRadius = $$props.borderRadius);
    		if ('status' in $$props) $$invalidate(5, status = $$props.status);
    		if ('showRatingButton' in $$props) $$invalidate(0, showRatingButton = $$props.showRatingButton);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*event*/ 65536) {
    			// Reaktive Anweisung für das Datum
    			if (event && event.created_at) {
    				$$invalidate(8, formattedDate = getFormattedDate(event.created_at));
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 262144) {
    			(checkIfOwnMessage());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 131072) {
    			// Reaktive Anweisung, um auf Änderungen im Cache zu reagieren
    			(fetchProfile());
    		}

    		if ($$self.$$.dirty & /*showRatingButton, isOwnMessage*/ 65) {
    			$$invalidate(0, showRatingButton = showRatingButton && isOwnMessage);
    		}
    	};

    	return [
    		showRatingButton,
    		backgroundColor,
    		textColor,
    		borderColor,
    		borderRadius,
    		status,
    		isOwnMessage,
    		profile,
    		formattedDate,
    		showRatingPopup,
    		rating,
    		comment,
    		stars,
    		setRating,
    		toggleRatingPopup,
    		submitRating,
    		event,
    		$nostrCache,
    		$nostrManager,
    		$$scope,
    		slots,
    		click_handler,
    		textarea_input_handler
    	];
    }

    class BaseBubble extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$H, create_fragment$I, safe_not_equal, {
    			event: 16,
    			backgroundColor: 1,
    			textColor: 2,
    			borderColor: 3,
    			borderRadius: 4,
    			status: 5,
    			showRatingButton: 0
    		});
    	}
    }

    var css_248z$t = "{--textColor:{textColor}}.review-content.svelte-198lics.svelte-198lics{display:flex;flex-direction:column;align-items:flex-start;padding:10px}.review-content.svelte-198lics p.svelte-198lics{margin-top:0;line-height:1.4;color:var(--textColor)}.rating-display.svelte-198lics.svelte-198lics{margin-bottom:5px}.star.svelte-198lics.svelte-198lics{transition:transform 0.3s ease, font-size 0.3s ease}";
    styleInject(css_248z$t);

    /* src/components/JobManager2/ReviewBubble.svelte generated by Svelte v3.59.1 */

    function get_each_context$c(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (29:12) {#each stars as star, i}
    function create_each_block$c(ctx) {
    	let span;
    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text("★");
    			attr(span, "class", "star svelte-198lics");
    			set_style(span, "font-size", /*star*/ ctx[4].size);
    			set_style(span, "color", /*star*/ ctx[4].filled ? '#ffcc00' : '#cccccc');
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*stars*/ 4) {
    				set_style(span, "font-size", /*star*/ ctx[4].size);
    			}

    			if (dirty & /*stars*/ 4) {
    				set_style(span, "color", /*star*/ ctx[4].filled ? '#ffcc00' : '#cccccc');
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (26:0) <BaseBubble event={event} showRatingButton={false} {backgroundColor} {textColor}>
    function create_default_slot$9(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let p;
    	let t1;
    	let each_value = /*stars*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$c(get_each_context$c(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			p = element("p");
    			t1 = text(/*reviewContent*/ ctx[1]);
    			attr(div0, "class", "rating-display svelte-198lics");
    			attr(p, "class", "svelte-198lics");
    			attr(div1, "class", "review-content svelte-198lics");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append(div1, t0);
    			append(div1, p);
    			append(p, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*stars*/ 4) {
    				each_value = /*stars*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$c(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$c(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*reviewContent*/ 2) set_data(t1, /*reviewContent*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function create_fragment$H(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				showRatingButton: false,
    				backgroundColor,
    				textColor,
    				$$slots: { default: [create_default_slot$9] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];

    			if (dirty & /*$$scope, reviewContent, stars*/ 134) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    let backgroundColor = "#FFF176"; // Ein helles Gelb
    let textColor = "#333333"; // Dunkelgrau für guten Kontrast

    function instance$G($$self, $$props, $$invalidate) {
    	let stars;
    	let { event } = $$props;
    	let reviewContent = "Kein Kommentar";
    	let rating = 0;

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*event*/ 1) {
    			// Reaktive Anweisungen, die auf Änderungen von `event` reagieren
    			if (event && event.tags) {
    				$$invalidate(1, reviewContent = event.content);
    				const ratingTag = event.tags.find(tag => tag[0] === "rating");
    				$$invalidate(3, rating = ratingTag ? parseInt(ratingTag[1], 10) : 0);
    			}
    		}

    		if ($$self.$$.dirty & /*rating*/ 8) {
    			// Berechnen Sie die Sterndarstellung
    			$$invalidate(2, stars = Array(5).fill().map((_, i) => ({
    				filled: i < rating,
    				size: rating > 0 ? `calc(1em + ${rating * 0.4}em)` : '1em'
    			})));
    		}
    	};

    	return [event, reviewContent, stars, rating];
    }

    class ReviewBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$G, create_fragment$H, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$s = ".review-stats-header.svelte-envaai{display:flex;align-items:center;justify-content:center;margin-bottom:15px}.average-star.svelte-envaai{font-size:1.4em;color:#cccccc;margin-right:5px}.average-star.active.svelte-envaai{color:#ffcc00}.average-rating-text.svelte-envaai{font-size:1em;color:#333}.reviews-header.svelte-envaai{margin-bottom:15px;font-size:1.2em;color:#333;text-align:center}.review-widget-container.svelte-envaai{background-color:#fff;border-radius:10px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1);padding:20px}.reviews-wrapper.svelte-envaai{height:300px;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}.review-bubble-wrapper.svelte-envaai{width:100%;display:flex;justify-content:center;margin:10px 0}";
    styleInject(css_248z$s);

    /* src/components/Widgets/ReviewWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$b(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (78:8) {#if profile}
    function create_if_block$h(ctx) {
    	let t0_value = /*profile*/ ctx[2].name + "";
    	let t0;
    	let t1;

    	return {
    		c() {
    			t0 = text(t0_value);
    			t1 = text("'s Reviews");
    		},
    		m(target, anchor) {
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*profile*/ 4 && t0_value !== (t0_value = /*profile*/ ctx[2].name + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(t0);
    			if (detaching) detach(t1);
    		}
    	};
    }

    // (83:8) {#each averageStars as star}
    function create_each_block_1$1(ctx) {
    	let span;
    	let t;
    	let span_class_value;

    	return {
    		c() {
    			span = element("span");
    			t = text("★");
    			attr(span, "class", span_class_value = "" + (null_to_empty(`average-star ${/*star*/ ctx[14].active ? "active" : ""}`) + " svelte-envaai"));
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*averageStars*/ 8 && span_class_value !== (span_class_value = "" + (null_to_empty(`average-star ${/*star*/ ctx[14].active ? "active" : ""}`) + " svelte-envaai"))) {
    				attr(span, "class", span_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (89:8) {#each reviewEvents as event}
    function create_each_block$b(ctx) {
    	let div;
    	let reviewbubble;
    	let t;
    	let current;
    	reviewbubble = new ReviewBubble({ props: { event: /*event*/ ctx[11] } });

    	return {
    		c() {
    			div = element("div");
    			create_component(reviewbubble.$$.fragment);
    			t = space();
    			attr(div, "class", "review-bubble-wrapper svelte-envaai");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(reviewbubble, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const reviewbubble_changes = {};
    			if (dirty & /*reviewEvents*/ 2) reviewbubble_changes.event = /*event*/ ctx[11];
    			reviewbubble.$set(reviewbubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(reviewbubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(reviewbubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(reviewbubble);
    		}
    	};
    }

    function create_fragment$G(ctx) {
    	let div2;
    	let h1;
    	let t0;
    	let div0;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let div1;
    	let current;
    	let if_block = /*profile*/ ctx[2] && create_if_block$h(ctx);
    	let each_value_1 = /*averageStars*/ ctx[3];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*reviewEvents*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div2 = element("div");
    			h1 = element("h1");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			span = element("span");
    			t2 = text("(");
    			t3 = text(/*averageRating*/ ctx[0]);
    			t4 = text("/5)");
    			t5 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(h1, "class", "relative flex text-4xl font-bold text-black ml-6 mb-6");
    			attr(span, "class", "average-rating-text svelte-envaai");
    			attr(div0, "class", "review-stats-header svelte-envaai");
    			attr(div1, "class", "reviews-wrapper svelte-envaai");
    			attr(div2, "class", "single-card container review-widget-container svelte-envaai");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, h1);
    			if (if_block) if_block.m(h1, null);
    			append(div2, t0);
    			append(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div0, null);
    				}
    			}

    			append(div0, t1);
    			append(div0, span);
    			append(span, t2);
    			append(span, t3);
    			append(span, t4);
    			append(div2, t5);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$h(ctx);
    					if_block.c();
    					if_block.m(h1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*averageStars*/ 8) {
    				each_value_1 = /*averageStars*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t1);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (!current || dirty & /*averageRating*/ 1) set_data(t3, /*averageRating*/ ctx[0]);

    			if (dirty & /*reviewEvents*/ 2) {
    				each_value = /*reviewEvents*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$b(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$b(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$F($$self, $$props, $$invalidate) {
    	let averageStars;
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(5, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(6, $nostrCache = $$value));
    	let { userPubKey } = $$props;
    	let reviewEvents = [];
    	let profile = null;
    	let averageRating = 0;

    	function initialize() {
    		if ($nostrManager) {
    			$nostrManager.subscribeToEvents({
    				kinds: [NOSTR_KIND_JOB],
    				"#p": [userPubKey],
    				"#t": ["review"]
    			});
    		}
    	}

    	function fetchReviews() {
    		if ($nostrCache) {
    			$$invalidate(1, reviewEvents = $nostrCache.getEventsByCriteria({
    				kinds: [NOSTR_KIND_JOB],
    				tags: { p: [userPubKey], t: ["review"] }
    			}));
    		}

    		fetchProfileName();
    		calculateAverageRating();
    	}

    	function calculateAverageRating() {
    		const totalRating = reviewEvents.reduce(
    			(sum, event) => {
    				const ratingTag = event.tags.find(tag => tag[0] === "rating");
    				return sum + (ratingTag ? parseInt(ratingTag[1], 10) : 0);
    			},
    			0
    		);

    		$$invalidate(0, averageRating = reviewEvents.length > 0
    		? (totalRating / reviewEvents.length).toFixed(2)
    		: 0);
    	}

    	async function fetchProfileName() {
    		$$invalidate(2, profile = await socialMediaManager.getProfile(userPubKey));
    	}

    	onMount(() => {
    		initialize();
    	});

    	onDestroy(() => {
    		if ($nostrManager) {
    			$nostrManager.unsubscribeAll();
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('userPubKey' in $$props) $$invalidate(4, userPubKey = $$props.userPubKey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 64) {
    			$nostrCache && fetchReviews();
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 32) {
    			$nostrManager && initialize();
    		}

    		if ($$self.$$.dirty & /*averageRating*/ 1) {
    			$$invalidate(3, averageStars = Array(5).fill().map((_, i) => ({ active: i < Math.round(averageRating) })));
    		}
    	};

    	return [
    		averageRating,
    		reviewEvents,
    		profile,
    		averageStars,
    		userPubKey,
    		$nostrManager,
    		$nostrCache
    	];
    }

    class ReviewWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$F, create_fragment$G, safe_not_equal, { userPubKey: 4 });
    	}
    }

    /* src/components/ProfileViewImage.svelte generated by Svelte v3.59.1 */

    function create_if_block$g(ctx) {
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[0],
    				style: {
    					position: "absolute",
    					width: "100%",
    					height: "100%",
    					objectFit: "cover",
    					top: "0",
    					left: "0"
    				}
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 1) profileimg_changes.profile = /*profile*/ ctx[0];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    		}
    	};
    }

    function create_fragment$F(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let if_block = /*profile*/ ctx[0] && /*profile*/ ctx[0].picture && create_if_block$g(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr(div0, "class", "single-card-profile-img");
    			attr(div1, "class", "flex justify-center");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*profile*/ ctx[0] && /*profile*/ ctx[0].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*profile*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$g(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$E($$self, $$props, $$invalidate) {
    	let { profile = null } = $$props;

    	$$self.$$set = $$props => {
    		if ('profile' in $$props) $$invalidate(0, profile = $$props.profile);
    	};

    	return [profile];
    }

    class ProfileViewImage extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$E, create_fragment$F, safe_not_equal, { profile: 0 });
    	}
    }

    var css_248z$r = ".follow-button.svelte-awqtfc{display:flex;align-items:center;justify-content:center;padding:10px 20px;border:none;border-radius:20px;cursor:pointer;background-color:#f7931a;color:white;font-size:16px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.2);transition:background-color 0.3s,\n            box-shadow 0.3s}.follow-button.unfollow.svelte-awqtfc{background-color:rgb(44, 82, 130)}.follow-button.disabled.svelte-awqtfc{background-color:grey;cursor:default}.icon.svelte-awqtfc{margin-right:8px}";
    styleInject(css_248z$r);

    /* src/components/FollowButton.svelte generated by Svelte v3.59.1 */

    function create_fragment$E(ctx) {
    	let button;
    	let i;
    	let i_class_value;
    	let t0;
    	let t1_value = (/*following*/ ctx[1] ? " Unfollow" : " Follow") + "";
    	let t1;
    	let button_class_value;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			t1 = text(t1_value);

    			attr(i, "class", i_class_value = "" + (null_to_empty(`icon ${/*following*/ ctx[1]
			? "fas fa-user-minus"
			: "fas fa-user-plus"}`) + " svelte-awqtfc"));

    			attr(button, "class", button_class_value = "" + (null_to_empty(`follow-button ${/*following*/ ctx[1] ? "unfollow" : "follow"} ${!/*$nostrManager*/ ctx[0]?.publicKey ? "disabled" : ""}`) + " svelte-awqtfc"));
    			button.disabled = button_disabled_value = !/*$nostrManager*/ ctx[0]?.publicKey;
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, i);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", /*toggleFollow*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*following*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(`icon ${/*following*/ ctx[1]
			? "fas fa-user-minus"
			: "fas fa-user-plus"}`) + " svelte-awqtfc"))) {
    				attr(i, "class", i_class_value);
    			}

    			if (dirty & /*following*/ 2 && t1_value !== (t1_value = (/*following*/ ctx[1] ? " Unfollow" : " Follow") + "")) set_data(t1, t1_value);

    			if (dirty & /*following, $nostrManager*/ 3 && button_class_value !== (button_class_value = "" + (null_to_empty(`follow-button ${/*following*/ ctx[1] ? "unfollow" : "follow"} ${!/*$nostrManager*/ ctx[0]?.publicKey ? "disabled" : ""}`) + " svelte-awqtfc"))) {
    				attr(button, "class", button_class_value);
    			}

    			if (dirty & /*$nostrManager*/ 1 && button_disabled_value !== (button_disabled_value = !/*$nostrManager*/ ctx[0]?.publicKey)) {
    				button.disabled = button_disabled_value;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$D($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(4, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(0, $nostrManager = $$value));
    	let { profilePubKey } = $$props;
    	let following = false;

    	// Überprüfen, ob der Benutzer bereits folgt
    	const checkFollowingStatus = async () => {
    		if ($nostrManager?.publicKey) {
    			$$invalidate(1, following = await socialMediaManager.iFollow(profilePubKey));
    		}
    	};

    	const subscribeFollowList = async () => {
    		if ($nostrManager?.publicKey) {
    			socialMediaManager.subscribeFollowList($nostrManager.publicKey);
    		}
    	};

    	// Folgen oder Entfolgen je nach aktuellem Status
    	const toggleFollow = async () => {
    		if (!$nostrManager?.publicKey) {
    			console.error("User must be logged in to follow or unfollow.");
    			return;
    		}

    		if (following) {
    			await socialMediaManager.unfollow(profilePubKey);
    		} else {
    			await socialMediaManager.follow(profilePubKey);
    		}

    		$$invalidate(1, following = !following); // Den Follow-Status umschalten
    	};

    	onMount(() => {
    		checkFollowingStatus();
    	});

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll();
    	});

    	$$self.$$set = $$props => {
    		if ('profilePubKey' in $$props) $$invalidate(3, profilePubKey = $$props.profilePubKey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 1) {
    			// Reagiere auf Änderungen in nostrManager und nostrCache
    			(subscribeFollowList());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 16) {
    			(checkFollowingStatus());
    		}
    	};

    	return [$nostrManager, following, toggleFollow, profilePubKey, $nostrCache];
    }

    class FollowButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$D, create_fragment$E, safe_not_equal, { profilePubKey: 3 });
    	}
    }

    var css_248z$q = ".dm-button.svelte-1ek1m50{display:flex;align-items:center;justify-content:center;padding:10px 20px;border:none;border-radius:20px;cursor:pointer;background-color:#f7931a;color:white;font-size:16px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.2);transition:background-color 0.3s,\n            box-shadow 0.3s}.dm-button.disabled.svelte-1ek1m50{background-color:grey;cursor:default}.icon.svelte-1ek1m50{margin-right:8px}";
    styleInject(css_248z$q);

    /* src/components/DMButton.svelte generated by Svelte v3.59.1 */

    function create_fragment$D(ctx) {
    	let button;
    	let i;
    	let t;
    	let button_class_value;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			i = element("i");
    			t = text("\n    Message");
    			attr(i, "class", "icon fas fa-comment svelte-1ek1m50");
    			attr(button, "class", button_class_value = "" + (null_to_empty(`dm-button ${!/*$nostrManager*/ ctx[0]?.publicKey ? "disabled" : ""}`) + " svelte-1ek1m50"));
    			button.disabled = button_disabled_value = !/*$nostrManager*/ ctx[0]?.publicKey;
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, i);
    			append(button, t);

    			if (!mounted) {
    				dispose = listen(button, "click", /*navigateToDM*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$nostrManager*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(`dm-button ${!/*$nostrManager*/ ctx[0]?.publicKey ? "disabled" : ""}`) + " svelte-1ek1m50"))) {
    				attr(button, "class", button_class_value);
    			}

    			if (dirty & /*$nostrManager*/ 1 && button_disabled_value !== (button_disabled_value = !/*$nostrManager*/ ctx[0]?.publicKey)) {
    				button.disabled = button_disabled_value;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(3, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(0, $nostrManager = $$value));
    	let { profilePubKey } = $$props;

    	const navigateToDM = () => {
    		if ($nostrManager?.publicKey) {
    			navigate(`/dm/${profilePubKey}`);
    		} else {
    			console.error("User must be logged in to send a direct message.");
    		}
    	};

    	onMount(() => {
    		
    	}); // Initial setup if needed

    	onDestroy(() => {
    		
    	}); // Cleanup if needed

    	$$self.$$set = $$props => {
    		if ('profilePubKey' in $$props) $$invalidate(2, profilePubKey = $$props.profilePubKey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 1) ;

    		if ($$self.$$.dirty & /*$nostrCache*/ 8) ;
    	};

    	return [$nostrManager, navigateToDM, profilePubKey, $nostrCache];
    }

    class DMButton extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$C, create_fragment$D, safe_not_equal, { profilePubKey: 2 });
    	}
    }

    var css_248z$p = ".button-container.svelte-12als6u{display:flex;justify-content:flex-end;gap:10px;position:relative;top:10px;right:10px;padding:10px}.single-card.svelte-12als6u{position:relative}";
    styleInject(css_248z$p);

    /* src/components/Widgets/ProfileWidget.svelte generated by Svelte v3.59.1 */

    function create_fragment$C(ctx) {
    	let div3;
    	let div0;
    	let dmbutton;
    	let t0;
    	let followbutton;
    	let t1;
    	let profileviewimage;
    	let t2;
    	let div2;
    	let h2;
    	let t3;
    	let t4;
    	let div1;
    	let current;

    	dmbutton = new DMButton({
    			props: { profilePubKey: /*profile_pub*/ ctx[3] }
    		});

    	followbutton = new FollowButton({
    			props: { profilePubKey: /*profile_pub*/ ctx[3] }
    		});

    	profileviewimage = new ProfileViewImage({ props: { profile: /*profile*/ ctx[0] } });

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(dmbutton.$$.fragment);
    			t0 = space();
    			create_component(followbutton.$$.fragment);
    			t1 = space();
    			create_component(profileviewimage.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			h2 = element("h2");
    			t3 = text(/*name*/ ctx[1]);
    			t4 = space();
    			div1 = element("div");
    			attr(div0, "class", "button-container svelte-12als6u");
    			attr(h2, "class", "base-h2 text-color-df");
    			attr(div1, "class", "single-card-content text-color-df");
    			attr(div2, "class", "text-center mt-6 px-6");
    			set_style(div2, "top", "-90px");
    			set_style(div2, "position", "relative");
    			attr(div3, "class", "single-card container svelte-12als6u");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			mount_component(dmbutton, div0, null);
    			append(div0, t0);
    			mount_component(followbutton, div0, null);
    			append(div3, t1);
    			mount_component(profileviewimage, div3, null);
    			append(div3, t2);
    			append(div3, div2);
    			append(div2, h2);
    			append(h2, t3);
    			append(div2, t4);
    			append(div2, div1);
    			div1.innerHTML = /*about*/ ctx[2];
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const dmbutton_changes = {};
    			if (dirty & /*profile_pub*/ 8) dmbutton_changes.profilePubKey = /*profile_pub*/ ctx[3];
    			dmbutton.$set(dmbutton_changes);
    			const followbutton_changes = {};
    			if (dirty & /*profile_pub*/ 8) followbutton_changes.profilePubKey = /*profile_pub*/ ctx[3];
    			followbutton.$set(followbutton_changes);
    			const profileviewimage_changes = {};
    			if (dirty & /*profile*/ 1) profileviewimage_changes.profile = /*profile*/ ctx[0];
    			profileviewimage.$set(profileviewimage_changes);
    			if (!current || dirty & /*name*/ 2) set_data(t3, /*name*/ ctx[1]);
    			if (!current || dirty & /*about*/ 4) div1.innerHTML = /*about*/ ctx[2];		},
    		i(local) {
    			if (current) return;
    			transition_in(dmbutton.$$.fragment, local);
    			transition_in(followbutton.$$.fragment, local);
    			transition_in(profileviewimage.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dmbutton.$$.fragment, local);
    			transition_out(followbutton.$$.fragment, local);
    			transition_out(profileviewimage.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_component(dmbutton);
    			destroy_component(followbutton);
    			destroy_component(profileviewimage);
    		}
    	};
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(5, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(6, $nostrCache = $$value));
    	let { userPubKey } = $$props;
    	let profile = null;
    	let name = "";
    	let about = "";
    	let profile_pub = "";

    	function initialize() {
    		if ($nostrManager) {
    			$nostrManager.subscribeToEvents({
    				kinds: [NOSTR_KIND_JOB],
    				"#p": [userPubKey],
    				"#t": ["review"]
    			});
    		}
    	}

    	async function fetchProfile() {
    		$$invalidate(0, profile = await socialMediaManager.getProfile(userPubKey));

    		if (!profile) {
    			return;
    		}

    		$$invalidate(1, name = profile.name);
    		$$invalidate(3, profile_pub = profile.pubkey);
    		$$invalidate(2, about = profile.dev_about);
    		profile.picture;
    		profile.banner;
    		profile.githubUsername;
    		profile.lud16;
    	}

    	onMount(() => {
    		initialize();
    	});

    	onDestroy(() => {
    		if ($nostrManager) {
    			$nostrManager.unsubscribeAll();
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('userPubKey' in $$props) $$invalidate(4, userPubKey = $$props.userPubKey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*userPubKey*/ 16) {
    			(fetchProfile());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 64) {
    			$nostrCache && fetchProfile();
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 32) {
    			$nostrManager && initialize();
    		}
    	};

    	return [profile, name, about, profile_pub, userPubKey, $nostrManager, $nostrCache];
    }

    class ProfileWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$B, create_fragment$C, safe_not_equal, { userPubKey: 4 });
    	}
    }

    /* src/components/Widgets/Banner/ProfileBannerWidget.svelte generated by Svelte v3.59.1 */

    function create_fragment$B(ctx) {
    	let banner_1;
    	let current;

    	banner_1 = new Banner({
    			props: {
    				bannerImage: /*banner*/ ctx[1],
    				title: /*name*/ ctx[0],
    				subtitle: "",
    				show_right_text: false
    			}
    		});

    	return {
    		c() {
    			create_component(banner_1.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(banner_1, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const banner_1_changes = {};
    			if (dirty & /*banner*/ 2) banner_1_changes.bannerImage = /*banner*/ ctx[1];
    			if (dirty & /*name*/ 1) banner_1_changes.title = /*name*/ ctx[0];
    			banner_1.$set(banner_1_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(banner_1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(banner_1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(banner_1, detaching);
    		}
    	};
    }

    function instance$A($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(3, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	let { profile_id } = $$props;
    	let profile = null;
    	let name = "";
    	let banner = "";

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (!$nostrManager) {
    			return;
    		}

    		socialMediaManager.subscribeProfile(profile_id);
    		fetchProfile();
    	}

    	onDestroy(() => {
    		if (!$nostrManager) {
    			return;
    		}

    		$nostrManager.unsubscribeAll();
    	});

    	async function fetchProfile() {
    		if (!$nostrManager) {
    			return;
    		}

    		profile = await socialMediaManager.getProfile(profile_id);

    		if (!profile) {
    			return;
    		}

    		$$invalidate(0, name = profile.name);
    		$$invalidate(1, banner = profile.banner);
    	}

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(2, profile_id = $$props.profile_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			(initialize());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 8) {
    			(fetchProfile());
    		}
    	};

    	return [name, banner, profile_id, $nostrCache, $nostrManager];
    }

    class ProfileBannerWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$A, create_fragment$B, safe_not_equal, { profile_id: 2 });
    	}
    }

    /* src/views/Profile.svelte generated by Svelte v3.59.1 */

    function create_fragment$A(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let profilebannerwidget;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let profilewidget;
    	let t3;
    	let userideaswidget;
    	let t4;
    	let reviewwidget;
    	let t5;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	profilebannerwidget = new ProfileBannerWidget({
    			props: { profile_id: /*profile_id*/ ctx[0] }
    		});

    	toolbar = new Toolbar({
    			props: {
    				lnAddress: /*lightningAddress*/ ctx[1],
    				githubRepo: /*githubRepo*/ ctx[2]
    			}
    		});

    	profilewidget = new ProfileWidget({
    			props: { userPubKey: /*profile_id*/ ctx[0] }
    		});

    	userideaswidget = new UserIdeasWidget({
    			props: { profile_id: /*profile_id*/ ctx[0] }
    		});

    	reviewwidget = new ReviewWidget({
    			props: { userPubKey: /*profile_id*/ ctx[0] }
    		});

    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(profilebannerwidget.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(profilewidget.$$.fragment);
    			t3 = space();
    			create_component(userideaswidget.$$.fragment);
    			t4 = space();
    			create_component(reviewwidget.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", /*$contentContainerClass*/ ctx[3]);
    			attr(div1, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(profilebannerwidget, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(profilewidget, div0, null);
    			append(div0, t3);
    			mount_component(userideaswidget, div0, null);
    			append(div0, t4);
    			mount_component(reviewwidget, div0, null);
    			append(main, t5);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const profilebannerwidget_changes = {};
    			if (dirty & /*profile_id*/ 1) profilebannerwidget_changes.profile_id = /*profile_id*/ ctx[0];
    			profilebannerwidget.$set(profilebannerwidget_changes);
    			const toolbar_changes = {};
    			if (dirty & /*lightningAddress*/ 2) toolbar_changes.lnAddress = /*lightningAddress*/ ctx[1];
    			if (dirty & /*githubRepo*/ 4) toolbar_changes.githubRepo = /*githubRepo*/ ctx[2];
    			toolbar.$set(toolbar_changes);
    			const profilewidget_changes = {};
    			if (dirty & /*profile_id*/ 1) profilewidget_changes.userPubKey = /*profile_id*/ ctx[0];
    			profilewidget.$set(profilewidget_changes);
    			const userideaswidget_changes = {};
    			if (dirty & /*profile_id*/ 1) userideaswidget_changes.profile_id = /*profile_id*/ ctx[0];
    			userideaswidget.$set(userideaswidget_changes);
    			const reviewwidget_changes = {};
    			if (dirty & /*profile_id*/ 1) reviewwidget_changes.userPubKey = /*profile_id*/ ctx[0];
    			reviewwidget.$set(reviewwidget_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 8) {
    				attr(div0, "class", /*$contentContainerClass*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(profilebannerwidget.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(profilewidget.$$.fragment, local);
    			transition_in(userideaswidget.$$.fragment, local);
    			transition_in(reviewwidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(profilebannerwidget.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(profilewidget.$$.fragment, local);
    			transition_out(userideaswidget.$$.fragment, local);
    			transition_out(reviewwidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(profilebannerwidget);
    			destroy_component(toolbar);
    			destroy_component(profilewidget);
    			destroy_component(userideaswidget);
    			destroy_component(reviewwidget);
    			destroy_component(footer);
    		}
    	};
    }

    function instance$z($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	let $contentContainerClass;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(4, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(5, $nostrManager = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(3, $contentContainerClass = $$value));
    	let { profile_id } = $$props;
    	let profile = null;
    	let githubUsername = "";
    	let lightningAddress = "";
    	let githubRepo = "";

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (!$nostrManager) {
    			return;
    		}

    		socialMediaManager.subscribeProfile(profile_id);
    		fetchProfile();
    	}

    	onDestroy(() => {
    		if (!$nostrManager) {
    			return;
    		}

    		$nostrManager.unsubscribeAll();
    	});

    	async function fetchProfile() {
    		if (!$nostrManager) {
    			return;
    		}

    		profile = await socialMediaManager.getProfile(profile_id);

    		if (!profile) {
    			return;
    		}

    		profile.name;
    		profile.banner;
    		githubUsername = profile.githubUsername;
    		$$invalidate(1, lightningAddress = profile.lud16);

    		if (githubUsername) {
    			$$invalidate(2, githubRepo = "https://www.github.com/" + githubUsername);
    		} else {
    			$$invalidate(2, githubRepo = "");
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('profile_id' in $$props) $$invalidate(0, profile_id = $$props.profile_id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 32) {
    			(initialize());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 16) {
    			(fetchProfile());
    		}

    		if ($$self.$$.dirty & /*profile_id*/ 1) {
    			(fetchProfile());
    		}
    	};

    	return [
    		profile_id,
    		lightningAddress,
    		githubRepo,
    		$contentContainerClass,
    		$nostrCache,
    		$nostrManager
    	];
    }

    class Profile extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$z, create_fragment$A, safe_not_equal, { profile_id: 0 });
    	}
    }

    var css_248z$o = "ul.svelte-1gaioac{list-style-type:disc;padding-left:40px}.relay-item.svelte-1gaioac{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px}.relay-text.svelte-1gaioac{flex-grow:1;font-size:1rem}.add-relay-container.svelte-1gaioac{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.add-relay-input.svelte-1gaioac{flex-grow:1;margin-right:10px;font-size:1rem;height:28px}";
    styleInject(css_248z$o);

    /* src/components/Widgets/RelaySelectionWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$a(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (120:2) {#each relays as relay}
    function create_each_block$a(ctx) {
    	let div;
    	let span;
    	let t0_value = /*relay*/ ctx[16] + "";
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*relay*/ ctx[16]);
    	}

    	return {
    		c() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Remove";
    			t3 = space();
    			attr(span, "class", "relay-text svelte-1gaioac");
    			attr(button, "class", "remove-button");
    			attr(div, "class", "relay-item svelte-1gaioac");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t0);
    			append(div, t1);
    			append(div, button);
    			append(div, t3);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*relays*/ 1 && t0_value !== (t0_value = /*relay*/ ctx[16] + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$z(ctx) {
    	let h5;
    	let t1;
    	let div0;
    	let input;
    	let t2;
    	let button0;
    	let t4;
    	let div1;
    	let t5;
    	let button1;
    	let t7;
    	let button2;
    	let t9;
    	let div3;
    	let t10;
    	let ul;
    	let t16;
    	let div2;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value = /*relays*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
    	}

    	return {
    		c() {
    			h5 = element("h5");
    			h5.textContent = "Relays";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Add";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Add defaults";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Remove defaults";
    			t9 = space();
    			div3 = element("div");
    			t10 = text("Relays are crucial for fetching and publishing your information (ideas,\n  profiles, jobs).\n  ");
    			ul = element("ul");

    			ul.innerHTML = `<li><b>Default vs. Custom</b> - Initially, we use default relays for uniform access.
      Customize relays to change where your data is fetched from and published to.</li> 
    <li><b>Persistence</b> - Changes to relays affect where your data is fetched and
      seen. For these changes to persist across sessions, enable cookies for the
      website, or follow our tutorial for Docker or Umbrel at: tutorial link.</li>`;

    			t16 = text("\n  Remember, adjusting your relays changes where you see and share data. Keep it in\n  mind to maintain your desired visibility.\n  ");
    			div2 = element("div");
    			button3 = element("button");
    			button3.textContent = "Update Relays";
    			attr(h5, "class", "base-h5 text-color-df");
    			attr(input, "type", "text");
    			attr(input, "class", "input-style add-relay-input svelte-1gaioac");
    			attr(input, "placeholder", "Enter new relay URL");
    			attr(button0, "class", "add-button");
    			attr(div0, "class", "add-relay-container svelte-1gaioac");
    			set_style(div1, "margin", "4pt");
    			attr(button1, "class", "add-button");
    			attr(button2, "class", "remove-button");
    			attr(ul, "class", "svelte-1gaioac");
    			attr(button3, "class", "bg-orange-500 text-white font-bold py-2 px-4 rounded");
    			attr(div2, "class", "mx-auto flex justify-end");
    			attr(div3, "class", "relay-text svelte-1gaioac");
    			set_style(div3, "margin-top", "15pt");
    		},
    		m(target, anchor) {
    			insert(target, h5, anchor);
    			insert(target, t1, anchor);
    			insert(target, div0, anchor);
    			append(div0, input);
    			set_input_value(input, /*newRelay*/ ctx[1]);
    			append(div0, t2);
    			append(div0, button0);
    			insert(target, t4, anchor);
    			insert(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			insert(target, t5, anchor);
    			insert(target, button1, anchor);
    			insert(target, t7, anchor);
    			insert(target, button2, anchor);
    			insert(target, t9, anchor);
    			insert(target, div3, anchor);
    			append(div3, t10);
    			append(div3, ul);
    			append(div3, t16);
    			append(div3, div2);
    			append(div2, button3);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[9]),
    					listen(button0, "click", /*addRelay*/ ctx[2]),
    					listen(button1, "click", /*click_handler_1*/ ctx[11]),
    					listen(button2, "click", /*click_handler_2*/ ctx[12]),
    					listen(button3, "click", /*updateRelays*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*newRelay*/ 2 && input.value !== /*newRelay*/ ctx[1]) {
    				set_input_value(input, /*newRelay*/ ctx[1]);
    			}

    			if (dirty & /*removeRelay, relays*/ 9) {
    				each_value = /*relays*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$a(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$a(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(h5);
    			if (detaching) detach(t1);
    			if (detaching) detach(div0);
    			if (detaching) detach(t4);
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t5);
    			if (detaching) detach(button1);
    			if (detaching) detach(t7);
    			if (detaching) detach(button2);
    			if (detaching) detach(t9);
    			if (detaching) detach(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function areSetsEqual(set1, set2) {
    	if (set1.size !== set2.size) return false;

    	for (let item of set1) {
    		if (!set2.has(item)) return false;
    	}

    	return true;
    }

    // Hilfsfunktion zum Erstellen eines Relay-Events
    function createRelayEvent(relays) {
    	const content = ""; // Leerer Inhalt für Relay-Liste
    	const tags = relays.map(relay => ["r", relay]);

    	return {
    		kind: 10002, // Kind für Relay-Liste
    		content,
    		tags
    	};
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(7, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(8, $nostrCache = $$value));
    	let default_relays = ["wss://relay.damus.io", "wss://relay.plebstr.com", "wss://nostr.wine"];
    	let relays = [];
    	let newRelay = "";

    	onMount(async () => {
    		await initialize();
    	});

    	async function initialize() {
    		if ($nostrManager) {
    			$$invalidate(0, relays = $nostrManager.relays);
    		}
    	}

    	function addRelay() {
    		if (newRelay.trim() && !relays.includes(newRelay)) {
    			$$invalidate(0, relays = [...relays, newRelay]);
    			$$invalidate(1, newRelay = "");
    		}
    	}

    	function removeRelay(relayUrl) {
    		$$invalidate(0, relays = relays.filter(relay => relay !== relayUrl));
    	}

    	function addDefaults() {
    		let mergedSet = new Set([...relays, ...default_relays]);
    		$$invalidate(0, relays = Array.from(mergedSet));
    		console.log("default relays added");
    	}

    	function removeDefaults() {
    		$$invalidate(0, relays = relays.filter(relay => !default_relays.includes(relay)));
    		console.log("default relays removed");
    	}

    	async function updateRelays() {
    		if (!$nostrManager || !$nostrManager.write_mode) return;
    		sendUpdateRelaysEvent();
    	}

    	async function sendUpdateRelaysEvent() {
    		if (!$nostrManager || !$nostrManager.write_mode) return;

    		// Holen Sie die aktuellen Relays aus dem Cache
    		const existingRelays = $nostrManager.relays;

    		const existingRelaysSet = new Set(existingRelays);
    		const relaysSet = new Set(relays);

    		if (existingRelaysSet.size == existingRelays.length) {
    			if (areSetsEqual(existingRelaysSet, relaysSet)) {
    				console.log("no relay update required");
    				return;
    			}
    		}

    		const updatedRelays = Array.from(relaysSet);
    		$nostrManager.updateRelays(updatedRelays);

    		// Überprüfen, ob das Relay bereits existiert
    		// Event für die Aktualisierung der Relay-Liste erstellen
    		const relayEvent = createRelayEvent(updatedRelays);

    		// Event senden
    		try {
    			await $nostrManager.sendEvent(relayEvent.kind, relayEvent.content, relayEvent.tags);
    			console.log("Relay added successfully");
    		} catch(error) {
    			console.error("Error adding relay:", error);
    		}
    	}

    	function input_input_handler() {
    		newRelay = this.value;
    		$$invalidate(1, newRelay);
    	}

    	const click_handler = relay => removeRelay(relay);
    	const click_handler_1 = () => addDefaults();
    	const click_handler_2 = () => removeDefaults();

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 128) {
    			(initialize());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			(initialize());
    		}
    	};

    	return [
    		relays,
    		newRelay,
    		addRelay,
    		removeRelay,
    		addDefaults,
    		removeDefaults,
    		updateRelays,
    		$nostrManager,
    		$nostrCache,
    		input_input_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class RelaySelectionWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$y, create_fragment$z, safe_not_equal, {});
    	}
    }

    /* src/components/Widgets/EditProfileWidget.svelte generated by Svelte v3.59.1 */

    function create_fragment$y(ctx) {
    	let div6;
    	let profileviewimage;
    	let t0;
    	let div4;
    	let h2;
    	let t2;
    	let div3;
    	let h50;
    	let t4;
    	let input0;
    	let t5;
    	let h51;
    	let t7;
    	let input1;
    	let t8;
    	let h52;
    	let t10;
    	let input2;
    	let t11;
    	let div2;
    	let div0;
    	let h53;
    	let t13;
    	let input3;
    	let t14;
    	let div1;
    	let h54;
    	let t16;
    	let input4;
    	let t17;
    	let hr0;
    	let t18;
    	let h55;
    	let t20;
    	let input5;
    	let t21;
    	let h56;
    	let t23;
    	let input6;
    	let t24;
    	let hr1;
    	let t25;
    	let relayselectionwidget;
    	let t26;
    	let div5;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	profileviewimage = new ProfileViewImage({ props: { profile: /*profile*/ ctx[0] } });
    	relayselectionwidget = new RelaySelectionWidget({});

    	return {
    		c() {
    			div6 = element("div");
    			create_component(profileviewimage.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Edit Profile";
    			t2 = space();
    			div3 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Name";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			h51 = element("h5");
    			h51.textContent = "About";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			h52 = element("h5");
    			h52.textContent = "Lightning Address";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			div2 = element("div");
    			div0 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Github Username";
    			t13 = space();
    			input3 = element("input");
    			t14 = space();
    			div1 = element("div");
    			h54 = element("h5");
    			h54.textContent = "Github Proof";
    			t16 = space();
    			input4 = element("input");
    			t17 = space();
    			hr0 = element("hr");
    			t18 = space();
    			h55 = element("h5");
    			h55.textContent = "Profile Picture URL";
    			t20 = space();
    			input5 = element("input");
    			t21 = space();
    			h56 = element("h5");
    			h56.textContent = "Banner URL";
    			t23 = space();
    			input6 = element("input");
    			t24 = space();
    			hr1 = element("hr");
    			t25 = space();
    			create_component(relayselectionwidget.$$.fragment);
    			t26 = space();
    			div5 = element("div");
    			button = element("button");
    			button.textContent = "Update Profile";
    			attr(h2, "class", "base-h2 text-color-df");
    			attr(h50, "class", "base-h5 text-color-df");
    			attr(input0, "type", "text");
    			attr(input0, "class", "input-style");
    			attr(h51, "class", "base-h5 text-color-df");
    			attr(input1, "type", "text");
    			attr(input1, "class", "input-style");
    			attr(h52, "class", "base-h5 text-color-df");
    			attr(input2, "type", "text");
    			attr(input2, "class", "input-style");
    			attr(h53, "class", "base-h5 text-color-df");
    			attr(input3, "type", "text");
    			attr(input3, "class", "input-style");
    			set_style(div0, "width", "50%");
    			attr(h54, "class", "base-h5 text-color-df");
    			attr(input4, "type", "text");
    			attr(input4, "class", "input-style");
    			set_style(div1, "width", "50%");
    			attr(div2, "class", "flex space-x-4");
    			attr(hr0, "class", "text-blueGray-600");
    			set_style(hr0, "width", "90%");
    			set_style(hr0, "margin", "auto");
    			set_style(hr0, "margin-top", "30pt");
    			attr(h55, "class", "base-h5 text-color-df");
    			attr(input5, "type", "text");
    			attr(input5, "class", "input-style");
    			attr(h56, "class", "base-h5 text-color-df");
    			attr(input6, "type", "text");
    			attr(input6, "class", "input-style");
    			attr(hr1, "class", "text-blueGray-600");
    			set_style(hr1, "width", "90%");
    			set_style(hr1, "margin", "auto");
    			set_style(hr1, "margin-top", "30pt");
    			attr(div3, "class", "single-card-content text-color-df");
    			set_style(div3, "margin-bottom", "0");
    			attr(div4, "class", "text-center mt-6 px-6 text-color-df");
    			set_style(div4, "top", "-90px");
    			set_style(div4, "position", "relative");
    			attr(button, "class", "bg-orange-500 text-white font-bold py-2 px-4 rounded");
    			attr(div5, "class", "container mx-auto px-4 py-4 flex justify-end");
    			attr(div6, "class", "single-card container");
    		},
    		m(target, anchor) {
    			insert(target, div6, anchor);
    			mount_component(profileviewimage, div6, null);
    			append(div6, t0);
    			append(div6, div4);
    			append(div4, h2);
    			append(div4, t2);
    			append(div4, div3);
    			append(div3, h50);
    			append(div3, t4);
    			append(div3, input0);
    			set_input_value(input0, /*name*/ ctx[1]);
    			append(div3, t5);
    			append(div3, h51);
    			append(div3, t7);
    			append(div3, input1);
    			set_input_value(input1, /*dev_about*/ ctx[2]);
    			append(div3, t8);
    			append(div3, h52);
    			append(div3, t10);
    			append(div3, input2);
    			set_input_value(input2, /*lud16*/ ctx[3]);
    			append(div3, t11);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, h53);
    			append(div0, t13);
    			append(div0, input3);
    			set_input_value(input3, /*git_username*/ ctx[6]);
    			append(div2, t14);
    			append(div2, div1);
    			append(div1, h54);
    			append(div1, t16);
    			append(div1, input4);
    			set_input_value(input4, /*git_proof*/ ctx[7]);
    			append(div3, t17);
    			append(div3, hr0);
    			append(div3, t18);
    			append(div3, h55);
    			append(div3, t20);
    			append(div3, input5);
    			set_input_value(input5, /*picture*/ ctx[4]);
    			append(div3, t21);
    			append(div3, h56);
    			append(div3, t23);
    			append(div3, input6);
    			set_input_value(input6, /*banner*/ ctx[5]);
    			append(div3, t24);
    			append(div3, hr1);
    			append(div3, t25);
    			mount_component(relayselectionwidget, div3, null);
    			append(div6, t26);
    			append(div6, div5);
    			append(div5, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[11]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[12]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[13]),
    					listen(input5, "input", /*input5_input_handler*/ ctx[14]),
    					listen(input6, "input", /*input6_input_handler*/ ctx[15]),
    					listen(button, "click", /*updateProfile*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const profileviewimage_changes = {};
    			if (dirty & /*profile*/ 1) profileviewimage_changes.profile = /*profile*/ ctx[0];
    			profileviewimage.$set(profileviewimage_changes);

    			if (dirty & /*name*/ 2 && input0.value !== /*name*/ ctx[1]) {
    				set_input_value(input0, /*name*/ ctx[1]);
    			}

    			if (dirty & /*dev_about*/ 4 && input1.value !== /*dev_about*/ ctx[2]) {
    				set_input_value(input1, /*dev_about*/ ctx[2]);
    			}

    			if (dirty & /*lud16*/ 8 && input2.value !== /*lud16*/ ctx[3]) {
    				set_input_value(input2, /*lud16*/ ctx[3]);
    			}

    			if (dirty & /*git_username*/ 64 && input3.value !== /*git_username*/ ctx[6]) {
    				set_input_value(input3, /*git_username*/ ctx[6]);
    			}

    			if (dirty & /*git_proof*/ 128 && input4.value !== /*git_proof*/ ctx[7]) {
    				set_input_value(input4, /*git_proof*/ ctx[7]);
    			}

    			if (dirty & /*picture*/ 16 && input5.value !== /*picture*/ ctx[4]) {
    				set_input_value(input5, /*picture*/ ctx[4]);
    			}

    			if (dirty & /*banner*/ 32 && input6.value !== /*banner*/ ctx[5]) {
    				set_input_value(input6, /*banner*/ ctx[5]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileviewimage.$$.fragment, local);
    			transition_in(relayselectionwidget.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileviewimage.$$.fragment, local);
    			transition_out(relayselectionwidget.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div6);
    			destroy_component(profileviewimage);
    			destroy_component(relayselectionwidget);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$x($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(16, $nostrManager = $$value));
    	let { profile = null } = $$props;
    	let name = "";
    	let dev_about = "";
    	let lud16 = "";
    	let picture = "";
    	let banner = "";
    	let git_username = "";
    	let git_proof = "";

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (!profile) {
    			return;
    		}

    		$$invalidate(1, name = profile.name);
    		$$invalidate(2, dev_about = profile.dev_about);
    		$$invalidate(4, picture = profile.picture);
    		$$invalidate(5, banner = profile.banner);
    		$$invalidate(3, lud16 = profile.lud16);
    		$$invalidate(6, git_username = profile.githubUsername);
    		$$invalidate(7, git_proof = profile.githubProof);
    	}

    	async function updateProfile() {
    		if (!$nostrManager || !$nostrManager.write_mode) return;

    		const profileEvent = {
    			kind: 0,
    			content: JSON.stringify({ name, picture, banner, dev_about, lud16 }),
    			tags: [["i", `github:${git_username}`, git_proof]]
    		};

    		try {
    			await $nostrManager.sendEvent(profileEvent.kind, profileEvent.content, profileEvent.tags);
    			console.log("Profile updated successfully");
    		} catch(error) {
    			console.error("Error updating profile:", error);
    		}
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(1, name);
    	}

    	function input1_input_handler() {
    		dev_about = this.value;
    		$$invalidate(2, dev_about);
    	}

    	function input2_input_handler() {
    		lud16 = this.value;
    		$$invalidate(3, lud16);
    	}

    	function input3_input_handler() {
    		git_username = this.value;
    		$$invalidate(6, git_username);
    	}

    	function input4_input_handler() {
    		git_proof = this.value;
    		$$invalidate(7, git_proof);
    	}

    	function input5_input_handler() {
    		picture = this.value;
    		$$invalidate(4, picture);
    	}

    	function input6_input_handler() {
    		banner = this.value;
    		$$invalidate(5, banner);
    	}

    	$$self.$$set = $$props => {
    		if ('profile' in $$props) $$invalidate(0, profile = $$props.profile);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*profile*/ 1) {
    			(initialize());
    		}
    	};

    	return [
    		profile,
    		name,
    		dev_about,
    		lud16,
    		picture,
    		banner,
    		git_username,
    		git_proof,
    		updateProfile,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler
    	];
    }

    class EditProfileWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$x, create_fragment$y, safe_not_equal, { profile: 0 });
    	}
    }

    /* src/views/EditProfile.svelte generated by Svelte v3.59.1 */

    function create_fragment$x(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let profilebannerwidget;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let editprofilewidget;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	profilebannerwidget = new ProfileBannerWidget({
    			props: { profile_id: /*profile_id*/ ctx[1] }
    		});

    	toolbar = new Toolbar({});
    	editprofilewidget = new EditProfileWidget({ props: { profile: /*profile*/ ctx[0] } });
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(profilebannerwidget.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(editprofilewidget.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", /*$contentContainerClass*/ ctx[2]);
    			attr(div1, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(profilebannerwidget, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(editprofilewidget, div0, null);
    			append(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const profilebannerwidget_changes = {};
    			if (dirty & /*profile_id*/ 2) profilebannerwidget_changes.profile_id = /*profile_id*/ ctx[1];
    			profilebannerwidget.$set(profilebannerwidget_changes);
    			const editprofilewidget_changes = {};
    			if (dirty & /*profile*/ 1) editprofilewidget_changes.profile = /*profile*/ ctx[0];
    			editprofilewidget.$set(editprofilewidget_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 4) {
    				attr(div0, "class", /*$contentContainerClass*/ ctx[2]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(profilebannerwidget.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(editprofilewidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(profilebannerwidget.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(editprofilewidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(profilebannerwidget);
    			destroy_component(toolbar);
    			destroy_component(editprofilewidget);
    			destroy_component(footer);
    		}
    	};
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	let $contentContainerClass;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(3, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(2, $contentContainerClass = $$value));
    	let profile = null;
    	let profile_id = null;

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (!$nostrManager) {
    			return;
    		}

    		socialMediaManager.subscribeProfile($nostrManager.publicKey);
    		fetchProfile();
    	}

    	onDestroy(() => {
    		if (!$nostrManager) {
    			return;
    		}

    		$nostrManager.unsubscribeAll();
    	});

    	async function fetchProfile() {
    		if (!$nostrManager) {
    			return;
    		}

    		$$invalidate(0, profile = await socialMediaManager.getProfile($nostrManager.publicKey));

    		if (!profile) {
    			return;
    		}

    		banner = profile.banner;
    		$$invalidate(1, profile_id = $nostrManager.publicKey);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			(initialize());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 8) {
    			(fetchProfile());
    		}
    	};

    	return [profile, profile_id, $contentContainerClass, $nostrCache, $nostrManager];
    }

    class EditProfile extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$w, create_fragment$x, safe_not_equal, {});
    	}
    }

    /* src/components/CommentWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$9(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (104:6) {#if comment.picture}
    function create_if_block$f(ctx) {
    	let div;
    	let profileimg;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*comment*/ ctx[11],
    				style: { width: "40px", height: "40px" }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			create_component(profileimg.$$.fragment);
    			set_style(div, "margin-right", "10px");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(profileimg, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*comments*/ 1) profileimg_changes.profile = /*comment*/ ctx[11];
    			profileimg.$set(profileimg_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(profileimg);
    		}
    	};
    }

    // (102:2) {#each comments as comment (comment.id)}
    function create_each_block$9(key_1, ctx) {
    	let li;
    	let t0;
    	let div;
    	let h3;
    	let t1_value = /*comment*/ ctx[11].name + "";
    	let t1;
    	let t2;
    	let p;
    	let t3_value = /*comment*/ ctx[11].comment + "";
    	let t3;
    	let t4;
    	let current;
    	let if_block = /*comment*/ ctx[11].picture && create_if_block$f(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			attr(h3, "class", "font-bold text-sm");
    			attr(p, "class", "text-m");
    			attr(li, "class", "flex items-center gap-4 my-2");
    			this.first = li;
    		},
    		m(target, anchor) {
    			insert(target, li, anchor);
    			if (if_block) if_block.m(li, null);
    			append(li, t0);
    			append(li, div);
    			append(div, h3);
    			append(h3, t1);
    			append(div, t2);
    			append(div, p);
    			append(p, t3);
    			append(li, t4);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*comment*/ ctx[11].picture) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*comments*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$f(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(li, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*comments*/ 1) && t1_value !== (t1_value = /*comment*/ ctx[11].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*comments*/ 1) && t3_value !== (t3_value = /*comment*/ ctx[11].comment + "")) set_data(t3, t3_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(li);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$w(ctx) {
    	let h4;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let div1;
    	let label;
    	let t4;
    	let textarea;
    	let t5;
    	let div0;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*comments*/ ctx[0];
    	const get_key = ctx => /*comment*/ ctx[11].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$9(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$9(key, child_ctx));
    	}

    	return {
    		c() {
    			h4 = element("h4");
    			h4.textContent = "Comments";
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Your Comment:";
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Send";
    			attr(h4, "class", "base-h4");
    			attr(label, "for", "newComment");
    			attr(label, "class", "text-lg text-blueGray-600");
    			attr(textarea, "id", "newComment");
    			attr(textarea, "class", "w-full h-24 p-2 mt-2 rounded-md border-2 border-blueGray-200");
    			attr(textarea, "placeholder", "Schreibe hier deinen Kommentar...");
    			attr(button, "class", "bg-orange-500 active:bg-orange-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none mt-4 mb-1 ease-linear transition-all duration-150");
    			attr(button, "type", "button");
    			set_style(div0, "text-align", "right");
    			attr(div1, "class", "mt-6");
    		},
    		m(target, anchor) {
    			insert(target, h4, anchor);
    			insert(target, t1, anchor);
    			insert(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			insert(target, t2, anchor);
    			insert(target, div1, anchor);
    			append(div1, label);
    			append(div1, t4);
    			append(div1, textarea);
    			set_input_value(textarea, /*newComment*/ ctx[1]);
    			append(div1, t5);
    			append(div1, div0);
    			append(div0, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[6]),
    					listen(button, "click", /*submitComment*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*comments*/ 1) {
    				each_value = /*comments*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$9, null, get_each_context$9);
    				check_outros();
    			}

    			if (dirty & /*newComment*/ 2) {
    				set_input_value(textarea, /*newComment*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h4);
    			if (detaching) detach(t1);
    			if (detaching) detach(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach(t2);
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	let { id } = $$props;
    	let comments = [];
    	let newComment = "";
    	let pubkeys = new Set();

    	onMount(() => {
    		if ($nostrManager) {
    			initialize();
    		}
    	});

    	function initialize() {
    		$nostrManager.subscribeToEvents({
    			kinds: [1], // Kommentare
    			"#e": [id],
    			"#s": ["bitspark"]
    		});

    		// Hier könnten wir auch die Profil-Events abonnieren
    		subscribeProfileEvents();
    	}

    	async function subscribeProfileEvents() {
    		if (pubkeys.size > 0) {
    			socialMediaManager.subscribeProfiles(Array.from(pubkeys));
    		}
    	}

    	async function fetchComments() {
    		const commentEvents = await $nostrCache.getEventsByCriteria({
    			kinds: [1],
    			tags: { e: [id], s: ["bitspark"] }
    		});

    		pubkeys = new Set(commentEvents.map(event => event.pubkey));
    		subscribeProfileEvents(); // Neu abonnieren für die aktualisierten pubkeys

    		const profilePromises = commentEvents.map(async event => {
    			let profile = await socialMediaManager.getProfile(event.pubkey);
    			if (!profile) return;

    			return {
    				id: event.id,
    				comment: event.content,
    				name: profile.name || "NoName",
    				picture: profile.picture || "",
    				pubkey: event.pubkey,
    				verified: profile.verified
    			};
    		});

    		try {
    			$$invalidate(0, comments = await Promise.all(profilePromises));
    			$$invalidate(0, comments = comments.filter(comment => comment != null));
    		} catch(error) {
    			console.error("Error fetching comments data:", error);
    		}
    	}

    	async function submitComment() {
    		if (!newComment.trim() || !$nostrManager || !$nostrManager.write_mode) return;
    		const tags = [["e", id], ["s", "bitspark"]];

    		try {
    			await $nostrManager.sendEvent(1, newComment, tags);

    			//await fetchComments();
    			$$invalidate(1, newComment = "");
    		} catch(error) {
    			console.error("Error submitting comment:", error);
    		}
    	}

    	onDestroy(() => {
    		if ($nostrManager) {
    			$nostrManager.unsubscribeAll();
    		}
    	});

    	function textarea_input_handler() {
    		newComment = this.value;
    		$$invalidate(1, newComment);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			$nostrManager && initialize();
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 32) {
    			$nostrCache && fetchComments();
    		}
    	};

    	return [
    		comments,
    		newComment,
    		submitComment,
    		id,
    		$nostrManager,
    		$nostrCache,
    		textarea_input_handler
    	];
    }

    class CommentWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$v, create_fragment$w, safe_not_equal, { id: 3 });
    	}
    }

    var css_248z$n = ".add-job-icon.svelte-12qmj0e{background-color:transparent;color:#a0a0a0;font-size:1.5em;border:none;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;padding:0;transition:color 0.5s,\n      background-color 0.5s;outline:none;cursor:pointer}.add-job-icon.svelte-12qmj0e:hover{background-color:rgba(\n      249,\n      115,\n      22,\n      0.2\n    );color:rgba(\n      249,\n      115,\n      22,\n      0.7\n    );text-decoration:none}.add-job-icon.svelte-12qmj0e:focus{outline:none;box-shadow:none}.header.svelte-12qmj0e{display:flex;justify-content:space-between;align-items:center}.job-grid.svelte-12qmj0e{display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:20px;padding:20px}.job-card-inner.svelte-12qmj0e{background-color:#f9f9f9;border-radius:10px;box-shadow:0 5px 15px rgba(0, 0, 0, 0.1);overflow:hidden}.job-image.svelte-12qmj0e{width:100%;height:120px;background-size:cover;background-position:center}.job-info.svelte-12qmj0e{padding:15px}.job-title.svelte-12qmj0e{font-weight:bold;font-size:1.2em;margin-bottom:5px;color:#333333}.job-sats.svelte-12qmj0e{font-size:0.9em;color:#FF9900}";
    styleInject(css_248z$n);

    /* src/components/JobWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (72:2) {#if creatorPubKey === $nostrManager?.publicKey}
    function create_if_block$e(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fa fa-plus-circle" aria-hidden="true"></i>`;
    			attr(button, "class", "add-job-icon svelte-12qmj0e");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*postJob*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (81:4) <Link to={`/job/${job.id}`} class="job-card">
    function create_default_slot$8(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div3;
    	let div1;
    	let t1_value = /*job*/ ctx[9].title + "";
    	let t1;
    	let t2;
    	let div2;
    	let t3_value = /*job*/ ctx[9].sats + "";
    	let t3;
    	let t4;
    	let t5;

    	return {
    		c() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = text(" Sats");
    			t5 = space();
    			attr(div0, "class", "job-image svelte-12qmj0e");
    			set_style(div0, "background-image", "url(" + /*job*/ ctx[9].url + ")");
    			attr(div1, "class", "job-title svelte-12qmj0e");
    			attr(div2, "class", "job-sats svelte-12qmj0e");
    			attr(div3, "class", "job-info svelte-12qmj0e");
    			attr(div4, "class", "job-card-inner svelte-12qmj0e");
    		},
    		m(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div0);
    			append(div4, t0);
    			append(div4, div3);
    			append(div3, div1);
    			append(div1, t1);
    			append(div3, t2);
    			append(div3, div2);
    			append(div2, t3);
    			append(div2, t4);
    			insert(target, t5, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*jobs*/ 4) {
    				set_style(div0, "background-image", "url(" + /*job*/ ctx[9].url + ")");
    			}

    			if (dirty & /*jobs*/ 4 && t1_value !== (t1_value = /*job*/ ctx[9].title + "")) set_data(t1, t1_value);
    			if (dirty & /*jobs*/ 4 && t3_value !== (t3_value = /*job*/ ctx[9].sats + "")) set_data(t3, t3_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div4);
    			if (detaching) detach(t5);
    		}
    	};
    }

    // (80:2) {#each jobs as job (job.id)}
    function create_each_block$8(key_1, ctx) {
    	let first;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: `/job/${/*job*/ ctx[9].id}`,
    				class: "job-card",
    				$$slots: { default: [create_default_slot$8] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			create_component(link.$$.fragment);
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const link_changes = {};
    			if (dirty & /*jobs*/ 4) link_changes.to = `/job/${/*job*/ ctx[9].id}`;

    			if (dirty & /*$$scope, jobs*/ 4100) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			destroy_component(link, detaching);
    		}
    	};
    }

    function create_fragment$v(ctx) {
    	let div0;
    	let h4;
    	let t1;
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let if_block = /*creatorPubKey*/ ctx[0] === /*$nostrManager*/ ctx[1]?.publicKey && create_if_block$e(ctx);
    	let each_value = /*jobs*/ ctx[2];
    	const get_key = ctx => /*job*/ ctx[9].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$8(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$8(key, child_ctx));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Jobs";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(h4, "class", "base-h4");
    			attr(div0, "class", "header svelte-12qmj0e");
    			attr(div1, "class", "job-grid svelte-12qmj0e");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, h4);
    			append(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			insert(target, t2, anchor);
    			insert(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*creatorPubKey*/ ctx[0] === /*$nostrManager*/ ctx[1]?.publicKey) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$e(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*jobs*/ 4) {
    				each_value = /*jobs*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$8, null, get_each_context$8);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			if (if_block) if_block.d();
    			if (detaching) detach(t2);
    			if (detaching) detach(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(1, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	let { ideaID } = $$props;
    	let { creatorPubKey } = $$props;
    	let jobs = [];
    	let jobKind = NOSTR_KIND_JOB; // Ersetzen Sie dies durch den korrekten Kind-Wert für Jobs

    	onMount(() => {
    		if ($nostrManager) {
    			initialize();
    		}
    	});

    	function initialize() {
    		// Abonnieren von Job-Events
    		$nostrManager.subscribeToEvents({
    			kinds: [jobKind], // Kind-Wert für Jobs
    			"#e": [ideaID], // ID der Idee
    			"#t": ["job"]
    		});
    	}

    	async function fetchJobs() {
    		const jobEvents = await $nostrCache.getEventsByCriteria({
    			kinds: [jobKind],
    			tags: { e: [ideaID], s: ["bitspark"], t: ["job"] }
    		});

    		$$invalidate(2, jobs = jobEvents.map(jobEvent => ({
    			id: jobEvent.id,
    			title: jobEvent.tags.find(tag => tag[0] === "jTitle")?.[1] || "N/A",
    			sats: jobEvent.tags.find(tag => tag[0] === "sats")?.[1] || "0 Sats",
    			description: jobEvent.content,
    			createdAt: jobEvent.created_at,
    			url: jobEvent.tags.find(tag => tag[0] === "jbUrl")?.[1] || "",
    			kind: jobEvent.kind,
    			pubkey: jobEvent.pubkey,
    			sig: jobEvent.sig
    		})).sort((a, b) => b.createdAt - a.createdAt)); // Sortieren nach dem Erstellungsdatum
    	}

    	function postJob() {
    		navigate(`/postjob/${ideaID}`);
    	}

    	onDestroy(() => {
    		if ($nostrManager) {
    			$nostrManager.unsubscribeAll();
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('ideaID' in $$props) $$invalidate(4, ideaID = $$props.ideaID);
    		if ('creatorPubKey' in $$props) $$invalidate(0, creatorPubKey = $$props.creatorPubKey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 2) {
    			$nostrManager && initialize();
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 32) {
    			$nostrCache && fetchJobs();
    		}
    	};

    	return [creatorPubKey, $nostrManager, jobs, postJob, ideaID, $nostrCache];
    }

    class JobWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$u, create_fragment$v, safe_not_equal, { ideaID: 4, creatorPubKey: 0 });
    	}
    }

    /* src/components/Widgets/Banner/IdeaBannerWidget.svelte generated by Svelte v3.59.1 */

    function create_fragment$u(ctx) {
    	let banner;
    	let current;

    	banner = new Banner({
    			props: {
    				bannerImage: /*bannerImage*/ ctx[0],
    				title: /*title*/ ctx[1],
    				subtitle: /*subtitle*/ ctx[2],
    				show_right_text: false
    			}
    		});

    	return {
    		c() {
    			create_component(banner.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(banner, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const banner_changes = {};
    			if (dirty & /*bannerImage*/ 1) banner_changes.bannerImage = /*bannerImage*/ ctx[0];
    			if (dirty & /*title*/ 2) banner_changes.title = /*title*/ ctx[1];
    			if (dirty & /*subtitle*/ 4) banner_changes.subtitle = /*subtitle*/ ctx[2];
    			banner.$set(banner_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(banner.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(banner, detaching);
    		}
    	};
    }

    function transformIdea$1(event) {
    	const tags = event.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    	return {
    		id: event.id,
    		name: tags.iName,
    		subtitle: tags.iSub,
    		bannerImage: tags.ibUrl || "default_image_url",
    		message: event.content,
    		githubRepo: tags.gitrepo,
    		lnAdress: tags.lnadress,
    		pubkey: event.pubkey,
    		abstract: tags.abstract
    	};
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	let { id } = $$props;
    	let idea = {};
    	let bannerImage = null;
    	let title = null;
    	let subtitle = null;

    	onMount(() => {
    		initialize();
    	});

    	async function initialize() {
    		if (!$nostrManager) {
    			return;
    		}

    		$nostrManager.subscribeToEvents({
    			kinds: [NOSTR_KIND_IDEA],
    			"#s": ["bitspark"],
    			ids: [id]
    		});
    	}

    	onDestroy(() => {
    		if (!$nostrManager) {
    			return;
    		}

    		$nostrManager.unsubscribeAll();
    	});

    	async function fetchIdea() {
    		if (!$nostrManager) {
    			return;
    		}

    		const fetchedIdea = await $nostrCache.getEventById(id);

    		if (!fetchedIdea) {
    			return;
    		}

    		idea = transformIdea$1(fetchedIdea);
    		$$invalidate(0, bannerImage = idea.bannerImage);
    		$$invalidate(1, title = idea.name);
    		$$invalidate(2, subtitle = idea.subtitle);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 32) {
    			(fetchIdea());
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			(initialize());
    		}
    	};

    	return [bannerImage, title, subtitle, id, $nostrManager, $nostrCache];
    }

    class IdeaBannerWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$t, create_fragment$u, safe_not_equal, { id: 3 });
    	}
    }

    var css_248z$m = ".total-received-section.svelte-1vbeatt{display:flex;justify-content:center;width:100%;margin-top:20px}.total-received-display.svelte-1vbeatt{display:flex;align-items:center;justify-content:center;margin-top:20px;background:#fffde7;padding:10px 20px;border-radius:5px;box-shadow:0px 4px 10px rgba(0, 0, 0, 0.1);font-family:\"Roboto\", sans-serif;width:50%}.sat-symbol.svelte-1vbeatt{height:30px;margin-right:10px}.total-received-amount.svelte-1vbeatt{font-size:1.5rem;font-weight:bold;color:#333;margin-right:5px}.total-received-text.svelte-1vbeatt{font-size:1rem;color:#777}.widget-title.svelte-1vbeatt{text-align:center;color:#333;font-weight:600;margin-bottom:20px;font-family:\"Roboto\", sans-serif}.single-card.svelte-1vbeatt{background-color:#fffbea;box-shadow:0 4px 8px rgba(0, 0, 0, 0.1);border-radius:10px;padding:20px}.input-group.svelte-1vbeatt{display:flex;flex-direction:column;gap:10px;margin-bottom:15px;width:50%;margin-left:auto;margin-right:auto}.sats-input.svelte-1vbeatt,.message-input.svelte-1vbeatt{border:2px solid #fcbf49;background-color:#fffde7;border-radius:5px;padding:10px;font-size:1rem;font-family:\"Roboto\", sans-serif}.send-sats-button.svelte-1vbeatt{background-color:#ffc107;color:white;border:none;padding:10px 15px;border-radius:5px;cursor:pointer;font-size:1rem;transition:background-color 0.3s ease}.send-sats-button.svelte-1vbeatt:hover,.send-sats-button.svelte-1vbeatt:focus{transform:scale(1.05);background-color:#ffca2c;outline:none;box-shadow:0 0 0 2px rgba(255, 193, 7, 0.5)}.progress-bar.svelte-1vbeatt{background-color:#f6f6f6;border-radius:5px;margin-top:10px;height:20px;width:100%}.progress.svelte-1vbeatt{transition:width 0.5s ease,\n      background-color 0.5s ease;background-color:#ffc107;height:100%;border-radius:5px}.sats-input.svelte-1vbeatt:focus,.message-input.svelte-1vbeatt:focus{outline:none;box-shadow:0 0 5px rgba(252, 191, 73, 0.8)}";
    styleInject(css_248z$m);

    /* src/components/ZapWidget.svelte generated by Svelte v3.59.1 */

    function create_if_block$d(ctx) {
    	let div1;
    	let div0;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			attr(div0, "class", "progress svelte-1vbeatt");
    			set_style(div0, "width", /*progressPercentage*/ ctx[4] + "%");
    			attr(div1, "class", "progress-bar svelte-1vbeatt");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*progressPercentage*/ 16) {
    				set_style(div0, "width", /*progressPercentage*/ ctx[4] + "%");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function create_fragment$t(ctx) {
    	let div3;
    	let h1;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button;
    	let t5;
    	let div2;
    	let div1;
    	let span0;
    	let t6;
    	let t7;
    	let img;
    	let img_src_value;
    	let t8;
    	let span1;
    	let t10;
    	let mounted;
    	let dispose;
    	let if_block = /*satGoal*/ ctx[0] && create_if_block$d(ctx);

    	return {
    		c() {
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Zap some Sats";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-bolt"></i> Zap Sats`;
    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			t6 = text(/*totalReceivedSats*/ ctx[3]);
    			t7 = space();
    			img = element("img");
    			t8 = space();
    			span1 = element("span");
    			span1.textContent = "Zapped";
    			t10 = space();
    			if (if_block) if_block.c();
    			attr(h1, "class", "widget-title svelte-1vbeatt");
    			attr(input0, "class", "sats-input svelte-1vbeatt");
    			attr(input0, "type", "number");
    			attr(input0, "placeholder", "Sats Amount");
    			attr(input0, "min", "1");
    			attr(input1, "class", "message-input svelte-1vbeatt");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "Message (optional)");
    			attr(button, "class", "send-sats-button svelte-1vbeatt");
    			attr(div0, "class", "input-group svelte-1vbeatt");
    			attr(span0, "class", "total-received-amount svelte-1vbeatt");
    			if (!src_url_equal(img.src, img_src_value = "../../img/sat.svg")) attr(img, "src", img_src_value);
    			attr(img, "alt", "Sat Symbol");
    			attr(img, "class", "sat-symbol svelte-1vbeatt");
    			attr(span1, "class", "total-received-text svelte-1vbeatt");
    			attr(div1, "class", "total-received-display svelte-1vbeatt");
    			attr(div2, "class", "total-received-section svelte-1vbeatt");
    			attr(div3, "class", "zap-widget single-card container svelte-1vbeatt");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, h1);
    			append(div3, t1);
    			append(div3, div0);
    			append(div0, input0);
    			set_input_value(input0, /*satsAmount*/ ctx[1]);
    			append(div0, t2);
    			append(div0, input1);
    			set_input_value(input1, /*sendSatsMessage*/ ctx[2]);
    			append(div0, t3);
    			append(div0, button);
    			append(div3, t5);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, span0);
    			append(span0, t6);
    			append(div1, t7);
    			append(div1, img);
    			append(div1, t8);
    			append(div1, span1);
    			append(div3, t10);
    			if (if_block) if_block.m(div3, null);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen(button, "click", /*sendSats*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*satsAmount*/ 2 && to_number(input0.value) !== /*satsAmount*/ ctx[1]) {
    				set_input_value(input0, /*satsAmount*/ ctx[1]);
    			}

    			if (dirty & /*sendSatsMessage*/ 4 && input1.value !== /*sendSatsMessage*/ ctx[2]) {
    				set_input_value(input1, /*sendSatsMessage*/ ctx[2]);
    			}

    			if (dirty & /*totalReceivedSats*/ 8) set_data(t6, /*totalReceivedSats*/ ctx[3]);

    			if (/*satGoal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$d(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(7, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(8, $nostrCache = $$value));
    	let { eventId } = $$props;
    	let { satGoal = null } = $$props;
    	let eventDetails = null;
    	let creatorProfile = null;
    	let satsAmount = 0;
    	let sendSatsMessage = "";
    	let totalReceivedSats = 0;
    	let progressPercentage = 0;

    	function initialize() {
    		loadEvent();

    		if ($nostrManager) {
    			if (eventDetails) {
    				socialMediaManager.subscribeProfile(eventDetails.pubkey);
    			}

    			zapManager.subscribeZaps(eventId);
    		}
    	}

    	onMount(initialize);
    	onDestroy(() => $nostrManager.unsubscribeAll());

    	async function loadEvent() {
    		eventDetails = $nostrCache.getEventById(eventId);
    	}

    	async function loadProfile() {
    		if (eventDetails) {
    			creatorProfile = await socialMediaManager.getProfile(eventDetails.pubkey);
    			fetchTotalReceivedSats();
    		}
    	}

    	async function fetchTotalReceivedSats() {
    		$$invalidate(3, totalReceivedSats = await zapManager.getTotalZaps(eventId));
    		updateProgress();
    	}

    	function updateProgress() {
    		$$invalidate(4, progressPercentage = totalReceivedSats / satGoal * 100);
    		if (progressPercentage > 100) $$invalidate(4, progressPercentage = 100);
    	}

    	async function sendSats() {
    		if (creatorProfile.lud16 && satsAmount > 0) {
    			sendZap(creatorProfile.lud16, satsAmount, sendSatsMessage || "Support via Zap", $nostrManager.relays, eventId).then(response => {
    				fetchTotalReceivedSats(); // Aktualisieren der totalen Sats
    			}).catch(error => {
    				console.error("Error sending Zap:", error);
    			});
    		} else {
    			console.error("Invalid LN address or Sats amount");
    		}
    	}

    	function input0_input_handler() {
    		satsAmount = to_number(this.value);
    		$$invalidate(1, satsAmount);
    	}

    	function input1_input_handler() {
    		sendSatsMessage = this.value;
    		$$invalidate(2, sendSatsMessage);
    	}

    	$$self.$$set = $$props => {
    		if ('eventId' in $$props) $$invalidate(6, eventId = $$props.eventId);
    		if ('satGoal' in $$props) $$invalidate(0, satGoal = $$props.satGoal);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 128) {
    			(initialize());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			(fetchTotalReceivedSats());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			(loadEvent());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			(loadProfile());
    		}
    	};

    	return [
    		satGoal,
    		satsAmount,
    		sendSatsMessage,
    		totalReceivedSats,
    		progressPercentage,
    		sendSats,
    		eventId,
    		$nostrManager,
    		$nostrCache,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class ZapWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$s, create_fragment$t, safe_not_equal, { eventId: 6, satGoal: 0 });
    	}
    }

    /* src/components/Widgets/IdeaWidget.svelte generated by Svelte v3.59.1 */

    function create_if_block_1$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-times-circle"></i>`;
    			attr(button, "class", "absolute top-4 right-4 text-gray-400");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*deleteIdea*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (32:8) {#if preview}
    function create_if_block$c(ctx) {
    	let h5;

    	return {
    		c() {
    			h5 = element("h5");
    			h5.textContent = "Preview";
    		},
    		m(target, anchor) {
    			insert(target, h5, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(h5);
    		}
    	};
    }

    function create_fragment$s(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let h2;
    	let t1_value = /*idea*/ ctx[1].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let h4;
    	let t5;
    	let p;
    	let t6_value = /*idea*/ ctx[1].abstract + "";
    	let t6;
    	let t7;
    	let hr;
    	let t8;
    	let div0;
    	let raw_value = /*idea*/ ctx[1].message + "";
    	let if_block0 = /*creator_profile*/ ctx[0] && /*creator_profile*/ ctx[0].pubkey === /*$nostrManager*/ ctx[3].publicKey && create_if_block_1$4(ctx);
    	let if_block1 = /*preview*/ ctx[2] && create_if_block$c();

    	return {
    		c() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = `${"Abstract"}`;
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			hr = element("hr");
    			t8 = space();
    			div0 = element("div");
    			attr(h2, "class", "base-h2 text-color-df");
    			attr(h4, "class", "base-h4 text-color-df");
    			attr(p, "class", "abstract-text text-color-df");
    			set_style(hr, "width", "65%");
    			set_style(hr, "margin", "auto");
    			attr(div0, "class", "single-card-content text-color-df");
    			attr(div1, "class", "text-center mt-6 px-6");
    			attr(div2, "class", "single-card container");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, h2);
    			append(h2, t1);
    			append(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			append(div1, t3);
    			append(div1, h4);
    			append(div1, t5);
    			append(div1, p);
    			append(p, t6);
    			append(div1, t7);
    			append(div1, hr);
    			append(div1, t8);
    			append(div1, div0);
    			div0.innerHTML = raw_value;
    		},
    		p(ctx, [dirty]) {
    			if (/*creator_profile*/ ctx[0] && /*creator_profile*/ ctx[0].pubkey === /*$nostrManager*/ ctx[3].publicKey) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*idea*/ 2 && t1_value !== (t1_value = /*idea*/ ctx[1].name + "")) set_data(t1, t1_value);

    			if (/*preview*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$c();
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*idea*/ 2 && t6_value !== (t6_value = /*idea*/ ctx[1].abstract + "")) set_data(t6, t6_value);
    			if (dirty & /*idea*/ 2 && raw_value !== (raw_value = /*idea*/ ctx[1].message + "")) div0.innerHTML = raw_value;		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(3, $nostrManager = $$value));
    	let { creator_profile } = $$props;
    	let { idea } = $$props;
    	let { preview = false } = $$props;

    	async function deleteIdea() {
    		const confirmDelete = confirm("Do you really want to delete this idea?");

    		if (confirmDelete) {
    			await $nostrManager.sendEvent(5, "", [["e", idea.id]]);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('creator_profile' in $$props) $$invalidate(0, creator_profile = $$props.creator_profile);
    		if ('idea' in $$props) $$invalidate(1, idea = $$props.idea);
    		if ('preview' in $$props) $$invalidate(2, preview = $$props.preview);
    	};

    	return [creator_profile, idea, preview, $nostrManager, deleteIdea];
    }

    class IdeaWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$r, create_fragment$s, safe_not_equal, { creator_profile: 0, idea: 1, preview: 2 });
    	}
    }

    /* src/views/Idea.svelte generated by Svelte v3.59.1 */

    function create_fragment$r(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div3;
    	let ideabannerwidget;
    	let t1;
    	let toolbar;
    	let t2;
    	let div2;
    	let ideawidget;
    	let t3;
    	let zapwidget;
    	let t4;
    	let div0;
    	let jobwidget;
    	let t5;
    	let div1;
    	let commentwidget;
    	let t6;
    	let footer;
    	let current;
    	menu = new Sidebar({});
    	ideabannerwidget = new IdeaBannerWidget({ props: { id: /*id*/ ctx[0] } });

    	toolbar = new Toolbar({
    			props: {
    				lnAddress: /*idea*/ ctx[2].lnAdress,
    				pubkey: /*idea*/ ctx[2].pubkey,
    				githubRepo: /*idea*/ ctx[2].githubRepo
    			}
    		});

    	ideawidget = new IdeaWidget({
    			props: {
    				creator_profile: /*creator_profile*/ ctx[1],
    				idea: /*idea*/ ctx[2]
    			}
    		});

    	zapwidget = new ZapWidget({ props: { eventId: /*id*/ ctx[0] } });

    	jobwidget = new JobWidget({
    			props: {
    				ideaID: /*id*/ ctx[0],
    				creatorPubKey: /*idea*/ ctx[2].pubkey
    			}
    		});

    	commentwidget = new CommentWidget({ props: { id: /*id*/ ctx[0] } });
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			create_component(ideabannerwidget.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(ideawidget.$$.fragment);
    			t3 = space();
    			create_component(zapwidget.$$.fragment);
    			t4 = space();
    			div0 = element("div");
    			create_component(jobwidget.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			create_component(commentwidget.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", "single-card container");
    			attr(div1, "class", "single-card container");
    			attr(div2, "class", /*$contentContainerClass*/ ctx[3]);
    			attr(div3, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div3);
    			mount_component(ideabannerwidget, div3, null);
    			append(div3, t1);
    			mount_component(toolbar, div3, null);
    			append(div3, t2);
    			append(div3, div2);
    			mount_component(ideawidget, div2, null);
    			append(div2, t3);
    			mount_component(zapwidget, div2, null);
    			append(div2, t4);
    			append(div2, div0);
    			mount_component(jobwidget, div0, null);
    			append(div2, t5);
    			append(div2, div1);
    			mount_component(commentwidget, div1, null);
    			append(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const ideabannerwidget_changes = {};
    			if (dirty & /*id*/ 1) ideabannerwidget_changes.id = /*id*/ ctx[0];
    			ideabannerwidget.$set(ideabannerwidget_changes);
    			const toolbar_changes = {};
    			if (dirty & /*idea*/ 4) toolbar_changes.lnAddress = /*idea*/ ctx[2].lnAdress;
    			if (dirty & /*idea*/ 4) toolbar_changes.pubkey = /*idea*/ ctx[2].pubkey;
    			if (dirty & /*idea*/ 4) toolbar_changes.githubRepo = /*idea*/ ctx[2].githubRepo;
    			toolbar.$set(toolbar_changes);
    			const ideawidget_changes = {};
    			if (dirty & /*creator_profile*/ 2) ideawidget_changes.creator_profile = /*creator_profile*/ ctx[1];
    			if (dirty & /*idea*/ 4) ideawidget_changes.idea = /*idea*/ ctx[2];
    			ideawidget.$set(ideawidget_changes);
    			const zapwidget_changes = {};
    			if (dirty & /*id*/ 1) zapwidget_changes.eventId = /*id*/ ctx[0];
    			zapwidget.$set(zapwidget_changes);
    			const jobwidget_changes = {};
    			if (dirty & /*id*/ 1) jobwidget_changes.ideaID = /*id*/ ctx[0];
    			if (dirty & /*idea*/ 4) jobwidget_changes.creatorPubKey = /*idea*/ ctx[2].pubkey;
    			jobwidget.$set(jobwidget_changes);
    			const commentwidget_changes = {};
    			if (dirty & /*id*/ 1) commentwidget_changes.id = /*id*/ ctx[0];
    			commentwidget.$set(commentwidget_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 8) {
    				attr(div2, "class", /*$contentContainerClass*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(ideabannerwidget.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(ideawidget.$$.fragment, local);
    			transition_in(zapwidget.$$.fragment, local);
    			transition_in(jobwidget.$$.fragment, local);
    			transition_in(commentwidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(ideabannerwidget.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(ideawidget.$$.fragment, local);
    			transition_out(zapwidget.$$.fragment, local);
    			transition_out(jobwidget.$$.fragment, local);
    			transition_out(commentwidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(ideabannerwidget);
    			destroy_component(toolbar);
    			destroy_component(ideawidget);
    			destroy_component(zapwidget);
    			destroy_component(jobwidget);
    			destroy_component(commentwidget);
    			destroy_component(footer);
    		}
    	};
    }

    function transformIdea(event) {
    	const tags = event.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    	return {
    		id: event.id,
    		name: tags.iName,
    		subtitle: tags.iSub,
    		bannerImage: tags.ibUrl || "default_image_url",
    		message: event.content,
    		githubRepo: tags.gitrepo,
    		lnAdress: tags.lnadress,
    		pubkey: event.pubkey,
    		abstract: tags.abstract
    	};
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	let $contentContainerClass;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(3, $contentContainerClass = $$value));
    	let { id } = $$props;
    	let creator_profile = null;
    	let idea = {};

    	async function initialize() {
    		if ($nostrManager) {
    			$nostrManager.subscribeToEvents({
    				kinds: [NOSTR_KIND_IDEA],
    				"#s": ["bitspark"],
    				ids: [id]
    			});
    		}
    	}

    	function fetchIdea() {
    		const fetchedIdea = $nostrCache.getEventById(id);

    		if (fetchedIdea) {
    			$$invalidate(2, idea = transformIdea(fetchedIdea));
    			fetchCreatorProfile();
    		}
    	}

    	async function fetchCreatorProfile() {
    		if (idea) {
    			$$invalidate(1, creator_profile = await socialMediaManager.getProfile(idea.pubkey));
    		}
    	}

    	onMount(() => {
    		initialize();
    	});

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll();
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 32) {
    			if ($nostrCache) {
    				fetchIdea();
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 16) {
    			if ($nostrManager) {
    				initialize();
    			}
    		}
    	};

    	return [id, creator_profile, idea, $contentContainerClass, $nostrManager, $nostrCache];
    }

    class Idea extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$q, create_fragment$r, safe_not_equal, { id: 0 });
    	}
    }

    // Definieren Sie die anfänglichen Daten
    const initialIdea = {
        name: "",
        subtitle: "",
        abstract: "",
        message: "",
        bannerUrl: "",
        githubRepo: "",
        lightningAddress: "",
        categories: [],
    };

    // Erstellen Sie den Store
    const previewStore = writable(initialIdea);

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    var css_248z$l = ".svelte-n7cvum{box-sizing:border-box}.bg.svelte-n7cvum{position:fixed;z-index:1000;top:0;left:0;display:flex;flex-direction:column;justify-content:center;width:100vw;height:100vh;background:rgba(0, 0, 0, 0.66)}@supports (-webkit-touch-callout: none){}.wrap.svelte-n7cvum{position:relative;margin:2rem;max-height:100%}.window.svelte-n7cvum{position:relative;width:40rem;max-width:100%;max-height:100%;margin:2rem auto;color:black;border-radius:0.5rem;background:white}.content.svelte-n7cvum{position:relative;padding:1rem;max-height:calc(100vh - 4rem);overflow:auto}.close.svelte-n7cvum{display:block;box-sizing:border-box;position:absolute;z-index:1000;top:1rem;right:1rem;margin:0;padding:0;width:1.5rem;height:1.5rem;border:0;color:black;border-radius:1.5rem;background:white;box-shadow:0 0 0 1px black;transition:transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),\n      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);-webkit-appearance:none}.close.svelte-n7cvum:before,.close.svelte-n7cvum:after{content:'';display:block;box-sizing:border-box;position:absolute;top:50%;width:1rem;height:1px;background:black;transform-origin:center;transition:height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),\n      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)}.close.svelte-n7cvum:before{-webkit-transform:translate(0, -50%) rotate(45deg);-moz-transform:translate(0, -50%) rotate(45deg);transform:translate(0, -50%) rotate(45deg);left:0.25rem}.close.svelte-n7cvum:after{-webkit-transform:translate(0, -50%) rotate(-45deg);-moz-transform:translate(0, -50%) rotate(-45deg);transform:translate(0, -50%) rotate(-45deg);left:0.25rem}.close.svelte-n7cvum:hover{background:black}.close.svelte-n7cvum:hover:before,.close.svelte-n7cvum:hover:after{height:2px;background:white}.close.svelte-n7cvum:focus{border-color:#3399ff;box-shadow:0 0 0 2px #3399ff}.close.svelte-n7cvum:active{transform:scale(0.9)}.close.svelte-n7cvum:hover,.close.svelte-n7cvum:focus,.close.svelte-n7cvum:active{outline:none}";
    styleInject(css_248z$l);

    /* node_modules/svelte-simple-modal/src/Modal.svelte generated by Svelte v3.59.1 */

    const { window: window_1 } = globals;

    function create_if_block$b(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div0_class_value;
    	let div1_class_value;
    	let div1_aria_label_value;
    	let div1_aria_labelledby_value;
    	let div1_transition;
    	let div2_class_value;
    	let div3_id_value;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[1].closeButton && create_if_block_1$3(ctx);
    	var switch_value = /*Component*/ ctx[2];

    	function switch_props(ctx) {
    		return {};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props());
    	}

    	return {
    		c() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*state*/ ctx[1].classContent) + " svelte-n7cvum"));
    			attr(div0, "style", /*cssContent*/ ctx[9]);
    			toggle_class(div0, "content", !/*unstyled*/ ctx[0]);
    			attr(div1, "class", div1_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindow) + " svelte-n7cvum"));
    			attr(div1, "role", "dialog");
    			attr(div1, "aria-modal", "true");

    			attr(div1, "aria-label", div1_aria_label_value = /*state*/ ctx[1].ariaLabelledBy
    			? null
    			: /*state*/ ctx[1].ariaLabel || null);

    			attr(div1, "aria-labelledby", div1_aria_labelledby_value = /*state*/ ctx[1].ariaLabelledBy || null);
    			attr(div1, "style", /*cssWindow*/ ctx[8]);
    			toggle_class(div1, "window", !/*unstyled*/ ctx[0]);
    			attr(div2, "class", div2_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindowWrap) + " svelte-n7cvum"));
    			attr(div2, "style", /*cssWindowWrap*/ ctx[7]);
    			toggle_class(div2, "wrap", !/*unstyled*/ ctx[0]);
    			attr(div3, "id", div3_id_value = /*state*/ ctx[1].id);
    			attr(div3, "class", div3_class_value = "" + (null_to_empty(/*state*/ ctx[1].classBg) + " svelte-n7cvum"));
    			attr(div3, "style", /*cssBg*/ ctx[6]);
    			toggle_class(div3, "bg", !/*unstyled*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t);
    			append(div1, div0);
    			if (switch_instance) mount_component(switch_instance, div0, null);
    			/*div1_binding*/ ctx[50](div1);
    			/*div2_binding*/ ctx[51](div2);
    			/*div3_binding*/ ctx[52](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div1, "introstart", function () {
    						if (is_function(/*onOpen*/ ctx[13])) /*onOpen*/ ctx[13].apply(this, arguments);
    					}),
    					listen(div1, "outrostart", function () {
    						if (is_function(/*onClose*/ ctx[14])) /*onClose*/ ctx[14].apply(this, arguments);
    					}),
    					listen(div1, "introend", function () {
    						if (is_function(/*onOpened*/ ctx[15])) /*onOpened*/ ctx[15].apply(this, arguments);
    					}),
    					listen(div1, "outroend", function () {
    						if (is_function(/*onClosed*/ ctx[16])) /*onClosed*/ ctx[16].apply(this, arguments);
    					}),
    					listen(div3, "mousedown", /*handleOuterMousedown*/ ctx[20]),
    					listen(div3, "mouseup", /*handleOuterMouseup*/ ctx[21])
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[1].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*Component*/ 4 && switch_value !== (switch_value = /*Component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*state*/ ctx[1].classContent) + " svelte-n7cvum"))) {
    				attr(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*cssContent*/ 512) {
    				attr(div0, "style", /*cssContent*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div0, "content", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindow) + " svelte-n7cvum"))) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_aria_label_value !== (div1_aria_label_value = /*state*/ ctx[1].ariaLabelledBy
    			? null
    			: /*state*/ ctx[1].ariaLabel || null)) {
    				attr(div1, "aria-label", div1_aria_label_value);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div1_aria_labelledby_value !== (div1_aria_labelledby_value = /*state*/ ctx[1].ariaLabelledBy || null)) {
    				attr(div1, "aria-labelledby", div1_aria_labelledby_value);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 256) {
    				attr(div1, "style", /*cssWindow*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div1, "window", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(/*state*/ ctx[1].classWindowWrap) + " svelte-n7cvum"))) {
    				attr(div2, "class", div2_class_value);
    			}

    			if (!current || dirty[0] & /*cssWindowWrap*/ 128) {
    				attr(div2, "style", /*cssWindowWrap*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div2, "wrap", !/*unstyled*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div3_id_value !== (div3_id_value = /*state*/ ctx[1].id)) {
    				attr(div3, "id", div3_id_value);
    			}

    			if (!current || dirty[0] & /*state*/ 2 && div3_class_value !== (div3_class_value = "" + (null_to_empty(/*state*/ ctx[1].classBg) + " svelte-n7cvum"))) {
    				attr(div3, "class", div3_class_value);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 64) {
    				attr(div3, "style", /*cssBg*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(div3, "bg", !/*unstyled*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[12], /*state*/ ctx[1].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!current) return;
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[11], /*state*/ ctx[1].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[12], /*state*/ ctx[1].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[11], /*state*/ ctx[1].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[50](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[51](null);
    			/*div3_binding*/ ctx[52](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (502:8) {#if state.closeButton}
    function create_if_block_1$3(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 2) show_if = null;
    		if (show_if == null) show_if = !!/*isFunction*/ ctx[17](/*state*/ ctx[1].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1, -1, -1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (505:10) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			attr(button, "class", button_class_value = "" + (null_to_empty(/*state*/ ctx[1].classCloseButton) + " svelte-n7cvum"));
    			attr(button, "aria-label", "Close modal");
    			attr(button, "style", /*cssCloseButton*/ ctx[10]);
    			attr(button, "type", "button");
    			toggle_class(button, "close", !/*unstyled*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*close*/ ctx[18]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*state*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*state*/ ctx[1].classCloseButton) + " svelte-n7cvum"))) {
    				attr(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*cssCloseButton*/ 1024) {
    				attr(button, "style", /*cssCloseButton*/ ctx[10]);
    			}

    			if (dirty[0] & /*state, unstyled*/ 3) {
    				toggle_class(button, "close", !/*unstyled*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (503:10) {#if isFunction(state.closeButton)}
    function create_if_block_2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[1].closeButton;

    	function switch_props(ctx) {
    		return { props: { onClose: /*close*/ ctx[18] } };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*state*/ 2 && switch_value !== (switch_value = /*state*/ ctx[1].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$q(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[2] && create_if_block$b(ctx);
    	const default_slot_template = /*#slots*/ ctx[49].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[48], null);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(window_1, "keydown", /*handleKeydown*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*Component*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[48],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[48])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[48], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function bind(Component, props = {}) {
    	return function ModalComponent(options) {
    		return new Component({
    				...options,
    				props: { ...props, ...options.props }
    			});
    	};
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const dispatch = createEventDispatcher();
    	const baseSetContext = setContext;

    	/**
     * A basic function that checks if a node is tabbale
     */
    	const baseIsTabbable = node => node.tabIndex >= 0 && !node.hidden && !node.disabled && node.style.display !== 'none' && node.type !== 'hidden' && Boolean(node.offsetWidth || node.offsetHeight || node.getClientRects().length);

    	let { isTabbable = baseIsTabbable } = $$props;
    	let { show = null } = $$props;
    	let { id = null } = $$props;
    	let { key = 'simple-modal' } = $$props;
    	let { ariaLabel = null } = $$props;
    	let { ariaLabelledBy = null } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = {} } = $$props;
    	let { styleWindowWrap = {} } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { classBg = null } = $$props;
    	let { classWindowWrap = null } = $$props;
    	let { classWindow = null } = $$props;
    	let { classContent = null } = $$props;
    	let { classCloseButton = null } = $$props;
    	let { unstyled = false } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;
    	let { disableFocusTrap = false } = $$props;

    	const defaultState = {
    		id,
    		ariaLabel,
    		ariaLabelledBy,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		classBg,
    		classWindowWrap,
    		classWindow,
    		classContent,
    		classCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		disableFocusTrap,
    		isTabbable,
    		unstyled
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	let scrollY;
    	let cssBg;
    	let cssWindowWrap;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;
    	let prevBodyPosition;
    	let prevBodyOverflow;
    	let prevBodyWidth;
    	let outerClickTarget;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

    	const toCssString = props => props
    	? Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '')
    	: '';

    	const isFunction = f => !!(f && f.constructor && f.call && f.apply);

    	const updateStyleTransition = () => {
    		$$invalidate(6, cssBg = toCssString(Object.assign(
    			{},
    			{
    				width: window.innerWidth,
    				height: window.innerHeight
    			},
    			state.styleBg
    		)));

    		$$invalidate(7, cssWindowWrap = toCssString(state.styleWindowWrap));
    		$$invalidate(8, cssWindow = toCssString(state.styleWindow));
    		$$invalidate(9, cssContent = toCssString(state.styleContent));
    		$$invalidate(10, cssCloseButton = toCssString(state.styleCloseButton));
    		$$invalidate(11, currentTransitionBg = state.transitionBg);
    		$$invalidate(12, currentTransitionWindow = state.transitionWindow);
    	};

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	/**
     * Open a modal.
     * @description Calling this method will close the modal. Additionally, it
     * allows to specify onClose and onClosed event handlers.`
     * @type {Open}
     */
    	const open = (NewComponent, newProps = {}, options = {}, callbacks = {}) => {
    		$$invalidate(2, Component = bind(NewComponent, newProps));
    		$$invalidate(1, state = { ...defaultState, ...options });
    		updateStyleTransition();
    		disableScroll();

    		$$invalidate(13, onOpen = event => {
    			if (callbacks.onOpen) callbacks.onOpen(event);

    			/**
     * The open event is fired right before the modal opens
     * @event {void} open
     */
    			dispatch('open');

    			/**
     * The opening event is fired right before the modal opens
     * @event {void} opening
     * @deprecated Listen to the `open` event instead
     */
    			dispatch('opening'); // Deprecated. Do not use!
    		});

    		$$invalidate(14, onClose = event => {
    			if (callbacks.onClose) callbacks.onClose(event);

    			/**
     * The close event is fired right before the modal closes
     * @event {void} close
     */
    			dispatch('close');

    			/**
     * The closing event is fired right before the modal closes
     * @event {void} closing
     * @deprecated Listen to the `close` event instead
     */
    			dispatch('closing'); // Deprecated. Do not use!
    		});

    		$$invalidate(15, onOpened = event => {
    			if (callbacks.onOpened) callbacks.onOpened(event);

    			/**
     * The opened event is fired after the modal's opening transition
     * @event {void} opened
     */
    			dispatch('opened');
    		});

    		$$invalidate(16, onClosed = event => {
    			if (callbacks.onClosed) callbacks.onClosed(event);

    			/**
     * The closed event is fired after the modal's closing transition
     * @event {void} closed
     */
    			dispatch('closed');
    		});
    	};

    	/**
     * Close the modal.
     * @description Calling this method will close the modal. Additionally, it
     * allows to specify onClose and onClosed event handlers.`
     * @type {Close}
     */
    	const close = (callbacks = {}) => {
    		if (!Component) return;
    		$$invalidate(14, onClose = callbacks.onClose || onClose);
    		$$invalidate(16, onClosed = callbacks.onClosed || onClosed);
    		$$invalidate(2, Component = null);
    		enableScroll();
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === 'Escape') {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll('*');

    			const tabbable = Array.from(nodes).filter(state.isTabbable).sort((a, b) => a.tabIndex - b.tabIndex);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterMousedown = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) outerClickTarget = event.target;
    	};

    	const handleOuterMouseup = event => {
    		if (state.closeOnOuterClick && event.target === outerClickTarget) {
    			event.preventDefault();
    			close();
    		}
    	};

    	const disableScroll = () => {
    		scrollY = window.scrollY;
    		prevBodyPosition = document.body.style.position;
    		prevBodyOverflow = document.body.style.overflow;
    		prevBodyWidth = document.body.style.width;
    		document.body.style.position = 'fixed';
    		document.body.style.top = `-${scrollY}px`;
    		document.body.style.overflow = 'hidden';
    		document.body.style.width = '100%';
    	};

    	const enableScroll = () => {
    		document.body.style.position = prevBodyPosition || '';
    		document.body.style.top = '';
    		document.body.style.overflow = prevBodyOverflow || '';
    		document.body.style.width = prevBodyWidth || '';

    		window.scrollTo({
    			top: scrollY,
    			left: 0,
    			behavior: 'instant'
    		});
    	};

    	/**
     * The exposed context methods: open() and close()
     * @type {Context}
     */
    	const context = { open, close };

    	setContext$1(key, context);
    	let isMounted = false;

    	onDestroy(() => {
    		if (isMounted) close();
    	});

    	onMount(() => {
    		$$invalidate(47, isMounted = true);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modalWindow = $$value;
    			$$invalidate(5, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrap = $$value;
    			$$invalidate(4, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('isTabbable' in $$props) $$invalidate(22, isTabbable = $$props.isTabbable);
    		if ('show' in $$props) $$invalidate(23, show = $$props.show);
    		if ('id' in $$props) $$invalidate(24, id = $$props.id);
    		if ('key' in $$props) $$invalidate(25, key = $$props.key);
    		if ('ariaLabel' in $$props) $$invalidate(26, ariaLabel = $$props.ariaLabel);
    		if ('ariaLabelledBy' in $$props) $$invalidate(27, ariaLabelledBy = $$props.ariaLabelledBy);
    		if ('closeButton' in $$props) $$invalidate(28, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(29, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(30, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('styleBg' in $$props) $$invalidate(31, styleBg = $$props.styleBg);
    		if ('styleWindowWrap' in $$props) $$invalidate(32, styleWindowWrap = $$props.styleWindowWrap);
    		if ('styleWindow' in $$props) $$invalidate(33, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(34, styleContent = $$props.styleContent);
    		if ('styleCloseButton' in $$props) $$invalidate(35, styleCloseButton = $$props.styleCloseButton);
    		if ('classBg' in $$props) $$invalidate(36, classBg = $$props.classBg);
    		if ('classWindowWrap' in $$props) $$invalidate(37, classWindowWrap = $$props.classWindowWrap);
    		if ('classWindow' in $$props) $$invalidate(38, classWindow = $$props.classWindow);
    		if ('classContent' in $$props) $$invalidate(39, classContent = $$props.classContent);
    		if ('classCloseButton' in $$props) $$invalidate(40, classCloseButton = $$props.classCloseButton);
    		if ('unstyled' in $$props) $$invalidate(0, unstyled = $$props.unstyled);
    		if ('setContext' in $$props) $$invalidate(41, setContext$1 = $$props.setContext);
    		if ('transitionBg' in $$props) $$invalidate(42, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(43, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(44, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(45, transitionWindowProps = $$props.transitionWindowProps);
    		if ('disableFocusTrap' in $$props) $$invalidate(46, disableFocusTrap = $$props.disableFocusTrap);
    		if ('$$scope' in $$props) $$invalidate(48, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*show*/ 8388608 | $$self.$$.dirty[1] & /*isMounted*/ 65536) {
    			{
    				if (isMounted) {
    					if (isFunction(show)) {
    						open(show);
    					} else {
    						close();
    					}
    				}
    			}
    		}
    	};

    	return [
    		unstyled,
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		isFunction,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		isTabbable,
    		show,
    		id,
    		key,
    		ariaLabel,
    		ariaLabelledBy,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		classBg,
    		classWindowWrap,
    		classWindow,
    		classContent,
    		classCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		disableFocusTrap,
    		isMounted,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$p,
    			create_fragment$q,
    			safe_not_equal,
    			{
    				isTabbable: 22,
    				show: 23,
    				id: 24,
    				key: 25,
    				ariaLabel: 26,
    				ariaLabelledBy: 27,
    				closeButton: 28,
    				closeOnEsc: 29,
    				closeOnOuterClick: 30,
    				styleBg: 31,
    				styleWindowWrap: 32,
    				styleWindow: 33,
    				styleContent: 34,
    				styleCloseButton: 35,
    				classBg: 36,
    				classWindowWrap: 37,
    				classWindow: 38,
    				classContent: 39,
    				classCloseButton: 40,
    				unstyled: 0,
    				setContext: 41,
    				transitionBg: 42,
    				transitionBgProps: 43,
    				transitionWindow: 44,
    				transitionWindowProps: 45,
    				disableFocusTrap: 46
    			},
    			null,
    			[-1, -1, -1]
    		);
    	}
    }

    var css_248z$k = ".modal-content.svelte-1cny4wt{border:none}.category-container.svelte-1cny4wt{display:flex;flex-wrap:wrap;gap:8px}.category-button.svelte-1cny4wt{padding:4px 8px;background-color:rgb(238, 238, 238);border:none;cursor:pointer;white-space:nowrap;margin:2px;border-radius:4px;text-align:center;font-size:1rem;border:1px solid rgb(238, 238, 238)}.category-button.svelte-1cny4wt:focus{outline:none}.category-button.selected.svelte-1cny4wt{background-color:rgb(249 115 22);color:white;border:1px solid rgb(249 115 22)}.category-button.svelte-1cny4wt:hover{border:1px solid black}";
    styleInject(css_248z$k);

    /* src/components/Modals/SelectionModal.svelte generated by Svelte v3.59.1 */

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (32:8) {#each categories as category}
    function create_each_block$7(ctx) {
    	let button;
    	let t0_value = /*category*/ ctx[9] + "";
    	let t0;
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*category*/ ctx[9]);
    	}

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			attr(button, "class", button_class_value = "category-button " + (/*localSelectedCategories*/ ctx[1].includes(/*category*/ ctx[9])
    			? 'selected'
    			: '') + " svelte-1cny4wt");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*categories*/ 1 && t0_value !== (t0_value = /*category*/ ctx[9] + "")) set_data(t0, t0_value);

    			if (dirty & /*localSelectedCategories, categories*/ 3 && button_class_value !== (button_class_value = "category-button " + (/*localSelectedCategories*/ ctx[1].includes(/*category*/ ctx[9])
    			? 'selected'
    			: '') + " svelte-1cny4wt")) {
    				attr(button, "class", button_class_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$p(ctx) {
    	let div2;
    	let h4;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let button0;
    	let t4;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div2 = element("div");
    			h4 = element("h4");
    			h4.textContent = "Categories";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Reset";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Confirm Selection";
    			attr(h4, "class", "base-h4 text-color-df");
    			set_style(h4, "margin-top", "0.2em");
    			attr(div0, "class", "category-container svelte-1cny4wt");
    			attr(button0, "class", "bs-blue text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl");
    			attr(button1, "class", "bs-orange active:bg-orange-600 text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl");
    			attr(div1, "class", "container mx-auto px-4 py-4 flex justify-end");
    			attr(div2, "class", "modal-content svelte-1cny4wt");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, h4);
    			append(div2, t1);
    			append(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append(div2, t2);
    			append(div2, div1);
    			append(div1, button0);
    			append(div1, t4);
    			append(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*handleReset*/ ctx[4]),
    					listen(button1, "click", /*handleConfirm*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*localSelectedCategories, categories, toggleCategory*/ 7) {
    				each_value = /*categories*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { categories } = $$props;
    	let { initialSelectedCategories = [] } = $$props;
    	let localSelectedCategories = [...initialSelectedCategories];
    	let { onConfirm } = $$props;
    	const { close } = getContext("simple-modal");

    	function toggleCategory(category) {
    		if (localSelectedCategories.includes(category)) {
    			$$invalidate(1, localSelectedCategories = localSelectedCategories.filter(c => c !== category));
    		} else {
    			$$invalidate(1, localSelectedCategories = [...localSelectedCategories, category]);
    		}
    	}

    	function handleConfirm() {
    		onConfirm(localSelectedCategories);
    		close();
    	}

    	function handleReset() {
    		$$invalidate(1, localSelectedCategories = []);
    	}

    	const click_handler = category => toggleCategory(category);

    	$$self.$$set = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('initialSelectedCategories' in $$props) $$invalidate(5, initialSelectedCategories = $$props.initialSelectedCategories);
    		if ('onConfirm' in $$props) $$invalidate(6, onConfirm = $$props.onConfirm);
    	};

    	return [
    		categories,
    		localSelectedCategories,
    		toggleCategory,
    		handleConfirm,
    		handleReset,
    		initialSelectedCategories,
    		onConfirm,
    		click_handler
    	];
    }

    class SelectionModal extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$o, create_fragment$p, safe_not_equal, {
    			categories: 0,
    			initialSelectedCategories: 5,
    			onConfirm: 6
    		});
    	}
    }

    var css_248z$j = ".category-container.svelte-19klr7q{display:flex;flex-wrap:wrap;gap:8px}.remove-button.svelte-19klr7q:hover::after{content:\"×\";position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);color:#fff;font-size:1.5rem;pointer-events:none}";
    styleInject(css_248z$j);

    /* src/components/Widgets/PostIdeaWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (176:16) <Modal show={$categoryModal}>
    function create_default_slot$7(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.textContent = "+";
    			attr(button, "class", "font-bold py-1 add-button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*openCategoryModal*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (182:16) {#each $previewStore.categories as category}
    function create_each_block$6(ctx) {
    	let button;
    	let t0_value = /*category*/ ctx[18] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[13](/*category*/ ctx[18]);
    	}

    	return {
    		c() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(button, "class", "bs-blue remove-button svelte-19klr7q");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (!mounted) {
    				dispose = listen(button, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$previewStore*/ 1 && t0_value !== (t0_value = /*category*/ ctx[18] + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$o(ctx) {
    	let div5;
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let h50;
    	let t3;
    	let div0;
    	let input0;
    	let t4;
    	let h51;
    	let t6;
    	let input1;
    	let t7;
    	let h52;
    	let t9;
    	let textarea0;
    	let t10;
    	let hr;
    	let t11;
    	let h53;
    	let t13;
    	let textarea1;
    	let t14;
    	let h54;
    	let t16;
    	let input2;
    	let t17;
    	let h55;
    	let t19;
    	let input3;
    	let t20;
    	let h56;
    	let t22;
    	let input4;
    	let t23;
    	let h57;
    	let t25;
    	let div1;
    	let modal;
    	let t26;
    	let t27;
    	let div4;
    	let button0;
    	let t29;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	modal = new Modal({
    			props: {
    				show: /*$categoryModal*/ ctx[1],
    				$$slots: { default: [create_default_slot$7] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = /*$previewStore*/ ctx[0].categories;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div5 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Spark Idea";
    			t1 = space();
    			div2 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Idea Title";
    			t3 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t4 = space();
    			h51 = element("h5");
    			h51.textContent = "Idea Subtitle";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			h52 = element("h5");
    			h52.textContent = "Abstract";
    			t9 = space();
    			textarea0 = element("textarea");
    			t10 = space();
    			hr = element("hr");
    			t11 = space();
    			h53 = element("h5");
    			h53.textContent = "Description";
    			t13 = space();
    			textarea1 = element("textarea");
    			t14 = space();
    			h54 = element("h5");
    			h54.textContent = "Banner URL";
    			t16 = space();
    			input2 = element("input");
    			t17 = space();
    			h55 = element("h5");
    			h55.textContent = "GitHub Repository";
    			t19 = space();
    			input3 = element("input");
    			t20 = space();
    			h56 = element("h5");
    			h56.textContent = "Lightning Address";
    			t22 = space();
    			input4 = element("input");
    			t23 = space();
    			h57 = element("h5");
    			h57.textContent = "Categories";
    			t25 = space();
    			div1 = element("div");
    			create_component(modal.$$.fragment);
    			t26 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t27 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Preview";
    			t29 = space();
    			button1 = element("button");
    			button1.textContent = "Spark Idea";
    			attr(h2, "class", "base-h2 text-color-df");
    			attr(h50, "class", "base-h5 text-color-df");
    			attr(input0, "type", "text");
    			attr(input0, "class", "input-style");
    			attr(h51, "class", "base-h5 text-color-df");
    			attr(input1, "type", "text");
    			attr(input1, "class", "input-style");
    			attr(h52, "class", "base-h5 text-color-df");
    			attr(textarea0, "rows", "1");
    			attr(textarea0, "class", "input-style input-style-resize");
    			attr(hr, "class", "text-blueGray-600");
    			set_style(hr, "width", "90%");
    			set_style(hr, "margin", "auto");
    			set_style(hr, "margin-top", "30pt");
    			attr(h53, "class", "base-h5 text-color-df");
    			attr(textarea1, "rows", "1");
    			attr(textarea1, "class", "input-style input-style-resize");
    			attr(h54, "class", "base-h5 text-color-df");
    			attr(input2, "type", "text");
    			attr(input2, "class", "input-style");
    			attr(h55, "class", "base-h5 text-color-df");
    			attr(input3, "type", "text");
    			attr(input3, "class", "input-style");
    			attr(h56, "class", "base-h5 text-color-df");
    			attr(input4, "type", "text");
    			attr(input4, "class", "input-style");
    			attr(h57, "class", "base-h5 text-color-df");
    			attr(div1, "class", "category-container svelte-19klr7q");
    			attr(div2, "class", "single-card-content text-color-df");
    			attr(div3, "class", "text-center mt-6 px-6");
    			attr(button0, "class", "bs-blue text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl");
    			attr(button1, "class", "bs-orange active:bg-orange-600 text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl");
    			attr(div4, "class", "container mx-auto px-4 py-4 flex justify-end");
    			attr(div5, "class", "single-card container");
    		},
    		m(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div3);
    			append(div3, h2);
    			append(div3, t1);
    			append(div3, div2);
    			append(div2, h50);
    			append(div2, t3);
    			append(div2, div0);
    			append(div0, input0);
    			set_input_value(input0, /*$previewStore*/ ctx[0].name);
    			append(div0, t4);
    			append(div0, h51);
    			append(div0, t6);
    			append(div0, input1);
    			set_input_value(input1, /*$previewStore*/ ctx[0].subtitle);
    			append(div0, t7);
    			append(div0, h52);
    			append(div0, t9);
    			append(div0, textarea0);
    			set_input_value(textarea0, /*$previewStore*/ ctx[0].abstract);
    			append(div2, t10);
    			append(div2, hr);
    			append(div2, t11);
    			append(div2, h53);
    			append(div2, t13);
    			append(div2, textarea1);
    			set_input_value(textarea1, /*$previewStore*/ ctx[0].message);
    			append(div2, t14);
    			append(div2, h54);
    			append(div2, t16);
    			append(div2, input2);
    			set_input_value(input2, /*$previewStore*/ ctx[0].bannerUrl);
    			append(div2, t17);
    			append(div2, h55);
    			append(div2, t19);
    			append(div2, input3);
    			set_input_value(input3, /*$previewStore*/ ctx[0].githubRepo);
    			append(div2, t20);
    			append(div2, h56);
    			append(div2, t22);
    			append(div2, input4);
    			set_input_value(input4, /*$previewStore*/ ctx[0].lightningAddress);
    			append(div2, t23);
    			append(div2, h57);
    			append(div2, t25);
    			append(div2, div1);
    			mount_component(modal, div1, null);
    			append(div1, t26);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			append(div5, t27);
    			append(div5, div4);
    			append(div4, button0);
    			append(div4, t29);
    			append(div4, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen(textarea0, "input", autoResizeTextarea$1),
    					listen(textarea0, "input", /*textarea0_input_handler*/ ctx[8]),
    					listen(textarea1, "input", autoResizeTextarea$1),
    					listen(textarea1, "input", /*textarea1_input_handler*/ ctx[9]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[11]),
    					listen(input4, "input", /*input4_input_handler*/ ctx[12]),
    					listen(button0, "click", /*click_handler_1*/ ctx[14]),
    					listen(button1, "click", /*postIdea*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$previewStore*/ 1 && input0.value !== /*$previewStore*/ ctx[0].name) {
    				set_input_value(input0, /*$previewStore*/ ctx[0].name);
    			}

    			if (dirty & /*$previewStore*/ 1 && input1.value !== /*$previewStore*/ ctx[0].subtitle) {
    				set_input_value(input1, /*$previewStore*/ ctx[0].subtitle);
    			}

    			if (dirty & /*$previewStore*/ 1) {
    				set_input_value(textarea0, /*$previewStore*/ ctx[0].abstract);
    			}

    			if (dirty & /*$previewStore*/ 1) {
    				set_input_value(textarea1, /*$previewStore*/ ctx[0].message);
    			}

    			if (dirty & /*$previewStore*/ 1 && input2.value !== /*$previewStore*/ ctx[0].bannerUrl) {
    				set_input_value(input2, /*$previewStore*/ ctx[0].bannerUrl);
    			}

    			if (dirty & /*$previewStore*/ 1 && input3.value !== /*$previewStore*/ ctx[0].githubRepo) {
    				set_input_value(input3, /*$previewStore*/ ctx[0].githubRepo);
    			}

    			if (dirty & /*$previewStore*/ 1 && input4.value !== /*$previewStore*/ ctx[0].lightningAddress) {
    				set_input_value(input4, /*$previewStore*/ ctx[0].lightningAddress);
    			}

    			const modal_changes = {};
    			if (dirty & /*$categoryModal*/ 2) modal_changes.show = /*$categoryModal*/ ctx[1];

    			if (dirty & /*$$scope*/ 2097152) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);

    			if (dirty & /*removeCategory, $previewStore*/ 33) {
    				each_value = /*$previewStore*/ ctx[0].categories;
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div5);
    			destroy_component(modal);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function autoResizeTextarea$1(e) {
    	e.target.style.height = "";
    	e.target.style.height = e.target.scrollHeight + "px";
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let $previewStore;
    	let $nostrManager;
    	let $categoryModal;
    	component_subscribe($$self, previewStore, $$value => $$invalidate(0, $previewStore = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(15, $nostrManager = $$value));

    	let categories = [
    		"Art & Design",
    		"Bitcoin & P2P",
    		"Comics & Graphic Novels",
    		"Crafts & DIY",
    		"Fashion & Beauty",
    		"Film, Video & Animation",
    		"Food & Beverages",
    		"Games & Gaming",
    		"Health & Fitness",
    		"Journalism & News",
    		"Music & Audio",
    		"Photography & Visual Arts",
    		"Publishing & Writing",
    		"Technology & Software",
    		"Education & Learning",
    		"Environment & Sustainability",
    		"Sports & Outdoors",
    		"Travel & Tourism",
    		"Non-Profit & Social Causes",
    		"Business & Entrepreneurship",
    		"Science & Research",
    		"Home & Lifestyle",
    		"Automotive & Transportation",
    		"Pets & Animals",
    		"Parenting & Family"
    	];

    	let categoryModal = writable(null);
    	component_subscribe($$self, categoryModal, value => $$invalidate(1, $categoryModal = value));

    	function openCategoryModal() {
    		categoryModal.set(bind(SelectionModal, {
    			categories,
    			initialSelectedCategories: $previewStore.categories,
    			onConfirm: handleCategoryConfirm
    		}));
    	}

    	function handleCategoryConfirm(selectedCategories) {
    		set_store_value(previewStore, $previewStore.categories = selectedCategories, $previewStore);
    	}

    	onDestroy(() => {
    		categoryModal.set(false);
    	});

    	async function postIdea() {
    		if ($previewStore.name && $previewStore.subtitle && $previewStore.abstract && $previewStore.message && $previewStore.bannerUrl && $previewStore.githubRepo && $previewStore.lightningAddress && $previewStore.categories) {
    			let tags = [
    				["s", "bitspark"],
    				["iName", $previewStore.name],
    				["iSub", $previewStore.subtitle],
    				["ibUrl", $previewStore.bannerUrl],
    				["gitrepo", $previewStore.githubRepo],
    				["lnadress", $previewStore.lightningAddress],
    				["abstract", $previewStore.abstract]
    			];

    			$previewStore.categories.forEach(category => {
    				tags.push(["c", category]);
    			});

    			// Senden des Events über nostrManager
    			if ($nostrManager && $nostrManager.write_mode) {
    				await $nostrManager.sendEvent(NOSTR_KIND_IDEA, $previewStore.message, tags);
    			}

    			// Zurücksetzen der previewStore Werte
    			set_store_value(previewStore, $previewStore.name = "", $previewStore);

    			set_store_value(previewStore, $previewStore.subtitle = "", $previewStore);
    			set_store_value(previewStore, $previewStore.abstract = "", $previewStore);
    			set_store_value(previewStore, $previewStore.message = "", $previewStore);
    			set_store_value(previewStore, $previewStore.bannerUrl = "", $previewStore);
    			set_store_value(previewStore, $previewStore.githubRepo = "", $previewStore);
    			set_store_value(previewStore, $previewStore.lightningAddress = "", $previewStore);
    			set_store_value(previewStore, $previewStore.categories = [], $previewStore);
    			navigate("/");
    		} else {
    			console.log("Please fill all fields.");
    		}
    	}

    	function removeCategory(category) {
    		let selectedCategories = $previewStore.categories.filter(item => item !== category);
    		set_store_value(previewStore, $previewStore.categories = selectedCategories, $previewStore);
    	}

    	function input0_input_handler() {
    		$previewStore.name = this.value;
    		previewStore.set($previewStore);
    	}

    	function input1_input_handler() {
    		$previewStore.subtitle = this.value;
    		previewStore.set($previewStore);
    	}

    	function textarea0_input_handler() {
    		$previewStore.abstract = this.value;
    		previewStore.set($previewStore);
    	}

    	function textarea1_input_handler() {
    		$previewStore.message = this.value;
    		previewStore.set($previewStore);
    	}

    	function input2_input_handler() {
    		$previewStore.bannerUrl = this.value;
    		previewStore.set($previewStore);
    	}

    	function input3_input_handler() {
    		$previewStore.githubRepo = this.value;
    		previewStore.set($previewStore);
    	}

    	function input4_input_handler() {
    		$previewStore.lightningAddress = this.value;
    		previewStore.set($previewStore);
    	}

    	const click_handler = category => removeCategory(category);
    	const click_handler_1 = () => navigate("/preview");

    	return [
    		$previewStore,
    		$categoryModal,
    		categoryModal,
    		openCategoryModal,
    		postIdea,
    		removeCategory,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class PostIdeaWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$n, create_fragment$o, safe_not_equal, {});
    	}
    }

    /* src/views/PostIdea.svelte generated by Svelte v3.59.1 */

    function create_fragment$n(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let postideawidget;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: bannerImage$4,
    				title: title$4,
    				subtitle: subtitle$4,
    				show_right_text: true
    			}
    		});

    	toolbar = new Toolbar({});
    	postideawidget = new PostIdeaWidget({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(postideawidget.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			attr(div1, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(banner, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(postideawidget, div0, null);
    			append(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*$contentContainerClass*/ 1) {
    				attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(postideawidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(postideawidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(postideawidget);
    			destroy_component(footer);
    		}
    	};
    }

    let bannerImage$4 = "../../img/Banner1u.png";
    let title$4 = "BitSpark";
    let subtitle$4 = "spark idea";

    function instance$m($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(0, $contentContainerClass = $$value));
    	return [$contentContainerClass];
    }

    class PostIdea extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$m, create_fragment$n, safe_not_equal, {});
    	}
    }

    /* src/views/IdeaPreview.svelte generated by Svelte v3.59.1 */

    function create_fragment$m(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div3;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div2;
    	let ideawidget;
    	let t3;
    	let zapwidget;
    	let t4;
    	let div0;
    	let jobwidget;
    	let t5;
    	let div1;
    	let commentwidget;
    	let t6;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: /*$previewStore*/ ctx[1].bannerUrl,
    				title: /*$previewStore*/ ctx[1].name,
    				subtitle: /*$previewStore*/ ctx[1].subtitle,
    				show_right_text: false
    			}
    		});

    	toolbar = new Toolbar({
    			props: {
    				lnAddress: /*$previewStore*/ ctx[1].lightningAddress,
    				pubkey: /*pubkey*/ ctx[0],
    				githubRepo: /*$previewStore*/ ctx[1].githubRepo
    			}
    		});

    	ideawidget = new IdeaWidget({
    			props: {
    				idea: /*$previewStore*/ ctx[1],
    				preview: true
    			}
    		});

    	zapwidget = new ZapWidget({});
    	jobwidget = new JobWidget({});
    	commentwidget = new CommentWidget({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(ideawidget.$$.fragment);
    			t3 = space();
    			create_component(zapwidget.$$.fragment);
    			t4 = space();
    			div0 = element("div");
    			create_component(jobwidget.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			create_component(commentwidget.$$.fragment);
    			t6 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", "single-card container");
    			attr(div1, "class", "single-card container");
    			attr(div2, "class", /*$contentContainerClass*/ ctx[2]);
    			attr(div3, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div3);
    			mount_component(banner, div3, null);
    			append(div3, t1);
    			mount_component(toolbar, div3, null);
    			append(div3, t2);
    			append(div3, div2);
    			mount_component(ideawidget, div2, null);
    			append(div2, t3);
    			mount_component(zapwidget, div2, null);
    			append(div2, t4);
    			append(div2, div0);
    			mount_component(jobwidget, div0, null);
    			append(div2, t5);
    			append(div2, div1);
    			mount_component(commentwidget, div1, null);
    			append(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const banner_changes = {};
    			if (dirty & /*$previewStore*/ 2) banner_changes.bannerImage = /*$previewStore*/ ctx[1].bannerUrl;
    			if (dirty & /*$previewStore*/ 2) banner_changes.title = /*$previewStore*/ ctx[1].name;
    			if (dirty & /*$previewStore*/ 2) banner_changes.subtitle = /*$previewStore*/ ctx[1].subtitle;
    			banner.$set(banner_changes);
    			const toolbar_changes = {};
    			if (dirty & /*$previewStore*/ 2) toolbar_changes.lnAddress = /*$previewStore*/ ctx[1].lightningAddress;
    			if (dirty & /*pubkey*/ 1) toolbar_changes.pubkey = /*pubkey*/ ctx[0];
    			if (dirty & /*$previewStore*/ 2) toolbar_changes.githubRepo = /*$previewStore*/ ctx[1].githubRepo;
    			toolbar.$set(toolbar_changes);
    			const ideawidget_changes = {};
    			if (dirty & /*$previewStore*/ 2) ideawidget_changes.idea = /*$previewStore*/ ctx[1];
    			ideawidget.$set(ideawidget_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 4) {
    				attr(div2, "class", /*$contentContainerClass*/ ctx[2]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(ideawidget.$$.fragment, local);
    			transition_in(zapwidget.$$.fragment, local);
    			transition_in(jobwidget.$$.fragment, local);
    			transition_in(commentwidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(ideawidget.$$.fragment, local);
    			transition_out(zapwidget.$$.fragment, local);
    			transition_out(jobwidget.$$.fragment, local);
    			transition_out(commentwidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(ideawidget);
    			destroy_component(zapwidget);
    			destroy_component(jobwidget);
    			destroy_component(commentwidget);
    			destroy_component(footer);
    		}
    	};
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $previewStore;
    	let $contentContainerClass;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(3, $nostrManager = $$value));
    	component_subscribe($$self, previewStore, $$value => $$invalidate(1, $previewStore = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(2, $contentContainerClass = $$value));
    	let pubkey = null;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 8) {
    			if ($nostrManager) {
    				$$invalidate(0, pubkey = $nostrManager.publicKey);
    			}
    		}
    	};

    	return [pubkey, $previewStore, $contentContainerClass, $nostrManager];
    }

    class IdeaPreview extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$l, create_fragment$m, safe_not_equal, {});
    	}
    }

    var css_248z$i = ".job-requirements.svelte-1air933.svelte-1air933{white-space:pre-line}:root{--primary-bg-color:#e2e8f0;--primary-text-color:#4a5568;--primary-font-size:1.2em;--primary-line-height:1.6em}.idea-title.svelte-1air933.svelte-1air933{font-size:4rem;font-weight:700;color:var(--primary-text-color);margin-bottom:1rem}.section-title.svelte-1air933.svelte-1air933{font-size:3rem;font-weight:600;color:#2c5282;margin:1rem 0;padding:0.5rem 0;text-align:center}.idea-description.svelte-1air933.svelte-1air933{width:70%;margin:2rem auto;text-align:justify;font-size:var(--primary-font-size);line-height:var(--primary-line-height)}.abstract-text.svelte-1air933.svelte-1air933{width:50%;margin:2rem auto;text-align:justify;font-size:1.1em;line-height:1.6em}.offer-popup-overlay.svelte-1air933.svelte-1air933{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0, 0, 0, 0.7);display:flex;justify-content:center;align-items:center;backdrop-filter:blur(5px)}.offer-popup.svelte-1air933.svelte-1air933{width:1000px;padding:20px;background-color:#fff;border-radius:10px;box-shadow:0px 0px 15px rgba(0, 0, 0, 0.3);font-family:\"Ihre Hauptwebsite-Schriftart\", sans-serif;display:flex;flex-direction:column;justify-content:space-between}.offer-popup.svelte-1air933 textarea.svelte-1air933{width:100%;padding:10px;margin-top:5px;border:1px solid #e2e8f0;border-radius:5px;font-size:1em;height:200px}.offer-popup.svelte-1air933 h3.svelte-1air933,.offer-popup.svelte-1air933 label.svelte-1air933{margin-bottom:1rem;color:var(--primary-text-color)}.offer-popup.svelte-1air933 input.svelte-1air933,.offer-popup.svelte-1air933 textarea.svelte-1air933{width:100%;padding:10px;margin-top:5px;border:1px solid #e2e8f0;border-radius:5px;font-size:1em}.offer-popup.svelte-1air933 button.svelte-1air933{padding:10px 15px;border-radius:5px;border:none;cursor:pointer;color:#ffffff;font-weight:bold}.offer-popup.svelte-1air933 button.svelte-1air933:first-child{background-color:#2c5282}.offer-popup.svelte-1air933 button.svelte-1air933:last-child{background-color:rgb(249 115 22)}.post-offer-btn.svelte-1air933.svelte-1air933{background-color:rgb(44, 82, 130);border:none;border-radius:5px;padding:10px 15px;color:#ffffff;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-top:1em;margin:1em auto;display:block;width:fit-content}.post-offer-btn.svelte-1air933 i.svelte-1air933{font-size:1em}.post-offer-btn.svelte-1air933.svelte-1air933:hover{background-color:#1a3b5c}.offer-popup-buttons.svelte-1air933.svelte-1air933{display:flex;justify-content:flex-end;gap:10px}.offer-popup.svelte-1air933 button.svelte-1air933:last-child{margin-right:0}.offer-popup.svelte-1air933 button.svelte-1air933:first-child{margin-right:10px}";
    styleInject(css_248z$i);

    /* src/views/Job.svelte generated by Svelte v3.59.1 */

    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-times-circle svelte-1air933"></i>`;
    			attr(button, "class", "absolute top-4 right-4 text-gray-400 svelte-1air933");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*deleteJob*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (179:2) {#if showOfferPopup}
    function create_if_block$a(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t1;
    	let label0;
    	let t2;
    	let input0;
    	let input0_placeholder_value;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let t5;
    	let label2;
    	let t6;
    	let textarea;
    	let t7;
    	let div0;
    	let button0;
    	let t9;
    	let button1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Send Offer";
    			t1 = space();
    			label0 = element("label");
    			t2 = text("Sats:\n          ");
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Required Time:\n          ");
    			input1 = element("input");
    			t5 = space();
    			label2 = element("label");
    			t6 = text("Message:\n          ");
    			textarea = element("textarea");
    			t7 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Submit";
    			attr(h3, "class", "svelte-1air933");
    			attr(input0, "type", "text");
    			attr(input0, "placeholder", input0_placeholder_value = /*job*/ ctx[6].sats);
    			attr(input0, "class", "svelte-1air933");
    			attr(label0, "class", "svelte-1air933");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "2 Weeks");
    			attr(input1, "class", "svelte-1air933");
    			attr(label1, "class", "svelte-1air933");
    			attr(textarea, "placeholder", "Your Message...");
    			attr(textarea, "class", "svelte-1air933");
    			attr(label2, "class", "svelte-1air933");
    			attr(button0, "class", "svelte-1air933");
    			attr(button1, "class", "svelte-1air933");
    			attr(div0, "class", "offer-popup-buttons svelte-1air933");
    			attr(div1, "class", "offer-popup svelte-1air933");
    			attr(div2, "class", "offer-popup-overlay svelte-1air933");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div1);
    			append(div1, h3);
    			append(div1, t1);
    			append(div1, label0);
    			append(label0, t2);
    			append(label0, input0);
    			set_input_value(input0, /*developerBid*/ ctx[3]);
    			append(div1, t3);
    			append(div1, label1);
    			append(label1, t4);
    			append(label1, input1);
    			set_input_value(input1, /*requiredTime*/ ctx[4]);
    			append(div1, t5);
    			append(div1, label2);
    			append(label2, t6);
    			append(label2, textarea);
    			set_input_value(textarea, /*developerIntro*/ ctx[5]);
    			append(div1, t7);
    			append(div1, div0);
    			append(div0, button0);
    			append(div0, t9);
    			append(div0, button1);

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[13]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[14]),
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[15]),
    					listen(button0, "click", /*click_handler_1*/ ctx[16]),
    					listen(button1, "click", /*postOffer*/ ctx[9])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*job*/ 64 && input0_placeholder_value !== (input0_placeholder_value = /*job*/ ctx[6].sats)) {
    				attr(input0, "placeholder", input0_placeholder_value);
    			}

    			if (dirty & /*developerBid*/ 8 && input0.value !== /*developerBid*/ ctx[3]) {
    				set_input_value(input0, /*developerBid*/ ctx[3]);
    			}

    			if (dirty & /*requiredTime*/ 16 && input1.value !== /*requiredTime*/ ctx[4]) {
    				set_input_value(input1, /*requiredTime*/ ctx[4]);
    			}

    			if (dirty & /*developerIntro*/ 32) {
    				set_input_value(textarea, /*developerIntro*/ ctx[5]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$l(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div5;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div4;
    	let div2;
    	let t3;
    	let div1;
    	let div0;
    	let h20;
    	let t5;
    	let p0;
    	let raw0_value = /*job*/ ctx[6]?.abstract + "";
    	let t6;
    	let h21;
    	let t8;
    	let p1;
    	let raw1_value = /*job*/ ctx[6]?.description + "";
    	let t9;
    	let hr;
    	let t10;
    	let h22;
    	let t12;
    	let p2;
    	let raw2_value = /*job*/ ctx[6]?.requirements + "";
    	let t13;
    	let button;
    	let t15;
    	let zapwidget;
    	let t16;
    	let div3;
    	let commentwidget;
    	let div4_class_value;
    	let t17;
    	let t18;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: /*job*/ ctx[6]?.bannerImage,
    				title: /*job*/ ctx[6]?.title,
    				subtitle: `${/*job*/ ctx[6]?.sats} Sats`,
    				show_right_text: false
    			}
    		});

    	toolbar = new Toolbar({});
    	let if_block0 = /*creator_profile*/ ctx[7] && /*creator_profile*/ ctx[7].pubkey === /*$nostrManager*/ ctx[1]?.publicKey && create_if_block_1$2(ctx);
    	zapwidget = new ZapWidget({ props: { eventId: /*id*/ ctx[0] } });
    	commentwidget = new CommentWidget({ props: { id: /*id*/ ctx[0] } });
    	let if_block1 = /*showOfferPopup*/ ctx[2] && create_if_block$a(ctx);
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div5 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Abstract";
    			t5 = space();
    			p0 = element("p");
    			t6 = space();
    			h21 = element("h2");
    			h21.textContent = "User Story";
    			t8 = space();
    			p1 = element("p");
    			t9 = space();
    			hr = element("hr");
    			t10 = space();
    			h22 = element("h2");
    			h22.textContent = "Requirements";
    			t12 = space();
    			p2 = element("p");
    			t13 = space();
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-paper-plane mr-2 svelte-1air933"></i> Send Offer`;
    			t15 = space();
    			create_component(zapwidget.$$.fragment);
    			t16 = space();
    			div3 = element("div");
    			create_component(commentwidget.$$.fragment);
    			t17 = space();
    			if (if_block1) if_block1.c();
    			t18 = space();
    			create_component(footer.$$.fragment);
    			attr(h20, "class", "section-title svelte-1air933");
    			attr(p0, "class", "html-content job-requirements svelte-1air933");
    			attr(h21, "class", "section-title svelte-1air933");
    			attr(p1, "class", "html-content");
    			attr(hr, "class", "my-6");
    			attr(h22, "class", "section-title svelte-1air933");
    			attr(p2, "class", "html-content job-requirements svelte-1air933");
    			attr(button, "class", "post-offer-btn svelte-1air933");
    			attr(div0, "class", "text-center mt-6");
    			attr(div1, "class", "px-6");
    			attr(div2, "class", "container bg-card relative flex flex-col min-w-0 break-words");
    			attr(div3, "class", "single-card container");
    			attr(div4, "class", div4_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[8]) + " svelte-1air933"));
    			attr(div5, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div5);
    			mount_component(banner, div5, null);
    			append(div5, t1);
    			mount_component(toolbar, div5, null);
    			append(div5, t2);
    			append(div5, div4);
    			append(div4, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append(div2, t3);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, h20);
    			append(div0, t5);
    			append(div0, p0);
    			p0.innerHTML = raw0_value;
    			append(div0, t6);
    			append(div0, h21);
    			append(div0, t8);
    			append(div0, p1);
    			p1.innerHTML = raw1_value;
    			append(div0, t9);
    			append(div0, hr);
    			append(div0, t10);
    			append(div0, h22);
    			append(div0, t12);
    			append(div0, p2);
    			p2.innerHTML = raw2_value;
    			append(div0, t13);
    			append(div0, button);
    			append(div4, t15);
    			mount_component(zapwidget, div4, null);
    			append(div4, t16);
    			append(div4, div3);
    			mount_component(commentwidget, div3, null);
    			append(main, t17);
    			if (if_block1) if_block1.m(main, null);
    			append(main, t18);
    			mount_component(footer, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[12]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const banner_changes = {};
    			if (dirty & /*job*/ 64) banner_changes.bannerImage = /*job*/ ctx[6]?.bannerImage;
    			if (dirty & /*job*/ 64) banner_changes.title = /*job*/ ctx[6]?.title;
    			if (dirty & /*job*/ 64) banner_changes.subtitle = `${/*job*/ ctx[6]?.sats} Sats`;
    			banner.$set(banner_changes);

    			if (/*creator_profile*/ ctx[7] && /*creator_profile*/ ctx[7].pubkey === /*$nostrManager*/ ctx[1]?.publicKey) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(div2, t3);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*job*/ 64) && raw0_value !== (raw0_value = /*job*/ ctx[6]?.abstract + "")) p0.innerHTML = raw0_value;			if ((!current || dirty & /*job*/ 64) && raw1_value !== (raw1_value = /*job*/ ctx[6]?.description + "")) p1.innerHTML = raw1_value;			if ((!current || dirty & /*job*/ 64) && raw2_value !== (raw2_value = /*job*/ ctx[6]?.requirements + "")) p2.innerHTML = raw2_value;			const zapwidget_changes = {};
    			if (dirty & /*id*/ 1) zapwidget_changes.eventId = /*id*/ ctx[0];
    			zapwidget.$set(zapwidget_changes);
    			const commentwidget_changes = {};
    			if (dirty & /*id*/ 1) commentwidget_changes.id = /*id*/ ctx[0];
    			commentwidget.$set(commentwidget_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 256 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[8]) + " svelte-1air933"))) {
    				attr(div4, "class", div4_class_value);
    			}

    			if (/*showOfferPopup*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					if_block1.m(main, t18);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(zapwidget.$$.fragment, local);
    			transition_in(commentwidget.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(zapwidget.$$.fragment, local);
    			transition_out(commentwidget.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			if (if_block0) if_block0.d();
    			destroy_component(zapwidget);
    			destroy_component(commentwidget);
    			if (if_block1) if_block1.d();
    			destroy_component(footer);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	let $contentContainerClass;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(1, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(11, $nostrCache = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(8, $contentContainerClass = $$value));
    	let { id } = $$props;
    	let showOfferPopup = false;
    	let developerBid = "";
    	let requiredTime = "";
    	let developerIntro = "";
    	let job = null;
    	let creator_profile = null;

    	function initialize() {
    		if ($nostrManager) {
    			$nostrManager.subscribeToEvents({
    				kinds: [NOSTR_KIND_JOB],
    				ids: [id],
    				"#t": ["job"],
    				"#s": ["bitspark"]
    			});

    			fetchJob();
    		}
    	}

    	async function fetchJob() {
    		const jobEvent = $nostrCache.getEventById(id);

    		if (jobEvent) {
    			$$invalidate(6, job = {
    				title: jobEvent.tags.find(tag => tag[0] === "jTitle")?.[1] || "No Title",
    				abstract: jobEvent.tags.find(tag => tag[0] === "jAbstract")?.[1] || "No Abstract",
    				requirements: jobEvent.tags.find(tag => tag[0] === "jReq")?.[1] || "No Requierements",
    				sats: jobEvent.tags.find(tag => tag[0] === "sats")?.[1] || "0 Sats",
    				bannerImage: jobEvent.tags.find(tag => tag[0] === "jbUrl")?.[1] || "default_image_url",
    				description: jobEvent.content
    			});

    			fetchProfile(jobEvent.pubkey);
    		}
    	}

    	async function fetchProfile(pubkey) {
    		$$invalidate(7, creator_profile = await socialMediaManager.getProfile(pubkey));
    	}

    	async function postOffer() {
    		if (!developerIntro || !developerBid) {
    			console.log("Please fill all fields.");
    			return;
    		}

    		// Stellen Sie sicher, dass $nostrManager vorhanden und im Schreibmodus ist
    		if (!$nostrManager || !$nostrManager.write_mode) {
    			console.log("Nostr manager not available or not in write mode");
    			return;
    		}

    		const tags = [
    			["s", "bitspark"],
    			["t", "offer"],
    			["e", id],
    			["sats", developerBid],
    			["reqTime", requiredTime]
    		]; // Die ID des Jobs
    		// Gebot in Sats
    		// Gebot in Sats

    		try {
    			await $nostrManager.sendEvent(NOSTR_KIND_JOB, developerIntro, tags); // Der Kind-Wert für Jobs
    			console.log("Offer submitted successfully");

    			// Zurücksetzen der Werte und Schließen des Popups
    			$$invalidate(3, developerBid = "");

    			$$invalidate(5, developerIntro = "");
    			$$invalidate(2, showOfferPopup = false);
    		} catch(error) {
    			console.error("Error submitting offer:", error);
    		}
    	}

    	async function deleteJob() {
    		const confirmDelete = confirm("Do you really want to delete this idea?");

    		if (confirmDelete) {
    			await $nostrManager.deleteEvent(id);
    		}
    	}

    	onMount(() => {
    		initialize();
    	});

    	onDestroy(() => {
    		if ($nostrManager) {
    			$nostrManager.unsubscribeAll();
    		}
    	});

    	const click_handler = () => $$invalidate(2, showOfferPopup = true);

    	function input0_input_handler() {
    		developerBid = this.value;
    		$$invalidate(3, developerBid);
    	}

    	function input1_input_handler() {
    		requiredTime = this.value;
    		$$invalidate(4, requiredTime);
    	}

    	function textarea_input_handler() {
    		developerIntro = this.value;
    		$$invalidate(5, developerIntro);
    	}

    	const click_handler_1 = () => $$invalidate(2, showOfferPopup = false);

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 2048) {
    			$nostrCache && fetchJob();
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 2) {
    			$nostrManager && initialize();
    		}

    		if ($$self.$$.dirty & /*$nostrCache, $nostrManager*/ 2050) {
    			$nostrCache && $nostrManager && fetchJob();
    		}

    		if ($$self.$$.dirty & /*id*/ 1) {
    			(initialize());
    		}
    	};

    	return [
    		id,
    		$nostrManager,
    		showOfferPopup,
    		developerBid,
    		requiredTime,
    		developerIntro,
    		job,
    		creator_profile,
    		$contentContainerClass,
    		postOffer,
    		deleteJob,
    		$nostrCache,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler,
    		click_handler_1
    	];
    }

    class Job extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$k, create_fragment$l, safe_not_equal, { id: 0 });
    	}
    }

    /* src/components/Dropdowns/MultiSelectDropdown.svelte generated by Svelte v3.59.1 */

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[9] = list;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (30:4) {#each categories as category}
    function create_each_block$5(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*category*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_change_handler() {
    		/*input_change_handler*/ ctx[6].call(input, /*category*/ ctx[8]);
    	}

    	function change_handler() {
    		return /*change_handler*/ ctx[7](/*category*/ ctx[8]);
    	}

    	return {
    		c() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr(input, "type", "checkbox");
    			attr(input, "class", "mr-2");
    			attr(label, "class", "block px-4 py-2 hover:bg-blue-50 rounded-md");
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			append(label, input);
    			input.checked = /*checkboxStates*/ ctx[2][/*category*/ ctx[8]];
    			append(label, t0);
    			append(label, t1);
    			append(label, t2);

    			if (!mounted) {
    				dispose = [
    					listen(input, "change", input_change_handler),
    					listen(input, "change", change_handler)
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*checkboxStates, categories*/ 5) {
    				input.checked = /*checkboxStates*/ ctx[2][/*category*/ ctx[8]];
    			}

    			if (dirty & /*categories*/ 1 && t1_value !== (t1_value = /*category*/ ctx[8] + "")) set_data(t1, t1_value);
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$k(ctx) {
    	let div1;
    	let button;
    	let t1;
    	let div0;
    	let div0_class_value;
    	let mounted;
    	let dispose;
    	let each_value = /*categories*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Select Categories";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(button, "class", "input-style");
    			attr(div0, "class", div0_class_value = "" + ((/*dropdownOpen*/ ctx[1] ? 'block' : 'hidden') + " absolute w-full bg-white border-t-0 rounded-b-md border-2 border-gray-200 z-10"));
    			attr(div1, "class", "");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, button);
    			append(div1, t1);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*categories, checkboxStates, toggleCategory*/ 13) {
    				each_value = /*categories*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*dropdownOpen*/ 2 && div0_class_value !== (div0_class_value = "" + ((/*dropdownOpen*/ ctx[1] ? 'block' : 'hidden') + " absolute w-full bg-white border-t-0 rounded-b-md border-2 border-gray-200 z-10"))) {
    				attr(div0, "class", div0_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { categories = [] } = $$props;
    	let { selected = [] } = $$props;
    	let dropdownOpen = false;
    	let checkboxStates = {};

    	function toggleCategory(category) {
    		const isSelected = selected.includes(category);

    		if (isSelected) {
    			$$invalidate(4, selected = selected.filter(item => item !== category));
    		} else if (selected.length < 3) {
    			$$invalidate(4, selected = [...selected, category]);
    		}
    	}

    	const click_handler = () => $$invalidate(1, dropdownOpen = !dropdownOpen);

    	function input_change_handler(category) {
    		checkboxStates[category] = this.checked;
    		(($$invalidate(2, checkboxStates), $$invalidate(0, categories)), $$invalidate(4, selected));
    	}

    	const change_handler = category => toggleCategory(category);

    	$$self.$$set = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*categories, selected*/ 17) {
    			categories.forEach(category => {
    				$$invalidate(2, checkboxStates[category] = selected.includes(category), checkboxStates);
    			});
    		}
    	};

    	return [
    		categories,
    		dropdownOpen,
    		checkboxStates,
    		toggleCategory,
    		selected,
    		click_handler,
    		input_change_handler,
    		change_handler
    	];
    }

    class MultiSelectDropdown extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$j, create_fragment$k, safe_not_equal, { categories: 0, selected: 4 });
    	}
    }

    // Definieren Sie die anfänglichen Daten für einen Job
    const initialJob = {
        ideaId: "",            // Diese ID wird verwendet, um den Job mit einer bestimmten Idee zu verknüpfen
        sats: "",            // Diese ID wird verwendet, um den Job mit einer bestimmten Idee zu verknüpfen
        jobTitle: "",
        jBannerUrl: "",
        jobDescription: "",
        jobCategories: [],
    };

    // Erstellen Sie den Store für Job
    const previewJobStore = writable(initialJob);

    var css_248z$h = ".prevButton.svelte-1utxjqs{background-color:#223d6d}.prevButton.svelte-1utxjqs:active{background-color:#11253b}";
    styleInject(css_248z$h);

    /* src/views/PostJob.svelte generated by Svelte v3.59.1 */

    function create_fragment$j(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div14;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div13;
    	let div12;
    	let div10;
    	let div9;
    	let h2;
    	let t4;
    	let div8;
    	let div0;
    	let input0;
    	let t5;
    	let div1;
    	let input1;
    	let t6;
    	let div2;
    	let input2;
    	let t7;
    	let div3;
    	let textarea0;
    	let t8;
    	let div4;
    	let textarea1;
    	let t9;
    	let div5;
    	let textarea2;
    	let t10;
    	let div6;
    	let multiselectdropdown0;
    	let updating_selected;
    	let t11;
    	let div7;
    	let multiselectdropdown1;
    	let updating_selected_1;
    	let t12;
    	let div11;
    	let button;
    	let div13_class_value;
    	let t14;
    	let footer;
    	let current;
    	let mounted;
    	let dispose;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: bannerImage$3,
    				title: title$3,
    				subtitle: subtitle$3,
    				show_right_text: true
    			}
    		});

    	toolbar = new Toolbar({});

    	function multiselectdropdown0_selected_binding(value) {
    		/*multiselectdropdown0_selected_binding*/ ctx[10](value);
    	}

    	let multiselectdropdown0_props = { categories: job_categories };

    	if (/*$previewJobStore*/ ctx[0].jobCategories !== void 0) {
    		multiselectdropdown0_props.selected = /*$previewJobStore*/ ctx[0].jobCategories;
    	}

    	multiselectdropdown0 = new MultiSelectDropdown({ props: multiselectdropdown0_props });
    	binding_callbacks.push(() => bind$1(multiselectdropdown0, 'selected', multiselectdropdown0_selected_binding));

    	function multiselectdropdown1_selected_binding(value) {
    		/*multiselectdropdown1_selected_binding*/ ctx[11](value);
    	}

    	let multiselectdropdown1_props = { categories: coding_language };

    	if (/*$previewJobStore*/ ctx[0].selectedCodingLanguages !== void 0) {
    		multiselectdropdown1_props.selected = /*$previewJobStore*/ ctx[0].selectedCodingLanguages;
    	}

    	multiselectdropdown1 = new MultiSelectDropdown({ props: multiselectdropdown1_props });
    	binding_callbacks.push(() => bind$1(multiselectdropdown1, 'selected', multiselectdropdown1_selected_binding));
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div14 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div13 = element("div");
    			div12 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Post a Job";
    			t4 = space();
    			div8 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t5 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t6 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t7 = space();
    			div3 = element("div");
    			textarea0 = element("textarea");
    			t8 = space();
    			div4 = element("div");
    			textarea1 = element("textarea");
    			t9 = space();
    			div5 = element("div");
    			textarea2 = element("textarea");
    			t10 = space();
    			div6 = element("div");
    			create_component(multiselectdropdown0.$$.fragment);
    			t11 = space();
    			div7 = element("div");
    			create_component(multiselectdropdown1.$$.fragment);
    			t12 = space();
    			div11 = element("div");
    			button = element("button");
    			button.textContent = "Post Job";
    			t14 = space();
    			create_component(footer.$$.fragment);
    			attr(h2, "class", "text-2xl font-semibold mb-4");
    			attr(input0, "type", "text");
    			attr(input0, "placeholder", "Job Title");
    			attr(input0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input0, "width", "100%");
    			attr(div0, "class", "mb-4");
    			attr(input1, "type", "text");
    			attr(input1, "placeholder", "Sats");
    			attr(input1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input1, "width", "100%");
    			attr(div1, "class", "mb-4");
    			attr(input2, "type", "text");
    			attr(input2, "placeholder", "Banner URL");
    			attr(input2, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			set_style(input2, "width", "100%");
    			attr(div2, "class", "mb-4");
    			attr(textarea0, "rows", "1");
    			attr(textarea0, "placeholder", "Abstract");
    			attr(textarea0, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea0, "width", "100%");
    			attr(div3, "class", "mb-4");
    			attr(textarea1, "rows", "1");
    			attr(textarea1, "placeholder", "User Story");
    			attr(textarea1, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea1, "width", "100%");
    			attr(div4, "class", "mb-4");
    			attr(textarea2, "rows", "1");
    			attr(textarea2, "placeholder", "Requirements");
    			attr(textarea2, "class", "flex justify-center block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 resize-none overflow-hidden");
    			set_style(textarea2, "width", "100%");
    			attr(div5, "class", "mb-4");
    			attr(div6, "class", "mb-4 mt-4");
    			set_style(div6, "width", "100%");
    			attr(div7, "class", "mb-4 mt-4");
    			set_style(div7, "width", "100%");
    			attr(div9, "class", "w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto bg-white p-8");
    			set_style(div9, "width", "100%");
    			attr(div10, "class", "flex flex-wrap justify-center");
    			attr(button, "class", "prevButton text-white font-bold py-2 px-4 block rounded border ml-4 mt-2 hover:shadow-xl svelte-1utxjqs");
    			attr(div11, "class", "container mx-auto px-4 py-4 flex justify-end");
    			attr(div12, "class", "container bg-card relative flex flex-col min-w-0 break-words");
    			attr(div13, "class", div13_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[1]) + " svelte-1utxjqs"));
    			attr(div14, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div14);
    			mount_component(banner, div14, null);
    			append(div14, t1);
    			mount_component(toolbar, div14, null);
    			append(div14, t2);
    			append(div14, div13);
    			append(div13, div12);
    			append(div12, div10);
    			append(div10, div9);
    			append(div9, h2);
    			append(div9, t4);
    			append(div9, div8);
    			append(div8, div0);
    			append(div0, input0);
    			set_input_value(input0, /*$previewJobStore*/ ctx[0].jobTitle);
    			append(div8, t5);
    			append(div8, div1);
    			append(div1, input1);
    			set_input_value(input1, /*$previewJobStore*/ ctx[0].sats);
    			append(div8, t6);
    			append(div8, div2);
    			append(div2, input2);
    			set_input_value(input2, /*$previewJobStore*/ ctx[0].jBannerUrl);
    			append(div8, t7);
    			append(div8, div3);
    			append(div3, textarea0);
    			set_input_value(textarea0, /*$previewJobStore*/ ctx[0].jobAbstract);
    			append(div8, t8);
    			append(div8, div4);
    			append(div4, textarea1);
    			set_input_value(textarea1, /*$previewJobStore*/ ctx[0].jobDescription);
    			append(div8, t9);
    			append(div8, div5);
    			append(div5, textarea2);
    			set_input_value(textarea2, /*$previewJobStore*/ ctx[0].jobRequirements);
    			append(div8, t10);
    			append(div8, div6);
    			mount_component(multiselectdropdown0, div6, null);
    			append(div8, t11);
    			append(div8, div7);
    			mount_component(multiselectdropdown1, div7, null);
    			append(div12, t12);
    			append(div12, div11);
    			append(div11, button);
    			append(main, t14);
    			mount_component(footer, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[6]),
    					listen(textarea0, "input", /*textarea0_input_handler*/ ctx[7]),
    					listen(textarea0, "input", autoResizeTextarea),
    					listen(textarea1, "input", /*textarea1_input_handler*/ ctx[8]),
    					listen(textarea1, "input", autoResizeTextarea),
    					listen(textarea2, "input", /*textarea2_input_handler*/ ctx[9]),
    					listen(textarea2, "input", autoResizeTextarea),
    					listen(button, "click", /*postJob*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*$previewJobStore*/ 1 && input0.value !== /*$previewJobStore*/ ctx[0].jobTitle) {
    				set_input_value(input0, /*$previewJobStore*/ ctx[0].jobTitle);
    			}

    			if (dirty & /*$previewJobStore*/ 1 && input1.value !== /*$previewJobStore*/ ctx[0].sats) {
    				set_input_value(input1, /*$previewJobStore*/ ctx[0].sats);
    			}

    			if (dirty & /*$previewJobStore*/ 1 && input2.value !== /*$previewJobStore*/ ctx[0].jBannerUrl) {
    				set_input_value(input2, /*$previewJobStore*/ ctx[0].jBannerUrl);
    			}

    			if (dirty & /*$previewJobStore*/ 1) {
    				set_input_value(textarea0, /*$previewJobStore*/ ctx[0].jobAbstract);
    			}

    			if (dirty & /*$previewJobStore*/ 1) {
    				set_input_value(textarea1, /*$previewJobStore*/ ctx[0].jobDescription);
    			}

    			if (dirty & /*$previewJobStore*/ 1) {
    				set_input_value(textarea2, /*$previewJobStore*/ ctx[0].jobRequirements);
    			}

    			const multiselectdropdown0_changes = {};

    			if (!updating_selected && dirty & /*$previewJobStore*/ 1) {
    				updating_selected = true;
    				multiselectdropdown0_changes.selected = /*$previewJobStore*/ ctx[0].jobCategories;
    				add_flush_callback(() => updating_selected = false);
    			}

    			multiselectdropdown0.$set(multiselectdropdown0_changes);
    			const multiselectdropdown1_changes = {};

    			if (!updating_selected_1 && dirty & /*$previewJobStore*/ 1) {
    				updating_selected_1 = true;
    				multiselectdropdown1_changes.selected = /*$previewJobStore*/ ctx[0].selectedCodingLanguages;
    				add_flush_callback(() => updating_selected_1 = false);
    			}

    			multiselectdropdown1.$set(multiselectdropdown1_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 2 && div13_class_value !== (div13_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[1]) + " svelte-1utxjqs"))) {
    				attr(div13, "class", div13_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(multiselectdropdown0.$$.fragment, local);
    			transition_in(multiselectdropdown1.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(multiselectdropdown0.$$.fragment, local);
    			transition_out(multiselectdropdown1.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(multiselectdropdown0);
    			destroy_component(multiselectdropdown1);
    			destroy_component(footer);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    let bannerImage$3 = "../../img/Banner1u.png";
    let title$3 = "BitSpark";
    let subtitle$3 = "Post a Job";

    function autoResizeTextarea(e) {
    	e.target.style.height = "";
    	e.target.style.height = e.target.scrollHeight + "px";
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $previewJobStore;
    	let $nostrManager;
    	let $contentContainerClass;
    	component_subscribe($$self, previewJobStore, $$value => $$invalidate(0, $previewJobStore = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(12, $nostrManager = $$value));
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(1, $contentContainerClass = $$value));
    	let { ideaID } = $$props;
    	set_store_value(previewJobStore, $previewJobStore.ideaId = ideaID, $previewJobStore);
    	set_store_value(previewJobStore, $previewJobStore.selectedCodingLanguages = [], $previewJobStore);

    	async function postJob() {
    		if ($previewJobStore.ideaId && $previewJobStore.sats && $previewJobStore.jobTitle && $previewJobStore.jBannerUrl && $previewJobStore.jobDescription && $previewJobStore.jobRequirements && $previewJobStore.jobAbstract && $previewJobStore.jobCategories.length && $previewJobStore.selectedCodingLanguages.length) {
    			let tags = [
    				["t", "job"],
    				["s", "bitspark"],
    				["jTitle", $previewJobStore.jobTitle],
    				["jAbstract", $previewJobStore.jobAbstract],
    				["jReq", $previewJobStore.jobRequirements],
    				["sats", $previewJobStore.sats],
    				["jbUrl", $previewJobStore.jBannerUrl],
    				["e", $previewJobStore.ideaId],
    				...$previewJobStore.jobCategories.map(category => ["c", category]),
    				...$previewJobStore.selectedCodingLanguages.map(lang => ["l", lang])
    			];

    			// Senden des Job-Events über nostrManager
    			if ($nostrManager && $nostrManager.write_mode) {
    				await $nostrManager.sendEvent(NOSTR_KIND_JOB, $previewJobStore.jobDescription, tags); // Der Kind-Wert für Jobs
    			}

    			// Zurücksetzen des Zustands
    			for (let key in $previewJobStore) {
    				if (Array.isArray($previewJobStore[key])) {
    					set_store_value(previewJobStore, $previewJobStore[key] = [], $previewJobStore);
    				} else {
    					set_store_value(previewJobStore, $previewJobStore[key] = "", $previewJobStore);
    				}
    			}

    			navigate(`/idea/${ideaID}`);
    		} else {
    			console.log("Bitte füllen Sie alle Felder aus.");
    		}
    	}

    	function input0_input_handler() {
    		$previewJobStore.jobTitle = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function input1_input_handler() {
    		$previewJobStore.sats = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function input2_input_handler() {
    		$previewJobStore.jBannerUrl = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function textarea0_input_handler() {
    		$previewJobStore.jobAbstract = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function textarea1_input_handler() {
    		$previewJobStore.jobDescription = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function textarea2_input_handler() {
    		$previewJobStore.jobRequirements = this.value;
    		previewJobStore.set($previewJobStore);
    	}

    	function multiselectdropdown0_selected_binding(value) {
    		if ($$self.$$.not_equal($previewJobStore.jobCategories, value)) {
    			$previewJobStore.jobCategories = value;
    			previewJobStore.set($previewJobStore);
    		}
    	}

    	function multiselectdropdown1_selected_binding(value) {
    		if ($$self.$$.not_equal($previewJobStore.selectedCodingLanguages, value)) {
    			$previewJobStore.selectedCodingLanguages = value;
    			previewJobStore.set($previewJobStore);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('ideaID' in $$props) $$invalidate(3, ideaID = $$props.ideaID);
    	};

    	return [
    		$previewJobStore,
    		$contentContainerClass,
    		postJob,
    		ideaID,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		textarea2_input_handler,
    		multiselectdropdown0_selected_binding,
    		multiselectdropdown1_selected_binding
    	];
    }

    class PostJob extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$i, create_fragment$j, safe_not_equal, { ideaID: 3 });
    	}
    }

    /* src/components/Cards/JobCard.svelte generated by Svelte v3.59.1 */

    function create_fragment$i(ctx) {
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let div0;
    	let h3;
    	let t1_value = /*card*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let h4;
    	let t3_value = /*card*/ ctx[0].sats + "";
    	let t3;
    	let t4;
    	let t5;
    	let p;
    	let t6_value = truncateMessage(/*card*/ ctx[0].abstract, 500) + "";
    	let t6;
    	let t7;
    	let div2;
    	let likeicon;
    	let t8;
    	let shareicon;
    	let current;
    	let mounted;
    	let dispose;
    	likeicon = new LikeIcon({ props: { event_id: /*card*/ ctx[0].id } });
    	shareicon = new ShareIcon({ props: { event_id: /*card*/ ctx[0].id } });

    	return {
    		c() {
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			h4 = element("h4");
    			t3 = text(t3_value);
    			t4 = text(" Sats");
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div2 = element("div");
    			create_component(likeicon.$$.fragment);
    			t8 = space();
    			create_component(shareicon.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) attr(img, "src", img_src_value);
    			attr(img, "alt", img_alt_value = "Banner of " + /*card*/ ctx[0].title);
    			attr(img, "class", "bitspark-card-banner-image");
    			attr(div0, "class", "content");
    			attr(div1, "class", "bitspark-card-content");
    			attr(div2, "class", "bitspark-card-actions");
    			attr(div3, "class", "bitspark-card");
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div1);
    			append(div1, img);
    			append(div1, t0);
    			append(div1, div0);
    			append(div0, h3);
    			append(h3, t1);
    			append(div0, t2);
    			append(div0, h4);
    			append(h4, t3);
    			append(h4, t4);
    			append(div0, t5);
    			append(div0, p);
    			append(p, t6);
    			append(div3, t7);
    			append(div3, div2);
    			mount_component(likeicon, div2, null);
    			append(div2, t8);
    			mount_component(shareicon, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div1, "click", /*goToJob*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*card*/ 1 && !src_url_equal(img.src, img_src_value = /*card*/ ctx[0].bannerImage)) {
    				attr(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*card*/ 1 && img_alt_value !== (img_alt_value = "Banner of " + /*card*/ ctx[0].title)) {
    				attr(img, "alt", img_alt_value);
    			}

    			if ((!current || dirty & /*card*/ 1) && t1_value !== (t1_value = /*card*/ ctx[0].title + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*card*/ 1) && t3_value !== (t3_value = /*card*/ ctx[0].sats + "")) set_data(t3, t3_value);
    			if ((!current || dirty & /*card*/ 1) && t6_value !== (t6_value = truncateMessage(/*card*/ ctx[0].abstract, 500) + "")) set_data(t6, t6_value);
    			const likeicon_changes = {};
    			if (dirty & /*card*/ 1) likeicon_changes.event_id = /*card*/ ctx[0].id;
    			likeicon.$set(likeicon_changes);
    			const shareicon_changes = {};
    			if (dirty & /*card*/ 1) shareicon_changes.event_id = /*card*/ ctx[0].id;
    			shareicon.$set(shareicon_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(likeicon.$$.fragment, local);
    			transition_in(shareicon.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(likeicon.$$.fragment, local);
    			transition_out(shareicon.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			destroy_component(likeicon);
    			destroy_component(shareicon);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function truncateMessage(message, maxLength) {
    	const strippedMessage = message.replace(/<[^>]+>/g, "");

    	return strippedMessage.length <= maxLength
    	? message
    	: message.slice(0, maxLength) + "...";
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(2, $nostrManager = $$value));
    	let { card } = $$props;

    	function goToJob() {
    		navigate(`/job/${card.id}`);
    	}

    	onMount(() => {
    		initialize();
    	});

    	function initialize() {
    		if (card) {
    			socialMediaManager.getProfile(card.profile);
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 4) {
    			(initialize());
    		}
    	};

    	return [card, goToJob, $nostrManager];
    }

    class JobCard extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$h, create_fragment$i, safe_not_equal, { card: 0 });
    	}
    }

    // helperStore.js

    const selectedCategories = writable([]);
    const selectedLangs = writable([]);

    var css_248z$g = ".modal-buttons-container.svelte-1hoyqek.svelte-1hoyqek{display:flex;justify-content:flex-end;padding:10px}.modal-button.svelte-1hoyqek.svelte-1hoyqek{background-color:#f7931a;color:white;border:none;border-radius:5px;padding:10px;margin-left:10px;cursor:pointer;font-size:0.9rem;display:flex;align-items:center;transition:background-color 0.2s ease}.modal-button.svelte-1hoyqek i.svelte-1hoyqek{margin-right:5px}.modal-button.svelte-1hoyqek.svelte-1hoyqek:hover{background-color:#e6830b}";
    styleInject(css_248z$g);

    /* src/components/JobMarket/JobMarketWidget.svelte generated by Svelte v3.59.1 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (194:4) <Modal show={$jobModal}>
    function create_default_slot_1$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-filter svelte-1hoyqek"></i> Filter by Category`;
    			attr(button, "class", "modal-button svelte-1hoyqek");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*openCategoryModal*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (199:4) <Modal show={$languageModal}>
    function create_default_slot$6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-code svelte-1hoyqek"></i> Filter by Language`;
    			attr(button, "class", "modal-button svelte-1hoyqek");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);

    			if (!mounted) {
    				dispose = listen(button, "click", /*openLangModal*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (207:8) {#each jobs as job (job.id)}
    function create_each_block$4(key_1, ctx) {
    	let div;
    	let jobcard;
    	let t;
    	let current;
    	jobcard = new JobCard({ props: { card: /*job*/ ctx[20] } });

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			create_component(jobcard.$$.fragment);
    			t = space();
    			attr(div, "class", "col-12 col-sm-6 col-md-6 col-lg-6 mb-8");
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(jobcard, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const jobcard_changes = {};
    			if (dirty & /*jobs*/ 1) jobcard_changes.card = /*job*/ ctx[20];
    			jobcard.$set(jobcard_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(jobcard.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(jobcard.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(jobcard);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let div0;
    	let modal0;
    	let t0;
    	let modal1;
    	let t1;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;

    	modal0 = new Modal({
    			props: {
    				show: /*$jobModal*/ ctx[1],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	modal1 = new Modal({
    			props: {
    				show: /*$languageModal*/ ctx[2],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			}
    		});

    	let each_value = /*jobs*/ ctx[0];
    	const get_key = ctx => /*job*/ ctx[20].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	return {
    		c() {
    			div0 = element("div");
    			create_component(modal0.$$.fragment);
    			t0 = space();
    			create_component(modal1.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div0, "class", "modal-buttons-container svelte-1hoyqek");
    			attr(div1, "class", "row");
    			attr(div2, "class", "container mx-auto px-4");
    		},
    		m(target, anchor) {
    			insert(target, div0, anchor);
    			mount_component(modal0, div0, null);
    			append(div0, t0);
    			mount_component(modal1, div0, null);
    			insert(target, t1, anchor);
    			insert(target, div2, anchor);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const modal0_changes = {};
    			if (dirty & /*$jobModal*/ 2) modal0_changes.show = /*$jobModal*/ ctx[1];

    			if (dirty & /*$$scope*/ 8388608) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};
    			if (dirty & /*$languageModal*/ 4) modal1_changes.show = /*$languageModal*/ ctx[2];

    			if (dirty & /*$$scope*/ 8388608) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			modal1.$set(modal1_changes);

    			if (dirty & /*jobs*/ 1) {
    				each_value = /*jobs*/ ctx[0];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div0);
    			destroy_component(modal0);
    			destroy_component(modal1);
    			if (detaching) detach(t1);
    			if (detaching) detach(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    }

    function transformJobToCard(job) {
    	const tags = job.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});

    	return {
    		id: job.id,
    		title: tags.jTitle,
    		bannerImage: tags.jbUrl,
    		message: job.content,
    		abstract: tags.jAbstract,
    		sats: tags.sats,
    		pubkey: job.pubkey,
    		ideaPubkey: tags.e
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	let $selectedLangs;
    	let $selectedCategories;
    	let $jobModal;
    	let $languageModal;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(7, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(8, $nostrManager = $$value));
    	component_subscribe($$self, selectedLangs, $$value => $$invalidate(9, $selectedLangs = $$value));
    	component_subscribe($$self, selectedCategories, $$value => $$invalidate(10, $selectedCategories = $$value));

    	let jobs = [];

    	// let selectedCategories = [];
    	// let selectedLangs = [];
    	function initialize() {
    		subscribeToJobs();
    	}

    	function subscribeToJobs() {
    		if ($nostrManager) {
    			const eventCriteria = { kinds: [NOSTR_KIND_JOB], "#t": ["job"] };

    			if ($selectedCategories.length) {
    				eventCriteria["#c"] = $selectedCategories;
    			}

    			if ($selectedLangs.length) {
    				eventCriteria["#l"] = $selectedLangs;
    			}

    			$nostrManager.subscribeToEvents(eventCriteria);

    			jobs.forEach(job => {
    				socialMediaManager.subscribeProfile(job.pubkey);
    			});

    			updateJobs();
    		}
    	}

    	function subscribeToIdea(ideaPublickey) {
    		if ($nostrManager) {
    			const eventCriteria = { ids: [ideaPublickey] };
    			$nostrManager.subscribeToEvents(eventCriteria);
    		}
    	}

    	function subscribeToAuthors() {
    		if ($nostrManager) {
    			jobs.forEach(job => {
    				socialMediaManager.subscribeProfile(job.pubkey);
    			});
    		}
    	}

    	async function updateJobs() {
    		// Erstelle ein Kriterien-Objekt für die Abfrage
    		const criteria = { kinds: [NOSTR_KIND_JOB], tags: {} };

    		criteria.tags["t"] = ["job"];

    		// Füge Kategorien hinzu, falls ausgewählt
    		if ($selectedCategories.length) {
    			criteria.tags["c"] = $selectedCategories;
    		}

    		// Füge Programmiersprachen hinzu, falls ausgewählt
    		if ($selectedLangs.length) {
    			criteria.tags["l"] = $selectedLangs;
    		}

    		// Führe die Abfrage aus und lade die Jobs
    		const fetchedJobs = await $nostrCache.getEventsByCriteria(criteria);

    		const tempJobs = [];

    		await Promise.all(fetchedJobs.map(async job => {
    			let card = transformJobToCard(job);
    			card.profile = socialMediaManager.getProfile(job.pubkey);
    			let idea = await $nostrCache.getEventById(card.ideaPubkey);

    			if (!idea) {
    				subscribeToIdea(card.ideaPubkey);
    			} else {
    				const tags = idea.tags.reduce((tagObj, [key, value]) => ({ ...tagObj, [key]: value }), {});
    				card.bannerImage = tags.ibUrl;
    			}

    			tempJobs.push(card);
    		}));

    		return tempJobs;
    	}

    	let jobModal = writable(null);
    	component_subscribe($$self, jobModal, value => $$invalidate(1, $jobModal = value));
    	let languageModal = writable(null);
    	component_subscribe($$self, languageModal, value => $$invalidate(2, $languageModal = value));

    	function openCategoryModal() {
    		jobModal.set(bind(SelectionModal, {
    			categories: job_categories,
    			initialSelectedCategories: $selectedCategories,
    			onConfirm: handleCategoryConfirm
    		}));
    	}

    	function handleCategoryConfirm(categories) {
    		selectedCategories.set(categories);
    		subscribeToJobs();
    	}

    	function openLangModal() {
    		languageModal.set(bind(SelectionModal, {
    			categories: coding_language,
    			initialSelectedCategories: $selectedLangs,
    			onConfirm: handleLangConfirm
    		}));
    	}

    	function handleLangConfirm(categories) {
    		selectedLangs.set(categories);
    		subscribeToJobs();
    	}

    	onMount(initialize);

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll();
    		jobModal.set(false);
    		languageModal.set(false);
    	});

    	async function updateFeed() {
    		$$invalidate(0, jobs = await updateJobs());
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 128) {
    			if ($nostrCache) {
    				subscribeToAuthors();
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 256) {
    			(initialize(), $nostrManager);
    		}

    		if ($$self.$$.dirty & /*$nostrManager, $nostrCache*/ 384) {
    			if ($nostrManager && $nostrCache) {
    				updateFeed();
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrManager, $nostrCache*/ 384) {
    			if ($nostrManager && $nostrCache) {
    				updateFeed();
    			}
    		}
    	};

    	return [
    		jobs,
    		$jobModal,
    		$languageModal,
    		jobModal,
    		languageModal,
    		openCategoryModal,
    		openLangModal,
    		$nostrCache,
    		$nostrManager
    	];
    }

    class JobMarketWidget extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$g, create_fragment$h, safe_not_equal, {});
    	}
    }

    /* src/views/JobMarket.svelte generated by Svelte v3.59.1 */

    function create_fragment$g(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let jobmarket;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: bannerImage$2,
    				title: title$2,
    				subtitle: subtitle$2,
    				show_right_text: false
    			}
    		});

    	toolbar = new Toolbar({});
    	jobmarket = new JobMarketWidget({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(jobmarket.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			attr(div1, "class", "flex-grow");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(banner, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(jobmarket, div0, null);
    			append(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*$contentContainerClass*/ 1) {
    				attr(div0, "class", /*$contentContainerClass*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(jobmarket.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(jobmarket.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(jobmarket);
    			destroy_component(footer);
    		}
    	};
    }

    let bannerImage$2 = "../../img/Banner1u.png";
    let title$2 = "BitSpark";
    let subtitle$2 = "job market";

    function instance$f($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(0, $contentContainerClass = $$value));
    	return [$contentContainerClass];
    }

    class JobMarket_1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$f, create_fragment$g, safe_not_equal, {});
    	}
    }

    var css_248z$f = ".job-list.svelte-jhtsfp{max-height:100%;overflow-y:auto}.job-item.svelte-jhtsfp{padding:10px 15px;cursor:pointer;border-bottom:1px solid #eee;transition:background-color 0.3s,\n            color 0.3s;display:flex;align-items:center;gap:10px}.job-item.svelte-jhtsfp:hover{background-color:#f5f5f5;color:#333}";
    styleInject(css_248z$f);

    /* src/components/JobManager2/JobList.svelte generated by Svelte v3.59.1 */

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (46:4) {#each jobs as job}
    function create_each_block$3(ctx) {
    	let div;
    	let t0_value = (/*job*/ ctx[8].tags.find(func$1)?.[1] || "Unbekannter Job") + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*job*/ ctx[8]);
    	}

    	return {
    		c() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr(div, "class", "job-item svelte-jhtsfp");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t0);
    			append(div, t1);

    			if (!mounted) {
    				dispose = listen(div, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*jobs*/ 1 && t0_value !== (t0_value = (/*job*/ ctx[8].tags.find(func$1)?.[1] || "Unbekannter Job") + "")) set_data(t0, t0_value);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let div;
    	let each_value = /*jobs*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "job-list svelte-jhtsfp");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*selectJob, jobs*/ 3) {
    				each_value = /*jobs*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    const func$1 = tag => tag[0] === "jTitle";

    function instance$e($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(2, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(3, $nostrManager = $$value));
    	const dispatch = createEventDispatcher();
    	let jobs = [];

    	// Abonnieren von eigenen Job-Postings und Offers
    	async function subscribeToJobsAndOffers() {
    		if ($nostrManager && $nostrManager.publicKey) {
    			nostrJobManager.subscribeUserRelatedJobs($nostrManager.publicKey);
    		}
    	}

    	// Abrufen von Jobs und Offers aus dem Cache
    	async function fetchJobsAndOffers() {
    		if ($nostrCache && $nostrManager && $nostrManager.publicKey) {
    			$$invalidate(0, jobs = await nostrJobManager.fetchUserRelatedJobs($nostrManager.publicKey));
    		}
    	}

    	onMount(() => {
    		if ($nostrManager) {
    			subscribeToJobsAndOffers();
    		}
    	});

    	onDestroy(() => {
    		$nostrManager.unsubscribeAll();
    	});

    	function selectJob(job) {
    		dispatch("selectJob", { job });
    	}

    	const click_handler = job => selectJob(job);

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 8) {
    			// Reaktive Anweisungen
    			(subscribeToJobsAndOffers());
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 4) {
    			(fetchJobsAndOffers());
    		}
    	};

    	return [jobs, selectJob, $nostrCache, $nostrManager, click_handler];
    }

    class JobList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$e, create_fragment$f, safe_not_equal, {});
    	}
    }

    var css_248z$e = ".job-content.svelte-1b8lozp.svelte-1b8lozp{max-width:100%;display:flex;flex-direction:column}.job-content.svelte-1b8lozp h3.svelte-1b8lozp{margin-bottom:5px;color:#ffffff}.job-content.svelte-1b8lozp p.svelte-1b8lozp{margin-top:5px;color:#ffffff}.action-buttons.svelte-1b8lozp.svelte-1b8lozp{margin-top:10px;display:flex;gap:10px}button.svelte-1b8lozp.svelte-1b8lozp{cursor:pointer;padding:8px 16px;border:none;border-radius:20px;color:#ffffff;font-weight:bold;transition:background-color 0.3s, box-shadow 0.3s;outline:none;flex-grow:1}button.svelte-1b8lozp.svelte-1b8lozp:hover{box-shadow:0 4px 8px rgba(0, 0, 0, 0.2)}button.svelte-1b8lozp.svelte-1b8lozp:active{box-shadow:0 2px 4px rgba(0, 0, 0, 0.2)}.approve-button.svelte-1b8lozp.svelte-1b8lozp{background-color:#f7931a}.approve-button.svelte-1b8lozp.svelte-1b8lozp:hover,.approve-button.svelte-1b8lozp.svelte-1b8lozp:focus{background-color:#be7113}.decline-button.svelte-1b8lozp.svelte-1b8lozp{background-color:#6c8cd5}.decline-button.svelte-1b8lozp.svelte-1b8lozp:hover,.decline-button.svelte-1b8lozp.svelte-1b8lozp:focus{background-color:#394a72}";
    styleInject(css_248z$e);

    /* src/components/JobManager2/JobBubble.svelte generated by Svelte v3.59.1 */

    function create_if_block$9(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Approve";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Decline";
    			attr(button0, "class", "approve-button svelte-1b8lozp");
    			attr(button1, "class", "decline-button svelte-1b8lozp");
    			attr(div, "class", "action-buttons svelte-1b8lozp");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(div, t1);
    			append(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[9]),
    					listen(button1, "click", /*click_handler_1*/ ctx[10])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (81:0) <BaseBubble {event} showRatingButton={false} {backgroundColor} textColor="#ffffff">
    function create_default_slot$5(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let p;
    	let t2;
    	let if_block = /*jobApprovalStatus*/ ctx[3] === "pending" && /*isIdeaCreator*/ ctx[5] && create_if_block$9(ctx);

    	return {
    		c() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*jobTitle*/ ctx[1]);
    			t1 = space();
    			p = element("p");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr(h3, "class", "svelte-1b8lozp");
    			attr(p, "class", "svelte-1b8lozp");
    			attr(div, "class", "job-content svelte-1b8lozp");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(div, t1);
    			append(div, p);
    			p.innerHTML = /*jobDescription*/ ctx[2];
    			append(div, t2);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*jobTitle*/ 2) set_data(t0, /*jobTitle*/ ctx[1]);
    			if (dirty & /*jobDescription*/ 4) p.innerHTML = /*jobDescription*/ ctx[2];
    			if (/*jobApprovalStatus*/ ctx[3] === "pending" && /*isIdeaCreator*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				showRatingButton: false,
    				backgroundColor: /*backgroundColor*/ ctx[4],
    				textColor: "#ffffff",
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];
    			if (dirty & /*backgroundColor*/ 16) basebubble_changes.backgroundColor = /*backgroundColor*/ ctx[4];

    			if (dirty & /*$$scope, jobApprovalStatus, isIdeaCreator, jobDescription, jobTitle*/ 65582) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(7, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(8, $nostrCache = $$value));
    	let { event } = $$props;
    	let jobTitle = "Unbekannter Job";
    	let jobDescription = "Keine Beschreibung verfügbar.";
    	let jobApprovalStatus = "pending"; // Initialzustand auf 'pending' setzen
    	let backgroundColor = "#F5A623"; // Standardfarbe
    	let ideaId = "";
    	let isIdeaCreator = false; // Zustand, der angibt, ob der aktuelle Benutzer der Ideenersteller ist

    	onMount(async () => {
    		subscribeToIdea();
    		await checkJobApprovalStatus();
    		checkIdeaCreator();
    	});

    	function subscribeToIdea() {
    		nostrJobManager.subscribeIdea(ideaId);
    	}

    	async function checkIdeaCreator() {
    		const ideaIdTag = event.tags.find(tag => tag[0] === "e");
    		ideaId = ideaIdTag ? ideaIdTag[1] : null;

    		if (!ideaId) {
    			$$invalidate(5, isIdeaCreator = false);
    			return;
    		}

    		$$invalidate(5, isIdeaCreator = await nostrJobManager.isCreator(ideaId, $nostrManager.publicKey));
    	}

    	async function checkJobApprovalStatus() {
    		$$invalidate(3, jobApprovalStatus = await nostrJobManager.getJobApprovalStatus(event.id));
    		updateColors();
    	}

    	function updateColors() {
    		$$invalidate(4, backgroundColor = jobApprovalStatus === "job_approved"
    		? "#f7931a"
    		: jobApprovalStatus === "job_declined"
    			? "#6c8cd5"
    			: "#9e9e9e"); // Bitcoin-Orange für "approved"
    		// Gedämpftes Blau für "declined"
    		// Sanftes Grau für "pending"
    	}

    	async function handleApprovalChange(approval) {
    		if (!isIdeaCreator) {
    			console.error("Nur der Ideenersteller kann diesen Job genehmigen oder ablehnen.");
    			return;
    		}

    		nostrJobManager.setJobApprovalStatus(event.id, approval);
    	}

    	const click_handler = () => handleApprovalChange(true);
    	const click_handler_1 = () => handleApprovalChange(false);

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			$nostrCache && checkJobApprovalStatus();
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 256) {
    			$nostrCache && checkIdeaCreator();
    		}

    		if ($$self.$$.dirty & /*$nostrManager*/ 128) {
    			$nostrManager && subscribeToIdea();
    		}

    		if ($$self.$$.dirty & /*event*/ 1) {
    			if (event && event.tags) {
    				const titleTag = event.tags.find(tag => tag[0] === "jTitle");
    				$$invalidate(1, jobTitle = titleTag ? titleTag[1] : "Unbekannter Job");
    				$$invalidate(2, jobDescription = event.content || "Keine Beschreibung verfügbar.");
    			}
    		}
    	};

    	return [
    		event,
    		jobTitle,
    		jobDescription,
    		jobApprovalStatus,
    		backgroundColor,
    		isIdeaCreator,
    		handleApprovalChange,
    		$nostrManager,
    		$nostrCache,
    		click_handler,
    		click_handler_1
    	];
    }

    class JobBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$d, create_fragment$e, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$d = ".offer-time.svelte-xdlxa4.svelte-xdlxa4{margin-top:0;line-height:1.4}.offer-content.svelte-xdlxa4.svelte-xdlxa4{display:flex;flex-direction:column;align-items:flex-start;padding:10px}.sats-amount.svelte-xdlxa4.svelte-xdlxa4{font-weight:bold;margin-bottom:5px}.offer-msg.svelte-xdlxa4.svelte-xdlxa4{margin-top:0;line-height:1.4}.offer-actions.svelte-xdlxa4 button.svelte-xdlxa4{padding:5px 10px;border:none;color:white;border-radius:4px;margin-right:10px;cursor:pointer;font-weight:bold}";
    styleInject(css_248z$d);

    /* src/components/JobManager2/OfferBubble.svelte generated by Svelte v3.59.1 */

    function create_if_block$8(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let t1;
    	let button1;
    	let t2;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("Accept");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("Decline");
    			set_style(button0, "background-color", /*acceptButtonColor*/ ctx[8]);
    			attr(button0, "class", "svelte-xdlxa4");
    			set_style(button1, "background-color", /*declineButtonColor*/ ctx[9]);
    			attr(button1, "class", "svelte-xdlxa4");
    			attr(div, "class", "offer-actions svelte-xdlxa4");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(button0, t0);
    			append(div, t1);
    			append(div, button1);
    			append(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*handleAccept*/ ctx[13]),
    					listen(button1, "click", /*handleDecline*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*acceptButtonColor*/ 256) {
    				set_style(button0, "background-color", /*acceptButtonColor*/ ctx[8]);
    			}

    			if (dirty & /*declineButtonColor*/ 512) {
    				set_style(button1, "background-color", /*declineButtonColor*/ ctx[9]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (94:0) <BaseBubble {event} {backgroundColor} {textColor} {borderColor} {status}>
    function create_default_slot$4(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let t2;
    	let p0;
    	let raw_value = formatReqTime(/*reqTime*/ ctx[4]) + "";
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let if_block = /*isJobApproved*/ ctx[11] && /*isJobCreator*/ ctx[10] && /*offerStatus*/ ctx[1] === "pending" && create_if_block$8(ctx);

    	return {
    		c() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*sats*/ ctx[2]);
    			t1 = text(" Sats");
    			t2 = space();
    			p0 = element("p");
    			t3 = space();
    			p1 = element("p");
    			t4 = text(/*offerMsg*/ ctx[3]);
    			t5 = space();
    			if (if_block) if_block.c();
    			attr(h3, "class", "sats-amount svelte-xdlxa4");
    			set_style(h3, "color", /*satsColor*/ ctx[7]);
    			attr(p0, "class", "offer-time svelte-xdlxa4");
    			attr(p1, "class", "offer-msg svelte-xdlxa4");
    			attr(div, "class", "offer-content svelte-xdlxa4");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    			append(h3, t0);
    			append(h3, t1);
    			append(div, t2);
    			append(div, p0);
    			p0.innerHTML = raw_value;
    			append(div, t3);
    			append(div, p1);
    			append(p1, t4);
    			append(div, t5);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*sats*/ 4) set_data(t0, /*sats*/ ctx[2]);

    			if (dirty & /*satsColor*/ 128) {
    				set_style(h3, "color", /*satsColor*/ ctx[7]);
    			}

    			if (dirty & /*reqTime*/ 16 && raw_value !== (raw_value = formatReqTime(/*reqTime*/ ctx[4]) + "")) p0.innerHTML = raw_value;			if (dirty & /*offerMsg*/ 8) set_data(t4, /*offerMsg*/ ctx[3]);

    			if (/*isJobApproved*/ ctx[11] && /*isJobCreator*/ ctx[10] && /*offerStatus*/ ctx[1] === "pending") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				backgroundColor: /*backgroundColor*/ ctx[5],
    				textColor: /*textColor*/ ctx[6],
    				borderColor: /*borderColor*/ ctx[12],
    				status,
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];
    			if (dirty & /*backgroundColor*/ 32) basebubble_changes.backgroundColor = /*backgroundColor*/ ctx[5];
    			if (dirty & /*textColor*/ 64) basebubble_changes.textColor = /*textColor*/ ctx[6];
    			if (dirty & /*borderColor*/ 4096) basebubble_changes.borderColor = /*borderColor*/ ctx[12];

    			if (dirty & /*$$scope, declineButtonColor, acceptButtonColor, isJobApproved, isJobCreator, offerStatus, offerMsg, reqTime, satsColor, sats*/ 2101150) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    function formatReqTime(time) {
    	if (!time || time === "No required time") {
    		return `<span class="time-default">Keine Zeitangabe</span>`;
    	}

    	return `<span class="time-value"><i class="fas fa-clock"></i> ${time}</span>`;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let borderColor;
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(15, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(17, $nostrManager = $$value));
    	let { event } = $$props;
    	let sats = 0;
    	let offerMsg = "No Message";
    	let reqTime = "No required time";
    	let backgroundColor = "#E8F4FA"; // Ein sanftes Blau
    	let textColor = "#333333"; // Dunkelgrau für guten Kontrast
    	let satsColor = "#4A90E2"; // Hervorstechendes Blau für Sats
    	let acceptButtonColor = "#4CAF50"; // Grün für Akzeptieren
    	let declineButtonColor = "#F44336"; // Rot für Ablehnen
    	let isJobCreator = false;
    	let isJobApproved = false;
    	let offerStatus = "pending"; // "accepted", "declined", "pending"

    	async function checkOfferStatus() {
    		$$invalidate(1, offerStatus = await nostrJobManager.checkOfferStatus(event.id));
    	}

    	async function handleAccept() {
    		await nostrJobManager.setOfferApprovalStatus(event.id, true);
    	}

    	async function handleDecline() {
    		await nostrJobManager.setOfferApprovalStatus(event.id, false);
    	}

    	onMount(async () => {
    		await checkIfJobCreator();
    		await checkIfJobApproved();
    		await checkOfferStatus();
    	});

    	async function checkIfJobApproved() {
    		const jobId = event.tags.find(tag => tag[0] === "e")?.[1];
    		$$invalidate(11, isJobApproved = await nostrJobManager.getJobApprovalStatus(jobId) === "job_approved");
    	}

    	async function checkIfJobCreator() {
    		const jobId = event.tags.find(tag => tag[0] === "e")?.[1];
    		$$invalidate(10, isJobCreator = await nostrJobManager.isCreator(jobId, $nostrManager.publicKey));
    	}

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*event*/ 1) {
    			// Reaktive Anweisungen für die Event-Daten
    			if (event && event.tags) {
    				const sats_info = event.tags.find(tag => tag[0] === "sats");
    				$$invalidate(2, sats = sats_info ? sats_info[1] : 0);
    			}
    		}

    		if ($$self.$$.dirty & /*event*/ 1) {
    			if (event) {
    				$$invalidate(3, offerMsg = event.content || "Keine Beschreibung verfügbar.");
    				$$invalidate(4, reqTime = event.tags.find(tag => tag[0] === "reqTime")?.[1] || "No required time");
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 32768) {
    			// Reaktive Anweisungen
    			$nostrCache && checkOfferStatus() && checkIfJobApproved();
    		}

    		if ($$self.$$.dirty & /*offerStatus*/ 2) {
    			$$invalidate(5, backgroundColor = offerStatus === "accepted"
    			? "#E8F4FA"
    			: offerStatus === "declined" ? "#FDE8E8" : "#F5F5F5");
    		}

    		if ($$self.$$.dirty & /*offerStatus*/ 2) {
    			$$invalidate(12, borderColor = offerStatus === "accepted"
    			? "#76C79E"
    			: offerStatus === "declined" ? "#F28482" : "#FFAD60");
    		}
    	};

    	$$invalidate(6, textColor = "#333333"); // Dunkelgrau für guten Kontrast
    	$$invalidate(7, satsColor = "#34568B"); // Dunkelblau für Sats
    	$$invalidate(8, acceptButtonColor = "#76C79E"); // Grün für Akzeptieren
    	$$invalidate(9, declineButtonColor = "#F28482"); // Rot für Ablehnen

    	return [
    		event,
    		offerStatus,
    		sats,
    		offerMsg,
    		reqTime,
    		backgroundColor,
    		textColor,
    		satsColor,
    		acceptButtonColor,
    		declineButtonColor,
    		isJobCreator,
    		isJobApproved,
    		borderColor,
    		handleAccept,
    		handleDecline,
    		$nostrCache
    	];
    }

    class OfferBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$c, create_fragment$d, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$c = ".pr-content.svelte-12emmvm.svelte-12emmvm{display:flex;flex-direction:column;align-items:flex-start;padding:10px}.pr-content.svelte-12emmvm input.svelte-12emmvm{width:100%;padding:8px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px}.pr-content.svelte-12emmvm button.svelte-12emmvm{padding:8px 15px;background-color:#76C79E;color:white;border:none;border-radius:4px;cursor:pointer}";
    styleInject(css_248z$c);

    /* src/components/JobManager2/AddPRBubble.svelte generated by Svelte v3.59.1 */

    function create_if_block$7(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				backgroundColor: "#E8F4FA",
    				textColor: "#333333",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];

    			if (dirty & /*$$scope, prUrl*/ 2052) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    // (51:4) <BaseBubble {event} backgroundColor="#E8F4FA" textColor="#333333">
    function create_default_slot$3(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Send PR";
    			attr(input, "type", "text");
    			attr(input, "placeholder", "Enter your PR URL here");
    			attr(input, "class", "svelte-12emmvm");
    			attr(button, "class", "svelte-12emmvm");
    			attr(div, "class", "pr-content svelte-12emmvm");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, input);
    			set_input_value(input, /*prUrl*/ ctx[2]);
    			append(div, t0);
    			append(div, button);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[5]),
    					listen(button, "click", /*sendPR*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*prUrl*/ 4 && input.value !== /*prUrl*/ ctx[2]) {
    				set_input_value(input, /*prUrl*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let show_if = /*isOfferCreator*/ ctx[1] && /*event*/ ctx[0].tags.find(func)[1] === 'ao';
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block$7(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*isOfferCreator, event*/ 3) show_if = /*isOfferCreator*/ ctx[1] && /*event*/ ctx[0].tags.find(func)[1] === 'ao';

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOfferCreator, event*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    const func = tag => tag[0] === 't';

    function instance$b($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(4, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(8, $nostrManager = $$value));
    	let { event } = $$props;
    	let offer;
    	let offerId;
    	let isOfferCreator = false;
    	let prUrl = "";

    	onMount(async () => {
    		await loadOffer();
    		await checkIfOfferCreator();
    	});

    	async function loadOffer() {
    		offerId = event.tags.find(tag => tag[0] === 'o')[1];
    		offer = await nostrJobManager.loadOffer(offerId);
    	}

    	async function checkIfOfferCreator() {
    		if (offer && $nostrManager.publicKey) {
    			$$invalidate(1, isOfferCreator = await nostrJobManager.isCreator(offer.id, $nostrManager.publicKey));
    		}
    	}

    	async function sendPR() {
    		if (!$nostrManager || !prUrl) {
    			return;
    		}

    		try {
    			await nostrJobManager.sendPR(offerId, prUrl);
    			$$invalidate(2, prUrl = ""); // URL-Feld zurücksetzen
    		} catch(error) {
    			console.error("Error sending PR:", error);
    		}
    	}

    	function input_input_handler() {
    		prUrl = this.value;
    		$$invalidate(2, prUrl);
    	}

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache*/ 16) {
    			$nostrCache && loadOffer() && checkIfOfferCreator();
    		}
    	};

    	return [event, isOfferCreator, prUrl, sendPR, $nostrCache, input_input_handler];
    }

    class AddPRBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$c, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$b = ".pr-content.svelte-1k15bk7.svelte-1k15bk7{display:flex;flex-direction:column;align-items:flex-start;padding:10px}.pr-content.svelte-1k15bk7 a.svelte-1k15bk7{color:#4a90e2;text-decoration:none}.pr-actions.svelte-1k15bk7.svelte-1k15bk7{display:flex;margin-top:10px}.accept-button.svelte-1k15bk7.svelte-1k15bk7,.decline-button.svelte-1k15bk7.svelte-1k15bk7{padding:5px 10px;border:none;color:white;border-radius:4px;margin-right:10px;cursor:pointer;font-weight:bold}.accept-button.svelte-1k15bk7.svelte-1k15bk7{background-color:#76c79e}.decline-button.svelte-1k15bk7.svelte-1k15bk7{background-color:#f28482}";
    styleInject(css_248z$b);

    /* src/components/JobManager2/PRBubble.svelte generated by Svelte v3.59.1 */

    function create_if_block$6(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Accept";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Decline";
    			attr(button0, "class", "accept-button svelte-1k15bk7");
    			attr(button1, "class", "decline-button svelte-1k15bk7");
    			attr(div, "class", "pr-actions svelte-1k15bk7");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button0);
    			append(div, t1);
    			append(div, button1);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*click_handler*/ ctx[7]),
    					listen(button1, "click", /*click_handler_1*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (66:0) <BaseBubble     {event}     backgroundColor={prStatus === "accepted"         ? "#E8F4FA"         : prStatus === "declined"           ? "#FDE8E8"           : "#F5F5F5"}     textColor="#333333" >
    function create_default_slot$2(ctx) {
    	let div;
    	let a;
    	let t0;
    	let t1;
    	let if_block = /*isJobCreator*/ ctx[2] && /*prStatus*/ ctx[3] === "pending" && create_if_block$6(ctx);

    	return {
    		c() {
    			div = element("div");
    			a = element("a");
    			t0 = text(/*prUrl*/ ctx[1]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(a, "href", /*prUrl*/ ctx[1]);
    			attr(a, "target", "_blank");
    			attr(a, "class", "svelte-1k15bk7");
    			attr(div, "class", "pr-content svelte-1k15bk7");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, a);
    			append(a, t0);
    			append(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*prUrl*/ 2) set_data(t0, /*prUrl*/ ctx[1]);

    			if (dirty & /*prUrl*/ 2) {
    				attr(a, "href", /*prUrl*/ ctx[1]);
    			}

    			if (/*isJobCreator*/ ctx[2] && /*prStatus*/ ctx[3] === "pending") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				backgroundColor: /*prStatus*/ ctx[3] === "accepted"
    				? "#E8F4FA"
    				: /*prStatus*/ ctx[3] === "declined"
    					? "#FDE8E8"
    					: "#F5F5F5",
    				textColor: "#333333",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];

    			if (dirty & /*prStatus*/ 8) basebubble_changes.backgroundColor = /*prStatus*/ ctx[3] === "accepted"
    			? "#E8F4FA"
    			: /*prStatus*/ ctx[3] === "declined"
    				? "#FDE8E8"
    				: "#F5F5F5";

    			if (dirty & /*$$scope, isJobCreator, prStatus, prUrl*/ 32782) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(6, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(11, $nostrManager = $$value));
    	let { event } = $$props;
    	let prUrl = "";
    	let jobId = null;
    	let isJobCreator = false;
    	let prStatus = "pending"; // "accepted", "declined", "pending"
    	let jobEvent = null;

    	onMount(async () => {
    		event.tags.find(tag => tag[0] === "o")?.[1] || "";
    		$$invalidate(1, prUrl = event.tags.find(tag => tag[0] === "pr_url")?.[1] || "No URL");
    		jobId = event.tags.find(tag => tag[0] === "e")?.[1];

    		if (jobId) {
    			await loadJobEvent();
    			checkIfJobCreator();
    		}

    		await checkPRStatus();
    	});

    	async function loadJobEvent() {
    		$$invalidate(5, jobEvent = await nostrJobManager.loadJobEvent(jobId));
    	}

    	async function checkIfJobCreator() {
    		if (jobEvent && $nostrManager.publicKey) {
    			$$invalidate(2, isJobCreator = await nostrJobManager.isCreator(jobEvent.id, $nostrManager.publicKey));
    		}
    	}

    	async function checkPRStatus() {
    		$$invalidate(3, prStatus = await nostrJobManager.getPRStatus(event.id));
    		console.log("prStatus:", prStatus);
    	}

    	async function handlePRResponse(responseType) {
    		if (!$nostrManager) return;

    		try {
    			await nostrJobManager.handlePRResponse(event.id, responseType);
    			console.log("PR Response sent successfully");
    		} catch(error) {
    			console.error("Error sending PR response:", error);
    		}
    	}

    	const click_handler = () => handlePRResponse(true);
    	const click_handler_1 = () => handlePRResponse(false);

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache, jobEvent*/ 96) {
    			{
    				if ($nostrCache && jobEvent) {
    					checkPRStatus();
    				}
    			}
    		}
    	};

    	return [
    		event,
    		prUrl,
    		isJobCreator,
    		prStatus,
    		handlePRResponse,
    		jobEvent,
    		$nostrCache,
    		click_handler,
    		click_handler_1
    	];
    }

    class PRBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$b, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$a = ".progress-bar.svelte-19gkq4k.svelte-19gkq4k{width:100%;background-color:#000;border-radius:5px;margin-top:10px;overflow:hidden}.progress.svelte-19gkq4k.svelte-19gkq4k{height:10px;background:repeating-linear-gradient(\n            45deg,\n            #ffd700,\n            #ffd700 10px,\n            #ffeb3b 10px,\n            #ffeb3b 20px\n        );border-radius:5px;animation:svelte-19gkq4k-progressAnimation 2s infinite linear}@keyframes svelte-19gkq4k-progressAnimation{0%{background-position:0 0}100%{background-position:40px 0}}.payment-request-content.svelte-19gkq4k.svelte-19gkq4k{display:flex;flex-direction:column;align-items:flex-start;padding:10px;border-radius:8px;background-color:#fddb3a}.sats-amount.svelte-19gkq4k.svelte-19gkq4k{font-size:1.2rem;margin-bottom:10px;color:#000}.send-sats-button.svelte-19gkq4k.svelte-19gkq4k{background-color:#000;color:#fddb3a;border:none;padding:10px 15px;border-radius:8px;cursor:pointer;display:flex;align-items:center;font-weight:bold;transition:background-color 0.3s, color 0.3s}.send-sats-button.svelte-19gkq4k.svelte-19gkq4k:hover{background-color:#fddb3a;color:#000}.send-sats-button.svelte-19gkq4k i.svelte-19gkq4k{margin-right:5px}";
    styleInject(css_248z$a);

    /* src/components/JobManager2/PaymentRequestBubble.svelte generated by Svelte v3.59.1 */

    function create_default_slot$1(ctx) {
    	let div2;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let div1;
    	let div0;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div2 = element("div");
    			p = element("p");
    			t0 = text(/*satsAmount*/ ctx[1]);
    			t1 = text(" Sats requested");
    			t2 = space();
    			button = element("button");
    			button.innerHTML = `<i class="fas fa-bolt svelte-19gkq4k"></i> Send Sats`;
    			t4 = space();
    			div1 = element("div");
    			div0 = element("div");
    			attr(p, "class", "sats-amount svelte-19gkq4k");
    			attr(button, "class", "send-sats-button svelte-19gkq4k");
    			attr(div0, "class", "progress svelte-19gkq4k");
    			set_style(div0, "width", /*progressPercentage*/ ctx[2] + "%");
    			attr(div1, "class", "progress-bar svelte-19gkq4k");
    			attr(div2, "class", "payment-request-content svelte-19gkq4k");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, p);
    			append(p, t0);
    			append(p, t1);
    			append(div2, t2);
    			append(div2, button);
    			append(div2, t4);
    			append(div2, div1);
    			append(div1, div0);

    			if (!mounted) {
    				dispose = listen(button, "click", /*handleSendSats*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*satsAmount*/ 2) set_data(t0, /*satsAmount*/ ctx[1]);

    			if (dirty & /*progressPercentage*/ 4) {
    				set_style(div0, "width", /*progressPercentage*/ ctx[2] + "%");
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	let basebubble;
    	let current;

    	basebubble = new BaseBubble({
    			props: {
    				event: /*event*/ ctx[0],
    				backgroundColor: "#fddb3a",
    				textColor: "#000",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(basebubble.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(basebubble, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const basebubble_changes = {};
    			if (dirty & /*event*/ 1) basebubble_changes.event = /*event*/ ctx[0];

    			if (dirty & /*$$scope, progressPercentage, satsAmount*/ 16390) {
    				basebubble_changes.$$scope = { dirty, ctx };
    			}

    			basebubble.$set(basebubble_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(basebubble.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(basebubble.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(basebubble, detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(9, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	let { event } = $$props;
    	let offerEvent = null;
    	let offerCreatorProfile = null;
    	let satsAmount = 0;
    	let lnAddress = "";
    	let totalReceivedSats = 0;
    	let progressPercentage = 0;

    	async function fetchZaps() {
    		totalReceivedSats = await zapManager.getTotalZaps(offerEvent.id);
    		updateProgress();
    	}

    	function updateProgress() {
    		$$invalidate(2, progressPercentage = totalReceivedSats / satsAmount * 100);

    		if (progressPercentage > 100) {
    			$$invalidate(2, progressPercentage = 100); // Begrenzen Sie den Fortschritt auf 100%
    		}
    	}

    	onMount(async () => {
    		const offerId = event.tags.find(tag => tag[0] === "o")?.[1];

    		if (offerId) {
    			await zapManager.subscribeZaps(offerId);
    			await loadOfferEvent(offerId);
    			fetchZaps();
    		}
    	});

    	async function loadOfferEvent(offerId) {
    		$$invalidate(4, offerEvent = await nostrJobManager.loadOffer(offerId));
    		$$invalidate(1, satsAmount = offerEvent.tags.find(tag => tag[0] === "sats")?.[1] || 0);
    	}

    	async function loadOfferCreatorProfile() {
    		if (offerEvent) {
    			offerCreatorProfile = await socialMediaManager.getProfile(offerEvent.pubkey);
    			lnAddress = offerCreatorProfile.lud16 || "";
    		}
    	}

    	function handleSendSats() {
    		// Hier rufen Sie sendZap statt sendSatsLNurl auf
    		if (lnAddress && satsAmount > 0) {
    			sendZap(lnAddress, satsAmount, "Zahlung für Angebot", $nostrManager.relays, offerEvent.id).then(response => {
    				console.log("Zapped");
    			}).catch(error => {
    				console.error("Fehler beim Senden des Zaps:", error);
    			});
    		} else {
    			console.error("Keine gültige Lightning-Adresse oder Sats-Menge");
    		}
    	}

    	$$self.$$set = $$props => {
    		if ('event' in $$props) $$invalidate(0, event = $$props.event);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache, offerEvent*/ 48) {
    			if ($nostrCache && offerEvent) {
    				fetchZaps();
    			}
    		}

    		if ($$self.$$.dirty & /*$nostrCache, event*/ 33) {
    			if ($nostrCache) {
    				const offerId = event.tags.find(tag => tag[0] === "o")?.[1];

    				if (offerId) {
    					loadOfferEvent(offerId);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*offerEvent*/ 16) {
    			(loadOfferCreatorProfile());
    		}
    	};

    	return [event, satsAmount, progressPercentage, handleSendSats, offerEvent, $nostrCache];
    }

    class PaymentRequestBubble extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, { event: 0 });
    	}
    }

    var css_248z$9 = ".job-chat.svelte-1nrgabz{max-height:100%;overflow-y:auto}";
    styleInject(css_248z$9);

    /* src/components/JobManager2/JobChat.svelte generated by Svelte v3.59.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (127:2) {#if selectedJob}
    function create_if_block$5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*bubbles*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty & /*bubbles*/ 2) {
    				each_value = /*bubbles*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (128:4) {#each bubbles as bubble}
    function create_each_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*bubble*/ ctx[10].props];
    	var switch_value = /*bubble*/ ctx[10].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return { props: switch_instance_props };
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props());
    	}

    	return {
    		c() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*bubbles*/ 2)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*bubble*/ ctx[10].props)])
    			: {};

    			if (dirty & /*bubbles*/ 2 && switch_value !== (switch_value = /*bubble*/ ctx[10].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	let if_block = /*selectedJob*/ ctx[0] && create_if_block$5(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr(div, "class", "job-chat svelte-1nrgabz");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*selectedJob*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selectedJob*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $nostrCache;
    	let $nostrManager;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(2, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(4, $nostrManager = $$value));
    	let { selectedJob } = $$props;
    	let authors = new Set(); // Set, um doppelte Abonnements zu vermeiden
    	let bubbles = [];
    	let relatedEvents = [];

    	function createBubble(event) {
    		const eventType = event.tags.find(tag => tag[0] === "t")?.[1];

    		switch (eventType) {
    			case "job":
    				return JobBubble;
    			case "offer":
    				return OfferBubble;
    			case "ao":
    				// Akzeptiertes Angebot
    				return AddPRBubble;
    			case "pr":
    				return PRBubble;
    			case "apr":
    				// Akzeptierter PR
    				return PaymentRequestBubble;
    			case "review":
    				// Akzeptierter PR
    				return ReviewBubble;
    			default:
    				return null;
    		} // oder ein Standard-Bubble-Komponent
    	}

    	function subscribeToOfferZaps() {
    		const offerEvents = $nostrCache.getEventsByCriteria({
    			kinds: [NOSTR_KIND_JOB],
    			tags: { s: ["bitspark"], t: ["offer"] }
    		});

    		offerEvents.forEach(offer => {
    			const offerId = offer.id;

    			$nostrManager.subscribeToEvents({
    				kinds: [9735], // Kind für Zap-Events
    				"#e": [offerId]
    			});
    		});
    	}

    	// Autoren aus den verknüpften Events extrahieren und abonnieren
    	function subscribeAuthorsFromEvents() {
    		// Überprüfen und Abonnieren des Autors des Jobs selbst
    		if (selectedJob && selectedJob.pubkey && !authors.has(selectedJob.pubkey)) {
    			authors.add(selectedJob.pubkey);
    			socialMediaManager.subscribeProfile(selectedJob.pubkey);
    		}

    		// Abrufen und Abonnieren der Autoren verknüpfter Events
    		relatedEvents = $nostrCache.getEventsByCriteria({
    			kinds: [NOSTR_KIND_JOB],
    			tags: { e: [selectedJob.id], s: ["bitspark"] }
    		});

    		relatedEvents.push(selectedJob);

    		relatedEvents.forEach(event => {
    			if (event.pubkey && !authors.has(event.pubkey)) {
    				authors.add(event.pubkey);
    				socialMediaManager.subscribeProfile(event.pubkey);
    			}
    		});
    	}

    	function updateBubbles() {
    		relatedEvents = $nostrCache.getEventsByCriteria({
    			kinds: [NOSTR_KIND_JOB],
    			tags: { e: [selectedJob.id], s: ["bitspark"] }
    		});

    		if (selectedJob) {
    			relatedEvents.push(selectedJob);
    		}

    		relatedEvents.forEach(event => {
    			if (event.pubkey && !authors.has(event.pubkey)) {
    				authors.add(event.pubkey);
    				socialMediaManager.subscribeProfile(event.pubkey);
    			}
    		});

    		$$invalidate(1, bubbles = relatedEvents.map(event => {
    			const BubbleComponent = createBubble(event);

    			return {
    				component: BubbleComponent,
    				props: { event }
    			};
    		}));

    		bubbles.sort((a, b) => a.props.event.created_at - b.props.event.created_at);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedJob' in $$props) $$invalidate(0, selectedJob = $$props.selectedJob);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrCache, selectedJob*/ 5) {
    			if ($nostrCache && selectedJob) {
    				subscribeAuthorsFromEvents();
    				subscribeToOfferZaps();
    				updateBubbles();
    			}
    		}

    		if ($$self.$$.dirty & /*selectedJob*/ 1) {
    			if (selectedJob) {
    				nostrJobManager.subscribeJobRelatedEvents(selectedJob.id);
    				subscribeAuthorsFromEvents();
    				subscribeToOfferZaps();
    				updateBubbles();
    			}
    		}
    	};

    	return [selectedJob, bubbles, $nostrCache];
    }

    class JobChat extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, { selectedJob: 0 });
    	}
    }

    var css_248z$8 = ".job-manager-widget.svelte-1ldg9da{flex-direction:row;overflow:hidden;height:45vh}.job-list.svelte-1ldg9da{flex:0 0 30%;max-height:45vh;overflow-y:auto;border-right:2px solid #e0e0e0}.job-chat-container.svelte-1ldg9da{flex:0 0 70%;max-height:45vh;overflow-y:auto}";
    styleInject(css_248z$8);

    /* src/components/JobManager2/JobManager.svelte generated by Svelte v3.59.1 */

    function create_if_block$4(ctx) {
    	let jobchat;
    	let current;

    	jobchat = new JobChat({
    			props: { selectedJob: /*selectedJob*/ ctx[0] }
    		});

    	return {
    		c() {
    			create_component(jobchat.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(jobchat, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const jobchat_changes = {};
    			if (dirty & /*selectedJob*/ 1) jobchat_changes.selectedJob = /*selectedJob*/ ctx[0];
    			jobchat.$set(jobchat_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(jobchat.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(jobchat.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(jobchat, detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let joblist;
    	let t;
    	let div1;
    	let current;
    	joblist = new JobList({});
    	joblist.$on("selectJob", /*handleJobSelection*/ ctx[1]);
    	let if_block = /*selectedJob*/ ctx[0] && create_if_block$4(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(joblist.$$.fragment);
    			t = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr(div0, "class", "job-list svelte-1ldg9da");
    			attr(div1, "class", "job-chat-container svelte-1ldg9da");
    			attr(div2, "class", "single-card container job-manager-widget svelte-1ldg9da");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			mount_component(joblist, div0, null);
    			append(div2, t);
    			append(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*selectedJob*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selectedJob*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(joblist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(joblist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			destroy_component(joblist);
    			if (if_block) if_block.d();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let selectedJob = null;

    	function handleJobSelection(event) {
    		$$invalidate(0, selectedJob = event.detail.job);
    	}

    	return [selectedJob, handleJobSelection];
    }

    class JobManager extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, {});
    	}
    }

    var css_248z$7 = ".overview-page.svelte-y1b9e6{display:flex;flex-direction:column;min-height:100vh;padding:0;margin:0 auto}.flex-grow.svelte-y1b9e6{flex-grow:1}";
    styleInject(css_248z$7);

    /* src/views/JobManager.svelte generated by Svelte v3.59.1 */

    function create_fragment$7(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let jobmanager;
    	let div0_class_value;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage: bannerImage$1,
    				title: title$1,
    				subtitle: subtitle$1,
    				show_right_text: false
    			}
    		});

    	toolbar = new Toolbar({});
    	jobmanager = new JobManager({});
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(jobmanager.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[0]) + " svelte-y1b9e6"));
    			attr(div1, "class", "flex-grow svelte-y1b9e6");
    			attr(main, "class", "overview-page svelte-y1b9e6");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(banner, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(jobmanager, div0, null);
    			append(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*$contentContainerClass*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[0]) + " svelte-y1b9e6"))) {
    				attr(div0, "class", div0_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(jobmanager.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(jobmanager.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(jobmanager);
    			destroy_component(footer);
    		}
    	};
    }

    let bannerImage$1 = "../../img/Banner1u.png";
    let title$1 = "BitSpark";
    let subtitle$1 = "The idea engine";

    function instance$6($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(0, $contentContainerClass = $$value));

    	onMount(async () => {
    		
    	});

    	return [$contentContainerClass];
    }

    class JobManager_1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, {});
    	}
    }

    // DMManager.js

    class DMManager {
      constructor() {
        this.init();
      }

      init() {
        // Initialisiere die Store-Abonnements
        this.cacheSubscription = this.subscribeToStore(nostrCache, (value) => {
          this.cache = value;
        });

        this.managerSubscription = this.subscribeToStore(nostrManager, (value) => {
          this.manager = value;
        });
      }

      subscribeToStore(store, updateFunction) {
        const unsubscribe = store.subscribe(updateFunction);
        return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
      }

      async sendMessage(receiverPubKeys, messageContent, subject) {
        if (!this.manager || !this.manager.publicKey) {
          console.error("Manager or public key not initialized.");
          return;
        }

        // Erstelle das unsignedKind14 Event
        const unsignedKind14 = {
          pubkey: this.manager.publicKey,
          created_at: Math.floor(Date.now() / 1000),
          kind: 14,
          tags: [
            ...receiverPubKeys.map(receiverPubKey => ["p", receiverPubKey]),
            ...(subject ? [["subject", subject]] : []),
          ],
          content: messageContent,
        };

        for (const receiverPubKey of receiverPubKeys) {
          const anonPrivateKey = window.NostrTools.generateSecretKey();
          const anonPublicKey = window.NostrTools.getPublicKey(anonPrivateKey);

          console.log("Encrypt with:", receiverPubKey);
          // Versiegeln des unsignedKind14 Events (Kind 13)

          const sealContent = await window.nostr.nip44.encrypt(receiverPubKey, JSON.stringify(unsignedKind14));
          let seal = {
            created_at: Math.floor(Date.now() / 1000),
            kind: 13,
            tags: [],
            content: sealContent,
          };

          seal = await window.nostr.signEvent(seal);

          // Wickele das versiegelte Event ein (Kind 1059)
          const giftWrapContent = await window.nostr.nip44.encrypt(anonPublicKey, JSON.stringify(seal));
          const tags = [["p", receiverPubKey]];

          try {
            await this.manager.sendAnonEvent(1059, giftWrapContent, tags, anonPrivateKey, anonPublicKey);
          } catch (error) {
            console.error(`Error sending message to ${receiverPubKey}:`, error);
          }
        }
      }

      async getMessagesForRoom(participants) {
        const decryptedMessages = await this.getMessages();
        const roomMessages = decryptedMessages.filter(message => {
          const messageParticipants = message.tags.filter(tag => tag[0] === 'p').map(tag => tag[1]).sort().join(',');
          return messageParticipants === participants;
        });

        return roomMessages.sort((a, b) => a.created_at - b.created_at);
      }

      async fetchMessages() {
        const messages = await this.cache.getEventsByCriteria({
          kinds: [1059],
          tags: { p: [this.manager.publicKey] },
        });

        return messages;
      }

      async decryptMessage(message) {
        try {
          const seal = JSON.parse(await window.nostr.nip44.decrypt(this.manager.publicKey, message.content));
          const unsignedKind14 = JSON.parse(await window.nostr.nip44.decrypt(this.manager.publicKey, seal.content));

          return unsignedKind14;
        } catch (error) {
          return null;
        }
      }

      async getMessages() {
        if (!this.manager) {
          return [];
        }

        const messages = await this.fetchMessages();
        const decryptedMessages = [];

        for (const message of messages) {
          if (message.decryptedContent) {
            decryptedMessages.push(message.decryptedContent);
          } 
          else {
            
            const decryptedMessage = await this.decryptMessage(message);
            if (decryptedMessage) {
              console.log("message", message);
              console.log("PIEEEEP", decryptedMessage);
              decryptedMessages.push(decryptedMessage);
            }
          }
        }
        return decryptedMessages;
      }

      async getChatRooms() {
        const decryptedMessages = await this.getMessages();
        const chatRooms = {};
      
        decryptedMessages.forEach(message => {
          const participantsArray = message.tags
            .filter(tag => tag[0] === 'p')
            .map(tag => tag[1])
            .sort();
      
          // Filtere Chatrooms mit nur einem Teilnehmer
          if (participantsArray.length <= 1) {
            return;
          }
      
          // Filtere Chatrooms mit doppelten Teilnehmern
          const hasDuplicates = participantsArray.some((item, index) => participantsArray.indexOf(item) !== index);
          if (hasDuplicates) {
            return;
          }
      
          // Überprüfe auf ungültige Teilnehmer-PubKeys (zum Beispiel leere Strings)
          const hasInvalidPubKeys = participantsArray.some(pubKey => !pubKey || typeof pubKey !== 'string');
          if (hasInvalidPubKeys) {
            return;
          }
      
          const participants = participantsArray.join(',');
      
          if (!chatRooms[participants]) {
            chatRooms[participants] = {
              participants,
              messages: [],
              subject: null,
              lastSubjectTimestamp: 0
            };
          }
      
          chatRooms[participants].messages.push(message);
      
          const subjectTag = message.tags.find(tag => tag[0] === 'subject');
          if (subjectTag && message.created_at > chatRooms[participants].lastSubjectTimestamp) {
            chatRooms[participants].subject = subjectTag[1];
            chatRooms[participants].lastSubjectTimestamp = message.created_at;
          }
        });
      
        return Object.values(chatRooms);
      }
      

      subscribeToMessages() {
        if (!this.manager) {
          console.error("NostrManager is not initialized.");
          return;
        }

        this.manager.subscribeToEvents({
          kinds: [1059],
          "#p": [this.manager.publicKey],
        });
      }

      unsubscribeFromMessages() {
        if (!this.manager) {
          console.error("NostrManager is not initialized.");
          return;
        }

        this.manager.unsubscribeEvent({
          kinds: [1059],
          "#p": [this.manager.publicKey],
        });
      }

      cleanup() {
        this.cacheSubscription();
        this.managerSubscription();
      }
    }

    const dmManager = new DMManager();

    var css_248z$6 = ".chat-list.svelte-h43t54{width:30%;border-right:1px solid #ccc;padding:1rem}.chat-room.svelte-h43t54{cursor:pointer;padding:0.5rem;border-bottom:1px solid #ddd}.chat-room.svelte-h43t54:hover{background-color:#f5f5f5}.room-header.svelte-h43t54{display:flex;align-items:center;margin-bottom:5px}.room-name.svelte-h43t54{margin:0;flex-grow:1}.subject.svelte-h43t54{color:#888;font-size:0.9rem;margin:0;margin-top:5px}";
    styleInject(css_248z$6);

    /* src/components/DirectMessage/ChatList.svelte generated by Svelte v3.59.1 */

    const { Map: Map_1 } = globals;

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (85:20) {#if $profiles.has(participant) && participant != $nostrManager.publicKey}
    function create_if_block_1$1(ctx) {
    	let profileimg;
    	let t0;
    	let h3;
    	let t1_value = /*$profiles*/ ctx[2].get(/*participant*/ ctx[16]).name + "";
    	let t1;
    	let t2;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*$profiles*/ ctx[2].get(/*participant*/ ctx[16]),
    				style: {
    					width: "50px",
    					height: "50px",
    					"margin-right": "15px"
    				}
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			attr(h3, "class", "room-name svelte-h43t54");
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, h3, anchor);
    			append(h3, t1);
    			append(h3, t2);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*$profiles, $chatRooms*/ 6) profileimg_changes.profile = /*$profiles*/ ctx[2].get(/*participant*/ ctx[16]);
    			profileimg.$set(profileimg_changes);
    			if ((!current || dirty & /*$profiles, $chatRooms*/ 6) && t1_value !== (t1_value = /*$profiles*/ ctx[2].get(/*participant*/ ctx[16]).name + "")) set_data(t1, t1_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(h3);
    		}
    	};
    }

    // (84:16) {#each room.participants.split(',') as participant (participant)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let show_if = /*$profiles*/ ctx[2].has(/*participant*/ ctx[16]) && /*participant*/ ctx[16] != /*$nostrManager*/ ctx[0].publicKey;
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block_1$1(ctx);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$profiles, $chatRooms, $nostrManager*/ 7) show_if = /*$profiles*/ ctx[2].has(/*participant*/ ctx[16]) && /*participant*/ ctx[16] != /*$nostrManager*/ ctx[0].publicKey;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$profiles, $chatRooms, $nostrManager*/ 7) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (100:12) {#if room.subject}
    function create_if_block$3(ctx) {
    	let p;
    	let t_value = /*room*/ ctx[13].subject + "";
    	let t;

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			attr(p, "class", "subject svelte-h43t54");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$chatRooms*/ 2 && t_value !== (t_value = /*room*/ ctx[13].subject + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (80:4) {#each $chatRooms as room}
    function create_each_block$1(ctx) {
    	let div1;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*room*/ ctx[13].participants.split(',');
    	const get_key = ctx => /*participant*/ ctx[16];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	let if_block = /*room*/ ctx[13].subject && create_if_block$3(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*room*/ ctx[13]);
    	}

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr(div0, "class", "room-header svelte-h43t54");
    			attr(div1, "class", "chat-room svelte-h43t54");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append(div1, t0);
    			if (if_block) if_block.m(div1, null);
    			append(div1, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div1, "click", click_handler);
    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$profiles, $chatRooms, $nostrManager*/ 7) {
    				each_value_1 = /*room*/ ctx[13].participants.split(',');
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div0, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (/*room*/ ctx[13].subject) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let current;
    	let each_value = /*$chatRooms*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Chat Rooms";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(div, "class", "chat-list svelte-h43t54");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h2);
    			append(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}

    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*handleRoomClick, $chatRooms, $profiles, $nostrManager*/ 39) {
    				each_value = /*$chatRooms*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $nostrManager;
    	let $nostrCache;
    	let $chatRooms;
    	let $profiles;
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(0, $nostrManager = $$value));
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(7, $nostrCache = $$value));
    	let chatRooms = writable([]);
    	component_subscribe($$self, chatRooms, value => $$invalidate(1, $chatRooms = value));
    	let profiles = writable(new Map());
    	component_subscribe($$self, profiles, value => $$invalidate(2, $profiles = value));
    	const dispatch = createEventDispatcher();
    	let { pubkey = null } = $$props;

    	onMount(async () => {
    		await dmManager.init();
    		dmManager.subscribeToMessages();
    		await updateChatRooms();
    	});

    	async function updateChatRooms() {
    		const rooms = await dmManager.getChatRooms();
    		chatRooms.set(rooms);

    		if (pubkey) {
    			let existingRoom = rooms.find(room => room.participants.split(',').includes(pubkey));

    			if (existingRoom) {
    				handleRoomClick(existingRoom);
    			} else {
    				let dummyRoom = createDummyRoom(pubkey);
    				rooms.push(dummyRoom);
    				chatRooms.set(rooms);
    				handleRoomClick(dummyRoom);
    			}
    		}

    		await fetchProfiles(rooms.map(room => room.participants.split(',')));
    	}

    	async function fetchProfiles(pubkeys) {
    		const profilePromises = pubkeys.flat().map(async pubkey => {
    			let profile = await socialMediaManager.getProfile(pubkey);
    			return { pubkey, profile };
    		});

    		const results = await Promise.all(profilePromises);

    		profiles.update(map => {
    			results.forEach(({ pubkey, profile }) => {
    				if (profile) {
    					map.set(pubkey, profile);
    				}
    			});

    			return map;
    		});
    	}

    	function createDummyRoom(pubkey) {
    		return {
    			participants: [pubkey, $nostrManager.publicKey].sort().join(','),
    			messages: [],
    			subject: "New Chat",
    			lastSubjectTimestamp: Date.now() / 1000
    		};
    	}

    	function handleRoomClick(room) {
    		dispatch("selectRoom", room);
    	}

    	const click_handler = room => handleRoomClick(room);

    	$$self.$$set = $$props => {
    		if ('pubkey' in $$props) $$invalidate(6, pubkey = $$props.pubkey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager, $nostrCache*/ 129) {
    			// Updates chat rooms whenever the cache or manager changes
    			if ($nostrManager && $nostrCache) {
    				updateChatRooms();
    			}
    		}
    	};

    	return [
    		$nostrManager,
    		$chatRooms,
    		$profiles,
    		chatRooms,
    		profiles,
    		handleRoomClick,
    		pubkey,
    		$nostrCache,
    		click_handler
    	];
    }

    class ChatList extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, { pubkey: 6 });
    	}
    }

    var css_248z$5 = ".message.svelte-1n1piku{padding:0.75rem;border-bottom:1px solid #eee;display:flex;align-items:flex-start}.content.svelte-1n1piku{white-space:pre-wrap}.message-content.svelte-1n1piku{flex-grow:1}.name.svelte-1n1piku{font-weight:bold;margin:0;margin-bottom:0.5rem}.timestamp.svelte-1n1piku{font-size:0.75rem;color:#888;margin-left:10px;align-self:flex-end}";
    styleInject(css_248z$5);

    /* src/components/DirectMessage/Message.svelte generated by Svelte v3.59.1 */

    function create_else_block$1(ctx) {
    	let div;
    	let p;
    	let t_value = /*message*/ ctx[0].content + "";
    	let t;

    	return {
    		c() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			attr(div, "class", "message-content svelte-1n1piku");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*message*/ 1 && t_value !== (t_value = /*message*/ ctx[0].content + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (10:4) {#if profile}
    function create_if_block$2(ctx) {
    	let profileimg;
    	let t0;
    	let div;
    	let p0;
    	let t1_value = /*profile*/ ctx[2].name + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3_value = /*message*/ ctx[0].content + "";
    	let t3;
    	let current;

    	profileimg = new ProfileImg({
    			props: {
    				profile: /*profile*/ ctx[2],
    				style: {
    					width: '50px',
    					height: '50px',
    					'margin-right': '15px'
    				}
    			}
    		});

    	return {
    		c() {
    			create_component(profileimg.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text(t3_value);
    			attr(p0, "class", "name svelte-1n1piku");
    			attr(p1, "class", "content svelte-1n1piku");
    			attr(div, "class", "message-content svelte-1n1piku");
    		},
    		m(target, anchor) {
    			mount_component(profileimg, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, p0);
    			append(p0, t1);
    			append(div, t2);
    			append(div, p1);
    			append(p1, t3);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const profileimg_changes = {};
    			if (dirty & /*profile*/ 4) profileimg_changes.profile = /*profile*/ ctx[2];
    			profileimg.$set(profileimg_changes);
    			if ((!current || dirty & /*profile*/ 4) && t1_value !== (t1_value = /*profile*/ ctx[2].name + "")) set_data(t1, t1_value);
    			if ((!current || dirty & /*message*/ 1) && t3_value !== (t3_value = /*message*/ ctx[0].content + "")) set_data(t3, t3_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(profileimg.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(profileimg.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(profileimg, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t0;
    	let p;
    	let t1_value = new Date(/*message*/ ctx[0].created_at * 1000).toLocaleString() + "";
    	let t1;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*profile*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr(p, "class", "timestamp svelte-1n1piku");
    			attr(div, "class", "message svelte-1n1piku");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append(div, t0);
    			append(div, p);
    			append(p, t1);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t0);
    			}

    			if ((!current || dirty & /*message*/ 1) && t1_value !== (t1_value = new Date(/*message*/ ctx[0].created_at * 1000).toLocaleString() + "")) set_data(t1, t1_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let profile;

    	let $profiles,
    		$$unsubscribe_profiles = noop,
    		$$subscribe_profiles = () => ($$unsubscribe_profiles(), $$unsubscribe_profiles = subscribe(profiles, $$value => $$invalidate(3, $profiles = $$value)), profiles);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_profiles());
    	let { message } = $$props;
    	let { profiles } = $$props;
    	$$subscribe_profiles();

    	$$self.$$set = $$props => {
    		if ('message' in $$props) $$invalidate(0, message = $$props.message);
    		if ('profiles' in $$props) $$subscribe_profiles($$invalidate(1, profiles = $$props.profiles));
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$profiles, message*/ 9) {
    			$$invalidate(2, profile = $profiles.has(message.pubkey)
    			? $profiles.get(message.pubkey)
    			: null);
    		}
    	};

    	return [message, profiles, profile, $profiles];
    }

    class Message extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, { message: 0, profiles: 1 });
    	}
    }

    var css_248z$4 = ".message-input.svelte-16tkvs6{display:flex;align-items:center;padding:0.75rem;border-top:1px solid #eee;background-color:#f9f9f9}textarea.svelte-16tkvs6{flex-grow:1;padding:0.75rem;font-size:1rem;border:1px solid #ccc;border-radius:5px;margin-right:0.5rem;resize:none;height:50px}button.svelte-16tkvs6{padding:0.75rem 1rem;font-size:1rem;color:#fff;background-color:#007bff;border:none;border-radius:5px;cursor:pointer;transition:background-color 0.2s}button.svelte-16tkvs6:hover{background-color:#0056b3}";
    styleInject(css_248z$4);

    /* src/components/DirectMessage/MessageInput.svelte generated by Svelte v3.59.1 */

    function create_fragment$4(ctx) {
    	let div;
    	let textarea;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Send";
    			attr(textarea, "placeholder", "Type your message...");
    			attr(textarea, "class", "svelte-16tkvs6");
    			attr(button, "class", "svelte-16tkvs6");
    			attr(div, "class", "message-input svelte-16tkvs6");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, textarea);
    			set_input_value(textarea, /*messageContent*/ ctx[1]);
    			append(div, t0);
    			append(div, button);

    			if (!mounted) {
    				dispose = [
    					listen(textarea, "input", /*textarea_input_handler*/ ctx[4]),
    					listen(textarea, "keydown", /*handleKeyDown*/ ctx[3]),
    					listen(button, "click", /*sendMessage*/ ctx[2])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*messageContent*/ 2) {
    				set_input_value(textarea, /*messageContent*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedRoom,
    		$$unsubscribe_selectedRoom = noop,
    		$$subscribe_selectedRoom = () => ($$unsubscribe_selectedRoom(), $$unsubscribe_selectedRoom = subscribe(selectedRoom, $$value => $$invalidate(5, $selectedRoom = $$value)), selectedRoom);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedRoom());
    	let { selectedRoom } = $$props;
    	$$subscribe_selectedRoom();
    	let messageContent = '';
    	const dispatch = createEventDispatcher();

    	async function sendMessage() {
    		if (messageContent.trim() === '') return;

    		if ($selectedRoom && $selectedRoom.participants) {
    			const receiverPubKeys = $selectedRoom.participants.split(',');
    			const subject = $selectedRoom.subject;

    			try {
    				await dmManager.sendMessage(receiverPubKeys, messageContent, subject);
    				$$invalidate(1, messageContent = '');
    				dispatch('messageSent');
    			} catch(error) {
    				console.error("Error sending message:", error);
    			}
    		} else {
    			console.error("Selected room or participants are not defined.");
    		}
    	}

    	function handleKeyDown(event) {
    		if (event.key === 'Enter') {
    			if (event.shiftKey) {
    				// Shift+Enter pressed - insert a new line
    				event.preventDefault();

    				$$invalidate(1, messageContent += '\n');
    			} else {
    				// Enter pressed - send the message
    				event.preventDefault();

    				sendMessage();
    			}
    		}
    	}

    	function textarea_input_handler() {
    		messageContent = this.value;
    		$$invalidate(1, messageContent);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedRoom' in $$props) $$subscribe_selectedRoom($$invalidate(0, selectedRoom = $$props.selectedRoom));
    	};

    	return [
    		selectedRoom,
    		messageContent,
    		sendMessage,
    		handleKeyDown,
    		textarea_input_handler
    	];
    }

    class MessageInput extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, { selectedRoom: 0 });
    	}
    }

    var css_248z$3 = ".chat-room.svelte-10g9611{width:70%;padding:1rem;display:flex;flex-direction:column}.chat-header.svelte-10g9611{display:flex;align-items:center;padding-bottom:1rem;border-bottom:1px solid #eee;margin-bottom:1rem}.subject.svelte-10g9611{color:#888;font-size:1rem;margin:0;margin-top:5px}.messages.svelte-10g9611{flex-grow:1;overflow-y:auto}";
    styleInject(css_248z$3);

    /* src/components/DirectMessage/ChatRoom.svelte generated by Svelte v3.59.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (71:8) {#if $selectedRoom.subject}
    function create_if_block$1(ctx) {
    	let p;
    	let t_value = /*$selectedRoom*/ ctx[2].subject + "";
    	let t;

    	return {
    		c() {
    			p = element("p");
    			t = text(t_value);
    			attr(p, "class", "subject svelte-10g9611");
    		},
    		m(target, anchor) {
    			insert(target, p, anchor);
    			append(p, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*$selectedRoom*/ 4 && t_value !== (t_value = /*$selectedRoom*/ ctx[2].subject + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(p);
    		}
    	};
    }

    // (76:8) {#each $messages as message}
    function create_each_block(ctx) {
    	let message;
    	let current;

    	message = new Message({
    			props: {
    				message: /*message*/ ctx[11],
    				profiles: /*profiles*/ ctx[5]
    			}
    		});

    	return {
    		c() {
    			create_component(message.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(message, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const message_changes = {};
    			if (dirty & /*$messages*/ 8) message_changes.message = /*message*/ ctx[11];
    			message.$set(message_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(message.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(message.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(message, detaching);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let messageinput;
    	let current;
    	let if_block = /*$selectedRoom*/ ctx[2].subject && create_if_block$1(ctx);
    	let each_value = /*$messages*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	messageinput = new MessageInput({
    			props: { selectedRoom: /*selectedRoom*/ ctx[0] }
    		});

    	return {
    		c() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(messageinput.$$.fragment);
    			attr(div0, "class", "chat-header svelte-10g9611");
    			attr(div1, "class", "messages svelte-10g9611");
    			attr(div2, "class", "chat-room svelte-10g9611");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append(div2, t0);
    			append(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			/*div1_binding*/ ctx[7](div1);
    			append(div2, t1);
    			mount_component(messageinput, div2, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*$selectedRoom*/ ctx[2].subject) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$messages, profiles*/ 40) {
    				each_value = /*$messages*/ ctx[3];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const messageinput_changes = {};
    			if (dirty & /*selectedRoom*/ 1) messageinput_changes.selectedRoom = /*selectedRoom*/ ctx[0];
    			messageinput.$set(messageinput_changes);
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(messageinput.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(messageinput.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			/*div1_binding*/ ctx[7](null);
    			destroy_component(messageinput);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $nostrCache;

    	let $selectedRoom,
    		$$unsubscribe_selectedRoom = noop,
    		$$subscribe_selectedRoom = () => ($$unsubscribe_selectedRoom(), $$unsubscribe_selectedRoom = subscribe(selectedRoom, $$value => $$invalidate(2, $selectedRoom = $$value)), selectedRoom);

    	let $messages;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(6, $nostrCache = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedRoom());
    	let { selectedRoom } = $$props;
    	$$subscribe_selectedRoom();
    	let messages = writable([]);
    	component_subscribe($$self, messages, value => $$invalidate(3, $messages = value));
    	let profiles = writable(new Map());
    	let messageContainer;
    	let latestTimestamp = writable(0);

    	// Fetches messages for the selected room from the cache
    	async function fetchMessages() {
    		if ($selectedRoom) {
    			const fetchedMessages = await dmManager.getMessagesForRoom($selectedRoom.participants);
    			messages.set(fetchedMessages);
    			await fetchProfiles(fetchedMessages.map(msg => msg.pubkey));

    			// Update the latest message timestamp
    			if (fetchedMessages.length > 0) {
    				latestTimestamp.set(fetchedMessages[fetchedMessages.length - 1].created_at);
    			}
    		}
    	}

    	async function fetchProfiles(pubkeys) {
    		const profilePromises = pubkeys.map(async pubkey => {
    			let profile = await socialMediaManager.getProfile(pubkey);
    			return { pubkey, profile };
    		});

    		const results = await Promise.all(profilePromises);

    		profiles.update(map => {
    			results.forEach(({ pubkey, profile }) => {
    				if (profile) {
    					map.set(pubkey, profile);
    				}
    			});

    			return map;
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			messageContainer = $$value;
    			($$invalidate(1, messageContainer), $$invalidate(8, latestTimestamp));
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('selectedRoom' in $$props) $$subscribe_selectedRoom($$invalidate(0, selectedRoom = $$props.selectedRoom));
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedRoom*/ 4) {
    			// Updates messages and fetches profiles whenever the selected room changes
    			if ($selectedRoom) {
    				fetchMessages();
    			}
    		}

    		if ($$self.$$.dirty & /*messageContainer*/ 2) {
    			// Scroll to the bottom when a new message is added
    			latestTimestamp.subscribe(newTimestamp => {
    				if (messageContainer && newTimestamp > 0) {
    					$$invalidate(1, messageContainer.scrollTop = messageContainer.scrollHeight, messageContainer);
    				}
    			});
    		}

    		if ($$self.$$.dirty & /*$nostrCache*/ 64) {
    			// Updates messages whenever the cache changes
    			if ($nostrCache) {
    				fetchMessages();
    			}
    		}
    	};

    	return [
    		selectedRoom,
    		messageContainer,
    		$selectedRoom,
    		$messages,
    		messages,
    		profiles,
    		$nostrCache,
    		div1_binding
    	];
    }

    class ChatRoom extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { selectedRoom: 0 });
    	}
    }

    var css_248z$2 = "body{font-family:\"Arial\", sans-serif;background-color:#f0f2f5;margin:0;padding:0}.chat-container.svelte-1l4j5d7{display:flex;height:50vh;background-color:#fff;box-shadow:0 4px 8px rgba(0, 0, 0, 0.1);border-radius:8px;overflow:hidden;margin:auto;margin-bottom:7vh;max-width:1200px}.no-chat-selected.svelte-1l4j5d7,.not-logged-in.svelte-1l4j5d7{flex-grow:1;display:flex;justify-content:center;align-items:center;color:#888}.not-logged-in.svelte-1l4j5d7{flex-direction:column;text-align:center}";
    styleInject(css_248z$2);

    /* src/components/DirectMessage/Chat.svelte generated by Svelte v3.59.1 */

    function create_else_block_1(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<p>Please log in to access the chat.</p>`;
    			attr(div, "class", "not-logged-in svelte-1l4j5d7");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (34:8) {#if loggedIn}
    function create_if_block(ctx) {
    	let chatlist;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	chatlist = new ChatList({ props: { pubkey: /*pubkey*/ ctx[0] } });
    	chatlist.$on("selectRoom", /*selectRoom*/ ctx[4]);
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$selectedRoom*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			create_component(chatlist.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			mount_component(chatlist, target, anchor);
    			insert(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const chatlist_changes = {};
    			if (dirty & /*pubkey*/ 1) chatlist_changes.pubkey = /*pubkey*/ ctx[0];
    			chatlist.$set(chatlist_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(chatlist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(chatlist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(chatlist, detaching);
    			if (detaching) detach(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (38:12) {:else}
    function create_else_block(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<p>Select a chat to start messaging</p>`;
    			attr(div, "class", "no-chat-selected svelte-1l4j5d7");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (36:12) {#if $selectedRoom}
    function create_if_block_1(ctx) {
    	let chatroom;
    	let current;

    	chatroom = new ChatRoom({
    			props: { selectedRoom: /*selectedRoom*/ ctx[3] }
    		});

    	return {
    		c() {
    			create_component(chatroom.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(chatroom, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(chatroom.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(chatroom.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(chatroom, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loggedIn*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			main = element("main");
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "chat-container svelte-1l4j5d7");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let loggedIn;
    	let $nostrCache;
    	let $nostrManager;
    	let $selectedRoom;
    	component_subscribe($$self, nostrCache, $$value => $$invalidate(5, $nostrCache = $$value));
    	component_subscribe($$self, nostrManager, $$value => $$invalidate(6, $nostrManager = $$value));
    	let { pubkey = null } = $$props;
    	let selectedRoom = writable(null);
    	component_subscribe($$self, selectedRoom, value => $$invalidate(2, $selectedRoom = value));

    	function selectRoom(event) {
    		selectedRoom.set(event.detail);
    	}

    	onMount(async () => {
    		if (loggedIn) {
    			await dmManager.init();
    			dmManager.subscribeToMessages();
    		}
    	});

    	$$self.$$set = $$props => {
    		if ('pubkey' in $$props) $$invalidate(0, pubkey = $$props.pubkey);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nostrManager*/ 64) {
    			$$invalidate(1, loggedIn = $nostrManager && $nostrManager.publicKey);
    		}

    		if ($$self.$$.dirty & /*loggedIn, $nostrCache*/ 34) {
    			if (loggedIn && $nostrCache) {
    				dmManager.init();
    				dmManager.subscribeToMessages();
    			}
    		}
    	};

    	return [
    		pubkey,
    		loggedIn,
    		$selectedRoom,
    		selectedRoom,
    		selectRoom,
    		$nostrCache,
    		$nostrManager
    	];
    }

    class Chat extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { pubkey: 0 });
    	}
    }

    var css_248z$1 = ".content-section.svelte-17eaetn{display:flex;background-color:#e2e8f0 !important}.content-container.svelte-17eaetn{flex-grow:1;z-index:0}.flex-grow.svelte-17eaetn{z-index:0}.content-container.svelte-17eaetn{margin-left:0;transition:margin-left 0.3s ease-in-out;flex-grow:1;z-index:0}.content-container.sidebar-open.svelte-17eaetn{margin-left:200px}";
    styleInject(css_248z$1);

    /* src/views/DMView.svelte generated by Svelte v3.59.1 */

    function create_fragment$1(ctx) {
    	let main;
    	let menu;
    	let t0;
    	let div1;
    	let banner;
    	let t1;
    	let toolbar;
    	let t2;
    	let div0;
    	let chat;
    	let div0_class_value;
    	let t3;
    	let footer;
    	let current;
    	menu = new Sidebar({});

    	banner = new Banner({
    			props: {
    				bannerImage,
    				title,
    				subtitle,
    				show_right_text: true
    			}
    		});

    	toolbar = new Toolbar({});
    	chat = new Chat({ props: { pubkey: /*pubkey*/ ctx[0] } });
    	footer = new Footer({});

    	return {
    		c() {
    			main = element("main");
    			create_component(menu.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(banner.$$.fragment);
    			t1 = space();
    			create_component(toolbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			create_component(chat.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr(div0, "class", div0_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[1]) + " svelte-17eaetn"));
    			attr(div1, "class", "flex-grow svelte-17eaetn");
    			attr(main, "class", "overview-page");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			mount_component(menu, main, null);
    			append(main, t0);
    			append(main, div1);
    			mount_component(banner, div1, null);
    			append(div1, t1);
    			mount_component(toolbar, div1, null);
    			append(div1, t2);
    			append(div1, div0);
    			mount_component(chat, div0, null);
    			append(div1, t3);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const chat_changes = {};
    			if (dirty & /*pubkey*/ 1) chat_changes.pubkey = /*pubkey*/ ctx[0];
    			chat.$set(chat_changes);

    			if (!current || dirty & /*$contentContainerClass*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*$contentContainerClass*/ ctx[1]) + " svelte-17eaetn"))) {
    				attr(div0, "class", div0_class_value);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(banner.$$.fragment, local);
    			transition_in(toolbar.$$.fragment, local);
    			transition_in(chat.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(banner.$$.fragment, local);
    			transition_out(toolbar.$$.fragment, local);
    			transition_out(chat.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			destroy_component(menu);
    			destroy_component(banner);
    			destroy_component(toolbar);
    			destroy_component(chat);
    			destroy_component(footer);
    		}
    	};
    }

    let bannerImage = "../../img/Banner1u.png";
    let title = "BitSpark";
    let subtitle = "The idea engine";

    function instance($$self, $$props, $$invalidate) {
    	let $contentContainerClass;
    	component_subscribe($$self, contentContainerClass, $$value => $$invalidate(1, $contentContainerClass = $$value));
    	let { params } = $$props;
    	let pubkey = null;

    	$$self.$$set = $$props => {
    		if ('params' in $$props) $$invalidate(2, params = $$props.params);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params*/ 4) {
    			// Warten auf params und Initialisieren des pubkey
    			{
    				if (params) {
    					$$invalidate(0, pubkey = params.pubkey || null);
    				}
    			}
    		}
    	};

    	return [pubkey, $contentContainerClass, params];
    }

    class DMView extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment$1, safe_not_equal, { params: 2 });
    	}
    }

    var css_248z = ".bitspark-card {\n    background: #ffffff;\n    overflow: hidden;\n    border-radius: 8px;\n    display: flex;\n    flex-direction: column;\n    border: 4px solid #ffffff;\n    box-shadow: 0 5px 10px #0000008c;\n    min-width: 0;\n    word-wrap: break-word;\n    background-color: #fff;\n    background-clip: border-box;\n    position: relative;\n}\n\n.bitspark-card:hover {\n    transform: scale(1.03);\n    background: #ffffff;\n    box-shadow: 0 10px 20px #0000008c;\n}\n\n.bitspark-card-content {\n    cursor: pointer;\n    background: #ffffff;\n}\n\n.bitspark-card-banner-image {\n    width: 100%;\n    height: 200px;\n    object-fit: cover;\n}\n\n.bitspark-card-actions {\n    padding: 15px;\n}\n\n.bitspark-card-actions {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    background: #f4f4f4;\n}";
    styleInject(css_248z);

    /* src/App.svelte generated by Svelte v3.59.1 */

    function create_default_slot_2(ctx) {
    	let dmview;
    	let current;
    	dmview = new DMView({ props: { params: /*params*/ ctx[0] } });

    	return {
    		c() {
    			create_component(dmview.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(dmview, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const dmview_changes = {};
    			if (dirty & /*params*/ 1) dmview_changes.params = /*params*/ ctx[0];
    			dmview.$set(dmview_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dmview.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dmview.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(dmview, detaching);
    		}
    	};
    }

    // (59:6) <Route path="/dm" let:params>
    function create_default_slot_1(ctx) {
    	let dmview;
    	let current;
    	dmview = new DMView({ props: { params: /*params*/ ctx[0] } });

    	return {
    		c() {
    			create_component(dmview.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(dmview, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const dmview_changes = {};
    			if (dirty & /*params*/ 1) dmview_changes.params = /*params*/ ctx[0];
    			dmview.$set(dmview_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dmview.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dmview.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(dmview, detaching);
    		}
    	};
    }

    // (30:0) <Router>
    function create_default_slot(ctx) {
    	let div;
    	let nav;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let route5;
    	let t6;
    	let route6;
    	let t7;
    	let route7;
    	let t8;
    	let route8;
    	let t9;
    	let route9;
    	let t10;
    	let route10;
    	let t11;
    	let route11;
    	let t12;
    	let route12;
    	let t13;
    	let route13;
    	let current;
    	route0 = new Route({ props: { path: "/", component: Home } });

    	route1 = new Route({
    			props: {
    				path: "/tutorial/:id",
    				component: Tutorial
    			}
    		});

    	route2 = new Route({
    			props: {
    				path: "/overview/:category",
    				component: Home
    			}
    		});

    	route3 = new Route({
    			props: {
    				path: "/profile/:profile_id",
    				component: Profile
    			}
    		});

    	route4 = new Route({
    			props: {
    				path: "/edit_profile/:profile_id",
    				component: EditProfile
    			}
    		});

    	route5 = new Route({
    			props: { path: "/idea/:id", component: Idea }
    		});

    	route6 = new Route({
    			props: { path: "/postidea", component: PostIdea }
    		});

    	route7 = new Route({
    			props: { path: "/preview", component: IdeaPreview }
    		});

    	route8 = new Route({
    			props: { path: "/job/:id", component: Job }
    		});

    	route9 = new Route({
    			props: {
    				path: "/postjob/:ideaID",
    				component: PostJob
    			}
    		});

    	route10 = new Route({
    			props: { path: "/jobmarket", component: JobMarket_1 }
    		});

    	route11 = new Route({
    			props: {
    				path: "/jobmanager",
    				component: JobManager_1
    			}
    		});

    	route12 = new Route({
    			props: {
    				path: "/dm/:pubkey",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ params }) => ({ 0: params }),
    						({ params }) => params ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	route13 = new Route({
    			props: {
    				path: "/dm",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ params }) => ({ 0: params }),
    						({ params }) => params ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			div = element("div");
    			nav = element("nav");
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			t6 = space();
    			create_component(route6.$$.fragment);
    			t7 = space();
    			create_component(route7.$$.fragment);
    			t8 = space();
    			create_component(route8.$$.fragment);
    			t9 = space();
    			create_component(route9.$$.fragment);
    			t10 = space();
    			create_component(route10.$$.fragment);
    			t11 = space();
    			create_component(route11.$$.fragment);
    			t12 = space();
    			create_component(route12.$$.fragment);
    			t13 = space();
    			create_component(route13.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, nav);
    			append(div, t0);
    			append(div, main);
    			mount_component(route0, main, null);
    			append(main, t1);
    			mount_component(route1, main, null);
    			append(main, t2);
    			mount_component(route2, main, null);
    			append(main, t3);
    			mount_component(route3, main, null);
    			append(main, t4);
    			mount_component(route4, main, null);
    			append(main, t5);
    			mount_component(route5, main, null);
    			append(main, t6);
    			mount_component(route6, main, null);
    			append(main, t7);
    			mount_component(route7, main, null);
    			append(main, t8);
    			mount_component(route8, main, null);
    			append(main, t9);
    			mount_component(route9, main, null);
    			append(main, t10);
    			mount_component(route10, main, null);
    			append(main, t11);
    			mount_component(route11, main, null);
    			append(main, t12);
    			mount_component(route12, main, null);
    			append(main, t13);
    			mount_component(route13, main, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const route12_changes = {};

    			if (dirty & /*$$scope, params*/ 3) {
    				route12_changes.$$scope = { dirty, ctx };
    			}

    			route12.$set(route12_changes);
    			const route13_changes = {};

    			if (dirty & /*$$scope, params*/ 3) {
    				route13_changes.$$scope = { dirty, ctx };
    			}

    			route13.$set(route13_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			transition_in(route9.$$.fragment, local);
    			transition_in(route10.$$.fragment, local);
    			transition_in(route11.$$.fragment, local);
    			transition_in(route12.$$.fragment, local);
    			transition_in(route13.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			transition_out(route9.$$.fragment, local);
    			transition_out(route10.$$.fragment, local);
    			transition_out(route11.$$.fragment, local);
    			transition_out(route12.$$.fragment, local);
    			transition_out(route13.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    			destroy_component(route6);
    			destroy_component(route7);
    			destroy_component(route8);
    			destroy_component(route9);
    			destroy_component(route10);
    			destroy_component(route11);
    			destroy_component(route12);
    			destroy_component(route13);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let link;
    	let t;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			link = element("link");
    			t = space();
    			create_component(router.$$.fragment);
    			attr(link, "rel", "stylesheet");
    			attr(link, "href", "https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css");
    		},
    		m(target, anchor) {
    			append(document.head, link);
    			insert(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			detach(link);
    			if (detaching) detach(t);
    			destroy_component(router, detaching);
    		}
    	};
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment, safe_not_equal, {});
    	}
    }

    const app = new App({
      target: document.getElementById("app"),
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
