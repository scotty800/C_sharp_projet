using System;
using System.Linq;

bool IsEven(int number)
{
    if (number % 2 == 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

bool result1 = IsEven(4);  // true
Console.WriteLine(result1);
bool result2 = IsEven(7);  // false
Console.WriteLine(result2);

string Grade(int score)
{
    return score switch
    {
        >= 90 => "A",
        >= 80 => "B",
        >= 70 => "C",
        _ => "F"
    };
}

string grade1 = Grade(95);  // "A"
Console.WriteLine(grade1);
string grade2 = Grade(86);  // "B"
Console.WriteLine(grade2);
string grade3 = Grade(72);  // "C"
Console.WriteLine(grade3);
string grade4 = Grade(65);  // "F"
Console.WriteLine(grade4);

foreach (int n in Enumerable.Range(1, 100))
{
    if (n % 3 == 0 )
    {
        Console.WriteLine(n);
    }
}