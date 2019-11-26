# lit-mysql

A dead simple way to make safe MySQL calls using template literals.

One hundred lines. No build process, no dependenices (although you will need a [mysql](https://www.npmjs.com/package/mysql)-compatible connection object since this is not a MySQL library; merely a nice interface wrapper).

## Aims

You don't want to be open to SQL injections, but prepared statements with the parameters listed afterwards are hard to read, and having an 'escape' funtion you have to remember to call every time opens you up to forgetting. This library uses template literals so you can write readable but secure queries:

```js
const mysql = require('mysql'),
	credentials = require('./credentials.json'),
	{ withDb } = require('lit-mysql');

// One-time setup
const conn = mysql.createConnection(credentials),
	sql = withDb(conn);

// Query the database — it's safe to pass in user input here as lit-mysql generates a prepared statement behind the scenes.
const [ user ] = await sql`SELECT * FROM users WHERE id = ${ id }`;

// Tear-down
conn.end();
```

You can also nest queries if you need to build advanced uses:

```js
const { q } = require('lit-mysql');

let query = q`SELECT * FROM users`;

if (filter) query = q`${query} WHERE name LIKE ${ filter }`;
if (direction) query = q`${query} SORT id ${ direction }`;

const users = await query.run(db);
```

Lastly there are helper methods to generate mini-queries, so you can use the nesting to simplify otherwise ugly SQL syntax:

```js
const { sql, values } = require('lit-mysql');

await sql`INSERT INTO users ${values({
	id: username,
	admin: false,
	confirm: uuid()
})}`;
```

(`values` returns something like `(id, admin, confirm) VALUES ('andrew', 0, 'abcd-efgh')` — queries aren't required to make any sense until they're run.)

We also offer:

```js
const { sql, paramList } = require('lit-mysql');

await sql`UPDATE users SET ${paramList({
	admin: true,
	confirm: null
})} WHERE id = ${username}`;
```

and

```js
const { sql, whereList } = require('lit-mysql');

await sql`SELECT * FROM users WHERE ${whereList({
	id: username,
	password: hash(password)
})}`;
```

just in case they're of use.

## Testing

Run `npm run test`.

You will need a SQL server for the tests in `runner.js`, and a `creds.json` file which looks like this:

```js
{
	"host": "127.0.0.1",
	"port": 3306,
	"user": "andrew",
	"password": "sw0rdf15h",
	"database": "default_db" // optional
}
```

Feel free to hack around with that, the actual connection to MySQL isn't our responsibility so we don't strictly need to test it. It just seems smart to make sure the whole end-to-end thing actually works.
