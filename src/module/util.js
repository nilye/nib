const keyPool = {}

export function genKey() {
	const gen = () => Math.random().toString(16).substr(2, 12)
	let key = gen()
	while (keyPool.hasOwnProperty(key)) {
		key = gen()
	}
	keyPool[key] = true
	return key
}