/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

import {getTopicsData} from '../lib/es_requests';

import _ from 'lodash';

import AclRules from '../collection/index';

Template.topicsPage.onCreated(function () {
  // Get subscription handle
  const subscription = this.subscribe('allAclRules');

  this.topicsList = new ReactiveVar([]);

  // this.autorun(() => {
  //   // Get status of subscription reactively
  //   const aclRules = subscription.ready();
  //
  //   if (aclRules) {
  //     const topicsListData = [];
  //     const parsed = JSON.parse(a);
  //
  //     _.mapKeys(parsed, (topicBucket, topic) => {
  //       const acl = AclRules.findOne({ topic });
  //
  //       const topicData = {
  //         id: acl._id,
  //         starred: acl.starred,
  //         value: topic,
  //         incoming: 111,
  //         outgoing: 111,
  //         publishedMessages: 0,
  //         deliveredMessages: 0,
  //         subscribedClients: 0,
  //         publishedClients: topicBucket.client_publish.clients.value || 0,
  //       };
  //
  //       // Go through all event types and fill number
  //       topicBucket.event_types.buckets.forEach(dataset => {
  //         switch (dataset.key) {
  //           case 'message_published':
  //             topicData.publishedMessages = dataset.doc_count;
  //             break;
  //           case 'message_delivered':
  //             topicData.publishedMessages = dataset.doc_count;
  //             break;
  //           case 'client_subscribe':
  //             topicData.publishedMessages = dataset.doc_count;
  //             break;
  //           default:
  //             break;
  //         }
  //       });
  //
  //       topicsListData.push(topicData);
  //     });
  //
  //     this.topicsList.set(topicsListData);
  //     console.log(topicsListData)
  //   }
  // });
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
  newTopics () {
    return Template.instance().topicsList.get();
  },
  aclRules () {
    return AclRules.find().fetch();
  },
});
