import ts from "typescript";

import { ElementNode } from "./element-node";

export class ExpressionNode extends ElementNode
{
    // #region Properties (1)

    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, expression: ts.Node)
    {
        super(sourceFile, expression);

        this.name = "";
    }

    // #endregion Constructors
}
