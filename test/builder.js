const { q, values, paramList, Query } = require('..'),
	assert = require('assert');

describe('query builder', () => {
	it('should build a basic query', () => {
		const query = q`SELECT ${1} AS one`;
		assert.deepEqual([ 'SELECT ', ' AS one' ], query.sqlParts);
		assert.deepEqual([ 1 ], query.params);
	});

	it('should build an insert query using values', () => {
		const query = q`INSERT INTO table ${values({ a: 1, b: null })}`;
		assert.deepEqual(
			[ 'INSERT INTO table  (`a`, `b`) VALUES (', ', ', ') ' ],
			query.sqlParts);
		assert.deepEqual([ 1, null ], query.params);
	});

	it('should build an update query using paramList', () => {
		const query = q`UPDATE table SET ${paramList({ a: 1, b: null })}`;
		assert.deepEqual(
			[ 'UPDATE table SET  `a` = ', ', `b` = ', ' ' ],
			query.sqlParts);
		assert.deepEqual([ 1, null ], query.params);
	});
});
