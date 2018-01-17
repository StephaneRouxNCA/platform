/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

import {ReactiveVar} from "meteor/reactive-var";
import {Meteor} from "meteor/meteor";
import {Template} from "meteor/templating";

import { getHistogramData } from '../lib/es_requests';
import moment from 'moment';
import AclRules from '../collection';

Template.topicPage.onCreated(function () {
  let subscription;

  this.dataType = new ReactiveVar('message_published');
  this.aggregatedData = new ReactiveVar();

  this.queryOption = {
    // 10/19/2017
    from: 1508360400000,
    // "10/04/2017"
    doublePeriodAgo: 1507064400000,
    // 10/19/2017
    onePeriodAgo: 1508360400000,
    // "11/03/2017"
    to: 1509656400000,
  };

  this.autorun(() => {
    const topicId = FlowRouter.getParam('id');

    if (topicId) {
      subscription = this.subscribe('topicAclRules', topicId);
    }
  });

  this.autorun(() => {
    const isReady = subscription.ready();
    const eventType = this.dataType.get();

    if (isReady) {
      const acl = AclRules.findOne();

      const getPubMessages = getHistogramData(eventType, this.queryOption);

      switch (eventType) {
        case 'message_published': {
          getPubMessages.query.bool.must.push({
            term: {
              'topic.keyword': acl.topic,
            },
          });
          break;
        }
        case 'client_subscribe': {
          const field = `topics.${acl.topic}.qos`;

          getPubMessages.query.bool.must.push({
            term: {
              [field]: 0,
            },
          });
          break;
        }
        case 'client_publish': {
          getPubMessages.query.bool.must.pop();

          getPubMessages.query.bool.must.push({
            term: {
              'topic.keyword': acl.topic,
            },
          });
          getPubMessages.query.bool.must.push({
            term: {
              event: 'message_published',
            },
          });
          getPubMessages.aggs.data_over_time.aggs = {
            client_publish: {
              cardinality: {
                field: 'from.client_id.keyword',
              },
            },
          };
          break;
        }
        default:
          break;

      }
      console.log(getPubMessages);

      Meteor.call('sendElastisticsearchRequest', getPubMessages, (error, result) => {
        if (error) {
          sAlert.error(error.message);
        } else {
          const elasticsearchData = result.aggregations.data_over_time.buckets;

          console.log('elasticsearchData', elasticsearchData)
          if (elasticsearchData.length === 0) {
            // Set
            elasticsearchData.push({
              doc_count: 0,
              key: this.queryOption.from,
            });
          }

          if (eventType === 'client_publish') {
            const pubslihedClients = publishedClients(elasticsearchData);

            this.aggregatedData.set(pubslihedClients);

          } else {
            this.aggregatedData.set(elasticsearchData);
          }

        }
      });
    }
  });




  const instance = this;




  instance.publishedMessages = new ReactiveVar(0);
  instance.trend = new ReactiveVar({});


  instance.lastUpdatedTime = 0;

  this.sendRequest = () => {
    this.lastUpdatedTime = this.queryOption.to;

    // fetch data for Published messages
    // const getPubMessages = getPublishedClients(this.queryOption);



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
  eventType () {
    return Template.instance().eventType.get();
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
    }];
  }

  return elasticsearchData.map(dataset => {
    return {
      // Get data
      key: dataset.key,
      // get count of unique users
      doc_count: dataset.client_publish.value
    };
  });
}

Template.topicPage.onRendered(function () {

});
