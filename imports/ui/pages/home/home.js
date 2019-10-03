import { Template } from 'meteor/templating';

import { getTempTrip, setTempTrip } from '/imports/api/trips/client/api';

import './home.html';
import '../../components/trip/create';
import '../../components/trip/summary';

Template.homePage.helpers({
    tempTrip () {
        return getTempTrip();
    }
});