import { clone} from './util'
import Blk from './blk'

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
		Blk.set(data, path, value)
		return data
	},
	INSERT_BLK: (state, payload) => {
		const {index, value, blkPath} = payload
		let data = clone(state)
		Blk.insert(data, blkPath, index, value)
		return data
	},
	REMOVE_BLK: (state, payload) => {
		const {path} = payload
		let data = clone(state)
		Blk.remove(data, path)
		return data
	}
}