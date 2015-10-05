(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        Comps = Editors.Comps || (Editors.Comps = []);

    Comps.push({
        pattern: /Pro-C/,
        banks: false,
        bankSize: 24,

        params: {
            main: {
                ratio: 2,
                threshold: 1,
                makeup: 12
            },
            other: [
                {index: 6, type: 'knob', zeroSnap: true, zeroPos: 0.5},
                {index: 4, type: 'knob'},
                {index: 5, type: 'knob'},
                {index: 0, type: 'select', items: [
                    {label: 'Clean', value: 0, is: function (v) { return v < 0.5; }},
                    {label: 'Classic', value: 0.5, is: function (v) { return v >= 0.5 && v < 1; }},
                    {label: 'Opto', value: 1, is: function (v) { return v === 1; }}
                ]},
                {index: 3, type: 'select', items: [
                    {label: 'Soft', value: 0, is: function(v) { return v < 1; }},
                    {label: 'Hard', value: 1, is: function(v) { return v === 1; }}
                ]},
                {index: 16, type: 'toggle', valueToState: function(v) { return v === 1; }}
            ]
        },

        getRatio: function (value) {
            if (value < 0.1) {
                return value + 1;

            } else if (value < 0.2) {
                return 1.5 * value + 0.95;

            } else if (value < 0.3) {
                return 2.5 * value + 0.75;

            } else if (value < 0.4) {
                return 5 * value;

            } else if (value < 0.5) {
                return 7.5 * value - 1;

            } else if (value < 0.6) {
                return 12.5 * value - 3.5;

            } else if (value < 0.9) {
                return 20 * value - 8;

            }

            return 1.8316683284715936e5
                +  1.6347676211582132e7 * Math.pow(value, 1)
                + -5.8092361336642459e7 * Math.pow(value, 2)
                +  3.9002822065057233e7 * Math.pow(value, 3)
                +  7.3024246359117657e7 * Math.pow(value, 4)
                + -1.0046870923725671e8 * Math.pow(value, 5)
                + -3.9110764900192916e6 * Math.pow(value, 6)
                +  5.4772389749728039e7 * Math.pow(value, 7)
                + -2.0858053726767763e7 * Math.pow(value, 8);
        }
    });

})();