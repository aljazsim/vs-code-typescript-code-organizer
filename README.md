# TypeScript Code Organizer for VS Code

VS Code extension for keeping your TypeScript code organized by grouping and ordering class members.

## Features

Organize currently opened TypeScript file or all TypeScript files in your project.

![TypeScript Class Organizer](./doc/demo1.gif "TypeScript Class Organizer")

## Usage

### Command Palette

From the command palette you can:

- organize current TypeScript file by invoking command `TypeScript Class Organizer: Organize Current File`,
- organize all TypeScript files in the project by invoking command `TypeScript Class Organizer: Organize All Files`

![Command Palette](./doc/command_palette.png "Command Palette")

### Keybboard Shortcuts

You can invoke command `TypeScript Class Organizer: Organize Current File` by using the shortcut Ctr + Shift + O. You can change the shortcut by assigning a different shortcut to command "tsco.organize".

![Shortcut](./doc/shortcut.png "Shortcut")

### Context Menu

You can invoke command `TypeScript Class Organizer: Organize Current File` by using the context menu item.

![Context Menu](./doc/context_menu.png "Context Menu")

## Configuration

Extensions supports the following configuration options:

### Regions

- `tsco.useRegions`: Adds member group regions (true by default).
- `tsco.addMemberCountInRegionName`: Adds member group region member count after region title (true by default).
- `tsco.addPublicModifierIfMissing`: Adds public access modifier if missing (true by default).
- `tsco.addRegionIndentation`: Adds region indentation (true by default).
- `tsco.addRegionCaptionToRegionEnd`: Adds region caption to region end (true by default).

### Access modifiers

- `tsco.addPublicModifierIfMissing`: Adds a public access modifier if missing.

### Decorators

- `tsco.groupPropertiesWithDecorators`: Properties with decorators will come first, ordered by decorator name, then by member name (false by default).

### Arrow functions

- `tsco.treatArrowFunctionPropertiesAsMethods`: Arrow function properties will be treated as methods (false by default).

### Actions

- `tsco.organizeOnSave`: Source code will get organized automatically on file saved (false by default). This now includes auto-save with `onFocusChange` and `afterDelay` settings.

### Member ordering

- `tsco.memberOrder`: Configuration of grouping and ordering of members.

By default members are grouped and ordered in the following way:

- properties,

  - private static const properties,
  - private const properties,
  - private static readonly properties,
  - private readonly properties,
  - private static properties,
  - private properties,
  - protected static const properties,
  - protected const properties,
  - protected static readonly properties,
  - protected readonly properties,
  - protected static properties,
  - protected properties,
  - public static const properties,
  - public const properties,
  - public static readonly properties,
  - public readonly properties,
  - public static properties,
  - public properties,

- static block declarations,
- constructors,
- public static indexes,
- public indexes,
- public abstract indexes,
- protected static indexes,
- protected indexes,
- protected abstract indexes,
- private static indexes,
- private indexes,
- private abstract indexes,
- public static accessors,
- public accessors,
- public abstract accessors,
- protected static accessors,
- protected accessors,
- protected abstract accessors,
- private static accessors,
- private accessors,
- private abstract accessors,
- public static getters and setters,
- public getters and setters,
- public abstract getters and setters,
- protected static getters and setters,
- protected getters and setters,
- protected abstract getters and setters,
- private static getters and setters,
- private getters and setters,
- private abstract getters and setters,
- public static methods,
- public methods,
- public abstract methods,
- protected static methods,
- protected methods,
- protected abstract methods,
- private static methods,
- private methods,
- private abstract methods.

This configuration can ge changed by using the `tsco.memberOrder` setting in `settings.json``. Members can be grouped separately or grouped together with other member groups in a two level hierarchy. Every group has a property:

- `caption` (only for top level groups): the caption will be outputted if `tsco.useRegions` is set to true,
- `memberType` (top and bottom level groups): the type of the member in the group:

  - privateStaticConstProperties
  - privateConstProperties
  - privateStaticReadOnlyProperties
  - privateReadOnlyProperties
  - privateStaticProperties
  - privateProperties
  - protectedStaticConstProperties
  - protectedConstProperties
  - protectedStaticReadOnlyProperties
  - protectedReadOnlyProperties
  - protectedStaticProperties
  - protectedProperties
  - publicStaticConstProperties
  - publicConstProperties
  - publicStaticReadOnlyProperties
  - publicReadOnlyProperties
  - publicStaticProperties
  - publicProperties
  - staticBlockDeclarations,
  - constructors
  - publicStaticIndexes
  - publicIndexes
  - publicAbstractIndexes
  - protectedStaticIndexes
  - protectedIndexes
  - protectedAbstractIndexes
  - privateStaticIndexes
  - privateIndexes
  - privateAbstractIndexes
  - publicStaticAccessors
  - publicAccessors
  - publicAbstractAccessors
  - protectedStaticAccessors
  - protectedAccessors
  - protectedAbstractAccessors
  - privateStaticAccessors
  - privateAccessors
  - privateAbstractAccessors
  - publicStaticGettersAndSetters
  - publicGettersAndSetters
  - publicAbstractGettersAndSetters
  - protectedStaticGettersAndSetters
  - protectedGettersAndSetters
  - protectedAbstractGettersAndSetters
  - privateStaticGettersAndSetters
  - privateGettersAndSetters
  - privateAbstractGettersAndSetters
  - publicStaticMethods
  - publicMethods
  - publicAbstractMethods
  - protectedStaticMethods
  - protectedMethods
  - protectedAbstractMethods
  - privateStaticMethods
  - privateMethods
  - privateAbstractMethod

- `subGroups` (only for top level groups): the array of member types to be included in this group.
- `placeAbove`: list of member names to be put at the top of the group in the order specified (optional)
- `placeBelow`: list of member names to be put at the bottom of the group in the order specified (optional)

Example of the default `tsco.memberOrder` setting:

```json
{
  "tsco.memberOrder": [
    {
      "caption": "Properties",
      "memberTypes": [
        "privateStaticConstProperties",
        "privateConstProperties",
        "privateStaticReadOnlyProperties",
        "privateReadOnlyProperties",
        "privateStaticProperties",
        "privateProperties",
        "protectedStaticConstProperties",
        "protectedConstProperties",
        "protectedStaticReadOnlyProperties",
        "protectedReadOnlyProperties",
        "protectedStaticProperties",
        "protectedProperties",
        "publicStaticConstProperties",
        "publicConstProperties",
        "publicStaticReadOnlyProperties",
        "publicReadOnlyProperties",
        "publicStaticProperties",
        "publicProperties"
      ]
    },
    {
      "caption": "Static Block Declarations",
      "memberTypes": ["staticBlockDeclarations"]
    },
    {
      "caption": "Constructors",
      "memberTypes": ["constructors"]
    },
    {
      "caption": "Public Static Indexers",
      "memberTypes": ["publicStaticIndexes"]
    },
    {
      "caption": "Public Indexers",
      "memberTypes": ["publicIndexes"]
    },
    {
      "caption": "Public Abstract Indexers",
      "memberTypes": ["publicAbstractIndexes"]
    },
    {
      "caption": "Protected Static Indexers",
      "memberTypes": ["protectedStaticIndexes"]
    },
    {
      "caption": "Protected Indexers",
      "memberTypes": ["protectedIndexes"]
    },
    {
      "caption": "Protected Abstract Indexers",
      "memberTypes": ["protectedAbstractIndexes"]
    },
    {
      "caption": "Private Static Indexers",
      "memberTypes": ["privateStaticIndexes"]
    },
    {
      "caption": "Private Indexers",
      "memberTypes": ["privateIndexes"]
    },
    {
      "caption": "Private Abstract Indexers",
      "memberTypes": ["privateAbstractIndexes"]
    },
    {
      "caption": "Public Static Accessors",
      "memberTypes": ["publicStaticAccessors"]
    },
    {
      "caption": "Public Accessors",
      "memberTypes": ["publicAccessors"]
    },
    {
      "caption": "Public Abstract Accessors",
      "memberTypes": ["publicAbstractAccessors"]
    },
    {
      "caption": "Protected Static Accessors",
      "memberTypes": ["protectedStaticAccessors"]
    },
    {
      "caption": "Protected Accessors",
      "memberTypes": ["protectedAccessors"]
    },
    {
      "caption": "Protected Abstract Accessors",
      "memberTypes": ["protectedAbstractAccessors"]
    },
    {
      "caption": "Private Static Accessors",
      "memberTypes": ["privateStaticAccessors"]
    },
    {
      "caption": "Private Accessors",
      "memberTypes": ["privateAccessors"]
    },
    {
      "caption": "Private Abstract Accessors",
      "memberTypes": ["privateAbstractAccessors"]
    },
    {
      "caption": "Public Static Getters And Setters",
      "memberTypes": ["publicStaticGettersAndSetters"]
    },
    {
      "caption": "Public Getters And Setters",
      "memberTypes": ["publicGettersAndSetters"]
    },
    {
      "caption": "Public Abstract Getters And Setters",
      "memberTypes": ["publicAbstractGettersAndSetters"]
    },
    {
      "caption": "Protected Static Getters And Setters",
      "memberTypes": ["protectedStaticGettersAndSetters"]
    },
    {
      "caption": "Protected Getters And Setters",
      "memberTypes": ["protectedGettersAndSetters"]
    },
    {
      "caption": "Protected Abstract Getters And Setters",
      "memberTypes": ["protectedAbstractGettersAndSetters"]
    },
    {
      "caption": "Private Static Getters And Setters",
      "memberTypes": ["privateStaticGettersAndSetters"]
    },
    {
      "caption": "Private Getters And Setters",
      "memberTypes": ["privateGettersAndSetters"]
    },
    {
      "caption": "Private Abstract Getters And Setters",
      "memberTypes": ["privateAbstractGettersAndSetters"]
    },
    {
      "caption": "Public Static Methods",
      "memberTypes": ["publicStaticMethods"]
    },
    {
      "caption": "Public Methods",
      "memberTypes": ["publicMethods"]
    },
    {
      "caption": "Public Abstract Methods",
      "memberTypes": ["publicAbstractMethods"]
    },
    {
      "caption": "Protected Static Methods",
      "memberTypes": ["protectedStaticMethods"]
    },
    {
      "caption": "Protected Methods",
      "memberTypes": ["protectedMethods"]
    },
    {
      "caption": "Protected Abstract Methods",
      "memberTypes": ["protectedAbstractMethods"]
    },
    {
      "caption": "Private Static Methods",
      "memberTypes": ["privateStaticMethods"]
    },
    {
      "caption": "Private Methods",
      "memberTypes": ["privateMethods"]
    },
    {
      "caption": "Private Abstract Methods",
      "memberTypes": ["privateAbstractMethods"]
    }
  ]
}
```

If you'd like to order special members differently, you can yuse the `placeAbove` and `placeBelow` properties for a particular `tsco.memberOrder` item. If for example you prefer Angular component lifecycle methods on top of public methods, you can configure `publicMethods` member group like this:

```json
"tsco.memberOrder": [
  ...,
  {
    "caption": "Public Methods",
    "memberTypes": ["publicMethods"],
    "placeAbove": [
        "ngOnChanges", 
        "ngOnInit", 
        "ngDoCheck", 
        "ngAfterContentInit", 
        "ngAfterContentChecked", 
        "ngAfterViewInit", 
        "ngAfterViewChecked", 
        "ngOnDestroy"
    ]
  },
  ...
]
```

The `placeAbove` methods will always apear at the top of the public method membber group in the list as specified (if any exist in the class being ordered) and the rest of the methods will be ordered by name and placed below the `placeAbove` methods. Same goes for `placeBelow`, but those members will be placed at the bottom of the member group.

### Ignoring files

In order to prevent a TypeScript file being organized, add one of the following comments to the top of the source file:

```typescript
// tsco:ignore
```

or

```typescript
// <auto-generated />
```

## Change log

### 1.0.0

- Initial release.

### 1.0.9

- added add public modifier if missing option
- added add region Indentation option
- added end region caption option
- added organizing type aliases, interfaces, classes and functions
- fixed issue with Indentation tabs / spaces
- fixed issue when comments were preceding class members
- fixed issue when decorators were preceding class members
- fixed issue with removing redundant empty lines
- updated referenced packages

### 1.0.10

- added group properties with decorators option

### 1.0.11

- fixed issue with duplicated regions
- addded grouping by decorator for all elements, not just properties when grouping by decorators
- added a new line between group with decorators and group without decorators when grouping by decorators

### 1.0.12

- removed limitation where extension can be activated only when not in debug mode
- fixed bug where redundant empty lines were not removed correctly
- fix bug where public access modifier was not added to methods

### 1.0.14

- added option of adding number of members within a region (courtesy of [pillont](https://github.com/pillont))
- added option to output accessors before constructor (courtesy of [pillont](https://github.com/pillont))

### 1.0.15

- add option to customize grouping and ordering of members

### 1.0.16

- fix bug where accessors (getters and setters) got removed when organizing a class

### 1.0.17

- added option to treat arrow function properties as methods (courtesy of [testpossessed](https://github.com/testpossessed))
- fix bug where assync methods were not assigned a public access modifier correctly

### 1.0.19

- added option organize file on save

### 1.0.21

- fixed issue where static members without an access modifier were not correctly decorated with the public access modifier

### 1.0.23

- fixed issue where a redundant empty line was added when organising arrow type method properties
- fixed issue where default access modifier is not correctly set
- fixed issue where invalid member names are used
- trigger organizing members only if manually saving the file and not if autosave is on in VS Code (courtesy of [Donny Verduijn](https://github.com/DonnyVerduijn))

### 1.0.24

- add support for private identifiers for properties and methods

### 1.0.25

- fix issue where intefaces lost getters/setters when organizing
- add support for a special member list to be put at the top or bottom of a member group

### 1.0.26

- update README

### 1.0.27

- add support for organizing accessors
- add support for organizing static block declarations
- add support for organizing functions outside of classes
- add support for ignoring files

### 1.0.28

- fix TS reference error

### 1.0.29

- fix accessor issue when decorator contains a parameter with the name of the field

### 1.0.31

- add organizing document on saving in any mode (not just manual saving) (courtesy of [Christopher Robinson](https://github.com/Christopher-C-Robinson))
