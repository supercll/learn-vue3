var VueRuntimeDOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    LifeCycle: () => LifeCycle,
    ReactiveEffect: () => ReactiveEffect,
    Text: () => Text,
    computed: () => computed,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    effect: () => effect,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    onBeforeMount: () => onBeforeMount,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    shallowRef: () => shallowRef,
    watch: () => watch
  });

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isFunction = (value) => {
    return typeof value === "function";
  };
  var isString = (value) => {
    return typeof value === "string";
  };
  var isArray = Array.isArray;
  var isNumber = (value) => {
    return typeof value === "number";
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
  function invokerFns(fns) {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
  }

  // packages/runtime-core/src/createVNode.ts
  var Text = Symbol("Text");
  var Fragment = Symbol("Fragment");
  function isVnode(val) {
    return !!val.__v_isVNode;
  }
  function isSameVNode(v1, v2) {
    return v1.type === v2.type && v1.key == v2.key;
  }
  function createVNode(type, props = null, children = null) {
    let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0;
    const vnode = {
      __v_isVNode: true,
      type,
      props,
      children,
      key: props && props.key,
      el: null,
      shapeFlag
    };
    if (children) {
      let temp = 0;
      if (Array.isArray(children)) {
        temp = ShapeFlags.ARRAY_CHILDREN;
      } else if (isObject(children)) {
        temp = ShapeFlags.SLOTS_CHILDREN;
      } else {
        children = String(children);
        temp = ShapeFlags.TEXT_CHILDREN;
      }
      vnode.shapeFlag |= temp;
    }
    return vnode;
  }
  var ShapeFlags = /* @__PURE__ */ ((ShapeFlags2) => {
    ShapeFlags2[ShapeFlags2["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags2[ShapeFlags2["FUNCTIONAL_COMPONENT"] = 2] = "FUNCTIONAL_COMPONENT";
    ShapeFlags2[ShapeFlags2["STATEFUL_COMPONENT"] = 4] = "STATEFUL_COMPONENT";
    ShapeFlags2[ShapeFlags2["TEXT_CHILDREN"] = 8] = "TEXT_CHILDREN";
    ShapeFlags2[ShapeFlags2["ARRAY_CHILDREN"] = 16] = "ARRAY_CHILDREN";
    ShapeFlags2[ShapeFlags2["SLOTS_CHILDREN"] = 32] = "SLOTS_CHILDREN";
    ShapeFlags2[ShapeFlags2["TELEPORT"] = 64] = "TELEPORT";
    ShapeFlags2[ShapeFlags2["SUSPENSE"] = 128] = "SUSPENSE";
    ShapeFlags2[ShapeFlags2["COMPONENT_SHOULD_KEEP_ALIVE"] = 256] = "COMPONENT_SHOULD_KEEP_ALIVE";
    ShapeFlags2[ShapeFlags2["COMPONENT_KEPT_ALIVE"] = 512] = "COMPONENT_KEPT_ALIVE";
    ShapeFlags2[ShapeFlags2["COMPONENT"] = 6] = "COMPONENT";
    return ShapeFlags2;
  })(ShapeFlags || {});

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function cleanEffect(effect2) {
    let deps = effect2.deps;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.parent = null;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      } else {
        try {
          this.parent = activeEffect;
          activeEffect = this;
          cleanEffect(this);
          return this.fn();
        } finally {
          activeEffect = this.parent;
          this.parent = null;
        }
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        cleanEffect(this);
      }
    }
  };
  var targetMap = /* @__PURE__ */ new WeakMap();
  function trigger(target, key, value) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = depsMap.get(key);
    triggerEffects(effects);
  }
  function triggerEffects(effects) {
    if (effects) {
      const newEffects = new Set(effects);
      newEffects.forEach((effect2) => {
        if (effect2 !== activeEffect) {
          if (effect2.scheduler) {
            effect2.scheduler();
          } else {
            effect2.run();
          }
        }
      });
    }
  }
  function track(target, key) {
    if (activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let deps = depsMap.get(key);
      if (!deps) {
        depsMap.set(key, deps = /* @__PURE__ */ new Set());
      }
      trackEffects(deps);
    }
  }
  function trackEffects(deps) {
    if (!activeEffect)
      return;
    let shouldTrack = !deps.has(activeEffect);
    if (shouldTrack) {
      deps.add(activeEffect);
      activeEffect.deps.push(deps);
    }
  }
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }

  // packages/reactivity/src/baseHandler.ts
  function isReactive(value) {
    return value && value["__v_isReactive" /* IS_REACTIVE */];
  }
  var baseHandler = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, key);
      let res = Reflect.get(target, key, receiver);
      if (isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      let oldValue = target[key];
      if (oldValue !== value) {
        let result = Reflect.set(target, key, value, receiver);
        trigger(target, key, value);
        return result;
      }
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return target;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const existing = reactiveMap.get(target);
    if (existing) {
      return existing;
    }
    const proxy = new Proxy(target, baseHandler);
    reactiveMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  function computed(getterOrOptions) {
    let isGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    const fn = () => console.warn("computed is readonly ");
    if (isGetter) {
      getter = getterOrOptions;
      setter = fn;
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set || fn;
    }
    return new ComputedRefImpl(getter, setter);
  }
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.setter = setter;
      this._dirty = true;
      this.effect = new ReactiveEffect(getter, () => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.deps);
        }
      });
    }
    get value() {
      if (activeEffect) {
        trackEffects(this.deps || (this.deps = /* @__PURE__ */ new Set()));
      }
      if (this._dirty) {
        this._dirty = false;
        this._value = this.effect.run();
      }
      return this._value;
    }
    set value(newValues) {
      this.setter(newValues);
    }
  };

  // packages/reactivity/src/watch.ts
  function traversal(value, set = /* @__PURE__ */ new Set()) {
    if (!isObject(value)) {
      return value;
    }
    if (set.has(value)) {
      return value;
    }
    set.add(value);
    for (let key in value) {
      traversal(value[key], set);
    }
    return value;
  }
  function watch(source, cb) {
    let get;
    if (isReactive(source)) {
      get = () => traversal(source);
    } else if (isFunction(source)) {
      get = source;
    }
    let oldValue;
    let cleanup;
    const onCleanup = (fn) => {
      cleanup = fn;
    };
    const job = () => {
      cleanup && cleanup();
      let newValue = effect2.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    };
    const effect2 = new ReactiveEffect(get, job);
    oldValue = effect2.run();
  }

  // packages/reactivity/src/ref.ts
  function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  }
  function createRef(rawValue, shallow) {
    return new RefImpl(rawValue, shallow);
  }
  function ref(value) {
    return createRef(value, false);
  }
  function shallowRef(value) {
    return createRef(value, true);
  }
  function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
      get(target, key, receiver) {
        let v = Reflect.get(target, key, receiver);
        return v.__v_isRef ? v.value : v;
      },
      set(target, key, value, receiver) {
        const oldValue = target[key];
        if (oldValue.__v_isRef) {
          oldValue.value = value;
          return true;
        } else {
          return Reflect.set(target, key, value, receiver);
        }
      }
    });
  }
  var RefImpl = class {
    constructor(rawValue, _shallow) {
      this.rawValue = rawValue;
      this._shallow = _shallow;
      this.__v_isRef = true;
      this._value = _shallow ? rawValue : toReactive(rawValue);
    }
    get value() {
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      return this._value;
    }
    set value(newValue) {
      if (newValue != this.rawValue) {
        this._value = toReactive(newValue);
        this.rawValue = newValue;
        triggerEffects(this.dep);
      }
    }
  };

  // packages/runtime-core/src/h.ts
  function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVnode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l === 3 && isVnode(children)) {
        children = [children];
      } else if (l > 3) {
        children = Array.from(arguments).slice(2);
      }
      return createVNode(type, propsOrChildren, children);
    }
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    const len = arr.length;
    const indexResult = [0];
    const tmpArr = [];
    let resultLastIndex;
    let start;
    let end;
    let mid = 0;
    for (let i2 = 0; i2 < len; i2++) {
      const arrItem = arr[i2];
      if (arrItem !== 0) {
        resultLastIndex = indexResult[indexResult.length - 1];
        if (arr[resultLastIndex] < arrItem) {
          tmpArr[i2] = resultLastIndex;
          indexResult.push(i2);
          console.log(arrItem, i2, resultLastIndex, indexResult, tmpArr);
          continue;
        }
        console.log(arrItem, i2, resultLastIndex, indexResult, tmpArr);
        start = 0;
        end = indexResult.length - 1;
        while (start < end) {
          mid = Math.floor((end + start) / 2);
          if (arr[indexResult[mid]] < arrItem) {
            start = mid + 1;
          } else {
            end = mid;
          }
        }
        const oldArrItem = arr[indexResult[start]] || -Infinity;
        if (arrItem < oldArrItem) {
          tmpArr[i2] = indexResult[start - 1];
          indexResult[start] = i2;
        }
      }
    }
    let i = indexResult.length;
    let lastIndex = indexResult[i - 1];
    while (i-- > 0) {
      console.log(i, lastIndex, tmpArr[lastIndex]);
      indexResult[i] = lastIndex;
      lastIndex = tmpArr[lastIndex];
    }
    console.log("valueArr: ", indexResult.map((itemIndex) => {
      return arr[itemIndex];
    }));
    return indexResult;
  }

  // packages/runtime-core/src/component.ts
  var instance = null;
  var getCurrentInstance = () => instance;
  var setCurrentInstance = (i) => instance = i;
  function createComponentInstance(vnode) {
    let instance2 = {
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      render: null,
      propsOptions: vnode.type.props || {},
      props: {},
      attrs: {},
      proxy: null,
      slots: null
    };
    return instance2;
  }
  function initSlots(instance2, children) {
    if (instance2.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
      instance2.slots = children;
    } else {
      instance2.slots = {};
    }
  }
  function initProps(instance2, rawProps) {
    const props = {};
    const attrs = {};
    const options = instance2.propsOptions;
    if (rawProps) {
      for (let key in rawProps) {
        const value = rawProps[key];
        if (key in options) {
          props[key] = value;
        } else {
          attrs[key] = value;
        }
      }
    }
    instance2.props = reactive(props);
    instance2.attrs = attrs;
  }
  var publicProperties = {
    $attrs: (instance2) => instance2.attrs,
    $slots: (i) => i.slots
  };
  var instanceProxy = {
    get(target, key) {
      const { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        return data[key];
      } else if (setupState && hasOwn(setupState, key)) {
        return setupState[key];
      } else if (props && hasOwn(props, key)) {
        return props[key];
      }
      let getter = publicProperties[key];
      if (getter) {
        return getter(target);
      }
    },
    set(target, key, value, receiver) {
      const { data, props, setupState } = target;
      if (data && hasOwn(data, key)) {
        data[key] = value;
      } else if (setupState && hasOwn(setupState, key)) {
        setupState[key] = value;
      } else if (props && hasOwn(props, key)) {
        console.warn("props not update");
        return false;
      }
      return true;
    }
  };
  function setupComponent(instance2) {
    const { type, props, children } = instance2.vnode;
    let { data, render: render2 } = type;
    initProps(instance2, props);
    initSlots(instance2, children);
    let { setup } = type;
    if (setup) {
      const setupContext = {};
      setCurrentInstance(instance2);
      const setupResult = setup(instance2.props, setupContext);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance2.render = setupResult;
      } else if (isObject(setupResult)) {
        instance2.setupState = proxyRefs(setupResult);
      }
    }
    instance2.proxy = new Proxy(instance2, instanceProxy);
    if (data) {
      if (!isFunction(data))
        return console.warn("The data option must be a function.");
      instance2.data = reactive(data.call(instance2.proxy));
    }
    if (!instance2.render) {
      instance2.render = render2;
    }
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderer(options) {
    let {
      createElement: hostCreateElement,
      createTextNode: hostCreateTextNode,
      insert: hostInsert,
      remove: hostRemove,
      querySelector: hostQuerySelector,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      setText: hostSetText,
      setElementText: hostSetElementText,
      patchProp: hostPatchProp
    } = options;
    function normalize(children, i) {
      if (isString(children[i]) || isNumber(children[i])) {
        children[i] = createVNode(Text, null, children[i]);
      }
      return children[i];
    }
    function mountChildren(children, container) {
      for (let i = 0; i < children.length; i++) {
        let child = normalize(children, i);
        patch(null, child, container);
      }
    }
    function patchProps(oldProps, newProps, el) {
      if (oldProps == null)
        oldProps = {};
      if (newProps == null)
        newProps = {};
      for (let key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (let key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
    function mountElement(vnode, container, anchor) {
      let { type, props, children, shapeFlag } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        patchProps(null, props, el);
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      }
      if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    }
    function mountComponent(vnode, container, anchor) {
      const instance2 = vnode.component = createComponentInstance(vnode);
      setupComponent(instance2);
      setupRenderEffect(instance2, container, anchor);
    }
    function patchKeyedChildren(c1, c2, el) {
      let index = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (index <= e1 && index <= e2) {
        const n1 = c1[index];
        const n2 = c2[index];
        if (isSameVNode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        index++;
      }
      console.log(index, e1, e2);
      while (index <= e1 && index <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVNode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (index > e1) {
        if (index <= e2) {
          while (index <= e2) {
            const nextPos = e2 + 1;
            let anchor = c2.length <= nextPos ? null : c2[nextPos].el;
            patch(null, c2[index], el, anchor);
            index++;
          }
        }
      } else if (index > e2) {
        if (index <= e1) {
          while (index <= e1) {
            unmount(c1[index]);
            index++;
          }
        }
      } else {
        let s1 = index;
        let s2 = index;
        let toBePatched = e2 - s2 + 1;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        for (let i = s2; i <= e2; i++) {
          keyToNewIndexMap.set(c2[i].key, i);
        }
        const seq = new Array(toBePatched).fill(0);
        for (let i = s1; i <= e1; i++) {
          const oldVNode = c1[i];
          let newIndex = keyToNewIndexMap.get(oldVNode.key);
          if (newIndex == null) {
            unmount(oldVNode);
          } else {
            seq[newIndex - s2] = i + 1;
            patch(oldVNode, c2[newIndex], el);
          }
        }
        let incr = getSequence(seq);
        let j = incr.length - 1;
        for (let i = toBePatched - 1; i >= 0; i--) {
          const currentIndex = s2 + i;
          const child = c2[currentIndex];
          const anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
          if (seq[i] === 0) {
            patch(null, child, el, anchor);
          } else {
            if (i !== incr[j]) {
              hostInsert(child.el, el, anchor);
            } else {
              j--;
            }
          }
        }
      }
    }
    function patchChildren(n1, n2, el) {
      let c1 = n1.children;
      let c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    }
    function patchElement(n1, n2) {
      let el = n2.el = n1.el;
      let oldProps = n1.props;
      let newProps = n2.props;
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el);
    }
    function processText(n1, n2, container) {
      if (n1 == null) {
        hostInsert(n2.el = hostCreateTextNode(n2.children), container);
      } else {
        const el = n2.el = n1.el;
        let newText = n2.children;
        if (newText !== n1.children) {
          hostSetText(el, newText);
        }
      }
    }
    function processElement(n1, n2, container, anchor) {
      if (n1 == null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    }
    function processFragment(n1, n2, container) {
      if (n1 == null) {
        mountChildren(n2.children, container);
      } else {
        patchKeyedChildren(n1.children, n2.children, container);
      }
    }
    function updateComponentPreRender(instance2, next) {
      instance2.next = null;
      instance2.vnode = next;
      updateProps(instance2, instance2.props, next.props);
    }
    function setupRenderEffect(instance2, container, anchor) {
      const componentUpdate = () => {
        const { render: render3, data } = instance2;
        if (!instance2.isMounted) {
          const { bm, m } = instance2;
          if (bm) {
            invokerFns(bm);
          }
          const subTree = render3.call(instance2.proxy);
          patch(null, subTree, container, anchor);
          instance2.subTree = subTree;
          instance2.isMounted = true;
          if (m) {
            invokerFns(m);
          }
        } else {
          let next = instance2.next;
          if (next) {
            updateComponentPreRender(instance2, next);
          }
          const subTree = render3.call(instance2.proxy);
          patch(instance2.subTree, subTree, container, anchor);
          if (instance2.u) {
            invokerFns(instance2.u);
          }
          instance2.subTree = subTree;
        }
      };
      const effect2 = new ReactiveEffect(componentUpdate);
      let update = instance2.update = effect2.run.bind(effect2);
      update();
    }
    function hasChange(prevProps, nextProps) {
      for (let key in nextProps) {
        if (nextProps[key] != prevProps[key]) {
          return true;
        }
      }
      return false;
    }
    function updateProps(instance2, prevProps, nextProps) {
      for (let key in nextProps) {
        instance2.props[key] = nextProps[key];
      }
      for (let key in instance2.props) {
        if (!(key in nextProps)) {
          delete instance2.props[key];
        }
      }
    }
    function shouldComponentUpdate(n1, n2) {
      const prevProps = n1.props;
      const nextProps = n2.props;
      return hasChange(prevProps, nextProps);
    }
    function updateComponent(n1, n2) {
      const instance2 = n2.component = n1.component;
      if (shouldComponentUpdate(n1, n2)) {
        instance2.next = n2;
        instance2.update();
      } else {
        instance2.vnode = n2;
      }
    }
    function processComponent(n1, n2, container, anchor) {
      if (n1 == null) {
        mountComponent(n2, container, anchor);
      } else {
        updateComponent(n1, n2);
      }
    }
    function unmount(n1) {
      if (n1.type == Fragment) {
        return unmountChildren(n1.children);
      }
      hostRemove(n1.el);
    }
    function unmountChildren(children) {
      children.forEach((child) => {
        unmount(child);
      });
    }
    function patch(n1, n2, container, anchor = null) {
      if (n1 && !isSameVNode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor);
          } else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
      }
    }
    function render2(vnode, container) {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    }
    return {
      render: render2
    };
  }

  // packages/runtime-core/src/apiLifecycle.ts
  var LifeCycle = /* @__PURE__ */ ((LifeCycle2) => {
    LifeCycle2["BEFORE_MOUNT"] = "bm";
    LifeCycle2["MOUNTED"] = "m";
    LifeCycle2["UPDATED"] = "u";
    return LifeCycle2;
  })(LifeCycle || {});
  function createInvoker(type) {
    return function(hook, currentInstance = instance) {
      if (currentInstance) {
        const lifeCycles = currentInstance[type] || (currentInstance[type] = []);
        const wrapHook = () => {
          setCurrentInstance(currentInstance);
          hook.call(currentInstance);
          setCurrentInstance(null);
        };
        lifeCycles.push(wrapHook);
      }
    };
  }
  var onBeforeMount = createInvoker("bm" /* BEFORE_MOUNT */);
  var onMounted = createInvoker("m" /* MOUNTED */);
  var onUpdated = createInvoker("u" /* UPDATED */);

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createTextNode(text) {
      return document.createTextNode(text);
    },
    insert(element, container, anchor = null) {
      container.insertBefore(element, anchor);
    },
    remove(child) {
      const parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    },
    querySelector(selectors) {
      return document.querySelector(selectors);
    },
    parentNode(child) {
      return child.parentNode;
    },
    nextSibling(child) {
      return child.nextSibling;
    },
    setText(element, text) {
      element.nodeValue = text;
    },
    setElementText(element, text) {
      element.textContent = text;
    }
  };

  // packages/runtime-dom/src/patch-prop/patchAttr.ts
  function patchAttr(el, key, nextValue) {
    if (nextValue == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextValue);
    }
  }

  // packages/runtime-dom/src/patch-prop/patchClass.ts
  function patchClass(el, nextValue) {
    if (nextValue == null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/patch-prop/patchEvent.ts
  function createInvoker2(preValue) {
    const invoker = (e) => {
      invoker.value(e);
    };
    invoker.value = preValue;
    return invoker;
  }
  function patchEvent(el, eventName, nextValue) {
    const invokers = el._vei || (el._vei = {});
    const exitingInvoker = invokers[eventName];
    if (exitingInvoker && nextValue) {
      exitingInvoker.value = nextValue;
    } else {
      const eName = eventName.slice(2).toLowerCase();
      if (nextValue) {
        const invoker = createInvoker2(nextValue);
        invokers[eventName] = invoker;
        el.addEventListener(eName, invoker);
      } else if (exitingInvoker) {
        el.removeEventListener(eName, exitingInvoker);
        invokers[eventName] = null;
      }
    }
  }

  // packages/runtime-dom/src/patch-prop/patchStyle.ts
  function patchStyle(el, preValue, nextValue) {
    if (preValue == null)
      preValue = {};
    if (nextValue == null)
      nextValue = {};
    const style = el.style;
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
    if (preValue) {
      for (let key in preValue) {
        if (nextValue[key] == null) {
          style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/patchProp.ts
  var patchProp = (el, key, preValue, nextValue) => {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, preValue, nextValue);
    } else if (/on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  };

  // packages/runtime-dom/src/index.ts
  var renderOptions = __spreadValues({ patchProp }, nodeOps);
  function render(vnode, container) {
    let { render: render2 } = createRenderer(renderOptions);
    return render2(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
