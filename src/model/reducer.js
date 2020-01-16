import { clone, setValue, getValue, deleteValue } from './util'

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
	INSERT_BLK: (state, payload) => {
		const {index, value, blkPath} = payload
		let data = clone(state)
		let blk = getValue(data, blkPath)
		blk.splice(index, 0, value)
		return data
	},
	REMOVE_BLK: (state, payload) => {
		const {path} = payload
		let data = clone(state)
		deleteValue(data, path)
		return data
	}
}