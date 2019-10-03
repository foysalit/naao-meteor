import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '../../ui/pages/not-found/not-found.js';
import '../../ui/pages/dashboard/dashboard.js';
import '../../ui/layouts/unauth/main.js';
import '../../ui/pages/settings/main.js';
import '../../ui/pages/trips/single.js';
import '../../ui/layouts/auth/main.js';
import '../../ui/pages/trips/list.js';
import '../../ui/pages/home/home.js';

// Set up all routes in the app
FlowRouter.route('/', {
    name: 'home',
    action() {
        BlazeLayout.render('mainUnauthLayout', { 
            main: 'homePage' 
        });
    },
});

FlowRouter.route('/trips', {
    name: 'trips',
    action() {
        BlazeLayout.render('mainUnauthLayout', { 
            main: 'listTripsPage' 
        });
    },
});

FlowRouter.route('/trips/:_id', {
    name: 'trips.single',
    action() {
        BlazeLayout.render('mainAuthLayout', { 
            main: 'singleTripsPage' 
        });
    },
});

FlowRouter.route('/my-trips', {
    name: 'my-trips',
    action() {
        BlazeLayout.render('mainAuthLayout', { 
            main: 'dashboardPage' 
        });
    },
});

FlowRouter.route('/settings', {
    name: 'settings',
    action() {
        BlazeLayout.render('mainAuthLayout', { 
            main: 'mainSettingsPage' 
        });
    },
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('mainUnauthLayout', { main: 'appNotFound' });
    },
};
