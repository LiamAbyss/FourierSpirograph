fetch('examples.json').then(res => {
  return res.json()
}).then(jsonFile => {
  const table = document.getElementById('table')
  let text = ''
  jsonFile.forEach(elt => {
    text += `<tr onclick="importExample('example/${elt.name}');"><td>${elt.name}</td><td><img src='example/img/${elt.name}'/></td></tr>`
  })
  table.innerHTML = text
})
