import { ReactiveDict } from "meteor/reactive-dict";
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { UserProfileSchema } from "../../../api/users/schema";
import './profile-create.html';

Template.createProfileUsers.onCreated(function () {
    this.creator = new ReactiveDict();
});

Template.createProfileUsers.onRendered(function () {
    this.creator.set('errors', []);

    this.$name = this.$('[name="name"]');
    this.$phone = this.$('[name="phone"]');
    this.$address = this.$('[name="address"]');
});

Template.createProfileUsers.helpers({
    errors() {
        return Template.instance().creator.get('errors');
    },
    creator() {
        return Template.instance().creator.all();
    }
});

function getProfileInputs (tpl) {
    return {
        name: tpl.$name.val(),
        phone: tpl.$phone.val(),
        address: tpl.$address.val(),
    };
};

Template.createProfileUsers.events({
    'submit form': function (e, tpl) {
        e.preventDefault();
        const profileData = UserProfileSchema.clean(getProfileInputs(tpl));

        try {
            UserProfileSchema.validate(profileData);
            tpl.creator.set('errors', null);
            tpl.creator.set('working', true);
            Meteor.call('users.update.profile', profileData, (err, res) => {
                tpl.creator.set('working', false);

                if (err) {
                    return tpl.creator.set('errors', [err.message]);
                }

                tpl.creator.set('updated', true);
                Meteor.setTimeout(() => tpl.creator.set('updated', false), 5000);
            });
        } catch (err) {
            tpl.creator.set('errors', [err.message]);
        }
    }
});
