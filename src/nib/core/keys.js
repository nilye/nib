const isIOS = !!window && !!navigator && /iPad|iPhone|iPod/.test(navigator.userAgent)
const isMac = !!navigator && /Mac OS X/.test(navigator.userAgent)
const modifiers = {
	cmd: 'metaKey',
	command: 'metaKey',
	ctrl: 'ctrlKey',
	control: 'ctrlKey',
	mod: isMac ? 'metaKey' : 'ctrlKey',
	shift: 'shiftKey',
	alt: 'altKey',
	opt: 'altKey',
	option: 'altKey'
}

/**
 * hotKey mappings for each system
 */
const hotKeys = {
	bold: 'mod+b',
	italic: 'mod+i',
	underline: 'mod+u',
	deleteBackward: 'backspace',
	deleteForward: 'delete',
	delete: ['backspace', 'delete'],
	enter: 'enter',
	exit: 'mod+enter',
	tab: 'tab',
	backTab: 'shift+tab',
	undo: 'mod+z',
	redo: 'mod+shift+z'
}

const appleHotKeys = {
	deleteBackward: ['ctrl+h'],
	deleteForward:  ['ctrl+d', 'ctrl+k']
}
appleHotKeys.delete = [...appleHotKeys.deleteBackward, ...appleHotKeys.deleteForward]

const windowsHotKeys = {
	redo: 'ctrl+y'
}


const Keys = {

	/**
	 * register key to hotKey mappings for each system
	 * @param name
	 * @param key
	 * @param {'apple'|'windows'|string} system
	 */
	registerKey(name, key, system){
		switch (system){
			case 'apple':
				appleHotKeys[name] = key
				break
			case 'windows':
				windowsHotKeys[name] = key
				break
			default:
				hotKeys[name] = key
		}
	},

	/**
	 * parse hotKey string (from hotKey mapping) into mods (modifiers) and key value
	 * @param str
	 * @returns {{mods: Array, key: string}}
	 */
	parse(str){
		const keys = str.toLowerCase().split('+')
		let mods = [], key = ''
		keys.forEach(k => {
			if (k in modifiers) mods.push(modifiers[k])
			else if (!key) key = k
		})
		return {mods, key}
	},

	/**
	 * whether the event matches the hotKey mapping
	 * @param hotKeys
	 * @param event
	 * @returns {boolean}
	 */
	match(hotKeys, event) {
		if (!Array.isArray(hotKeys)){
			hotKeys = [hotKeys]
		}

		const keysParsed = hotKeys.map(str => this.parse(str))
		return keysParsed.some(keys => {
			for (let i of keys.mods) {
				if (!event[i]) return false
			}
			return event.key.toLowerCase() === keys.key
		})
	},

	/**
	 * whether the event is the desired hotKey
	 * @param hotKey
	 * @param event
	 * @returns {boolean}
	 */
	is(hotKey, event){
		const generic = hotKeys[hotKey],
			apple = appleHotKeys[hotKey],
			win = appleHotKeys[hotKey]
		if (generic && this.match(generic, event)) return true
		if (isMac && apple && this.match(apple, event)) return true
		if (!isMac && win && this.match(win, event)) return true
		return false
	}
}

export default Keys