import { Images } from "./collection";

export const findProfilePic = (userId) => {
    return Images.find({ 'meta.module': 'user', 'meta.parentId': userId }).cursor;
};