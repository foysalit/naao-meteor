import { FilesCollection } from "meteor/ostrio:files";

export const Images = new FilesCollection({
    allowClientCode: false,
    collectionName: 'images',
    storagePath: Meteor.settings.uploadDir
});