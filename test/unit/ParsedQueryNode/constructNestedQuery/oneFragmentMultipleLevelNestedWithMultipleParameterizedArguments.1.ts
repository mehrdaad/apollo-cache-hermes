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
      id: 'viewer0',
      paths: ['viewer', 'shipments'],
      fieldArguments: {
        shipments: {
          status: 'COMPLETED',
        },
        viewer: {
          city: 'Seattle',
        },
      },
    });
    const fragmentMap = fragmentMapForDocument(raw.document);
    const operation = getOperationOrDie(raw.document);

    it(`one fragment and multi level nested with parameterized arguments`, () => {
      const constructQuery = constructNestedQuery(context, fragmentMap, operation.selectionSet, raw.paths!, raw.fieldArguments);
      expect(constructQuery).to.deep.eq({
        parsedQuery: {
          viewer: new ParsedQueryNode({
            shipments: new ParsedQueryNode(
              {
                id: new ParsedQueryNode(),
                stops: new ParsedQueryNode({
                  city: new ParsedQueryNode(),
                  postal: new ParsedQueryNode(),
                }),
              },
              /* schemaName */ undefined,
              {
                status: 'COMPLETED',
              }
            ),
          },
          /* schemaName */ undefined,
          {
            city: 'Seattle',
          },
          /* hasParameterizedChildren */ true),
        },
        variables: new Set(),
      });
    });

  });
});
