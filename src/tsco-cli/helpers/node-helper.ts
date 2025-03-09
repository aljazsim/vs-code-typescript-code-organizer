import * as ts from "typescript";

import { AccessorNode } from "../elements/accessor-node";
import { ClassNode } from "../elements/class-node";
import { ElementNode } from "../elements/element-node";
import { EnumNode } from "../elements/enum-node";
import { ExpressionNode } from "../elements/expression-node";
import { FunctionNode } from "../elements/function-node";
import { GetterNode } from "../elements/getter-node";
import { ImportNode } from "../elements/import-node";
import { InterfaceNode } from "../elements/interface-node";
import { MethodNode } from "../elements/method-node";
import { PropertyNode } from "../elements/property-node";
import { PropertySignatureNode } from "../elements/property-signature-node";
import { SetterNode } from "../elements/setter-node";
import { TypeAliasNode } from "../elements/type-alias-node";
import { VariableNode } from "../elements/variable-node";
import { AccessModifier } from "../enums/access-modifier";
import { WriteModifier } from "../enums/write-modifier";
import { newLine } from "../source-code/source-code-constants";
import { add, distinct, except, remove } from "./array-helper";
import { compareStrings } from "./comparing-helper";
import { matchRegEx, matchWildcard } from "./string-helper";

// #region Functions (1)

function sortBy<T extends ElementNode>(nodes: T[], sortDirection: string, groupWithDecorators: boolean)
{
    if (sortDirection !== "none")
    {
        nodes = nodes.sort((a, b) => compareStrings(getName(a, groupWithDecorators), getName(b, groupWithDecorators)));

        if (sortDirection === "desc")
        {
            nodes = nodes.reverse();
        }
    }

    return nodes;
}

// #endregion Functions

// #region Exported Functions (33)

export function getAccessModifier(node: ts.PropertyDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.MethodDeclaration | ts.PropertySignature | ts.IndexSignatureDeclaration)
{
    const accessModifiers: ts.SyntaxKind[] = [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.PublicKeyword];

    let accessModifier: AccessModifier | null = null;
    let nodeAccessModifier: ts.Modifier | ts.ModifierLike | undefined;

    if (node.modifiers &&
        node.modifiers.length > 0)
    {
        nodeAccessModifier = node.modifiers.find((x) => accessModifiers.indexOf(x.kind) > -1);

        if (nodeAccessModifier)
        {
            if (nodeAccessModifier.kind === ts.SyntaxKind.PublicKeyword)
            {
                accessModifier = AccessModifier.public;
            }
            else if (nodeAccessModifier.kind === ts.SyntaxKind.ProtectedKeyword)
            {
                accessModifier = AccessModifier.protected;
            }
            else if (nodeAccessModifier.kind === ts.SyntaxKind.PrivateKeyword)
            {
                accessModifier = AccessModifier.private;
            }
        }
    }

    return accessModifier;
}

export function getClasses(nodes: ElementNode[], groupWithDecorators: boolean, exported: boolean)
{
    return nodes.filter(n => n instanceof ClassNode)
        .map(c => c as ClassNode)
        .filter(c => c.isExport === exported)
        .sort((a, b) => compareStrings(getName(a, groupWithDecorators), getName(b, groupWithDecorators)));
}

export function getDecorators(node: ts.ClassDeclaration | ts.AccessorDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration | ts.IndexedAccessTypeNode | ts.ConstructorDeclaration | ts.EnumDeclaration | ts.FunctionDeclaration | ts.IndexSignatureDeclaration | ts.MethodSignature | ts.PropertySignature | ts.TypeAliasDeclaration, sourceFile: ts.SourceFile)
{
    return getModifiers(node).filter(m => ts.isDecorator(m)).map(x => (x as ts.Decorator).getText(sourceFile).trim()) ?? [];
}

export function getDecoratorsWithoutParameters(node: ClassNode | PropertyNode | MethodNode | SetterNode | GetterNode | AccessorNode)
{
    return node.decorators.map((d: string) => d.replace(/\(.*\)/, ""));
}

export function getDependencies(sourceFile: ts.SourceFile, node: ts.Node, dependencies: string[])
{
    if (ts.isIdentifier(node))
    {
        add(dependencies, node.getText(sourceFile));
    }
    else
    {
        for (const childNode of node.getChildren(sourceFile))
        {
            getDependencies(sourceFile, childNode, dependencies);
        }
    }

    return distinct(dependencies).sort();
}

export function getEnums(nodes: ElementNode[], exported: boolean)
{
    return nodes.filter(n => n instanceof EnumNode)
        .map(t => t as EnumNode)
        .filter(f => f.isExport === exported)
        .sort((a, b) => compareStrings(getName(a, false), getName(b, false)));
}

export function getExpressions(nodes: ElementNode[])
{
    // expressions are just executable code and can be interdependent
    return nodes.filter(n => n instanceof ExpressionNode);
}

export function getFunctions(nodes: ElementNode[], treatArrowFunctionVariablesAsMethods: boolean, treatArrowFunctionConstantsAsMethods: boolean, exported: boolean)
{
    const functions = nodes.filter(n => n instanceof FunctionNode)
        .map(f => f as FunctionNode)
        .filter(f => f.isExport === exported)
        .map(f => f as ElementNode);
    const arrowFunctionVariables = treatArrowFunctionVariablesAsMethods ? getVariables(nodes, false, exported, true) : [];
    const arrowFunctionConstants = treatArrowFunctionConstantsAsMethods ? getVariables(nodes, true, exported, true) : [];

    return functions.concat(arrowFunctionVariables).concat(arrowFunctionConstants).sort((a, b) => compareStrings(getName(a, false), getName(b, false)));
}

export function getImports(nodes: ElementNode[])
{
    return nodes.filter(n => n instanceof ImportNode);
}

export function getInterfaces(nodes: ElementNode[], exported: boolean)
{
    return nodes.filter(n => n instanceof InterfaceNode)
        .map(t => t as InterfaceNode)
        .filter(f => f.isExport === exported)
        .sort((a, b) => compareStrings(getName(a, false), getName(b, false)));

    return nodes.filter(n => n instanceof InterfaceNode).sort((a, b) => compareStrings(getName(a, false), getName(b, false)));
}

export function getIsAbstract(node: ts.ClassDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration | ts.IndexedAccessTypeNode)
{
    return getModifiers(node).find((x) => x.kind === ts.SyntaxKind.AbstractKeyword) !== undefined;
}

export function getIsArrowFunction(node: ts.PropertyDeclaration | ts.VariableDeclaration)
{
    if (node.type)
    {
        return ts.isFunctionTypeNode(node.type);
    }
    else if (node.initializer)
    {
        return node.initializer && node.initializer!.kind === ts.SyntaxKind.ArrowFunction;
    }
    else 
    {
        return false;
    }
}

export function getIsAsync(node: ts.MethodDeclaration | ts.PropertyDeclaration)
{
    return getModifiers(node).find((x) => x.kind === ts.SyntaxKind.AsyncKeyword) !== undefined;
}

export function getIsConst(node: ts.VariableDeclarationList)
{
    return (node.flags & ts.NodeFlags.Const) === ts.NodeFlags.Const;
}

export function getIsDeclaration(node: ts.VariableStatement)
{
    let isExport = false;

    if (node.modifiers &&
        node.modifiers.length > 0)
    {
        const tmp = node.modifiers.find((modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword);

        if (tmp &&
            tmp.kind === ts.SyntaxKind.DeclareKeyword)
        {
            isExport = true;
        }
    }

    return isExport;
}

export function getIsExport(node: Pick<ts.ClassDeclaration | ts.FunctionDeclaration | ts.VariableStatement | ts.TypeAliasDeclaration, "modifiers">)
{
    let isExport = false;

    if (node.modifiers &&
        node.modifiers.length > 0)
    {
        const tmp = node.modifiers.find((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

        if (tmp &&
            tmp.kind === ts.SyntaxKind.ExportKeyword)
        {
            isExport = true;
        }
    }

    return isExport;
}

export function getIsStatic(node: ts.ClassDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration | ts.IndexedAccessTypeNode)
{
    return getModifiers(node).find((x) => x.kind === ts.SyntaxKind.StaticKeyword) !== undefined;
}

export function getLeadingComment(node: ts.Node, sourceFile: ts.SourceFile)
{
    const sourceCode = node.getFullText(sourceFile);
    const commentRanges = ts.getLeadingCommentRanges(sourceCode, 0)

    if (commentRanges && commentRanges.length > 0)
    {
        const start = commentRanges[0].pos;
        const end = commentRanges[commentRanges.length - 1].end;
        const trailingNewLine = commentRanges[commentRanges.length - 1].hasTrailingNewLine;

        return sourceCode.substring(start, end).trimStart() + (trailingNewLine ? newLine : "");
    }
    else
    {
        return null;
    }
}

export function getModifiers(node: ts.ClassDeclaration | ts.GetAccessorDeclaration | ts.SetAccessorDeclaration | ts.PropertyDeclaration | ts.MethodDeclaration | ts.IndexedAccessTypeNode | ts.ConstructorDeclaration | ts.EnumDeclaration | ts.FunctionDeclaration | ts.IndexSignatureDeclaration | ts.MethodSignature | ts.PropertySignature | ts.TypeAliasDeclaration | ts.VariableStatement)
{
    let modifiers: ts.NodeArray<ts.ModifierLike> | undefined;

    if (ts.isClassDeclaration(node))
    {
        modifiers = (node as ts.ClassDeclaration).modifiers;
    }
    else if (ts.isGetAccessorDeclaration(node))
    {
        modifiers = (node as ts.GetAccessorDeclaration).modifiers;
    }
    else if (ts.isSetAccessorDeclaration(node))
    {
        modifiers = (node as ts.SetAccessorDeclaration).modifiers;
    }
    else if (ts.isPropertyDeclaration(node))
    {
        modifiers = (node as ts.PropertyDeclaration).modifiers;
    }
    else if (ts.isMethodDeclaration(node))
    {
        modifiers = (node as ts.MethodDeclaration).modifiers;
    }
    else if (ts.isIndexedAccessTypeNode(node))
    {
        // no modifiers
    }
    else if (ts.isConstructorDeclaration(node))
    {
        modifiers = (node as ts.ConstructorDeclaration).modifiers;
    }
    else if (ts.isEnumDeclaration(node))
    {
        modifiers = (node as ts.EnumDeclaration).modifiers;
    }
    else if (ts.isFunctionDeclaration(node))
    {
        modifiers = (node as ts.FunctionDeclaration).modifiers;
    }
    else if (ts.isIndexSignatureDeclaration(node))
    {
        modifiers = (node as ts.IndexSignatureDeclaration).modifiers;
    }
    else if (ts.isMethodSignature(node))
    {
        modifiers = (node as ts.MethodSignature).modifiers;
    }
    else if (ts.isPropertySignature(node))
    {
        modifiers = (node as ts.PropertySignature).modifiers;
    }
    else if (ts.isTypeAliasDeclaration(node))
    {
        modifiers = (node as ts.TypeAliasDeclaration).modifiers;
    }
    else if (ts.isVariableStatement(node))
    {
        modifiers = (node as ts.VariableStatement).modifiers;
    }

    return modifiers ?? [];
}

export function getName(node: ElementNode, groupWithDecorators: boolean): string
{
    const nodeName = (node.name.startsWith("#") ? (node.name.substring(1) + "#") : node.name); // private properties can start with #
    let nodeDecorators = Array<string>();

    if (node instanceof ClassNode ||
        node instanceof PropertyNode ||
        node instanceof MethodNode ||
        node instanceof GetterNode ||
        node instanceof SetterNode ||
        node instanceof AccessorNode)
    {
        nodeDecorators = groupWithDecorators && node.decorators.length > 0 ? getDecoratorsWithoutParameters(node) : [];
    }

    return `${nodeDecorators.join(", ")} ${nodeName}`.trim();
}

export function getNodeDependencies(nodes: ElementNode[])
{
    return distinct(nodes.flatMap(n => n.dependencies)).sort();
}

export function getNodeNames(nodes: ElementNode[])
{
    // anonymous constants can have more than one comma separated name
    return nodes.map(n => n.name).flatMap(name => name.split(","));
}

export function getTrailingComment(node: ts.Node, sourceFile: ts.SourceFile)
{
    const sourceCode = node.getFullText(sourceFile);
    const commentRanges = ts.getTrailingCommentRanges(sourceCode, 0);

    if (commentRanges && commentRanges.length > 0)
    {
        const start = commentRanges[0].pos;
        const end = commentRanges[commentRanges.length - 1].end;
        const trailingNewLine = commentRanges[commentRanges.length - 1].hasTrailingNewLine;

        return sourceCode.substring(start, end).trimEnd() + (trailingNewLine ? newLine : "");
    }
    else
    {
        return null;
    }
}

export function getTypeAliases(nodes: ElementNode[], exported: boolean)
{
    return nodes.filter(n => n instanceof TypeAliasNode)
        .map(t => t as TypeAliasNode)
        .filter(f => f.isExport === exported)
        .sort((a, b) => compareStrings(getName(a, false), getName(b, false)));
}

export function getVariables(nodes: ElementNode[], constant: boolean, exported: boolean, arrowFunctionVariables: boolean | null)
{
    let variables = nodes.filter(n => n instanceof VariableNode).map(v => v as VariableNode);

    if (arrowFunctionVariables != null)
    {
        variables = variables.filter(v => v.isArrowFunction === arrowFunctionVariables);
    }

    return variables.filter(v => v.isExport === exported && v.isConst === constant)
        .map(v => v as ElementNode)
        .sort((a, b) => compareStrings(getName(a, false), getName(b, false)));
}

export function getWriteMode(node: ts.PropertyDeclaration | ts.VariableStatement | ts.IndexedAccessTypeNode | ts.PropertySignature | ts.IndexSignatureDeclaration)
{
    const writeModifiers = [ts.SyntaxKind.ConstKeyword, ts.SyntaxKind.ReadonlyKeyword];
    const nodeWriteModifier = getModifiers(node).find((x) => writeModifiers.indexOf(x.kind) > -1);
    let writeMode = WriteModifier.writable;

    if (nodeWriteModifier)
    {
        if (nodeWriteModifier.kind === ts.SyntaxKind.ConstKeyword)
        {
            writeMode = WriteModifier.const;
        }
        else if (nodeWriteModifier.kind === ts.SyntaxKind.ReadonlyKeyword)
        {
            writeMode = WriteModifier.readOnly;
        }
    }

    return writeMode;
}

export function isPrivate(x: PropertyNode | MethodNode | GetterNode | SetterNode | AccessorNode)
{
    return x.accessModifier === AccessModifier.private;
}

export function isProtected(x: PropertyNode | MethodNode | GetterNode | SetterNode | AccessorNode)
{
    return x.accessModifier === AccessModifier.protected;
}

export function isPublic(x: PropertyNode | MethodNode | GetterNode | SetterNode | AccessorNode)
{
    return x.accessModifier === AccessModifier.public || x.accessModifier === null;
}

export function isReadOnly(x: PropertyNode | PropertySignatureNode)
{
    return x.writeMode === WriteModifier.readOnly;
}

export function isWritable(x: PropertyNode | PropertySignatureNode)
{
    return x.writeMode === WriteModifier.writable;
}

export function order(sortDirection: "asc" | "desc" | "none", nodes: ElementNode[], placeAbove: string[], placeBelow: string[], groupWithDecorators: boolean)
{
    const nodesAbove = splitBy(nodes, placeAbove).map(ng => sortBy(ng, sortDirection, groupWithDecorators)).flatMap(ng => ng);
    const nodesBelow = splitBy(except(nodes, nodesAbove), placeBelow).map(ng => sortBy(ng, sortDirection, groupWithDecorators)).flatMap(ng => ng);
    const nodesMiddle = sortBy(except(except(nodes, nodesAbove), nodesBelow), sortDirection, groupWithDecorators);

    return nodesAbove.concat(nodesMiddle).concat(nodesBelow);
}

export function splitBy<T extends ElementNode>(nodes: T[], patterns: string[])
{
    const matchingNodes = Array<T[]>();
    const nonMatchingNodes = [...nodes];

    for (const pattern of patterns)
    {
        const patternNodes = Array<T>();

        for (const node of [...nonMatchingNodes])
        {
            if (pattern === node.name || matchWildcard(pattern, node.name) || matchRegEx(pattern, node.name))
            {
                remove(nonMatchingNodes, node);
                add(patternNodes, node);
            }
        }

        matchingNodes.push(patternNodes);
    }

    return matchingNodes.filter(mn => mn.length > 0);
}

// #endregion Exported Functions
