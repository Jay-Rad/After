﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace After.Code.Models
{
    public class GameObject
    {
        public double AccelerationSpeed { get; set; }

        public string Color { get; set; }

        public double DecelerationSpeed { get; set; }

        public string Discriminator { get; set; }

        public int Height { get; set; }

        [Key]
        public Guid ID { get; set; }
        public Rectangle Location
        {
            get
            {
                return new Rectangle((int)XCoord, (int)YCoord, Width, Height);
            }
        }

        public double MaxVelocity { get; set; }
        public bool Modified { get; set; }
        public double MovementAngle { get; set; }
        public double MovementForce { get; set; }
        public double VelocityX { get; set; }
        public double VelocityY { get; set; }
        public int Width { get; set; }

        public double XCoord { get; set; }
        public double YCoord { get; set; }
        public string ZCoord { get; set; }
    }
}