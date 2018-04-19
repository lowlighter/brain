PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
const app = new PIXI.Application({height:600, width:1000, transparent:true})
document.body.appendChild(app.view)

class Player {
  constructor(normal, saiyan, attack_start, attack_end, attack_middle, s) {
    this.textures = {normal, saiyan, attack_start, attack_end, attack_middle, s}
    this.sprite_init(normal, attack_start, attack_end, attack_middle, s)
    this.score = 0
    this.nscore = 0
  }

  sprite_init() {
    let sprite = this.sprite = new PIXI.extras.AnimatedSprite(this.textures.normal.map(frame => PIXI.Texture.fromFrame(frame)))
    sprite.animationSpeed = 0.05
    sprite.play()
    sprite.scale.set(2)
    sprite.anchor.set(0.5)
    app.stage.addChild(sprite)

    let sprite1 = this.sprite1 = new PIXI.extras.AnimatedSprite(this.textures.attack_start.map(frame => PIXI.Texture.fromFrame(frame)))
    sprite1.animationSpeed = 0.15
    sprite1.play()
    sprite1.anchor.x = this.textures.s < 0 ? 1 : 0
    app.stage.addChild(sprite1)

    let sprite12 = this.sprite12 = new PIXI.Sprite.fromFrame(this.textures.attack_middle)
    sprite12.anchor.x = this.textures.s < 0 ? 1 : 0
    app.stage.addChild(sprite12)

    let sprite2 = this.sprite2 = new PIXI.extras.AnimatedSprite(this.textures.attack_end.map(frame => PIXI.Texture.fromFrame(frame)))
    sprite2.animationSpeed = 0.15
    sprite2.play()

    sprite2.anchor.x = this.textures.s < 0 ? 1 : 0
    app.stage.addChild(sprite2)
    app.ticker.add(() => {
      this.sprite12.width = this.nscore||0 + 2
      this.sprite2.position.set(this.sprite12.x+this.textures.s*(this.sprite12.width - 2), this.sprite12.y)
      this.sprite4.text = Math.floor(this.score)
      this.sprite4.position.x = -this.sprite4.width/2
      this.sprite42.text = this.score.toFixed(3).match(/(\..*)$/)[1]
      this.sprite42.position.set(14*this.sprite4.text.length, 10)
    })

    let sprite3 = this.sprite3 = new PIXI.extras.AnimatedSprite(["60.png", "61.png"].map(frame => PIXI.Texture.fromFrame(frame)))
    sprite3.animationSpeed = 0.15
    sprite3.anchor.set(0.5, 1)
    sprite3.y = 35
    sprite3.play()
    this.sprite.addChild(sprite3)
    sprite3.alpha = 0.5
    sprite3.visible = false

    let sprite4 = this.sprite4 = new PIXI.Text("1000", {fontSize:24, fontWeight:"bold"})
    sprite4.scale.set(0.5)
    this.sprite.addChild(sprite4)
    sprite4.position.set(0, 32)

    let sprite42 = this.sprite42 = new PIXI.Text(".000", {fontSize:14, fontWeight:"bold"})
    this.sprite4.addChild(sprite42)
    sprite42.position.set(16, 10)
    sprite42.alpha = 0.6
  }

  position_init() {
    this.sprite1.position.set(this.sprite.x+(this.textures.s*this.sprite.width/2), this.sprite.y-this.sprite.height/4)
    this.sprite12.position.set(this.sprite1.x+this.textures.s*(this.sprite1.width), this.sprite1.y)
    this.sprite2.position.set(this.sprite12.x+this.textures.s*(this.sprite12.width - 2), this.sprite12.y)
  }

  set saiyan(v) {
    this._saiyan = v
    this.sprite.textures = (v ? this.textures.saiyan : this.textures.normal).map(frame => PIXI.Texture.fromFrame(frame))
    this.sprite.play()
    this.sprite3.visible = v
  }

  get saiyan() {
    return !!this._saiyan
  }
}

class Goku extends Player {
  constructor() {
    super(["00.png", "01.png"], ["40.png", "41.png"], ["10.png", "11.png"], ["13.png", "14.png"], "12.png", 1)
    this.sprite.position.set(this.sprite.width, app.view.height/2)
    this.position_init()
  }
}

class Vegeta extends Player {
  constructor() {
    super(["20.png", "21.png"], ["50.png", "51.png"], ["30.png", "31.png"], ["33.png", "34.png"], "32.png", -1)
    this.sprite.position.set(app.view.width - this.sprite.width, app.view.height/2)
    this.position_init()
  }
}


app.loader.onComplete.add(() => {
  const bg = new PIXI.Sprite.fromFrame("bg.png")
  bg.alpha = 0.7
  bg.height = app.view.height
  bg.width = app.view.width
  app.stage.addChild(bg)

  app.stage.interactive = true
  app.stage.click = () => { if (win.won) reset() }

  const goku = new Goku()
  window.goku = goku
  const vegeta = new Vegeta()
  window.vegeta = vegeta

  const text = new PIXI.Text("", {fontSize:32, fontWeight:"bold", fill:"#ead61c", align:"center"})
  app.stage.addChild(text)
  text.position.y = 450

  function setText(t) {
    text.text = t
    text.position.x = (app.view.width-text.width)/2
    text.alpha = 1
  }

  function win() {
    if (goku.score > win.pts) { goku.saiyan = true ; setText("Goku a gagné la partie !\nCliquez pour rejouer") }
    if (vegeta.score > win.pts) { vegeta.saiyan = true ; setText("Végéta gagné la partie !\nCliquez pour rejouer") }
    win.won = true
  }
  win.won = true
  win.pts = 9000

  function update(scores, force) {
    if ((win.won)&&(!force)) return
    const power = scores[0] + scores[1]
    goku.score += update.max * scores[0]/(power||1)
    vegeta.score += update.max * scores[1]/(power||1)

    let mx = Math.max(goku.score, vegeta.score)||1
    goku.nscore = 365 * Math.abs(0.5 + (goku.score-vegeta.score)/mx/2)
    vegeta.nscore = 365 * Math.abs(0.5 + (vegeta.score-goku.score)/mx/2)
    if ((goku.score > win.pts)||(vegeta.score > win.pts)) win()
  }
  update.max = 9


  function reset() {
    clearInterval(reset.interval)
    reset.t = 3
    goku.score = 0
    vegeta.score = 0
    goku.saiyan = false
    vegeta.saiyan = false
    update([0, 0], true)
    reset.interval = setInterval(() => {
      setText(reset.t)
      reset.t--
      if (reset.t < 0) {
        clearInterval(reset.interval)
        setText("C'est parti !")
        win.won = false ;
        setTimeout(() => { setText("") ; text.alpha = 0 }, 1600)
      }
    }, 1000)
  }

  setText("Cliquez pour jouer")
  update([0, 0], true)
  window.update = update
  window.reset = reset

})
app.loader.add("sprites/textures.json").load()

//Websocket connection
  const ws = new WebSocket(`ws://${(window.location.href.match(/\d+\.\d+\.\d+\.\d+/)||["localhost"])[0]}:3001`)
  let prefered, a = 1, b = 1
  ws.onmessage = event => {
    const data = JSON.parse(event.data)
    const type = data.shift()
    const headset = data.shift()
    if ((type === "inf")&&(window.update)) {
      const status = data.shift()
      const command = data.shift()
      if(status === "prediction") {
        a = 0 ; b = 0
        if(command === actualCommand) {
          if(headset.includes(prefered)) {
            a = 1
          } else {
            b = 1
          }
        }
        update([a, b])
      }
      if(headset.includes(prefered)) {
        a = Math.log10(data.reduce((w, v) => w + v))
      } else {
        b = Math.log10(data.reduce((w, v) => w + v))
      }
    }
    if(type === "hdw") {
      if(!prefered) prefered = data[3]
    }
  }
