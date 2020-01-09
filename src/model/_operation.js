import { charIndex, clone, equal, findBlk, locateNodes } from './util'
import { updateBlk } from './action'
import _selection from '../core/_selection'
/**
 * split a node data
 * @param {Object} node - node element
 * @param {number|null} start
 * @param {number|null} end
 * @returns {{nodes: Array, mIndex: number}} - {
 *   nodes: the array of new nodes
 *   mIndex: the index of the middle node
 * }
 */
function splitNode (node, start = 0, end) {
	let nodes = [], l = node.text.length,
		[s, m, e] = Array(3).fill(0).map(() => Object.assign({}, node))
	if (start && start != 0 && start < l) {
		s.text = node.text.substring(0, start)
		nodes.push(s)
	}
	if (!end) end = l
	m.text = node.text.substring(start, end)
	nodes.push(m)
	if (end < l) {
		e.text = node.text.substring(end)
		nodes.push(e)
	}
	let mIndex = nodes.indexOf(m)
	return { nodes, mIndex }
}

/**
 * merge items in a nodesList with the exact same attributes
 * @param {Array} nodesList
 * @returns {Array}
 */
function mergeNodes (nodesList){
	let nodes = clone(nodesList),
		newNodes = []
	for (let n of nodes){
		let last = newNodes[newNodes.length-1]
		console.log(last ? equal(n.attr, last.attr):null, newNodes)
		if (last && equal(n.attr, last.attr)){
			last.text += n.text
		} else {
			newNodes.push(n)
		}
	}
	return newNodes
}

/**
 * format currently selected content
 * steps:
 *  1. serialize the blk data
 *  2. modify the data of each node
 *  3. rearrange the array of nodes
 *  4. splice into the blk data
 *  5. serialize the selection range
 * @param store
 * @param sel
 * @param formatter
 * @param value
 * @returns {{newSelRange: {anchorOffset: number, endDataOffset: string, focusOffset: *, startDataOffset: string}}|{}}
 */
export function formatSelection (store, sel, formatter, value) {
	let data = clone(store.getState())
	// same node
	if (sel.sameNode) {
		const { blkVal, blkIndexes } = findBlk(data, sel.startKey),
			[sIndex, eIndex]= charIndex(blkVal, sel.startNodeOffset, sel.anchorOffset, sel.endNodeOffset, sel.focusOffset)
		// split
		let { nodes, mIndex } = splitNode(
			blkVal.nodes[sel.startNodeOffset],
			sel.anchorOffset,
			sel.focusOffset
		)
		nodes[mIndex] = formatter.setAttr(nodes[mIndex], value)
		// insert & modified nodes and update store
		blkVal.nodes.splice(sel.startNodeOffset, 1, ...nodes)
		blkVal.nodes = mergeNodes(blkVal.nodes)
		console.log('___', blkVal, sIndex, eIndex)
		store.dispatch(updateBlk(blkIndexes, blkVal))
		// reset selection range
		let startSel = locateNodes(blkVal, sIndex, true),
			endSel = locateNodes(blkVal, eIndex, false)
		console.log(startSel, endSel)
		return _selection.newSelRangeFromLocateNodes(startSel, endSel)
	}
	// same blk
	else if (sel.sameBlk) {
		const { blkVal, blkIndexes } = findBlk(data, sel.startKey),
			[sIndex, eIndex]= charIndex(blkVal, sel.startNodeOffset, sel.anchorOffset, sel.endNodeOffset, sel.focusOffset)
		let start = splitNode(blkVal.nodes[sel.startNodeOffset], sel.anchorOffset, null),
			startNode = start.nodes[start.mIndex],
			startIndex = sel.startNodeOffset + start.mIndex,
			end = splitNode(blkVal.nodes[sel.endNodeOffset], 0, sel.focusOffset),
			endNode = end.nodes[end.mIndex]
		// rearrange nodes need to be modified
		let modNodes = blkVal.nodes.slice(sel.startNodeOffset+1, sel.endNodeOffset)
		modNodes.unshift(startNode)
		modNodes.push(endNode)
		modNodes = modNodes.map(n => formatter.setAttr(n, value))
		// insert
		if (start.mIndex == 1) {
			modNodes.unshift(start.nodes[0])
		}
		if (end.nodes.length == 2) {
			modNodes.push(end.nodes[1])
		}
		blkVal.nodes.splice(sel.startNodeOffset,
			sel.endNodeOffset - sel.startNodeOffset +1,
			...modNodes)
		store.dispatch(updateBlk(blkIndexes, blkVal))
	}
	// different block

}

