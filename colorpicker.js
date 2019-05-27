const $createCanv = (width, height) => {
  const canv = $create("canvas");
  canv.height = height;
  canv.width = width;
  return canv;
}

class ColorPicker {
  constructor() {}
}

class TwoBarPicker extends ColorPicker {
  constructor(width=null, height=null, horizontal=null) {
    super()
    this.hor = !!horizontal;
    if (!this.hor) {
      this.width = width || 50;
      this.height = height || 512;
    } else {
      this.width = width || 512;
      this.height = height || 50;
    }
    // Picks hue
    this.hue = TwoBarPicker.renderHueBar(this.width, this.height, this.hor);
    // Picks brightness
    this.brightness = TwoBarPicker.renderBrightnessBar(this.width, this.height,
      this.hor);
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

    const getPosX = x => {
      let current = canvas;
      while (!!current) {
        x -= current.offsetLeft - current.scrollLeft;
        current = current.parentElement;
      }
      return x;
    }

    const getPosY = y => {
      let current = canvas;
      while (!!current) {
        y -= current.offsetTop - current.scrollTop;
        current = current.parentElement;
      }
      return y;
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
        getPosX(e.pageX),
        getPosY(e.pageY)
      );
      update(color);
      if (callback) callback(color);
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", end);
    }

    const drag = e => {
      const color = getColor(
        getPosX(e.pageX),
        getPosY(e.pageY)
      );
      update(color);
      if (callback) callback(color);
    }
    
    const end = () => {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", end);
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

    const getPosX = x => {
      let current = canvas;
      while (!!current.parentElement) {
        x -= current.offsetLeft - current.scrollLeft;
        current = current.parentElement;
      }
      return x;
    }

    const getPosY = y => {
      let current = canvas;
      while (!!current.parentElement) {
        y -= current.offsetTop - current.scrollTop;
        current = current.parentElement;
      }
      return y;
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
        getPosX(e.pageX),
        getPosY(e.pageY)
      );
      callback(color);
      window.addEventListener("mousemove", drag);
      window.addEventListener("mouseup", end);
    }

    const drag = e => {
      const color = getColor(
        getPosX(e.pageX),
        getPosY(e.pageY)
      );
      callback(color);
    }
    
    const end = () => {
      window.removeEventListener("mousemove", drag);
      window.removeEventListener("mouseup", end);
    }

    this.brightness.elem.addEventListener("mousedown", init);
  }
  bindListeners(brightnessCallback, hueCallback=null) {
    this.bindHueBarListeners(brightnessCallback, hueCallback);
    this.bindBrightnessBarListeners(brightnessCallback);
  }
}

class ThreeBarPicker extends ColorPicker {
  constructor(width=null, height=null, horizontal=null) {
    super()
    this.hor = !!horizontal;
    if (!this.hor) {
      this.width = width || 50;
      this.height = height || 512;
    } else {
      this.width = width || 512;
      this.height = height || 50;
    }
    this.red = ThreeBarPicker.renderRed(this.width, this.height, this.hor);
    this.blue = ThreeBarPicker.renderBlue(this.width, this.height, this.hor);
    this.green = ThreeBarPicker.renderGreen(this.width, this.height, this.hor);
  }
  static renderRed(w, h, hor) {
    const canv = $createCanv(w, h),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, w * !!hor, h * !hor),
          colors = ["#f00", "#000"];
    const canvas = {
      elem: canv,
      ctx: ctx,
      pos: {
        x: 0,
        y: 0
      },
      val: "ff"
    };
    for (let i in colors) {
      grad.addColorStop(i*0.98 + 0.01, colors[i]);
    }
    canvas.ctx.fillStyle = grad;
    canvas.ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  static renderBlue(w, h, hor) {
    const canv = $createCanv(w, h),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, w * !!hor, h * !hor),
          colors = ["#00f", "#000"];
    const canvas = {
      elem: canv,
      ctx: ctx,
      pos: {
        x: 0,
        y: 0
      },
      val: "ff"
    };
    for (let i in colors) {
      grad.addColorStop(i*0.98 + 0.02, colors[i]);
    }
    canvas.ctx.fillStyle = grad;
    canvas.ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  static renderGreen(w, h, hor) {
    const canv = $createCanv(w, h),
          ctx = canv.getContext("2d"),
          grad = ctx.createLinearGradient(0, 0, w * !!hor, h * !hor),
          colors = ["#0f0", "#000"];
    const canvas = {
      elem: canv,
      ctx: ctx,
      pos: {
        x: 0,
        y: 0
      },
      val: "ff"
    };

    for (let i in colors) {
      grad.addColorStop(i*0.98 + 0.01, colors[i]);
    }
    canvas.ctx.fillStyle = grad;
    canvas.ctx.fillRect(0, 0, w, h);
    return canvas;
  }
  bindListeners(callback, redCallback=null, greenCallback=null, blueCallback=null) {
    const bars = [
      [this.red, redCallback],
      [this.green, greenCallback],
      [this.blue, blueCallback]
    ];

    const max = Math.max.bind(Math),
          min = Math.min.bind(Math);

    const toHex = n => {
      let num = n.toString(16);
      if (num.length === 1) {
        num = "0" + num;
      }
      return num;
    }

    const getVal = (x, y, bar, i) => {
      const imageData = bar.ctx.getImageData(x, y, 1, 1).data;
      bar.val = toHex(imageData[i]);
      return bar.val;
    }

    const getColor = () => {
      let color = "#";
      for (let bar of bars) {
        color += bar[0].val;
      }
      return color;
    }

    const getPosX = (x, canvas) => {
      let current = canvas, totalOffset = 0;
      while (!!current.parentElement) {
        totalOffset += current.offsetLeft - current.scrollLeft;
        current = current.parentElement;
      }
      return min(max(0, x - totalOffset), this.width - 1);
    }

    const getPosY = (y, canvas) => {
      let current = canvas, totalOffset = 0;
      while (!!current.parentElement) {
        totalOffset += current.offsetTop - current.scrollTop;
        current = current.parentElement;
      }
      return min(max(0, y - totalOffset), this.height - 1);
    }

    const createListeners = index => {
      const [bar, barCallback] = bars[index];
      const init = e => {
        const x = getPosX(e.pageX, bar.elem),
              y = getPosY(e.pageY, bar.elem);
        bar.pos.x = x;
        bar.pos.y = y;
        barCallback(getVal(x, y, bar, index));
        callback(getColor());
        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", end);
      }

      const drag = e => {
        const x = getPosX(e.pageX, bar.elem),
              y = getPosY(e.pageY, bar.elem);
        bar.pos.x = x;
        bar.pos.y = y;
        barCallback(getVal(x, y, bar, index));
        callback(getColor());
        getColor();
      }

      const end = () => {
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("mouseup", end);
      }

      bar.elem.addEventListener("mousedown", init);
    }

    for (let i in bars) {
      createListeners(i);
    }
  }
}