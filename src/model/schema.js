import { genKey } from '../core/util'

function block(a = {}){
	return Object.assign({
			key: genKey(),
			kind: 'block',
			type: a['type'] || 'p',
			nodes: a['nodes'] || []
		}, a)
}

const schema = {
	text(a = {}){
		return Object.assign({
			kind: 'text',
			text: a['text'] || ''
		},
		a.attr && { attr: a.attr })
	},
	paragraph(nodes){
		return block({nodes, type:'p'})
	}
}

export default schema