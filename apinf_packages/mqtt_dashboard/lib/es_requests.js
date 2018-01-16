/* Copyright 2017 Apinf Oy
  This file is covered by the EUPL license.
  You may obtain a copy of the licence at
  https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

export function getHistogramData (eventType, dateRange) {
  return {
    query: {
      bool: {
        must: [
          {
            term: {
              event: eventType,
            },
          },
          {
            range: {
              timestamp: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          },
        ],
      },
    },
    aggs: {
      data_over_time: {
        date_histogram: {
          field: 'timestamp',
          interval: 'day',
        },
      },
    },
  };
}

export function getPublishedClients (dateRange) {
  return {
    query: {
      bool: {
        must: [
          {
            term: {
              event: 'message_published',
            },
          },
          {
            range: {
              timestamp: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          },
        ],
      },
    },
    aggs: {
      data_over_time: {
        date_histogram: {
          field: 'timestamp',
          interval: 'day',
        },
        aggs: {
          pub_clients: {
            terms: {
              field: 'from.client_id.keyword',
            },
          }
        }
      },
    },
  };
}

// aggregations.data_over_time.buckets -- Array
// [0].pub_clients.buckets.length -- count of unique users

export function getTopicsData (filters, clientFilters, dateRange) {
  return {
    query: {
      bool: {
        must: [
          {
            range: {
              timestamp: {
                gte: 1515765600000,
                // lte: dateRange.to,
              },
            },
          },
        ],
      },
    },
    aggs: {
      group_by_topic: {
        filters,
        aggs: {
          "message_published":{
            "filter":{
              "term":{
                "event":"message_published"
              }
            },
            "aggs": {
              "client_publish":{
                "cardinality":{
                  "field":"from.client_id.keyword"
                }
              }
            }
          }
        },
      },
      clients: {
        filters: clientFilters,
        aggs: {
          "client_subscribe":{
            "filter":{
              "term":{
                "event":"client_subscribe"
              }
            }
          }
        }
      }
    },
  };
}

export function getDataByTopic (filters, dateRange) {
  return {
    query: {
      bool: {
        must: [
          {
            range: {
              timestamp: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          },
          {
            term: {
              "topic.keyword": "/sm5logger/37",
            },
          },
        ],
      },
    },

    "aggs": {
      "group_by_topics": {
        "filters": {
          "filters": {
            "topic40": {
              "prefix": {
                "topic" : "/sm5logger/40"
              }
            }
          }
        }
      }
    }
  };
}
