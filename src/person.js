class Person {
    constructor(name = "noname", age = 20) {
        this.name = name;
        this.age = age;
    }
    toJSON() {
        return JSON.stringify({
            name: this.name,
            age: this.age
        })
    }


}
const p1 = new Person;
const p2 = new Person(name = "Peter", age = 30);
console.log(p1.toJSON());
console.log(p2.toJSON());

module.exports = Person;