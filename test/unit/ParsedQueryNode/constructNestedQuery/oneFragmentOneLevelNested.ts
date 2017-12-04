import gql from 'graphql-tag';

import { buildRawOperationFromFragment } from '../../../../src/apollo/util';
import { CacheContext } from '../../../../src/context';
import { constructNestedQuery, ParsedQueryNode } from '../../../../src/ParsedQueryNode';
import { fragmentMapForDocument, getOperationOrDie } from '../../../../src/util';
import { strictConfig } from '../../../helpers';

describe(`context.CacheContext`, () => {
  describe(`constructNestedQuery`, () => {

    const context = new CacheContext(strictConfig);
    const raw = buildRawOperationFromFragment({
      fragment: gql(`
        fragment shipmentFragment on Shipment {
          id
          stops {
            city
            postal
          }
        }
      `),
      id: '123',
      paths: ['shipments'],
    });
    const fragmentMap = fragmentMapForDocument(raw.document);
    const operation = getOperationOrDie(raw.document);
    it(`one fragment and one level nested `, () => {
      expect(constructNestedQuery(context, fragmentMap, operation.selectionSet, raw.paths!)).to.deep.eq({
        parsedQuery: {
          shipments: new ParsedQueryNode({
            id: new ParsedQueryNode(),
            stops: new ParsedQueryNode({
              city: new ParsedQueryNode(),
              postal: new ParsedQueryNode(),
            }),
          }),
        },
        variables: new Set(),
      });
    });

  });
});
