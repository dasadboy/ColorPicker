const $ = document.querySelector.bind(document)
      $create = document.createElement.bind(document);

const $createCanv = (width, height) => {
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
  constructor(pointer=null, width=null, height=null, horizontal=null) {
    super(pointer);
    this.hor = !!horizontal;
    this.width = width || 50
    this.height = height | 512;
    // Picks hue
    this.hue = TwoBarPicker.renderHueBar(this.width, this.height);
    // Picks brightness
    this.brightness = TwoBarPicker.renderBrightnessBar(this.width, this.height);
  }
  static renderHueBar(w, h, hor) {
    const canv = $createCanv(w, h),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, w * !!hor, h * !hor),
          colors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f", "#f00"];

    const canvas = {
      elem: canv,
      ctx: ctx,
      pos: {
        x: 0,
        y: 0
      }
    }
    for (let i in colors) {
      grad.addColorStop(i*0.16 + 0.02, colors[i]);
    }
    canvas.ctx.fillStyle = grad;
    canvas.ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  static renderBrightnessBar(w, h, hor) {
    const canv = $createCanv(w, h),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, w * !!hor, h * !hor);

    const canvas = {
      elem: canv,
      ctx: ctx,
      pos: {
        x: w/2,
        y: h/2
      }
    }
    grad.addColorStop(0.01, "#fff");
    grad.addColorStop(0.5, "#f00");
    grad.addColorStop(0.99, "#000");
    canvas.ctx.fillStyle = grad;
    canvas.ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  bindHueBarListeners(brightCallback, callback=null) {
    const canvas = this.hue.elem,
          brightCanv = this.brightness.elem,
          brightPos = this.brightness.pos,
          brightCtx = this.brightness.ctx;

    const toHex = x => {
      let hex = x.toString(16);
      if (hex.length === 1) hex = "0" + hex;
      return hex;
    }

    const getColor = (x, y) => {
      let xCoord = Math.min(Math.max(x, 0), canvas.offsetWidth - 1),
          yCoord = Math.min(Math.max(y, 0), canvas.offsetHeight - 1);
      const ctx = canvas.getContext("2d"),
            imageData = ctx.getImageData(xCoord, yCoord, 1, 1).data;
      return `#${toHex(imageData[0])}${toHex(imageData[1])}`
      + `${toHex(imageData[2])}`;
    }

    const getBrightColor = (x, y) => {
      let xCoord = Math.min(Math.max(x, 0), brightCanv.offsetWidth - 1),
          yCoord = Math.min(Math.max(y, 0), brightCanv.offsetHeight - 1);
      const ctx = brightCanv.getContext("2d"),
            imageData = ctx.getImageData(xCoord, yCoord, 1, 1).data;
      return `#${toHex(imageData[0])}${toHex(imageData[1])}`
      + `${toHex(imageData[2])}`;
    }

    const update = c => {
      const grad = brightCtx.createLinearGradient(0, 0, this.width * !!this.hor,
        this.height * !this.hor)
      grad.addColorStop(0.01, "#fff");
      grad.addColorStop(0.5, c);
      grad.addColorStop(0.99, "#000")
      brightCtx.fillStyle = grad;
      brightCtx.fillRect(0, 0, this.width, this.height)
      brightCallback(getBrightColor(brightPos.x, brightPos.y))
    }

    const init = e => {
      const color = getColor(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
        canvas.offsetLeft,
        canvas.offsetTop
      );
      update(color);
      if (callback) callback(color);
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", end);
    }

    const drag = e => {
      const color = getColor(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop
      );
      update(color);
      if (callback) callback(color);
    }
    
    const end = e => {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", end);
      triggerDown();
      triggerUp();
    }

    this.hue.elem.addEventListener("mousedown", init);
  }
  bindBrightnessBarListeners(callback) {
    const canvas = this.brightness.elem,
          brightPos = this.brightness.pos;

    const toHex = x => {
      let hex = x.toString(16);
      if (hex.length === 1) hex = "0" + hex;
      return hex;
    }

    const getColor = (x, y) => {
      let xCoord = Math.min(Math.max(x, 0), canvas.offsetWidth - 1),
          yCoord = Math.min(Math.max(y, 0), canvas.offsetHeight - 1);
      const ctx = canvas.getContext("2d"),
            imageData = ctx.getImageData(xCoord, yCoord, 1, 1).data;
      brightPos.x = xCoord;
      brightPos.y = yCoord;
      return `#${toHex(imageData[0])}${toHex(imageData[1])}`
      + `${toHex(imageData[2])}`;
    }

    const init = e => {
      const color = getColor(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop
      );
      callback(color);
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", end);
      console.log("start")
    }

    const drag = e => {
      const color = getColor(
        e.pageX - canvas.offsetLeft,
        e.pageY - canvas.offsetTop,
      );
      callback(color);
    }
    
    const end = e => {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", end);
      console.log("end");
    }

    this.brightness.elem.addEventListener("mousedown", init);
  }
  bindListeners(brightnessCallback, hueCallback=null) {
    this.bindHueBarListeners(brightnessCallback, hueCallback);
    this.bindBrightnessBarListeners(brightnessCallback);
  }
}