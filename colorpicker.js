const $create = document.createElement.bind(document);

const $createCanv = (height, width) => {
  const canv = $create("canv");
  canv.height = height;
  canv.width = width;
}

class ColorPicker {
  constructor(pointer=null) {
    if (pointer) {
      this.pointer = $create("div")
    } else {
      this.pointer = null
    }
  }
}