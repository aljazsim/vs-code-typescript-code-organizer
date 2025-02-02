import ts from "typescript";

import { AccessModifier } from "../enums/access-modifier.js";
import { getAccessModifier, getDecorators, getIsAbstract, getIsStatic } from "../helpers/node-helper.js";
import { ElementNode } from "./element-node.js";

export class SetterNode extends ElementNode
{
    // #region Properties (5)

    public readonly accessModifier: AccessModifier | null;
    public readonly decorators: string[];
    public readonly isAbstract: boolean;
    public readonly isStatic: boolean;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, setterDeclaration: ts.SetAccessorDeclaration)
    {
        super(sourceFile, setterDeclaration);

        this.name = (<ts.Identifier>setterDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(setterDeclaration.name.pos, setterDeclaration.name.end);

        this.accessModifier = getAccessModifier(setterDeclaration);
        this.decorators = getDecorators(setterDeclaration, sourceFile);

        this.isAbstract = getIsAbstract(setterDeclaration);
        this.isStatic = getIsStatic(setterDeclaration);
    }

    // #endregion Constructors
}
