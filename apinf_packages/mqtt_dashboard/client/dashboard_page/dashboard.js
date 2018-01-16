/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */
// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { calculateTrend, arrowDirection, percentageValue }
from '/apinf_packages/dashboard/lib/trend_helpers';

import { getHistogramData, getPublishedClients } from '../../lib/es_requests';
// NPM imports
import moment from 'moment';

Template.mqttDashboardPage.onCreated(function () {
  const instance = this;

  instance.queryOption = {
    // 12/15/2017
    from: 1515704400000,
    // "10/04/2017"
    doublePeriodAgo: 1507064400000,
    // 10/19/2017
    onePeriodAgo: 1508360400000,
    // "12/16/2017"
    to: 1516021029810,
  };

  instance.publishedMessages = new ReactiveVar(0);
  instance.trend = new ReactiveVar({});

  instance.publishedMessagesData = new ReactiveVar();
  instance.deliveredMessagesData = new ReactiveVar();
  instance.publishedClientsData = new ReactiveVar();
  instance.subscribedClientsData = new ReactiveVar();

  instance.lastUpdatedTime = 0;

  this.sendRequest = () => {
    this.lastUpdatedTime = this.queryOption.to;

    // fetch data for Published messages
    const getPubMessages = getPublishedClients(this.queryOption);

    Meteor.call('sendElastisticsearchRequest', getPubMessages, (error, result) => {
      console.log('message_published', 'send request');
      if (error) {
        sAlert.error(error.message);
      } else {
        const elasticsearchData = result.aggregations.data_over_time.buckets;

        const publishedClientsData = publishedClients(elasticsearchData);
console.log('pub_clietns', publishedClientsData)
        if (elasticsearchData.length === 0) {
          // Set
          elasticsearchData.push({
            doc_count: 0,
            key: this.queryOption.from,
          });
        }


        instance.publishedMessagesData.set(elasticsearchData);
        instance.publishedClientsData.set(publishedClientsData);
      }
    });

    // fetch data for Published messages
    const getDelMessages = getHistogramData('message_delivered', this.queryOption);

    Meteor.call('sendElastisticsearchRequest', getDelMessages, (error, result) => {
      console.log('message_delivered', 'send request');
      if (error) {
        sAlert.error(error.message);
      } else {
        const elasticsearchData = result.aggregations.data_over_time.buckets;

        if (elasticsearchData.length === 0) {
          elasticsearchData.push({
            doc_count: 0,
            key: this.queryOption.from,
          });
        }

        this.deliveredMessagesData.set(elasticsearchData);
      }
    });


    // fetch data for Published messages
    const getSubClients = getHistogramData('client_subscribe', this.queryOption);

    Meteor.call('sendElastisticsearchRequest', getSubClients, (error, result) => {
      console.log('client_subscribe', 'send request');
      if (error) {
        sAlert.error(error.message);
      } else {
        const elasticsearchData = result.aggregations.data_over_time.buckets;

        if (elasticsearchData.length === 0) {
          elasticsearchData.push({
            doc_count: 0,
            key: this.queryOption.from,
          });
        }

        this.subscribedClientsData.set(elasticsearchData);
      }
    });



    // Meteor.call('publishedMessages', this.queryOption, (error, result) => {
    //   if (error) {
    //     sAlert.error(error.message);
    //   } else {
    //     const elasticsearchData = result.aggregations.group_by_interval.buckets;
    //
    //     const asd = instance.publishedMessages.get();
    //
    //     instance.publishedMessages.set(asd+elasticsearchData.currentPeriod.doc_count);
    //     const trend = {
    //       comparePubMessages: calculateTrend(elasticsearchData.previousPeriod.doc_count,elasticsearchData.currentPeriod.doc_count)
    //     };
    //     console.log(elasticsearchData.previousPeriod.doc_count,elasticsearchData.currentPeriod.doc_count)
    //
    //     instance.trend.set(trend);
    //     // console.log('request number', instance.totalNumber.get())
    //     //
    //     // if (elasticsearchData.length === 0) {
    //     //   elasticsearchData.push({
    //     //     doc_count: 0,
    //     //     key: this.queryOption.from,
    //     //   });
    //     // }
    //     //
    //     // this.aggregatedData.set(elasticsearchData);
    //   }
    // });
  };

  this.sendRequest();

  // setInterval(() => {
  //   this.queryOption.from = this.lastUpdatedTime;
  //   this.queryOption.to = moment(this.lastUpdatedTime).add(1, 'd').valueOf();
  //   this.sendRequest();
  // }, 5000);

  Template.mqttDashboardPage.helpers({
    publishedMessages () {
      return Template.instance().publishedMessages.get();
    },
    arrowDirection (param) {
      const trend = Template.instance().trend.get();

      return arrowDirection(param, trend);
    },
    percentageValue (param) {
      const trend = Template.instance().trend.get();

      return percentageValue(param, trend);
    },
    favoriteTopicsList () {
      return [
        {
          id: '123',
          value: '#/q/topic',
          incoming: 24,
          outgoing: 25,
          publishedMessages: 123,
          deliveredMessages: 234,
          publishedClients: 10,
          subscribedClients: 20,
        },
        {
          id: '234',
          value: '#/q/topic1',
          incoming: 34,
          outgoing: 35,
          publishedMessages: 100,
          deliveredMessages: 200,
          publishedClients: 15,
          subscribedClients: 25,
        },
        {
          id: '345',
          value: '#/q/topic2',
          incoming: 14,
          outgoing: 15,
          publishedMessages: 200,
          deliveredMessages: 300,
          publishedClients: 5,
          subscribedClients: 56,
        },
      ];
    },
    // Chart data
    publishedMessagesData () {
      return Template.instance().publishedMessagesData.get();
    },
    deliveredMessagesData () {
      return Template.instance().deliveredMessagesData.get();
    },
    subscribedClientsData () {
      return Template.instance().subscribedClientsData.get();
    },
    publishedClientsData () {
      return Template.instance().publishedClientsData.get();
    },



  });

});

Template.mqttDashboardPage.events({

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
