(function(_) {

    Math.cbrt = Math.cbrt || function(x) {
        var y = Math.pow(Math.abs(x), 1/3);
        return x < 0 ? -y : y;
    };

    window.Utils || (window.Utils = {});

    var Utils = window.Utils;

    Utils.faderTaper = {
        nToDb: function(x) { return x === 0 ? Number.NEGATIVE_INFINITY : (144 * (1 - (0.11 * (1 - x) / ((1 - x) + 0.11 - Math.pow(1 - x, 2)))) - 132); },
        dbToN: function(x) { return x === 12 ? 1 : ((0.5 * (x - 27.84)) / (x - 12) + (0.12 * Math.sqrt(25 * Math.pow(x, 2) - 50 * x + 1356) / (x - 12))); }
    };

    Utils.extend = function (parent, constructor) {
        var tmp = function() {};
        tmp.prototype = parent.prototype;
        constructor.prototype = new tmp();
        constructor.prototype.constructor = constructor;
        constructor.Super = parent;

        return constructor;

    };

    _.deepExtend = function (arg) {
        var props = [],
            a, i,
            t = _.isArray(arg) ? 'array' : (typeof arg === 'object' && !!arg ? 'object' : null),
            args = arguments;

        if (!t) {
            throw new Error('Invalid argument for _.deepExtend, only plain objects and arrays are supported');

        }

        for (i = args.length - 1; i > 0; i--) {
            a = args[i];

            if (!a) {
                continue;

            } else if (t === 'array' ? !_.isArray(a) : (typeof a !== 'object' || !a)) {
                throw new Error('Mismatching argument type for _.deepExtend, expected an ' + t + ', but argument #' + i + ' is a(n) ' + (typeof a));

            }

            _.each(a, function(v, k) {
                if (props.indexOf(k) !== -1) {
                    return;

                }

                if (_.has(arg, k) && (_.isArray(arg[k]) || typeof arg[k] === 'object' && !!arg[k])) {
                    arg[k] = _.deepExtend.apply(this, _.map(args, function(a) { return a[k]; }));

                } else if (typeof v !== 'undefined') {
                    arg[k] = v;

                }

                props.push(k);

            }, this);

        }

        return arg;

    };

})(_);