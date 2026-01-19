using System.Threading.Tasks;

int Divide(int a, int b)
{
    try
    {
        return a / b;
    }
    catch (DivideByZeroException)
    {
        Console.WriteLine("Error: Division by zero is not allowed.");
        return 0; // or handle it as appropriate
    }
}


int result = Divide(10, 2);
Console.WriteLine($"Result: {result}");

User user = new User("John");

user.SetEmail("john@example.com");
Console.WriteLine(user.Email);

async Task<int> GetRandomNumberAsync()
{
    await Task.Delay(1000);

    Random rand = new Random();
    int number = rand.Next(0, 11);

    if (number < 3)
    {
        throw new Exception($"Nombre trop petit: {number}");
    }
    return number;
}

try
{
    int n = await GetRandomNumberAsync();
    Console.WriteLine($"Result after delay: {n}");
}
catch (Exception ex)
{
    Console.WriteLine($"Caught an exception: {ex.Message}");
}