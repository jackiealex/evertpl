function req () {
	try {
		delete require.cache['dfsa'];
		return require('aadfa')
	} catch(err) {
		return 
	}
}

req()