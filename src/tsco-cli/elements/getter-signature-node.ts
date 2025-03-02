import ts from "typescript";

import { ElementNode } from "./element-node.js";

export class GetterSignatureNode extends ElementNode
{
    // #region Properties (1)

    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, getterSignatureDeclaration: ts.GetAccessorDeclaration)
    {
        super(sourceFile, getterSignatureDeclaration);

        this.name = (<ts.Identifier>getterSignatureDeclaration.name).escapedText.toString();
    }

    // #endregion Constructors
}
