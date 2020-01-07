import Text from './Text.svelte'
import paragraphIcon from '../assets/icon/paragraph.svg'
import heading1Icon from '../assets/icon/heading1.svg'
import heading2Icon from '../assets/icon/heading2.svg'
import heading3Icon from '../assets/icon/heading3.svg'

const text = {
	component: Text,
	menu: [
		{
			icon: paragraphIcon,
			name: 'Paragraph',
			data: 'p'
		},{
			icon: heading1Icon,
			name: 'Heading 1',
			data: 'h1'
		},{
			icon: heading2Icon,
			name: 'Heading 2',
			data: 'h2'
		},{
			icon: heading3Icon,
			name: 'Heading 3',
			data: 'h3'
		}
	]
}

export default {
	p:  text,
	h1: text,
	h2: text,
	h3: text
}