const Query = require('./Query');

function values(obj) {
	const keys = Object.keys(obj),
		keyList = [],
		params = [];
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i],
			value = obj[key];
		if (value === undefined) continue;
		keyList.push(escapeCol(key));
		params.push(value);
	}
	const sqlParts = [ `(${ keyList.join(', ') }) VALUES (` ];
	for (let i = 1; i < params.length; ++i)
		sqlParts.push(', ');
	sqlParts.push(')');
	return new Query({ sqlParts, params });
}

function paramList(obj, separator) {
	const keys = Object.keys(obj),
		sqlParts = [],
		params = [];
	for (let i = 0; i < keys.length; ++i) {
		const key = keys[i],
			value = obj[key];
		if (value === undefined) continue;
		sqlParts.push(`${ i > 0 ? separator : ''}${escapeCol(key)} = `);
		params.push(value);
	}
	sqlParts.push('');
	return new Query({ sqlParts, params });
}

function escapeCol(col) {
	if (/`/.test(col)) throw new Error('You cannot use backticks in column names.');
	return `\`${col}\``;
}

module.exports = {
	values,
	paramList: obj => paramList(obj, ', '),
	whereList: obj => paramList(obj, ' AND ')
};
