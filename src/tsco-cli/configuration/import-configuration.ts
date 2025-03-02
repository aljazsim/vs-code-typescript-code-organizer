import { ImportExpand } from "../enums/import-expand";
import { ImportSourceFilePathQuoteType } from "../enums/import-source-file-path-quote-type";

export class ImportConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly removeUnusedImports: boolean,
        public readonly sortImportsBySource: boolean,
        public readonly sortImportsByName: boolean,
        public readonly groupImportsBySource: boolean,
        public readonly separateImportGroups: boolean,
        public readonly quote: ImportSourceFilePathQuoteType,
        public readonly expand: ImportExpand
    )
    {
    }

    // #endregion Constructors
}
