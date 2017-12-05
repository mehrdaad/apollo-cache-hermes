import { // eslint-disable-line import/no-extraneous-dependencies
  DocumentNode,
  OperationDefinitionNode,
  OperationTypeNode,
} from 'graphql';

import { ParsedQueryWithVariables, parseQuery } from '../ParsedQueryNode';
import { JsonValue } from '../primitive';
import { RawOperation } from '../schema';
import {
  FragmentMap,
  fragmentMapForDocument,
  getOperationOrDie,
  variableDefaultsInOperation,
  variablesInOperation,
} from '../util';

import { BasicQueryInfo } from './BasicQueryInfo';  // eslint-disable-line import/named
import { CacheContext } from './CacheContext';

/**
 * Metadata about a GraphQL document (query/mutation/fragment/etc).
 *
 * We do a fair bit of pre-processing over them, and these objects hang onto
 * that information.
 */
export class StaticQueryInfo implements BasicQueryInfo {

  /** The original document (after __typename fields are injected). */
  public readonly document: DocumentNode;
  /** The primary operation in the document. */
  public readonly originalOperation: OperationDefinitionNode;
  /** The type of operation. */
  public readonly operationType: OperationTypeNode;
  /** The name of the operation. */
  public readonly operationName?: string;
  /** The GQL source of the operation */
  public readonly operationSource?: string;
  /** All fragments in the document, indexed by name. */
  public readonly fragmentMap: FragmentMap;
  /**
   * The fully parsed query document.  It will be flattened (no fragments),
   * and contain placeholders for any variables in use.
   */
  public readonly parsed: ParsedQueryWithVariables;
  /** Variables used within this query. */
  public readonly variables: Set<string>;
  /**
   * Default values for the variables used by this query.
   *
   * Variables not present in this map are considered required.
   */
  public readonly variableDefaults: { [Key: string]: JsonValue }

  constructor(context: CacheContext, raw: RawOperation) {
    this.document = raw.document;
    this.originalOperation = getOperationOrDie(raw.document);
    this.operationType = this.originalOperation.operation;
    this.operationName = this.originalOperation.name && this.originalOperation.name.value;
    this.operationSource = this.originalOperation.loc && this.originalOperation.loc.source.body;
    this.fragmentMap = fragmentMapForDocument(raw.document);

    const { parsedQuery, variables } = parseQuery(context, this.fragmentMap, this.originalOperation.selectionSet);
    this.parsed = parsedQuery;
    this.variables = variables;
    this.variableDefaults = variableDefaultsInOperation(this.originalOperation);

    // Skip verification if rawOperation is constructed from fragments
    // (e.g readFragment/writeFragment) because fragment will not declare
    // variables. Users will have to know to provide `variables` parameter
    if (!raw.fromFragmentDocument) {
      this._assertValid();
    }
  }

  private _assertValid() {
    const messages: string[] = [];

    const declaredVariables = variablesInOperation(this.originalOperation);
    this._assertAllVariablesDeclared(messages, declaredVariables);
    this._assertAllVariablesUsed(messages, declaredVariables);

    if (!messages.length) return;
    const mainMessage = `Validation errors in ${this.operationType} ${this.operationName || '<unknown>'}`;
    throw new Error(`${mainMessage}:${messages.map(m => `\n * ${m}`).join('')}`);
  }

  private _assertAllVariablesDeclared(messages: string[], declaredVariables: Set<string>) {
    for (const name of this.variables) {
      if (!declaredVariables.has(name)) {
        messages.push(`Variable $${name} is used, but not declared`);
      }
    }
  }

  private _assertAllVariablesUsed(messages: string[], declaredVariables: Set<string>) {
    for (const name of declaredVariables) {
      if (!this.variables.has(name)) {
        messages.push(`Variable $${name} is unused`);
      }
    }
  }

}
