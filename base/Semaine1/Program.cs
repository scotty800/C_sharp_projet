
User user = new User
{
    Id = 1,
    Name = "John Doe",
    Email = "john.doe@example.com"
};

user.Display();

INotificationService email = new EmailNotificationService();
INotificationService sms = new SMSNotificationService();

email.Send("Welcome to our service!");
sms.Send("Your verification code is 123456.");

Shape Rectangle = new Rectangle
{
    width = 5,
    height = 10
};

Shape Circle = new Circle
{
    radius = 7
};

Console.WriteLine($"Area of Rectangle: {Rectangle.Area()}");
Console.WriteLine($"Area of Circle: {Circle.Area()}");