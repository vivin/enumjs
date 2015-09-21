/**
 * @preserve
 * enum.js - Type-safe enums in JavaScript. Modeled after Java enums.
 * Version 1.0.0
 * Written by Vivin Paliath (http://vivin.net)
 * License: BSD License
 * Copyright (C) 2015
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('enum',factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Enum = factory();
    }
}(this, function () {
    /**
     * Function to define an enum
     * @param typeName - The name of the enum.
     * @param definition - The definition on the enum. Can be an array of strings, or an object where each key is an enum
     * constant, and the values are objects that describe attributes that can be attached to the associated constant.
     */
    function define(typeName, definition) {

        /** Check Arguments **/
        if (typeof typeName === "undefined") {
            throw new TypeError("A name is required.");
        }

        if (!/^[a-z$_][0-9a-z$_]*$/i.test(typeName)) {
            throw new TypeError("Invalid enum name. Enum names can only consist of numbers, letters, $, and _, and can only start with letters, $, or _.");
        }

        if(typeof definition === "undefined") {
            throw new TypeError("Constants are required.");
        }

        if (!(definition instanceof Array) && (Object.getPrototypeOf(definition) !== Object.prototype)) {

            throw new TypeError("The definition parameter must either be an array or an object.");

        } else if ((definition instanceof Array) && definition.length === 0) {

            throw new TypeError("Need to provide at least one constant.");

        } else if ((definition instanceof Array) && !definition.reduce(function (isString, element) {
                return isString && (typeof element === "string");
            }, true)) {

            throw new TypeError("One or more elements in the constant array is not a string.");

        } else if (Object.getPrototypeOf(definition) === Object.prototype) {

            definition.methods = definition.methods || {};

            if(typeof(definition.constants) === "undefined") {

                throw new TypeError("If definition is an object, it must have a constants attribute.");

            } else if(Object.keys(definition.constants).length === 0) {

                throw new TypeError("constants attribute in definition cannot be empty.");

            } else if(!Object.keys(definition.constants).reduce(function (isObject, constant) {
                    return Object.getPrototypeOf(definition.constants[constant]) === Object.prototype;
                }, true)) {

                throw new TypeError("One or more values in the definition.constants object is not an object.");

            } else if(!Object.keys(definition.methods).reduce(function (isFunction, method) {
                    return isFunction && (typeof definition.methods[method] === "function");
                }, true)) {

                throw new TypeError("One or more values in the definition.methods object is not a function.");

            }
        }

        var isArray = (definition instanceof Array);
        var isObject = !isArray;

        /** Private sentinel-object used to guard enum constructor so that no one else can create enum instances **/
        function __() { };

        /** Dynamically define a function using typeName.
         *
         * The name of the constructor for every enum constant ends up being __<typeName>. This is done deliberately, so
         * that the dynamic function's name won't clash with anything else. For example, someone could attempt to define
         * an enum with typeName set to `__`. This would cause an error because it clashes with the name of the sentinel
         * object. However, that is not apparent to the user at all and the behavior just seems mystifying. This is also
         * a form of abstraction leakage, and that's not good either.
         */
        var _enum = new Function(["__"],
            "return function __" + typeName + "(sentinel, name, ordinal) {\n" +
            "\tif(!(sentinel instanceof __)) {\n" +
                "\t\tthrow new TypeError(\"Cannot instantiate an instance of " + typeName + ".\");\n" +
            "\t}\n" +

            "\tthis._name = name;\n" +
            "\tthis._ordinal = ordinal;\n" +
            "}\n"
        )(__);

        /** Private objects used to maintain enum instances for values(), and to look up enum instances for fromName() **/
        var _values = [];
        var _dict = {};

        /** Attach values() and fromName() methods to the class itself (kind of like static methods). **/
        Object.defineProperty(_enum, "values", {
            value: function () {
                return _values;
            }
        });

        Object.defineProperty(_enum, "fromName", {
            value: function (name) {
                var _constant = _dict[name];
                if (_constant) {
                    return _constant;
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
        Object.defineProperty(_enum.prototype, "values", {
            value: _enum.values
        });

        Object.defineProperty(_enum.prototype, "fromName", {
            value: _enum.fromName
        });

        Object.defineProperty(_enum.prototype, "name", {
            value: function () {
                return this._name;
            }
        });

        Object.defineProperty(_enum.prototype, "ordinal", {
            value: function () {
                return this._ordinal;
            }
        });

        Object.defineProperty(_enum.prototype, "valueOf", {
            value: function () {
                return this._name;
            }
        });

        Object.defineProperty(_enum.prototype, "toString", {
            value: function () {
                return this._name;
            }
        });

        /**
         * If definition was an array, we can the element values directly. Otherwise, we will have to use the keys
         * from the definition.constants object. At this time we can also attach any methods (if provided) to the
         * prototype so that they are available to every instance.
         */
        var _constants = definition;
        if (isObject) {
            _constants = Object.keys(definition.constants);

            Object.keys(definition.methods).forEach(function (method) {
                Object.defineProperty(_enum.prototype, method, {
                    value: definition.methods[method]
                });
            });
        }

        /** Iterate over all definition, create an instance of our enum for each one, and attach it to the enum type **/
        _constants.forEach(function (name, ordinal) {
            // Create an instance of the enum
            var _constant = new _enum(new __(), name, ordinal);

            // If definition was an object, we want to attach the provided constant-attributes to the instance.
            if (isObject) {
                Object.keys(definition.constants[name]).forEach(function (attr) {
                    Object.defineProperty(_constant, attr, {
                        value: definition.constants[name][attr]
                    });
                });
            }

            // Freeze the instance so that it cannot be modified.
            Object.freeze(_constant);

            // Attach the instance using the provided name to the enum type itself.
            Object.defineProperty(_enum, name, {
                value: _constant
            });

            // Update our private objects
            _values.push(_constant);
            _dict[name] = _constant;
        });

        /** Define a friendly toString method for the enum **/
        var string = typeName + " { " + _enum.values().map(function (c) {
                return c.name();
            }).join(", ") + " }";

        Object.defineProperty(_enum, "toString", {
            value: function () {
                return string;
            }
        });

        /** Freeze our private objects **/
        Object.freeze(_values);
        Object.freeze(_dict);

        /** Freeze the prototype on the enum and the enum itself **/
        Object.freeze(_enum.prototype);
        Object.freeze(_enum);

        /** Return the enume **/
        return _enum;
    }

    return {
        define: define
    }
}));

