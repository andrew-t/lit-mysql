class Query {
	constructor({ sqlParts, params }) {
		if (!Array.isArray(sqlParts)) throw new Error('sqlParts must be an array.');
		if (!Array.isArray(params)) throw new Error('params must be an array.');
		if (params.length != sqlParts.length - 1) throw new Error('Parameter lengths are incompatible.');

		// Inline queries get flattened:
		this.sqlParts = [ sqlParts[0] ];
		this.params = [];
		for (let i = 0; i < params.length; ++i) {
			const param = params[i];
			if (param instanceof Query) {
				// We don't have to go any deeper than this — any nested queries in params should have been flattened when it was constructed.
				_appendSql(this, param.sqlParts[0]);
				this.sqlParts.push( ...param.sqlParts.slice(1) );
				_appendSql(this, sqlParts[i + 1]);
				this.params.push( ...param.params );
			} else {
				this.params.push(param);
				this.sqlParts.push(sqlParts[i + 1]);
			}
		}
	}

	run(db) {
		return new Promise((resolve, reject) =>
			db.query(
				this.sqlParts.join('?'),
				this.params,
				(error, results, fields) => {
					if (error) reject(error);
					else resolve(results);
				}));
	}
}

function _appendSql(q, newSql) {
	const lastSqlPart = q.sqlParts.pop();
	q.sqlParts.push(`${lastSqlPart} ${newSql}`);
}

module.exports = Query;
