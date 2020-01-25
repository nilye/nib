import { genKey } from '../core/util'

const Schema = {

	/**
	 * check if is a block schema
	 * @param obj
	 * @returns {boolean|*}
	 */
	isBlock (obj) {
		return obj.kind == 'blk' && obj.key
	},

	/**
	 * check if is text schema
	 * @param obj
	 * @returns {boolean|*}
	 */
	isText (obj) {
		return obj.kind == 'txt' && obj.text
	},

	/**
	 * check if is a pristine or paragraph (the most prime) block
	 * @param obj
	 * @returns {boolean}
	 */
	isPristine(obj){
		return !obj.type || obj.type == 'p'
	},

	block (a = {}) {
		let obj = {
			key: genKey(),
			kind: 'blk',
			type: a['type'] || 'p',
			nodes: a.nodes || [this.text()]
		}
		return Object.assign(obj, a)
	},

	text (a = {}) {
		return Object.assign({
				kind: 'txt',
				text: a['text'] || ''
			},
			a.attr && { attr: a.attr })
	},

	paragraph (nodes = []) {
		return this.block({ nodes, type: 'p' })
	}
}

export default Schema