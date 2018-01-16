/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

Template.topicsPage.onCreated(function () {
  // this.topicsList = [
  //   {
  //   value: ,
  //   id: 1
  //   },
  //
  // ];
  this.topicsList = new ReactiveVar();

  const a = {};

  Meteor.call('', this.dateRange, (error, result) => {
    if (error) {
      sAlert.error(error.message)
    } else {

    }
  });
});

Template.topicsPage.helpers({
  topicsList () {
    return [
      {
        id: '123',
        value: '/topic',
        incoming: 24,
        outgoing: 25,
        publishedMessages: 123,
        deliveredMessages: 234,
        publishedClients: 10,
        subscribedClients: 20,
      },
      {
        id: '234',
        value: '/topic1',
        incoming: 34,
        outgoing: 35,
        publishedMessages: 100,
        deliveredMessages: 200,
        publishedClients: 15,
        subscribedClients: 25,
      },
      {
        id: '345',
        value: '/topic2',
        incoming: 14,
        outgoing: 15,
        publishedMessages: 200,
        deliveredMessages: 300,
        publishedClients: 5,
        subscribedClients: 56,
      },
    ];
  },
});
