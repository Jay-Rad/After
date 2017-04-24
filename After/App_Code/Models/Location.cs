using After.Interactions;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace After.Models
{
    public class Location
    {
        public double XCoord { get; set; }
        public double YCoord { get; set; }
        public string ZCoord { get; set; }
        public string LocationID
        {
            get
            {
                return XCoord.ToString() + "," + YCoord.ToString() + "," + ZCoord.ToString();
            }
            set
            {
                var split = value.Split(',');
                XCoord = double.Parse(split[0]);
                YCoord = double.Parse(split[1]);
                ZCoord = split[2];
            }
        }
        public string Color { get; set; } = "darkgray";

        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsStatic { get; set; }
        public DateTime? LastVisited { get; set; }
        public string LastVisitedBy { get; set; }
        public long InvestedWillpower { get; set; }
        public List<Character> Occupants
        {
            get
            {
                using (var world = new World())
                {
                    var occupants = new List<Character>();
                    var npcs = world.NPCs.Where(n => n.CurrentXYZ == this.LocationID);
                    if (npcs != null)
                    {
                        occupants.AddRange(npcs);
                    }
                    var hostiles = world.Hostiles.Where(h => h.CurrentXYZ == this.LocationID);
                    if (hostiles != null)
                    {
                        occupants.AddRange(hostiles);
                    }
                    var players = world.Players.Where(p => p.CurrentXYZ == this.LocationID);
                    if (players != null)
                    {
                        occupants.AddRange(players);
                    }
                    return occupants;
                }
            }
        }
        public bool IsInnerVoid { get; set; }
        public long OwnerID { get; set; }
        public string Interactions { get; set; }

        public static bool Exists(string XYZ)
        {
            using (var world = new World())
            {
                if (world.Locations.FirstOrDefault(loc => loc.LocationID == XYZ) != null)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
        public bool ContainsOccupant(Character CharacterObject)
        {
            return Occupants.ToList().Exists(cha => cha.CharacterID == CharacterObject.CharacterID);
        }
        public double GetDistanceFrom(Location FromLocation)
        {
            if (FromLocation.ZCoord != ZCoord)
            {
                return double.MaxValue;
            }
            return Math.Sqrt(
                Math.Pow(FromLocation.XCoord - XCoord, 2) +
                Math.Pow(FromLocation.YCoord - YCoord, 2)
            );
        }
        public List<Location> GetNearbyLocations(double Distance)
        {
            using (var world = new World())
            {
                var locations = world.Locations.Where(l => l.ZCoord == this.ZCoord &&
                    Math.Abs(l.XCoord - this.XCoord) <= Distance &&
                    Math.Abs(l.YCoord - this.YCoord) <= Distance);
                return locations?.ToList();
            }
        }
        public dynamic ConvertToArea()
        {
            return new
            {
                Type = "Area",
                XCoord = this.XCoord,
                YCoord = this.YCoord,
                ZCoord = this.ZCoord,
                LocationID = this.LocationID,
                Color = this.Color,
                Title = this.Title,
                Description = this.Description,
                InvestedWillpower = this.InvestedWillpower
            };
        }
    }
}
