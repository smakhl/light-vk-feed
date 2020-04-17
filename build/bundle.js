
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
                                info.blocks[i] = null;
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

    const globals = (typeof window !== 'undefined' ? window : global);

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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // https://vk.com/dev/permissions
    const wallAccessCode = 8192;
    const friendsAccessCode = 2;
    const ACCESS_LEVEL = (wallAccessCode + friendsAccessCode).toString();

    VK.init({
        apiId: 7412293,
    });

    function login() {
        return new Promise((resolve, reject) => {
            VK.Auth.login(({ session }) => {
                resolve(Boolean(session));
            }, ACCESS_LEVEL);
        });
    }

    function logout() {
        return new Promise((resolve, reject) => {
            VK.Auth.logout(() => {
                resolve();
            });
        });
    }

    function getIsLoggedIn() {
        return new Promise((resolve, reject) => {
            VK.Auth.getLoginStatus(({ status }) => {
                resolve(status === 'connected');
            });
        });
    }

    // https://vk.com/dev/newsfeed.get
    function getNews() {
        return new Promise((resolve, reject) => {
            VK.Api.call(
                'newsfeed.get',
                {
                    v: '5.73',
                    return_banned: 0,
                    count: 10,
                    filters: 'post'
                    // start_from: '100/5_-30666517_1662753:1450415924',
                },
                function ({ response }) {
                    console.log('getNews -> response', response);
                    if (!response) {
                        reject();
                    }

                    const groupNames = getGroupNames(response.groups);
                    const profilesNames = getProfileNames(response.profiles);

                    const result = response.items.map((item) => {
                        const { text, source_id } = item;

                        return {
                            source:
                                groupNames[-source_id] || profilesNames[source_id],
                            text,
                            item,
                        };
                    });

                    resolve(result);
                }
            );
        });
    }

    function getProfileNames(profiles) {
        const profilesHash = {};
        profiles.forEach((pr) => {
            profilesHash[pr.id] = `${pr.first_name} ${pr.last_name}`.trim();
        });
        return profilesHash;
    }

    function getGroupNames(groups) {
        const groupsHash = {};
        groups.forEach((gr) => {
            groupsHash[gr.id] = gr.name;
        });
        return groupsHash;
    }

    /* src\components\Link.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1 } = globals;
    const file = "src\\components\\Link.svelte";

    // (19:8) {#if photoSrc}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "loading", "lazy");
    			if (img.src !== (img_src_value = /*photoSrc*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-15mhepw");
    			add_location(img, file, 19, 12, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*photoSrc*/ 2 && img.src !== (img_src_value = /*photoSrc*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:8) {#if photoSrc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let a;
    	let div;
    	let t0;
    	let p;
    	let t1_value = /*att*/ ctx[0].link.title + "";
    	let t1;
    	let a_href_value;
    	let if_block = /*photoSrc*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			a = element("a");
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			attr_dev(p, "class", "svelte-15mhepw");
    			add_location(p, file, 21, 8, 598);
    			attr_dev(div, "class", "link svelte-15mhepw");
    			add_location(div, file, 17, 4, 471);
    			attr_dev(a, "href", a_href_value = /*att*/ ctx[0].link.url);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 16, 0, 424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, div);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*photoSrc*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*att*/ 1 && t1_value !== (t1_value = /*att*/ ctx[0].link.title + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*att*/ 1 && a_href_value !== (a_href_value = /*att*/ ctx[0].link.url)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { att } = $$props;
    	let photoSrc;

    	if (att.link.photo) {
    		const photoSizes = Object.keys(att.link.photo).filter(k => k.includes("photo"));

    		// fixme replace with screensize based size
    		const medianQuality = Math.floor(photoSizes.length / 2);

    		photoSrc = att.link.photo[photoSizes[medianQuality]];
    	}

    	const writable_props = ["att"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, []);

    	$$self.$set = $$props => {
    		if ("att" in $$props) $$invalidate(0, att = $$props.att);
    	};

    	$$self.$capture_state = () => ({ att, photoSrc });

    	$$self.$inject_state = $$props => {
    		if ("att" in $$props) $$invalidate(0, att = $$props.att);
    		if ("photoSrc" in $$props) $$invalidate(1, photoSrc = $$props.photoSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [att, photoSrc];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { att: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*att*/ ctx[0] === undefined && !("att" in props)) {
    			console.warn("<Link> was created without expected prop 'att'");
    		}
    	}

    	get att() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set att(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Photo.svelte generated by Svelte v3.20.1 */

    const { Object: Object_1$1, console: console_1 } = globals;
    const file$1 = "src\\components\\Photo.svelte";

    function create_fragment$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "loading", "lazy");
    			if (img.src !== (img_src_value = /*photoSrc*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			attr_dev(img, "class", "svelte-1pl1cif");
    			add_location(img, file$1, 14, 0, 387);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { att } = $$props;
    	const photoSizes = Object.keys(att.photo).filter(k => k.includes("photo"));
    	console.log("photoSizes", photoSizes);

    	// fixme replace with screensize based size
    	const medianQuality = Math.floor(photoSizes.length / 2);

    	const photoSrc = att.photo[photoSizes[medianQuality]];
    	const writable_props = ["att"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Photo> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Photo", $$slots, []);

    	$$self.$set = $$props => {
    		if ("att" in $$props) $$invalidate(1, att = $$props.att);
    	};

    	$$self.$capture_state = () => ({ att, photoSizes, medianQuality, photoSrc });

    	$$self.$inject_state = $$props => {
    		if ("att" in $$props) $$invalidate(1, att = $$props.att);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [photoSrc, att];
    }

    class Photo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { att: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Photo",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*att*/ ctx[1] === undefined && !("att" in props)) {
    			console_1.warn("<Photo> was created without expected prop 'att'");
    		}
    	}

    	get att() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set att(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Video.svelte generated by Svelte v3.20.1 */

    const file$2 = "src\\components\\Video.svelte";

    function create_fragment$2(ctx) {
    	let video;
    	let video_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			if (video.src !== (video_src_value = /*videoSrc*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "poster", /*posterSrc*/ ctx[0]);
    			attr_dev(video, "preload", "none");
    			video.controls = true;
    			attr_dev(video, "type", "video/mp4");
    			attr_dev(video, "class", "svelte-faqdgn");
    			add_location(video, file$2, 9, 0, 229);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { att } = $$props;

    	// fixme choose poster based on screen size
    	const posterSrc = att.doc.preview.photo.sizes[0].src;

    	const videoSrc = att.doc.preview.video.src;
    	const writable_props = ["att"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Video", $$slots, []);

    	$$self.$set = $$props => {
    		if ("att" in $$props) $$invalidate(2, att = $$props.att);
    	};

    	$$self.$capture_state = () => ({ att, posterSrc, videoSrc });

    	$$self.$inject_state = $$props => {
    		if ("att" in $$props) $$invalidate(2, att = $$props.att);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [posterSrc, videoSrc, att];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { att: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*att*/ ctx[2] === undefined && !("att" in props)) {
    			console.warn("<Video> was created without expected prop 'att'");
    		}
    	}

    	get att() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set att(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Attachment.svelte generated by Svelte v3.20.1 */
    const file$3 = "src\\components\\Attachment.svelte";

    // (16:4) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = JSON.stringify(/*att*/ ctx[0]) + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Unsupported attachment: ");
    			t1 = text(t1_value);
    			add_location(p, file$3, 16, 8, 438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*att*/ 1 && t1_value !== (t1_value = JSON.stringify(/*att*/ ctx[0]) + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(16:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:34) 
    function create_if_block_2(ctx) {
    	let current;

    	const link = new Link({
    			props: { att: /*att*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};
    			if (dirty & /*att*/ 1) link_changes.att = /*att*/ ctx[0];
    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(14:34) ",
    		ctx
    	});

    	return block;
    }

    // (12:58) 
    function create_if_block_1(ctx) {
    	let current;

    	const video = new Video({
    			props: { att: /*att*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(video.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(video, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*att*/ 1) video_changes.att = /*att*/ ctx[0];
    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(video, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(12:58) ",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if att.type === 'photo'}
    function create_if_block$1(ctx) {
    	let current;

    	const photo = new Photo({
    			props: { att: /*att*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(photo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(photo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const photo_changes = {};
    			if (dirty & /*att*/ 1) photo_changes.att = /*att*/ ctx[0];
    			photo.$set(photo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(photo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(photo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(photo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(10:4) {#if att.type === 'photo'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*att*/ ctx[0].type === "photo") return 0;
    		if (/*att*/ ctx[0].type === "doc" && /*att*/ ctx[0].doc.ext === "gif") return 1;
    		if (/*att*/ ctx[0].type === "link") return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$3, 8, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { att } = $$props;
    	const writable_props = ["att"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Attachment> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Attachment", $$slots, []);

    	$$self.$set = $$props => {
    		if ("att" in $$props) $$invalidate(0, att = $$props.att);
    	};

    	$$self.$capture_state = () => ({ Link, Photo, Video, att });

    	$$self.$inject_state = $$props => {
    		if ("att" in $$props) $$invalidate(0, att = $$props.att);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [att];
    }

    class Attachment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { att: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Attachment",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*att*/ ctx[0] === undefined && !("att" in props)) {
    			console.warn("<Attachment> was created without expected prop 'att'");
    		}
    	}

    	get att() {
    		throw new Error("<Attachment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set att(value) {
    		throw new Error("<Attachment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Post.svelte generated by Svelte v3.20.1 */
    const file$4 = "src\\components\\Post.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (14:4) {#if text}
    function create_if_block_1$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(p, "class", "text svelte-t8x4xt");
    			add_location(p, file$4, 14, 8, 316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(14:4) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if item.attachments}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*item*/ ctx[2].attachments;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 4) {
    				each_value = /*item*/ ctx[2].attachments;
    				validate_each_argument(each_value);
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
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(17:4) {#if item.attachments}",
    		ctx
    	});

    	return block;
    }

    // (18:8) {#each item.attachments as att, i}
    function create_each_block(ctx) {
    	let current;

    	const attachment = new Attachment({
    			props: { att: /*att*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(attachment.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(attachment, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const attachment_changes = {};
    			if (dirty & /*item*/ 4) attachment_changes.att = /*att*/ ctx[4];
    			attachment.$set(attachment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(attachment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(attachment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(attachment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:8) {#each item.attachments as att, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let h4;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p0;
    	let a;
    	let t4;
    	let t5;
    	let p1;
    	let t6_value = new Date(/*item*/ ctx[2].date * 1000).toLocaleString("ru") + "";
    	let t6;
    	let current;
    	let if_block0 = /*text*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block1 = /*item*/ ctx[2].attachments && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(/*source*/ ctx[0]);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			p0 = element("p");
    			a = element("a");
    			t4 = text(/*postUrl*/ ctx[3]);
    			t5 = space();
    			p1 = element("p");
    			t6 = text(t6_value);
    			add_location(h4, file$4, 12, 4, 273);
    			attr_dev(a, "href", /*postUrl*/ ctx[3]);
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$4, 21, 7, 506);
    			add_location(p0, file$4, 21, 4, 503);
    			attr_dev(p1, "class", "date svelte-t8x4xt");
    			add_location(p1, file$4, 22, 4, 563);
    			attr_dev(div, "class", "post svelte-t8x4xt");
    			add_location(div, file$4, 11, 0, 249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t2);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t3);
    			append_dev(div, p0);
    			append_dev(p0, a);
    			append_dev(a, t4);
    			append_dev(div, t5);
    			append_dev(div, p1);
    			append_dev(p1, t6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*source*/ 1) set_data_dev(t0, /*source*/ ctx[0]);

    			if (/*text*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*item*/ ctx[2].attachments) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*item*/ 4) && t6_value !== (t6_value = new Date(/*item*/ ctx[2].date * 1000).toLocaleString("ru") + "")) set_data_dev(t6, t6_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { source } = $$props;
    	let { text } = $$props;
    	let { item } = $$props;
    	const postUrl = `https://vk.com/wall${item.source_id}_${item.post_id}`;
    	const writable_props = ["source", "text", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Post> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Post", $$slots, []);

    	$$self.$set = $$props => {
    		if ("source" in $$props) $$invalidate(0, source = $$props.source);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("item" in $$props) $$invalidate(2, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({ Attachment, source, text, item, postUrl });

    	$$self.$inject_state = $$props => {
    		if ("source" in $$props) $$invalidate(0, source = $$props.source);
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("item" in $$props) $$invalidate(2, item = $$props.item);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [source, text, item, postUrl];
    }

    class Post extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { source: 0, text: 1, item: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Post",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*source*/ ctx[0] === undefined && !("source" in props)) {
    			console.warn("<Post> was created without expected prop 'source'");
    		}

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<Post> was created without expected prop 'text'");
    		}

    		if (/*item*/ ctx[2] === undefined && !("item" in props)) {
    			console.warn("<Post> was created without expected prop 'item'");
    		}
    	}

    	get source() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set source(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Post>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Post>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Feed.svelte generated by Svelte v3.20.1 */
    const file$5 = "src\\components\\Feed.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (16:4) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[2].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$5, 16, 8, 392);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(16:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (12:4) {:then news}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*news*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*waitNewsLoaded*/ 1) {
    				each_value = /*news*/ ctx[1];
    				validate_each_argument(each_value);
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
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(12:4) {:then news}",
    		ctx
    	});

    	return block;
    }

    // (13:8) {#each news as newsItem, i}
    function create_each_block$1(ctx) {
    	let current;
    	const post_spread_levels = [/*newsItem*/ ctx[3]];
    	let post_props = {};

    	for (let i = 0; i < post_spread_levels.length; i += 1) {
    		post_props = assign(post_props, post_spread_levels[i]);
    	}

    	const post = new Post({ props: post_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(post.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(post, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const post_changes = (dirty & /*waitNewsLoaded*/ 1)
    			? get_spread_update(post_spread_levels, [get_spread_object(/*newsItem*/ ctx[3])])
    			: {};

    			post.$set(post_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(post.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(post.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(post, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(13:8) {#each news as newsItem, i}",
    		ctx
    	});

    	return block;
    }

    // (10:27)           <p>...loading</p>      {:then news}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...loading";
    			add_location(p, file$5, 10, 8, 232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(10:27)           <p>...loading</p>      {:then news}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 1,
    		error: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*waitNewsLoaded*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "feed svelte-1vwdc2p");
    			add_location(div, file$5, 8, 0, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let waitNewsLoaded = getNews();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Feed> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Feed", $$slots, []);
    	$$self.$capture_state = () => ({ getNews, Post, waitNewsLoaded });

    	$$self.$inject_state = $$props => {
    		if ("waitNewsLoaded" in $$props) $$invalidate(0, waitNewsLoaded = $$props.waitNewsLoaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [waitNewsLoaded];
    }

    class Feed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feed",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.20.1 */
    const file$6 = "src\\App.svelte";

    // (26:8) {#if isLoggedIn}
    function create_if_block_1$2(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Logout";
    			attr_dev(button, "id", "logout");
    			attr_dev(button, "class", "svelte-15p50br");
    			add_location(button, file$6, 26, 12, 573);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*handleLogoutClick*/ ctx[2], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(26:8) {#if isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {:catch error}
    function create_catch_block$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[4].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$6, 40, 8, 974);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(40:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (32:4) {:then}
    function create_then_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoggedIn*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(32:4) {:then}",
    		ctx
    	});

    	return block;
    }

    // (35:8) {:else}
    function create_else_block$1(ctx) {
    	let p;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			button = element("button");
    			button.textContent = "Log in VK";
    			attr_dev(button, "id", "login");
    			add_location(button, file$6, 36, 16, 850);
    			attr_dev(p, "class", "login-wrapper svelte-15p50br");
    			add_location(p, file$6, 35, 12, 808);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, p, anchor);
    			append_dev(p, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*handleLoginClick*/ ctx[3], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(35:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if isLoggedIn}
    function create_if_block$3(ctx) {
    	let current;
    	const feed = new Feed({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(feed.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(feed, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(feed.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(feed.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(feed, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(33:8) {#if isLoggedIn}",
    		ctx
    	});

    	return block;
    }

    // (30:27)          <p>...loading</p>     {:then}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "...loading";
    			add_location(p, file$6, 30, 8, 699);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(30:27)          <p>...loading</p>     {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let nav;
    	let t;
    	let promise;
    	let current;
    	let if_block = /*isLoggedIn*/ ctx[0] && create_if_block_1$2(ctx);

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		error: 4,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*waitIsLoggedIn*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			nav = element("nav");
    			if (if_block) if_block.c();
    			t = space();
    			info.block.c();
    			attr_dev(nav, "class", "svelte-15p50br");
    			add_location(nav, file$6, 24, 4, 530);
    			add_location(div, file$6, 23, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, nav);
    			if (if_block) if_block.m(nav, null);
    			append_dev(div, t);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*isLoggedIn*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(nav, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			{
    				const child_ctx = ctx.slice();
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let isLoggedIn;

    	let waitIsLoggedIn = (async () => {
    		$$invalidate(0, isLoggedIn = await getIsLoggedIn());
    	})();

    	function handleLogoutClick() {
    		logout().then(() => {
    			$$invalidate(0, isLoggedIn = false);
    		});
    	}

    	function handleLoginClick() {
    		login().then(isSuccessful => {
    			$$invalidate(0, isLoggedIn = isSuccessful);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		login,
    		logout,
    		getIsLoggedIn,
    		Feed,
    		isLoggedIn,
    		waitIsLoggedIn,
    		handleLogoutClick,
    		handleLoginClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("isLoggedIn" in $$props) $$invalidate(0, isLoggedIn = $$props.isLoggedIn);
    		if ("waitIsLoggedIn" in $$props) $$invalidate(1, waitIsLoggedIn = $$props.waitIsLoggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isLoggedIn, waitIsLoggedIn, handleLogoutClick, handleLoginClick];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
