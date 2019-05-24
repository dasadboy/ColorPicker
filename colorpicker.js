const $ = document.querySelector.bind(document)
      $create = document.createElement.bind(document);

const $createCanv = (height, width) => {
  const canv = $create("canvas");
  canv.height = height;
  canv.width = width;
  return canv;
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

class TwoBarPicker extends ColorPicker {
  constructor(pointer=null, height=null, width=null, horizontal=null) {
    super(pointer);
    // Picks hue
    this.hue = TwoBarPicker.renderHueBar(height, width, !!horizontal);
    // Picks brightness
    this.brightness = TwoBarPicker.renderBrightnessBar(width, height, horizontal);
  }
  static renderHueBar(h, w, hor) {
    const height = h || 512,
          width = w || 50;
    const canv = $createCanv(height, width),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, width * hor, height * !hor),
          colors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f", "#f00"];
    console.log(height * !hor);
    for (let i in colors) {
      grad.addColorStop(i/6, colors[i]);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return canv;
  }
  static renderBrightnessBar(w, h, hor, hue) {
    const height = h || 512,
          width = w || 50;
    const canv = $createCanv(height, width),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, width * hor, height * !hor);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(0.5, "#f00");
    grad.addColorStop(1, "#000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return canv;
  }
}