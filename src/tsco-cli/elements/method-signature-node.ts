import ts from "typescript";

import { ElementNode } from "./element-node";

export class MethodSignatureNode extends ElementNode
{
    // #region Properties (1)

    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, methodSignatureDeclaration: ts.MethodSignature)
    {
        super(sourceFile, methodSignatureDeclaration);

        this.name = (<ts.Identifier>methodSignatureDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(methodSignatureDeclaration.name.pos, methodSignatureDeclaration.name.end).trim();
    }

    // #endregion Constructors
}
