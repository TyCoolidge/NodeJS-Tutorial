const num1Element = document.getElementById('num1') as HTMLInputElement;
const num2Element = document.getElementById('num2') as HTMLInputElement;
const buttonElement = document.querySelector('button') as HTMLButtonElement;
// const buttonElement = document.querySelector('button')!

const numResults: Array<number> = []; // generic type
// const numResults: number[] = [];

const stringResults: string[] = [];

type NumOrString = number | string; // Type Aliases
type Result = { val: number; timestamp: Date }; // Type Aliases
//for basic type aliases using type or interface does not matter
// can use Classes to instaiate types for exmaple Date is a clas
interface ResultObj {
    //defines structure of object
    val: number;
    timestamp: Date;
}

function add(num1: NumOrString, num2: NumOrString) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + ' ' + num2;
    }
    return +num1 + +num2;
}

function printResult(resultObj: ResultObj) {
    console.log(resultObj.val);
}

buttonElement.addEventListener('click', () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    const result = add(+num1, +num2);
    console.log(result);
    numResults.push(result as number);
    const stringResult = add(num1, num2);
    stringResults.push(stringResult as string);
    printResult({ val: result as number, timestamp: new Date() });
    console.log(numResults, stringResults);
});

const myPromise = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
        resolve('one second has passed');
    }, 1000);
});

myPromise.then(res => console.log(res.split('e')));
