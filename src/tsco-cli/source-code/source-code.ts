import { RegionConfiguration } from "../configuration/region-configuration.js";
import { AccessorNode } from "../elements/accessor-node.js";
import { GetterNode } from "../elements/getter-node.js";
import { MethodNode } from "../elements/method-node.js";
import { PropertyNode } from "../elements/property-node.js";
import { SetterNode } from "../elements/setter-node.js";
import { AccessModifier } from "../enums/access-modifier.js";
import { WriteModifier } from "../enums/write-modifier.js";

export class SourceCode
{
    // #region Properties (1)

    private readonly newLine = "\r\n";

    // #endregion Properties

    // #region Constructors (1)

    constructor(private sourceCode = "")
    {
    }

    // #endregion Constructors

    // #region Public Methods (12)

    public add(newSourceCode: string | SourceCode, where: "before" | "after" = "after")
    {
        if (newSourceCode instanceof SourceCode && where === "after")
        {
            this.sourceCode = this.sourceCode + newSourceCode.toString();
        }
        else if (newSourceCode instanceof SourceCode && where === "before")
        {
            this.sourceCode = newSourceCode.toString() + this.sourceCode;
        }
        else if (where === "after")
        {
            this.sourceCode = this.sourceCode + newSourceCode;
        }
        else if (where === "before")
        {
            this.sourceCode = newSourceCode + this.sourceCode;
        }
    }

    public addComment(comment: string)
    {
        if (comment && comment.length > 0)
        {
            const temp = this.sourceCode;

            this.sourceCode = comment.trimEnd();
            this.addNewLineAfter();
            this.add(temp);
        }
    }

    public addNewLineAfter()
    {
        this.add(this.newLine);
    }

    public addNewLineAfterIf(condition: boolean)
    {
        if (condition)
        {
            this.addNewLineAfter();
        }
    }

    public addNewLineBefore()
    {
        this.add(this.newLine, "before");
    }

    public addPrivateModifierIfStartingWithHash(node: PropertyNode | MethodNode | AccessorNode | GetterNode | SetterNode)
    {
        const spacesRegex = "\\s*";
        const getAsync = (isAsync: boolean) => isAsync ? "async " : "";
        const getStatic = (isStatic: boolean) => isStatic ? "static " : "";
        const getAbstract = (isAbstract: boolean) => isAbstract ? "abstract " : "";
        const getReadOnly = (writeMode: WriteModifier) => writeMode === WriteModifier.readOnly ? "readonly " : "";
        const getString = (strings: string[]) => ["private"].concat(strings).filter(s => s !== "").map(s => s.trim()).join(" ");
        const getRegex = (strings: string[]) => new RegExp(strings.filter(s => s !== "").map(s => s.trim()).join(spacesRegex));
        const removeHash = (name: string) => name.substring(1);

        if (node.name.startsWith("#") && node.accessModifier === AccessModifier.private)
        {
            let regex: RegExp | null = null;
            let replaceWith: string | null = null;

            if (node instanceof MethodNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), getAsync(node.isAsync), node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), getAsync(node.isAsync), removeHash(node.name)]);
            }
            else if (node instanceof PropertyNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), getReadOnly(node.writeMode), node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), getReadOnly(node.writeMode), removeHash(node.name)]);
            }
            else if (node instanceof AccessorNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "accessor", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "accessor", removeHash(node.name)]);
            }
            else if (node instanceof GetterNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "get", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "get", removeHash(node.name)]);
            }
            else if (node instanceof SetterNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "set", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "set", removeHash(node.name)]);
            }

            if (regex && replaceWith)
            {
                const codeDecoratorsEndIndex = node.decorators.length === 0 ? 0 : (node.sourceCode.lastIndexOf(node.decorators[node.decorators.length - 1]) + node.decorators[node.decorators.length - 1].length);
                const codeDecorators = node.sourceCode.substring(0, codeDecoratorsEndIndex);
                const codeAfterDecorators = node.sourceCode.substring(codeDecoratorsEndIndex);
                const newNodeSourceCode = codeDecorators + codeAfterDecorators.replace(regex, replaceWith);

                this.sourceCode = this.sourceCode.replace(node.sourceCode, newNodeSourceCode); // replace node declaration
                this.sourceCode.replaceAll(`this.${node.name}`, `this.${removeHash(node.name)}`); // replace all references
            }
        }
    }

    public addPublicModifierIfMissing(node: PropertyNode | MethodNode | AccessorNode | GetterNode | SetterNode)
    {
        const spacesRegex = "\\s*";
        const getAsync = (isAsync: boolean) => isAsync ? "async " : "";
        const getStatic = (isStatic: boolean) => isStatic ? "static " : "";
        const getAbstract = (isAbstract: boolean) => isAbstract ? "abstract " : "";
        const getReadOnly = (writeMode: WriteModifier) => writeMode === WriteModifier.readOnly ? "readonly " : "";
        const getString = (strings: string[]) => ["public"].concat(strings).filter(s => s !== "").map(s => s.trim()).join(" ");
        const getRegex = (strings: string[]) => new RegExp(strings.filter(s => s !== "").map(s => s.trim()).join(spacesRegex));

        if (!node.name.startsWith("#") && node.accessModifier === null)
        {
            let regex: RegExp | null = null;
            let replaceWith: string | null = null;

            if (node instanceof MethodNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), getAsync(node.isAsync), node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), getAsync(node.isAsync), node.name]);
            }
            else if (node instanceof PropertyNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), getReadOnly(node.writeMode), node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), getReadOnly(node.writeMode), node.name]);
            }
            else if (node instanceof AccessorNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "accessor", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "accessor", node.name]);
            }
            else if (node instanceof GetterNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "get", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "get", node.name]);
            }
            else if (node instanceof SetterNode)
            {
                regex = getRegex([getStatic(node.isStatic), getAbstract(node.isAbstract), "set", node.name]);
                replaceWith = getString([getStatic(node.isStatic), getAbstract(node.isAbstract), "set", node.name]);
            }

            if (regex && replaceWith)
            {
                const codeDecoratorsEndIndex = node.decorators.length === 0 ? 0 : (node.sourceCode.lastIndexOf(node.decorators[node.decorators.length - 1]) + node.decorators[node.decorators.length - 1].length);
                const codeDecorators = node.sourceCode.substring(0, codeDecoratorsEndIndex);
                const codeAfterDecorators = node.sourceCode.substring(codeDecoratorsEndIndex);
                const newNodeSourceCode = codeDecorators + codeAfterDecorators.replace(regex, replaceWith);

                this.sourceCode = this.sourceCode.replace(node.sourceCode, newNodeSourceCode);
            }
        }
    }

    public addRegion(regionCaption: string, regionMemberCount: number, regionConfiguration: RegionConfiguration)
    {
        const indentation = SourceCode.getIndentation(this.sourceCode);
        const code = this.sourceCode;
        let region = "";
        let endregion = "";

        region += indentation;
        region += "// #region ";
        region += regionCaption + " ";
        region += regionConfiguration.addMemberCountInRegionName ? `(${regionMemberCount})` : "";
        region = region.trimEnd();

        endregion += indentation;
        endregion += "// #endregion ";
        endregion += regionConfiguration.addRegionCaptionToRegionEnd ? regionCaption : "";
        endregion = endregion.trimEnd();

        this.sourceCode = region;
        this.addNewLineAfter();
        this.addNewLineAfter();
        this.add(code);
        this.addNewLineAfter();
        this.add(endregion);
        this.addNewLineAfter();
    }

    public removeConsecutiveEmptyLines()
    {
        const newLine = "\r\n";
        const emptyLineRegex = new RegExp(`^\\s * $`);
        const newLineRegex = new RegExp(`\r\n|\r`);
        const openingBraceRegex = new RegExp(`^.*{ \\s*$`);
        const closingBraceRegex = new RegExp(`^\\s *} \\s*$`);
        const lines: string[] = this.sourceCode.split(newLineRegex);

        for (let i = 0; i < lines.length - 1; i++)
        {
            if (openingBraceRegex.test(lines[i]) &&
                emptyLineRegex.test(lines[i + 1]))
            {
                // remove empty line after {
                lines.splice(i + 1, 1);

                i--;
            }
            else if (emptyLineRegex.test(lines[i]) &&
                closingBraceRegex.test(lines[i + 1]))
            {
                // remove empty line before }
                lines.splice(i, 1);

                i--;
            }
            else if (emptyLineRegex.test(lines[i]) &&
                emptyLineRegex.test(lines[i + 1]))
            {
                lines.splice(i, 1);

                i--;
            }
        }

        this.sourceCode = lines.join(newLine);
    }

    public removeRegions()
    {
        const newLine = "\n";
        const emptyLine = "";
        const anythingRegex = ".";
        const startRegionRegex = "#region";
        const endRegionRegex = "#endregion";
        const spaceRegex = "\\s";

        const startRegionsRegex = new RegExp(`^//${spaceRegex}*${startRegionRegex}${spaceRegex}+${anythingRegex}+$`, "i");
        const endRegionsRegex = new RegExp(`^//${spaceRegex}*${endRegionRegex}(${spaceRegex}+${anythingRegex}+)?$`, "i");
        const lines: string[] = this.sourceCode.split(newLine);
        const lines2: string[] = [];

        for (let i = 0; i < lines.length; i++)
        {
            if (!startRegionsRegex.test(lines[i].trim()) &&
                !endRegionsRegex.test(lines[i].trim()))
            {
                lines2.push(lines[i]);
            }
            else
            {
                while (lines.length > i &&
                    lines[i] === emptyLine)
                {
                    i++;
                }

                while (lines2.length > 0 &&
                    lines2[lines2.length - 1] === emptyLine)
                {
                    lines2.pop();
                }
            }
        }

        this.sourceCode = lines2.join(newLine);
    }

    public toString()
    {
        return this.sourceCode;
    }

    public trim()
    {
        this.sourceCode = this.sourceCode.trim();
    }

    // #endregion Public Methods

    // #region Private Static Methods (1)

    private static getIndentation(sourceCode: string)
    {
        const sourceCodeLines = sourceCode.split("\n");

        if (sourceCodeLines.length === 0)
        {
            return "";
        }
        else
        {
            return sourceCodeLines[0].replace(sourceCodeLines[0].trimStart(), "");
        }
    }

    // #endregion Private Static Methods
}
