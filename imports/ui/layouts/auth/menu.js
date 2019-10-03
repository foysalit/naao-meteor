import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';

import './menu.html';

Template.menuAuthLayout.onCreated(function () {
    this.state = new ReactiveDict();
});

Template.menuAuthLayout.onRendered(function () {
    this.autorun(() => {
        FlowRouter.watchPathChange();
        const { name } = FlowRouter.current().route;
        this.state.set('currentRouteName', name);
    });
});

Template.menuAuthLayout.helpers({
    isCurrentRoute (route) {
        return Template.instance().state.get('currentRouteName') == route;
    }
});