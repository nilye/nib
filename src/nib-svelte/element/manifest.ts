import Paragraph from './Paragraph.svelte'
import {Icons} from 'nib'
import {Editor, Path, Node} from "../../nib";

export interface ElmentManifest {
	component: any,
	menus: any[],
	method: (editor: Editor, path: Path, option?)=>void
}

const textElement = {
	component: Paragraph,
	menus: [
		{name: 'Paragraph', icon: Icons.paragraph, value: 'p'},
		{name: 'Heading 1', icon: Icons.heading1,  value: 'h1'},
		{name: 'Heading 2', icon: Icons.heading2,  value: 'h2'},
		{name: 'Heading 3', icon: Icons.heading3,  value: 'h3'},
	],
	method(
		editor: Editor,
		path: Path,
		option: 'p' | 'h1' | 'h2' | 'h3' = 'p'
	): void{
		let value = editor.value(),
			node = Node.get(value, path) as Node
		node.type = option
		editor.updateNode(path, node)
	}
}

const elements =  {
	p:  textElement,
	h1: textElement,
	h2: textElement,
	h3: textElement
}

export default elements