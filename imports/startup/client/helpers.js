import { Template } from 'meteor/templating';
import moment from "moment";

Template.registerHelper('day', (date) => {
    return moment(date).format("MMMM DD, YYYY");
});

Template.registerHelper('equals', (a, b) => {
    return a == b;
});

Template.registerHelper('or', (a, b) => {
    return a || b;
});

Template.registerHelper('and', (a, b) => {
    return a && b;
});
