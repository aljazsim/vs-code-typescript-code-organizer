import { InterfaceMemberType } from "../enums/interface-member-type.js";

export class InterfaceMemberGroupConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly sortDirection: "asc" | "desc" | "none",
        public readonly caption: string,
        public readonly memberTypes: InterfaceMemberType[],
        public readonly memberTypesGrouped: boolean,
        public readonly placeAbove: string[],
        public readonly placeBelow: string[],
    ) { }

    // #endregion Constructors
}
