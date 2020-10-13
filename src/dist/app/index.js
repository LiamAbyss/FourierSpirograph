
window.onload = () => {
  function previewImage () {
    var oFReader = new FileReader()
    oFReader.readAsDataURL(document.getElementById('uploadImage').files[0])

    oFReader.onload = function (oFREvent) {
      document.getElementById('uploadedImage').src = oFREvent.target.result
    }
  };
  const fileInput = document.getElementById('uploadImage')
  fileInput.addEventListener('input', previewImage)

  const slider = document.getElementById('thresholdSlider')

  // eslint-disable-next-line no-undef
  noUiSlider.create(slider, {
    start: [0, 1],
    step: 0.01,
    connect: true,
    range: {
      min: 0,
      max: 1
    }
  })
  slider.noUiSlider.on('update', () => {
    const lt = document.getElementById('lt')
    const ut = document.getElementById('ut')
    lt.innerText = `Lower threshold : ${slider.noUiSlider.get()[0]}`
    ut.innerText = `Upper threshold : ${slider.noUiSlider.get()[1]}`
  })
}
