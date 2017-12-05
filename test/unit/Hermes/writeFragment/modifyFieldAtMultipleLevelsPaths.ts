import gql from 'graphql-tag';

import { Hermes } from '../../../../src/apollo/Hermes';
import { CacheContext } from '../../../../src/context/CacheContext';
import { GraphSnapshot } from '../../../../src/GraphSnapshot';
import { EntitySnapshot } from '../../../../src/nodes/EntitySnapshot';
import { StaticNodeId, Serializable } from '../../../../src/schema';
import { strictConfig } from '../../../helpers/context';

const { QueryRoot: QueryRootId } = StaticNodeId;

describe(`Hermes`, () => {
  describe(`writeFragment`, () => {

    let hermes: Hermes, baseline: GraphSnapshot;
    beforeAll(() => {
      hermes = new Hermes(new CacheContext(strictConfig));
      hermes.restore({
        [QueryRootId]: {
          type: Serializable.NodeSnapshotType.EntitySnapshot,
          outbound: [{ id: '123', path: ['viewer'] }],
          data: {
            justValue: '42',
          },
        },
        '123': {
          type: Serializable.NodeSnapshotType.EntitySnapshot,
          inbound: [{ id: QueryRootId, path: ['viewer'] }],
          outbound: [{ id: 'note0', path: ['note'] }],
          data: {
            id: 123,
            name: 'Gouda',
            __typename: 'Viewer',
          },
        },
        'note0': {
          type: Serializable.NodeSnapshotType.EntitySnapshot,
          inbound: [{ id: '123', path: ['note'] }],
          data: {
            id: 'note0',
            details: 'Hello World',
          },
        },
      });

      hermes.writeFragment({
        id: QueryRootId,
        fragment: gql(`
          fragment note on Note {
            id
            details
            reference
          }
        `),
        paths: ['viewer', 'note'],
        data: {
          viewer: {
            id: 123,
            note: {
              id: 'note0',
              details: 'Hello World!',
              reference: 'Cheesy',
            },
          },
        },
      });
      baseline = hermes.getCurrentCacheSnapshot().baseline;
    });

    it(`correctly modify data on the reference at a multiple levels depth path`, () => {
      expect(baseline.getNodeData('123')).to.deep.eq({
        id: 123,
        name: 'Gouda',
        __typename: 'Viewer',
        note: {
          id: 'note0',
          details: 'Hello World!',
          reference: 'Cheesy',
        },
      });
    });

    it(`correctly reference from root node`, () => {
      expect(baseline.getNodeSnapshot('123')).to.deep.eq(
        new EntitySnapshot(
          {
            id: 123,
            name: 'Gouda',
            __typename: 'Viewer',
            note: {
              id: 'note0',
              details: 'Hello World!',
              reference: 'Cheesy',
            },
          },
          [{ id: QueryRootId, path: ['viewer'] }],
          [{ id: 'note0', path: ['note'] }],
        )
      );
      expect(baseline.getNodeData(QueryRootId)!['viewer']).to.eq(baseline.getNodeData('123'));
    });

  });
});
