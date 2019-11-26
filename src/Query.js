class Query {
	constructor({ sqlParts, params }) {
		if (!Array.isArray(sqlParts)) throw new Error('sqlParts must be an array.');
		if (!Array.isArray(params)) throw new Error('params must be an array.');
		if (params.length != sqlParts.length - 1) throw new Error('Parameter lengths are incompatible.');

		// Step through the params array so we can inline any nested queries.
		this.sqlParts = [ sqlParts[0] ];
		this.params = [];
		for (let i = 0; i < params.length; ++i) {
			const param = params[i];
			if (param instanceof Query) {
				// We don't have to go any deeper than this — any nested queries in params should have been flattened when it was constructed. Just copy all the sqlParts and params over from the new query.
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

	// Safely runs the query.
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

	// Generates a text encoding of the query for logging etc.
	// Do not run this as a text query, it is not safe.
	logString() {
		let logString = this.sqlParts[0];
		for (let i = 0; i < this.params.length; ++i) {
			const param = this.params[i];
			logString += param === null ? 'NULL' : param.toString();
			logString += this.sqlParts[i + 1];
		}
		return logString.trim();
	}
}

// Adds some SQL to the end of the query without adding a parameter.
function _appendSql(q, newSql) {
	const lastSqlPart = q.sqlParts.pop();
	// Add a space in case it's needed; can't do any harm.
	q.sqlParts.push(`${lastSqlPart} ${newSql}`);
}

module.exports = Query;
