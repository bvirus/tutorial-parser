registerBlock(0, function({ listItems$ }, mount) {
  let ref1 = getBlock$(1, props.listItems$);
  // use shadow dom to attach the blocks -- give them a section of the dom that's just
  // for them
});

registerBlock(1, function(props) {
  return (<p>{props.key}</p>)
});


function renderList(listItems$) {
	let out = output();
	let ul = out.ul();
	
	listItems$.subscribe(x => {
		let items = x.map(x => x.test).map(x => create('li', {}, x));
		ul.writeList(items)
	});
	
	return out;
}