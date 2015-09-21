/**
 * Tests for enum.js
 * Created on 9/20/15
 */

test('Test define throws an error if name is not provided or is invalid.', function () {
    throws(function () {
        Enum.define();
    }, TypeError, "define must thrown an error if name is not provided.");

    throws(function () {
        Enum.define("");
    }, TypeError, "define must throw an error if name is empty.");

    throws(function () {
        Enum.define(" ");
    }, TypeError, "define must throw an error if name is blank.");

    throws(function () {
        Enum.define("9abc^");
    }, TypeError, "define must throw an error if name is invalid.");
});

test('Test define throws an error if constants is not provided or is invalid.', function () {
    throws(function () {
        Enum.define("Test");
    }, TypeError, "define must throw an error if constants is not provided.");

    throws(function () {
        Enum.define("Test", "");
    }, TypeError, "define must throw an error if constants is not an array or object.");

    throws(function () {
        Enum.define("Test", []);
    }, TypeError, "define must throw an error if constants is an empty array.");

    throws(function () {
        Enum.define("Test", ["ONE", 4]);
    }, TypeError, "define must throw an error if not all constants are strings.");

    throws(function () {
        Enum.define("Test", {});
    }, TypeError, "define must throw an error if constants is an empty object.");

    throws(function () {
        Enum.define("Test", {
            something: 10
        });
    }, TypeError, "define must throw an error constants attribute is not provided.");

    throws(function () {
        Enum.define("Test", {
            constants: {}
        });
    }, TypeError, "define must throw an error if constants attribute is empty.");

    throws(function () {
        Enum.define("Test", {
            constants: {
                ZERO: {
                    attr: 10
                },
                ONE: 10
            }
        });
    }, TypeError, "define must throw an error if one or more constants have non-object values.");

    throws(function () {
        Enum.define("Test", {
            constants: {
                ZERO: {}
            },
            methods: {
                one: function () { },
                two: "notfunction"
            }
        });
    }, TypeError, "define must throw an error if one or more values in methods attribute is not a function.");
});

test('Test define defines enums and constants properly, and all behavior is consistent (using array of constants).', function () {
    var Numbers = Enum.define("Numbers", ["ONE", "TWO", "THREE"]);

    ok(Numbers.ONE instanceof Numbers, "ONE must be an instance of Numbers.");
    ok(Numbers.TWO instanceof Numbers, "TWO must be an instance of Numbers.");
    ok(Numbers.THREE instanceof Numbers, "THREE must be an instance of Numbers.");

    ok(Numbers.ONE.name() === "ONE", "name() of ONE must be \"ONE\".");
    ok(Numbers.TWO.name() === "TWO", "name() of TWO must be \"TWO\".");
    ok(Numbers.THREE.name() === "THREE", "name() of THREE must be \"THREE\".");

    ok(Numbers.ONE.ordinal() === 0, "ordinal() of ONE must be 0.");
    ok(Numbers.TWO.ordinal() === 1, "ordinal() of TWO must be 1.");
    ok(Numbers.THREE.ordinal() === 2, "ordinal() of THREE must be 2.");

    ok(Numbers.ONE.toString() === "ONE", "toString() of ONE must be \"ONE\".");
    ok(Numbers.TWO.toString() === "TWO", "toString() of TWO must be \"TWO\".");
    ok(Numbers.THREE.toString() === "THREE", "toString() of THREE must be \"THREE\".");

    ok(Numbers.ONE.valueOf() === "ONE", "valueOf() of ONE must be \"ONE\".");
    ok(Numbers.TWO.valueOf() === "TWO", "valueOf() of TWO must be \"TWO\".");
    ok(Numbers.THREE.valueOf() === "THREE", "valueOf() of THREE must be \"THREE\".");

    ok(Numbers.fromName("ONE") === Numbers.ONE, "Enum from name \"ONE\" must be the same as Numbers.ONE.");
    ok(Numbers.fromName("TWO") === Numbers.TWO, "Enum from name \"TWO\" must be the same as Numbers.TWO.");
    ok(Numbers.fromName("THREE") === Numbers.THREE, "Enum from name \"THREE\" must be the same as Numbers.THREE.");

    throws(function() {
        Numbers.fromName("FOUR");
    }, TypeError, "Numbers.fromName(\"FOUR\") must throw an error.");

    ok(typeof Numbers.values === "function", "Numbers must have a values function.");
    ok(Numbers.values().length === 3, "Numbers must return an array of three constants.");
    ok(Numbers.values().reduce(function (isInstance, constant) {
        return isInstance && constant instanceof Numbers;
    }, true), "Every constant in array returned by values() must be an instance of Numbers.");

    ok(Numbers.values().reduce(function (hasValues, constant) {
        return hasValues && (typeof constant.values === "function");
    }, true), "Every constant must have the values() method.");
    ok(Numbers.values().reduce(function (hasValues, constant) {
        return hasValues && constant.values === Numbers.values;
    }, true), "Every constant must have a values() that delegates to Numbers.values()");
    ok(Numbers.values().reduce(function (hasFromName, constant) {
        return hasFromName && (typeof constant.fromName === "function");
    }, true), "Every constant must have the fromName() method.");
    ok(Numbers.values().reduce(function (hasFromName, constant) {
        return hasFromName && constant.fromName === Numbers.fromName;
    }, true), "Every constant must have a fromName() that delegates to Numbers.fromName()");

    ok(Numbers.toString() === "Numbers { ONE, TWO, THREE }", "Numbers.toString() must match.");
});

test('Test define defines enums and constants properly, and all behavior is consistent (using object definition).', function() {
    var Numbers = Enum.define("Numbers", {
        constants: {
            ONE: {
                value: 1,
                toBinary: function() {
                    return "0001";
                }
            },
            TWO: {
                value: 2,
                toBinary: function() {
                    return "0010";
                }
            },
            THREE: {
                value: 3,
                toBinary: function() {
                    return "0011";
                }
            }
        },
        methods: {
            add: function (number) {
                if(number instanceof Numbers) {
                    return this.value + number.value;
                }

                return Number.NaN;
            },
            sub: function (number) {
                if(number instanceof Numbers) {
                    return this.value - number.value;
                }

                return Number.NaN;
            },
            mul: function (number) {
                if(number instanceof Numbers) {
                    return this.value * number.value;
                }

                return Number.NaN;
            },
            div: function (number) {
                if(number instanceof Numbers) {
                    return this.value / number.value;
                }

                return Number.NaN;
            }
        }
    });

    ok(Numbers.ONE instanceof Numbers, "ONE must be an instance of Numbers.");
    ok(Numbers.TWO instanceof Numbers, "TWO must be an instance of Numbers.");
    ok(Numbers.THREE instanceof Numbers, "THREE must be an instance of Numbers.");

    ok(Numbers.ONE.name() === "ONE", "name() of ONE must be \"ONE\".");
    ok(Numbers.TWO.name() === "TWO", "name() of TWO must be \"TWO\".");
    ok(Numbers.THREE.name() === "THREE", "name() of THREE must be \"THREE\".");

    ok(Numbers.ONE.ordinal() === 0, "ordinal() of ONE must be 0.");
    ok(Numbers.TWO.ordinal() === 1, "ordinal() of TWO must be 1.");
    ok(Numbers.THREE.ordinal() === 2, "ordinal() of THREE must be 2.");

    ok(Numbers.ONE.toString() === "ONE", "toString() of ONE must be \"ONE\".");
    ok(Numbers.TWO.toString() === "TWO", "toString() of TWO must be \"TWO\".");
    ok(Numbers.THREE.toString() === "THREE", "toString() of THREE must be \"THREE\".");

    ok(Numbers.ONE.valueOf() === "ONE", "valueOf() of ONE must be \"ONE\".");
    ok(Numbers.TWO.valueOf() === "TWO", "valueOf() of TWO must be \"TWO\".");
    ok(Numbers.THREE.valueOf() === "THREE", "valueOf() of THREE must be \"THREE\".");

    ok(Numbers.fromName("ONE") === Numbers.ONE, "Enum from name \"ONE\" must be the same as Numbers.ONE.");
    ok(Numbers.fromName("TWO") === Numbers.TWO, "Enum from name \"TWO\" must be the same as Numbers.TWO.");
    ok(Numbers.fromName("THREE") === Numbers.THREE, "Enum from name \"THREE\" must be the same as Numbers.THREE.");

    throws(function() {
        Numbers.fromName("FOUR");
    }, TypeError, "Numbers.fromName(\"FOUR\") must throw an error.");

    ok(Numbers.ONE.value === 1, "value of ONE must be 1.");
    ok(Numbers.TWO.value === 2, "value of TWO must be 2.");
    ok(Numbers.THREE.value === 3, "value of THREE must be 3.");

    ok(typeof Numbers.values === "function", "Numbers must have a values function.");
    ok(Numbers.values().length === 3, "Numbers must return an array of three constants.");
    ok(Numbers.values().reduce(function (isInstance, constant) {
        return isInstance && constant instanceof Numbers;
    }, true), "Every constant in array returned by values() must be an instance of Numbers.");

    ok(Numbers.values().reduce(function (hasValues, constant) {
        return hasValues && (typeof constant.values === "function");
    }, true), "Every constant must have the values() method.");
    ok(Numbers.values().reduce(function (hasValues, constant) {
        return hasValues && constant.values === Numbers.values;
    }, true), "Every constant must have a values() that delegates to Numbers.values().");
    ok(Numbers.values().reduce(function (hasFromName, constant) {
        return hasFromName && (typeof constant.fromName === "function");
    }, true), "Every constant must have the fromName() method.");
    ok(Numbers.values().reduce(function (hasFromName, constant) {
        return hasFromName && constant.fromName === Numbers.fromName;
    }, true), "Every constant must have a fromName() that delegates to Numbers.fromName().");

    ok(Numbers.values().reduce(function (hasMethods, constant) {
        return hasMethods &&
            typeof constant.add === "function" &&
            typeof constant.sub === "function" &&
            typeof constant.mul === "function" &&
            typeof constant.div === "function" &&
            typeof constant.toBinary === "function";
    }, true), "Every constant must have all methods provided in the definition.");

    ok(Numbers.TWO.add(Numbers.TWO) === 4, "TWO.add(TWO) must be 4.");
    ok(Numbers.THREE.sub(Numbers.ONE) === 2, "THREE.sub(ONE) must be 2.");
    ok(Numbers.TWO.mul(Numbers.THREE) === 6, "TWO.mul(THREE) must be 6.");
    ok(Numbers.THREE.div(Numbers.ONE) === 3, "THREE.div(ONE) must be 3.");
    ok(isNaN(Numbers.ONE.add(5)), "ONE.add(5) must be NaN.");

    ok(Numbers.ONE.toBinary() === "0001", "ONE.toBinary() must be 0001.");
    ok(Numbers.TWO.toBinary() === "0010", "TWO.toBinary() must be 0010.");
    ok(Numbers.THREE.toBinary() === "0011", "THREE.toBinary() must be 0011.");
});
