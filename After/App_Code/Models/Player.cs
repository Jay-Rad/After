using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace After.Models
{
    public class Player: Character
    {
        public Player()
        {
           
        }
        public string Password { get; set; }
        public string AuthenticationToken { get; set; }
        public bool IsAdmin { get; set; }

        public bool AdminFlagged { get; set; }

        public bool Kicked { get; set; }
        public bool Banned { get; set; }
        public int BadPasswordCount { get; set; } = 0;
        public bool LockedOut { get; set; }
        public DateTime? LockoutTime { get; set; }
        public AccountTypes AccountType { get; set; }

        public string LastIP { get; set; }

        public enum AccountTypes
        {
            Standard,
            Subscriber,
            Creator,
            Admin,
        }

        public override string ToString()
        {
            return Name;
        }

        public bool IsLoggedIn()
        {
            return Socket_Handler.SocketCollection.Any(sh => (sh as Socket_Handler)?.Player?.Name == Name);
        }
        public Socket_Handler GetSocketHandler()
        {
            return Socket_Handler.SocketCollection.Cast<Socket_Handler>().FirstOrDefault(sh => sh?.Player?.CharacterID == CharacterID);
        }
        public dynamic ConvertToMe()
        {
            var location = CurrentXYZ.Split(',');
            return new
            {
                CharacterID = this.CharacterID,
                Name = this.Name,
                Color = this.Color,
                XCoord = location[0],
                YCoord = location[1],
                ZCoord = location[2],
                CurrentXYZ = this.CurrentXYZ,
                CoreEnergy = this.CoreEnergy,
                CoreEnergyPeak = this.CoreEnergyPeak,
                CurrentEnergy = this.CurrentEnergy,
                MaxEnergy = this.MaxEnergy,
                MaxEnergyModifier = this.MaxEnergyModifier,
                CurrentCharge = this.CurrentCharge,
                MaxCharge = this.MaxCharge,
                MaxChargeModifier = this.MaxChargeModifier,
                CurrentWillpower = this.CurrentWillpower,
                MaxWillpower = this.MaxWillpower,
                MaxWillpowerModifier = this.MaxWillpowerModifier,
                ViewDistance = this.ViewDistance
            };
        }
    }
}