import { _ } from "meteor/underscore";

import { Messages } from "./collection";

export const getMessages = (filters = {}, options = {}) => {
    options = _.extend({ sort: { createdAt: -1 } }, options);

    return Messages.find(filters, options);
};