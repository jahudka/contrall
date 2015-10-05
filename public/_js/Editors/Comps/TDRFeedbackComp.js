(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        Comps = Editors.Comps || (Editors.Comps = []);

    Comps.push({
        pattern: /TDR ?Feedback ?Compressor ?II(?: ?Mono)?/,
        banks: false,
        bankSize: 24,
        inverseThreshold: true,

        params: {
            main: {
                ratio: 3,
                threshold: 0,
                makeup: 7
            },
            other: [
                {index: 2, type: 'knob'},
                {index: 4, type: 'knob'},
                {index: 5, type: 'knob'},
                {index: 6, type: 'knob'},
                {index: 1, type: 'knob'},
                {index: 15, type: 'select', items: [
                    {label: 'Limit', value: 0, is: function (v) { return v < 0.5; }},
                    {label: 'Comp', value: 1, is: function (v) { return v >= 0.5; }}
                ]},
                {index: 16, type: 'select', items: [
                    {label: 'Precise', value: 0, is: function(v) { return v < 0.5; }},
                    {label: 'Eco', value: 1, is: function(v) { return v >= 0.5; }}
                ]},
                {index: 12, type: 'select', items: [
                    {label: 'Off', value: 0, is: function(v) { return v < 0.1; }},
                    {label: '3dB/Oct', value: 0.1, is: function(v) { return v >= 0.1 && v < 0.2; }},
                    {label: '6dB/Oct', value: 0.2, is: function(v) { return v >= 0.2 && v < 0.3; }},
                    {label: '12dB/Oct', value: 0.3, is: function(v) { return v >= 0.3; }}
                ]},
                {index: 9, type: 'knob'},
                {index: 11, type: 'knob'},
                {index: 8, type: 'knob'}
            ]
        },

        getRatio: function (value) {
            value = value < 0.5
                ? (2 * value + 1)
                : (10 * value - 3);

            return Math.round(10 * value) / 10;

        }
    });

})();