import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import './main.html';
import '../../components/users/profile-create';
import '../../components/users/profile-show';

Template.mainSettingsPage.onCreated(function () {
    this.state = new ReactiveDict();
});

Template.mainSettingsPage.helpers({
    state () {
        return Template.instance().state.all();
    }
});

Template.mainSettingsPage.events({
    'click .toggle-profile-editor-js' (e, tpl) {
        e.preventDefault();
        return tpl.state.set('showEdit', !tpl.state.get('showEdit'));
    }
});