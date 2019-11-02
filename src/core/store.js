import { createStore } from 'redux'

function updateBlk(key, value){
	return {type: 'update_blk', key, value}
}

const store = createStore(reducer, {})