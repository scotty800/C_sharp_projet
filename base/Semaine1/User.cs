using System;

class User 
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }

    public void Display()
    {
        Console.WriteLine($"ID: {Id}, Name: {Name}, Email: {Email}");
    }
}
