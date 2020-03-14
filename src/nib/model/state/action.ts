import {Path, Range,Node, NodeEntry, Root} from "../..";
import {Action} from "redux";

export const UPDATE_VALUE = 'UPDATE_VALUE'

export interface updateValueAction extends Action{
	type: typeof UPDATE_VALUE
	payload: { value: Root }
}

export function updateValue(value: Root,): updateValueAction{
	return {
		type: UPDATE_VALUE,
		payload: { value }
	}
}

export type StoreAction = updateValueAction