/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

import { Meteor } from 'meteor/meteor';

import { Client as ESClient } from 'elasticsearch';
import * as moment from 'moment';


Meteor.methods({
  // published messages, group by clientid, gives published clients
  getPublishedMessages () {
    return {
      query: {
        term: { event: 'message_published' },
      },
      aggs: {
        group_by_users: {
          terms: {
            field: 'from.client_id.keyword',
          },
        },
      },
    };
  },
  // delivered messages, group by clientid, gives published clients
  getDeliveredMessages () {
    return {
      query: {
        term: { event: 'message_delivered' },
      },
      aggs: {
        group_by_client: {
          terms: {
            field: 'client_id.keyword',
          },
        },
      },
    };
  },
  // group by clientid gives subscribed clients.
  getSubscribedClients () {
    return {
      query: {
        term: {
          event: 'client_subscribe',
        },
      },
      aggs: {
        group_by_client: {
          terms: {
            field: 'client_id.keyword',
          },
        },
      },
    };
  },
  // count of unique clientids in message_published
  getPublishedClients () {
    // Call getPublishedMessages

    // doc_count of buckets -- published clients
  },
  unpromisify () {
    const a = {
      from: 1513357200000,
      to: 1513432800000,
      eventType: 'message_published',
    };

    Meteor.call('umbrellaRequest', (error, result) => {
      console.log('error', error);
      if (result) {
        const a = result.aggregations.data_over_time.buckets;
        console.log(a);
      }

      // if (result) {
      //   const data = result.aggregations.data_over_time.buckets;
      //
      //   data.forEach(bucket => {
      //     console.log({ count: bucket.count, key_as_string: moment(bucket.key).format('LLL') })
      //   });
      //   console.log('result', );
      // }
    });
  },
});

Meteor.methods({
  sendElastisticsearchRequest (requestBody) {
    check(requestBody, Object);

    const host = 'http://84.20.148.204:9200';

    const query = {
      index: 'mqtt',
      size: 0,
      body: requestBody,
    };

    // Initialize Elasticsearch client, using provided host value
    const esClient = new ESClient({ host });

    return esClient.search(query);
  },
  umbrellaRequest (queryOption) {
    const query = {
      size: 0,
      body: {
        query: {
          filtered: {
            filter: {
              and: [
                {
                  range: {
                    request_at: {
                      lt: queryOption.to,
                      gte: queryOption.from,
                    },
                  },
                },
                {
                  prefix: {
                    request_path: '/nightly_catalog/',
                  },
                },
              ],
            },
          },
        },
        aggregations: {
          data_over_time: {
            date_histogram: {
              field: 'request_at',
              interval: 'day',
            },
          },
          // Get number of calls
          requests_number: {
            value_count: {
              field: 'request_at',
            },
          },
        },
      },
    };

    // const query = mostUsersRequest('/api-umbrella/v1/apis/', { toDate: 1515672378161, fromDate: 1507582800000 });
    const host = 'http://nightly.apinf.io:14002';
    const esClient = new ESClient({ host });

    return esClient.search(query);
  },
  publishedMessages (queryOption) {
    const query = {
      size: 0,
      body: {
        query: {
          filtered: {
            filter: {
              and: [
                {
                  range: {
                    request_at: {
                      lt: queryOption.to,
                      gte: queryOption.doublePeriodAgo,
                    },
                  },
                },
                {
                  prefix: {
                    request_path: '/nightly_catalog/',
                  },
                },
              ],
            },
          },
        },
        aggregations: {
          // Get summary statistic per request_path
          group_by_interval: {
            // Separate current and previous period
            // Also get requests number per period
            range: {
              field: 'request_at',
              keyed: true,
              ranges: [
                {
                  key: 'previousPeriod',
                  from: queryOption.doublePeriodAgo,
                  to: queryOption.onePeriodAgo,
                },
                {
                  key: 'currentPeriod',
                  from: queryOption.onePeriodAgo,
                  to: queryOption.to,
                },
              ],
            },
          },
        },
      },
    };

    const host = 'http://nightly.apinf.io:14002';
    const esClient = new ESClient({ host });

    return esClient.search(query);
  },
});
