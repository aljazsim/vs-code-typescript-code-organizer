import wcmatch from "wildcard-match";

import { space } from "../source-code/source-code-constants";

// #region Exported Functions (3)

export function convertPascalCaseToTitleCase(value: string)
{
    if (value &&
        value.length > 1)
    {
        value = value.replace(/(?:^|\.?)([A-Z])/g, (x, y) => space + y);
        value = value[0].toUpperCase() + value.substring(1);
    }

    return value;
}

export function matchRegEx(regex: string, text: string)
{
    if (regex && regex.length > 0)
    {
        if (!regex.startsWith("^"))
        {
            regex = "^" + regex;
        }

        if (!regex.endsWith("$"))
        {
            regex = regex + "$";
        }

        try
        {
            return new RegExp(regex).test(text);
        }
        catch 
        {
            return false;
        }
    }

    return false
}

export function matchWildcard(pattern: string, text: string)
{
    if (pattern && pattern.length > 0)
    {
        try
        {
            return wcmatch(pattern)(text);
        }
        catch 
        {
            return false;
        }
    }

    return false;
}

// #endregion Exported Functions
