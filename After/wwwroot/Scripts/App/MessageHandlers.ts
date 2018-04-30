﻿namespace After.App {
    export class MessageHandlers {
        constructor() {

        }
        ReceiveAccountCreation(JsonMessage) {
            After.Utilities.RemoveLoading();
            if (JsonMessage.Result == "ok") {
                if (localStorage["RememberMe"] == "true") {
                    localStorage["AuthenticationToken"] = JsonMessage.AuthenticationToken;
                }
                After.Controls.Game.Init();
            }
            else {
                if (JsonMessage.Result == "exists") {
                    $("#divCreateAccountStatus").hide();
                    $("#divCreateAccountStatus").text("That account name already exists.");
                    $("#divCreateAccountStatus").fadeIn();
                    return;
                }
            };
        };
        ReceiveLogon(JsonMessage) {
            After.Utilities.RemoveLoading();
            if (JsonMessage.Result == "new required") {
                $("#divNewPassword").slideDown();
                $("#divLoginStatus").hide();
                $("#divLoginStatus").text("A new password is required.");
                $("#divLoginStatus").fadeIn();
            }
            else if (JsonMessage.Result == "password mismatch") {
                $("#divLoginStatus").hide();
                $("#divLoginStatus").text("The passwords do not match.");
                $("#divLoginStatus").fadeIn();
            }
            else if (JsonMessage.Result == "locked") {
                $("#divLoginStatus").hide();
                $("#divLoginStatus").text("Your account has been locked.  Please try again in a while.");
                $("#divLoginStatus").fadeIn();
            }
            else if (JsonMessage.Result == "ok") {
                if (JsonMessage.Note == "LoginElsewhere") {
                    After.Utilities.ShowDialog("Your account was already logged in from another location and was forced off by this login session.", "black", "OK", null);
                }
                if (localStorage["RememberMe"] == "true") {
                    localStorage["AuthenticationToken"] = JsonMessage.AuthenticationToken;
                }
                After.Controls.Game.Init();
            }
            else if (JsonMessage.Result == "failed") {
                $("#divLoginStatus").hide();
                $("#divLoginStatus").text("Incorrect username or password.");
                $("#divLoginStatus").fadeIn();
            }
            else if (JsonMessage.Result == "expired") {
                $("#divLoginStatus").hide();
                $("#divLoginStatus").text("Session expired.  Please log in again.");
                $("#divLoginStatus").fadeIn();
                $("#inputPassword").val("");
                localStorage.removeItem("Username");
                localStorage.removeItem("AuthenticationToken");
            }
            else if (JsonMessage.Result == "banned") {
                After.Utilities.ShowDialog("Your account is banned.  If you believe this is a mistake, please contact support.", "red", "OK", null);
            }
            $("#buttonLogin").removeAttr("disabled");
        };

        ReceiveConnected(JsonMessage) {
            var spanMessage = document.createElement("span");
            spanMessage.style.color = "whitesmoke";
            spanMessage.innerText = JsonMessage.Username + " has connected.";
            $("#divChatMessageWindow").append(spanMessage);
            $("#divChatMessageWindow").append("<br/>");
        }
        ReceiveDisconnected(JsonMessage) {
            var spanMessage = document.createElement("span");
            spanMessage.style.color = "whitesmoke";
            spanMessage.innerText = JsonMessage.Username + " has disconnected.";
            $("#divChatMessageWindow").append(spanMessage);
            $("#divChatMessageWindow").append("<br/>");
        }
        ReceiveLoginElsewhere(JsonMessage) {
            After.Utilities.ShowDialog("Your were disconnected because your account was logged in from another location.", "black", "OK", null);
        }
        ReceiveForgotPassword(JsonMessage) {
            After.Utilities.RemoveLoading();
            var result = JsonMessage.Result;
            if (result == "empty") {
                After.Utilities.ShowDialog("You must enter a username first.", "black", "OK", null);
            }
            else if (result == "unknown") {
                After.Utilities.ShowDialog("The specified username wasn't found.", "black", "OK", null);
            }
            else if (result == "no email") {
                After.Utilities.ShowDialog("A recovery email hasn't been set up for that account.", "black", "OK", null);
            }
            else if (result == "failed") {
                After.Utilities.ShowDialog("An error has occurred.  Try reloading After.  If the issue persists, please contact translucency_software@outlook.com.", "darkred", "OK", null);
            }
            else if (result == "ok") {
                After.Utilities.ShowDialog("Password reset successful!<br/><br/>A temporary password has been sent to your email (remember to check in junk/spam).", "black", "OK", null);
            }
        }
        ReceiveWarned(JsonMessage) {
            After.Connection.IsDisconnectExpected = true;
            After.Utilities.ShowDialog("You have been disconnected for suspicious activity.  Your account has been flagged, and any future offenses will result in a permanent ban.  If you believe this was in error, please contact support.", "red", "OK", null);
        }
        ReceiveBanned(JsonMessage) {
            After.Connection.IsDisconnectExpected = true;
            After.Utilities.ShowDialog("You have been permanently banned for repeated suspicious activity.  If you believe this was in error, please contact support.", "red", "OK", null);
        }

        ReceiveStartCharging(JsonMessage) {
            $("#buttonCharge").removeAttr("disabled");
            if (JsonMessage.Result == "ok") {
                After.Me.IsCharging = true;
                $('#divButtonCharge').hide();
                $('#divCharge').show();
                if (After.Temp.ChargeInterval != undefined) {
                    window.clearInterval(After.Temp.ChargeInterval);
                }
                After.Temp.ChargeInterval = window.setInterval(() => {
                    if (After.Me.IsCharging == false) {
                        if (After.Me.CurrentCharge == 0) {
                            $('#divButtonCharge').show();
                            $('#divCharge').hide();
                            window.clearInterval(After.Temp.ChargeInterval);
                        }
                        return;
                    }
                    var divRect = document.getElementById("divCharge").getBoundingClientRect();
                    var riseHeight = $("#divCharge").height() * .8;
                    var chargePercent = After.Me.CurrentCharge / After.Me.MaxCharge;
                    var startLeft = After.Utilities.GetRandom($("#divCharge").width() * .15, $("#divCharge").width() * .85, true);
                    var startTop = $("#divCharge").height() * .5;
                    var part = document.createElement("div");
                    part.classList.add("particle");
                    part.classList.add("anim-charge-button");
                    $(part).css({
                        left: startLeft,
                        top: startTop,
                    });
                    $("#divCharge").append(part);
                    window.setTimeout((thisParticle) => {
                        $(thisParticle).remove();
                    }, 1000, part);
                }, 100);
            }
        };
        ReceiveStopCharging(JsonMessage) {
            $("#buttonCharge").removeAttr("disabled");
            After.Me.IsCharging = false;
        };
        ReceiveCharacterArrives(JsonMessage) {
            if (JsonMessage.Soul.Name == After.Me.Name) {
                After.Me.CurrentLocation = JsonMessage.Soul.CurrentLocation;
                var query = {
                    "Category": "Queries",
                    "Type": "RefreshView"
                };
                After.Connection.Socket.send(JSON.stringify(query));
            }
            else {
                After.Storage.Souls.push(JsonMessage.Soul);
                var index = After.Storage.Areas.findIndex((value, index) => {
                    return value.StorageID == JsonMessage.Soul.CurrentLocation;
                });
                After.Storage.Areas[index].Occupants.push(JsonMessage.Soul.Name);
                if (JsonMessage.Soul.CurrentLocation == After.Me.CurrentLocation) {
                    After.UI.AddMessageNoSender(JsonMessage.Soul.Name + " has arrived.", "whitesmoke");
                }
            }
        };
        ReceiveCharacterLeaves(JsonMessage) {
            if (JsonMessage.Soul.Name != After.Me.Name) {
                var soulIndex = After.Storage.Souls.findIndex((value, index) => {
                    return value.Name == JsonMessage.Soul.Name;
                });

                var areaIndex = After.Storage.Areas.findIndex((value, index) => {
                    return value.StorageID == JsonMessage.Soul.CurrentLocation;
                });
                var occupantIndex = After.Storage.Areas[areaIndex].Occupants.findIndex((value) => {
                    return value == JsonMessage.Soul.Name;
                });
                After.Storage.Areas[areaIndex].Occupants.splice(occupantIndex, 1);

                After.Storage.Souls.splice(soulIndex, 1);
                if (JsonMessage.Soul.CurrentLocation == After.Me.CurrentLocation) {
                    After.UI.AddMessageNoSender(JsonMessage.Soul.Name + " has left.", "whitesmoke");
                }
            }
        };
        ReceivePlayerMove(JsonMessage) {
            if (JsonMessage.Soul.Name == After.Me.Name) {
                After.Me.IsMoving = true;
                var dest = JsonMessage.To.split(",");
                var from = JsonMessage.From.split(",");
                After.Me.Particles.forEach((value, index) => {
                    window.setTimeout((value) => {
                        $(value).animate(
                            {
                                "XCoord": Number(dest[0]),
                                "YCoord": Number(dest[1])
                            },
                            {
                                "duration": Number(JsonMessage.TravelTime),
                                "queue": false,
                            }
                        );
                    }, index * 20, value);
                });
                $(After.Me).animate(
                    {
                        "XCoord": Number(dest[0]),
                        "YCoord": Number(dest[1])
                    },
                    {
                        "duration": Number(JsonMessage.TravelTime),
                        "queue": false,
                        "always": () => {
                            After.Me.IsMoving = false;
                        }
                    }
                );
                //if (After.Settings.FollowPlayer) {
                //    for (var i = 0; i < Number(JsonMessage.TravelTime); i = i + 10) {
                //        window.setTimeout(() => {
                //            After.Canvas.CenterOnCoords(After.Me.XCoord, After.Me.YCoord, false, false);
                //        }, i)
                //    }
                //}
            }
            else {
                for (var i = 0; i < 50; i++) {
                    var part = new After.Models.FreeParticle();
                    part.Color = JsonMessage.Soul.Color;
                    var from = JsonMessage.From.split(",");
                    var dest = JsonMessage.To.split(",");
                    part.XCoord = After.Utilities.GetRandom(Number(from[0]) + .25, Number(from[0]) + .75, false);
                    part.YCoord = After.Utilities.GetRandom(Number(from[1]) + .25, Number(from[1]) + .50, false);
                    part.ZCoord = from[3];
                    After.Storage.FreeParticles.push(part);
                    $(part).animate({
                        "XCoord": Number(dest[0]) + .5,
                        "YCoord": Number(dest[1]) + .5
                    }, Number(JsonMessage.TravelTime), () => {
                        var index = After.Storage.FreeParticles.findIndex((value) => value == part);
                        After.Storage.FreeParticles.splice(index, 1);
                    });
                }
            }
        }
        ReceiveAreaCreated(JsonMessage) {
            After.Storage.Areas.push(JsonMessage.Area);
        }
        ReceiveAreaRemoved(JsonMessage) {
            var index = After.Storage.Areas.findIndex(area => area.StorageID == JsonMessage.Area.LocationID);
            if (index > -1) {
                After.Storage.Areas.splice(index, 1);
            }
        }
        ReceiveCharacterCharging(JsonMessage) {
            var location = JsonMessage.Location.split(",");
            var fp = new After.Models.FreeParticle();
            fp.Color = "white";
            fp.XCoord = Number(location[0]) + After.Utilities.GetRandom(0, .99, false);
            fp.YCoord = Number(location[1]) + After.Utilities.GetRandom(0, .99, false);
            fp.ZCoord = location[2];
            After.Storage.FreeParticles.push(fp);
            $(fp).animate({
                XCoord: Number(location[0]) + .5,
                YCoord: Number(location[1]) + .5
            }, 750, () => {
                var index = After.Storage.FreeParticles.findIndex(part => part == fp);
                After.Storage.FreeParticles.splice(index, 1);
            });
        }

        ReceiveChat(JsonData) {
            switch (JsonData.Channel) {
                case "Global":
                    After.UI.AddChatMessage("Global", After.Settings.UIColors.GlobalChat, JsonData.Username, JsonData.Message, "whitesmoke");
                    break;
                case "System":
                    After.UI.AddMessageNoSender(JsonData.Message, "whitesmoke");
                    break;
                default:
                    break;
            }
            var divChat = document.getElementById("divChatMessageWindow");
            if (divChat != null) {
                if ($("#divChatMessageWindow").height() == 0) {
                    $("#divChatIconBorder").addClass("blinking");
                }
                divChat.scrollTop = divChat.scrollHeight;
            }
        }
        ReceiveAdminScript(JsonData) {
            var spanMessage = document.createElement("span");
            if (typeof JsonData.Message == "object") {
                spanMessage.innerHTML = After.Utilities.FormatObjectForHTML(JsonData.Message);
            }
            else {
                spanMessage.innerText = After.Utilities.EncodeForHTML(JsonData.Message);
            }
            spanMessage.style.color = "white";

            $("#divAdminMessageWindow").append(spanMessage);
            $("#divAdminMessageWindow").append("<br/>");
            var divAdmin = document.getElementById("divAdminMessageWindow");
            if (divAdmin != null) {
                if ($("#divAdminMessageWindow").height() == 0) {
                    $("#divAdminIconBorder").addClass("blinking");
                }
                divAdmin.scrollTop = divAdmin.scrollHeight;
            }
        }

        ReceiveStatUpdate(JsonMessage) {
            After.Me[JsonMessage.Stat] = JsonMessage.Amount;
        }
        ReceivePlayerUpdate(JsonMessage) {
            for (var stat in JsonMessage.Player) {
                After.Me[stat] = JsonMessage.Player[stat];
            }
        }
        ReceiveRefreshView(JsonMessage) {
            JsonMessage.Souls.forEach((value) => {
                var index = After.Storage.Souls.findIndex((soul) => { return soul.Name == value.Name; });
                if (index == -1) {
                    After.Storage.Souls.push(value);
                }
                else {
                    After.Storage.Souls[index] = value;
                }
            })
            for (var i = After.Storage.Areas.length - 1; i >= 0; i--) {
                var value = After.Storage.Areas[i];
                if (value.ZCoord != After.Me.ZCoord) {
                    After.Storage.Areas.splice(i, 1);
                }
                else if (After.Utilities.GetDistanceBetween(value.StorageID, After.Me.CurrentLocation) <= After.Me.ViewDistance) {
                    After.Storage.Areas.splice(i, 1);
                }
            }
            JsonMessage.Areas.forEach((value) => {
                After.Storage.Areas.push(value);
            })
            After.Storage.Areas.forEach((value) => {
                if (After.Utilities.GetDistanceBetween(value.StorageID, After.Me.CurrentLocation) <= After.Me.ViewDistance) {
                    value.IsVisible = true;
                }
                else {
                    value.IsVisible = false;
                }
            })
        }
        ReceiveGetPowers(JsonMessage) {
            $("#divPowersFrame .tab-innerframe").html("");
            for (var i = 0; i < JsonMessage.Powers.length; i++) {
                After.Me.Powers.push(JsonMessage.Powers[i]);
                After.Game.AddPower(JsonMessage.Powers[i]);
            }
            if (JsonMessage.IsAdmin) {
                $("#divAdminFrame").removeClass("hidden");
            }
            else {
                $("#divAdminFrame").remove();
            }
        }
        ReceiveFirstLoad(JsonMessage) {
            // Account settings.
            for (var setting in JsonMessage.Settings) {
                After.Settings[setting] = JsonMessage.Settings[setting];
            }

            // Player update.
            for (var stat in JsonMessage.Player) {
                After.Me[stat] = JsonMessage.Player[stat];
            }
            // Iterate twice for properties that rely on other properties.  Lazy solution.
            for (var stat in JsonMessage.Player) {
                After.Me[stat] = JsonMessage.Player[stat];
            }

            // Get powers.
            $("#divPowersFrame .tab-innerframe").html("");
            for (var i = 0; i < JsonMessage.Powers.length; i++) {
                After.Me.Powers.push(JsonMessage.Powers[i]);
                After.Game.AddPower(JsonMessage.Powers[i]);
            }
            if (JsonMessage.AccountType == 3) {
                $("#divAdminFrame").removeClass("hidden");
            }
            else {
                $("#divAdminFrame").remove();
            }

            // Start drawing.
            window.requestAnimationFrame(After.Drawing.DrawCanvas);
            After.Drawing.AnimateParticles();
            After.Canvas.CenterOnCoords(After.Me.XCoord, After.Me.YCoord, true, false);
            After.Canvas.UpdateMap(true);
        }
        ReceiveMapUpdate(JsonMessage) {
            if (JsonMessage.Area) {
                var index = After.Storage.Areas.findIndex((value) => {
                    return value.StorageID == JsonMessage.Area.StorageID;
                });
                if (index > -1) {
                    After.Storage.Areas.splice(index, 1);
                }
                After.Storage.Areas.push(JsonMessage.Area);
            }
            if (JsonMessage.Landmark) {
                var index = After.Storage.Landmarks.findIndex((value) => {
                    return value.StorageID == JsonMessage.Landmark.StorageID;
                });
                if (index > -1) {
                    After.Storage.Landmarks.splice(index, 1);
                }
                After.Storage.Landmarks.push(JsonMessage.Landmark);
            }
            if (JsonMessage.Completed) {
                After.Temp.MapUpdatePending = false;
            }
        }
        ReceiveGetAreaActions(JsonMessage) {
            var point = (After.Temp.ButtonPoint as MouseEvent | Touch);
            var divActionList = document.createElement("div");
            $(divActionList).css({
                "position": "fixed",
                "display": "none",
                "border": "1px solid lightgray"
            })
            if (point.clientX <= document.documentElement.clientWidth / 2) {
                divActionList.style.left = point.clientX + "px";
            }
            else {
                divActionList.style.right = (document.documentElement.clientWidth - point.clientX) + "px";
            }
            if (point.clientY <= document.documentElement.clientHeight / 2) {
                divActionList.style.top = point.clientY + "px";
            }
            else {
                divActionList.style.bottom = (document.documentElement.clientHeight - point.clientY) + "px";
            }
            for (var i = 0; i < JsonMessage.Actions.length; i++) {
                var action = document.createElement("div");
                $(action).css({
                    "padding": "10px",
                    "background-color": "rgba(255,255,255, .75)",
                    "text-align": "center",
                    "cursor": "pointer",
                    "font-weight": "bold",
                    "user-select": "none"
                })
                action.classList.add("font-sansserif");
                action.setAttribute("targetxyz", JsonMessage.TargetXYZ);
                $(action).hover((e) => {
                    $(e.currentTarget).css("background-color", "white");
                }, (e) => {
                    $(e.currentTarget).css("background-color", "rgba(255,255,255, .75)");
                })
                action.innerHTML = JsonMessage.Actions[i];
                action.onclick = (e) => {
                    var xyz = (e.currentTarget as HTMLDivElement).getAttribute("targetxyz");
                    var action = (e.currentTarget as HTMLDivElement).innerHTML;
                    var request = {
                        "Category": "Events",
                        "Type": "DoAreaAction",
                        "TargetXYZ": xyz,
                        "Action": action
                    }
                    After.Connection.Socket.send(JSON.stringify(request));
                    // TODO: Handle this on other end.
                }
                divActionList.appendChild(action);
            }
            document.body.appendChild(divActionList);
            $(window).one("click", () => {
                window.setTimeout(() => {
                    $(divActionList).remove();
                }, 250);
            });
            $(window).one("touchstart", () => {
                window.setTimeout(() => {
                    $(divActionList).remove();
                }, 250);
            });
            $(divActionList).mouseout(() => {
                window.setTimeout(() => {
                    if ($(divActionList).is(":hover") == false) {
                        $(divActionList).remove();
                    }
                }, 1000)
            })
            $(divActionList).fadeIn();
        }
        ReceiveGetAreaOccupants(JsonMessage) {
            var point = (After.Temp.ButtonPoint as MouseEvent | Touch);
            var divOccupantList = document.createElement("div");
            $(divOccupantList).css({
                "position": "fixed",
                "display": "none",
                "border": "1px solid lightgray"
            })
            if (point.clientX <= document.documentElement.clientWidth / 2) {
                divOccupantList.style.left = point.clientX + "px";
            }
            else {
                divOccupantList.style.right = (document.documentElement.clientWidth - point.clientX) + "px";
            }
            if (point.clientY <= document.documentElement.clientHeight / 2) {
                divOccupantList.style.top = point.clientY + "px";
            }
            else {
                divOccupantList.style.bottom = (document.documentElement.clientHeight - point.clientY) + "px";
            }
            for (var i = 0; i < JsonMessage.Occupants.length; i++) {
                var occupant = document.createElement("div");
                $(occupant).css({
                    "padding": "10px",
                    "background-color": "rgba(255,255,255, .75)",
                    "text-align": "center",
                    "cursor": "pointer",
                    "font-weight": "bold",
                    "user-select": "none"
                })
                occupant.classList.add("font-sansserif");
                occupant.setAttribute("targetxyz", JsonMessage.TargetXYZ);
                $(occupant).hover((e) => {
                    $(e.currentTarget).css("background-color", "white");
                }, (e) => {
                    $(e.currentTarget).css("background-color", "rgba(255,255,255, .75)");
                })
                occupant.innerHTML = JsonMessage.Occupants[i].DisplayName;
                occupant.id = JsonMessage.Occupants[i].StorageID;
                occupant.onclick = (e) => {
                    var xyz = (e.currentTarget as HTMLDivElement).getAttribute("targetxyz");
                    var occupantID = (e.currentTarget as HTMLDivElement).id;
                    var request = {
                        "Category": "Events",
                        "Type": "AreaOccupantClicked",
                        "TargetXYZ": xyz,
                        "Occupant": occupantID
                    }
                    After.Connection.Socket.send(JSON.stringify(request));
                    // TODO: Handle this on other end.
                }
                divOccupantList.appendChild(occupant);
            }
            document.body.appendChild(divOccupantList);
            $(window).one("click", () => {
                window.setTimeout(() => {
                    $(divOccupantList).remove();
                }, 250);
            });
            $(window).one("touchstart", () => {
                window.setTimeout(() => {
                    $(divOccupantList).remove();
                }, 250);
            });
            $(divOccupantList).mouseout(() => {
                window.setTimeout(() => {
                    if ($(divOccupantList).is(":hover") == false) {
                        $(divOccupantList).remove();
                    }
                }, 1000)
            })
            $(divOccupantList).fadeIn();
        }
    }
}