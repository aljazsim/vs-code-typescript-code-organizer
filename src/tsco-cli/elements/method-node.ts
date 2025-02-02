import ts from "typescript";

import { AccessModifier } from "../enums/access-modifier";
import { getAccessModifier, getDecorators, getIsAbstract, getIsAsync, getIsStatic } from "../helpers/node-helper";
import { ElementNode } from "./element-node";

export class MethodNode extends ElementNode
{
    // #region Properties (6)

    public readonly accessModifier: AccessModifier | null;
    public readonly decorators: string[];
    public readonly isAbstract: boolean;
    public readonly isAsync: boolean;
    public readonly isStatic: boolean;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, methodDeclaration: ts.MethodDeclaration | ts.PropertyDeclaration)
    {
        super(sourceFile, methodDeclaration);

        this.name = (<ts.Identifier>methodDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(methodDeclaration.name.pos, methodDeclaration.name.end).trim();

        // methods starting with # are private by default!
        this.accessModifier = this.name.startsWith("#") ? AccessModifier.private : getAccessModifier(methodDeclaration);
        this.decorators = getDecorators(methodDeclaration, sourceFile);

        this.isAbstract = getIsAbstract(methodDeclaration);
        this.isStatic = getIsStatic(methodDeclaration);
        this.isAsync = getIsAsync(methodDeclaration);
    }

    // #endregion Constructors
}
