import { Sound } from "../App/Sound.js";
export default {};
var splashEmitter;
var app;
var splashEmitterConfig = {
    "alpha": {
        "start": 1,
        "end": 0
    },
    "scale": {
        "start": 0.05,
        "end": 0.1,
        "minimumScaleMultiplier": 1
    },
    "color": {
        "start": "#000000",
        "end": "#c2c2c2"
    },
    "speed": {
        "start": 75,
        "end": 100,
        "minimumSpeedMultiplier": 0.1
    },
    "acceleration": {
        "x": 0,
        "y": 0
    },
    "maxSpeed": 0,
    "startRotation": {
        "min": 260,
        "max": 280
    },
    "noRotation": false,
    "rotationSpeed": {
        "min": 0,
        "max": 0
    },
    "lifetime": {
        "min": 1,
        "max": 9
    },
    "blendMode": "normal",
    "frequency": 0.1,
    "emitterLifetime": -1,
    "maxParticles": 500,
    "pos": {
        "x": 80,
        "y": 150
    },
    "addAtBack": false,
    "spawnType": "rect",
    "spawnRect": {
        "x": -25,
        "y": 0,
        "w": 50,
        "h": 0
    },
    "autoUpdate": true
};
function createRenderer() {
    document.querySelector("#splashCanvas").style.maxWidth = "200px";
    app = new PIXI.Application({
        view: document.querySelector("#splashCanvas"),
        transparent: true,
        width: 224,
        height: 329
    });
    var tunnelImage = PIXI.Sprite.from("/Assets/Images/Tunnel and Shadow.png");
    app.stage.addChild(tunnelImage);
    splashEmitter = new PIXI.particles.Emitter(app.stage, ["/Assets/Images/particle.png"], splashEmitterConfig);
}
function playAudio(sourceFile) {
    var audioCtx = new AudioContext();
    var source = audioCtx.createBufferSource();
    source.loop = true;
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", sourceFile, true);
    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
        });
    };
    request.send();
}
Sound.PlayLoop("/Assets/Sounds/ceich93_drone-ominousdistortion.mp3");
createRenderer();
//# sourceMappingURL=Splash.js.map