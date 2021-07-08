/// <reference types="node" />
import { Buffer } from "buffer";
interface LayoutObject<T> {
    [key: string]: T;
}
/**
 * Base class for layout objects.
 *
 * **NOTE** This is an abstract base class; you can create instances
 * if it amuses you, but they won't support the {@link
 * Layout#encode|encode} or {@link Layout#decode|decode} functions.
 *
 * @param {Number} span - Initializer for {@link Layout#span|span}.  The
 * parameter must be an integer; a negative value signifies that the
 * span is {@link Layout#getSpan|value-specific}.
 *
 * @param {string} [property] - Initializer for {@link
 * Layout#property|property}.
 *
 * @abstract
 */
export declare class Layout {
    span: number;
    property?: string;
    boundConstructor_?: any;
    constructor(span: number, property?: string);
    /** Function to create an Object into which decoded properties will
     * be written.
     *
     * Used only for layouts that {@link Layout#decode|decode} to Object
     * instances, which means:
     * * {@link Structure}
     * * {@link Union}
     * * {@link VariantLayout}
     * * {@link BitStructure}
     *
     * If left undefined the JavaScript representation of these layouts
     * will be Object instances.
     *
     * See {@link bindConstructorLayout}.
     */
    makeDestinationObject(): LayoutObject<any>;
    /**
     * Decode from a Buffer into an JavaScript value.
     *
     * @param {Buffer} b - the buffer from which encoded data is read.
     *
     * @param {Number} [offset] - the offset at which the encoded data
     * starts.  If absent a zero offset is inferred.
     *
     * @returns {(Number|Array|Object)} - the value of the decoded data.
     *
     * @abstract
     */
    decode(b: Uint8Array, offset?: number): any;
    /**
     * Encode a JavaScript value into a Buffer.
     *
     * @param {(Number|Array|Object)} src - the value to be encoded into
     * the buffer.  The type accepted depends on the (sub-)type of {@link
     * Layout}.
     *
     * @param {Buffer} b - the buffer into which encoded data will be
     * written.
     *
     * @param {Number} [offset] - the offset at which the encoded data
     * starts.  If absent a zero offset is inferred.
     *
     * @returns {Number} - the number of bytes encoded, including the
     * space skipped for internal padding, but excluding data such as
     * {@link Sequence#count|lengths} when stored {@link
     * ExternalLayout|externally}.  This is the adjustment to `offset`
     * producing the offset where data for the next layout would be
     * written.
     *
     * @abstract
     */
    encode(src: unknown, b: Uint8Array, offset?: number): number;
    /**
     * Calculate the span of a specific instance of a layout.
     *
     * @param {Buffer} b - the buffer that contains an encoded instance.
     *
     * @param {Number} [offset] - the offset at which the encoded instance
     * starts.  If absent a zero offset is inferred.
     *
     * @return {Number} - the number of bytes covered by the layout
     * instance.  If this method is not overridden in a subclass the
     * definition-time constant {@link Layout#span|span} will be
     * returned.
     *
     * @throws {RangeError} - if the length of the value cannot be
     * determined.
     */
    getSpan(b?: Uint8Array, offset?: number): number;
    /**
     * Replicate the layout using a new property.
     *
     * This function must be used to get a structurally-equivalent layout
     * with a different name since all {@link Layout} instances are
     * immutable.
     *
     * **NOTE** This is a shallow copy.  All fields except {@link
     * Layout#property|property} are strictly equal to the origin layout.
     *
     * @param {String} property - the value for {@link
     * Layout#property|property} in the replica.
     *
     * @returns {Layout} - the copy with {@link Layout#property|property}
     * set to `property`.
     */
    replicate(property: string): Layout;
    /**
     * Create an object from layout properties and an array of values.
     *
     * **NOTE** This function returns `undefined` if invoked on a layout
     * that does not return its value as an Object.  Objects are
     * returned for things that are a {@link Structure}, which includes
     * {@link VariantLayout|variant layouts} if they are structures, and
     * excludes {@link Union}s.  If you want this feature for a union
     * you must use {@link Union.getVariant|getVariant} to select the
     * desired layout.
     *
     * @param {Array} values - an array of values that correspond to the
     * default order for properties.  As with {@link Layout#decode|decode}
     * layout elements that have no property name are skipped when
     * iterating over the array values.  Only the top-level properties are
     * assigned; arguments are not assigned to properties of contained
     * layouts.  Any unused values are ignored.
     *
     * @return {(Object|undefined)}
     */
    fromArray(values: Array<any>): LayoutObject<any> | undefined;
}
export declare function nameWithProperty(name: string, lo: any): string;
/**
 * Augment a class so that instances can be encoded/decoded using a
 * given layout.
 *
 * Calling this function couples `Class` with `layout` in several ways:
 *
 * * `Class.layout_` becomes a static member property equal to `layout`;
 * * `layout.boundConstructor_` becomes a static member property equal
 *    to `Class`;
 * * The {@link Layout#makeDestinationObject|makeDestinationObject()}
 *   property of `layout` is set to a function that returns a `new
 *   Class()`;
 * * `Class.decode(b, offset)` becomes a static member function that
 *   delegates to {@link Layout#decode|layout.decode}.  The
 *   synthesized function may be captured and extended.
 * * `Class.prototype.encode(b, offset)` provides an instance member
 *   function that delegates to {@link Layout#encode|layout.encode}
 *   with `src` set to `this`.  The synthesized function may be
 *   captured and extended, but when the extension is invoked `this`
 *   must be explicitly bound to the instance.
 *
 * @param {class} Class - a JavaScript class with a nullary
 * constructor.
 *
 * @param {Layout} layout - the {@link Layout} instance used to encode
 * instances of `Class`.
 */
export declare function bindConstructorLayout(Class: any, layout: Layout): void;
/**
 * An object that behaves like a layout but does not consume space
 * within its containing layout.
 *
 * This is primarily used to obtain metadata about a member, such as a
 * {@link OffsetLayout} that can provide data about a {@link
 * Layout#getSpan|value-specific span}.
 *
 * **NOTE** This is an abstract base class; you can create instances
 * if it amuses you, but they won't support {@link
 * ExternalLayout#isCount|isCount} or other {@link Layout} functions.
 *
 * @param {Number} span - initializer for {@link Layout#span|span}.
 * The parameter can range from 1 through 6.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @abstract
 * @augments {Layout}
 */
export declare class ExternalLayout extends Layout {
    /**
     * Return `true` iff the external layout decodes to an unsigned
     * integer layout.
     *
     * In that case it can be used as the source of {@link
     * Sequence#count|Sequence counts}, {@link Blob#length|Blob lengths},
     * or as {@link UnionLayoutDiscriminator#layout|external union
     * discriminators}.
     *
     * @abstract
     */
    isCount(): boolean;
}
/**
 * An {@link ExternalLayout} that determines its {@link
 * Layout#decode|value} based on offset into and length of the buffer
 * on which it is invoked.
 *
 * *Factory*: {@link module:Layout.greedy|greedy}
 *
 * @param {Number} [elementSpan] - initializer for {@link
 * GreedyCount#elementSpan|elementSpan}.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {ExternalLayout}
 */
export declare class GreedyCount extends ExternalLayout {
    elementSpan: number;
    constructor(elementSpan: number, property: string);
    /** @override */
    isCount(): boolean;
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: unknown, b: Uint8Array, offset?: number): number;
}
/**
 * An {@link ExternalLayout} that supports accessing a {@link Layout}
 * at a fixed offset from the start of another Layout.  The offset may
 * be before, within, or after the base layout.
 *
 * *Factory*: {@link module:Layout.offset|offset}
 *
 * @param {Layout} layout - initializer for {@link
 * OffsetLayout#layout|layout}, modulo `property`.
 *
 * @param {Number} [offset] - Initializes {@link
 * OffsetLayout#offset|offset}.  Defaults to zero.
 *
 * @param {string} [property] - Optional new property name for a
 * {@link Layout#replicate| replica} of `layout` to be used as {@link
 * OffsetLayout#layout|layout}.  If not provided the `layout` is used
 * unchanged.
 *
 * @augments {Layout}
 */
export declare class OffsetLayout extends ExternalLayout {
    layout: Layout;
    offset: number;
    constructor(layout: Layout, offset?: number, property?: string);
    /** @override */
    isCount(): boolean;
    /** @override */
    decode(b: Uint8Array, offset?: number): any;
    /** @override */
    encode(src: unknown, b: Uint8Array, offset?: number): number;
}
/**
 * Represent an unsigned integer in little-endian format.
 *
 * *Factory*: {@link module:Layout.u8|u8}, {@link
 *  module:Layout.u16|u16}, {@link module:Layout.u24|u24}, {@link
 *  module:Layout.u32|u32}, {@link module:Layout.u40|u40}, {@link
 *  module:Layout.u48|u48}
 *
 * @param {Number} span - initializer for {@link Layout#span|span}.
 * The parameter can range from 1 through 6.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class UInt extends Layout {
    constructor(span: number, property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent an unsigned integer in big-endian format.
 *
 * *Factory*: {@link module:Layout.u8be|u8be}, {@link
 * module:Layout.u16be|u16be}, {@link module:Layout.u24be|u24be},
 * {@link module:Layout.u32be|u32be}, {@link
 * module:Layout.u40be|u40be}, {@link module:Layout.u48be|u48be}
 *
 * @param {Number} span - initializer for {@link Layout#span|span}.
 * The parameter can range from 1 through 6.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class UIntBE extends Layout {
    constructor(span: number, property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a signed integer in little-endian format.
 *
 * *Factory*: {@link module:Layout.s8|s8}, {@link
 *  module:Layout.s16|s16}, {@link module:Layout.s24|s24}, {@link
 *  module:Layout.s32|s32}, {@link module:Layout.s40|s40}, {@link
 *  module:Layout.s48|s48}
 *
 * @param {Number} span - initializer for {@link Layout#span|span}.
 * The parameter can range from 1 through 6.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Int extends Layout {
    constructor(span: number, property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a signed integer in big-endian format.
 *
 * *Factory*: {@link module:Layout.s8be|s8be}, {@link
 * module:Layout.s16be|s16be}, {@link module:Layout.s24be|s24be},
 * {@link module:Layout.s32be|s32be}, {@link
 * module:Layout.s40be|s40be}, {@link module:Layout.s48be|s48be}
 *
 * @param {Number} span - initializer for {@link Layout#span|span}.
 * The parameter can range from 1 through 6.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class IntBE extends Layout {
    constructor(span: number, property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent an unsigned 64-bit integer in little-endian format when
 * encoded and as a near integral JavaScript Number when decoded.
 *
 * *Factory*: {@link module:Layout.nu64|nu64}
 *
 * **NOTE** Values with magnitude greater than 2^52 may not decode to
 * the exact value of the encoded representation.
 *
 * @augments {Layout}
 */
export declare class NearUInt64 extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent an unsigned 64-bit integer in big-endian format when
 * encoded and as a near integral JavaScript Number when decoded.
 *
 * *Factory*: {@link module:Layout.nu64be|nu64be}
 *
 * **NOTE** Values with magnitude greater than 2^52 may not decode to
 * the exact value of the encoded representation.
 *
 * @augments {Layout}
 */
export declare class NearUInt64BE extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a signed 64-bit integer in little-endian format when
 * encoded and as a near integral JavaScript Number when decoded.
 *
 * *Factory*: {@link module:Layout.ns64|ns64}
 *
 * **NOTE** Values with magnitude greater than 2^52 may not decode to
 * the exact value of the encoded representation.
 *
 * @augments {Layout}
 */
export declare class NearInt64 extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a signed 64-bit integer in big-endian format when
 * encoded and as a near integral JavaScript Number when decoded.
 *
 * *Factory*: {@link module:Layout.ns64be|ns64be}
 *
 * **NOTE** Values with magnitude greater than 2^52 may not decode to
 * the exact value of the encoded representation.
 *
 * @augments {Layout}
 */
export declare class NearInt64BE extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a 32-bit floating point number in little-endian format.
 *
 * *Factory*: {@link module:Layout.f32|f32}
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Float extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a 32-bit floating point number in big-endian format.
 *
 * *Factory*: {@link module:Layout.f32be|f32be}
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class FloatBE extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a 64-bit floating point number in little-endian format.
 *
 * *Factory*: {@link module:Layout.f64|f64}
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Double extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a 64-bit floating point number in big-endian format.
 *
 * *Factory*: {@link module:Layout.f64be|f64be}
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class DoubleBE extends Layout {
    constructor(property: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): number;
    /** @override */
    encode(src: number, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a contiguous sequence of a specific layout as an Array.
 *
 * *Factory*: {@link module:Layout.seq|seq}
 *
 * @param {Layout} elementLayout - initializer for {@link
 * Sequence#elementLayout|elementLayout}.
 *
 * @param {(Number|ExternalLayout)} count - initializer for {@link
 * Sequence#count|count}.  The parameter must be either a positive
 * integer or an instance of {@link ExternalLayout}.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Sequence extends Layout {
    elementLayout: Layout;
    count: number | ExternalLayout;
    constructor(elementLayout: Layout, count: number | ExternalLayout, property: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): Array<any>;
    /** Implement {@link Layout#encode|encode} for {@link Sequence}.
     *
     * **NOTE** If `src` is shorter than {@link Sequence#count|count} then
     * the unused space in the buffer is left unchanged.  If `src` is
     * longer than {@link Sequence#count|count} the unneeded elements are
     * ignored.
     *
     * **NOTE** If {@link Layout#count|count} is an instance of {@link
     * ExternalLayout} then the length of `src` will be encoded as the
     * count after `src` is encoded. */
    encode(src: Array<any>, b: Uint8Array, offset?: number): number;
}
/**
 * Represent a contiguous sequence of arbitrary layout elements as an
 * Object.
 *
 * *Factory*: {@link module:Layout.struct|struct}
 *
 * **NOTE** The {@link Layout#span|span} of the structure is variable
 * if any layout in {@link Structure#fields|fields} has a variable
 * span.  When {@link Layout#encode|encoding} we must have a value for
 * all variable-length fields, or we wouldn't be able to figure out
 * how much space to use for storage.  We can only identify the value
 * for a field when it has a {@link Layout#property|property}.  As
 * such, although a structure may contain both unnamed fields and
 * variable-length fields, it cannot contain an unnamed
 * variable-length field.
 *
 * @param {Layout[]} fields - initializer for {@link
 * Structure#fields|fields}.  An error is raised if this contains a
 * variable-length field for which a {@link Layout#property|property}
 * is not defined.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @param {Boolean} [decodePrefixes] - initializer for {@link
 * Structure#decodePrefixes|property}.
 *
 * @throws {Error} - if `fields` contains an unnamed variable-length
 * layout.
 *
 * @augments {Layout}
 */
export declare class Structure extends Layout {
    fields: Layout[];
    decodePrefixes: boolean;
    constructor(fields: Layout[], property?: string, decodePrefixes?: boolean);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): object;
    /** Implement {@link Layout#encode|encode} for {@link Structure}.
     *
     * If `src` is missing a property for a member with a defined {@link
     * Layout#property|property} the corresponding region of the buffer is
     * left unmodified. */
    encode(src: LayoutObject<any>, b: Uint8Array, offset?: number): number;
    /** @override */
    fromArray(values: Array<any>): object;
    /**
     * Get access to the layout of a given property.
     *
     * @param {String} property - the structure member of interest.
     *
     * @return {Layout} - the layout associated with `property`, or
     * undefined if there is no such property.
     */
    layoutFor(property: string): Layout | undefined;
    /**
     * Get the offset of a structure member.
     *
     * @param {String} property - the structure member of interest.
     *
     * @return {Number} - the offset in bytes to the start of `property`
     * within the structure, or undefined if `property` is not a field
     * within the structure.  If the property is a member but follows a
     * variable-length structure member a negative number will be
     * returned.
     */
    offsetOf(property: string): number | undefined;
}
/**
 * An object that can provide a {@link
 * Union#discriminator|discriminator} API for {@link Union}.
 *
 * **NOTE** This is an abstract base class; you can create instances
 * if it amuses you, but they won't support the {@link
 * UnionDiscriminator#encode|encode} or {@link
 * UnionDiscriminator#decode|decode} functions.
 *
 * @param {string} [property] - Default for {@link
 * UnionDiscriminator#property|property}.
 *
 * @abstract
 */
export declare class UnionDiscriminator {
    property: string;
    layout: Layout;
    constructor(layout: Layout, property: string);
    /** Analog to {@link Layout#decode|Layout decode} for union discriminators.
     *
     * The implementation of this method need not reference the buffer if
     * variant information is available through other means. */
    decode(b?: Uint8Array, offset?: number): any;
    /** Analog to {@link Layout#decode|Layout encode} for union discriminators.
     *
     * The implementation of this method need not store the value if
     * variant information is maintained through other means. */
    encode(src: any, b: Uint8Array, offset?: number): void;
}
/**
 * An object that can provide a {@link
 * UnionDiscriminator|discriminator API} for {@link Union} using an
 * unsigned integral {@link Layout} instance located either inside or
 * outside the union.
 *
 * @param {ExternalLayout} layout - initializes {@link
 * UnionLayoutDiscriminator#layout|layout}.  Must satisfy {@link
 * ExternalLayout#isCount|isCount()}.
 *
 * @param {string} [property] - Default for {@link
 * UnionDiscriminator#property|property}, superseding the property
 * from `layout`, but defaulting to `variant` if neither `property`
 * nor layout provide a property name.
 *
 * @augments {UnionDiscriminator}
 */
export declare class UnionLayoutDiscriminator extends UnionDiscriminator {
    constructor(layout: ExternalLayout, property?: string);
    /** Delegate decoding to {@link UnionLayoutDiscriminator#layout|layout}. */
    decode(b: Uint8Array, offset?: number): number;
    /** Delegate encoding to {@link UnionLayoutDiscriminator#layout|layout}. */
    encode(src: unknown, b: Uint8Array, offset?: number): unknown;
}
/**
 * Represent any number of span-compatible layouts.
 *
 * *Factory*: {@link module:Layout.union|union}
 *
 * If the union has a {@link Union#defaultLayout|default layout} that
 * layout must have a non-negative {@link Layout#span|span}.  The span
 * of a fixed-span union includes its {@link
 * Union#discriminator|discriminator} if the variant is a {@link
 * Union#usesPrefixDiscriminator|prefix of the union}, plus the span
 * of its {@link Union#defaultLayout|default layout}.
 *
 * If the union does not have a default layout then the encoded span
 * of the union depends on the encoded span of its variant (which may
 * be fixed or variable).
 *
 * {@link VariantLayout#layout|Variant layout}s are added through
 * {@link Union#addVariant|addVariant}.  If the union has a default
 * layout, the span of the {@link VariantLayout#layout|layout
 * contained by the variant} must not exceed the span of the {@link
 * Union#defaultLayout|default layout} (minus the span of a {@link
 * Union#usesPrefixDiscriminator|prefix disriminator}, if used).  The
 * span of the variant will equal the span of the union itself.
 *
 * The variant for a buffer can only be identified from the {@link
 * Union#discriminator|discriminator} {@link
 * UnionDiscriminator#property|property} (in the case of the {@link
 * Union#defaultLayout|default layout}), or by using {@link
 * Union#getVariant|getVariant} and examining the resulting {@link
 * VariantLayout} instance.
 *
 * A variant compatible with a JavaScript object can be identified
 * using {@link Union#getSourceVariant|getSourceVariant}.
 *
 * @param {(UnionDiscriminator|ExternalLayout|Layout)} discr - How to
 * identify the layout used to interpret the union contents.  The
 * parameter must be an instance of {@link UnionDiscriminator}, an
 * {@link ExternalLayout} that satisfies {@link
 * ExternalLayout#isCount|isCount()}, or {@link UInt} (or {@link
 * UIntBE}).  When a non-external layout element is passed the layout
 * appears at the start of the union.  In all cases the (synthesized)
 * {@link UnionDiscriminator} instance is recorded as {@link
 * Union#discriminator|discriminator}.
 *
 * @param {(Layout|null)} defaultLayout - initializer for {@link
 * Union#defaultLayout|defaultLayout}.  If absent defaults to `null`.
 * If `null` there is no default layout: the union has data-dependent
 * length and attempts to decode or encode unrecognized variants will
 * throw an exception.  A {@link Layout} instance must have a
 * non-negative {@link Layout#span|span}, and if it lacks a {@link
 * Layout#property|property} the {@link
 * Union#defaultLayout|defaultLayout} will be a {@link
 * Layout#replicate|replica} with property `content`.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Union extends Layout {
    discriminator: UnionDiscriminator;
    usesPrefixDiscriminator: boolean;
    defaultLayout: Layout | null;
    registry: {
        [key: number]: VariantLayout;
    };
    getSourceVariant: (src: object) => VariantLayout | undefined;
    configGetSourceVariant: (getSourceVariant: (src: object) => VariantLayout | undefined) => void;
    constructor(discr: Layout | UnionDiscriminator, defaultLayout: Layout | null, property: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /**
     * Method to infer a registered Union variant compatible with `src`.
     *
     * The first satisfied rule in the following sequence defines the
     * return value:
     * * If `src` has properties matching the Union discriminator and
     *   the default layout, `undefined` is returned regardless of the
     *   value of the discriminator property (this ensures the default
     *   layout will be used);
     * * If `src` has a property matching the Union discriminator, the
     *   value of the discriminator identifies a registered variant, and
     *   either (a) the variant has no layout, or (b) `src` has the
     *   variant's property, then the variant is returned (because the
     *   source satisfies the constraints of the variant it identifies);
     * * If `src` does not have a property matching the Union
     *   discriminator, but does have a property matching a registered
     *   variant, then the variant is returned (because the source
     *   matches a variant without an explicit conflict);
     * * An error is thrown (because we either can't identify a variant,
     *   or we were explicitly told the variant but can't satisfy it).
     *
     * @param {Object} src - an object presumed to be compatible with
     * the content of the Union.
     *
     * @return {(undefined|VariantLayout)} - as described above.
     *
     * @throws {Error} - if `src` cannot be associated with a default or
     * registered variant.
     */
    defaultGetSourceVariant(src: LayoutObject<any>): VariantLayout | undefined;
    /** Implement {@link Layout#decode|decode} for {@link Union}.
     *
     * If the variant is {@link Union#addVariant|registered} the return
     * value is an instance of that variant, with no explicit
     * discriminator.  Otherwise the {@link Union#defaultLayout|default
     * layout} is used to decode the content. */
    decode(b: Uint8Array, offset?: number): {
        [key: string]: any;
    };
    /** Implement {@link Layout#encode|encode} for {@link Union}.
     *
     * This API assumes the `src` object is consistent with the union's
     * {@link Union#defaultLayout|default layout}.  To encode variants
     * use the appropriate variant-specific {@link VariantLayout#encode}
     * method. */
    encode(src: LayoutObject<any>, b: Uint8Array, offset?: number): number;
    /** Register a new variant structure within a union.  The newly
     * created variant is returned.
     *
     * @param {Number} variant - initializer for {@link
     * VariantLayout#variant|variant}.
     *
     * @param {Layout} layout - initializer for {@link
     * VariantLayout#layout|layout}.
     *
     * @param {String} property - initializer for {@link
     * Layout#property|property}.
     *
     * @return {VariantLayout} */
    addVariant(variant: number, layout: Layout, property: string): VariantLayout;
    /**
     * Get the layout associated with a registered variant.
     *
     * If `vb` does not produce a registered variant the function returns
     * `undefined`.
     *
     * @param {(Number|Buffer)} vb - either the variant number, or a
     * buffer from which the discriminator is to be read.
     *
     * @param {Number} offset - offset into `vb` for the start of the
     * union.  Used only when `vb` is an instance of {Buffer}.
     *
     * @return {({VariantLayout}|undefined)}
     */
    getVariant(vb: Uint8Array | number, offset?: number): VariantLayout | undefined;
}
/**
 * Represent a specific variant within a containing union.
 *
 * **NOTE** The {@link Layout#span|span} of the variant may include
 * the span of the {@link Union#discriminator|discriminator} used to
 * identify it, but values read and written using the variant strictly
 * conform to the content of {@link VariantLayout#layout|layout}.
 *
 * **NOTE** User code should not invoke this constructor directly.  Use
 * the union {@link Union#addVariant|addVariant} helper method.
 *
 * @param {Union} union - initializer for {@link
 * VariantLayout#union|union}.
 *
 * @param {Number} variant - initializer for {@link
 * VariantLayout#variant|variant}.
 *
 * @param {Layout} [layout] - initializer for {@link
 * VariantLayout#layout|layout}.  If absent the variant carries no
 * data.
 *
 * @param {String} [property] - initializer for {@link
 * Layout#property|property}.  Unlike many other layouts, variant
 * layouts normally include a property name so they can be identified
 * within their containing {@link Union}.  The property identifier may
 * be absent only if `layout` is is absent.
 *
 * @augments {Layout}
 */
export declare class VariantLayout extends Layout {
    union: Union;
    variant: number;
    layout: Layout | null;
    constructor(union: Union, variant: number, layout: Layout | null, property: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): LayoutObject<any>;
    /** @override */
    encode(src: LayoutObject<any>, b: Uint8Array, offset?: number): number;
    /** Delegate {@link Layout#fromArray|fromArray} to {@link
     * VariantLayout#layout|layout}. */
    fromArray(values: Array<any>): object | undefined;
}
/**
 * Contain a sequence of bit fields as an unsigned integer.
 *
 * *Factory*: {@link module:Layout.bits|bits}
 *
 * This is a container element; within it there are {@link BitField}
 * instances that provide the extracted properties.  The container
 * simply defines the aggregate representation and its bit ordering.
 * The representation is an object containing properties with numeric
 * or {@link Boolean} values.
 *
 * {@link BitField}s are added with the {@link
 * BitStructure#addField|addField} and {@link
 * BitStructure#addBoolean|addBoolean} methods.

 * @param {Layout} word - initializer for {@link
 * BitStructure#word|word}.  The parameter must be an instance of
 * {@link UInt} (or {@link UIntBE}) that is no more than 4 bytes wide.
 *
 * @param {bool} [msb] - `true` if the bit numbering starts at the
 * most significant bit of the containing word; `false` (default) if
 * it starts at the least significant bit of the containing word.  If
 * the parameter at this position is a string and `property` is
 * `undefined` the value of this argument will instead be used as the
 * value of `property`.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class BitStructure extends Layout {
    fields: BitField[];
    word: Layout;
    msb: boolean;
    _packedSetValue: (v: number) => BitStructure;
    _packedGetValue: () => number;
    constructor(word: Layout, msb: boolean | string, property?: string);
    /** @override */
    decode(b: Uint8Array, offset?: number): LayoutObject<any>;
    /** Implement {@link Layout#encode|encode} for {@link BitStructure}.
     *
     * If `src` is missing a property for a member with a defined {@link
     * Layout#property|property} the corresponding region of the packed
     * value is left unmodified.  Unused bits are also left unmodified. */
    encode(src: LayoutObject<any>, b: Uint8Array, offset?: number): number;
    /** Register a new bitfield with a containing bit structure.  The
     * resulting bitfield is returned.
     *
     * @param {Number} bits - initializer for {@link BitField#bits|bits}.
     *
     * @param {string} property - initializer for {@link
     * Layout#property|property}.
     *
     * @return {BitField} */
    addField(bits: number, property: string): BitField;
    /** As with {@link BitStructure#addField|addField} for single-bit
     * fields with `boolean` value representation.
     *
     * @param {string} property - initializer for {@link
     * Layout#property|property}.
     *
     * @return {Boolean} */
    addBoolean(property: string): Boolean;
    /**
     * Get access to the bit field for a given property.
     *
     * @param {String} property - the bit field of interest.
     *
     * @return {BitField} - the field associated with `property`, or
     * undefined if there is no such property.
     */
    fieldFor(property: string): BitField | undefined;
}
/**
 * Represent a sequence of bits within a {@link BitStructure}.
 *
 * All bit field values are represented as unsigned integers.
 *
 * **NOTE** User code should not invoke this constructor directly.
 * Use the container {@link BitStructure#addField|addField} helper
 * method.
 *
 * **NOTE** BitField instances are not instances of {@link Layout}
 * since {@link Layout#span|span} measures 8-bit units.
 *
 * @param {BitStructure} container - initializer for {@link
 * BitField#container|container}.
 *
 * @param {Number} bits - initializer for {@link BitField#bits|bits}.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 */
export declare class BitField {
    container: BitStructure;
    bits: number;
    valueMask: number;
    start: number;
    wordMask: number;
    property: string;
    constructor(container: BitStructure, bits: number, property: string);
    /** Store a value into the corresponding subsequence of the containing
     * bit field. */
    decode(b?: Uint8Array, offset?: number): unknown;
    /** Store a value into the corresponding subsequence of the containing
     * bit field.
     *
     * **NOTE** This is not a specialization of {@link
     * Layout#encode|Layout.encode} and there is no return value. */
    encode(value: number): void;
}
/**
 * Represent a single bit within a {@link BitStructure} as a
 * JavaScript boolean.
 *
 * **NOTE** User code should not invoke this constructor directly.
 * Use the container {@link BitStructure#addBoolean|addBoolean} helper
 * method.
 *
 * @param {BitStructure} container - initializer for {@link
 * BitField#container|container}.
 *
 * @param {string} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {BitField}
 */
export declare class Boolean extends BitField {
    constructor(container: BitStructure, property: string);
    /** Override {@link BitField#decode|decode} for {@link Boolean|Boolean}.
     *
     * @returns {boolean} */
    decode(b: Uint8Array, offset?: number): boolean;
    /** @override */
    encode(value: number | boolean): any;
}
/**
 * Contain a fixed-length block of arbitrary data, represented as a
 * Buffer.
 *
 * *Factory*: {@link module:Layout.blob|blob}
 *
 * @param {(Number|ExternalLayout)} length - initializes {@link
 * Blob#length|length}.
 *
 * @param {String} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Blob extends Layout {
    length: number | ExternalLayout;
    constructor(length: number | ExternalLayout, property: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): Buffer;
    /** Implement {@link Layout#encode|encode} for {@link Blob}.
     *
     * **NOTE** If {@link Layout#count|count} is an instance of {@link
     * ExternalLayout} then the length of `src` will be encoded as the
     * count after `src` is encoded. */
    encode(src: Uint8Array, b: Uint8Array, offset: number): number;
}
/**
 * Contain a `NUL`-terminated UTF8 string.
 *
 * *Factory*: {@link module:Layout.cstr|cstr}
 *
 * **NOTE** Any UTF8 string that incorporates a zero-valued byte will
 * not be correctly decoded by this layout.
 *
 * @param {String} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class CString extends Layout {
    constructor(property: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): string;
    /** @override */
    encode(src: string, b: Uint8Array, offset?: number): number;
}
/**
 * Contain a UTF8 string with implicit length.
 *
 * *Factory*: {@link module:Layout.utf8|utf8}
 *
 * **NOTE** Because the length is implicit in the size of the buffer
 * this layout should be used only in isolation, or in a situation
 * where the length can be expressed by operating on a slice of the
 * containing buffer.
 *
 * @param {Number} [maxSpan] - the maximum length allowed for encoded
 * string content.  If not provided there is no bound on the allowed
 * content.
 *
 * @param {String} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class UTF8 extends Layout {
    maxSpan: number;
    constructor(maxSpan: number | string, property?: string);
    /** @override */
    getSpan(b: Uint8Array, offset?: number): number;
    /** @override */
    decode(b: Uint8Array, offset?: number): string;
    /** @override */
    encode(src: unknown, b: Uint8Array, offset?: number): number;
}
/**
 * Contain a constant value.
 *
 * This layout may be used in cases where a JavaScript value can be
 * inferred without an expression in the binary encoding.  An example
 * would be a {@link VariantLayout|variant layout} where the content
 * is implied by the union {@link Union#discriminator|discriminator}.
 *
 * @param {Object|Number|String} value - initializer for {@link
 * Constant#value|value}.  If the value is an object (or array) and
 * the application intends the object to remain unchanged regardless
 * of what is done to values decoded by this layout, the value should
 * be frozen prior passing it to this constructor.
 *
 * @param {String} [property] - initializer for {@link
 * Layout#property|property}.
 *
 * @augments {Layout}
 */
export declare class Constant extends Layout {
    value: any;
    constructor(value: any, property: string);
    /** @override */
    decode(b?: Uint8Array, offset?: number): any;
    /** @override */
    encode(src: any, b?: Uint8Array, offset?: number): number;
}
/** Factory for {@link GreedyCount}. */
export declare const greedy: (elementSpan: number, property: string) => GreedyCount;
/** Factory for {@link OffsetLayout}. */
export declare const offset: (layout: Layout, offset?: number | undefined, property?: string | undefined) => OffsetLayout;
/** Factory for {@link UInt|unsigned int layouts} spanning one
 * byte. */
export declare const u8: (property: string) => UInt;
/** Factory for {@link UInt|little-endian unsigned int layouts}
 * spanning two bytes. */
export declare const u16: (property: string) => UInt;
/** Factory for {@link UInt|little-endian unsigned int layouts}
 * spanning three bytes. */
export declare const u24: (property: string) => UInt;
/** Factory for {@link UInt|little-endian unsigned int layouts}
 * spanning four bytes. */
export declare const u32: (property: string) => UInt;
/** Factory for {@link UInt|little-endian unsigned int layouts}
 * spanning five bytes. */
export declare const u40: (property: string) => UInt;
/** Factory for {@link UInt|little-endian unsigned int layouts}
 * spanning six bytes. */
export declare const u48: (property: string) => UInt;
/** Factory for {@link NearUInt64|little-endian unsigned int
 * layouts} interpreted as Numbers. */
export declare const nu64: (property: string) => NearUInt64;
/** Factory for {@link UInt|big-endian unsigned int layouts}
 * spanning two bytes. */
export declare const u16be: (property: string) => UIntBE;
/** Factory for {@link UInt|big-endian unsigned int layouts}
 * spanning three bytes. */
export declare const u24be: (property: string) => UIntBE;
/** Factory for {@link UInt|big-endian unsigned int layouts}
 * spanning four bytes. */
export declare const u32be: (property: string) => UIntBE;
/** Factory for {@link UInt|big-endian unsigned int layouts}
 * spanning five bytes. */
export declare const u40be: (property: string) => UIntBE;
/** Factory for {@link UInt|big-endian unsigned int layouts}
 * spanning six bytes. */
export declare const u48be: (property: string) => UIntBE;
/** Factory for {@link NearUInt64BE|big-endian unsigned int
 * layouts} interpreted as Numbers. */
export declare const nu64be: (property: string) => NearUInt64BE;
/** Factory for {@link Int|signed int layouts} spanning one
 * byte. */
export declare const s8: (property: string) => Int;
/** Factory for {@link Int|little-endian signed int layouts}
 * spanning two bytes. */
export declare const s16: (property: string) => Int;
/** Factory for {@link Int|little-endian signed int layouts}
 * spanning three bytes. */
export declare const s24: (property: string) => Int;
/** Factory for {@link Int|little-endian signed int layouts}
 * spanning four bytes. */
export declare const s32: (property: string) => Int;
/** Factory for {@link Int|little-endian signed int layouts}
 * spanning five bytes. */
export declare const s40: (property: string) => Int;
/** Factory for {@link Int|little-endian signed int layouts}
 * spanning six bytes. */
export declare const s48: (property: string) => Int;
/** Factory for {@link NearInt64|little-endian signed int layouts}
 * interpreted as Numbers. */
export declare const ns64: (property: string) => NearInt64;
/** Factory for {@link Int|big-endian signed int layouts}
 * spanning two bytes. */
export declare const s16be: (property: string) => IntBE;
/** Factory for {@link Int|big-endian signed int layouts}
 * spanning three bytes. */
export declare const s24be: (property: string) => IntBE;
/** Factory for {@link Int|big-endian signed int layouts}
 * spanning four bytes. */
export declare const s32be: (property: string) => IntBE;
/** Factory for {@link Int|big-endian signed int layouts}
 * spanning five bytes. */
export declare const s40be: (property: string) => IntBE;
/** Factory for {@link Int|big-endian signed int layouts}
 * spanning six bytes. */
export declare const s48be: (property: string) => IntBE;
/** Factory for {@link NearInt64BE|big-endian signed int layouts}
 * interpreted as Numbers. */
export declare const ns64be: (property: string) => NearInt64BE;
/** Factory for {@link Float|little-endian 32-bit floating point} values. */
export declare const f32: (property: string) => Float;
/** Factory for {@link FloatBE|big-endian 32-bit floating point} values. */
export declare const f32be: (property: string) => FloatBE;
/** Factory for {@link Double|little-endian 64-bit floating point} values. */
export declare const f64: (property: string) => Double;
/** Factory for {@link DoubleBE|big-endian 64-bit floating point} values. */
export declare const f64be: (property: string) => DoubleBE;
/** Factory for {@link Structure} values. */
export declare const struct: (fields: Layout[], property: string, decodePrefixes: boolean) => Structure;
/** Factory for {@link BitStructure} values. */
export declare const bits: (word: Layout, msb: boolean | string, property?: string | undefined) => BitStructure;
/** Factory for {@link Sequence} values. */
export declare const seq: (elementLayout: Layout, count: number | ExternalLayout, property: string) => Sequence;
/** Factory for {@link Union} values. */
export declare const union: (discr: Layout | UnionDiscriminator, defaultLayout: Layout | null, property: string) => Union;
/** Factory for {@link UnionLayoutDiscriminator} values. */
export declare const unionLayoutDiscriminator: (layout: ExternalLayout, property: string) => UnionLayoutDiscriminator;
/** Factory for {@link Blob} values. */
export declare const blob: (length: number | ExternalLayout, property: string) => Blob;
/** Factory for {@link CString} values. */
export declare const cstr: (property: string) => CString;
/** Factory for {@link UTF8} values. */
export declare const utf8: (maxSpan: number, property: string) => UTF8;
/** Factory for {@link Constant} values. */
export declare const constant: (value: any, property: string) => Constant;
export {};
