﻿namespace After.Models.App {
    export class Canvas {
        constructor() {
            this.OffsetX = 0;
            this.OffsetY = 0;
            this.CurrentZ = 0;
            this.Scale = 1;
            this.ScaleChange = 1;
            this.InertiaX = 0;
            this.InertiaY = 0;
            this.StartDragX = 0;
            this.StartDragY = 0;
            this.StartOffsetX = 0;
            this.StartOffsetY = 0;
            this.LastTouchDistance = 0;
            this.IsPanning = false;
            this.IsZooming = false;
            this.InertiaStack = new Array<any>();
            this.FPSStack = new Array<number>();
        }
        Element: HTMLCanvasElement;
        Context2D: CanvasRenderingContext2D;
        SelectedObject: After.Models.Bases.Selectable;
        OffsetX: number;
        OffsetY: number;
        CurrentZ: number;
        Scale: number;
        ScaleChange: number;
        InertiaX: number;
        InertiaY: number;
        StartDragX: number;
        StartDragY: number;
        StartOffsetX: number;
        StartOffsetY: number;
        LastTouchPoint1: Touch;
        LastTouchPoint2: Touch;
        LastTouchDistance: number;
        InertiaStack: Array<any>;
        IsPanning: boolean;
        IsZooming: boolean;
        FPSStack: Array<number>;
        SelectPoint(e: MouseEvent|Touch) {
            // TODO: Select object based on coords.
            var xTotal = e.clientX / After.Canvas.Scale - After.Canvas.OffsetX;
            var yTotal = e.clientY / After.Canvas.Scale - After.Canvas.OffsetY;
            var xCoord = Math.floor(xTotal / 100);
            var yCoord = Math.floor(yTotal / 100);
            var xRemainder = xTotal - (xCoord * 100);
            var yRemainder = yTotal - (yCoord * 100);
            var area = After.World_Data.Areas.filter(function (a) {
                if (a.XCoord == xCoord && a.YCoord == yCoord) {
                    return true;
                }
                else {
                    return false;
                }
            });
            if (After.Canvas.SelectedObject != undefined && After.Canvas.SelectedObject == area[0])
            {
                After.Canvas.SelectedObject.IsSelected = !After.Canvas.SelectedObject.IsSelected;
            }
            else
            {
                if (After.Canvas.SelectedObject) {
                    After.Canvas.SelectedObject.IsSelected = false;
                }
                After.Canvas.SelectedObject = area[0];
                if (After.Canvas.SelectedObject) {
                    After.Canvas.SelectedObject.IsSelected = true;
                }
            }
        };
        ApplyInertia() {
            After.Canvas.InertiaX = 0;
            After.Canvas.InertiaY = 0;
            After.Canvas.IsPanning = false;
            if (After.Canvas.InertiaStack.length == 1) {
                return;
            }
            for (var i = After.Canvas.InertiaStack.length - 1; i > 0; i--) {
                var thisEvent = After.Canvas.InertiaStack[i].Event;
                var lastEvent = After.Canvas.InertiaStack[i - 1].Event;
                var thisTime = After.Canvas.InertiaStack[i].Timestamp;
                var lastTime = After.Canvas.InertiaStack[i - 1].Timestamp;
                var xChange = (thisEvent.clientX - lastEvent.clientX) * ((lastTime / thisTime) + .25);
                var yChange = (thisEvent.clientY - lastEvent.clientY) * ((lastTime / thisTime) + .25);
                if (i == After.Canvas.InertiaStack.length - 1) {
                    After.Canvas.InertiaX += xChange * 1.5;
                    After.Canvas.InertiaY += yChange * 1.5;
                }
                else {
                    After.Canvas.InertiaX += xChange;
                    After.Canvas.InertiaY += yChange;
                }
            }
            After.Canvas.InertiaX /= (After.Canvas.InertiaStack.length + .5);
            After.Canvas.InertiaY /= (After.Canvas.InertiaStack.length + .5);
            After.Canvas.InertiaX = Math.round(After.Canvas.InertiaX);
            After.Canvas.InertiaY = Math.round(After.Canvas.InertiaY);
            if (After.Temp.InertiaInterval) {
                window.clearInterval(After.Temp.InertiaInterval);
            }
            After.Temp.InertiaInterval = window.setInterval(function () {
                if (After.Canvas.InertiaX != 0) {
                    After.Canvas.InertiaX -= (After.Canvas.InertiaX * .05);
                }
                if (After.Canvas.InertiaY != 0) {
                    After.Canvas.InertiaY -= (After.Canvas.InertiaY * .05);
                }
                if (After.Canvas.IsPanning == false) {
                    if (Math.abs(After.Canvas.InertiaX) < 1) {
                        After.Canvas.InertiaX = 0;
                    }
                    if (Math.abs(After.Canvas.InertiaY) < 1) {
                        After.Canvas.InertiaY = 0;
                    }
                    if (After.Canvas.InertiaX == 0 && After.Canvas.InertiaY == 0) {
                        window.clearInterval(After.Temp.InertiaInterval);
                    }
                    After.Canvas.OffsetX += (After.Canvas.InertiaX / After.Canvas.Scale);
                    After.Canvas.OffsetY += (After.Canvas.InertiaY / After.Canvas.Scale);
                }
                else {
                    After.Canvas.InertiaX = 0;
                    After.Canvas.InertiaY = 0;
                    window.clearInterval(After.Temp.InertiaInterval);
                }
            }, 20);
        }
    }
}