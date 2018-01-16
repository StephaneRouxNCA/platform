/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Meteor contributed packages imports
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Roles } from 'meteor/alanning:roles';

// Collection imports
import AclRules from '../';

Meteor.publish('allAclRules', function () {
  return AclRules.find();
});

Meteor.publish('favoriteTopics', function () {
  return AclRules.find({ starred: true });
});
