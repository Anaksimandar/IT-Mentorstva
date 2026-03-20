const users = require("./users");

// Zadatak 1:
// Kreirati listu korisnika u fajlu "users.js", eksportovati ih
// i ispisati sve korisnike iz niza "users" u konzoli.
users.forEach((user) => {
	console.log(user);
});
