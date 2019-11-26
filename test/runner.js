// Feel free to xdescribe this whole thing out if you don't want to test against a real database. Just don't check it in that way.

const mysql = require('mysql'),
	Query = require('../src/Query'),
	assert = require('assert');

describe('query runner', () => {

	const db = mysql.createConnection(require('./creds.json'));

	it('should run the query', async () => {
		const result = await new Query({
			sqlParts: [ 'SELECT ', ' AS one' ],
			params: [ 1 ]
		}).run(db);
		assert.deepEqual([ { one: 1 } ], plain(result));
	});

	it('should nest queries', () => {
		const q1 = new Query({
			sqlParts: [ 'SELECT ', ' AS one' ],
			params: [ 1 ]
		});
		const q2 = new Query({
			sqlParts: [ '', ' WHERE 2 = ', '' ],
			params: [ q1, 2 ]
		});
		assert.deepEqual([ ' SELECT ', ' AS one  WHERE 2 = ', '' ], q2.sqlParts);
		assert.deepEqual([ 1, 2 ], q2.params);
	});

	after(() => db.end());
});

function plain(o) {
	return JSON.parse(JSON.stringify(o));
}
