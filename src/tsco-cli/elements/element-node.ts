import * as ts from "typescript";

import { getHasLeadingComment } from "../helpers/node-helper.js";

export abstract class ElementNode
{
    // #region Properties (3)

    public readonly hasLeadingComment: boolean;
    public abstract readonly name: string;
    public readonly sourceCode: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, public readonly node: ts.Node)
    {
        this.sourceCode = ElementNode.getSourceCode(sourceFile, node.getFullStart(), node.getEnd());
        this.hasLeadingComment = getHasLeadingComment(node, sourceFile);
    }

    // #endregion Constructors

    // #region Private Static Methods (1)

    private static getSourceCode(sourceFile: ts.SourceFile, start: number, end: number)
    {
        return sourceFile.getFullText().substring(start, end);
    }

    // #endregion Private Static Methods
}
