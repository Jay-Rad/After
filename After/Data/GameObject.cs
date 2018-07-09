﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace After.Data
{
    public class GameObject
    {
        [Key]
        public int ID { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }

        public double XCoord { get; set; }
        public double YCoord { get; set; }
        public string ZCoord { get; set; }


        public double VelocityX { get; set; }
        public double VelocityY { get; set; }
        public double AccelerationSpeed { get; set; }
        public double DecelerationSpeed { get; set; }

        public Rectangle Rect
        {
            get
            {
                return new Rectangle((int)XCoord, (int)YCoord, Width, Height);
            }
        }
    }
}
