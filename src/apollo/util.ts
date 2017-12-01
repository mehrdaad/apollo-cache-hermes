import { DataProxy } from 'apollo-cache';
import { getFragmentQueryDocument } from 'apollo-utilities';
import { DocumentNode } from 'graphql'; // eslint-disable-line import/no-extraneous-dependencies

import { JsonObject } from '../primitive';
import { NodeId, RawOperation, StaticNodeId } from '../schema';

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

export function buildRawOperationFromFragment(raw: DataProxy.Fragment & { paths?: string[], fieldArguments?: object }): RawOperation {
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
