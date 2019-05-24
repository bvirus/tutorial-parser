function stream(src) {
  let unsub = null;
  
  function ignore() { unsub() };
  function listen(l) { unsub = src(l) }
  return { listen, ignore }
}

function fromEvent(domNode, event) {
  return stream((next) => {
    let dispatch = (...args) => next(...args);
    domNode.addEventListener(event, dispatch);
    return () => { domNode.removeEventListener(event, dispatch) };
  });
}

function buffer(a, b) {
  return stream((next) => {
    let buf = [];
    a.listen((...args) => buf = args);
    b.listen(() => next(...buf));
  });
}

function map(src, f) {
  return stream(next => {
    return src.listen((...args) => next(f(...args)));
  })
}


function addElement(root, name, attr = {}) {
  let x = document.createElement(name);
  if (attr.textContent) {
    x.textContent = attr.textContent;
    delete attr.textContent;
  }
  Object.keys(attr).forEach(key => x.setAttribute(key, attr[key]))
  root.appendChild(x);
  return x;
}


function storeArray(arr = []) {
  let listeners = [];
  
  let updateStream = stream(l => {
    listeners.push(l);
    l(arr);
    return () => {
      let i = listeners.indexOf(l);
      listeners.splice(i,i);
    }
  });
  
  function notifyListeners() {
    listeners.forEach(l => l(arr));
  }
  
  function arrayProxy(method) {
    return (...args) => {
      arr[method](...args);
      notifyListeners();
    }
  }
  
  return [updateStream, { 
    push: arrayProxy('push'),
    splice: arrayProxy('splice')
  }];
}

function store(reducer, store = undefined) {
  let listeners = [];
  let updates = stream(next => {
    listeners.push(next)
    if (store !== undefined) next(store)
  });
  
  function dispatch(action) {
    store = reducer(action, store);
    listeners.forEach(l => l(store));
  }
  
  return [updates, dispatch]
}

function todoReducer(action, store = []) {
  switch(action.type) {
    case 'ADD_TODO': return store.concat([action.item]);
    case 'RESET': return [];
    default: return store;
  }
}

// let [stream, dispatch] = store(reducer);
