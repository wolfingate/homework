const Person = require(__dirname+"/person");


const p1 = new Person;
const p2 = new Person(name = "Peter", age = 30);
console.log(p1.toJSON());
console.log(p2.toJSON());