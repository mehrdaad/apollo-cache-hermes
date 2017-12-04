import { DataProxy } from 'apollo-cache';
import { getFragmentQueryDocument } from 'apollo-utilities';
import { DocumentNode } from 'graphql'; // eslint-disable-line import/no-extraneous-dependencies

import { JsonObject, JsonScalar } from '../primitive';
import { NodeId, RawOperation, StaticNodeId } from '../schema';

declare module 'apollo-cache/lib/types/DataProxy' {
  namespace DataProxy {
    interface FieldArguments {
      [fieldName: string]: {
        [argName: string]: JsonScalar,
      };
    }

    interface Fragment {
      paths?: string[];
      fieldArguments?: DataProxy.FieldArguments;
    }
  }
}

/**
 * Builds a query.
 */
export function buildRawOperationFromQuery(document: DocumentNode, variables?: JsonObject, rootId?: NodeId): RawOperation {
  return {
    rootId: rootId || StaticNodeId.QueryRoot,
    document,
    variables,
  };
}

export function buildRawOperationFromFragment(raw: DataProxy.Fragment): RawOperation {
  return {
    rootId: raw.id,
    document: getFragmentQueryDocument(raw.fragment, raw.fragmentName),
    variables: raw.variables,
    fragmentName: raw.fragmentName,
    paths: raw.paths,
    fieldArguments: raw.fieldArguments,
    fromFragmentDocument: true,
  };
}
