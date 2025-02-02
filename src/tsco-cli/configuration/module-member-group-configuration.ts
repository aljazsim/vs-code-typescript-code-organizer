import { ModuleMemberType } from "../enums/module-member-type.js";

export class ModuleMemberGroupConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly sortDirection: "asc" | "desc" | "none",
        public readonly caption: string,
        public readonly memberTypes: ModuleMemberType[],
        public readonly memberTypesGrouped: boolean,
        public readonly placeAbove: string[],
        public readonly placeBelow: string[],
    ) { }

    // #endregion Constructors
}
