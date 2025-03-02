import ts from "typescript";

import { AccessModifier } from "../enums/access-modifier.js";
import { getAccessModifier, getDecorators, getIsAbstract, getIsStatic } from "../helpers/node-helper.js";
import { ElementNode } from "./element-node.js";

export class GetterNode extends ElementNode
{
    // #region Properties (5)

    public readonly accessModifier: AccessModifier | null;
    public readonly decorators: string[];
    public readonly isAbstract: boolean;
    public readonly isStatic: boolean;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, getterDeclaration: ts.GetAccessorDeclaration)
    {
        super(sourceFile, getterDeclaration);

        this.name = (<ts.Identifier>getterDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(getterDeclaration.name.pos, getterDeclaration.name.end).trim();

        this.accessModifier = getAccessModifier(getterDeclaration);
        this.decorators = getDecorators(getterDeclaration, sourceFile);

        this.isAbstract = getIsAbstract(getterDeclaration);
        this.isStatic = getIsStatic(getterDeclaration);
    }

    // #endregion Constructors
}
