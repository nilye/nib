/**
 * @param {Array} path - array of blk access keys
 * @param value
 */
export function updateBlk(path, value){
	return {
		type: 'UPDATE_BLK',
		payload: {path, value}
	}
}

/**
 * @param {Number} index - index to insert
 * @param value
 * @param {Array} blkPath - the parent block path
 * @returns {{payload: {index: *, value: *}, type: string}}
 */
export function insertBlk(index, value, blkPath = []){
	if (!Array.isArray(blkPath)){
		throw TypeError('blkPath has to be array')
	}
	return {
		type: 'INSERT_BLK',
		payload: {index, value, blkPath}
	}
}

/**
 * @param path
 * @returns {{payload: {path: *}, type: string}}
 */
export function removeBlk(path){
	return {
		type: 'REMOVE_BLK',
		payload: {path}
	}
}
