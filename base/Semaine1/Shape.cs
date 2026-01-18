
using System;


abstract class Shape
{
    public abstract double Area();
}

class Rectangle : Shape
{
    public double width { get; set; }
    public double height { get; set; }

    public override double Area()
    {
        return width * height;
    }
}

class Circle : Shape
{
    public double radius { get; set; }

    public override double Area()
    {
        return Math.PI * radius * radius;
    }
}