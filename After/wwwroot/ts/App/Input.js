import { PixiHelper } from "./PixiHelper.js";
export const Input = new class {
    ApplyInputHandlers() {
        handleJoystick();
    }
};
function handleJoystick() {
    var outer = document.querySelector("#joystickOuter");
    var inner = document.querySelector("#joystickInner");
    function moveInnerJoystick(ev) {
        var wrapperRect = outer.getBoundingClientRect();
        var centerX = wrapperRect.left + (wrapperRect.width / 2);
        var centerY = wrapperRect.top + (wrapperRect.height / 2);
        var centerPoint = new PIXI.Point(centerX, centerY);
        var evPoint = new PIXI.Point(ev.x, ev.y);
        var distance = Math.min(PixiHelper.GetDistanceBetween(centerPoint, evPoint), outer.clientWidth / 2);
        var angle = PixiHelper.GetAngle(centerPoint, evPoint);
        inner.style.transform = `rotate(${angle}deg) translateX(-${distance}px)`;
    }
    function pointerMoveEvent(ev) {
        moveInnerJoystick(ev);
    }
    function pointerUpEvent(ev) {
        window.removeEventListener("pointermove", pointerMoveEvent);
        window.removeEventListener("pointerup", pointerUpEvent);
        inner.style.transform = "";
        inner.style.backgroundColor = "";
    }
    outer.addEventListener("pointerdown", ev => {
        window.addEventListener("pointermove", pointerMoveEvent);
        window.addEventListener("pointerup", pointerUpEvent);
        inner.style.backgroundColor = "white";
        moveInnerJoystick(ev);
    });
}
//# sourceMappingURL=Input.js.map