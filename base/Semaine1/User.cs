using System;

class User
{
    public string Name { get; set; }
    public string Email { get; private set; }

    public User(string name)
    {
        Name = name;
    }

    public void SetEmail(string email)
    {
        if (!email.Contains("@"))
        {
            throw new ArgumentException("l'email doit contenir un '@'");
        }
        Email = email;
    }
}