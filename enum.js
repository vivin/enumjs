/**
 * enum.js - Type-safe enums in JavaScript. Modeled after Java enums.
 * Version 1.0.0
 * Written by Vivin Paliath (http://vivin.net)
 * License: BSD License
 * Copyright (C) 2015
 */

var Enum = (function () {
    /**
     * Function to define an enum
     * @param typeName - The name of the enum.
     * @param constants - The constants on the enum. Can be an array of strings, or an object where each key is an enum
     * constant, and the values are objects that describe attributes that can be attached to the associated constant.
     */
    function define(typeName, constants) {

        /** Check Arguments **/
        if (typeof typeName === "undefined") {
            throw new TypeError("A name is required.");
        }

        if (!(constants instanceof Array) && (Object.getPrototypeOf(constants) !== Object.prototype)) {

            throw new TypeError("The constants parameter must either be an array or an object.");

        } else if ((constants instanceof Array) && constants.length === 0) {

            throw new TypeError("Need to provide at least one constant.");

        } else if ((constants instanceof Array) && !constants.reduce(function (isString, element) {
                return isString && (typeof element === "string");
            }, true)) {

            throw new TypeError("One or more elements in the constant array is not a string.");

        } else if (Object.getPrototypeOf(constants) === Object.prototype && !Object.keys(constants).reduce(function (isObject, constant) {
                return Object.getPrototypeOf(constants[constant]) === Object.prototype;
            }, true)) {

            throw new TypeError("One or more constants do not have an associated object-value.");

        }

        var isArray = (constants instanceof Array);
        var isObject = !isArray;

        /** Private sentinel-object used to guard enum constructor so that no one else can create enum instances **/
        function __() { };

        /** Dynamically define a function with the same name as the enum we want to define. **/
        var __enum = new Function(["__"],
            "return function " + typeName + "(sentinel, name, ordinal) {" +
                "if(!(sentinel instanceof __)) {" +
                    "throw new TypeError(\"Cannot instantiate an instance of " + typeName + ".\");" +
                "}" +

                "this.__name = name;" +
                "this.__ordinal = ordinal;" +
            "}"
        )(__);

        /** Private objects used to maintain enum instances for values(), and to look up enum instances for fromName() **/
        var __values = [];
        var __dict = {};

        /** Attach values() and fromName() methods to the class itself (kind of like static methods). **/
        Object.defineProperty(__enum, "values", {
            value: function () {
                return __values;
            }
        });

        Object.defineProperty(__enum, "fromName", {
            value: function (name) {
                var __constant = __dict[name]
                if (__constant) {
                    return __constant;
                } else {
                    throw new TypeError(typeName + " does not have a constant with name " + name + ".");
                }
            }
        });

        /**
         * The following methods are available to all instances of the enum. values() and fromName() need to be
         * available to each constant, and so we will attach them on the prototype. But really, they're just
         * aliases to their counterparts on the prototype.
         */
        Object.defineProperty(__enum.prototype, "values", {
            value: __enum.values
        });

        Object.defineProperty(__enum.prototype, "fromName", {
            value: __enum.fromName
        });

        Object.defineProperty(__enum.prototype, "name", {
            value: function () {
                return this.__name;
            }
        });

        Object.defineProperty(__enum.prototype, "ordinal", {
            value: function () {
                return this.__ordinal;
            }
        });

        Object.defineProperty(__enum.prototype, "valueOf", {
            value: function () {
                return this.__name;
            }
        });

        Object.defineProperty(__enum.prototype, "toString", {
            value: function () {
                return this.__name;
            }
        });

        /**
         * If constants was an array, we can the element values directly. Otherwise, we will have to use the keys
         * from the constants object.
         */
        var _constants = constants;
        if (isObject) {
            _constants = Object.keys(constants);
        }

        /** Iterate over all constants, create an instance of our enum for each one, and attach it to the enum type **/
        _constants.forEach(function (name, ordinal) {
            // Create an instance of the enum
            var __constant = new __enum(new __(), name, ordinal);

            // If constants was an object, we want to attach the provided attributes to the instance.
            if (isObject) {
                Object.keys(constants[name]).forEach(function (attr) {
                    Object.defineProperty(__constant, attr, {
                        value: constants[name][attr]
                    });
                });
            }

            // Freeze the instance so that it cannot be modified.
            Object.freeze(__constant);

            // Attach the instance using the provided name to the enum type itself.
            Object.defineProperty(__enum, name, {
                value: __constant
            });

            // Update our private objects
            __values.push(__constant);
            __dict[name] = __constant;
        });

        /** Define a friendly toString method for the enum **/
        var string = typeName + " { " + __enum.values().map(function (c) {
                return c.name();
            }).join(", ") + " } ";

        Object.defineProperty(__enum, "toString", {
            value: function () {
                return string;
            }
        });

        /** Freeze our private objects **/
        Object.freeze(__values);
        Object.freeze(__dict);

        /** Freeze the prototype on the enum and the enum itself **/
        Object.freeze(__enum.prototype);
        Object.freeze(__enum);

        /** Return the enume **/
        return __enum;
    }

    return {
        define: define
    }
})();
