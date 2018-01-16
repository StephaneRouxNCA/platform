/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */
// Meteor packages imports
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/mqtt', {
  name: 'mqtt',
  action () {
    BlazeLayout.render('mqttDashboardLayout', { main: 'mqttDashboardPage' });
  },
});

FlowRouter.route('/topics', {
  name: 'topics',
  action () {
    BlazeLayout.render('mqttDashboardLayout', { main: 'topicsPage' });
  },
});

FlowRouter.route('/topics/:id', {
  name: 'topicPage',
  action () {
    BlazeLayout.render('mqttDashboardLayout', { main: 'topicPage' });
  },
});

FlowRouter.route('/acl', {
  name: 'acl',
  action () {
    BlazeLayout.render('mqttDashboardLayout', { main: 'aclPage' });
  },
});
