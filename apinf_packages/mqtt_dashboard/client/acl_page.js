/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

Template.aclPage.events({
  'submit form': (event, templateInstance) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const topicValue = formData.get('topic');

  },
});
