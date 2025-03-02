import ts from "typescript";

import { AccessModifier } from "../enums/access-modifier.js";
import { getAccessModifier, getDecorators, getIsAbstract, getIsStatic } from "../helpers/node-helper.js";
import { ElementNode } from "./element-node.js";

export class AccessorNode extends ElementNode
{
    // #region Properties (5)

    public readonly accessModifier: AccessModifier | null;
    public readonly decorators: string[];
    public readonly isAbstract: boolean;
    public readonly isStatic: boolean;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, accessorDeclaration: ts.AccessorDeclaration | ts.AutoAccessorPropertyDeclaration)
    {
        super(sourceFile, accessorDeclaration);

        this.name = (<ts.Identifier>accessorDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(accessorDeclaration.name.pos, accessorDeclaration.name.end).trim();

        this.accessModifier = getAccessModifier(accessorDeclaration);
        this.decorators = getDecorators(accessorDeclaration, sourceFile);

        this.isAbstract = getIsAbstract(accessorDeclaration);
        this.isStatic = getIsStatic(accessorDeclaration);
    }

    // #endregion Constructors
}
