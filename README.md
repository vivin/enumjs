<p align="right">
   <img src="https://travis-ci.org/vivin/enumjs.png?branch=master" alt="enumjs Build Status" />&nbsp;
   <a href='https://coveralls.io/r/vivin/enumjs?branch=master'><img src='https://coveralls.io/repos/vivin/enumjs/badge.png?branch=master' alt='enumjs Coverage Status' /></a>
</p>

enumjs
======

This is an attempt at realizing type-safe enums in JavaScript. I'm most familiar with the way enums work in Java, and so I modeled this library after that. JavaScript doesn't have true enums. Most workarounds to this problem involve using a map where the keys represent the enum constants, and the values are integers or string-representations of the enum constants. This is a convenient solution, but the main problem is that you don't really get any type-safety since the values are just regular JavaScript types. This means that you can't even do `instanceof` checks, and you have to resort to checking the value against all defined-values to see if it is valid.

I figured there must be a better way to realize enums in JavaScript while addressing these shortcomings, and this is my attempt to do that. As far as I can tell, this works like one would expect, but I'm sure there are things I haven't considered. So here's what you get with **enumjs**:

 - The ability to define your own enum and its constants.
 - Your custom enum is its own type, and all its constants are instances of the enum itself. This means that you *can* do `instanceof` checks.
 - The custom enum has a `values` and a `fromName`<sup>\*</sup> method. The former returns an array of all constants defined on the enum, and the latter will attempt to return an enum consant with the same name as the string that is passed in. If one does not exist, an exception is thrown.
 - Each enum constant has a `name()` and an `ordinal()` method. The `name()` method returns a string representing the name of the constant (as defined), and `ordinal()` returns the position of the constant (as defined).
 - Once defined, the enum type and its constants are immutable.

<sup>\*</sup>In Java the method is actually called `valueOf` and that's what I named it here originally as well. However, JavaScript has its own `valueOf` method on objects that does something else entirely, and I didn't want to override that behavior.

This works on the browser and in Nashorn (the two places I tried it out). It might work on Node as well, but I haven't really tried it out. To use it, just include `enum.js`. There is a single object called `Enum`, with a method called `define`. The signature is `Enum.define(<string>, <array> | <object>)`. Some examples:

```javascript
var Days = Enum.define("Days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

Days.Monday instanceof Days; // true

Days.Friday.name(); // "Friday"
Days.Friday.ordinal(); // 4

Days.Sunday === Days.Sunday; // true
Days.Sunday === Days.Friday; // false

Days.Sunday.toString(); // "Sunday"

Days.toString() // "Days { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday } "

Days.values().map(function(e) { return e.name(); }); //["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
Days.values()[4].name(); //"Friday"

Days.fromName("Thursday") === Days.Thursday // true
Days.fromName("Wednesday").name() // "Wednesday"
Days.Friday.fromName("Saturday").name() // "Saturday"
```

You can also attach behavior to each constant, just like in Java. To do that, you need to pass in a definition object that looks like this:

```javascript
var Days = Enum.define("Days", {
    constants: {
        Monday: {
            say: function () {
                return this.name() + "s are bad!";
            }
        },
        Tuesday: {
            say: function () {
                return this.name() + "s are ok...";
            }
        },
        Wednesday: {
            say: function () {
                return this.name() + " is the middle of the week...";
            }
        },
        Thursday: {
            say: function () {
                return this.name() + "! We're getting closer to the weekend!";
            }
        },
        Friday: {
            say: function () {
                return this.name() + ", " + this.name() + ", Gettin' down on " + this.name() + "!";
            }
        },
        Saturday: {
            say: function () {
                return this.name() + "! Aw yisss time for cartoons!";
            }
        },
        Sunday: {
            say: function () {
                return this.name() + "! It's still the weekend!";
            }
        }
    }
});

Days.Monday.say(); // "Mondays are bad!"
Days.Friday.say(); // "Friday, Friday, Gettin' down on Friday!"
```

Sometimes you may want to have behavior that is shared among all instances. But doing that in the above manner is tedious and repetitive. Instead, you can pass in the optional attribute `methods`. All values defined in this object must be functions, and these functions will be attached to every constant of the enum. To demonstrate this,  here's an example that's based on the [Planet example](https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html) from the Java documentation on enums:


```javascript
var Planet = Enum.define("Planet", {
    constants: {
        MERCURY: {
            mass: 3.303e+23,
            radius: 2.4397e6
        },
        VENUS: {
            mass: 4.869e+24,
            radius: 6.0518e6
        },
        EARTH: {
            mass: 5.976e+24,
            radius: 6.37814e6
        },
        MARS: {
            mass: 6.421e+23,
            radius: 3.3972e6
        },
        JUPITER: {
            mass: 1.9e+27,
            radius: 7.1492e7
        },
        SATURN: {
            mass: 5.688e+26,
            radius: 6.0268e7
        },
        URANUS: {
            mass: 8.686e+25,
            radius: 2.5559e7
        },
        NEPTUNE: {
            mass: 1.024e+26,
            radius: 2.4746e7
        }   
    },
    methods: {
        surfaceGravity: function() {
            var G = 6.67300E-11;
            return (G * this.mass) / Math.pow(this.radius, 2);
        },
        surfaceWeight: function(mass) {
            return mass * this.surfaceGravity();
        }
    }
});

var mass = 175 / Planet.EARTH.surfaceGravity();
Planet.values().forEach(function(planet) {
    console.log("Your weight on", planet.toString(), "is", planet.surfaceWeight(mass));
});
```

This returns the output:

```
Your weight on MERCURY is 66.10758266016366
Your weight on VENUS is 158.37484247218296
Your weight on EARTH is 174.99999999999997
Your weight on MARS is 66.27900720649754
Your weight on JUPITER is 442.8475669617546
Your weight on SATURN is 186.55271929202414
Your weight on URANUS is 158.39725989314937
Your weight on NEPTUNE is 199.20741268219012
```

That's pretty much it. Please try it out and let me know what you think, and if there are any issues, etc.
