import { Main } from "../Main.js";
import { UI } from "./UI.js";
export const Settings = new class {
    constructor() {
        this.Local = new class {
            constructor() {
                this.RendererResolution = {
                    Width: 1280,
                    Height: 720
                };
            }
            get IsDebugEnabled() {
                return localStorage["IsDebugEnabled"] == 'true';
            }
            set IsDebugEnabled(value) {
                localStorage["IsDebugEnabled"] = value;
                var fpsUpdateTicker = (delta => {
                    var currentFPS = Math.round(Main.Renderer.PixiApp.ticker.FPS).toString();
                    if (UI.FPSSpan.innerText != currentFPS &&
                        (UI.FPSSpan.getAttribute("last-set") == null || Date.now() - parseInt(UI.FPSSpan.getAttribute("last-set")) > 1000)) {
                        UI.FPSSpan.innerText = currentFPS;
                        UI.FPSSpan.setAttribute("last-set", Date.now().toString());
                    }
                });
                if (value) {
                    Main.Renderer.PixiApp.ticker.add(fpsUpdateTicker);
                    UI.DebugFrame.style.display = "";
                }
                else {
                    Main.Renderer.PixiApp.ticker.remove(fpsUpdateTicker);
                    UI.DebugFrame.style.display = "none";
                }
                Main.Sockets.Invoke("Ping", Date.now());
                document.querySelector("#toggleDebugWindow").setAttribute("on", String(value));
            }
            get AreTouchControlsEnabled() {
                if (localStorage["AreTouchControlsEnabled"] == undefined) {
                    localStorage["AreTouchControlsEnabled"] = 'true';
                }
                return localStorage["AreTouchControlsEnabled"] == 'true';
            }
            set AreTouchControlsEnabled(value) {
                localStorage["AreTouchControlsEnabled"] = value;
                if (value) {
                    document.querySelector("#movementTouchArea").hidden = false;
                    document.querySelector("#actionTouchArea").hidden = false;
                }
                else {
                    document.querySelector("#movementTouchArea").hidden = true;
                    document.querySelector("#actionTouchArea").hidden = true;
                }
                document.querySelector("#toggleTouchControls").setAttribute("on", String(value));
            }
        };
        // TODO: Save settings on server.
        this.Roaming = new class {
            constructor() {
                this.Colors = {
                    GlobalChat: "rgb(0, 255, 64)",
                    VoidChat: "rgb(0, 220, 255)",
                    Whisper: "magenta",
                    SystemMessage: "lightgray",
                    DebugMessage: "rgb(150,50,50)"
                };
                this.Keybinds = [
                    { Name: "Up", Key: "w" },
                    { Name: "Left", Key: "a" },
                    { Name: "Down", Key: "s" },
                    { Name: "Right", Key: "d" }
                ];
            }
        };
    }
};
//# sourceMappingURL=Settings.js.map