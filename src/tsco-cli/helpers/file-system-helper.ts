import * as fs from "fs";
import * as path from "path";

// #region Functions (1)

function toUnixPath(filePath: string)
{
    return filePath.replaceAll("\\", "/");
}

// #endregion Functions

// #region Exported Functions (15)

export async function deleteFile(filePath: string)
{
    if (await fileExists(filePath)) 
    {
        await fs.promises.unlink(filePath);
    }
}

export async function directoryExists(directoryPath: string)
{
    return await fileExists(directoryPath);
}

export async function fileExists(filePath: string)
{
    try
    {
        await fs.promises.access(filePath, fs.promises.constants.F_OK);

        return true;
    }
    catch
    {
        return false;
    }
}

export function getDirectoryPath(filePath: string)
{
    return (path.dirname(filePath) as string).replaceAll("\\", "/");
}

export function getFileExtension(filePath: string)
{
    return path.parse(filePath).ext;
}

export function getFileName(filePath: string)
{
    return path.basename(filePath) as string;
}

export function getFileNameWithoutExtension(filePath: string)
{
    return getFileName(filePath).substring(0, getFileName(filePath).length - getFileExtension(filePath).length);
}

export function getFilePathWithoutExtension(filePath: string)
{
    return filePath.substring(0, filePath.length - getFileExtension(filePath).length);
}

export async function getFiles(directoryPath: string, recursive: boolean = false)
{
    return (await fs.promises.readdir(directoryPath, { recursive })).map(fp => getFullPath(joinPath(directoryPath, fp)));
}

export function getFullPath(fileOrDirectoryPath: string)
{
    return toUnixPath(path.resolve(fileOrDirectoryPath) as string);
}

export function getProjectRootDirectoryPath(filePath: string)
{
    return toUnixPath(path.parse(filePath).root as string);
}

export function getRelativePath(sourcePath: string, targetPath: string)
{
    const relativePath = toUnixPath(path.relative(getFullPath(sourcePath), targetPath) as string);

    if (!relativePath.startsWith("./") && !relativePath.startsWith("../"))
    {
        return `./${relativePath}`;
    }
    else
    {
        return relativePath;
    }
}

export function joinPath(path1: string, path2: string)
{
    return toUnixPath(path.join(path1, path2) as string);
}

export async function readFile(filePath: string)
{
    return await fs.promises.readFile(filePath, "utf8") as string;
}

export async function writeFile(filePath: string, fileContents: string, overwriteFile = true)
{
    if (await fileExists(filePath))
    {
        if (overwriteFile)
        {
            await deleteFile(filePath);
        }
        else
        {
            throw new Error(`There is an existing file at "${filePath}.`);
        }
    }

    await fs.promises.writeFile(filePath, fileContents, "utf8");
}

// #endregion Exported Functions
