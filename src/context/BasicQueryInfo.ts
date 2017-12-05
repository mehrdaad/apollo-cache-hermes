import { OperationTypeNode, OperationDefinitionNode } from 'graphql';  // eslint-disable-line import/no-extraneous-dependencies

import { ParsedQueryWithVariables } from '../ParsedQueryNode';
import {
  FragmentMap,
} from '../util';

export interface BasicQueryInfo {
  /** The type of operation. */
  readonly operationType: OperationTypeNode;
  /** All fragments in the document, indexed by name. */
  readonly fragmentMap: FragmentMap;
  /** The primary operation in the document. */
  readonly originalOperation: OperationDefinitionNode;
  /** The name of the operation. */
  readonly operationName?: string;
  /**
   * The fully parsed query document.  It will be flattened (no fragments),
   * and contain placeholders for any variables in use.
   */
  readonly parsed: ParsedQueryWithVariables;
  /** Variables used within this query. */
  readonly variables: Set<string>;
}
