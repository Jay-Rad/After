/// <reference path="../lib/pixi-particles/ambient.d.ts" />
import { Sound } from "./App/Sound.js";
import { Me } from "./App/Me.js";
import { UI } from "./App/UI.js";
import { Utilities } from "./App/Utilities.js";
import { Sockets } from "./App/Sockets.js";
import { Settings } from "./App/Settings.js";
import { PixiHelper } from "./App/PixiHelper.js";
import { Input } from "./App/Input.js";
import { Renderer } from "./App/Renderer.js";
import { GameEvents } from "./App/GameEvents.js";
var main = new class {
    constructor() {
        this.GameEvents = GameEvents;
        this.ErrorLog = "";
        this.Input = Input;
        this.Me = Me;
        this.PixiHelper = PixiHelper;
        this.Renderer = Renderer;
        this.Sound = Sound;
        this.UI = UI;
        this.Utilities = Utilities;
        this.Settings = Settings;
        this.Sockets = Sockets;
    }
    StartGameLoop() {
        Main.Renderer.PixiApp.ticker.add(delta => gameLoop(delta));
    }
    Init(currentCharacter, rendererWidth, rendererHeight) {
        Settings.Local.RendererResolution.Width = rendererWidth;
        Settings.Local.RendererResolution.Height = rendererHeight;
        UI.AddSystemMessage("Welcome to After.");
        UI.ApplyDataBinds();
        this.Renderer.CreatePixiApp(rendererWidth, rendererHeight);
        Input.ApplyInputHandlers();
        if (location.href.indexOf("localhost") > -1) {
            Settings.Local.IsDebugEnabled = true;
        }
        else {
            Settings.Local.IsDebugEnabled = Settings.Local.IsDebugEnabled;
        }
        Settings.Local.AreTouchControlsEnabled = Settings.Local.AreTouchControlsEnabled;
        PixiHelper.LoadBackgroundEmitter(rendererWidth, rendererHeight);
        $.extend(true, this.Me.Character, currentCharacter);
        UI.UpdateStatBars();
        this.Me.Character.Render();
        this.StartGameLoop();
    }
};
window.onerror = (ev, source, fileNo, columnNo, error) => {
    var errorMessage = `${new Date().toLocaleString()}  |  File: ${fileNo}  |  Column: ${columnNo}  |  Message: ${error.message}  |  Stack: ${error.stack}`.replace("\r\n", "<br>");
    main.ErrorLog += errorMessage + "<br><br>";
};
window["After"] = main;
export const Main = main;
// Initial connect.
if (location.pathname.search("play") > -1) {
    window.onload = (e) => {
        // Register service worker.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/ts/Worker.js', { scope: "/ts/" })
                .then(function (reg) {
                console.log("Service worker registered.");
            }).catch(function (err) {
                console.log("Error registering service worker:", err);
            });
        }
        // Catch add to home prompt.
        window.addEventListener("beforeinstallprompt", (ev) => {
            ev.preventDefault();
            document.querySelector("#addToHomeButton").onclick = () => ev.prompt();
        });
        window.addEventListener("beforeunload", ev => {
            if (location.href.indexOf("localhost") == -1) {
                ev.returnValue = "Are you sure you want to exit?";
            }
        });
        Sockets.Connect();
    };
}
function gameLoop(delta) {
    Main.Me.Character.ParticleContainer.children.forEach(part => {
        part.x -= Main.Me.Character.VelocityX * .30;
        part.y -= Main.Me.Character.VelocityY * .30;
    });
    Main.Renderer.BackgroundParticleContainer.children.forEach(part => {
        part.x -= Main.Me.Character.VelocityX * .25;
        part.y -= Main.Me.Character.VelocityY * .25;
    });
    Main.Me.Scene.GameObjects.forEach(x => {
        if (!Main.Renderer.SceneContainer.children.some(y => y.name == x.ID)) {
            x.Render();
        }
        else {
            PixiHelper.UpdateGameObjectPosition(x);
        }
        if (x.Discriminator == "Character" || x.Discriminator == "PlayerCharacter") {
            x.UpdateHealthBar();
        }
    });
    Main.Renderer.EventContainer.children.forEach(displayObject => {
        if (Me.LastXCoord == null || Me.LastYCoord == null) {
            return;
        }
        displayObject.x += (Me.LastXCoord - Me.Character.XCoord);
        displayObject.y += (Me.LastYCoord - Me.Character.YCoord);
    });
    Main.Renderer.SceneContainer.children.forEach(value => {
        if (!Main.Me.Scene.GameObjects.some(go => go.ID == value.name)) {
            Main.Renderer.SceneContainer.removeChild(value);
        }
    });
    Main.Me.LastXCoord = Main.Me.Character.XCoord;
    Main.Me.LastYCoord = Main.Me.Character.YCoord;
    if (Main.Me.LastZCoord != Main.Me.Character.ZCoord) {
        Renderer.EventContainer.removeChildren();
    }
    Main.Me.LastZCoord = Main.Me.Character.ZCoord;
}
//# sourceMappingURL=Main.js.map