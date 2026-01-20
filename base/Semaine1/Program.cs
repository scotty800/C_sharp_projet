
Func<int, int> square = x => x * x;

int result = square(5);
Console.WriteLine(result);

var nombres = new List<int> { 1, 2, 3, 4, 5 };

var resulte = nombres
    .Where(n => n % 2 == 0)
    .Select(n => n * 10)
    .ToList();

Console.WriteLine(string.Join(", ", resulte));

async Task<string> FetchDataAsync()
{
    await Task.Delay(2000);
    return "Data chargées";
}

var data = await FetchDataAsync();
Console.WriteLine(data);