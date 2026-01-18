
interface INotificationService
{
    void Send(string message);
}

class EmailNotificationService : INotificationService
{
    public void Send(string message)
    {
        Console.WriteLine($"Sending email notification: {message}");
    }
}

class SMSNotificationService : INotificationService
{
    public void Send(string message)
    {
        Console.WriteLine($"Sending SMS notification: {message}");
    }
}