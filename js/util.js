
function genURLTemplate(str) {
	return Function(
		'o',
		'return "' +
			str.replace(/"/g, '\\"').replace(/\$(\w+)/g, function($0, $1) {
				return '" + o.' + $1 + ' + "';
			}) + '";'
	);
}