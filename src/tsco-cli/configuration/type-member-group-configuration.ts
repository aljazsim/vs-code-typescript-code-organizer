import { TypeMemberType } from "../enums/type-member-type.js";

export class TypeMemberGroupConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly sortDirection: "asc" | "desc" | "none",
        public readonly caption: string,
        public readonly memberTypes: TypeMemberType[],
        public readonly memberTypesGrouped: boolean,
        public readonly placeAbove: string[],
        public readonly placeBelow: string[],
    ) { }

    // #endregion Constructors
}
