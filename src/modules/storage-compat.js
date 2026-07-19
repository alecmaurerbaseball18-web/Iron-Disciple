import {Storage} from "./storage.js";
export const get=Storage.get.bind(Storage);
export const set=Storage.set.bind(Storage);
export const remove=Storage.remove.bind(Storage);
