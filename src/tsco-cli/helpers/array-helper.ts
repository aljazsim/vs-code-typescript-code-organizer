// #region Exported Functions (5)

export function add<T>(items: T[] | null | undefined, itemToAdd: T)
{
    if (items && itemToAdd && itemToAdd)
    {
        items.push(itemToAdd);
    }
}

export function distinct<T>(items: T[])
{
    return items.map(i => JSON.stringify(i))
        .filter((value, index, array) => array.indexOf(value) === index)
        .map(i => JSON.parse(i) as T);
}

export function except<T>(items1: T[] | null | undefined, items2: T[] | null | undefined)
{
    if (items1 && items1.length > 0 && items2 && items2.length > 0)
    {
        return items1.filter(item => !items2!.includes(item));
    }
    else
    {
        return items1 ?? [];
    }
}

export function intersect<T>(items1: T[] | null | undefined, items2: T[] | null | undefined)
{
    if (items1 && items1.length > 0 && items2 && items2.length > 0)
    {
        return items1.filter(item => items2!.includes(item));
    }
    else
    {
        return [];
    }
}

export function remove<T>(items: T[] | null | undefined, item: T | null | undefined)
{
    if (items && items.length > 0 && item)
    {
        const index = items.indexOf(item);

        if (index > -1)
        {
            items.splice(index, 1);
        }
    }
}

// #endregion Exported Functions
