import { clone } from '../..'
import Blk from '../step/blk'
import {StoreAction, UPDATE_VALUE} from "./action";
import {NodeEntry} from "../..";
import {Path} from "../..";
import {StoreState} from "./store";

export function reducer(
	state: StoreState,
	actions: StoreAction | StoreAction[]
): StoreState{
	let data = clone(state)

	if (!Array.isArray(actions)) actions = [actions]
	for (let action of actions){
		const payload = action.payload as any

		switch (action.type) {
			case UPDATE_VALUE: {
				data.value = payload.value
				break
			}
			//
			// case UPDATE_NODE: {
			// 	const {path, node} = payload
			// 	Blk.set(data.value, path, node)
			// 	break
			// }
			//
			// case INSERT_NODE: {
			// 	const {path, node} = payload
			// 	Blk.insert(data.value, path, node)
			// 	data.paths = Path.flatMap(data.value)
			// 	break
			// }
			//
			// case REMOVE_NODE: {
			// 	const {path} = payload
			// 	Blk.remove(data.value, path)
			// 	data.paths = Path.flatMap(data.value)
			// 	break
			// }
			default:
		}
	}
	return data
}