registerBlock(0, function({ listItems$ }, mount) {
  let ref1 = getBlock$(1, props.listItems$);
  // use shadow dom to attach the blocks -- give them a section of the dom that's just
  // for them
});

registerBlock(1, function(props) {
  return (<p>{props.key}</p>)
})