(function () {

    var Contrall = window.Contrall || (window.Contrall = {}),
        Editors = Contrall.Editors || (Contrall.Editors = {}),
        Comps = Editors.Comps || (Editors.Comps = []);

    Comps.push({
        pattern: /ReaComp/,
        banks: false,
        bankSize: 24,

        params: {
            main: {
                ratio: 1,
                threshold: 0,
                makeup: 11
            },
            other: [
                {index: 2, type: 'knob'},
                {index: 3, type: 'knob'},
                {index: 14, type: 'knob'},
                {index: 13, type: 'knob'},
                {index: 15, type: 'toggle', valueToState: function (v) { return v >= 0.5; }},
                {index: 16, type: 'toggle', valueToState: function (v) { return v >= 0.5; }},
                {index: 17, type: 'toggle', valueToState: function (v) { return v >= 0.5; }}
            ]
        },

        getRatio: function (value, description) {
            if (value === 1) {
                return 1000;

            }

            return parseFloat(description);

        }
    });

})();