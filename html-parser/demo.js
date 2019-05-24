function todoReducer(action, store = []) {
  switch(action.type) {
    case 'ADD_TODO': return store.concat([action.todo]);
    default: return store;
  }
}

let [todos, dispatch] = store(todoReducer);

// let [todos, updater] = storeArray([]);
function inputPanel(root) {
  let input  = addElement(root, 'input', { type: 'text' });
  let button = addElement(root, 'button', { textContent: 'Add Todo'}); 
  
  let click$ = fromEvent(button, 'click')
  let input$ = map(fromEvent(input, 'input'), ev => { 
    return ev.target.value
  })
  
  return buffer(input$, click$);
}

function renderTodos(root, { todos }) {
  let input = inputPanel(root);
  let ul     = addElement(root, 'ul');
    
  function writeTodos(items) {
    ul.innerHTML = items.reduce(
      (prev, todo) => prev + `<li>${todo}</li>`, "");
  }
  todos.listen(writeTodos)
  return { input }
}

let { input } = renderTodos(document.querySelector("#root"), {todos})
input.listen(todo => {
  dispatch({ type: 'ADD_TODO', todo });
});