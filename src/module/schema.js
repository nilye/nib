import { genKey } from './util'

const schema = {
	prime(a = {}){
		return Object.assign({
			key: genKey(),
			kind: 'prime',
			type: a['type'] || 'p'
		},
		a.data && { data: a.data },
		a.nodes && { nodes: a.nodes })
	},
	text(a = {}){
		return Object.assign({
			kind: 'text',
			text: a['text'] || ''
		},
		a.attr && { attr: a.attr })
	}
}

export default schema