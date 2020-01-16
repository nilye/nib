import { genKey } from '../core/util'

function block(a = {}){
	let obj = {
		key: genKey(),
		kind: 'block',
		type: a['type'] || 'p',
	}
	if (a.nodes) obj.nodes = a.nodes
	return Object.assign(obj, a)
}

const schema = {
	text(a = {}){
		return Object.assign({
			kind: 'text',
			text: a['text'] || ''
		},
		a.attr && { attr: a.attr })
	},
	paragraph(nodes = []){
		return block({nodes, type:'p'})
	}
}

export default schema