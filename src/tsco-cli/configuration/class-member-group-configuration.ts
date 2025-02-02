import { ClassMemberType } from "../enums/class-member-type.js";

export class ClassMemberGroupConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly sortDirection: "asc" | "desc" | "none",
        public readonly caption: string,
        public readonly memberTypes: ClassMemberType[],
        public readonly memberTypesGrouped: boolean,
        public readonly placeAbove: string[],
        public readonly placeBelow: string[],
    ) { }

    // #endregion Constructors
}
