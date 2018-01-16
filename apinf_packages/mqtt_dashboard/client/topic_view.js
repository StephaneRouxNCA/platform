/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

import {ReactiveVar} from "meteor/reactive-var";
import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

import moment from 'moment';
import AclRules from '../collection';
Template.topicPage.onCreated(function () {
  let subscription;

  this.autorun(() => {
    const topicId = FlowRouter.getParam('id');

    if (topicId) {
      subscription = this.subscribe('topicAclRules', topicId);
    }
  });

  this.autorun(() => {
    const isReady = subscription.ready();

    if (isReady) {
      console.log(AclRules.findOne())
    }
  });

  this.dataType = new ReactiveVar('message_published');

  const instance = this;

  instance.queryOption = {
    // 10/19/2017
    from: 1508360400000,
    eventType: this.dataType.get(),
    // "10/04/2017"
    doublePeriodAgo: 1507064400000,
    // 10/19/2017
    onePeriodAgo: 1508360400000,
    // "11/03/2017"
    to: 1509656400000,
  };

  const topicValue = "/sm5/79";

  instance.aggregatedData = new ReactiveVar();
  instance.publishedMessages = new ReactiveVar(0);
  instance.trend = new ReactiveVar({});

  instance.eventType = new ReactiveVar('message_published');

  instance.lastUpdatedTime = 0;

  this.sendRequest = () => {
    this.lastUpdatedTime = this.queryOption.to;

    // fetch data for Published messages
    // const getPubMessages = getPublishedClients(this.queryOption);

    // getPubMessages.query.bool.must.push({
    //   term: {
    //     "topic.keyword": topicValue
    //   }
    // });

    // Meteor.call('sendElastisticsearchRequest', getPubMessages, (error, result) => {
    //   if (error) {
    //     sAlert.error(error.message);
    //   } else {
    //     const elasticsearchData = result.aggregations.data_over_time.buckets;
    //
    //     if (elasticsearchData.length === 0) {
    //       // Set
    //       elasticsearchData.push({
    //         doc_count: 0,
    //         key: this.queryOption.from,
    //       });
    //     }
    //     instance.aggregatedData.set(elasticsearchData);
    //
    //     // Store info about pub clients
    //     const publishedClientsData = publishedClients(elasticsearchData);
    //     instance.publishedClientsData.set(publishedClientsData);
    //   }
    // });
  };
  this.sendRequest();

  // setInterval(() => {
  //   this.queryOption.from = this.lastUpdatedTime;
  //   this.queryOption.to = moment(this.lastUpdatedTime).add(1, 'd').valueOf();
  //   this.sendRequest();
  // }, 5000);

  // Watching for changes of Radio button status. What kind of that is checked
  this.autorun(() => {
    this.queryOption.eventType = this.dataType.get();
    // Fetch data to particular event type
    this.sendRequest();
  });
});

Template.topicPage.helpers({
  aggregatedData () {
    return Template.instance().aggregatedData.get();
  },
  topicItem () {
    return AclRules.findOne();
  },
});

Template.topicPage.events({
  'click [name="data-type"]': (event, templateInstance) => {
    const dataType = event.currentTarget.value;
    templateInstance.dataType.set(dataType);
  },
});

function publishedClients (elasticsearchData) {
  // no data
  if (elasticsearchData.length === 0) {
    // Return the null data
    return [{
      doc_count: 0,
      key: this.queryOption.from,
    }]
  }

  return elasticsearchData.map(dataset => {
    return {
      // Get data
      key: dataset.key,
      // get count of unique users
      doc_count: dataset.pub_clients.buckets.length
    }
  });
}

Template.topicPage.onRendered(function () {

});
