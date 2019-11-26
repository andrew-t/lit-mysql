const Query = require('./Query');

function q(sqlParts, ...params) {
	return new Query({ sqlParts, params });
}

function withDb(db) {
	return (...a) => q(...a).run(db);
}

module.exports = { q, withDb };
