// #region Exported Functions (3)

export function log(message: string)
{
    logger.log(message);
}

export function logError(error: string | Error | unknown) 
{
    logger.logError(error);
}

export function setLogger(logging: { log: (message: string) => void, logError: (error: string | Error | unknown) => void })
{
    logger = logging;
}

// #endregion Exported Functions

// #region Variables (1)

let logger = {
    log: (message: string) => { console.log(message) },
    logError: (error: string | Error | unknown) => 
    {
        if (error instanceof Error)
        {
            logError(error.message);
        }
        else
        {
            console.error(error)
        }
    }
};

// #endregion Variables
