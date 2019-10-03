import { AccountsTemplate } from 'meteor/useraccounts:core';
import { Accounts } from 'meteor/accounts-base';

import { isValidName, isValidPhone } from '/imports/api/users/validation';

AccountsTemplates.configure({
    defaultLayout: 'mainUnauthLayout',
    defaultContentRegion: 'main',
    showForgotPasswordLink: true,
});

AccountsTemplates.configureRoute('signIn', {
    layoutType: 'blaze',
    path: '/signin',
    redirect: '/my-trips',
});

AccountsTemplates.configureRoute('signUp', {
    name: 'signup',
    path: '/signup',
    redirect: '/my-trips',
});

AccountsTemplates.configureRoute('forgotPwd', {
    name: 'forgotpwd',
    path: '/forgot-password',
    redirect: '/signin',
});

AccountsTemplates.configureRoute('resetPwd', {
    name: 'resetpwd',
    path: '/reset-password',
    redirect: '/signin',
});