import * as ts from "typescript";

import { distinct } from "../helpers/array-helper";
import { ElementNode } from "./element-node";

export class ImportNode extends ElementNode
{
    // #region Properties (6)

    public readonly name: string;

    public isModuleReference = false;
    public nameBinding: string | null = null;
    public namedImports: { type: boolean, name: string, alias: string | null }[] | null = null;
    public namespace: string | null = null;
    public source: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, importDeclaration: ts.ImportDeclaration)
    {
        super(sourceFile, importDeclaration);

        this.name = "import";

        this.getBindings(importDeclaration);
        this.source = this.getSource(importDeclaration);

        const isRelativeReference = this.source.startsWith(".") || this.source.startsWith("..");
        const isAbsoluteReference = !isRelativeReference && (this.source.indexOf("/") > -1 || this.source.indexOf("\\") > -1);

        this.isModuleReference = !isRelativeReference && !isAbsoluteReference;
    }

    // #endregion Constructors

    // #region Public Getters And Setters (1)

    public get isEmptyReference()
    {
        return (!this.namedImports || this.namedImports.length === 0) && !this.namespace && !this.nameBinding;
    }

    // #endregion Public Getters And Setters

    // #region Private Methods (2)

    private getBindings(node: ts.ImportDeclaration)
    {
        if (node.importClause)
        {
            if (node.importClause.namedBindings)
            {
                if ((ts.isNamespaceImport(node.importClause?.namedBindings)))
                {
                    this.namespace = node.importClause?.namedBindings.name.text.replace("* as ", "").trim();
                }
                else if (ts.isNamedImports(node.importClause?.namedBindings))
                {
                    this.namedImports = distinct(node.importClause?.namedBindings.elements.map(e => (
                        {
                            type: e.isTypeOnly,
                            name: e.name.text.trim(),
                            alias: e.propertyName?.text.trim() ?? null
                        })));
                }
            }

            if (node.importClause.name)
            {
                this.nameBinding = node.importClause.name.text.trim();
            }
        }
    }

    private getSource(node: ts.ImportDeclaration): string
    {
        return ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : "";
    }

    // #endregion Private Methods
}
