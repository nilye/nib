import { genKey } from './util'

class EventBus {
	constructor () {
		this.pool = {}
	}

	on (event, cb) {
		const id = genKey()
		if (!this.pool[event]) {
			this.pool[event] = {}
		}
		this.pool[event][id] = cb

		return {
			off: () => {
				delete this.pool[event][id]
				if (Object.keys(this.pool[event]).length === 0) {
					delete this.pool[event]
				}
			}
		}
	}

	emit (event, data) {
		if (!this.pool[event]) return
		Object.keys(this.pool[event]).forEach(id => {
			this.pool[event][id](...data)
		})
	}
}

export default new EventBus()