import { RegionConfiguration } from "../configuration/region-configuration.js";
import { AccessorNode } from "../elements/accessor-node.js";
import { GetterNode } from "../elements/getter-node.js";
import { MethodNode } from "../elements/method-node.js";
import { PropertyNode } from "../elements/property-node.js";
import { SetterNode } from "../elements/setter-node.js";
import { AccessModifier } from "../enums/access-modifier.js";
import { WriteModifier } from "../enums/write-modifier.js";
import { anythingRegex, endRegion, newLine, newLineRegex, space, spacesRegex, startRegion } from "./source-code-constants.js";

export class SourceCode
{
    // #region Constructors (1)

    constructor(private sourceCode = "")
    {
    }

    // #endregion Constructors

    // #region Public Methods (15)

    public addAfter(newSourceCode: string | SourceCode)
    {
        if (newSourceCode instanceof SourceCode)
        {
            this.sourceCode = this.sourceCode + newSourceCode.toString();
        }
        else
        {
            this.sourceCode = this.sourceCode + newSourceCode;
        }
    }

    public addBefore(newSourceCode: string | SourceCode)
    {
        if (newSourceCode instanceof SourceCode)
        {
            this.sourceCode = newSourceCode.toString() + this.sourceCode;
        }
        else
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
            this.addAfter(temp);
        }
    }

    public addNewLineAfter()
    {
        this.addAfter(newLine);
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
        this.addBefore(newLine);
    }

    public addPrivateModifierIfStartingWithHash(node: PropertyNode | MethodNode | AccessorNode | GetterNode | SetterNode)
    {
        const getAsync = (isAsync: boolean) => isAsync ? "async " : "";
        const getStatic = (isStatic: boolean) => isStatic ? "static " : "";
        const getAbstract = (isAbstract: boolean) => isAbstract ? "abstract " : "";
        const getReadOnly = (writeMode: WriteModifier) => writeMode === WriteModifier.readOnly ? "readonly " : "";
        const getString = (strings: string[]) => ["private"].concat(strings).filter(s => s !== "").map(s => s.trim()).join(space);
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
        const getAsync = (isAsync: boolean) => isAsync ? "async " : "";
        const getStatic = (isStatic: boolean) => isStatic ? "static " : "";
        const getAbstract = (isAbstract: boolean) => isAbstract ? "abstract " : "";
        const getReadOnly = (writeMode: WriteModifier) => writeMode === WriteModifier.readOnly ? "readonly " : "";
        const getString = (strings: string[]) => ["public"].concat(strings).filter(s => s !== "").map(s => s.trim()).join(space);
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
        let regionStart = "";
        let regionEnd = "";

        regionStart += indentation;
        regionStart += `// ${startRegion} `;
        regionStart += regionCaption + space;
        regionStart += regionConfiguration.addMemberCountInRegionName ? `(${regionMemberCount})` : "";
        regionStart = regionStart.trimEnd();

        regionEnd += indentation;
        regionEnd += `// ${endRegion} `;
        regionEnd += regionConfiguration.addRegionCaptionToRegionEnd ? regionCaption : "";
        regionEnd = regionEnd.trimEnd();

        this.sourceCode = regionStart;
        this.addNewLineAfter();
        this.addNewLineAfter();
        this.addAfter(code);
        this.addNewLineAfter();
        this.addAfter(regionEnd);
        this.addNewLineAfter();
    }

    public removeConsecutiveEmptyLines()
    {
        const openingBraceRegex = new RegExp(`^.*{${spacesRegex}$`);
        const closingBraceRegex = new RegExp(`^${spacesRegex}}${spacesRegex}$`);
        const lines: string[] = this.sourceCode.split(new RegExp(newLineRegex));

        for (let i = 0; i < lines.length - 1; i++)
        {
            if (openingBraceRegex.test(lines[i]) &&
                lines[i + 1].trim() === "")
            {
                // remove empty line after {
                lines.splice(i + 1, 1);

                i--;
            }
            else if (lines[i].trim() === "" &&
                closingBraceRegex.test(lines[i + 1]))
            {
                // remove empty line before }
                lines.splice(i, 1);

                i--;
            }
            else if (lines[i].trim() === "" &&
                lines[i + 1].trim() === "")
            {
                lines.splice(i, 1);

                i--;
            }
        }

        this.sourceCode = lines.join(newLine);
    }

    public removeFileHeader()
    {
        const singleLineCommentStart = "//";
        const multilineComment = "*";
        const multilineCommentStart = new RegExp(`^/\\${multilineComment}+$`);
        const multilineCommentMiddle = new RegExp(`^\\${multilineComment}.*$`);
        const multilineCommentEnd = new RegExp(`^\\${multilineComment}+/$`);
        const singlelineCommentStart = new RegExp(`^${singleLineCommentStart}.*$`);

        const lines = this.sourceCode.split(new RegExp(newLineRegex));
        const commentLines = [];

        while (lines.length > 0)
        {
            const line = lines[0];

            if (line.trim() === "")
            {
                lines.splice(0, 1);
                commentLines.push(line);
            }
            else if (multilineCommentStart.test(line.trim()) ||
                multilineCommentEnd.test(line.trim()) ||
                multilineCommentMiddle.test(line.trim()))
            {
                lines.splice(0, 1);
                commentLines.push(line);
            }
            else if (singlelineCommentStart.test(line.trim()))
            {
                lines.splice(0, 1);
                commentLines.push(line);
            }
            else
            {
                break;
            }
        }

        if (lines.length >= 3)
        {
            this.sourceCode = lines.join(newLine);

            return commentLines.join(newLine);
        }

        return null;
    }

    public removeRegions()
    {
        const startRegionsRegex = new RegExp(`^//${spacesRegex}${startRegion}${spacesRegex}${anythingRegex}$`, "i");
        const endRegionsRegex = new RegExp(`^//${spacesRegex}${endRegion}(${spacesRegex}${anythingRegex})?$`, "i");
        const lines: string[] = this.sourceCode.split(new RegExp(newLineRegex));
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
                    lines[i].trim() === "")
                {
                    i++;
                }

                while (lines2.length > 0 &&
                    lines2[lines2.length - 1].trim() === "")
                {
                    lines2.pop();
                }
            }
        }

        this.sourceCode = lines2.join(newLine);
    }

    public replace(oldValue: string, newValue: string)
    {
        while (this.sourceCode.indexOf(oldValue) >= 0)
        {
            this.sourceCode = this.sourceCode.replace(oldValue, newValue);
        }
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
        const sourceCodeLines = sourceCode.split(new RegExp(newLineRegex));

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
