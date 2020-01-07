import { clone, findBlk, setValue, splitNode } from './util'

export function reducer (state, action) {
	if (methods.hasOwnProperty(action.type)){
		return methods[action.type](state, action['payload'])
	}
	return state
}

const methods = {
	UPDATE_BLK: (state, payload) => {
		const {path, value} = payload
		let data = clone(state)
		setValue(data, path, value)
		return data
	},

}
