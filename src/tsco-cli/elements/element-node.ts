import * as ts from "typescript";

import { getLeadingComment, getTrailingComment } from "../helpers/node-helper";

export abstract class ElementNode
{
    // #region Properties (4)

    public readonly leadingComment: string | null;
    public abstract readonly name: string;
    public readonly sourceCode: string;
    public readonly trailingComment: string | null;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, public readonly node: ts.Node, leadingComment: string | null = null, trailingComment: string | null = null)
    {
        this.sourceCode = ElementNode.getSourceCode(sourceFile, node.getFullStart(), node.getEnd());

        this.leadingComment = leadingComment ?? getLeadingComment(node, sourceFile);
        this.trailingComment = trailingComment ?? getTrailingComment(node, sourceFile);
    }

    // #endregion Constructors

    // #region Private Static Methods (1)

    private static getSourceCode(sourceFile: ts.SourceFile, start: number, end: number)
    {
        return sourceFile.getFullText().substring(start, end);
    }

    // #endregion Private Static Methods
}
