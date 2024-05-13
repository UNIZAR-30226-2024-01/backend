let resultArray = [
    { exito: true, user: 'bot6367495', card: 'mr SOPER' },
    { exito: true, user: 'bot6367491', card: 'teclado' },
    { exito: true, user: 'bot6367494', card: 'aulas norte' }
  ]

console.log("resultArray: ", resultArray);
let usernameByOrder = [
    'bot6367490',
    'bot6367491',
    'bel',
    'bot6367493',
    'bot6367494',
    'bot6367495'
  ]

let usernameQuestioner = 'bel';

//eliminas las cartas que tiene el jugador que pregunta
resultArray = resultArray.filter((row) => row.user !== usernameQuestioner);

console.log("resultArray: ", resultArray);

let i = usernameByOrder.indexOf(usernameQuestioner);

console.log("i: ", i);
// Ordenar el array de resultArray según el orden de usernameByOrder y empezando por i
let resultArrayOrdered = [];
let j = i+1;
for (let k = 0; k < usernameByOrder.length; k++) {
    j %= usernameByOrder.length;
    let row = resultArray.find((row) => row.user === usernameByOrder[j]);
    console.log("row: ", row, "j: ", j);
    if (row) {
        resultArrayOrdered.push(row);
        break;
    }
    j++;
}

console.log("resultArray: ", resultArrayOrdered);
// resultArray tiene ordenados los jugadores que tienen alguna de las cartas
// quieres el primer jugador en el order de usernameByOrder a partir de ti, que aparece en resultArra
