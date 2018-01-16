/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Roles } from 'meteor/alanning:roles';

// Collection imports
import AclRules from './';

AclRules.allow({
  insert (userId) {
    // Check if user has admin role
    return true;
  },
  update (userId) {
    // Check if user has admin role
    return true;
  },
  remove (userId) {
    // Check if user has admin role
    return true;
  },
});
