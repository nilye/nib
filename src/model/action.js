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